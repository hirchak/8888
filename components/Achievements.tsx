'use client';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';

interface Milestone {
  id: string;
  title: string;
  done: boolean;
  completedAt: string | null;
}

interface Project {
  id: number;
  name: string;
  stage: string;
  milestones: Milestone[];
  completed_at?: string;
}

const TIME_FILTERS = [
  { key: 'week', label: 'Тиждень' },
  { key: 'month', label: 'Місяць' },
  { key: 'all', label: 'Всі' },
];

function isWithinPeriod(dateStr: string | null | undefined, period: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();

  if (period === 'all') return true;
  if (period === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo;
  }
  if (period === 'month') {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return date >= monthAgo;
  }
  return true;
}

function AchievementItem({ icon, title, subtitle, date, medal }: {
  icon: string; title: string; subtitle: string; date: string | null; medal?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
      <div className="text-2xl shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-zinc-200 truncate">{title}</div>
        <div className="text-xs text-zinc-500 truncate">{subtitle}</div>
      </div>
      <div className="text-right shrink-0">
        {medal && <div className="text-lg">{medal}</div>}
        {date && (
          <div className="text-[10px] text-zinc-600">
            {new Date(date).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short' })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Achievements() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('month');

  useEffect(() => {
    api.listProjects().then(data => {
      setProjects(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const completedProjects = useMemo(() => {
    return projects.filter((p: Project) => p.stage === 'Paused' || p.stage === 'Launched' || p.completed_at);
  }, [projects]);

  const completedMilestones = useMemo(() => {
    const all: Array<{ milestone: Milestone; projectName: string; projectId: number }> = [];
    projects.forEach((p: Project) => {
      (p.milestones || []).forEach((m: Milestone) => {
        if (m.done && m.completedAt) {
          all.push({ milestone: m, projectName: p.name, projectId: p.id });
        }
      });
    });
    return all;
  }, [projects]);

  const filteredMilestones = useMemo(() => {
    return completedMilestones.filter(({ milestone }) => isWithinPeriod(milestone.completedAt, filter));
  }, [completedMilestones, filter]);

  const filteredProjects = useMemo(() => {
    return completedProjects.filter((p: Project) => isWithinPeriod(p.completed_at, filter));
  }, [completedProjects, filter]);

  const totalCount = filteredMilestones.length + filteredProjects.length;

  if (loading) {
    return <div className="h-32 animate-pulse bg-zinc-900/50 rounded-2xl" />;
  }

  return (
    <div className="cyber-card">
      {/* Header with filter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏆</span>
          <h3 className="text-sm font-semibold text-zinc-300">Досягнення</h3>
          {totalCount > 0 && (
            <span className="text-xs text-cyan-400 bg-cyan-900/30 px-2 py-0.5 rounded-full">
              {totalCount}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {TIME_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === f.key
                  ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/30'
                  : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {filteredMilestones.map(({ milestone, projectName }) => (
          <AchievementItem
            key={milestone.id}
            icon="✅"
            title={milestone.title}
            subtitle={projectName}
            date={milestone.completedAt}
            medal="🎯"
          />
        ))}
        {filteredProjects.map((p: Project) => (
          <AchievementItem
            key={p.id}
            icon="🚀"
            title={p.name}
            subtitle={`Проєкт завершено`}
            date={p.completed_at || null}
            medal="🏅"
          />
        ))}
        {totalCount === 0 && (
          <div className="text-center py-6 text-zinc-500 text-sm">
            Нічого не досягнуто за цей період
          </div>
        )}
      </div>
    </div>
  );
}
