'use client';
import { useEffect, useRef } from 'react';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

const tasks = [
  { id: 1, text: 'Зустріч з командою AI Nexus', project: 'AI Nexus', done: true, tagClass: 'tag-blue' },
  { id: 2, text: "Рев'ют транскрипту", project: 'Dev', done: true, tagClass: 'tag-purple' },
  { id: 3, text: 'Підготувати фінансовий звіт', project: 'Finance', done: false, tagClass: 'tag-amber' },
  { id: 4, text: 'Дзвінок з партнерами', project: 'Partners', done: false, tagClass: 'tag-green' },
  { id: 5, text: 'Стратегічна сесія', project: 'Strategy', done: false, tagClass: 'tag-blue' },
];

export default function MyFocusToday() {
  const ringRef = useRef<SVGCircleElement>(null);

  const done = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = done / total;

  useEffect(() => {
    if (ringRef.current) {
      const offset = circumference * (1 - progress);
      ringRef.current.style.strokeDashoffset = String(offset);
    }
  }, [progress, circumference]);

  return (
    <div className="glass-card p-4 mb-4">
      <h2 className="font-semibold text-sm mb-4">Мій фокус на сьогодні</h2>

      <div className="flex items-center gap-5 mb-4">
        {/* Progress Ring */}
        <div className="relative flex-shrink-0">
          <svg width="108" height="108" className="-rotate-90">
            <circle cx="54" cy="54" r={radius} fill="none" stroke="rgba(48,54,61,0.6)" strokeWidth="8" />
            <circle
              ref={ringRef}
              cx="54"
              cy="54"
              r={radius}
              fill="none"
              stroke="#34C779"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className="progress-ring-circle"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-white">{done}/{total}</span>
            <span className="text-xs text-gray-500">виконано</span>
          </div>
        </div>

        {/* Tasks summary */}
        <div className="flex-1 space-y-2">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center gap-2">
              {task.done ? (
                <CheckCircle2 size={15} className="text-green-400 flex-shrink-0" />
              ) : (
                <Circle size={15} className="text-gray-600 flex-shrink-0" />
              )}
              <span className={`text-xs leading-tight ${task.done ? 'text-gray-600 line-through' : 'text-gray-300'}`}>
                {task.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1 mt-1">
        Показати всі задачі ({total})
        <ArrowRight size={11} />
      </button>
    </div>
  );
}
