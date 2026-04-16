'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { CardActions, LoadingSpinner, ErrorMessage, formatDate } from '@/components/CardActions';

const SOURCE_TYPES = ['external', 'own_project'];
const CATEGORIES = ['#Інструмент', '#Фінанси', '#Зв\'язки', '#Експертиза', '#Капітал', '#Партнерство'];

export default function OpportunityPage() {
  const { id } = useParams();
  const router = useRouter();
  const [opp, setOpp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string,string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [id]);

  async function load() {
    setLoading(true);
    try {
      const data = await api.getOpportunity(Number(id));
      setOpp(data);
      setForm({
        name: data.name,
        description: data.description,
        category: data.category,
        source_type: data.source_type,
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
      const updated = await api.updateOpportunity(Number(id), form);
      setOpp(updated);
      setEditing(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm('Видалити цю можливість?')) return;
    try {
      await api.deleteOpportunity(Number(id));
      router.push('/');
    } catch (e) {
      alert(e.message);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!opp) return null;

  const sourceLabel = opp.source_type === 'own_project' ? 'Внутрішній ресурс' : 'Від партнера';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-900/60 flex items-center justify-center text-2xl">🧩</div>
          {editing
            ? <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field text-xl font-bold" />
            : <h1 className="text-2xl font-bold">{opp.name}</h1>
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

      {/* Category */}
      {editing ? (
        <div className="card">
          <div className="label">Тег / Категорія</div>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
            <option value="">—</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      ) : (
        opp.category && <span className="tag bg-purple-900/60 text-purple-300">{opp.category}</span>
      )}

      {/* Info */}
      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-zinc-400">ℹ️ Деталі</h3>
        <div>
          <div className="label">Опис</div>
          {editing
            ? <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field min-h-[60px]" />
            : <p className="text-zinc-200">{opp.description || '—'}</p>
          }
        </div>
        <div>
          <div className="label">Тип джерела</div>
          {editing ? (
            <select value={form.source_type} onChange={e => setForm(f => ({ ...f, source_type: e.target.value }))} className="input-field">
              {SOURCE_TYPES.map(s => <option key={s} value={s}>{s === 'own_project' ? 'Внутрішній ресурс' : 'Від партнера'}</option>)}
            </select>
          ) : (
            <p className="text-zinc-200">{sourceLabel}</p>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="text-xs text-zinc-600">
        Створено: {formatDate(opp.created_at)} · Оновлено: {formatDate(opp.updated_at)}
      </div>
    </div>
  );
}