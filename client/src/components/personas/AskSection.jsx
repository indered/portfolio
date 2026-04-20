import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackPageView } from '../../hooks/useAnalytics';
import { useSEO } from '../../hooks/useSEO';
import MessageForm from '../shared/MessageForm';
import styles from './AskSection.module.scss';

const SUGGESTIONS = [
  'What does Mahesh build?',
  'Tell me about his experience',
  'What is his tech stack?',
];

function getChatSessionId() {
  let id = sessionStorage.getItem('_chatSid');
  if (!id) {
    id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    sessionStorage.setItem('_chatSid', id);
  }
  return id;
}

// Starfield background
function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 30 : 60;

    const resize = () => { canvas.width = canvas.parentElement.offsetWidth; canvas.height = canvas.parentElement.offsetHeight; };
    resize();

    const stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      a: Math.random() * 0.3 + 0.15,
      speed: Math.random() * 0.15 + 0.05,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        s.y -= s.speed;
        if (s.y < 0) { s.y = canvas.height; s.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className={styles.starfield} />;
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
    if (window.location.hash === '#message') {
      setTimeout(() => msgFormRef.current?.scrollIntoView({ behavior: 'smooth' }), 500);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
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

  const showSuggestions = messages.length === 0;

  return (
    <div className={styles.page}>
      <Starfield />
      <div className={styles.orbitRing} />

      <div className={styles.chatSection}>
        <div className={styles.header}>
          <h2 className={styles.title}>Ask the cosmos</h2>
          <p className={styles.subtitle}>the universe knows a thing or two about Mahesh</p>
        </div>

        <div className={styles.conversation}>
          {showSuggestions && (
            <div className={styles.suggestions}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className={styles.chip} onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`${styles.msg} ${styles[msg.role]}`}>
              {msg.role === 'assistant' && <span className={styles.glow} />}
              <p>{msg.content}</p>
            </div>
          ))}

          {loading && (
            <div className={`${styles.msg} ${styles.assistant}`}>
              <span className={styles.glow} />
              <span className={styles.thinking}>
                <span /><span /><span />
              </span>
            </div>
          )}

          <div ref={endRef} />
        </div>

        <div className={styles.inputBar}>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="Ask the cosmos anything..."
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>

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
