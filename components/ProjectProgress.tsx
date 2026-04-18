'use client';

import { useState, useEffect } from 'react';
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
}

const ACTIVE_STAGES = ['Planning', 'MVP', 'Beta', 'Active'];

function MilestoneRow({ milestone, onToggle }: { milestone: Milestone; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs transition-colors ${
        milestone.done
          ? 'text-emerald-400 bg-emerald-900/30 line-through'
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
      }`}
    >
      <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
        milestone.done ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600'
      }`}>
        {milestone.done && <span className="text-[8px] text-white">✓</span>}
      </span>
      {milestone.title}
    </button>
  );
}

function ProjectProgressRow({ project, onUpdate }: { project: Project; onUpdate: (p: Project) => void }) {
  const milestones = project.milestones || [];
  const done = milestones.filter((m: Milestone) => m.done).length;
  const total = milestones.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  function toggleMilestone(milestoneId: string) {
    const updated = project.milestones.map((m: Milestone) =>
      m.id === milestoneId
        ? { ...m, done: !m.done, completedAt: !m.done ? new Date().toISOString() : null }
        : m
    );
    const updatedProject = { ...project, milestones: updated };
    onUpdate(updatedProject);

    // Persist
    fetch(`/api/projects/${project.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ milestones: updated }),
    }).catch(console.error);
  }

  function addMilestone(title: string) {
    if (!title.trim()) return;
    const newM: Milestone = {
      id: `m-${Date.now()}`,
      title: title.trim(),
      done: false,
      completedAt: null,
    };
    const updated = [...project.milestones, newM];
    const updatedProject = { ...project, milestones: updated };
    onUpdate(updatedProject);

    fetch(`/api/projects/${project.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ milestones: updated }),
    }).catch(console.error);
  }

  return (
    <div className="cyber-card">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`tag text-xs shrink-0 ${
              project.stage === 'Active' ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-800/40' :
              project.stage === 'Beta' ? 'bg-amber-900/50 text-amber-300 border border-amber-800/40' :
              project.stage === 'MVP' ? 'bg-blue-900/50 text-blue-300 border border-blue-800/40' :
              'bg-zinc-700/70 text-zinc-300 border border-zinc-600/40'
            }`}>{project.stage}</span>
          </div>
          <h3 className="font-semibold text-zinc-100 truncate">{project.name}</h3>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xl font-bold text-white">{percent}%</div>
          <div className="text-xs text-zinc-500">{done}/{total}</div>
        </div>
      </div>

      {/* Progress track */}
      {total > 0 && (
        <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden mb-3">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
            style={{
              width: `${percent}%`,
              background: 'linear-gradient(90deg, #06b6d4, #8b5cf6)',
              boxShadow: '0 0 8px rgba(6, 182, 212, 0.5)',
            }}
          />
          {/* Milestone dots on track */}
          <div className="absolute inset-0 flex items-center justify-between px-0.5">
            {milestones.map((m: Milestone) => (
              <div
                key={m.id}
                className={`w-2.5 h-2.5 rounded-full border-2 transition-all ${
                  m.done
                    ? 'bg-emerald-400 border-emerald-400 shadow-sm shadow-emerald-400/60'
                    : 'bg-zinc-900 border-zinc-600'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Milestones */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {milestones.map((m: Milestone) => (
          <MilestoneRow
            key={m.id}
            milestone={m}
            onToggle={() => toggleMilestone(m.id)}
          />
        ))}
        {total === 0 && (
          <span className="text-xs text-zinc-600 italic">Немає цілей</span>
        )}
      </div>

      {/* Add milestone */}
      <AddMilestoneInput onAdd={addMilestone} />
    </div>
  );
}

function AddMilestoneInput({ onAdd }: { onAdd: (title: string) => void }) {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    onAdd(value);
    setValue('');
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-zinc-600 hover:text-cyan-400 transition-colors"
      >
        + Додати ціль
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Назва цілі..."
        className="input-field text-xs py-1.5 flex-1"
        autoFocus
      />
      <button type="submit" className="btn-primary text-xs py-1.5 px-3">+</button>
      <button type="button" onClick={() => setOpen(false)} className="btn-secondary text-xs py-1.5 px-2">✕</button>
    </form>
  );
}

export default function ProjectProgress() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listProjects().then(data => {
      // Only active/in-progress projects
      const active = data.filter((p: any) => ACTIVE_STAGES.includes(p.stage));
      setProjects(active);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  function handleUpdate(updated: Project) {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  }

  if (loading) {
    return <div className="h-32 animate-pulse bg-zinc-900/50 rounded-2xl" />;
  }

  if (projects.length === 0) {
    return (
      <div className="cyber-card text-center py-8">
        <div className="text-3xl mb-2">🎯</div>
        <p className="text-zinc-500 text-sm">Немає активних проєктів</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project: Project) => (
        <ProjectProgressRow
          key={project.id}
          project={project}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
}
