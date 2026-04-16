'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const PRIORITY_COLORS = {
  high: 'bg-red-900/50 text-red-300 border border-red-800/40',
  medium: 'bg-amber-900/50 text-amber-300 border border-amber-800/40',
  low: 'bg-zinc-700/50 text-zinc-300 border border-zinc-600/40',
};

function formatDaysAgo(ts) {
  if (!ts) return 'невідомо';
  const days = Math.floor((Date.now() - new Date(ts).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'сьогодні';
  if (days === 1) return '1 день';
  return `${days} днів`;
}

function DeadCard({ opp, onActivate }) {
  return (
    <div className="cyber-card group relative">
      <div className="absolute top-3 right-3">
        <span className="tag bg-red-900/50 text-red-300 border border-red-800/40 text-xs">🦴 Dead Capital</span>
      </div>
      <div className="pr-16">
        <div className="font-semibold text-zinc-100 mb-1">{opp.name}</div>
        {opp.description && (
          <div className="text-sm text-zinc-500 truncate mb-2">{opp.description}</div>
        )}
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-red-400/70">
          🔴 не використовувалась {formatDaysAgo(opp.lastUsedAt)}
        </span>
        <button
          onClick={() => onActivate(opp.id)}
          className="btn-primary text-xs py-1.5 px-3"
        >
          Активувати
        </button>
      </div>
    </div>
  );
}

export default function DeadCapital() {
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    api.listOpportunities().then(setOpportunities).catch(() => {});
  }, []);

  const deadOpps = opportunities.filter(opp => {
    if (!opp.lastUsedAt || opp.status === 'closed') return false;
    const days = (Date.now() - new Date(opp.lastUsedAt).getTime()) / (1000 * 60 * 60 * 24);
    return days > 30;
  });

  if (deadOpps.length === 0) return null;

  async function handleActivate(id) {
    await api.updateOpportunity(id, { lastUsedAt: new Date().toISOString() });
    setOpportunities(prev =>
      prev.map(o => o.id === id ? { ...o, lastUsedAt: new Date().toISOString() } : o)
    );
  }

  return (
    <section>
      <h2 className="section-heading mb-4 flex items-center gap-2">
        <span>🦴</span>
        <span className="gradient-text">Dead Capital</span>
        <span className="tag bg-red-900/50 text-red-300 border border-red-800/40 ml-2">{deadOpps.length}</span>
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {deadOpps.map(opp => (
          <DeadCard key={opp.id} opp={opp} onActivate={handleActivate} />
        ))}
      </div>
    </section>
  );
}
