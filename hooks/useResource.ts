'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '@/lib/http';
import { subscribeToWorkspaceChanges } from '@/lib/workspaceEvents';
export function useResource<T>(loader: (signal: AbortSignal) => Promise<T>, syncWorkspace = false) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setLoading(true);
    setError('');
    try {
      const result = await loader(current.signal);
      if (!current.signal.aborted) setData(result);
    } catch (cause) {
      if (!current.signal.aborted) setError(errorMessage(cause));
    } finally {
      if (!current.signal.aborted) setLoading(false);
    }
  }, [loader]);
  const cancelRead = useCallback(() => {
    controller.current?.abort();
    setLoading(false);
    setError('');
  }, []);
  useEffect(() => {
    void refresh();
    return () => controller.current?.abort();
  }, [refresh]);
  useEffect(() => {
    if (syncWorkspace) return subscribeToWorkspaceChanges(() => void refresh());
  }, [refresh, syncWorkspace]);
  return { data, setData, loading, error, refresh, cancelRead };
}
