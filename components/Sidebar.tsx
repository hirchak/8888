'use client';
import { useState } from 'react';
import {
  Home, Users, FolderKanban, Lightbulb, TrendingUp,
  CheckSquare, Network, Calendar, BarChart2, Bot,
  Settings, ChevronDown, ChevronRight, Zap, CheckCircle2
} from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Головна', active: true },
  {
    icon: Users, label: 'Сутності', expandable: true,
    sub: [
      { label: 'Профіль' },
      { label: 'Люди' },
      { label: 'Проєкти' },
      { label: 'Ідеї' },
      { label: 'Можливості' },
    ]
  },
  { icon: CheckSquare, label: 'Задачі' },
  { icon: Network, label: 'Граф зв\'язків' },
  { icon: Calendar, label: 'Календар' },
  { icon: BarChart2, label: 'Звіти' },
  { icon: Bot, label: 'Пропозиції бота', badge: 7 },
  { icon: Settings, label: 'Налаштування' },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState<string | null>('Сутності');
  const [activeNav, setActiveNav] = useState('Головна');

  const toggle = (label: string) => {
    setExpanded(prev => prev === label ? null : label);
  };

  return (
    <aside className="w-56 flex flex-col h-full" style={{ background: 'rgba(13,17,23,0.9)', borderRight: '1px solid rgba(48,54,61,0.6)' }}>
      {/* Logo */}
      <div className="px-4 py-4 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #34C779, #A855F7)' }}>
          <Zap size={16} className="text-white" />
        </div>
        <span className="font-bold text-base tracking-tight">AI NEXUS</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 overflow-y-auto">
        {navItems.map((item) => (
          <div key={item.label}>
            <button
              onClick={() => {
                if (item.expandable) {
                  toggle(item.label);
                } else {
                  setActiveNav(item.label);
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm transition-all duration-150
                ${activeNav === item.label
                  ? 'sidebar-item active text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
            >
              <item.icon size={17} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center" style={{ background: '#34C779', color: '#000' }}>
                  {item.badge}
                </span>
              )}
              {item.expandable && (
                expanded === item.label
                  ? <ChevronDown size={14} />
                  : <ChevronRight size={14} />
              )}
            </button>

            {item.expandable && expanded === item.label && (
              <div className="ml-8 mb-2 flex flex-col gap-0.5">
                {item.sub?.map(sub => (
                  <button key={sub.label} className="text-xs text-gray-500 hover:text-gray-300 py-1 text-left rounded px-2 hover:bg-white/5 transition-colors">
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 space-y-2">
        <div className="glass-card p-3 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full pulse-dot" style={{ background: '#34C779' }} />
            <span className="text-xs text-gray-400">Telegram-бот</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-green-400" />
            <span className="text-xs text-green-400 font-medium">Підключено</span>
          </div>
        </div>

        <div className="glass-card p-3 rounded-xl">
          <div className="text-xs font-semibold mb-1" style={{ color: '#A855F7' }}>AI Nexus Pro</div>
          <div className="text-xs text-gray-400 mb-2">Pro (річний)</div>
          <button className="w-full text-xs py-1.5 rounded-lg border transition-colors" style={{ borderColor: 'rgba(168,85,247,0.4)', color: '#A855F7' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(168,85,247,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            Керування підпискою
          </button>
        </div>
      </div>
    </aside>
  );
}
