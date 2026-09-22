import type { Task } from '@/types/api';
import { TaskItem } from './TaskItem';
import { EmptyState } from '@/components/ui/Feedback';
export function TaskList({
  tasks,
  pendingIds,
  updateErrors,
  onToggle,
  onRetry,
  onEdit,
  onDelete,
}: {
  tasks: Task[];
  pendingIds: Set<string>;
  updateErrors: Record<string, string>;
  onToggle: (task: Task) => void;
  onRetry: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  if (!tasks.length)
    return (
      <EmptyState
        title="A clear space."
        description="Create a task to get started, or try another filter."
      />
    );
  return (
    <ul className="task-list" aria-label="Task list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          busy={pendingIds.has(task.id)}
          error={updateErrors[task.id]}
          onToggle={onToggle}
          onRetry={onRetry}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
