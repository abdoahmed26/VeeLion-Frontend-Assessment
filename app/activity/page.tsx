'use client';
import { useActivity } from '@/hooks/useActivity';
import { ActivityList } from '@/components/activity/ActivityList';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState, ErrorState, EmptyState, RefreshingState } from '@/components/ui/Feedback';
import { Icon } from '@/components/ui/Icon';
export default function ActivityPage() {
  const { data, loading, error, refresh, query, setQuery, visible } = useActivity();
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="THE DETAILS TELL THE STORY"
        title="Activity Feed"
        description="Your workspace history, all in one place."
        action={
          <button className="button" onClick={() => void refresh()} disabled={loading}>
            <Icon name="refresh" />
            Refresh
          </button>
        }
      />
      <section className="activity-banner">
        <span className="banner-icon">
          <Icon name="activity" />
        </span>
        <div>
          <h2>Every step has a story.</h2>
          <p>Browse recorded activity or search for a specific moment.</p>
        </div>
        <span className="banner-decoration" aria-hidden="true">
          ↗
        </span>
      </section>
      {error && <ErrorState message={error} onRetry={() => void refresh()} />}
      <section className="panel">
        <div className="activity-toolbar">
          <div>
            <h2>Workspace activity</h2>
            <p className="muted" role="status">
              {data ? `${data.length} total · ${visible.length} visible` : 'Your activity timeline'}
            </p>
          </div>
          <div className="search-field">
            <label className="sr-only" htmlFor="activity-search">
              Search activity
            </label>
            <Icon name="search" />
            <input
              id="activity-search"
              placeholder="Search activity…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
            />
          </div>
        </div>
        {loading && !data && <LoadingState label="Loading activity…" />}
        {loading && data && <RefreshingState label="Refreshing activity…" />}
        {data &&
          (visible.length ? (
            <ActivityList items={visible} />
          ) : (
            <EmptyState
              title={data.length ? 'No matching activity' : 'Your story starts here'}
              description={
                data.length
                  ? 'Try another search to find what you’re looking for.'
                  : 'Recorded activity will appear here when it’s added.'
              }
            />
          ))}
      </section>
      <p className="page-note">
        <Icon name="clock" />
        Most recent first. All timestamps are shown in UTC.
      </p>
    </div>
  );
}
