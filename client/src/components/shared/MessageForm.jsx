import { useState } from 'react';
import styles from './MessageForm.module.scss';

export default function MessageForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSent(true);
        setForm({ name: '', email: '', message: '' });
      } else {
        const data = await res.json();
        setError(data.error || 'Could not send. Try again.');
      }
    } catch {
      setError('Could not reach the server. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className={styles.container} id="message">
      <p className={styles.or}>Or leave a message here</p>

      {sent ? (
        <div className={styles.sent}>Message sent. I will read it soon.</div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            className={styles.input}
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            maxLength={100}
            required
          />
          <input
            type="email"
            className={styles.input}
            placeholder="Your email"
            value={form.email}
            onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
            maxLength={200}
            required
          />
          <textarea
            className={styles.textarea}
            placeholder="Your message"
            value={form.message}
            onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
            maxLength={2000}
            rows={4}
            required
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Sending...' : 'Send message'}
          </button>
        </form>
      )}
    </div>
  );
}
