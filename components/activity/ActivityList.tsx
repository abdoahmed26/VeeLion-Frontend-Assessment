import type { ActivityLog } from '@/types/api';
import { Icon } from '@/components/ui/Icon';
import { DateLabel } from '@/components/ui/DateLabel';
export function ActivityList({ items }: { items: ActivityLog[] }) {
  return (
    <ul className="activity-list" aria-label="Activity entries">
      {items.map((item) => (
        <li key={item.id} className="activity-row">
          <span className="activity-marker">
            <Icon name="activity" />
          </span>
          <div className="activity-content">
            <h3>{item.action || 'Activity recorded'}</h3>
            <p>{item.info || 'No additional details.'}</p>
            <DateLabel value={item.when} />
          </div>
          <span className="activity-entry-label">WORKSPACE</span>
        </li>
      ))}
    </ul>
  );
}
