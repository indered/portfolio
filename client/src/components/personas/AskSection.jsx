import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackPageView } from '../../hooks/useAnalytics';
import styles from './AskSection.module.scss';

const SUGGESTIONS = [
  'What does Mahesh do?',
  'Tell me about his projects',
  'What tech stack does he use?',
  'How did he end up in Dubai?',
  'What is Arc Protocol?',
];

export default function AskSection() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgForm, setMsgForm] = useState({ name: '', email: '', message: '' });
  const [msgSent, setMsgSent] = useState(false);
  const [msgError, setMsgError] = useState('');
  const [msgLoading, setMsgLoading] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const msgFormRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    trackPageView('/ask');
    inputRef.current?.focus();
    // Scroll to message form if hash is #message
    if (window.location.hash === '#message') {
      setTimeout(() => msgFormRef.current?.scrollIntoView({ behavior: 'smooth' }), 500);
    }
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.error || 'Something went wrong.' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Could not reach the server. Try again.' }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const showSuggestions = messages.length === 0;

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Ask me anything</h2>
          <p className={styles.subtitle}>
            AI that actually knows me. Ask about my work, projects, or story.
          </p>
        </div>

        {/* Conversation */}
        <div className={styles.conversation}>
          {showSuggestions && (
            <div className={styles.suggestions}>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className={styles.suggestion}
                  onClick={() => send(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`${styles.message} ${styles[msg.role]}`}>
              {msg.role === 'assistant' && (
                <span className={styles.avatar}>🔮</span>
              )}
              <div className={styles.bubble}>
                <p>{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className={`${styles.message} ${styles.assistant}`}>
              <span className={styles.avatar}>🔮</span>
              <div className={styles.bubble}>
                <span className={styles.typing}>
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                </span>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className={styles.inputArea}>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={500}
            disabled={loading}
          />
          <button
            className={styles.sendBtn}
            onClick={() => send()}
            disabled={!input.trim() || loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        {/* Send a message form */}
        <div className={styles.messageForm} ref={msgFormRef} id="message">
          <h3 className={styles.messageTitle}>Or just send me a message</h3>
          <p className={styles.messageSubtitle}>I will get back to you, promise.</p>

          {msgSent ? (
            <div className={styles.messageSent}>
              Message sent. I will read it soon.
            </div>
          ) : (
            <form className={styles.form} onSubmit={async (e) => {
              e.preventDefault();
              if (!msgForm.name.trim() || !msgForm.email.trim() || !msgForm.message.trim()) return;
              setMsgLoading(true);
              setMsgError('');
              try {
                const res = await fetch('/api/messages', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(msgForm),
                });
                if (res.ok) {
                  setMsgSent(true);
                  setMsgForm({ name: '', email: '', message: '' });
                } else {
                  const data = await res.json();
                  setMsgError(data.error || 'Could not send. Try again.');
                }
              } catch {
                setMsgError('Could not reach the server. Try again.');
              }
              setMsgLoading(false);
            }}>
              <input
                type="text"
                className={styles.formInput}
                placeholder="Your name"
                value={msgForm.name}
                onChange={(e) => setMsgForm(f => ({ ...f, name: e.target.value }))}
                maxLength={100}
                required
              />
              <input
                type="email"
                className={styles.formInput}
                placeholder="Your email"
                value={msgForm.email}
                onChange={(e) => setMsgForm(f => ({ ...f, email: e.target.value }))}
                maxLength={200}
                required
              />
              <textarea
                className={styles.formTextarea}
                placeholder="Your message"
                value={msgForm.message}
                onChange={(e) => setMsgForm(f => ({ ...f, message: e.target.value }))}
                maxLength={2000}
                rows={4}
                required
              />
              {msgError && <p className={styles.formError}>{msgError}</p>}
              <button type="submit" className={styles.formBtn} disabled={msgLoading}>
                {msgLoading ? 'Sending...' : 'Send message'}
              </button>
            </form>
          )}
        </div>

        {/* Back to solar system */}
        <div className={styles.backArea}>
          <button className={styles.backBtn} onClick={() => navigate('/')}>
            ← Back to Solar System
          </button>
        </div>

      </div>
    </div>
  );
}
