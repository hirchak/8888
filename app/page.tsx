'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import DashboardInsights from '@/components/DashboardInsights';
import DeadCapital from '@/components/DeadCapital';
import TeamHeader from '@/components/TeamHeader';
import ProgressBar from '@/app/components/ProgressBar';
import Badges, { type AchievementContext } from '@/app/components/Badges';

const IDEA_STAGES = {
  'Hypothesis': { label: 'Гіпотеза', color: 'bg-amber-900/50 text-amber-300 border border-amber-800/40' },
  'Research': { label: 'Дослідження', color: 'bg-blue-900/50 text-blue-300 border border-blue-800/40' },
  'Resources': { label: 'Збираємо ресурси', color: 'bg-cyan-900/50 text-cyan-300 border border-cyan-800/40' },
  'Ready': { label: 'Готова до запуску', color: 'bg-emerald-900/50 text-emerald-300 border border-emerald-800/40' },
  'Launched': { label: 'Запущена', color: 'bg-violet-900/50 text-violet-300 border border-violet-800/40' },
  'Paused': { label: 'Відкладена', color: 'bg-red-900/50 text-red-300 border border-red-800/40' },
};

const PROJECT_STAGES = {
  'Planning': { label: 'Планування', color: 'bg-zinc-700/70 text-zinc-300 border border-zinc-600/40' },
  'MVP': { label: 'MVP', color: 'bg-blue-900/50 text-blue-300 border border-blue-800/40' },
  'Beta': { label: 'Бета', color: 'bg-amber-900/50 text-amber-300 border border-amber-800/40' },
  'Active': { label: 'Активний', color: 'bg-emerald-900/50 text-emerald-300 border border-emerald-800/40' },
  'Paused': { label: 'На паузі', color: 'bg-red-900/50 text-red-300 border border-red-800/40' },
};

