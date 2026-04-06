import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const TOKEN_ACTIONS = {
  EXPLORE_SECTION: 1,
  TOGGLE_THEME: 2,
  LEAVE_SIGNATURE: 5,
  CLICK_PLANET: 1,
  VIEW_PROJECT: 1,
  PLAY_MUSIC: 1,
  DISCOVER_STAR: 1,
};

const TokenContext = createContext();

export function TokenProvider({ children }) {
  const [sessionTokens, setSessionTokens] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [recentAction, setRecentAction] = useState(null);

  // Fetch global total on mount
  useEffect(() => {
    fetch('/api/tokens/stats')
      .then(r => r.json())
      .then(d => { if (d.totalTokens) setTotalTokens(d.totalTokens); })
      .catch(() => {});
  }, []);

  const earnTokens = useCallback((action) => {
    const amount = TOKEN_ACTIONS[action];
    if (!amount) return;

    setSessionTokens(prev => prev + amount);
    setTotalTokens(prev => prev + amount);
    setRecentAction({ action, amount, timestamp: Date.now() });

    // Fire and forget DB write
    fetch('/api/tokens/earn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, amount }),
    }).catch(() => {});
  }, []);

  return (
    <TokenContext.Provider value={{ sessionTokens, totalTokens, recentAction, earnTokens }}>
      {children}
    </TokenContext.Provider>
  );
}

export function useTokens() {
  const context = useContext(TokenContext);
  if (!context) throw new Error('useTokens must be used within TokenProvider');
  return context;
}
