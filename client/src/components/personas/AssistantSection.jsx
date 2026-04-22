// Personal-side assistant at /me.
// PIN gate: same look + logic as /inbox (dark loginBox, biometric/WebAuthn,
// trusted-device auto-login, session fallback). Chat UI after auth: same
// Gemini light theme as /ask — chips, bubbles, streaming cursor, send button.

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import styles from './AssistantSection.module.scss';

// ── WebAuthn helpers (copied from MessagesSection) ─────────────────────────

const WEBAUTHN_CREDENTIAL_KEY = '_inbox_webauthn_id';

function isWebAuthnAvailable() {
  return typeof window !== 'undefined'
    && window.PublicKeyCredential !== undefined
    && typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';
}

async function hasPlatformAuth() {
  if (!isWebAuthnAvailable()) return false;
  return window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
}

async function registerBiometric(pin) {
  const userId = new Uint8Array(16);
  crypto.getRandomValues(userId);

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: 'Mahesh Inder Inbox', id: window.location.hostname },
      user: { id: userId, name: 'mahesh-inbox', displayName: 'Inbox' },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
      },
      timeout: 60000,
    },
  });

  const credId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
  localStorage.setItem(WEBAUTHN_CREDENTIAL_KEY, credId);
  localStorage.setItem('_inbox_auth_pin', btoa(pin));
  return true;
}

async function authenticateBiometric() {
  const credId = localStorage.getItem(WEBAUTHN_CREDENTIAL_KEY);
  if (!credId) return null;
  const rawId = Uint8Array.from(atob(credId), (c) => c.charCodeAt(0));
  await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      allowCredentials: [{ id: rawId, type: 'public-key', transports: ['internal'] }],
      userVerification: 'required',
      timeout: 60000,
    },
  });
  const storedPin = localStorage.getItem('_inbox_auth_pin');
  return storedPin ? atob(storedPin) : null;
}

async function verifyPin(pin) {
  const res = await fetch('/api/assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-pin': pin },
    body: JSON.stringify({ message: 'ping' }),
  });
  if (res.status === 401) return false;
  // Any non-401 means PIN was accepted (even if rate limited or 500)
  return true;
}

// ── Tool output cards ───────────────────────────────────────────────────────

function BriefCard({ data }) {
  return (
    <div className={styles.brief}>
      <h3 className={styles.briefTitle}>Daily brief · {data.date}</h3>
      <div className={styles.briefGrid}>
        <div className={styles.briefBlock}>
          <span className={styles.briefLabel}>Bookings today</span>
          <span className={styles.briefNumber}>{data.today.bookingsCount}</span>
          {data.today.bookings.map((b, i) => (
            <div key={i} className={styles.briefRow}>
              <strong>{b.time}</strong> — {b.name} ({b.status})
            </div>
          ))}
        </div>
        <div className={styles.briefBlock}>
          <span className={styles.briefLabel}>Unread messages</span>
          <span className={styles.briefNumber}>{data.unread.count}</span>
          {data.unread.messages.map((m) => (
            <div key={m.id} className={styles.briefRow}>
              <strong>{m.from}</strong>: {m.preview}
            </div>
          ))}
        </div>
        <div className={styles.briefBlock}>
          <span className={styles.briefLabel}>Calendar events today</span>
          <span className={styles.briefNumber}>{data.today.calendarEventsCount}</span>
        </div>
      </div>
    </div>
  );
}

