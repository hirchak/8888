'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

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

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="6" height="6" rx="1.5"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5"/>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="8" y1="2" x2="8" y2="14" strokeLinecap="round"/>
      <line x1="2" y1="8" x2="14" y2="8" strokeLinecap="round"/>
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 no-underline group">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600 to-violet-600 flex items-center justify-center transition-all duration-300 group-hover:shadow-lg group-hover:shadow-cyan-600/30 group-hover:scale-105">
        <NexusIcon />
      </div>
      <span className="font-bold text-base tracking-tight text-zinc-100 group-hover:text-white transition-colors duration-200">
        AI Nexus
      </span>
    </Link>
  );
}

const NAV_ITEMS = [
  { href: '/', icon: <GridIcon />, label: 'Дашборд', hideOn: 'sm' },
  { href: '/founders', icon: <span className="text-base">⚡</span>, label: 'Фаундери', hideOn: 'lg' },
  { href: '/add', icon: <PlusIcon />, label: 'Додати', hideOn: 'sm' },
  { href: '/tasks', icon: <span className="text-base">📅</span>, label: 'Задачі', hideOn: 'lg' },
  { href: '/brain-audit', icon: <span className="text-base">🧠</span>, label: 'Brain Audit', hideOn: 'lg' },
  { href: '/voice', icon: <span className="text-base">🎤</span>, label: 'Голос', hideOn: 'lg' },
];

export function NavLinks() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href) {
    return pathname === href;
  }

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-1">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link ${isActive(item.href) ? 'nav-link-active' : 'nav-link-inactive'}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Mobile hamburger */}
      <button
        type="button"
        className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition-colors"
        onClick={() => setOpen(!open)}
        aria-label="Меню"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4l12 12M16 4L4 16" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round"/>
          </svg>
        )}
      </button>

      {/* Mobile menu drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-64 bg-zinc-950 border-l border-zinc-800/80 z-50 md:hidden flex flex-col pt-20 px-4 pb-6 gap-1 shadow-2xl">
            <button
              type="button"
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-200"
              onClick={() => setOpen(false)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4l12 12M16 4L4 16" strokeLinecap="round"/>
              </svg>
            </button>
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`nav-link ${isActive(item.href) ? 'nav-link-active' : 'nav-link-inactive'}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
