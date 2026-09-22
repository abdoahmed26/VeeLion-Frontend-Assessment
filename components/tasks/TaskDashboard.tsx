'use client';
import { useState } from 'react';
import { useTasks, CREATE_TASK_KEY } from '@/hooks/useTasks';
import { StatusFilter } from './StatusFilter';
import { TaskList } from './TaskList';
import { TaskDialog, type TaskDialogState } from './TaskDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { LoadingState, ErrorState, RefreshingState } from '@/components/ui/Feedback';
import { Icon } from '@/components/ui/Icon';
export function TaskDashboard() {
  const {
    tasks,
    filteredTasks,
    filter,
    setFilter,
    loading,
    error,
    hasLoaded,
    fetchTasks,
    pendingIds,
    updateErrors,
    updateTaskStatus,
    retryTaskStatus,
    mutationErrors,
    clearError,
    notice,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks();
  const [dialog, setDialog] = useState<TaskDialogState | null>(null);
  const completed = tasks.filter((task) => task.status === 'completed').length;
  const pending = tasks.filter((task) => task.status === 'pending').length;
  const inProgress = tasks.filter((task) => task.status === 'in-progress').length;
  const dialogKey = dialog && dialog.kind !== 'create' ? dialog.task.id : CREATE_TASK_KEY;
  function openDialog(state: TaskDialogState) {
    clearError(state.kind === 'create' ? CREATE_TASK_KEY : state.task.id);
    setDialog(state);
  }
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="FOCUS ON WHAT’S NEXT"
        title="Task Dashboard"
        description="Small steps, meaningful progress. Keep your work moving."
        action={
          <div className="header-actions">
            <button
              className="button"
              onClick={() => void fetchTasks()}
              disabled={loading || pendingIds.size > 0}
            >
              <Icon name="refresh" />
              Refresh
            </button>
            <button
              id="new-task-button"
              className="button button-primary"
              disabled={!hasLoaded || loading}
              onClick={() => openDialog({ kind: 'create' })}
            >
              <span aria-hidden="true">+</span>
              New task
            </button>
          </div>
        }
      />
      {hasLoaded && (
        <div className="stats-grid four">
          <StatCard
            label="Total tasks"
            value={tasks.length}
            caption="Everything on your list"
            icon="tasks"
          />
          <StatCard
            label="Pending"
            value={pending}
            caption="Ready for your attention"
            icon="clock"
          />
          <StatCard
            label="In progress"
            value={inProgress}
            caption="Work underway"
            icon="activity"
          />
          <StatCard
            label="Completed"
            value={completed}
            caption="One step further"
            icon="check"
            accent
          />
        </div>
      )}
      {notice && (
        <p className="success-notice" role="status">
          <Icon name="check" />
          {notice}
        </p>
      )}
      {error && <ErrorState message={error} onRetry={() => void fetchTasks()} />}
      <section className="panel task-panel" aria-label="Your tasks">
        <div className="panel-toolbar">
          <StatusFilter
            value={filter}
            onChange={setFilter}
            counts={{ all: tasks.length, pending, 'in-progress': inProgress, completed }}
          />
          <span className="toolbar-caption">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>
        {loading && !hasLoaded && <LoadingState label="Loading your tasks…" />}
        {loading && hasLoaded && <RefreshingState label="Refreshing tasks…" />}
        {hasLoaded && (
          <TaskList
            tasks={filteredTasks}
            pendingIds={pendingIds}
            updateErrors={updateErrors}
            onToggle={(task) =>
              void updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')
            }
            onRetry={(id) => void retryTaskStatus(id)}
            onEdit={(task) => openDialog({ kind: 'edit', task })}
            onDelete={(task) => openDialog({ kind: 'delete', task })}
          />
        )}
      </section>
      <p className="page-note">
        <Icon name="check" />
        Task changes appear in your Activity Feed and Reports.
      </p>
      {dialog && (
        <TaskDialog
          state={dialog}
          busy={pendingIds.has(dialogKey)}
          error={mutationErrors[dialogKey]?.message}
          onClose={() => {
            clearError(dialogKey);
            setDialog(null);
          }}
          onSave={(title, status) =>
            dialog.kind === 'create'
              ? createTask(title, status)
              : dialog.kind === 'edit'
                ? updateTask(dialog.task.id, { title, status })
                : deleteTask(dialog.task.id)
          }
        />
      )}
    </div>
  );
}