function BookingsList({ initial, pin }) {
  const [bookings, setBookings] = useState(initial);
  const [busyId, setBusyId] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const cancel = async (id) => {
    if (!confirm('Cancel this booking? This also deletes the Google Calendar event.')) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/assistant/bookings/${id}`, {
        method: 'DELETE',
        headers: { 'x-pin': pin },
      });
      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== id));
      } else {
        alert('Cancel failed. Try again.');
      }
    } catch {
      alert('Cancel failed. Check connection.');
    }
    setBusyId(null);
  };

  const cancelAll = async () => {
    if (!bookings.length) return;
    if (!confirm(`Cancel all ${bookings.length} bookings? This also deletes the Google Calendar events.`)) return;
    setBulkBusy(true);
    try {
      const res = await fetch('/api/assistant/bookings/delete-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-pin': pin },
        body: JSON.stringify({ ids: bookings.map((b) => b.id) }),
      });
      if (res.ok) {
        const data = await res.json();
        const cancelled = new Set(data.cancelled || []);
        setBookings((prev) => prev.filter((b) => !cancelled.has(b.id)));
      } else {
        alert('Bulk cancel failed. Try again.');
      }
    } catch {
      alert('Bulk cancel failed. Check connection.');
    }
    setBulkBusy(false);
  };

  if (!bookings.length) {
    return (
      <div className={styles.list}>
        <p className={styles.listTitle}>No bookings</p>
      </div>
    );
  }
  return (
    <div className={styles.list}>
      <div className={styles.listHeader}>
        <p className={styles.listTitle}>{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>
        <button
          className={styles.bulkDeleteBtn}
          onClick={cancelAll}
          disabled={bulkBusy}
          aria-label="Cancel all bookings"
        >
          {bulkBusy ? 'Cancelling…' : `Delete all (${bookings.length})`}
        </button>
      </div>
      {bookings.map((b) => (
        <div key={b.id} className={styles.listRow}>
          <div className={styles.listRowMain}>
            <strong>{b.start}</strong> — {b.name} ({b.email}) · {b.status}
          </div>
          <button
            className={styles.rowDeleteBtn}
            onClick={() => cancel(b.id)}
            disabled={busyId === b.id || bulkBusy}
            aria-label="Cancel booking"
          >
            {busyId === b.id ? '...' : 'Cancel'}
          </button>
        </div>
      ))}
    </div>
  );
}

function ToolOutput({ to, pin }) {
  const { tool, result } = to;
  if (!result?.ok) return <p className={styles.toolErr}>{result?.error || 'Failed'}</p>;
  if (tool === 'get_daily_brief') return <BriefCard data={result} />;
  if (tool === 'list_bookings' && result.bookings) {
    return <BookingsList initial={result.bookings} pin={pin} />;
  }
  if (tool === 'list_messages' && result.messages) {
    return (
      <div className={styles.list}>
        <p className={styles.listTitle}>{result.count} message{result.count !== 1 ? 's' : ''}</p>
        {result.messages.map((m) => (
          <div key={m.id} className={styles.listRow}>
            <strong>{m.name || m.email}</strong>
            {m.email && m.name ? ` (${m.email})` : ''}: {m.message}
          </div>
        ))}
      </div>
    );
  }
  if (tool === 'list_conversations' && result.conversations) {
    return (
      <div className={styles.list}>
        <p className={styles.listTitle}>{result.count} recent conversation{result.count !== 1 ? 's' : ''}</p>
        {result.conversations.map((c) => (
          <div key={c.id} className={styles.listRow}>
            <strong>{c.geo || '?'}</strong> · {c.messageCount} msgs · "{c.firstQuestion}"
          </div>
        ))}
      </div>
    );
  }
  if (tool === 'draft_email_reply') return <p className={styles.toolOk}>Draft created. Check Gmail drafts.</p>;
  if (tool === 'reschedule_booking_admin') return <p className={styles.toolOk}>Rescheduled to {result.newStart}.</p>;
  if (tool === 'cancel_booking_admin') return <p className={styles.toolOk}>Cancelled.</p>;
  return null;
}

// ── Suggestions ─────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  'Give me my morning brief',
  'List my bookings this week',
  'Any unread messages?',
  'What conversations came in yesterday?',
];

function formatTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Login gate (same as /inbox) ─────────────────────────────────────────────

function PinGate({ onAuth }) {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricRegistered, setBiometricRegistered] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    hasPlatformAuth().then((available) => {
      setBiometricAvailable(available);
      setBiometricRegistered(available && !!localStorage.getItem(WEBAUTHN_CREDENTIAL_KEY));
    });
  }, []);

  // Auto-login: trusted device > session > biometric
  useEffect(() => {
    const trustedPin = localStorage.getItem('_inbox_trusted_pin');
    const sessionPin = sessionStorage.getItem('_inbox_pin');
    const autoPin = trustedPin ? atob(trustedPin) : sessionPin;
    if (!autoPin) return;
    (async () => {
      const ok = await verifyPin(autoPin).catch(() => false);
      if (ok) {
        onAuth(autoPin, { promptBiometric: false });
      } else {
        localStorage.removeItem('_inbox_trusted_pin');
        sessionStorage.removeItem('_inbox_pin');
      }
    })();
  }, [onAuth]);

  const submit = async (e) => {
    e.preventDefault();
    if (!pin.trim()) return;
    setLoading(true);
    setError('');
    const ok = await verifyPin(pin).catch(() => false);
    if (!ok) {
      setError('Wrong PIN.');
      setLoading(false);
      return;
    }
    sessionStorage.setItem('_inbox_pin', pin);
    localStorage.setItem('_inbox_trusted_pin', btoa(pin));
    localStorage.setItem('_inbox_trusted', '1');
    const promptBiometric = biometricAvailable && !localStorage.getItem(WEBAUTHN_CREDENTIAL_KEY);
    onAuth(pin, { promptBiometric });
    setLoading(false);
  };

  const bioLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const storedPin = await authenticateBiometric();
      if (!storedPin) throw new Error('no-pin');
      const ok = await verifyPin(storedPin);
      if (!ok) throw new Error('invalid');
      sessionStorage.setItem('_inbox_pin', storedPin);
      onAuth(storedPin, { promptBiometric: false });
    } catch {
      setError('Biometric failed. Use PIN instead.');
    }
    setLoading(false);
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginBox}>
        <h2 className={styles.loginTitle}>Assistant</h2>
        <p className={styles.loginSubtitle}>
          {biometricRegistered ? 'Use Face ID or enter PIN' : 'Enter PIN to access'}
        </p>

        {biometricRegistered && (
          <>
            <button className={styles.biometricBtn} onClick={bioLogin} disabled={loading}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
                <circle cx="12" cy="16" r="1" />
              </svg>
              {loading ? 'Verifying...' : 'Unlock with biometrics'}
            </button>
            <p className={styles.loginDivider}>or</p>
          </>
        )}

        <form onSubmit={submit} className={styles.loginForm}>
          <input
            type="password"
            className={styles.pinInput}
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={10}
            autoFocus={!biometricRegistered}
          />
          <button type="submit" className={styles.pinBtn} disabled={loading}>
            {loading ? '...' : 'Enter'}
          </button>
        </form>
        {error && <p className={styles.loginError}>{error}</p>}
        <button className={styles.loginBack} onClick={() => navigate('/')}>
          ← Back to Solar System
        </button>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

function getInitialPin() {
  if (typeof window === 'undefined') return null;
  const trusted = localStorage.getItem('_inbox_trusted_pin');
  if (trusted) { try { return atob(trusted); } catch { return null; } }
  return sessionStorage.getItem('_inbox_pin');
}

export default function AssistantSection() {
  const navigate = useNavigate();
  const [pin, setPin] = useState(() => getInitialPin());
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [biometricPrompt, setBiometricPrompt] = useState(false);
  const inputRef = useRef(null);
  const endRef = useRef(null);

  const handleAuth = useCallback((newPin, { promptBiometric }) => {
    setPin(newPin);
    if (promptBiometric) setBiometricPrompt(true);
  }, []);

  useEffect(() => {
    if (pin) {
      // Switch to light theme once authenticated — matches /ask
      document.documentElement.setAttribute('data-theme', 'light');
      inputRef.current?.focus();
    }
  }, [pin]);

  useEffect(() => {
    if (messages.length > 0 || streamingText) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, streamingText]);

  const setupBiometric = async () => {
    try { await registerBiometric(pin); } catch {}
    setBiometricPrompt(false);
  };

  const send = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading || !pin) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: msg, time: Date.now() }]);
    setLoading(true);
    setStreamingText('');
    const accToolOutputs = [];

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-pin': pin },
        body: JSON.stringify({ message: msg, history: messages.slice(-8) }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setMessages((prev) => [...prev, { role: 'assistant', content: d.error || 'Error.', time: Date.now() }]);
        setLoading(false);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        for (const line of text.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6);
          if (payload === '[DONE]') break;
          try {
            const { token, toolOutput, error } = JSON.parse(payload);
            if (token) { full += token; setStreamingText(full); }
            if (toolOutput) accToolOutputs.push(toolOutput);
            if (error) full = error;
          } catch {}
        }
      }
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: full || '(done)',
        time: Date.now(),
        toolOutputs: accToolOutputs.length ? accToolOutputs : undefined,
      }]);
      setStreamingText('');
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Could not reach server.', time: Date.now() }]);
      setStreamingText('');
    }
    setLoading(false);
    inputRef.current?.focus();
  }, [input, loading, messages, pin]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const signOut = () => {
    sessionStorage.removeItem('_inbox_pin');
    localStorage.removeItem('_inbox_trusted');
    localStorage.removeItem('_inbox_trusted_pin');
    setPin(null);
  };

  if (!pin) return <PinGate onAuth={handleAuth} />;

  const isEmpty = messages.length === 0 && !loading;

  return (
    <div className={styles.page}>
      <button className={styles.topBackBtn} onClick={() => navigate('/')} aria-label="Back to Solar System">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span>Solar System</span>
      </button>

      <button className={styles.topSignOut} onClick={signOut} aria-label="Sign out">
        Sign out
      </button>

      <div className={styles.chatSection}>
        {isEmpty ? (
          <div className={styles.hero}>
            <h1 className={styles.heroTitle}>
              <span className={styles.gradientText}>Hello, Mahesh.</span>
              <br />
              How can I help today?
            </h1>
          </div>
        ) : (
          <div className={styles.compactHeader}>
            <h2 className={styles.compactBrand}>
              <span className={styles.gradientText}>Your</span> assistant
            </h2>
          </div>
        )}

        {biometricPrompt && (
          <div className={styles.biometricPrompt}>
            <p>Want to use Face ID or fingerprint next time?</p>
            <div className={styles.biometricPromptBtns}>
              <button className={styles.chip} onClick={setupBiometric}>Yes, set it up</button>
              <button className={styles.chipMuted} onClick={() => setBiometricPrompt(false)}>No thanks</button>
            </div>
          </div>
        )}

        {!isEmpty && (
          <div className={styles.conversation}>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.msg} ${styles[m.role]}`}>
                <div className={styles.msgBody}>
                  {m.role === 'assistant' && <span className={styles.aiLabel}>ASSISTANT</span>}
                  <div className={styles.bubbleWrap}>
                    <div className={styles.bubble}>
                      {m.role === 'assistant'
                        ? <ReactMarkdown>{m.content}</ReactMarkdown>
                        : <p>{m.content}</p>}
                    </div>
                    {m.toolOutputs?.map((to, j) => <ToolOutput key={j} to={to} pin={pin} />)}
                    {m.time && <span className={styles.timestamp}>{formatTime(m.time)}</span>}
                  </div>
                </div>
              </div>
            ))}

            {loading && streamingText && (
              <div className={`${styles.msg} ${styles.assistant}`}>
                <div className={styles.msgBody}>
                  <span className={`${styles.aiLabel} ${styles.aiLabelActive}`}>ASSISTANT</span>
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
                  <span className={`${styles.aiLabel} ${styles.aiLabelActive}`}>ASSISTANT</span>
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

          <div className={`${styles.inputBar} ${loading ? styles.inputBarLoading : ''}`}>
            <input
              ref={inputRef}
              type="text"
              className={styles.input}
              placeholder="Ask your assistant..."
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
            <p className={styles.disclaimer}>Private. Only you see this. PIN-gated.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
