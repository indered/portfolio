import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './InboxButton.module.scss';

export default function InboxButton() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const trusted = localStorage.getItem('_inbox_trusted') === '1';
    setVisible(trusted);
    if (!trusted) return;

    // Check for unread messages
    const pin = localStorage.getItem('_inbox_trusted_pin');
    if (!pin) return;

    fetch('/api/messages', { headers: { 'x-pin': atob(pin) } })
      .then(r => r.ok ? r.json() : [])
      .then(msgs => setHasUnread(msgs.some(m => !m.read)))
      .catch(() => {});

    // Poll every 60 seconds
    const interval = setInterval(() => {
      fetch('/api/messages', { headers: { 'x-pin': atob(pin) } })
        .then(r => r.ok ? r.json() : [])
        .then(msgs => setHasUnread(msgs.some(m => !m.read)))
        .catch(() => {});
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <button
      className={`${styles.btn} ${hasUnread ? styles.unread : ''}`}
      onClick={() => navigate('/inbox')}
      aria-label={hasUnread ? 'Inbox - new messages' : 'Inbox'}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 4l-10 8L2 4" />
      </svg>
      {hasUnread && <span className={styles.dot} />}
    </button>
  );
}
