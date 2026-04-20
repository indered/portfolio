import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackPageView } from '../../hooks/useAnalytics';
import { useSEO } from '../../hooks/useSEO';
import MessageForm from '../shared/MessageForm';
import styles from './AskSection.module.scss';

const SUGGESTIONS = [
  'What does Mahesh do?',
  'Tell me about his projects',
  'What tech stack does he use?',
  'How did he end up in Dubai?',
  'What is Arc Protocol?',
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
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatSessionId = useRef(getChatSessionId());
  useSEO('ask');
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
        body: JSON.stringify({ message: msg, sessionId: chatSessionId.current }),
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

        <div ref={msgFormRef}>
          <MessageForm />
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
