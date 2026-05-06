import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { trackPageView, trackAskEvent } from '../../hooks/useAnalytics';
import { useSEO } from '../../hooks/useSEO';
import BookingCard from './BookingCard';
import styles from './AskSection.module.scss';

const BOOKER_TIMEZONE =
  typeof window !== 'undefined'
    ? (Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')
    : 'UTC';

const BOOKING_CHIP = 'Book a 30-min call with Mahesh';

// Render free tier spins down after 15 min idle. Cold boots take 8-15s.
// One silent retry on 5xx covers ~all transient failures without bothering the user.
async function fetchWithRetry(url, opts = {}, { retries = 1, backoffMs = 500 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, opts);
      if (res.ok || res.status < 500) return res;
      // 5xx — retry once after backoff
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, backoffMs));
        continue;
      }
      return res;
    } catch (err) {
      lastErr = err;
      if (err.name === 'AbortError' || attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, backoffMs));
    }
  }
  throw lastErr;
}
const SUGGESTIONS = [
  'What does he build at Emirates NBD?',
  'Has he led a team or is he IC only?',
  'How did he go from clubs to running half marathons?',
  BOOKING_CHIP,
];

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getChatSessionId(sharedId) {
  if (sharedId) {
    sessionStorage.setItem('_chatSid', sharedId);
    return sharedId;
  }
  let id = sessionStorage.getItem('_chatSid');
  if (!id) {
    id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    sessionStorage.setItem('_chatSid', id);
  }
  return id;
}

// Adaptive idle delay for Path B reverse interview. Short Moore replies
// trigger a question sooner; long ones give the user time to read first.
function computeIdleDelay(text) {
  const t = String(text || '').trim();
  if (!t) return 3000;
  const words = t.split(/\s+/).length;
  const lines = t.split('\n').length;
  if (words <= 3) return 2000;
  if (lines >= 3 || words > 30) return 5000;
  if (words > 10) return 4000;
  return 3000;
}

