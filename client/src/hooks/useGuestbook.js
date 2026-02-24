import { useState, useEffect, useCallback } from 'react';

const API_BASE = '/api/guestbook';

export function useGuestbook() {
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiAvailable, setApiAvailable] = useState(true);

  const fetchSignatures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Failed to fetch signatures');
      const data = await res.json();
      setSignatures(data);
      setApiAvailable(true);
    } catch (err) {
      setApiAvailable(false);
      setError('Signatures will be saved when the server is connected');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitSignature = useCallback(async (data) => {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to submit signature');
      const created = await res.json();
      setSignatures(prev => [created, ...prev]);
      return created;
    } catch (err) {
      // If API is unavailable, create a local-only signature
      const localSignature = {
        ...data,
        _id: `local-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setSignatures(prev => [localSignature, ...prev]);
      setApiAvailable(false);
      return localSignature;
    }
  }, []);

  useEffect(() => {
    fetchSignatures();
  }, [fetchSignatures]);

  return {
    signatures,
    loading,
    error,
    apiAvailable,
    fetchSignatures,
    submitSignature,
  };
}
