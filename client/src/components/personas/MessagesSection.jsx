import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MessagesSection.module.scss';

export default function MessagesSection() {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [authed, setAuthed] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const login = async (e) => {
    e.preventDefault();
    if (!pin.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/messages', {
        headers: { 'x-pin': pin },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        setAuthed(true);
        sessionStorage.setItem('_inbox_pin', pin);
      } else {
        setError('Wrong PIN.');
      }
    } catch {
      setError('Could not reach the server.');
    }
    setLoading(false);
  };

  // Auto-login if PIN is in session
  useEffect(() => {
    const saved = sessionStorage.getItem('_inbox_pin');
    if (saved) {
      setPin(saved);
      fetch('/api/messages', { headers: { 'x-pin': saved } })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => { setMessages(data); setAuthed(true); })
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
          <p className={styles.loginSubtitle}>Enter PIN to access messages</p>
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

        {messages.length === 0 ? (
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
        )}
      </div>
    </div>
  );
}
