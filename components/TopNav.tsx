'use client';
import { Search, Bell, HelpCircle, ChevronDown } from 'lucide-react';

export default function TopNav() {
  return (
    <header className="h-14 flex items-center px-6 gap-4" style={{ borderBottom: '1px solid rgba(48,54,61,0.6)', background: 'rgba(13,17,23,0.8)' }}>
      {/* Greeting */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-white leading-tight">
          Вітаю, Олександр! 👋
        </h1>
        <p className="text-xs text-gray-500 leading-tight mt-0.5">Ось що відбувається в системі сьогодні</p>
      </div>

      {/* Search */}
      <div className="relative flex items-center flex-1 max-w-md">
        <Search size={15} className="absolute left-3 text-gray-500" />
        <input
          type="text"
          placeholder="Пошук по сутностях, задачах, нотатках..."
          className="w-full pl-9 pr-14 py-2 text-sm rounded-xl outline-none transition-all"
          style={{
            background: 'rgba(22,27,34,0.8)',
            border: '1px solid rgba(48,54,61,0.6)',
            color: '#F0F6FC',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(52,199,123,0.4)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(48,54,61,0.6)')}
        />
        <span className="absolute right-3 text-xs text-gray-600 font-mono">⌘ K</span>
      </div>

      {/* Icons */}
      <div className="flex items-center gap-1">
        <button className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
          <HelpCircle size={18} />
        </button>
        <button className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#34C779' }} />
        </button>
        <button className="ml-2 flex items-center gap-2 px-2 py-1.5 rounded-xl transition-colors hover:bg-white/5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #A855F7, #3B82F6)', color: '#fff' }}>
            О
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
      </div>
    </header>
  );
}
