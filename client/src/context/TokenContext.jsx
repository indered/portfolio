import { createContext, useContext, useState, useCallback } from 'react';

const TOKEN_ACTIONS = {
  EXPLORE_SECTION: 1,
  TOGGLE_THEME: 2,
  LEAVE_SIGNATURE: 5,
  CLICK_PLANET: 1,
  VIEW_PROJECT: 1,
  PLAY_MUSIC: 1,
};

const TokenContext = createContext();

export function TokenProvider({ children }) {
  const [sessionTokens, setSessionTokens] = useState(0);
  const [recentAction, setRecentAction] = useState(null);
  const [earnedActions, setEarnedActions] = useState(new Set());

  const earnTokens = useCallback((action) => {
    const amount = TOKEN_ACTIONS[action];
    if (!amount) return;

    // Prevent duplicate earnings for section explores (one-time per section)
    if (action === 'EXPLORE_SECTION') {
      // Allow multiple section explores
    }

    setSessionTokens(prev => prev + amount);
    setRecentAction({ action, amount, timestamp: Date.now() });

    // Fire API call to record (fire and forget)
    fetch('/api/tokens/earn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, amount }),
    }).catch(() => {}); // Silent fail
  }, []);

  return (
    <TokenContext.Provider value={{ sessionTokens, recentAction, earnTokens }}>
      {children}
    </TokenContext.Provider>
  );
}

export function useTokens() {
  const context = useContext(TokenContext);
  if (!context) throw new Error('useTokens must be used within TokenProvider');
  return context;
}
