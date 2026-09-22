'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { requestJson, errorMessage } from '@/lib/http';
import { isTask, requireValid } from '@/lib/validation';
import { notifyWorkspaceChanged, subscribeToWorkspaceChanges } from '@/lib/workspaceEvents';
import { useResource } from '@/hooks/useResource';
import type { Task, TaskChanges, TaskFilter, TaskStatus } from '@/types/api';

export const CREATE_TASK_KEY = '__create__';
type MutationKind = 'create' | 'edit' | 'status' | 'delete';
type MutationError = { message: string; kind: MutationKind; requestedStatus?: TaskStatus };
async function loadTasks(signal: AbortSignal): Promise<Task[]> {
  const body = await requestJson<{ data: unknown }>('/api/tasks', { signal });
  return requireValid(
    body?.data,
    (data): data is Task[] => Array.isArray(data) && data.every(isTask),
  );
}
export function useTasks() {
  const resource = useResource(loadTasks);
  const { setData, cancelRead, refresh } = resource;
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [mutationErrors, setMutationErrors] = useState<Record<string, MutationError | undefined>>(
    {},
  );
  const [notice, setNotice] = useState('');
  const pending = useRef(new Set<string>());
  const refreshQueued = useRef(false);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const fetchTasks = useCallback(() => {
    if (pending.current.size > 0) {
      refreshQueued.current = true;
      return;
    }
    refreshQueued.current = false;
    return refresh();
  }, [refresh]);
  useEffect(() => subscribeToWorkspaceChanges(() => void fetchTasks()), [fetchTasks]);
  const clearError = useCallback((key: string) => {
    setMutationErrors((previous) => ({ ...previous, [key]: undefined }));
  }, []);
  useEffect(() => {
    if (!resource.data) return;
    const tasksById = new Map(resource.data.map((task) => [task.id, task]));
    setMutationErrors((previous) => {
      let next = previous;
      for (const [id, error] of Object.entries(previous)) {
        if (error?.kind !== 'status' || !error.requestedStatus) continue;
        const task = tasksById.get(id);
        // A fresh snapshot confirms the requested state, or the task was removed.
        if (!task || task.status === error.requestedStatus) {
          if (next === previous) next = { ...previous };
          delete next[id];
        }
      }
      return next;
    });
  }, [resource.data]);
  const runMutation = useCallback(
    async (
      key: string,
      kind: MutationKind,
      operation: () => Promise<Task | undefined>,
      requestedStatus?: TaskStatus,
    ): Promise<boolean> => {
      if (pending.current.has(key)) return false;
      cancelRead();
      // Reconcile after all writes settle, including a read cancelled by this write.
      refreshQueued.current = true;
      pending.current.add(key);
      setPendingIds(new Set(pending.current));
      clearError(key);
      setNotice('');
      try {
        const task = await operation();
        if (mounted.current) {
          setData((previous) => {
            const tasks = previous ?? [];
            if (kind === 'delete') return tasks.filter((item) => item.id !== key);
            if (!task) return tasks;
            if (kind === 'create') return [task, ...tasks];
            return tasks.map((item) => (item.id === key ? task : item));
          });
          if (kind === 'create') setFilter('all');
          setNotice(
            kind === 'create'
              ? 'Task created.'
              : kind === 'delete'
                ? 'Task deleted.'
                : 'Task updated.',
          );
        }
        // Also notify if the user navigated away while this mutation was saving.
        notifyWorkspaceChanged();
        return true;
      } catch (cause) {
        if (mounted.current)
          setMutationErrors((previous) => ({
            ...previous,
            [key]: { message: errorMessage(cause), kind, requestedStatus },
          }));
        return false;
      } finally {
        pending.current.delete(key);
        if (mounted.current) {
          setPendingIds(new Set(pending.current));
          if (pending.current.size === 0 && refreshQueued.current) void fetchTasks();
        }
      }
    },
    [cancelRead, clearError, setData, fetchTasks],
  );
  const createTask = useCallback(
    (title: string, status: TaskStatus = 'pending') =>
      runMutation(CREATE_TASK_KEY, 'create', async () => {
        const body = await requestJson<{ data: unknown }>('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, status }),
        });
        return requireValid(body?.data, isTask);
      }),
    [runMutation],
  );
  const updateTask = useCallback(
    (id: string, changes: TaskChanges) =>
      runMutation(
        id,
        'title' in changes ? 'edit' : 'status',
        async () => {
          const body = await requestJson<{ data: unknown }>(
            '/api/tasks/' + encodeURIComponent(id),
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(changes),
            },
          );
          return requireValid(body?.data, isTask);
        },
        changes.status ??
          (changes.completed === undefined
            ? undefined
            : changes.completed
              ? 'completed'
              : 'pending'),
      ),
    [runMutation],
  );
  const deleteTask = useCallback(
    (id: string) =>
      runMutation(id, 'delete', async () => {
        await requestJson<void>('/api/tasks/' + encodeURIComponent(id), { method: 'DELETE' });
        return undefined;
      }),
    [runMutation],
  );
  const updateTaskStatus = useCallback(
    (id: string, status: TaskStatus) => updateTask(id, { status }),
    [updateTask],
  );
  const retryTaskStatus = useCallback(
    (id: string) => {
      const error = mutationErrors[id];
      if (error?.kind === 'status' && error.requestedStatus) {
        return updateTaskStatus(id, error.requestedStatus);
      }
    },
    [mutationErrors, updateTaskStatus],
  );
  const tasks = useMemo(
    () =>
      [...(resource.data ?? [])].sort(
        (a, b) =>
          Date.parse(b.createdAt) - Date.parse(a.createdAt) ||
          (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
      ),
    [resource.data],
  );
  const filteredTasks = useMemo(
    () => tasks.filter((task) => filter === 'all' || task.status === filter),
    [tasks, filter],
  );
  const updateErrors = Object.fromEntries(
    Object.entries(mutationErrors)
      .filter(([, error]) => error?.kind === 'status')
      .map(([id, error]) => [id, error!.message]),
  );
  return {
    tasks,
    filteredTasks,
    filter,
    setFilter,
    loading: resource.loading,
    error: resource.error,
    hasLoaded: resource.data !== null,
    fetchTasks,
    pendingIds,
    updateErrors,
    mutationErrors,
    clearError,
    notice,
    createTask,
    updateTask,
    updateTaskStatus,
    retryTaskStatus,
    deleteTask,
  };
}
