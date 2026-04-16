'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

const IDEA_STAGES = {
  'Hypothesis': { label: 'Гіпотеза', color: 'idea-hypothesis' },
  'Research': { label: 'Дослідження', color: 'idea-research' },
  'Resources': { label: 'Збираємо ресурси', color: 'idea-resources' },
  'Ready': { label: 'Готова до запуску', color: 'idea-ready' },
  'Launched': { label: 'Запущена', color: 'idea-launched' },
  'Paused': { label: 'Відкладена', color: 'idea-paused' },
};

const PROJECT_STAGES = {
  'Planning': { label: 'Планування', color: 'stage-planning' },
  'MVP': { label: 'MVP', color: 'stage-mvp' },
  'Beta': { label: 'Бета', color: 'stage-beta' },
  'Active': { label: 'Активний', color: 'stage-active' },
  'Paused': { label: 'На паузі', color: 'stage-paused' },
};

function EntityCard({ href, icon, label, count, accent }) {
  return (
    <Link href={href} className="card hover:border-zinc-600 transition-all duration-200 group">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
          {icon}
        </div>
        <span className="text-3xl font-bold text-zinc-100 group-hover:text-white transition-colors">{count ?? '—'}</span>
      </div>
      <div className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">{label}</div>
    </Link>
  );
}

function PersonIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="6" r="3.5"/><path d="M3 17c0-3.866 3.134-7 7-7s7 3.134 7 7"/></svg>;
}
function ProjectIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="16" height="14" rx="2"/><path d="M2 7h16M7 3v4"/></svg>;
}
function IdeaIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 2v3M10 15v3M2 10h3M15 10h3"/><circle cx="10" cy="10" r="4"/></svg>;
}
function OpportunityIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z"/></svg>;
}

