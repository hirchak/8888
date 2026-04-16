'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function NexusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="4" stroke="white" strokeWidth="1.5"/>
      <circle cx="9" cy="9" r="1.5" fill="white"/>
      <line x1="9" y1="1" x2="9" y2="5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="9" y1="13" x2="9" y2="17" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="1" y1="9" x2="5" y2="9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="13" y1="9" x2="17" y2="9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function GridIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="6" height="6" rx="1.5"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5"/>
    </svg>
  );
}

function PlusIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="8" y1="2" x2="8" y2="14" strokeLinecap="round"/>
      <line x1="2" y1="8" x2="14" y2="8" strokeLinecap="round"/>
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 no-underline group">
      <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center transition-all duration-200 group-hover:bg-brand-500 group-hover:shadow-glow-sm">
        <NexusIcon />
      </div>
      <span className="font-bold text-lg tracking-tight hidden sm:block text-zinc-100 group-hover:text-white transition-colors">
        AI Nexus
      </span>
    </Link>
  );
}

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      <Link
        href="/"
        className={`nav-link ${pathname === '/' ? 'nav-link-active' : 'nav-link-inactive'}`}
      >
        <GridIcon active={pathname === '/'} />
        <span className="hidden sm:inline">Дашборд</span>
      </Link>
      <Link
        href="/add"
        className={`nav-link ${pathname === '/add' ? 'nav-link-active' : 'nav-link-inactive'}`}
      >
        <PlusIcon active={pathname === '/add'} />
        <span className="hidden sm:inline">Додати</span>
      </Link>
    </nav>
  );
}