import type { TaskStatus } from '@/types/api';
export const taskStatuses: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];
export function isTaskStatus(value: unknown): value is TaskStatus {
  return taskStatuses.some((status) => status.value === value);
}
export function taskStatusLabel(value: TaskStatus) {
  return taskStatuses.find((status) => status.value === value)!.label;
}
