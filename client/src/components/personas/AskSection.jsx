import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { trackPageView } from '../../hooks/useAnalytics';
import { useSEO } from '../../hooks/useSEO';
import MessageForm from '../shared/MessageForm';
import styles from './AskSection.module.scss';

const SUGGESTIONS = [
  { icon: '✦', text: 'How did his code end up at Google I/O?' },
  { icon: '◎', text: 'Has he led a team or is he IC only?' },
  { icon: '⟡', text: 'What does he build at Emirates NBD?' },
  { icon: '◈', text: 'What is Arc Protocol?' },
];

const GREETING = "Hey. Ask me anything about Mahesh. Work, running, the startup, all of it.";

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

function handleCardMouse(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  e.currentTarget.style.setProperty('--mx', `${x}%`);
  e.currentTarget.style.setProperty('--my', `${y}%`);
}

function handleCardLeave(e) {
  e.currentTarget.style.removeProperty('--mx');
  e.currentTarget.style.removeProperty('--my');
}

const hasHover = typeof window !== 'undefined' && window.matchMedia?.('(hover: hover)')?.matches;

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
  const msgFormRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    trackPageView('/ask');
    inputRef.current?.focus();
    if (window.location.hash === '#message') {
      setTimeout(() => msgFormRef.current?.scrollIntoView({ behavior: 'smooth' }), 500);
    }

    // Load shared conversation from server if ?s= param and no local data
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

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          sessionId: chatSessionId.current,
          history: messages.slice(-8),
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
              const { token, error } = JSON.parse(payload);
              if (error) { fullReply = error; break; }
              if (token) {
                fullReply += token;
                setStreamingText(fullReply);
              }
            } catch {}
          }
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: fullReply || 'Sorry, I could not come up with a response.', time: Date.now() }]);
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
      `${m.role === 'user' ? 'You' : 'Cosmos'}: ${m.content}`
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

  return (
    <div className={styles.page}>
      {/* Breathing ambient background */}
      <div className={styles.ambientBg} />

      <div className={styles.chatSection}>
        {/* Header */}
        <div className={`${styles.header} ${!isEmpty ? styles.headerCompact : ''}`}>
          <div className={styles.headerGlow} />
          <h2 className={styles.title}>Ask the cosmos</h2>
          {isEmpty && <p className={styles.subtitle}>the universe knows a thing or two about Mahesh</p>}
        </div>

        {/* Conversation */}
        <div className={`${styles.conversation} ${isEmpty ? styles.emptyState : ''}`}>
          {isEmpty && (
            <>
              {/* Nebula avatar greeting */}
              <div className={`${styles.msg} ${styles.assistant} ${styles.greeting}`}>
                <div className={styles.nebulaWrap}>
                  <div className={styles.cosmosAvatar}>
                    <span className={styles.cosmosGlyph} />
                  </div>
                </div>
                <div>
                  <span className={styles.msgLabel}>Cosmos</span>
                  <div className={styles.bubble}>
                    <p>{GREETING}</p>
                  </div>
                </div>
              </div>

              <div className={styles.suggestions}>
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    className={styles.card}
                    onClick={() => send(s.text)}
                    onMouseMove={hasHover ? handleCardMouse : undefined}
                    onMouseLeave={hasHover ? handleCardLeave : undefined}
                    style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                  >
                    <span className={styles.cardIcon}>{s.icon}</span>
                    <span className={styles.cardText}>{s.text}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {!isEmpty && <div className={styles.spacer} />}

          {messages.map((msg, i) => (
            <div key={i} className={`${styles.msg} ${styles[msg.role]}`}>
              {msg.role === 'assistant' && (
                <div className={styles.cosmosAvatar}>
                  <span className={styles.cosmosGlyph} />
                </div>
              )}
              <div>
                {msg.role === 'assistant' && <span className={styles.msgLabel}>Cosmos</span>}
                <div className={styles.bubbleWrap}>
                  <div className={styles.bubble}>
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                  {msg.time && <span className={styles.timestamp}>{formatTime(msg.time)}</span>}
                </div>
              </div>
            </div>
          ))}

          {/* Streaming message */}
          {loading && streamingText && (
            <div className={`${styles.msg} ${styles.assistant}`}>
              <div className={`${styles.cosmosAvatar} ${styles.cosmosAvatarActive}`}>
                <span className={styles.cosmosGlyph} />
              </div>
              <div>
                <span className={styles.msgLabel}>Cosmos</span>
                <div className={styles.bubble}>
                  <ReactMarkdown>{streamingText}</ReactMarkdown>
                  <span className={styles.streamCursor} aria-hidden="true" />
                </div>
              </div>
            </div>
          )}

          {/* Thinking indicator */}
          {loading && !streamingText && (
            <div className={`${styles.msg} ${styles.assistant}`}>
              <div className={`${styles.cosmosAvatar} ${styles.cosmosAvatarActive}`}>
                <span className={styles.cosmosGlyph} />
              </div>
              <div>
                <span className={styles.msgLabel}>Cosmos</span>
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

        {/* Input */}
        <div className={styles.inputWrap}>
          <div className={`${styles.inputBar} ${loading ? styles.inputBarLoading : ''}`}>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <div className={styles.inputFooter}>
            <p className={styles.disclaimer}>Answers based on Mahesh's actual resume and work history</p>
            <div className={styles.footerActions}>
              {messages.length > 0 && (
                <button className={styles.actionBtn} onClick={copyConversation}>
                  {copied ? 'Copied!' : 'Copy chat'}
                </button>
              )}
              <button className={styles.actionBtn} onClick={shareConversation}>
                {messages.length > 0 ? 'Share chat' : 'Share link'}
              </button>
            </div>
          </div>
          <p className={styles.langHint}>works in Hindi, Hinglish, or any language you prefer</p>
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
