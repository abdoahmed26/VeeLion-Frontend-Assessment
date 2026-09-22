'use client';
import { useEffect, useId, useRef, useState } from 'react';
import type { Task, TaskStatus } from '@/types/api';
import { taskStatuses } from '@/lib/taskStatus';
export type TaskDialogState = { kind: 'create' } | { kind: 'edit' | 'delete'; task: Task };
export function TaskDialog({
  state,
  busy,
  error,
  onClose,
  onSave,
}: {
  state: TaskDialogState;
  busy: boolean;
  error?: string;
  onClose: () => void;
  onSave: (title: string, status: TaskStatus) => Promise<boolean>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const inputId = useId();
  const statusId = useId();
  const descriptionId = useId();
  const errorId = useId();
  const [title, setTitle] = useState(state.kind === 'create' ? '' : state.task.title);
  const [status, setStatus] = useState<TaskStatus>(
    state.kind === 'create' ? 'pending' : state.task.status,
  );
  const [validationError, setValidationError] = useState('');
  const deleting = state.kind === 'delete';
  useEffect(() => {
    const node = dialog.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    node?.showModal();
    return () => {
      node?.close();
      const target = previousFocus?.isConnected
        ? previousFocus
        : document.getElementById('new-task-button');
      target?.focus();
    };
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!deleting && !title.trim()) {
      setValidationError('Enter a task title.');
      return;
    }
    if (await onSave(title.trim(), status)) onClose();
  }
  return (
    <dialog
      ref={dialog}
      className="task-dialog"
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <form onSubmit={(event) => void submit(event)} noValidate aria-busy={busy}>
        <p className="eyebrow">{deleting ? 'MAKE ROOM FOR WHAT’S NEXT' : 'ONE STEP AT A TIME'}</p>
        <h2 id={headingId}>
          {deleting ? 'Delete task?' : state.kind === 'create' ? 'Create a task' : 'Edit task'}
        </h2>
        <p id={descriptionId} className="dialog-description">
          {deleting
            ? '“' +
              state.task.title +
              '” will be removed. Its activity history will stay in your feed.'
            : state.kind === 'create'
              ? 'Give your next step a clear title and choose its status.'
              : 'Update the task title and status.'}
        </p>
        {!deleting && (
          <div className="form-field">
            <label htmlFor={inputId}>Task title</label>
            <input
              id={inputId}
              name="title"
              className="task-title-input"
              value={title}
              autoFocus
              required
              disabled={busy}
              aria-invalid={!!validationError}
              aria-describedby={validationError ? errorId : undefined}
              onChange={(event) => {
                setTitle(event.target.value);
                setValidationError('');
              }}
            />
          </div>
        )}
        {!deleting && (
          <div className="form-field">
            <label htmlFor={statusId}>Task status</label>
            <select
              id={statusId}
              name="status"
              className="task-title-input"
              value={status}
              disabled={busy}
              onChange={(event) => setStatus(event.target.value as TaskStatus)}
            >
              {taskStatuses.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
        {(validationError || error) && (
          <p id={errorId} className="inline-error" role="alert">
            {validationError || error}
          </p>
        )}
        <div className="dialog-actions">
          <button
            type="button"
            className="button"
            autoFocus={deleting}
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={'button ' + (deleting ? 'button-danger' : 'button-primary')}
            disabled={busy}
          >
            {busy
              ? deleting
                ? 'Deleting…'
                : 'Saving…'
              : deleting
                ? 'Delete task'
                : state.kind === 'create'
                  ? 'Create task'
                  : 'Save changes'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
