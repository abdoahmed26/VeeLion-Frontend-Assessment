import type { ActivityLog, Task, TasksSummary } from '@/types/api';
import { isTaskStatus } from './taskStatus';
function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function validDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}
export function isTask(value: unknown): value is Task {
  return (
    object(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.completed === 'boolean' &&
    isTaskStatus(value.status) &&
    value.completed === (value.status === 'completed') &&
    validDate(value.createdAt) &&
    validDate(value.updatedAt)
  );
}
export function isActivity(value: unknown): value is ActivityLog {
  return (
    object(value) &&
    typeof value.id === 'string' &&
    validDate(value.when) &&
    (value.action === undefined || typeof value.action === 'string') &&
    (value.info === undefined || typeof value.info === 'string')
  );
}
export function isSummary(value: unknown): value is TasksSummary {
  const count = (item: unknown) => typeof item === 'number' && Number.isInteger(item) && item >= 0;
  return (
    object(value) &&
    count(value.total) &&
    count(value.recentActivityCount) &&
    object(value.byStatus) &&
    count(value.byStatus.todo) &&
    count(value.byStatus['in-progress']) &&
    count(value.byStatus.done) &&
    value.total ===
      Number(value.byStatus.todo) +
        Number(value.byStatus['in-progress']) +
        Number(value.byStatus.done)
  );
}
export function requireValid<T>(value: unknown, predicate: (value: unknown) => value is T): T {
  if (!predicate(value)) throw new Error('The server returned unexpected data. Please try again.');
  return value;
}
