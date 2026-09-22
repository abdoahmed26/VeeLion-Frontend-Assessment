import { Icon } from './Icon';
export function RefreshingState({ label = 'Refreshing…' }: { label?: string }) {
  return (
    <p className="refresh-notice" role="status">
      <span className="spinner small" />
      {label}
    </p>
  );
}
export function LoadingState({ label = 'Loading your workspace…' }: { label?: string }) {
  return (
    <div className="state-panel" role="status">
      <span className="spinner" />
      <p>{label}</p>
    </div>
  );
}
export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="error-panel" role="alert">
      <div>
        <strong>We couldn’t complete that request.</strong>
        <p>{message}</p>
      </div>
      <button className="button" onClick={onRetry}>
        Try again <Icon name="refresh" />
      </button>
    </div>
  );
}
export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="state-panel">
      <span className="empty-icon">
        <Icon name="tasks" />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
