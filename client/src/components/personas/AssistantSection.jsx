// Personal-side assistant at /me. PIN-gated via same trusted-device
// localStorage used for /inbox. Chat UI, wider tools, daily-brief card.

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import styles from './AssistantSection.module.scss';

function getPin() {
  const trusted = typeof window !== 'undefined' && localStorage.getItem('_inbox_trusted_pin');
  if (trusted) { try { return atob(trusted); } catch { return null; } }
  return typeof window !== 'undefined' ? sessionStorage.getItem('_inbox_pin') : null;
}

function PinGate({ onAuth }) {
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    // Validate by calling assistant with an empty message — auth check only
    const res = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-pin': pin },
      body: JSON.stringify({ message: 'ping' }),
    });
    if (res.status === 401) { setErr('Wrong PIN.'); return; }
    sessionStorage.setItem('_inbox_pin', pin);
    onAuth(pin);
  };
  return (
    <div className={styles.gate}>
      <h2 className={styles.gateTitle}>Mahesh's Assistant</h2>
      <p className={styles.gateSub}>PIN required</p>
      <form onSubmit={submit} className={styles.gateForm}>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="PIN"
          className={styles.gateInput}
          autoFocus
        />
        <button type="submit" className={styles.gateBtn}>Enter</button>
      </form>
      {err && <p className={styles.gateError}>{err}</p>}
    </div>
  );
}

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

function ToolOutput({ to }) {
  const { tool, result } = to;
  if (!result?.ok) return <p className={styles.toolErr}>{result?.error || 'Failed'}</p>;
  if (tool === 'get_daily_brief') return <BriefCard data={result} />;
  if (tool === 'list_bookings' && result.bookings) {
    return (
      <div className={styles.list}>
        <p className={styles.listTitle}>{result.count} booking{result.count !== 1 ? 's' : ''}</p>
        {result.bookings.map((b) => (
          <div key={b.id} className={styles.listRow}>
            <strong>{b.start}</strong> — {b.name} ({b.email}) · {b.status}
          </div>
        ))}
      </div>
    );
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
  if (tool === 'draft_email_reply') {
    return <p className={styles.toolOk}>✓ Draft created. Check Gmail drafts.</p>;
  }
  if (tool === 'reschedule_booking_admin') {
    return <p className={styles.toolOk}>✓ Rescheduled to {result.newStart}.</p>;
  }
  if (tool === 'cancel_booking_admin') {
    return <p className={styles.toolOk}>✓ Cancelled.</p>;
  }
  return null;
}

export default function AssistantSection() {
  const navigate = useNavigate();
  const [pin, setPin] = useState(() => getPin());
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const inputRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  useEffect(() => {
    if (messages.length > 0 || streamingText) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, streamingText]);

  const send = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading || !pin) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
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
        setMessages((prev) => [...prev, { role: 'assistant', content: d.error || 'Error.' }]);
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
        toolOutputs: accToolOutputs.length ? accToolOutputs : undefined,
      }]);
      setStreamingText('');
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Could not reach server.' }]);
      setStreamingText('');
    }
    setLoading(false);
    inputRef.current?.focus();
  }, [input, loading, messages, pin]);

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  const signOut = () => {
    sessionStorage.removeItem('_inbox_pin');
    localStorage.removeItem('_inbox_trusted');
    localStorage.removeItem('_inbox_trusted_pin');
    setPin(null);
  };

  if (!pin) return <div className={styles.page}><PinGate onAuth={setPin} /></div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/')}>← Home</button>
        <h1 className={styles.title}>Your assistant</h1>
        <button className={styles.signout} onClick={signOut}>Sign out</button>
      </header>

      <div className={styles.chat}>
        {messages.length === 0 && !loading && (
          <div className={styles.suggestions}>
            <p className={styles.suggestLabel}>Try:</p>
            {['Give me my morning brief', 'List my bookings this week', 'Any unread messages?', 'What conversations came in yesterday?'].map((s) => (
              <button key={s} className={styles.suggestBtn} onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`${styles.msg} ${styles[m.role]}`}>
            <div className={styles.bubble}>
              {m.role === 'assistant' ? <ReactMarkdown>{m.content}</ReactMarkdown> : <p>{m.content}</p>}
            </div>
            {m.toolOutputs?.map((to, j) => <ToolOutput key={j} to={to} />)}
          </div>
        ))}

        {loading && streamingText && (
          <div className={`${styles.msg} ${styles.assistant}`}>
            <div className={styles.bubble}><ReactMarkdown>{streamingText}</ReactMarkdown></div>
          </div>
        )}
        {loading && !streamingText && (
          <div className={`${styles.msg} ${styles.assistant}`}>
            <div className={styles.bubble}><span className={styles.dots}>…</span></div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className={styles.inputWrap}>
        <div className={styles.inputBar}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask your assistant..."
            disabled={loading}
            className={styles.input}
          />
          <button
            className={styles.sendBtn}
            onClick={() => send()}
            disabled={!input.trim() || loading}
            aria-label="Send"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
