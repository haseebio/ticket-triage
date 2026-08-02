'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearToken } from '@/lib/auth';

const LINKS = [{ href: '/dashboard', label: 'Tickets' }];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    clearToken();
    router.push('/login');
  }

  return (
    <aside className="glass flex h-screen w-56 flex-col justify-between border-r border-line px-4 py-6">
      <div>
        <div className="mb-8 bg-brand-gradient bg-clip-text px-2 font-mono text-sm font-semibold tracking-wide text-transparent">
          TRIAGE
        </div>
        <nav className="flex flex-col gap-1">
          {LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-md px-3 py-2 text-sm transition-colors ${
                  active ? 'bg-primary-soft text-primary' : 'text-fog hover:text-ink'
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                )}
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="rounded-md px-3 py-2 text-left text-sm text-fog transition-colors hover:text-ink"
      >
        Log out
      </button>
    </aside>
  );
}
