'use client';
import { useMemo, useState } from 'react';
import { useResource } from '@/hooks/useResource';
import { requestJson } from '@/lib/http';
import { isActivity, requireValid } from '@/lib/validation';
import type { ActivityLog } from '@/types/api';
async function loadActivity(signal: AbortSignal): Promise<ActivityLog[]> {
  const data = await requestJson<unknown>('/api/activity', { signal });
  const items = requireValid(
    data,
    (value): value is ActivityLog[] => Array.isArray(value) && value.every(isActivity),
  );
  return [...items].sort((a, b) => Date.parse(b.when) - Date.parse(a.when));
}
export function useActivity() {
  const resource = useResource(loadActivity, true);
  const [query, setQuery] = useState('');
  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();
    return (resource.data ?? []).filter(
      (item) =>
        (item.action ?? '').toLowerCase().includes(search) ||
        (item.info ?? '').toLowerCase().includes(search),
    );
  }, [resource.data, query]);
  return { ...resource, query, setQuery, visible };
}
