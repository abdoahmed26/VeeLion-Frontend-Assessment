import { Icon, type IconName } from './Icon';
export function StatCard({
  label,
  value,
  caption,
  icon,
  accent = false,
}: {
  label: string;
  value: number;
  caption: string;
  icon: IconName;
  accent?: boolean;
}) {
  return (
    <article className={'stat-card ' + (accent ? 'stat-accent' : '')}>
      <div className="stat-heading">
        <span>{label}</span>
        <Icon name={icon} />
      </div>
      <strong className="stat-value">{value.toLocaleString('en-US')}</strong>
      <span className="stat-caption">{caption}</span>
    </article>
  );
}
