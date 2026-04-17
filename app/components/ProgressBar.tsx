'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const LEVELS = [
  { name: 'Новачок', icon: '🌱', min: 0, max: 10 },
  { name: 'Дослідник', icon: '🔍', min: 11, max: 25 },
  { name: 'Архітектор', icon: '🏗️', min: 26, max: 50 },
  { name: 'Майстер', icon: '🎓', min: 51, max: 100 },
  { name: 'Гуру', icon: '🧙', min: 101, max: Infinity },
];

function getLevel(entityCount: number) {
  if (entityCount <= 10) return LEVELS[0];
  if (entityCount <= 25) return LEVELS[1];
  if (entityCount <= 50) return LEVELS[2];
  if (entityCount <= 100) return LEVELS[3];
  return LEVELS[4];
}

function getProgressToNext(entityCount: number): { percent: number; nextLevel: typeof LEVELS[0] | null } {
  const current = getLevel(entityCount);
  const idx = LEVELS.indexOf(current);

  if (idx === LEVELS.length - 1) {
    return { percent: 100, nextLevel: null };
  }

  const next = LEVELS[idx + 1];
  const range = current.max - current.min;
  const progress = entityCount - current.min;
  const percent = Math.min(100, Math.round((progress / range) * 100));

  return { percent, nextLevel: next };
}

interface ProgressBarProps {
  entityCount?: number;
}

export default function ProgressBar({ entityCount }: ProgressBarProps) {
  const [count, setCount] = useState(entityCount ?? 0);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (entityCount === undefined) {
      api.getStats().then(s => {
        const total = (s.people ?? 0) + (s.projects ?? 0) + (s.ideas ?? 0) + (s.opportunities ?? 0);
        setCount(total);
        setTimeout(() => setAnimated(true), 100);
      }).catch(() => {});
    } else {
      setCount(entityCount);
      setTimeout(() => setAnimated(true), 100);
    }
  }, [entityCount]);

  const level = getLevel(count);
  const { percent, nextLevel } = getProgressToNext(count);
  const levelIdx = LEVELS.indexOf(level);

  return (
    <div className="cyber-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl shrink-0">{level.icon}</span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-zinc-300">Ваш рівень</div>
            <div className="text-lg font-bold text-white truncate">{level.name}</div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-3xl font-bold text-white leading-none">{count}</div>
          <div className="text-xs text-zinc-500">сутностей</div>
        </div>
      </div>

      {/* Progress bar track */}
      <div className="relative mb-3">
        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: animated ? `${percent}%` : '0%',
              background: 'linear-gradient(90deg, #06b6d4, #8b5cf6)',
              boxShadow: '0 0 12px rgba(6, 182, 212, 0.5), 0 0 4px rgba(139, 92, 246, 0.5)',
            }}
          />
        </div>
        {/* Level dots */}
        <div className="flex justify-between mt-2 overflow-hidden">
          {LEVELS.map((l, i) => (
            <div key={l.name} className="flex flex-col items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i <= levelIdx ? 'bg-cyan-400 shadow-md shadow-cyan-400/50' : 'bg-zinc-700'
                }`}
              />
              <span className={`text-[10px] ${i <= levelIdx ? 'text-cyan-400' : 'text-zinc-600'}`}>
                {l.icon}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer label */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-500">
          {nextLevel
            ? `До ${nextLevel.icon} ${nextLevel.name}: ${nextLevel.max - count + 1} сутностей`
            : 'Максимальний рівень!'}
        </span>
        <span className="text-cyan-400 font-semibold">{percent}%</span>
      </div>
    </div>
  );
}
