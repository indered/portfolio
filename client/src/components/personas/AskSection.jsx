import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackPageView } from '../../hooks/useAnalytics';
import { useSEO } from '../../hooks/useSEO';
import MessageForm from '../shared/MessageForm';
import styles from './AskSection.module.scss';

const SUGGESTIONS = [
  { icon: '✦', text: 'What does Mahesh build?' },
  { icon: '◎', text: 'Tell me about his experience' },
  { icon: '⟡', text: 'What is his tech stack?' },
  { icon: '◈', text: 'Tell me about his fintech work' },
];

function getChatSessionId() {
  let id = sessionStorage.getItem('_chatSid');
  if (!id) {
    id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    sessionStorage.setItem('_chatSid', id);
  }
  return id;
}

export default function AskSection() {
  const navigate = useNavigate();
  const chatSessionId = useRef(getChatSessionId());
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(`_chat_${chatSessionId.current}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  useSEO('ask');
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const msgFormRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    trackPageView('/ask');
    inputRef.current?.focus();
    if (window.location.hash === '#message') {
      setTimeout(() => msgFormRef.current?.scrollIntoView({ behavior: 'smooth' }), 500);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem(`_chat_${chatSessionId.current}`, JSON.stringify(messages));
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages]);

  const send = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, sessionId: chatSessionId.current }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: res.ok ? data.reply : (data.error || 'Something went wrong.') }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Could not reach the server. Try again.' }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  }, [input, loading]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className={styles.page}>
      {/* Ambient layers */}
      <div className={styles.ambientTop} />
      <div className={styles.ambientBottom} />

      <div className={styles.chatSection}>
        {/* Header */}
        <div className={styles.header}>
          {isEmpty && (
            <div className={styles.orbits}>
              <div className={styles.orbit1} />
              <div className={styles.orbit2} />
              <div className={styles.orbit3} />
              <div className={styles.orbitDot1} />
              <div className={styles.orbitDot2} />
            </div>
          )}
          <div className={styles.headerGlow} />
          <h2 className={styles.title}>Ask the cosmos</h2>
          <p className={styles.subtitle}>the universe knows a thing or two about Mahesh</p>
        </div>

        {/* Conversation */}
        <div className={`${styles.conversation} ${isEmpty ? styles.emptyState : ''}`}>
          {isEmpty && (
            <div className={styles.suggestions}>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className={styles.card}
                  onClick={() => send(s.text)}
                  style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                >
                  <span className={styles.cardIcon}>{s.icon}</span>
                  <span className={styles.cardText}>{s.text}</span>
                </button>
              ))}
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`${styles.msg} ${styles[msg.role]}`}>
              {msg.role === 'assistant' && <span className={styles.msgLabel}>Cosmos</span>}
              <div className={styles.bubble}>
                <p>{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className={`${styles.msg} ${styles.assistant}`}>
              <span className={styles.msgLabel}>Cosmos</span>
              <div className={styles.bubble}>
                <span className={styles.thinking}>
                  <span /><span /><span />
                </span>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className={styles.inputWrap}>
          <div className={styles.inputBar}>
            <input
              ref={inputRef}
              type="text"
              className={styles.input}
              placeholder="Ask anything about Mahesh..."
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
              aria-label="Send"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Form section */}
      <div className={styles.formSection}>
        <div ref={msgFormRef}>
          <MessageForm />
        </div>
        <div className={styles.backArea}>
          <button className={styles.backBtn} onClick={() => navigate('/')}>
            ← Back to Solar System
          </button>
        </div>
      </div>
    </div>
  );
}
