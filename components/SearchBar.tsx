'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

const TYPE_LABELS = {
  person: { label: '👤 Людина', href: (id) => `/people/${id}` },
  project: { label: '🚀 Проєкт', href: (id) => `/projects/${id}` },
  idea: { label: '💡 Ідея', href: (id) => `/ideas/${id}` },
  opportunity: { label: '🧩 Можливість', href: (id) => `/opportunities/${id}` },
};

function EntityResult({ entity, onClick }) {
  const type = entity.type;
  const info = TYPE_LABELS[type];
  if (!info) return null;

  return (
    <Link
      href={info.href(entity.id)}
      onClick={onClick}
      className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-800/80 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-zinc-200 truncate">{entity.name}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-md shrink-0 ${
            type === 'person' ? 'bg-cyan-900/50 text-cyan-300' :
            type === 'project' ? 'bg-violet-900/50 text-violet-300' :
            type === 'idea' ? 'bg-amber-900/50 text-amber-300' :
            'bg-emerald-900/50 text-emerald-300'
          }`}>
            {info.label}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {entity.tags && entity.tags.split(',').filter(t => t.trim()).slice(0, 3).map(tag => (
            <span key={tag} className="text-xs text-zinc-600">#{tag.trim()}</span>
          ))}
          {entity.role && <span className="text-xs text-zinc-500 truncate">{entity.role}</span>}
          {entity.stage && <span className="text-xs text-zinc-500">{entity.stage}</span>}
          {entity.status && <span className="text-xs text-zinc-500">{entity.status}</span>}
        </div>
      </div>
    </Link>
  );
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const [people, projects, ideas, opportunities] = await Promise.all([
          api.listPeople(query).catch(() => ({ people: [] })),
          api.listProjects(query).catch(() => ({ projects: [] })),
          api.listIdeas(query).catch(() => ({ ideas: [] })),
          api.listOpportunities(query).catch(() => ({ opportunities: [] })),
        ]);

        const items = [
          ...(people.people || []).map(p => ({ ...p, type: 'person' })),
          ...(projects.projects || []).map(p => ({ ...p, type: 'project' })),
          ...(ideas.ideas || []).map(i => ({ ...i, type: 'idea' })),
          ...(opportunities.opportunities || []).map(o => ({ ...o, type: 'opportunity' })),
        ];

        setResults(items.slice(0, 8));
        setOpen(items.length > 0);
      } catch(e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  function handleClear() {
    setQuery('');
    setResults([]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          {loading ? (
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#71717a" strokeWidth="2" className="text-zinc-500">
              <circle cx="7" cy="7" r="4.5"/>
              <path d="M10.5 10.5L14 14" strokeLinecap="round"/>
            </svg>
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder="Пошук..."
          className="w-full input-field text-sm py-1.5 pl-9 pr-8"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-2.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 2l8 8M10 2L2 10" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50">
          {results.map((item, i) => (
            <div key={`${item.type}-${item.id}`}>
              <EntityResult
                entity={item}
                onClick={() => { setOpen(false); setQuery(''); }}
              />
              {i < results.length - 1 && <div className="h-px bg-zinc-800/60 mx-3" />}
            </div>
          ))}
          {results.length === 0 && query.trim() && (
            <div className="px-4 py-6 text-center text-zinc-500 text-sm">
              Нічого не знайдено
            </div>
          )}
        </div>
      )}
    </div>
  );
}
