import type { Task } from '@/types/api';
import { Icon } from '@/components/ui/Icon';
import { DateLabel } from '@/components/ui/DateLabel';
import { TaskActions } from './TaskActions';
import { taskStatusLabel } from '@/lib/taskStatus';
export function TaskItem({
  task,
  busy,
  error,
  onToggle,
  onRetry,
  onEdit,
  onDelete,
}: {
  task: Task;
  busy: boolean;
  error?: string;
  onToggle: (task: Task) => void;
  onRetry: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  return (
    <li className={'task-row ' + (task.completed ? 'task-completed' : '')}>
      <button
        type="button"
        className={'task-checkbox ' + (task.completed ? 'checked' : '')}
        onClick={() => onToggle(task)}
        disabled={busy}
        aria-label={`Mark ${task.title} as ${task.completed ? 'pending' : 'completed'}`}
        aria-pressed={task.completed}
      >
        {busy ? <span className="spinner small" /> : task.completed ? <Icon name="check" /> : null}
      </button>
      <div className="task-content">
        <h3>{task.title}</h3>
        <span className="task-date">
          Updated <DateLabel value={task.updatedAt} />
        </span>
        {error && (
          <p className="inline-error" role="alert">
            {error}{' '}
            <button className="text-button" onClick={() => onRetry(task.id)} disabled={busy}>
              Retry update
            </button>
          </p>
        )}
      </div>
      <div className="task-controls">
        <span
          className={
            'badge ' +
            (task.status === 'completed'
              ? 'badge-done'
              : task.status === 'in-progress'
                ? 'badge-progress'
                : 'badge-pending')
          }
          aria-live="polite"
        >
          {busy ? 'Saving…' : taskStatusLabel(task.status)}
        </span>
        <TaskActions task={task} busy={busy} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </li>
  );
}
