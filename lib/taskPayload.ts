import { ApiError } from '@/lib/http';
import type { TaskChanges } from '@/types/api';
import { isTaskStatus } from './taskStatus';
export async function readTaskPayload(request: Request, create = false): Promise<TaskChanges> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    throw new ApiError('Body must contain valid JSON.', 400);
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload))
    throw new ApiError('Body must be a JSON object.', 400);
  const fields = Object.keys(payload);
  if (!fields.length || fields.some((key) => !['title', 'status', 'completed'].includes(key)))
    throw new ApiError('Provide only title, status, and/or completed.', 400);
  const values = payload as Record<string, unknown>;
  const normalized: TaskChanges = {};
  if (create || 'title' in values) {
    if (typeof values.title !== 'string' || !values.title.trim())
      throw new ApiError('Title cannot be empty.', 400);
    normalized.title = values.title.trim();
  }
  if ('completed' in values) {
    if (typeof values.completed !== 'boolean')
      throw new ApiError('Completed must be boolean.', 400);
    normalized.completed = values.completed;
  }
  if ('status' in values) {
    if (!isTaskStatus(values.status))
      throw new ApiError('Status must be pending, in-progress, or completed.', 400);
    if ('completed' in values && values.completed !== (values.status === 'completed'))
      throw new ApiError('Status and completed must agree.', 400);
    normalized.status = values.status;
  }
  return normalized;
}