// ── Stat Card ──────────────────────────────────────────────
function StatCard({ href, icon, label, count, accent, delay = 0 }) {
  return (
    <Link
      href={href}
      className="cyber-card group relative overflow-hidden min-w-0"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Glow orb */}
      <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${accent}`} />
      <div className="flex items-center justify-between mb-4 relative min-w-0">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
          {icon}
        </div>
        <span className="text-4xl font-bold text-zinc-100 group-hover:text-white transition-colors duration-200 text-right shrink-0">{count ?? '—'}</span>
      </div>
      <div className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors duration-200 tracking-wide truncate">{label}</div>
    </Link>
  );
}

// ── Entity Card ─────────────────────────────────────────────
function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function EntityCard({ href, name, sub, tags, stageLabel, stageColor, createdAt, linkCount }) {
  const totalLinks = linkCount ? Object.values(linkCount as Record<string,number>).reduce((a:number, b:number) => a + b, 0) : 0;
  const linkLabel = linkCount
    ? [
        linkCount.projects ? `${linkCount.projects} проєкт${linkCount.projects === 1 ? '' : 'и'}` : '',
        linkCount.ideas ? `${linkCount.ideas} іде${linkCount.ideas === 1 ? 'я' : 'ї'}` : '',
        linkCount.people ? `${linkCount.people} люд${linkCount.people === 1 ? 'ина' : 'ей'}` : '',
        linkCount.opportunities ? `${linkCount.opportunities} можл${linkCount.opportunities === 1 ? 'івсть' : 'ивостей'}` : '',
      ].filter(Boolean).join(', ')
    : '';

  return (
    <Link href={href} className="cyber-card group block relative overflow-hidden">
      {/* Edit button (top-right corner) */}
      <Link
        href={href}
        onClick={e => e.stopPropagation()}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 btn-secondary text-xs py-1 px-2 rounded-lg"
      >
        ✏️
      </Link>

      <div className="flex items-start justify-between gap-2 mb-2 pr-8 min-w-0">
        <div className="font-semibold text-zinc-100 truncate group-hover:text-white transition-colors duration-200 min-w-0">{name}</div>
        {stageLabel && <span className={`tag shrink-0 text-xs ${stageColor}`}>{stageLabel}</span>}
      </div>
      <div className="text-sm text-zinc-500 truncate mb-3">{sub || '—'}</div>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((t, i) => <span key={i} className="tag bg-zinc-800 text-zinc-400 text-xs border border-zinc-700/50">{t}</span>)}
        </div>
      )}
      {/* Metadata footer */}
      <div className="flex items-center justify-between text-xs text-zinc-600 mt-2 pt-2 border-t border-zinc-800/60">
        {createdAt && <span>{formatShortDate(createdAt)}</span>}
        {totalLinks > 0 && <span className="text-cyan-500/70">{linkLabel}</span>}
        {!createdAt && !totalLinks && <span />}
      </div>
    </Link>
  );
}

// ── Section ──────────────────────────────────────────────────
function EntitySection({ title, icon, items, emptyHref, emptyLabel, addHref, addLabel, gridCols = 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4' }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-heading flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="gradient-text">{title}</span>
        </h2>
        <Link href={addHref} className="btn-primary text-xs py-1.5 px-3">
          + {addLabel}
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="card border-dashed border-2 border-zinc-800 flex items-center justify-center py-10 rounded-2xl">
          <Link href={emptyHref} className="text-zinc-600 hover:text-cyan-400 transition-colors text-sm">{emptyLabel}</Link>
        </div>
      ) : (
        <div className={gridCols}>
          {items.map((item, i) => (
            <EntityCard key={item.id || i} {...item} />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Icons ───────────────────────────────────────────────────
function PersonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-400">
      <circle cx="10" cy="6" r="3.5" />
      <path d="M3 17c0-3.866 3.134-7 7-7s7 3.134 7 7" />
    </svg>
  );
}
function ProjectIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400">
      <rect x="2" y="3" width="16" height="14" rx="2" />
      <path d="M2 7h16M7 3v4" />
    </svg>
  );
}
function IdeaIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400">
      <path d="M10 2v3M10 15v3M2 10h3M15 10h3" />
      <circle cx="10" cy="10" r="4" />
    </svg>
  );
}
function OpportunityIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-violet-400">
      <path d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z" />
    </svg>
  );
}

// ── Dashboard inner ──────────────────────────────────────────
function DashboardInner() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';

  const [stats, setStats] = useState(null);
  const [people, setPeople] = useState([]);
  const [projects, setProjects] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [s, p, pr, i, o] = await Promise.all([
          api.getStats(),
          api.listPeople(search || undefined),
          api.listProjects(search || undefined),
          api.listIdeas(search || undefined),
          api.listOpportunities(search || undefined),
        ]);
        setStats(s);
        setPeople(p);
        setProjects(pr);
        setIdeas(i);
        setOpportunities(o);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24 space-y-3">
        <div className="text-red-400 text-xl font-medium">⚠️ {error}</div>
        <div className="text-zinc-600 text-sm">Переконайтесь, що сервер запущено.</div>
      </div>
    );
  }

  const filtered = search;

  return (
    <div className="space-y-10">
      {/* Team Header */}
      {!filtered && <TeamHeader />}

      {/* Search banner */}
      {filtered && (
        <div className="cyber-card flex items-center justify-between">
          <div className="text-sm text-cyan-400">
            🔍 Результати пошуку: <strong className="text-white">{filtered}</strong>
          </div>
          <Link href="/" className="btn-secondary text-xs py-1.5">Очистити</Link>
        </div>
      )}

      {/* Stats cards */}
      {!filtered && stats && (
        <section>
          <h2 className="section-heading mb-4 flex items-center gap-2">
            <span>📊</span> Дашборд
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard href="/?tab=people" icon={<PersonIcon />} label="Люди" count={stats.people} accent="bg-blue-500/20" delay={0} />
            <StatCard href="/?tab=projects" icon={<ProjectIcon />} label="Проєкти" count={stats.projects} accent="bg-emerald-500/20" delay={80} />
            <StatCard href="/?tab=ideas" icon={<IdeaIcon />} label="Ідеї" count={stats.ideas} accent="bg-amber-500/20" delay={160} />
            <StatCard href="/?tab=opportunities" icon={<OpportunityIcon />} label="Можливості" count={stats.opportunities} accent="bg-violet-500/20" delay={240} />
          </div>
        </section>
      )}

      {/* Dashboard Insights */}
      {!filtered && <DashboardInsights />}

      {/* Gamification: Progress Bar + Badges */}
      {!filtered && stats && (
        <>
          <section>
            <h2 className="section-heading mb-4 flex items-center gap-2">
              <span>🎮</span> <span className="gradient-text">Прогрес</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <ProgressBar
                entityCount={(stats.people ?? 0) + (stats.projects ?? 0) + (stats.ideas ?? 0) + (stats.opportunities ?? 0)}
              />
              <Badges
                context={{
                  totalEntities: (stats.people ?? 0) + (stats.projects ?? 0) + (stats.ideas ?? 0) + (stats.opportunities ?? 0),
                  ideasCount: stats.ideas ?? 0,
                  linksCount: 0,
                  hasPublicEntity: (stats.people ?? 0) + (stats.projects ?? 0) + (stats.ideas ?? 0) + (stats.opportunities ?? 0) > 0,
                  hasFirstEntity: (stats.people ?? 0) + (stats.projects ?? 0) + (stats.ideas ?? 0) + (stats.opportunities ?? 0) > 0,
                  hasFirstLink: false,
                }}
              />
            </div>
          </section>
        </>
      )}

      {/* Dead Capital Tracker */}
      {!filtered && <DeadCapital />}

      {/* Idea pipeline */}
      {!filtered && stats && Object.keys(stats.idea_stages || {}).length > 0 && (
        <section>
          <h2 className="section-heading mb-4 flex items-center gap-2">
            <span>💡</span> Пайплайн ідей
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.idea_stages).map(([stage, count]) => {
              const info = IDEA_STAGES[stage] || { label: stage, color: 'bg-zinc-700 text-zinc-300' };
              return (
                <div key={stage} className={`tag ${info.color}`}>
                  {info.label}: <span className="font-bold ml-1">{String(count)}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Full lists when not searching */}
      {!filtered && (
        <>
          <EntitySection
            title="Люди"
            icon="👤"
            items={people.slice(0, 12).map(p => ({
              id: p.id,
              name: p.name,
              sub: p.role || p.expertise || '—',
              tags: p.tags ? p.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3) : (p.expertise ? p.expertise.split(',').map(t => t.trim()).filter(Boolean).slice(0, 2) : []),
              href: `/people/${p.id}`,
              createdAt: p.created_at,
              linkCount: { projects: p.projects?.length ?? 0, ideas: p.ideas?.length ?? 0 },
            }))}
            emptyHref="/add?type=person"
            emptyLabel="Додати першу людину"
            addHref="/add?type=person"
            addLabel="Людину"
          />

          <EntitySection
            title="Проєкти"
            icon="🚀"
            items={projects.map(p => {
              const stageInfo = PROJECT_STAGES[p.stage] || { label: p.stage || 'Planning', color: 'bg-zinc-700 text-zinc-300' };
              return {
                id: p.id,
                name: p.name,
                sub: p.description || '—',
                stageLabel: stageInfo.label,
                stageColor: stageInfo.color,
                tags: p.tags ? p.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3) : (p.people?.slice(0, 2).map(person => person.name) || []),
                href: `/projects/${p.id}`,
                createdAt: p.created_at,
                linkCount: { people: p.people?.length ?? 0, opportunities: p.opportunities?.length ?? 0 },
              };
            })}
            emptyHref="/add?type=project"
            emptyLabel="Додати перший проєкт"
            addHref="/add?type=project"
            addLabel="Проєкт"
          />

          <EntitySection
            title="Ідеї"
            icon="💡"
            items={ideas.map(i => {
              const stageInfo = IDEA_STAGES[i.status] || { label: i.status || 'Hypothesis', color: 'bg-zinc-700 text-zinc-300' };
              return {
                id: i.id,
                name: i.name,
                sub: i.pitch || '—',
                stageLabel: stageInfo.label,
                stageColor: stageInfo.color,
                tags: i.tags ? i.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3) : [],
                href: `/ideas/${i.id}`,
                createdAt: i.created_at,
                linkCount: { people: i.people?.length ?? 0, opportunities: i.opportunities?.length ?? 0 },
              };
            })}
            emptyHref="/add?type=idea"
            emptyLabel="Додати першу ідею"
            addHref="/add?type=idea"
            addLabel="Ідею"
          />

          <EntitySection
            title="Можливості"
            icon="🧩"
            items={opportunities.map(o => ({
              id: o.id,
              name: o.name,
              sub: o.description || '—',
              tags: o.tags ? o.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3) : (o.category ? [o.category] : []),
              href: `/opportunities/${o.id}`,
              createdAt: o.created_at,
              linkCount: {},
            }))}
            emptyHref="/add?type=opportunity"
            emptyLabel="Додати першу можливість"
            addHref="/add?type=opportunity"
            addLabel="Можливість"
          />
        </>
      )}

      {/* Search results */}
      {filtered && (
        <>
          {people.length > 0 && (
            <EntitySection title={`Люди (${people.length})`} icon="👤" items={people.map(p => ({
              id: p.id, name: p.name, sub: p.role || p.expertise || '—',
              tags: p.tags ? p.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3) : (p.expertise ? p.expertise.split(',').map(t => t.trim()).filter(Boolean).slice(0, 2) : []),
              href: `/people/${p.id}`,
              createdAt: p.created_at,
              linkCount: { projects: p.projects?.length ?? 0, ideas: p.ideas?.length ?? 0 },
            }))} emptyHref="" emptyLabel="" addHref="" addLabel="" />
          )}
          {projects.length > 0 && (
            <EntitySection title={`Проєкти (${projects.length})`} icon="🚀" items={projects.map(p => ({
              id: p.id, name: p.name, sub: p.stage || '—',
              stageLabel: PROJECT_STAGES[p.stage]?.label || p.stage,
              stageColor: PROJECT_STAGES[p.stage]?.color || 'bg-zinc-700',
              href: `/projects/${p.id}`,
              createdAt: p.created_at,
              linkCount: { people: p.people?.length ?? 0, opportunities: p.opportunities?.length ?? 0 },
            }))} emptyHref="" emptyLabel="" addHref="" addLabel="" />
          )}
          {ideas.length > 0 && (
            <EntitySection title={`Ідеї (${ideas.length})`} icon="💡" items={ideas.map(i => ({
              id: i.id, name: i.name, sub: i.status || 'Hypothesis',
              stageLabel: IDEA_STAGES[i.status]?.label || i.status,
              stageColor: IDEA_STAGES[i.status]?.color || 'bg-zinc-700',
              href: `/ideas/${i.id}`,
              createdAt: i.created_at,
              linkCount: { people: i.people?.length ?? 0, opportunities: i.opportunities?.length ?? 0 },
            }))} emptyHref="" emptyLabel="" addHref="" addLabel="" />
          )}
          {opportunities.length > 0 && (
            <EntitySection title={`Можливості (${opportunities.length})`} icon="🧩" items={opportunities.map(o => ({
              id: o.id, name: o.name, sub: o.category || '—',
              tags: o.tags ? o.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3) : (o.category ? [o.category] : []),
              href: `/opportunities/${o.id}`,
              createdAt: o.created_at,
              linkCount: {},
            }))} emptyHref="" emptyLabel="" addHref="" addLabel="" />
          )}
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-24"><div className="spinner" /></div>}>
      <DashboardInner />
    </Suspense>
  );
}
