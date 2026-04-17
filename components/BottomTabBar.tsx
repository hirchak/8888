'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  {
    href: '/',
    label: 'Дашборд',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="7" height="7" rx="1.5" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: '/add',
    label: 'Додати',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="10" y1="3" x2="10" y2="17" />
        <line x1="3" y1="10" x2="17" y2="10" />
      </svg>
    ),
  },
  {
    href: '/tasks',
    label: 'Задачі',
    icon: <span className="text-base leading-none">📅</span>,
  },
  {
    href: '/brain-audit',
    label: 'Brain Audit',
    icon: <span className="text-base leading-none">🧠</span>,
  },
  {
    href: '/voice',
    label: 'Голос',
    icon: <span className="text-base leading-none">🎤</span>,
  },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  function isActive(href) {
    return pathname === href;
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/80"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center h-14">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] transition-colors duration-150 ${
              isActive(tab.href)
                ? 'text-cyan-400'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className={isActive(tab.href) ? 'drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]' : ''}>
              {tab.icon}
            </span>
            <span className="text-[10px] leading-none font-medium tracking-wide">
              {tab.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
