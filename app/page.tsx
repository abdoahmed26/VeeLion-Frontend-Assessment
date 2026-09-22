import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { Icon, type IconName } from '@/components/ui/Icon';
const modules: {
  number: string;
  title: string;
  text: string;
  href: string;
  icon: IconName;
  label: string;
}[] = [
  {
    number: '01',
    title: 'Make things happen.',
    text: 'Find your focus. See what’s pending and check off the work you’ve finished.',
    href: '/tasks',
    icon: 'tasks',
    label: 'Open tasks',
  },
  {
    number: '02',
    title: 'Stay in the loop.',
    text: 'Follow the details in your activity feed and find the moments that matter.',
    href: '/activity',
    icon: 'activity',
    label: 'View activity',
  },
  {
    number: '03',
    title: 'See the bigger picture.',
    text: 'Turn your task counts and recent activity into a clear view of progress.',
    href: '/reports',
    icon: 'reports',
    label: 'Explore reports',
  },
];
export default function HomePage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="A LITTLE CLARITY GOES A LONG WAY"
        title="Your work, in perspective."
        description="A calm place to organize your tasks and keep moving forward."
      />
      <section className="welcome-panel">
        <div>
          <span className="welcome-tag">
            <span className="green-dot" /> YOUR NEXT STEP STARTS HERE
          </span>
          <h2>
            Less noise.
            <br />
            More <em>progress.</em>
          </h2>
          <p>
            Keep the details together.
            <br />
            Make space for what matters.
          </p>
          <Link className="button button-light" href="/tasks">
            Go to my tasks <Icon name="arrow" />
          </Link>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="art-card">
            <span className="art-check">
              <Icon name="check" />
            </span>
            <span className="art-line" />
            <span className="art-line short" />
          </div>
          <div className="art-small-card">
            <Icon name="reports" />
            <span>One step forward.</span>
          </div>
          <span className="art-star">✳</span>
        </div>
      </section>
      <div className="section-title">
        <h2>Everything in its place</h2>
        <span>YOUR WORKSPACE, CONNECTED</span>
      </div>
      <div className="module-grid">
        {modules.map((module) => (
          <Link href={module.href} className="module-card" key={module.href}>
            <div className="module-top">
              <span className="module-icon">
                <Icon name={module.icon} />
              </span>
              <span className="module-number">{module.number}</span>
            </div>
            <h3>{module.title}</h3>
            <p>{module.text}</p>
            <span className="module-link">
              {module.label}
              <Icon name="arrow" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
