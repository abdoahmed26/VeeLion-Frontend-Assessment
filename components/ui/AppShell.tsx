'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from './Icon';
const links: { href: string; label: string; icon: IconName }[] = [
  { href: '/', label: 'Overview', icon: 'grid' },
  { href: '/tasks', label: 'Tasks', icon: 'tasks' },
  { href: '/activity', label: 'Activity', icon: 'activity' },
  { href: '/reports', label: 'Reports', icon: 'reports' },
];
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="sidebar">
        <Link href="/" className="brand" aria-label="VeeLion home">
          <span className="brand-mark">
            v<span>.</span>
          </span>
          <span>
            VeeLion<span className="brand-caption">WORKSPACE</span>
          </span>
        </Link>
        <div className="workspace-label">YOUR WORKSPACE</div>
        <nav aria-label="Main navigation" className="main-nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={'nav-link ' + (pathname === link.href ? 'active' : '')}
              aria-current={pathname === link.href ? 'page' : undefined}
            >
              <Icon name={link.icon} />
              {link.label}
              {pathname === link.href && <span className="nav-dot" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="note-symbol">✳</span>
          <p>
            A little structure.
            <br />
            <strong>A lot of progress.</strong>
          </p>
          <span>Make room for your best work.</span>
        </div>
        <div className="workspace-profile">
          <span className="avatar">V</span>
          <div>
            <strong>My workspace</strong>
            <small>Personal workspace</small>
          </div>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="topbar">
          <span>
            Workspace <span className="breadcrumb-separator">/</span>{' '}
            <strong>{links.find((link) => link.href === pathname)?.label || 'Page'}</strong>
          </span>
          <span className="topbar-label">
            <span className="green-dot" />
            One thing at a time
          </span>
        </header>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <footer className="footer">
          <span>VeeLion Workspace</span>
          <span>Good work starts with a clear view.</span>
        </footer>
      </div>
    </div>
  );
}
