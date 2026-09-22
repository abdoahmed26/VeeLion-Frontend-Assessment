'use client';
import { useResource } from '@/hooks/useResource';
import { requestJson } from '@/lib/http';
import { requireValid, isSummary } from '@/lib/validation';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { LoadingState, ErrorState, RefreshingState } from '@/components/ui/Feedback';
import { Icon } from '@/components/ui/Icon';
async function loadSummary(signal: AbortSignal) {
  return requireValid(
    await requestJson<unknown>('/api/reports/tasks-summary', { signal }),
    isSummary,
  );
}
export function ReportsDashboard() {
  const { data, loading, error, refresh } = useResource(loadSummary, true);
  const percent = data?.total ? Math.round((data.byStatus.done / data.total) * 100) : 0;
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="A CLEARER VIEW OF YOUR PROGRESS"
        title="Reports"
        description="The big picture, without losing the details."
        action={
          <button className="button" onClick={() => void refresh()} disabled={loading}>
            <Icon name="refresh" />
            Refresh
          </button>
        }
      />
      {error && <ErrorState message={error} onRetry={() => void refresh()} />}
      {loading && !data && <LoadingState label="Putting your report together…" />}
      {loading && data && <RefreshingState label="Refreshing reports…" />}
      {data && (
        <>
          <div className="stats-grid three">
            <StatCard
              label="Total tasks"
              value={data.total}
              caption="Across your workspace"
              icon="tasks"
            />
            <StatCard
              label="Completed tasks"
              value={data.byStatus.done}
              caption={percent + '% of all tasks'}
              icon="check"
              accent
            />
            <StatCard
              label="Recent activity"
              value={data.recentActivityCount}
              caption="Recorded in the last 7 days"
              icon="activity"
            />
          </div>
          <div className="reports-grid">
            <section className="panel report-breakdown">
              <div className="section-title">
                <h2>Tasks by status</h2>
                <span>ALL TIME</span>
              </div>
              <p className="muted">A place for every step of the process.</p>
              <div className="status-bars">
                {(
                  [
                    { key: 'todo', label: 'Pending', color: 'todo' },
                    { key: 'in-progress', label: 'In progress', color: 'progress' },
                    { key: 'done', label: 'Completed', color: 'done' },
                  ] as const
                ).map((status) => (
                  <div className="status-row" key={status.key}>
                    <div>
                      <span>
                        <i className={'status-dot ' + status.color} />
                        {status.label}
                      </span>
                      <strong>{data.byStatus[status.key]}</strong>
                    </div>
                    <div className="bar-track">
                      <div
                        className={'bar-fill ' + status.color}
                        style={{
                          width:
                            (data.total ? (data.byStatus[status.key] / data.total) * 100 : 0) + '%',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="report-note">
                Task counts reflect their current status: pending, in progress, or completed.
              </p>
            </section>
            <section className="panel progress-panel">
              <p className="eyebrow">PROGRESS AT A GLANCE</p>
              <div
                className="progress-ring"
                style={{ background: `conic-gradient(var(--green) ${percent}%, var(--line) 0)` }}
                role="img"
                aria-label={percent + '% of tasks completed'}
              >
                <div>
                  <strong>
                    {percent}
                    <span>%</span>
                  </strong>
                  <small>complete</small>
                </div>
              </div>
              <h2>
                {data.total === 0
                  ? 'Room for a fresh start.'
                  : percent === 100
                    ? 'Everything, checked off.'
                    : 'Every task is a step forward.'}
              </h2>
              <p className="muted">
                {data.total === 0
                  ? 'Your report will grow as tasks are added.'
                  : `${data.byStatus.done} of ${data.total} tasks completed.`}
              </p>
            </section>
          </div>
        </>
      )}
      <p className="page-note">
        <Icon name="clock" />
        Recent activity covers the last 7 days. Task counts include all tasks.
      </p>
    </div>
  );
}
