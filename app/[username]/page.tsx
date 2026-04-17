'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const ENTITY_CONFIG = {
  person: {
    icon: '👤',
    tagClass: 'tag-people',
    gradient: 'from-blue-600/20 to-blue-900/20',
    borderColor: 'border-blue-800/30',
    tagBg: 'bg-blue-900/50 text-blue-300 border-blue-800/40',
  },
  project: {
    icon: '🚀',
    tagClass: 'tag-project',
    gradient: 'from-emerald-600/20 to-emerald-900/20',
    borderColor: 'border-emerald-800/30',
    tagBg: 'bg-emerald-900/50 text-emerald-300 border-emerald-800/40',
  },
  idea: {
    icon: '💡',
    tagClass: 'tag-idea',
    gradient: 'from-amber-600/20 to-amber-900/20',
    borderColor: 'border-amber-800/30',
    tagBg: 'bg-amber-900/50 text-amber-300 border-amber-800/40',
  },
  opportunity: {
    icon: '🧩',
    tagClass: 'tag-opportunity',
    gradient: 'from-violet-600/20 to-violet-900/20',
    borderColor: 'border-violet-800/30',
    tagBg: 'bg-violet-900/50 text-violet-300 border-violet-800/40',
  },
};

function TagList({ tags }: { tags: string }) {
  if (!tags) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {tags
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean)
        .map((tag: string) => (
          <span key={tag} className="tag bg-zinc-800/80 text-zinc-400 border border-zinc-700/50 text-xs">
            {tag}
          </span>
        ))}
    </div>
  );
}

function EntityCard({ entity }: { entity: any }) {
  const config = ENTITY_CONFIG[entity.type] || ENTITY_CONFIG.person;
  return (
    <div
      className={`cyber-card group bg-gradient-to-br ${config.gradient} border ${config.borderColor}`}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl shrink-0 mt-0.5">{config.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-zinc-100 group-hover:text-white transition-colors leading-snug">
            {entity.name}
          </div>
          {entity.role && (
            <div className="text-xs text-zinc-500 mt-0.5">{entity.role}</div>
          )}
          {entity.description && (
            <div className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
              {entity.description}
            </div>
          )}
          {entity.pitch && (
            <div className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
              {entity.pitch}
            </div>
          )}
          {entity.expertise && (
            <div className="text-xs text-zinc-500 mt-1">{entity.expertise}</div>
          )}
          {entity.stage && (
            <span className={`tag mt-2 text-xs ${config.tagBg}`}>{entity.stage}</span>
          )}
          {entity.status && (
            <span className={`tag mt-2 text-xs ${config.tagBg}`}>{entity.status}</span>
          )}
          {entity.category && (
            <span className={`tag mt-2 text-xs ${config.tagBg}`}>{entity.category}</span>
          )}
          <TagList tags={entity.tags} />
        </div>
      </div>
    </div>
  );
}

function EntitySection({
  title,
  icon,
  entities,
  accentColor,
}: {
  title: string;
  icon: string;
  entities: any[];
  accentColor: string;
}) {
  if (!entities || entities.length === 0) return null;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h2 className={`text-sm font-bold uppercase tracking-widest text-${accentColor}-400`}>
          {title}
        </h2>
        <div className={`h-px flex-1 bg-gradient-to-r from-${accentColor}-500/40 to-transparent`} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {entities.map((entity: any) => (
          <EntityCard key={`${entity.type}-${entity.id}`} entity={entity} />
        ))}
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-2xl font-bold text-white mb-3">Користувача не знайдено</h1>
        <p className="text-zinc-400 text-sm mb-8">
          Профіль <span className="text-cyan-400 font-mono">@{useParams().username}</span> не існує або не має публічних сутностей.
        </p>
        <Link
          href="/brain-audit"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 text-white font-semibold hover:opacity-90 transition-opacity"
        >
          Створіть свій Nexus безкоштовно →
        </Link>
      </div>
    </div>
  );
}

export default function PublicProfilePage() {
  const { username } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!username) return;
    fetch(`/api/public/${username}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (error || !data || data.detail) {
    return <NotFound />;
  }

  const { displayName, role, expertise, summary, people, projects, ideas, opportunities, stats } = data;

  return (
    <div className="min-h-screen">
      {/* SEO meta is handled in parent layout — this is a client page, use head tag */}
      <head>
        <title>{displayName} — AI Nexus</title>
        <meta name="description" content={`Публічний профіль ${displayName} в AI Nexus Platform`} />
        <meta name="robots" content="index, follow" />
      </head>

      {/* Hero Section */}
      <div className="hero-gradient rounded-b-3xl px-6 pt-12 pb-16 text-center relative overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-10 left-1/3 w-64 h-32 rounded-full bg-violet-500/10 blur-3xl" />

        {/* Avatar */}
        <div className="w-24 h-24 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-4xl font-bold text-white shadow-2xl shadow-cyan-900/30">
          {displayName[0].toUpperCase()}
        </div>

        {/* Name */}
        <h1 className="text-3xl font-bold text-white mb-1">{displayName}</h1>
        <p className="text-zinc-400 text-sm font-mono mb-2">@{username}</p>
        {role && <p className="text-zinc-300 text-sm mb-1">{role}</p>}
        {expertise && (
          <p className="text-zinc-500 text-xs mb-6">{expertise}</p>
        )}
        {summary && (
          <p className="text-zinc-400 text-sm max-w-lg mx-auto leading-relaxed mb-6">
            {summary}
          </p>
        )}

        {/* Stats bar */}
        <div className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 text-xs text-zinc-400">
          <span>
            <span className="text-zinc-200 font-semibold">{stats.totalEntities}</span> сутностей
          </span>
          <span className="text-zinc-700">|</span>
          <span>
            <span className="text-zinc-200 font-semibold">{stats.totalLinks}</span> зв&apos;язків
          </span>
          <span className="text-zinc-700">|</span>
          <span className="text-cyan-400 font-semibold">AI Nexus</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-12">

        {/* Entity sections */}
        <EntitySection title="👤 Люди" icon="👤" entities={people} accentColor="blue" />
        <EntitySection title="🚀 Проєкти" icon="🚀" entities={projects} accentColor="emerald" />
        <EntitySection title="💡 Ідеї" icon="💡" entities={ideas} accentColor="amber" />
        <EntitySection title="🧩 Можливості" icon="🧩" entities={opportunities} accentColor="violet" />

        {/* Empty state */}
        {stats.totalEntities === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-500 text-sm">Публічних сутностей ще немає.</p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center pt-4">
          <div className="inline-block p-6 rounded-2xl bg-gradient-to-r from-cyan-900/30 to-violet-900/30 border border-cyan-800/30 text-center">
            <p className="text-zinc-300 text-sm font-medium mb-4">
              Створіть свій власний Nexus безкоштовно
            </p>
            <Link
              href="/brain-audit"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-cyan-900/30"
            >
              🚀 Почати безкоштовно →
            </Link>
            <p className="text-zinc-600 text-xs mt-3">Без реєстрації · AI-парсинг · Публічні профілі</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-zinc-700 text-xs pb-8">
        Працює на{' '}
        <Link href="/" className="text-zinc-600 hover:text-cyan-400 transition-colors">
          AI Nexus Platform
        </Link>
      </div>
    </div>
  );
}
