'use client';
import { useState } from 'react';
import { CheckSquare, ToggleLeft, ToggleRight, Plus } from 'lucide-react';

const tabs = ['Дерево (за проєктами)', 'За напрямками', 'За виконавцями', 'За тегами'];

const projects = [
  {
    name: 'AI Nexus',
    progress: 24,
    total: 39,
    due: '15 травня',
    avatar: 'О',
    avatarColor: '#3B82F6',
    subtasks: [
      { name: 'MVP Development', done: true },
      { name: 'Integrations', done: false },
      { name: 'Go-to-Market', done: false },
    ]
  },
  {
    name: 'SEO Partner',
    progress: 12,
    total: 18,
    due: '20 травня',
    avatar: 'Ю',
    avatarColor: '#34C779',
    subtasks: [
      { name: 'Content Strategy', done: true },
      { name: 'Backlink Analysis', done: false },
    ]
  },
  {
    name: 'Agency OS',
    progress: 8,
    total: 14,
    due: '1 червня',
    avatar: 'А',
    avatarColor: '#A855F7',
    subtasks: [
      { name: 'Offer Engine', done: false },
      { name: 'Lead Engine', done: false },
    ]
  },
];

export default function TasksByProjects() {
  const [focusMode, setFocusMode] = useState(false);
  const [activeTab, setActiveTabLocal] = useState(0);

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <CheckSquare size={15} style={{ color: '#3B82F6' }} />
          Задачі
        </h2>
        <div className="flex items-center gap-3">
          {/* Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-black/20 rounded-lg p-0.5">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTabLocal(i)}
                className={`text-xs px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${activeTab === i ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Focus Mode */}
          <button
            onClick={() => setFocusMode(!focusMode)}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all"
            style={{ color: focusMode ? '#34C779' : '#8B949E', background: focusMode ? 'rgba(52,199,123,0.1)' : 'transparent' }}
          >
            {focusMode ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
            Focus
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {projects.map((proj) => (
          <div key={proj.name} className="rounded-xl p-3 transition-all" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(48,54,61,0.4)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${proj.avatarColor}33`, color: proj.avatarColor }}>
                  {proj.avatar}
                </div>
                <span className="text-sm font-medium">{proj.name}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{proj.due}</span>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ background: `${proj.avatarColor}22`, color: proj.avatarColor }}>
                  {proj.avatar}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full mb-2.5" style={{ background: 'rgba(48,54,61,0.6)' }}>
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(proj.progress / proj.total) * 100}%`, background: proj.avatarColor }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{proj.progress}/{proj.total} задач</span>
              <div className="space-x-1">
                {proj.subtasks.map(st => (
                  <span key={st.name} className={`text-xs px-1.5 py-0.5 rounded-md ${st.done ? 'tag-green' : 'text-gray-600'}`}>
                    {st.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors" style={{ border: '1px solid rgba(48,54,61,0.6)', color: '#8B949E' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#8B949E'; e.currentTarget.style.borderColor = 'rgba(48,54,61,0.6)'; }}
        >
          <Plus size={13} />
          Нова задача
        </button>
        <button className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          Всі задачі →
        </button>
      </div>
    </div>
  );
}
