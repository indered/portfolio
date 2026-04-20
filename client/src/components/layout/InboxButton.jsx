import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './InboxButton.module.scss';

export default function InboxButton() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem('_inbox_trusted') === '1');
  }, []);

  if (!visible) return null;

  return (
    <button
      className={styles.btn}
      onClick={() => navigate('/inbox')}
      aria-label="Inbox"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 4l-10 8L2 4" />
      </svg>
    </button>
  );
}