export default function AskSection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sharedSessionId = searchParams.get('s');
  const chatSessionId = useRef(getChatSessionId(sharedSessionId));
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(`_chat_${chatSessionId.current}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [wakingUp, setWakingUp] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [copied, setCopied] = useState(false);
  // User-selected slot (from clicking a slot bubble). Persists until send or dismiss.
  const [selectedSlot, setSelectedSlot] = useState(null);
  // Multiverse personality assigned on first /ask visit. Colors only the intro;
  // the rest of the conversation is normal Moore.
  const [personality, setPersonality] = useState(() => {
    try {
      const cached = sessionStorage.getItem(`_pers_${chatSessionId.current}`);
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const abortRef = useRef(null);
  const wakeTimerRef = useRef(null);
  const idleTimerRef = useRef(null);
  // Once-per-session lock for the reverse interview (Path A or Path B).
  const interjectionFiredRef = useRef(
    typeof window !== 'undefined' &&
    sessionStorage.getItem(`_interject_${chatSessionId.current}`) === '1'
  );
  const introFiredRef = useRef(false);
  useSEO('ask');
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const isTrustedDevice = typeof window !== 'undefined' && localStorage.getItem('_inbox_trusted') === '1';

  const streamIntro = useCallback(async () => {
    setLoading(true);
    setStreamingText('');
    try {
      const res = await fetch('/api/chat/intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: chatSessionId.current,
          trustedDevice: isTrustedDevice,
        }),
      });
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullReply = '';
      let assignedPersonality = null;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const payload = line.slice(6);
            if (payload === '[DONE]') break;
            try {
              const obj = JSON.parse(payload);
              if (obj.personality) {
                assignedPersonality = obj.personality;
                setPersonality(assignedPersonality);
                try {
                  sessionStorage.setItem(
                    `_pers_${chatSessionId.current}`,
                    JSON.stringify(assignedPersonality),
                  );
                } catch {}
                if (!isTrustedDevice) {
                  trackAskEvent('multiverse_loaded', { personality: assignedPersonality.id });
                }
              }
              if (obj.token) {
                fullReply += obj.token;
                setStreamingText(fullReply);
              }
            } catch {}
          }
        }
      }
      if (fullReply) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: fullReply,
          time: Date.now(),
        }]);
      }
      setStreamingText('');
    } catch {}
    setLoading(false);
  }, [isTrustedDevice]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    if (!isTrustedDevice) trackPageView('/ask');
    inputRef.current?.focus();

    if (sharedSessionId && messages.length === 0) {
      fetch(`/api/chat/${sharedSessionId}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.messages?.length) {
            const loaded = data.messages.map(m => ({ role: m.role, content: m.content, time: null }));
            setMessages(loaded);
          }
          if (data?.personality) {
            setPersonality(data.personality);
          }
        })
        .catch(() => {});
      return;
    }

    // Fire the Multiverse intro on first visit (no shared session, no prior messages).
    if (!sharedSessionId && messages.length === 0 && !introFiredRef.current) {
      introFiredRef.current = true;
      streamIntro();
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem(`_chat_${chatSessionId.current}`, JSON.stringify(messages));
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      inputRef.current?.focus();
    }
  }, [messages]);

  useEffect(() => {
    if (streamingText) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [streamingText]);

  // Idle timer for Path B reverse interview. After Moore replies, start a
  // length-aware countdown. If the user types, clicks a chip/slot, or sends
  // anything, the effect re-runs and clears the timer. If the timer expires,
  // Moore breaks the silence with one curious question to the visitor.
  useEffect(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (interjectionFiredRef.current) return;
    if (loading) return;
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.role !== 'assistant') return;
    // Path B requires at least one real user→Moore exchange first
    // (so the intro alone doesn't trigger it).
    const userCount = messages.filter((m) => m.role === 'user').length;
    if (userCount < 1) return;

    const delay = computeIdleDelay(last.content);
    idleTimerRef.current = setTimeout(async () => {
      if (interjectionFiredRef.current) return;
      interjectionFiredRef.current = true;
      try { sessionStorage.setItem(`_interject_${chatSessionId.current}`, '1'); } catch {}
      if (!isTrustedDevice) trackAskEvent('reverse_interview_fired', { trigger: 'idle' });

      setLoading(true);
      setStreamingText('');
      try {
        const res = await fetch('/api/chat/interject', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: chatSessionId.current,
            history: messages.slice(-8),
            trustedDevice: isTrustedDevice,
          }),
        });
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullReply = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          const lines = text.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const payload = line.slice(6);
              if (payload === '[DONE]') break;
              try {
                const { token } = JSON.parse(payload);
                if (token) {
                  fullReply += token;
                  setStreamingText(fullReply);
                }
              } catch {}
            }
          }
        }
        if (fullReply) {
          setMessages((prev) => [...prev, {
            role: 'assistant',
            content: fullReply,
            time: Date.now(),
          }]);
        }
        setStreamingText('');
      } catch {}
      setLoading(false);
    }, delay);

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };
  }, [messages, loading, isTrustedDevice]);

  // Fast path for the "Book a 30-min call" chip. Hits a direct REST endpoint
  // that skips the LLM entirely, then injects the result into the chat as if
  // Moore had answered. Feels native, costs zero tokens, <500ms perceived.
  const bookDirect = useCallback(async () => {
    if (loading) return;
    if (!isTrustedDevice) trackAskEvent('booking_chip_clicked', { source: 'suggestion_chip' });
    setMessages(prev => [...prev, { role: 'user', content: BOOKING_CHIP, time: Date.now() }]);
    setLoading(true);
    wakeTimerRef.current = setTimeout(() => setWakingUp(true), 2500);
    try {
      const res = await fetchWithRetry(`/api/booking/slots?tz=${encodeURIComponent(BOOKER_TIMEZONE)}`);
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || 'failed');
      const toolOutput = { tool: 'check_availability', result: data };
      if (!isTrustedDevice) trackAskEvent('slots_shown', { count: data.slots?.length || 0, via: 'direct' });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Pick one and share name + email.',
        time: Date.now(),
        toolOutputs: [toolOutput],
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Couldn't load slots just now. Try again in a moment.",
        time: Date.now(),
      }]);
    }
    if (wakeTimerRef.current) { clearTimeout(wakeTimerRef.current); wakeTimerRef.current = null; }
    setWakingUp(false);
    setLoading(false);
    inputRef.current?.focus();
  }, [loading]);

  const send = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    // First user message in this session counts as chat_started — fire once.
    // (The intro is also a message, so we look for ROLE=user not length===0.)
    const userMsgCountBefore = messages.filter((m) => m.role === 'user').length;
    if (!isTrustedDevice && userMsgCountBefore === 0) {
      trackAskEvent('chat_started', { firstMessageLen: msg.length });
    }

    // Path A reverse interview: on the user's 2nd message, ask the server to
    // append one personal question to Moore's reply. Once-per-session lock.
    const shouldTriggerInterview =
      !interjectionFiredRef.current && userMsgCountBefore === 1;
    if (shouldTriggerInterview) {
      interjectionFiredRef.current = true;
      try { sessionStorage.setItem(`_interject_${chatSessionId.current}`, '1'); } catch {}
      if (!isTrustedDevice) trackAskEvent('reverse_interview_fired', { trigger: 'message' });
    }

    // Capture the slot at send time; clear the chip either way so the UI
    // doesn't carry stale selection if Moore interprets the message as a
    // cancel / different question / "give me other times".
    const slotAtSend = selectedSlot;
    if (slotAtSend && !isTrustedDevice) {
      trackAskEvent('slot_picked_sent', { slot: slotAtSend.hostDisplay });
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setInput('');
    setSelectedSlot(null);
    // Visible chat message stays clean — just what the user typed.
    setMessages(prev => [...prev, { role: 'user', content: msg, time: Date.now() }]);
    setLoading(true);
    setStreamingText('');
    wakeTimerRef.current = setTimeout(() => setWakingUp(true), 2500);
    const accumulatedToolOutputs = [];

    try {
      const res = await fetchWithRetry('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          sessionId: chatSessionId.current,
          history: messages.slice(-8),
          trustedDevice: isTrustedDevice,
          bookerTimezone: BOOKER_TIMEZONE,
          // Slot the user clicked before sending. Server uses it as a hint
          // for book_meeting; if the user's message is a cancel / different
          // question / "any other time?", the AI can ignore it.
          selectedSlot: slotAtSend
            ? { startUtc: slotAtSend.startUtc, hostDisplay: slotAtSend.hostDisplay }
            : null,
          triggerInterview: shouldTriggerInterview,
          personality: personality?.id || null,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessages(prev => [...prev, { role: 'assistant', content: data.error || 'Something went wrong.', time: Date.now() }]);
        if (wakeTimerRef.current) { clearTimeout(wakeTimerRef.current); wakeTimerRef.current = null; }
        setWakingUp(false);
        setLoading(false);
        inputRef.current?.focus();
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullReply = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const payload = line.slice(6);
            if (payload === '[DONE]') break;
            try {
              const { token, error, toolOutput } = JSON.parse(payload);
              if (error) { fullReply = error; break; }
              if (token) {
                if (wakeTimerRef.current) { clearTimeout(wakeTimerRef.current); wakeTimerRef.current = null; }
                if (wakingUp) setWakingUp(false);
                fullReply += token;
                setStreamingText(fullReply);
              }
              if (toolOutput) {
                accumulatedToolOutputs.push(toolOutput);
                if (!isTrustedDevice) {
                  const t = toolOutput.tool;
                  const r = toolOutput.result || {};
                  if (t === 'check_availability' && r.ok) {
                    trackAskEvent('slots_shown', { count: r.slots?.length || (r.slot ? 1 : 0), via: 'chat' });
                  } else if (t === 'book_meeting' && r.type === 'booking_confirmed') {
                    trackAskEvent('booking_confirmed', { slot: r.booking?.slot?.hostDisplay });
                  } else if (t === 'book_meeting' && r.type === 'booking_pending') {
                    trackAskEvent('booking_pending', { slot: r.booking?.slot?.hostDisplay });
                  } else if (t === 'leave_message' && r.ok) {
                    trackAskEvent('message_saved', {});
                  } else if (t === 'cancel_meeting' && r.ok) {
                    trackAskEvent('booking_cancelled', {});
                  } else if (t === 'reschedule_meeting' && r.ok) {
                    trackAskEvent('booking_rescheduled', {});
                  }
                }
              }
            } catch {}
          }
        }
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: fullReply || 'Sorry, I could not come up with a response.',
        time: Date.now(),
        toolOutputs: accumulatedToolOutputs.length ? accumulatedToolOutputs : undefined,
      }]);
      setStreamingText('');
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Could not reach the server. Try again.', time: Date.now() }]);
      }
      setStreamingText('');
    }
    if (wakeTimerRef.current) { clearTimeout(wakeTimerRef.current); wakeTimerRef.current = null; }
    setWakingUp(false);
    setLoading(false);
    inputRef.current?.focus();
  }, [input, loading, messages, selectedSlot]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const copyConversation = () => {
    const text = messages.map(m =>
      `${m.role === 'user' ? 'You' : 'MOORE'}: ${m.content}`
    ).join('\n\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareConversation = () => {
    const url = messages.length > 0
      ? `https://maheshinder.in/ask?s=${chatSessionId.current}`
      : 'https://maheshinder.in/ask';
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isEmpty = messages.length === 0 && !loading;
  // Suggestions stay visible across the intro phase so the booking chip + first
  // prompts remain reachable. They hide as soon as the visitor sends anything.
  const noUserMessagesYet = !messages.some((m) => m.role === 'user');
  // Index of the latest assistant message — only it shows fresh slot bubbles.
  // Confirmation cards (booked/cancelled/message_saved) still show on their original message.
  let lastAssistantIdx = -1;
  for (let k = messages.length - 1; k >= 0; k--) {
    if (messages[k].role === 'assistant') { lastAssistantIdx = k; break; }
  }

  return (
    <div className={styles.page}>
      {/* Back to home */}
      <button className={styles.topBackBtn} onClick={() => navigate('/')} aria-label="Back to Solar System">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span>Solar System</span>
      </button>

      <div className={styles.chatSection}>
        {/* Empty-state hero */}
        {isEmpty ? (
          <div className={styles.hero}>
            <h1 className={styles.heroTitle}>
              <span className={styles.gradientText}>Hello.</span>
              <br />
              Ask anything about Mahesh.
            </h1>
          </div>
        ) : (
          <div className={styles.compactHeader}>
            <h2 className={styles.compactBrand}>
              <span className={styles.gradientText}>Ask</span> anything about Mahesh
            </h2>
          </div>
        )}

        {/* Conversation */}
        {!isEmpty && (
          <div className={styles.conversation}>
            {messages.map((msg, i) => (
              <div key={i} className={`${styles.msg} ${styles[msg.role]}`}>
                <div className={styles.msgBody}>
                  {msg.role === 'assistant' && (
                    <div className={styles.aiLabelRow}>
                      <span className={styles.aiLabel}>MOORE</span>
                      {personality && (
                        <span className={styles.multiverseBadge}>Multiverse · {personality.name}</span>
                      )}
                    </div>
                  )}
                  <div className={styles.bubbleWrap}>
                    <div className={styles.bubble}>
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                    {msg.toolOutputs?.map((to, j) => {
                      // Stale slot bubbles only show on the latest assistant message
                      const isSlotPicker = to.tool === 'check_availability';
                      if (isSlotPicker && i !== lastAssistantIdx) return null;
                      return (
                        <BookingCard
                          key={j}
                          toolOutput={to}
                          selectedStartUtc={selectedSlot?.startUtc}
                          onSlotPick={(slot) => {
                            // Don't auto-fill the input — just note the slot.
                            // User types their name + email; send composes both.
                            setSelectedSlot(slot);
                            // Slot pick = engagement; kill any pending Path B timer.
                            if (idleTimerRef.current) {
                              clearTimeout(idleTimerRef.current);
                              idleTimerRef.current = null;
                            }
                            setTimeout(() => inputRef.current?.focus(), 50);
                          }}
                        />
                      );
                    })}
                    {msg.time && <span className={styles.timestamp}>{formatTime(msg.time)}</span>}
                  </div>
                </div>
              </div>
            ))}

            {loading && streamingText && (
              <div className={`${styles.msg} ${styles.assistant}`}>
                <div className={styles.msgBody}>
                  <div className={styles.aiLabelRow}>
                    <span className={`${styles.aiLabel} ${styles.aiLabelActive}`}>MOORE</span>
                    {personality && (
                      <span className={styles.multiverseBadge}>Multiverse · {personality.name}</span>
                    )}
                  </div>
                  <div className={styles.bubble}>
                    <ReactMarkdown>{streamingText}</ReactMarkdown>
                    <span className={styles.streamCursor} aria-hidden="true" />
                  </div>
                </div>
              </div>
            )}

            {loading && !streamingText && (
              <div className={`${styles.msg} ${styles.assistant}`}>
                <div className={styles.msgBody}>
                  <div className={styles.aiLabelRow}>
                    <span className={`${styles.aiLabel} ${styles.aiLabelActive}`}>MOORE</span>
                    {personality && (
                      <span className={styles.multiverseBadge}>Multiverse · {personality.name}</span>
                    )}
                  </div>
                  <div className={styles.bubble}>
                    <span className={styles.thinking}>
                      <span className={styles.thinkDot} style={{ '--i': 0 }} />
                      <span className={styles.thinkDot} style={{ '--i': 1 }} />
                      <span className={styles.thinkDot} style={{ '--i': 2 }} />
                    </span>
                    {wakingUp && (
                      <span className={styles.wakingUp}>Waking up. One sec.</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>
        )}

        {/* Input area */}
        <div className={styles.inputWrap}>
          {noUserMessagesYet && !loading && (
            <div className={styles.suggestions}>
              {SUGGESTIONS.map((text, i) => (
                <button
                  key={i}
                  className={styles.chip}
                  onClick={() => {
                    if (!isTrustedDevice) trackAskEvent('chip_clicked', { chip: text, index: i });
                    if (idleTimerRef.current) {
                      clearTimeout(idleTimerRef.current);
                      idleTimerRef.current = null;
                    }
                    if (text === BOOKING_CHIP) bookDirect();
                    else send(text);
                  }}
                  style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                >
                  {text}
                </button>
              ))}
            </div>
          )}

          {selectedSlot && (
            <div className={styles.slotChip}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className={styles.slotChipLabel}>
                <strong>{selectedSlot.hostDisplay} IST</strong>
                {!selectedSlot.sameZone && ` · ${selectedSlot.bookerDisplay} (${selectedSlot.bookerTimezone})`}
              </span>
              <button
                type="button"
                className={styles.slotChipClear}
                onClick={() => setSelectedSlot(null)}
                aria-label="Unselect slot"
              >
                ×
              </button>
            </div>
          )}

          <div className={`${styles.inputBar} ${isEmpty ? styles.inputBarNarrow : ''} ${loading ? styles.inputBarLoading : ''}`}>
            <input
              ref={inputRef}
              type="text"
              className={styles.input}
              placeholder={selectedSlot ? 'Share your name and email...' : 'Ask anything about Mahesh...'}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Any keystroke means the visitor is engaged — cancel any
                // pending Path B reverse-interview timer so Moore stays quiet.
                if (idleTimerRef.current) {
                  clearTimeout(idleTimerRef.current);
                  idleTimerRef.current = null;
                }
              }}
              onKeyDown={handleKeyDown}
              maxLength={500}
            />
            <button
              className={styles.sendBtn}
              onClick={() => send()}
              disabled={!input.trim() || loading}
              aria-label="Send"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </div>

          <div className={styles.inputFooter}>
            <p className={styles.disclaimer}>Answers based on Mahesh's resume and work history. Works in any language.</p>
            <div className={styles.footerActions}>
              <a
                href="/mahesh-inder-resume.pdf"
                download
                className={styles.actionBtn}
              >
                Resume ↓
              </a>
              {messages.length > 0 && (
                <button className={styles.actionBtn} onClick={copyConversation}>
                  {copied ? 'Copied' : 'Copy chat'}
                </button>
              )}
              <button className={styles.actionBtn} onClick={shareConversation}>
                {messages.length > 0 ? 'Share chat' : 'Share link'}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
