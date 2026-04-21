import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { trackPageView } from '../../hooks/useAnalytics';
import { useSEO } from '../../hooks/useSEO';
import BookingCard from './BookingCard';
import styles from './AskSection.module.scss';

const BOOKER_TIMEZONE =
  typeof window !== 'undefined'
    ? (Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')
    : 'UTC';

const SUGGESTIONS = [
  'What does he build at Emirates NBD?',
  'Has he led a team or is he IC only?',
  'How did he go from clubs to running half marathons?',
  'Book a 30-min call with Mahesh',
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
  const [streamingText, setStreamingText] = useState('');
  const [copied, setCopied] = useState(false);
  const abortRef = useRef(null);
  useSEO('ask');
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const isTrustedDevice = typeof window !== 'undefined' && localStorage.getItem('_inbox_trusted') === '1';

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
        })
        .catch(() => {});
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

  const send = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg, time: Date.now() }]);
    setLoading(true);
    setStreamingText('');
    const accumulatedToolOutputs = [];

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          sessionId: chatSessionId.current,
          history: messages.slice(-8),
          trustedDevice: isTrustedDevice,
          bookerTimezone: BOOKER_TIMEZONE,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessages(prev => [...prev, { role: 'assistant', content: data.error || 'Something went wrong.', time: Date.now() }]);
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
                fullReply += token;
                setStreamingText(fullReply);
              }
              if (toolOutput) {
                accumulatedToolOutputs.push(toolOutput);
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
    setLoading(false);
    inputRef.current?.focus();
  }, [input, loading, messages]);

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
                  {msg.role === 'assistant' && <span className={styles.aiLabel}>MOORE</span>}
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
                          onSlotPick={(slot) => {
                            const localTime = slot.bookerDisplay;
                            setInput(`I'll take ${localTime}`);
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
                  <span className={`${styles.aiLabel} ${styles.aiLabelActive}`}>MOORE</span>
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
                  <span className={`${styles.aiLabel} ${styles.aiLabelActive}`}>MOORE</span>
                  <div className={styles.bubble}>
                    <span className={styles.thinking}>
                      <span className={styles.thinkDot} style={{ '--i': 0 }} />
                      <span className={styles.thinkDot} style={{ '--i': 1 }} />
                      <span className={styles.thinkDot} style={{ '--i': 2 }} />
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>
        )}

        {/* Input area */}
        <div className={styles.inputWrap}>
          {isEmpty && (
            <div className={styles.suggestions}>
              {SUGGESTIONS.map((text, i) => (
                <button
                  key={i}
                  className={styles.chip}
                  onClick={() => send(text)}
                  style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                >
                  {text}
                </button>
              ))}
            </div>
          )}

          <div className={`${styles.inputBar} ${isEmpty ? styles.inputBarNarrow : ''} ${loading ? styles.inputBarLoading : ''}`}>
            <input
              ref={inputRef}
              type="text"
              className={styles.input}
              placeholder="Ask anything about Mahesh..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
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
