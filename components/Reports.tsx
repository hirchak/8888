'use client';
import { BarChart2, FileText, ArrowRight } from 'lucide-react';

export default function Reports() {
  return (
    <div className="space-y-4">
      {/* Weekly Report */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 size={15} style={{ color: '#3B82F6' }} />
          <h2 className="font-semibold text-sm">Тижневий звіт</h2>
          <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(59,130,246,0.15)', color: '#60A5FA' }}>
            6–12 травня
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: 'Нових сутностей', value: '5', color: '#A855F7' },
            { label: 'Задач виконано', value: '12', color: '#34C779' },
            { label: 'Прогрес до цілей', value: '68%', color: '#F59E0B' },
          ].map(item => (
            <div key={item.label} className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-base font-bold mb-0.5" style={{ color: item.color }}>{item.value}</div>
              <div className="text-xs text-gray-600 leading-tight">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Mini bar chart */}
        <div className="flex items-end gap-1 h-12 mb-3">
          {[40, 65, 55, 80, 70, 90, 75].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm transition-all" style={{ height: `${h}%`, background: i === 6 ? '#34C779' : 'rgba(59,130,246,0.3)' }} />
          ))}
          <span className="text-xs text-gray-600 ml-2 self-center">тижні</span>
        </div>

        <button className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1">
          Детальніше
          <ArrowRight size={11} />
        </button>
      </div>

      {/* Daily Digest */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={15} style={{ color: '#34C779' }} />
          <h2 className="font-semibold text-sm">Daily Digest</h2>
        </div>

        <div className="space-y-2 mb-3">
          {[
            { icon: '💬', text: '3 нових транскрипти оброблено', color: '#A855F7' },
            { icon: '🔗', text: '7 нових зв\'язків в графі', color: '#3B82F6' },
            { icon: '✅', text: '5 задач позначено як виконані', color: '#34C779' },
            { icon: '📋', text: '2 сутності потребують уваги', color: '#F59E0B' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 text-xs">
              <span>{item.icon}</span>
              <span className="text-gray-300 flex-1 leading-snug">{item.text}</span>
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
            </div>
          ))}
        </div>

        <button className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1">
          Переглянути
          <ArrowRight size={11} />
        </button>
      </div>
    </div>
  );
}
