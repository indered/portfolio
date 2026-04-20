import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MessagesSection.module.scss';

export default function MessagesSection() {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState('messages');
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedConvo, setExpandedConvo] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const fetchData = async (p) => {
    const headers = { 'x-pin': p };
    const [msgRes, convoRes] = await Promise.all([
      fetch('/api/messages', { headers }),
      fetch('/api/messages/conversations', { headers }),
    ]);
    if (!msgRes.ok) throw new Error('Invalid PIN');
    setMessages(await msgRes.json());
    if (convoRes.ok) setConversations(await convoRes.json());
  };

  const login = async (e) => {
    e.preventDefault();
    if (!pin.trim()) return;
    setLoading(true);
    setError('');
    try {
      await fetchData(pin);
      setAuthed(true);
      sessionStorage.setItem('_inbox_pin', pin);
    } catch {
      setError('Wrong PIN.');
    }
    setLoading(false);
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('_inbox_pin');
    if (saved) {
      setPin(saved);
      fetchData(saved)
        .then(() => setAuthed(true))
        .catch(() => sessionStorage.removeItem('_inbox_pin'));
    }
  }, []);

  const markRead = async (id) => {
    await fetch(`/api/messages/${id}/read`, {
      method: 'PATCH',
      headers: { 'x-pin': pin },
    });
    setMessages(prev => prev.map(m => m._id === id ? { ...m, read: true } : m));
  };

  const unreadCount = messages.filter(m => !m.read).length;

  if (!authed) {
    return (
      <div className={styles.page}>
        <div className={styles.loginBox}>
          <h2 className={styles.loginTitle}>Inbox</h2>
          <p className={styles.loginSubtitle}>Enter PIN to access</p>
          <form onSubmit={login} className={styles.loginForm}>
            <input
              type="password"
              className={styles.pinInput}
              placeholder="PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={10}
              autoFocus
            />
            <button type="submit" className={styles.pinBtn} disabled={loading}>
              {loading ? '...' : 'Enter'}
            </button>
          </form>
          {error && <p className={styles.loginError}>{error}</p>}
          <button className={styles.backLink} onClick={() => navigate('/')}>
            ← Back to Solar System
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Inbox
            {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
          </h2>
          <button className={styles.backLink} onClick={() => navigate('/')}>
            ← Solar System
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'messages' ? styles.tabActive : ''}`}
            onClick={() => setTab('messages')}
          >
            Messages ({messages.length})
          </button>
          <button
            className={`${styles.tab} ${tab === 'conversations' ? styles.tabActive : ''}`}
            onClick={() => setTab('conversations')}
          >
            Conversations ({conversations.length})
          </button>
        </div>

        {/* Messages tab */}
        {tab === 'messages' && (
          messages.length === 0 ? (
            <p className={styles.empty}>No messages yet.</p>
          ) : (
            <div className={styles.list}>
              {messages.map(msg => (
                <div
                  key={msg._id}
                  className={`${styles.card} ${!msg.read ? styles.unread : ''}`}
                  onClick={() => !msg.read && markRead(msg._id)}
                >
                  <div className={styles.cardHeader}>
                    <span className={styles.cardName}>{msg.name}</span>
                    <span className={styles.cardDate}>
                      {new Date(msg.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                  </div>
                  <span className={styles.cardEmail}>{msg.email}</span>
                  <p className={styles.cardMessage}>{msg.message}</p>
                  <div className={styles.cardActions}>
                    <a
                      href={`mailto:${msg.email}?subject=Re: Message from ${msg.name}&body=%0A%0A---%0AOriginal message:%0A${encodeURIComponent(msg.message)}`}
                      className={styles.replyBtn}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Reply
                    </a>
                    {!msg.read && <span className={styles.unreadDot} />}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Conversations tab */}
        {tab === 'conversations' && (
          conversations.length === 0 ? (
            <p className={styles.empty}>No conversations yet.</p>
          ) : (
            <div className={styles.list}>
              {conversations.map(convo => (
                <div
                  key={convo._id}
                  className={styles.convoCard}
                  onClick={() => setExpandedConvo(expandedConvo === convo._id ? null : convo._id)}
                >
                  <div className={styles.cardHeader}>
                    <span className={styles.convoGeo}>
                      {convo.geo || 'Unknown'} · {convo.device || 'desktop'}
                    </span>
                    <span className={styles.cardDate}>
                      {new Date(convo.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className={styles.convoPreview}>
                    {convo.messages?.[0]?.content || 'Empty conversation'}
                  </p>
                  <span className={styles.convoCount}>
                    {Math.floor((convo.messages?.length || 0) / 2)} questions
                  </span>

                  {expandedConvo === convo._id && (
                    <div className={styles.convoMessages}>
                      {convo.messages?.map((m, i) => (
                        <div key={i} className={`${styles.convoMsg} ${styles[m.role]}`}>
                          <span className={styles.convoRole}>
                            {m.role === 'user' ? 'Visitor' : '🔮 AI'}
                          </span>
                          <p>{m.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
