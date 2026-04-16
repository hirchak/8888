'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface InsightItem {
  label: string;
  count: number;
  href?: string;
  color: string;
}

interface InsightGroup {
  title: string;
  icon: string;
  items: InsightItem[];
}

export default function DashboardInsights() {
  const [groups, setGroups] = useState<InsightGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [people, projects, ideas] = await Promise.all([
          api.listPeople(),
          api.listProjects(),
          api.listIdeas(),
        ]);

        // Unlinked people — no links to any project or idea
        const linkedPersonIds = new Set<number>();
        for (const p of people) {
          if ((p.projects?.length ?? 0) > 0 || (p.ideas?.length ?? 0) > 0) {
            linkedPersonIds.add(p.id);
          }
        }
        const unlinkedPeople = people.filter(p => !linkedPersonIds.has(p.id));

        // Project count by stage
        const stageCounts: Record<string, number> = {};
        for (const p of projects) {
          const s = p.stage || 'Planning';
          stageCounts[s] = (stageCounts[s] || 0) + 1;
        }

        // Ideas that are Hypothesis
        const hypothesisIdeas = ideas.filter(i => i.status === 'Hypothesis');

        setGroups([
          {
            title: 'Непов\'язані контакти',
            icon: '👤',
            items: unlinkedPeople.length > 0
              ? unlinkedPeople.slice(0, 5).map(p => ({
                  label: p.name,
                  count: 1,
                  href: `/people/${p.id}`,
                  color: 'bg-blue-900/40 text-blue-300 border-blue-800/40',
                }))
              : [{ label: 'Всі контакти пов\'язані', count: 0, color: 'bg-zinc-800 text-zinc-500' }],
          },
          {
            title: 'Проєкти по стадіях',
            icon: '🚀',
            items: Object.entries(stageCounts).map(([stage, count]) => ({
              label: stage,
              count,
              color: 'bg-emerald-900/40 text-emerald-300 border-emerald-800/40',
            })),
          },
          {
            title: 'Ідеї-гіпотези',
            icon: '💡',
            items: hypothesisIdeas.length > 0
              ? hypothesisIdeas.slice(0, 5).map(i => ({
                  label: i.name,
                  count: 1,
                  href: `/ideas/${i.id}`,
                  color: 'bg-amber-900/40 text-amber-300 border-amber-800/40',
                }))
              : [{ label: 'Немає гіпотез без статусу', count: 0, color: 'bg-zinc-800 text-zinc-500' }],
          },
        ]);
      } catch (e) {
        console.error('Insights load error', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <section>
      <h2 className="section-heading mb-4 flex items-center gap-2">
        <span>🔍</span> <span className="gradient-text">Insights</span>
      </h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {groups.map(group => (
          <div key={group.title} className="cyber-card">
            <h3 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
              <span>{group.icon}</span> {group.title}
            </h3>
            <div className="space-y-1.5">
              {group.items.map((item, i) => (
                item.href ? (
                  <Link
                    key={i}
                    href={item.href}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/40 hover:border-zinc-600/60 transition-all duration-200 group"
                  >
                    <span className="text-zinc-300 text-sm group-hover:text-white transition-colors truncate mr-2">{item.label}</span>
                    {item.count > 0 && (
                      <span className={`tag text-xs shrink-0 ${item.color}`}>{item.count}</span>
                    )}
                  </Link>
                ) : (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2 rounded-xl border text-sm"
                  >
                    <span className="text-zinc-500 truncate mr-2">{item.label}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
