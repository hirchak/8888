'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CardActions, LoadingSpinner, ErrorMessage, formatDate } from '@/components/CardActions';

const STATUSES = ['Hypothesis', 'Research', 'Resources', 'Ready', 'Launched', 'Paused'];

// Maps status → CSS class from globals.css
const IDEA_STAGE_CLASSES = {
  'Hypothesis': 'idea-hypothesis',
  'Research':   'idea-research',
  'Resources':  'idea-resources',
  'Ready':      'idea-ready',
  'Launched':   'idea-launched',
  'Paused':     'idea-paused',
};

export default function IdeaPage() {
  const { id } = useParams();
  const router = useRouter();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string,string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [id]);

  async function load() {
    setLoading(true);
    try {
      const data = await api.getIdea(Number(id));
      setIdea(data);
      setForm({
        name: data.name,
        pitch: data.pitch,
        roi: data.roi,
        origin: data.origin,
        author: data.author,
        requirements: data.requirements,
        matched_assets: data.matched_assets,
        status: data.status,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const updated = await api.updateIdea(Number(id), form);
      setIdea(updated);
      setEditing(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm('Видалити цю ідею?')) return;
    try {
      await api.deleteIdea(Number(id));
      router.push('/');
    } catch (e) {
      alert(e.message);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!idea) return null;

  const statusClass = IDEA_STAGE_CLASSES[idea.status] || 'idea-hypothesis';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-900/60 flex items-center justify-center text-2xl">💡</div>
          {editing
            ? <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field text-xl font-bold" />
            : <h1 className="text-2xl font-bold">{idea.name}</h1>
          }
        </div>
        <CardActions
          editing={editing}
          onEdit={() => setEditing(true)}
          onCancel={() => setEditing(false)}
          onSave={save}
          saving={saving}
          onDelete={remove}
        />
      </div>

      {/* Status */}
      {editing ? (
        <div className="card">
          <div className="label">Статус</div>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-field">
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      ) : (
        <span className={`tag ${statusClass}`}>{idea.status}</span>
      )}

      {/* Core */}
      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-zinc-400">💡 Концепт</h3>
        {[
          { key: 'pitch', label: 'Elevator Pitch' },
          { key: 'roi', label: 'Потенційний вихлоп (ROI)' },
        ].map(({ key, label }) => (
          <div key={key}>
            <div className="label">{label}</div>
            {editing
              ? <textarea value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="input-field min-h-[60px]" />
              : <p className="text-zinc-200 whitespace-pre-wrap">{idea[key] || '—'}</p>
            }
          </div>
        ))}
      </div>

      {/* Origin */}
      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-zinc-400">📍 Джерело</h3>
        {[
          { key: 'origin', label: 'Причина виникнення' },
          { key: 'author', label: 'Автор / Ініціатор' },
        ].map(({ key, label }) => (
          <div key={key}>
            <div className="label">{label}</div>
            {editing
              ? <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="input-field" />
              : <p className="text-zinc-300">{idea[key] || '—'}</p>
            }
          </div>
        ))}
      </div>

      {/* Requirements */}
      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-zinc-400">🎯 Реалізація</h3>
        {[
          { key: 'requirements', label: 'Що потрібно для старту' },
          { key: 'matched_assets', label: 'Наявні ресурси' },
        ].map(({ key, label }) => (
          <div key={key}>
            <div className="label">{label}</div>
            {editing
              ? <textarea value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="input-field min-h-[60px]" />
              : <p className="text-zinc-200 whitespace-pre-wrap">{idea[key] || '—'}</p>
            }
          </div>
        ))}
      </div>

      {/* People */}
      <div className="card">
        <h3 className="text-sm font-semibold text-zinc-400 mb-3">👤 Зацікавлені</h3>
        {idea.people?.length > 0 ? (
          <div className="space-y-2">
            {idea.people.map(p => (
              <Link key={p.id} href={`/people/${p.id}`} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors">
                <span className="text-zinc-300">{p.name}</span>
                {p.role && <span className="text-xs text-zinc-500 ml-auto">{p.role}</span>}
              </Link>
            ))}
          </div>
        ) : <p className="text-zinc-500 text-sm">Немає зацікавлених</p>}
      </div>

      {/* Opportunities */}
      <div className="card">
        <h3 className="text-sm font-semibold text-zinc-400 mb-3">🧩 Можливості</h3>
        {idea.opportunities?.length > 0 ? (
          <div className="space-y-2">
            {idea.opportunities.map(o => (
              <Link key={o.id} href={`/opportunities/${o.id}`} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors">
                <span className="text-zinc-300">{o.name}</span>
                {o.category && <span className="tag bg-purple-900/50 text-purple-300 text-xs ml-auto">{o.category}</span>}
              </Link>
            ))}
          </div>
        ) : <p className="text-zinc-500 text-sm">Немає прив&apos;язаних можливостей</p>}
      </div>

      {/* Meta */}
      <div className="text-xs text-zinc-600">
        Створено: {formatDate(idea.created_at)} · Оновлено: {formatDate(idea.updated_at)}
      </div>
    </div>
  );
}