import { useState, useEffect, useCallback } from 'react';
import { TOKEN_CONFIG } from '../lib/constants';

const POLL_INTERVAL = 30000; // 30 seconds

export function useTokenStats() {
  const [totalTokens, setTotalTokens] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [currentCause, setCurrentCause] = useState(TOKEN_CONFIG.currentCause);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/tokens/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setTotalTokens(data.totalTokens || 0);
      setTotalValue(data.totalValue || 0);
      if (data.currentCause) setCurrentCause(data.currentCause);
    } catch {
      // Graceful fallback - keep existing values or zeros
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { totalTokens, totalValue, currentCause, loading };
}
