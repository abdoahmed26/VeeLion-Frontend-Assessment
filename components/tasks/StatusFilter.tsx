import type { TaskFilter } from '@/types/api';
import { taskStatuses } from '@/lib/taskStatus';
const filters: { label: string; value: TaskFilter }[] = [
  { label: 'All tasks', value: 'all' },
  ...taskStatuses,
];
export function StatusFilter({
  value,
  onChange,
  counts,
}: {
  value: TaskFilter;
  onChange: (value: TaskFilter) => void;
  counts: Record<TaskFilter, number>;
}) {
  return (
    <div className="filter-group" role="group" aria-label="Filter tasks by status">
      {filters.map((filter) => (
        <button
          key={filter.value}
          type="button"
          className={'filter-button ' + (value === filter.value ? 'active' : '')}
          onClick={() => onChange(filter.value)}
          aria-pressed={value === filter.value}
        >
          {filter.label}
          <span>{counts[filter.value]}</span>
        </button>
      ))}
    </div>
  );
}
