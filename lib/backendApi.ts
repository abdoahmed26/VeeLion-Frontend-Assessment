import { BACKEND_BASE_URL } from '@/lib/constants';
import { ApiError, requestJson } from '@/lib/http';
import { isActivity, isSummary, isTask } from '@/lib/validation';
import type { ActivityLog, Task, TaskChanges, TasksSummary } from '@/types/api';

async function backendRequest<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    return await requestJson<T>(BACKEND_BASE_URL + path, {
      ...init,
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('The service is unavailable. Please try again shortly.', 503);
  }
}
function invalidResponse(): never {
  throw new ApiError('The service returned unexpected data.', 502);
}
export async function getTasksFromBackend(): Promise<Task[]> {
  const body = await backendRequest<{ data?: unknown }>('/tasks');
  if (!Array.isArray(body?.data) || !body.data.every(isTask)) return invalidResponse();
  return body.data;
}
export async function getTaskFromBackend(taskId: string): Promise<Task> {
  const body = await backendRequest<{ data?: unknown }>('/tasks/' + encodeURIComponent(taskId));
  if (!isTask(body?.data)) return invalidResponse();
  return body.data;
}
export async function createTaskInBackend(payload: TaskChanges): Promise<Task> {
  const body = await backendRequest<{ data?: unknown }>('/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!isTask(body?.data)) return invalidResponse();
  return body.data;
}
export async function deleteTaskInBackend(taskId: string): Promise<void> {
  await backendRequest<void>('/tasks/' + encodeURIComponent(taskId), { method: 'DELETE' });
}
export async function updateTaskInBackend(taskId: string, changes: TaskChanges): Promise<Task> {
  const body = await backendRequest<{ data?: unknown }>('/tasks/' + encodeURIComponent(taskId), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  });
  if (!isTask(body?.data)) return invalidResponse();
  return body.data;
}
export async function getActivityFromBackend(): Promise<ActivityLog[]> {
  const body = await backendRequest<unknown>('/activity');
  if (!Array.isArray(body) || !body.every(isActivity)) return invalidResponse();
  return body;
}
export async function getSummaryFromBackend(): Promise<TasksSummary> {
  const body = await backendRequest<unknown>('/reports/tasks-summary');
  if (!isSummary(body)) return invalidResponse();
  return body;
}
