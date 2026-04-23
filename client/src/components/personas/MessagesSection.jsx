import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MessagesSection.module.scss';

// WebAuthn helpers
const WEBAUTHN_CREDENTIAL_KEY = '_inbox_webauthn_id';

function isWebAuthnAvailable() {
  return window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';
}

async function hasPlatformAuth() {
  if (!isWebAuthnAvailable()) return false;
  return window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
}

async function registerBiometric(pin) {
  const userId = new Uint8Array(16);
  crypto.getRandomValues(userId);

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: 'Mahesh Inder Inbox', id: window.location.hostname },
      user: { id: userId, name: 'mahesh-inbox', displayName: 'Inbox' },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
      },
      timeout: 60000,
    },
  });

  const credId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
  localStorage.setItem(WEBAUTHN_CREDENTIAL_KEY, credId);
  // Store PIN encrypted with a simple base64 (not truly secure, but the PIN itself is simple)
  localStorage.setItem('_inbox_auth_pin', btoa(pin));
  return true;
}

async function authenticateBiometric() {
  const credId = localStorage.getItem(WEBAUTHN_CREDENTIAL_KEY);
  if (!credId) return null;

  const rawId = Uint8Array.from(atob(credId), c => c.charCodeAt(0));

  await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      allowCredentials: [{ id: rawId, type: 'public-key', transports: ['internal'] }],
      userVerification: 'required',
      timeout: 60000,
    },
  });

  // If biometric passed, return the stored PIN
  const storedPin = localStorage.getItem('_inbox_auth_pin');
  return storedPin ? atob(storedPin) : null;
}

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
  const [selectedIds, setSelectedIds] = useState([]);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricRegistered, setBiometricRegistered] = useState(false);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    hasPlatformAuth().then(available => {
      setBiometricAvailable(available);
      setBiometricRegistered(available && !!localStorage.getItem(WEBAUTHN_CREDENTIAL_KEY));
    });
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

  const loginSuccess = useCallback((p) => {
    setPin(p);
    setAuthed(true);
    sessionStorage.setItem('_inbox_pin', p);
    // Save as trusted device permanently
    localStorage.setItem('_inbox_trusted_pin', btoa(p));
    localStorage.setItem('_inbox_trusted', '1');
    // Offer biometric setup if available and not registered
    if (biometricAvailable && !localStorage.getItem(WEBAUTHN_CREDENTIAL_KEY)) {
      setShowBiometricPrompt(true);
    }
  }, [biometricAvailable]);

  const login = async (e) => {
    e.preventDefault();
    if (!pin.trim()) return;
    setLoading(true);
    setError('');
    try {
      await fetchData(pin);
      loginSuccess(pin);
    } catch {
      setError('Wrong PIN.');
    }
    setLoading(false);
  };

  const loginWithBiometric = async () => {
    setLoading(true);
    setError('');
    try {
      const storedPin = await authenticateBiometric();
      if (storedPin) {
        await fetchData(storedPin);
        setPin(storedPin);
        setAuthed(true);
        sessionStorage.setItem('_inbox_pin', storedPin);
      } else {
        setError('Biometric failed. Use PIN instead.');
      }
    } catch {
      setError('Biometric failed. Use PIN instead.');
    }
    setLoading(false);
  };

  const setupBiometric = async () => {
    try {
      await registerBiometric(pin);
      setBiometricRegistered(true);
      setShowBiometricPrompt(false);
    } catch {
      setShowBiometricPrompt(false);
    }
  };

  // Auto-login: trusted device (localStorage) > session > biometric
  useEffect(() => {
    const trustedPin = localStorage.getItem('_inbox_trusted_pin');
    const sessionPin = sessionStorage.getItem('_inbox_pin');
    const autoPin = trustedPin ? atob(trustedPin) : sessionPin;
    if (autoPin) {
      setPin(autoPin);
      fetchData(autoPin)
        .then(() => setAuthed(true))
        .catch(() => {
          localStorage.removeItem('_inbox_trusted_pin');
          sessionStorage.removeItem('_inbox_pin');
        });
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
          <p className={styles.loginSubtitle}>
            {biometricRegistered ? 'Use Face ID or enter PIN' : 'Enter PIN to access'}
          </p>

          {biometricRegistered && (
            <button
              className={styles.biometricBtn}
              onClick={loginWithBiometric}
              disabled={loading}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
                <circle cx="12" cy="16" r="1" />
              </svg>
              {loading ? 'Verifying...' : 'Unlock with biometrics'}
            </button>
          )}

          {biometricRegistered && (
            <p className={styles.loginDivider}>or</p>
          )}

          <form onSubmit={login} className={styles.loginForm}>
            <input
              type="password"
              className={styles.pinInput}
              placeholder="PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={10}
              autoFocus={!biometricRegistered}
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

        {/* Biometric setup prompt */}
        {showBiometricPrompt && (
          <div className={styles.biometricPrompt}>
            <p>Want to use Face ID or fingerprint next time?</p>
            <div className={styles.biometricPromptBtns}>
              <button className={styles.pinBtn} onClick={setupBiometric}>Yes, set it up</button>
              <button className={styles.backLink} onClick={() => setShowBiometricPrompt(false)}>No thanks</button>
            </div>
          </div>
        )}

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
            <>
              <div className={styles.convoToolbar}>
                <label className={styles.selectAllLabel}>
                  <input
                    type="checkbox"
                    checked={selectedIds.length === conversations.length && conversations.length > 0}
                    onChange={(e) => {
                      setSelectedIds(e.target.checked ? conversations.map(c => c._id) : []);
                    }}
                  />
                  <span>
                    {selectedIds.length > 0
                      ? `${selectedIds.length} selected`
                      : 'Select all'}
                  </span>
                </label>
                {selectedIds.length > 0 && (
                  <button
                    className={styles.bulkDeleteBtn}
                    onClick={async () => {
                      if (!confirm(`Delete ${selectedIds.length} conversation(s)?`)) return;
                      const trustedPin = localStorage.getItem('_inbox_trusted_pin');
                      const p = trustedPin ? atob(trustedPin) : sessionStorage.getItem('_inbox_pin');
                      if (!p) { alert('Auth expired. Please reload.'); return; }
                      const res = await fetch('/api/messages/conversations/delete-bulk', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'x-pin': p },
                        body: JSON.stringify({ ids: selectedIds }),
                      });
                      if (res.ok) {
                        setConversations(prev => prev.filter(c => !selectedIds.includes(c._id)));
                        setSelectedIds([]);
                        setExpandedConvo(null);
                      } else {
                        const err = await res.json().catch(() => ({}));
                        alert('Delete failed: ' + (err.error || res.status));
                      }
                    }}
                  >
                    Delete {selectedIds.length}
                  </button>
                )}
              </div>

              <div className={styles.list}>
                {conversations.map(convo => (
                  <div
                    key={convo._id}
                    className={`${styles.convoCard} ${selectedIds.includes(convo._id) ? styles.convoSelected : ''}`}
                  >
                    <div className={styles.convoTopRow}>
                      <input
                        type="checkbox"
                        className={styles.convoCheck}
                        checked={selectedIds.includes(convo._id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          setSelectedIds(prev =>
                            e.target.checked
                              ? [...prev, convo._id]
                              : prev.filter(id => id !== convo._id)
                          );
                        }}
                      />
                      <div
                        className={styles.convoBody}
                        onClick={() => setExpandedConvo(expandedConvo === convo._id ? null : convo._id)}
                      >
                        <div className={styles.cardHeader}>
                          <span className={styles.convoGeo}>
                            {convo.enrichment?.company
                              ? `${convo.enrichment.company}`
                              : (convo.geo || 'Unknown')}
                            {convo.enrichment?.region && ` · ${convo.enrichment.region}`}
                            {` · ${convo.device || 'desktop'}`}
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
                        <div className={styles.convoMeta}>
                          <span className={styles.convoCount}>
                            {Math.floor((convo.messages?.length || 0) / 2)} questions
                          </span>
                          {convo.enrichment?.utmSource && (
                            <span className={`${styles.convoBadge} ${styles.convoBadgeSource}`}>
                              {convo.enrichment.utmSource}
                            </span>
                          )}
                          {convo.enrichment?.asn && (
                            <span className={styles.convoBadge}>{convo.enrichment.asn}</span>
                          )}
                          {convo.enrichment?.fingerprint && (
                            <span className={styles.convoBadge} title="Device fingerprint">
                              fp:{convo.enrichment.fingerprint.slice(0, 6)}
                            </span>
                          )}
                          {convo.enrichment?.funnelEvents?.some((e) => e.type === 'ask_booking_confirmed') && (
                            <span className={`${styles.convoBadge} ${styles.convoBadgeBooked}`}>booked</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {expandedConvo === convo._id && (
                      <div className={styles.convoMessages}>
                        {convo.enrichment?.funnelEvents?.length > 0 && (
                          <div className={styles.funnelTimeline}>
                            <span className={styles.funnelTitle}>Funnel</span>
                            {convo.enrichment.funnelEvents.map((ev, i) => (
                              <div key={i} className={styles.funnelRow}>
                                <span className={styles.funnelDot} />
                                <span className={styles.funnelType}>
                                  {ev.type.replace('ask_', '').replace(/_/g, ' ')}
                                </span>
                                {ev.meta?.chip && <span className={styles.funnelMeta}>{ev.meta.chip}</span>}
                                {ev.meta?.slot && <span className={styles.funnelMeta}>{ev.meta.slot}</span>}
                                {ev.meta?.count != null && <span className={styles.funnelMeta}>{ev.meta.count} slots</span>}
                                <span className={styles.funnelTime}>
                                  {new Date(ev.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        {convo.messages?.map((m, i) => (
                          <div key={i} className={`${styles.convoMsg} ${styles[m.role]}`}>
                            <span className={styles.convoRole}>
                              {m.role === 'user' ? 'Visitor' : '🔮 AI'}
                            </span>
                            <p>{m.content}</p>
                          </div>
                        ))}
                        <button
                          className={styles.deleteConvo}
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!confirm('Delete this conversation?')) return;
                            const trustedPin = localStorage.getItem('_inbox_trusted_pin');
                            const p = trustedPin ? atob(trustedPin) : sessionStorage.getItem('_inbox_pin');
                            if (!p) { alert('Auth expired. Please reload.'); return; }
                            const res = await fetch(`/api/messages/conversations/${convo._id}`, {
                              method: 'DELETE',
                              headers: { 'x-pin': p },
                            });
                            if (res.ok) {
                              setConversations(prev => prev.filter(c => c._id !== convo._id));
                              setExpandedConvo(null);
                            } else {
                              const err = await res.json().catch(() => ({}));
                              alert('Delete failed: ' + (err.error || res.status));
                            }
                          }}
                        >
                          Delete conversation
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