function EntitySection({ title, items }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-zinc-200 mb-3">{title}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map(item => (
          <Link key={item.id} href={item.href} className="card hover:border-zinc-600 transition-all duration-200">
            <div className="font-medium text-zinc-100 truncate">{item.name}</div>
            <div className="text-sm text-zinc-400 truncate mt-0.5">{item.sub}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.map(t => <span key={t} className="tag bg-zinc-700 text-zinc-300 text-xs">{t}</span>)}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function EmptyState({ href, label }) {
  return (
    <div className="card border-dashed border-2 border-zinc-800 flex items-center justify-center py-10">
      <Link href={href} className="text-zinc-500 hover:text-violet-400 transition-colors text-sm">{label}</Link>
    </div>
  );
}

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
      <div className="flex items-center justify-center py-20">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-red-400 mb-2">⚠️ {error}</div>
        <div className="text-zinc-500 text-sm">Переконайтесь, що сервер запущено.</div>
      </div>
    );
  }

  const filtered = search;

  return (
    <div className="space-y-8">
      {/* Search banner */}
      {filtered && (
        <div className="bg-brand-950 border border-brand-800/30 rounded-2xl p-4 flex items-center justify-between">
          <div className="text-sm text-violet-300">
            🔍 Результати пошуку: <strong className="text-white">{filtered}</strong>
          </div>
          <Link href="/" className="btn-secondary text-sm py-1.5">Очистити</Link>
        </div>
      )}

      {/* Stats cards */}
      {!filtered && stats && (
        <section>
          <h2 className="text-lg font-semibold mb-4 text-zinc-200">Дашборд</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <EntityCard href="/?tab=people" icon={<PersonIcon />} label="Люди" count={stats.people} accent="bg-blue-900/50 text-blue-300" />
            <EntityCard href="/?tab=projects" icon={<ProjectIcon />} label="Проєкти" count={stats.projects} accent="bg-green-900/50 text-green-300" />
            <EntityCard href="/?tab=ideas" icon={<IdeaIcon />} label="Ідеї" count={stats.ideas} accent="bg-amber-900/50 text-amber-300" />
            <EntityCard href="/?tab=opportunities" icon={<OpportunityIcon />} label="Можливості" count={stats.opportunities} accent="bg-purple-900/50 text-purple-300" />
          </div>
        </section>
      )}

      {/* Idea pipeline */}
      {!filtered && stats && Object.keys(stats.idea_stages || {}).length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 text-zinc-200">Пайплайн ідей</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.idea_stages).map(([stage, count]) => {
              const info = IDEA_STAGES[stage] || { label: stage, color: 'bg-zinc-700 text-zinc-300' };
              return (
                <div key={stage} className={`tag ${info.color}`}>
                  {info.label}: {count}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Full lists when not searching */}
      {!filtered && (
        <>
          {/* People */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-200">👤 Люди</h2>
              <Link href="/add?type=person" className="btn-primary text-sm py-1.5">+ Додати</Link>
            </div>
            {people.length === 0 ? (
              <EmptyState href="/add?type=person" label="Додати першу людину" />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {people.slice(0, 12).map(p => (
                  <Link key={p.id} href={`/people/${p.id}`} className="card hover:border-zinc-600 transition-all duration-200">
                    <div className="font-medium text-zinc-100 truncate">{p.name}</div>
                    <div className="text-sm text-zinc-400 truncate mt-0.5">{p.role || p.expertise || '—'}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.expertise?.split(',').slice(0, 2).map(t => t.trim()).filter(Boolean).map(t => (
                        <span key={t} className="tag tag-people">{t}</span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Projects */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-200">🚀 Проєкти</h2>
              <Link href="/add?type=project" className="btn-primary text-sm py-1.5">+ Додати</Link>
            </div>
            {projects.length === 0 ? (
              <EmptyState href="/add?type=project" label="Додати перший проєкт" />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {projects.map(p => {
                  const stageInfo = PROJECT_STAGES[p.stage] || { label: p.stage || 'Planning', color: 'bg-zinc-700 text-zinc-300' };
                  return (
                    <Link key={p.id} href={`/projects/${p.id}`} className="card hover:border-zinc-600 transition-all duration-200">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium text-zinc-100 truncate">{p.name}</div>
                        <span className={`tag shrink-0 ${stageInfo.color}`}>{stageInfo.label}</span>
                      </div>
                      <div className="text-sm text-zinc-400 line-clamp-2 mt-1">{p.description || '—'}</div>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {p.people?.slice(0, 2).map(person => (
                          <span key={person.id} className="tag bg-zinc-700 text-zinc-300 text-xs">{person.name}</span>
                        ))}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Ideas */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-200">💡 Ідеї</h2>
              <Link href="/add?type=idea" className="btn-primary text-sm py-1.5">+ Додати</Link>
            </div>
            {ideas.length === 0 ? (
              <EmptyState href="/add?type=idea" label="Додати першу ідею" />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ideas.map(i => {
                  const stageInfo = IDEA_STAGES[i.status] || { label: i.status || 'Hypothesis', color: 'bg-zinc-700 text-zinc-300' };
                  return (
                    <Link key={i.id} href={`/ideas/${i.id}`} className="card hover:border-zinc-600 transition-all duration-200">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium text-zinc-100 truncate">{i.name}</div>
                        <span className={`tag shrink-0 ${stageInfo.color}`}>{stageInfo.label}</span>
                      </div>
                      <div className="text-sm text-zinc-400 line-clamp-2 mt-1">{i.pitch || '—'}</div>
                      {i.author && <div className="text-xs text-zinc-500 mt-2">Автор: {i.author}</div>}
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Opportunities */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-200">🧩 Можливості</h2>
              <Link href="/add?type=opportunity" className="btn-primary text-sm py-1.5">+ Додати</Link>
            </div>
            {opportunities.length === 0 ? (
              <EmptyState href="/add?type=opportunity" label="Додати першу можливість" />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {opportunities.map(o => (
                  <Link key={o.id} href={`/opportunities/${o.id}`} className="card hover:border-zinc-600 transition-all duration-200">
                    <div className="font-medium text-zinc-100 truncate">{o.name}</div>
                    <div className="text-sm text-zinc-400 line-clamp-2 mt-1">{o.description || '—'}</div>
                    {o.category && <span className="tag tag-opportunity mt-2">{o.category}</span>}
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Search results */}
      {filtered && (
        <>
          {people.length > 0 && (
            <EntitySection title={`👤 Люди (${people.length})`} items={people.map(p => ({
              id: p.id, name: p.name, sub: p.role || p.expertise || '—',
              tags: p.expertise ? p.expertise.split(',').map(t => t.trim()).filter(Boolean).slice(0, 2) : [],
              href: `/people/${p.id}`,
            }))} />
          )}
          {projects.length > 0 && (
            <EntitySection title={`🚀 Проєкти (${projects.length})`} items={projects.map(p => ({
              id: p.id, name: p.name, sub: p.stage || '—',
              tags: p.stage ? [PROJECT_STAGES[p.stage]?.label || p.stage] : [],
              href: `/projects/${p.id}`,
            }))} />
          )}
          {ideas.length > 0 && (
            <EntitySection title={`💡 Ідеї (${ideas.length})`} items={ideas.map(i => ({
              id: i.id, name: i.name, sub: i.status || 'Hypothesis',
              tags: i.status ? [IDEA_STAGES[i.status]?.label || i.status] : [],
              href: `/ideas/${i.id}`,
            }))} />
          )}
          {opportunities.length > 0 && (
            <EntitySection title={`🧩 Можливості (${opportunities.length})`} items={opportunities.map(o => ({
              id: o.id, name: o.name, sub: o.category || '—',
              tags: o.category ? [o.category] : [],
              href: `/opportunities/${o.id}`,
            }))} />
          )}
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="spinner" /></div>}>
      <DashboardInner />
    </Suspense>
  );
}