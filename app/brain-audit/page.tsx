'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

// ── Entity type config ────────────────────────────────────────
const ENTITY_CONFIG = {
  person: {
    label: 'Людина',
    icon: '👤',
    tagClass: 'tag-people',
    color: 'blue',
    colorAccent: 'text-blue-400',
  },
  project: {
    label: 'Проєкт',
    icon: '🚀',
    tagClass: 'tag-project',
    color: 'emerald',
    colorAccent: 'text-emerald-400',
  },
  idea: {
    label: 'Ідея',
    icon: '💡',
    tagClass: 'tag-idea',
    color: 'amber',
    colorAccent: 'text-amber-400',
  },
  opportunity: {
    label: 'Можливість',
    icon: '🧩',
    tagClass: 'tag-opportunity',
    color: 'violet',
    colorAccent: 'text-violet-400',
  },
};

// ── Entity Card ────────────────────────────────────────────────
function ResultCard({ entity }: { entity: { type: string; name: string; confidence: number } }) {
  const config = ENTITY_CONFIG[entity.type] || ENTITY_CONFIG.person;
  return (
    <div className="cyber-card group animate-scale-in">
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0`}
          style={{
            background: `rgba(var(--${config.color}-900-rgb, 55, 65, 81) / 0.5)`,
            backgroundColor:
              entity.type === 'person' ? 'rgba(30, 58, 138, 0.5)' :
              entity.type === 'project' ? 'rgba(6, 78, 59, 0.5)' :
              entity.type === 'idea' ? 'rgba(120, 53, 15, 0.5)' :
              'rgba(88, 28, 135, 0.5)',
            border: `1px solid rgba(var(--${config.color}-800-rgb, 75, 85, 99) / 0.4)`,
          }}
        >
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-zinc-100 group-hover:text-white transition-colors truncate">
            {entity.name}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`tag ${config.tagClass}`}>{config.label}</span>
            <span className="text-xs text-zinc-600">
              {Math.round(entity.confidence * 100)}% впевненість
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section ────────────────────────────────────────────────────
function EntitySection({ type, entities }: { type: string; entities: any[] }) {
  if (entities.length === 0) return null;
  const config = ENTITY_CONFIG[type];
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-base">{config.icon}</span>
        <h3 className="font-semibold text-zinc-200">{config.label}</h3>
        <span className="text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">{entities.length}</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {entities.map((entity, i) => (
          <ResultCard key={i} entity={entity} />
        ))}
      </div>
    </section>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function BrainAuditPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [analyzed, setAnalyzed] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const res = await fetch('/api/brain-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Помилка аналізу');
      }
      const data = await res.json();
      setResults(data);
      setAnalyzed(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setText('');
    setResults(null);
    setAnalyzed(false);
    setError('');
  };

  const grouped = results?.entities
    ? {
        person: results.entities.filter((e: any) => e.type === 'person'),
        project: results.entities.filter((e: any) => e.type === 'project'),
        idea: results.entities.filter((e: any) => e.type === 'idea'),
        opportunity: results.entities.filter((e: any) => e.type === 'opportunity'),
      }
    : null;

  const total = results?.summary?.total || 0;

  return (
    <div className="space-y-10">
      {/* ── Hero ── */}
      <div className="hero-gradient rounded-2xl p-8 md:p-12 text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 text-sm text-cyan-400 mb-4">
          <span>🧠</span>
          <span>AI Brain Audit</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          Дізнайтеся, що ховається у вашому тексті
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Вставте будь-який текст — AI витягне всіх людей, ідеї, компанії. Без реєстрації.
        </p>
      </div>

      {/* ── Input Section ── */}
      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Вставте текст, нотатки, список контактів, описи ідей або будь-які записи..."
            className="input-field resize-none h-48 text-sm leading-relaxed"
            disabled={loading}
          />
          <div className="absolute bottom-3 right-3 text-xs text-zinc-600">
            {text.length} символів
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="spinner w-4 h-4 border-2 border-white/30 border-t-white" />
                Аналізую...
              </>
            ) : (
              <>
                <span>🔍</span>
                Проаналізувати
              </>
            )}
          </button>
          {analyzed && (
            <button onClick={handleReset} className="btn-secondary text-sm">
              Очистити
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-900/50 rounded-xl p-4 text-red-300 text-sm">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* ── Loading State ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="spinner w-12 h-12" />
          <p className="text-zinc-500 text-sm">AI аналізує ваш текст...</p>
        </div>
      )}

      {/* ── Results ── */}
      {!loading && results && (
        <div className="space-y-8 animate-slide-up">
          {/* Summary bar */}
          <div className="cyber-card flex flex-wrap items-center gap-4">
            <div className="text-sm text-zinc-400">
              Знайдено <span className="text-white font-bold text-xl">{total}</span> сутностей
            </div>
            <div className="flex flex-wrap gap-2">
              {grouped?.person?.length > 0 && (
                <span className="tag tag-people">👤 {grouped.person.length}</span>
              )}
              {grouped?.project?.length > 0 && (
                <span className="tag tag-project">🚀 {grouped.project.length}</span>
              )}
              {grouped?.idea?.length > 0 && (
                <span className="tag tag-idea">💡 {grouped.idea.length}</span>
              )}
              {grouped?.opportunity?.length > 0 && (
                <span className="tag tag-opportunity">🧩 {grouped.opportunity.length}</span>
              )}
            </div>
          </div>

          {/* No results */}
          {total === 0 && (
            <div className="text-center py-12 space-y-3">
              <div className="text-4xl">🔍</div>
              <p className="text-zinc-400">Сутностей не знайдено. Спробуйте інший текст.</p>
            </div>
          )}

          {/* Entity sections */}
          {grouped?.person?.length > 0 && (
            <EntitySection type="person" entities={grouped.person} />
          )}
          {grouped?.project?.length > 0 && (
            <EntitySection type="project" entities={grouped.project} />
          )}
          {grouped?.idea?.length > 0 && (
            <EntitySection type="idea" entities={grouped.idea} />
          )}
          {grouped?.opportunity?.length > 0 && (
            <EntitySection type="opportunity" entities={grouped.opportunity} />
          )}

          {/* CTA to save */}
          <div className="hero-gradient rounded-2xl p-8 text-center space-y-4">
            <h3 className="text-xl font-bold text-white">
              Зберегти ці результати у своєму Nexus?
            </h3>
            <p className="text-zinc-400 text-sm">
              Створіть безкоштовний акаунт і додайте всі знайдені сутності одним кліком.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/add" className="btn-primary flex items-center gap-2">
                <span>➕</span>
                Створити безкоштовний акаунт
              </Link>
              <button onClick={handleReset} className="btn-secondary text-sm">
                Спробувати інший текст
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── How it works ── */}
      {!analyzed && (
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: '📋', title: 'Вставте текст', desc: 'Скопіюйте нотатки, листи, описи — що завгодно' },
            { icon: '🤖', title: 'AI аналізує', desc: 'Витягує людей, проєкти, ідеї та можливості' },
            { icon: '💾', title: 'Збережіть результат', desc: 'Додайте знайдені сутності до свого Nexus' },
          ].map((step, i) => (
            <div key={i} className="cyber-card text-center space-y-2">
              <div className="text-2xl">{step.icon}</div>
              <div className="font-semibold text-zinc-200">{step.title}</div>
              <div className="text-xs text-zinc-500">{step.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}