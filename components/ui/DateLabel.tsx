export function DateLabel({ value }: { value: string }) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return <span>Unknown date</span>;
  const formatted = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(date);
  return <time dateTime={value}>{formatted} UTC</time>;
}
