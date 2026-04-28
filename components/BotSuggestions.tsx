'use client';
import { useState } from 'react';
import { Bot, X, ArrowRight } from 'lucide-react';

const suggestions = [
  {
    id: 1,
    title: 'Нова людина з транскрипту',
    desc: 'Олег Петренко — CFO, згадувався в розмові з інвестором. Додати до сутностей?',
    type: 'person',
    tag: 'Людина',
    tagClass: 'tag-purple',
  },
  {
    id: 2,
    title: 'Зв\'язок: Ідея → Проєкт',
    desc: 'AI-assistant зв\'язана з AI Nexus. Позначити як підпроєкт?',
    type: 'link',
    tag: 'Зв\'язок',
    tagClass: 'tag-blue',
  },
  {
    id: 3,
    title: 'Можливість: AWS Credits',
    desc: 'Команда знайшла програму гранту для стартапів. Додати до Opportunities?',
    type: 'opportunity',
    tag: 'Можливість',
    tagClass: 'tag-green',
  },
];

export default function BotSuggestions() {
  const [dismissed, setDismissed] = useState<number[]>([]);
  const visible = suggestions.filter(s => !dismissed.includes(s.id));

  return (
    <div className="glass-card p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(52,199,123,0.15)' }}>
            <Bot size={15} style={{ color: '#34C779' }} />
          </div>
          <h2 className="font-semibold text-sm">Пропозиції від бота</h2>
          <span className="text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center" style={{ background: '#34C779', color: '#000' }}>
            {visible.length}
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        {visible.map((s) => (
          <div key={s.id} className="p-3 rounded-xl transition-all duration-200" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(48,54,61,0.4)' }}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.tagClass}`}>{s.tag}</span>
                </div>
                <div className="text-sm font-medium text-white mb-1 leading-snug">{s.title}</div>
                <div className="text-xs text-gray-500 leading-relaxed">{s.desc}</div>
              </div>
              <button
                onClick={() => setDismissed(prev => [...prev, s.id])}
                className="text-gray-600 hover:text-gray-400 mt-0.5 shrink-0 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button className="btn-view text-xs">Переглянути</button>
              <button className="btn-confirm text-xs flex items-center gap-1">
                Підтвердити
                <ArrowRight size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {visible.length > 0 && (
        <button className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1">
          Показати ще 4 пропозиції
          <ArrowRight size={11} />
        </button>
      )}
    </div>
  );
}
