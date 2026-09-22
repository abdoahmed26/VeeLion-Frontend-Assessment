'use client';
import { useEffect, useId, useRef, useState } from 'react';
import type { Task } from '@/types/api';

export function TaskActions({
  task,
  busy,
  onEdit,
  onDelete,
}: {
  task: Task;
  busy: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const firstAction = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (busy) setOpen(false);
  }, [busy]);

  useEffect(() => {
    if (!open) return;
    firstAction.current?.focus();
    function dismiss(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);

  function select(action: (task: Task) => void) {
    setOpen(false);
    trigger.current?.focus();
    action(task);
  }

  return (
    <div
      className="task-actions"
      ref={container}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="button task-actions-trigger"
        aria-label={'Actions for ' + task.title}
        aria-expanded={open && !busy}
        aria-controls={id}
        disabled={busy}
        onClick={() => setOpen((value) => !value)}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <circle cx="10" cy="4" r="1.7" />
          <circle cx="10" cy="10" r="1.7" />
          <circle cx="10" cy="16" r="1.7" />
        </svg>
      </button>
      {open && !busy && (
        <div
          id={id}
          className="task-actions-dropdown"
          role="group"
          aria-label={'Actions for ' + task.title}
        >
          <button
            ref={firstAction}
            type="button"
            aria-label={'Edit ' + task.title}
            onClick={() => select(onEdit)}
          >
            Edit
          </button>
          <button
            type="button"
            className="delete-action"
            aria-label={'Delete ' + task.title}
            onClick={() => select(onDelete)}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
