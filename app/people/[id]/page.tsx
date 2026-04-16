'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CardActions, LoadingSpinner, ErrorMessage, formatDate } from '@/components/CardActions';

const IDEA_STAGES_MAP = {
  'Hypothesis': 'Гіпотеза', 'Research': 'Дослідження',
  'Resources': 'Збираємо ресурси', 'Ready': 'Готова до запуску',
  'Launched': 'Запущена', 'Paused': 'Відкладена',
};

export default function PersonPage() {
  const { id } = useParams();
  const router = useRouter();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string,string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [id]);

  async function load() {
    setLoading(true);
    try {
      const data = await api.getPerson(Number(id));
      setPerson(data);
      setForm({
        name: data.name,
        role: data.role,
        expertise: data.expertise,
        company: data.company,
        contact: data.contact,
        summary: data.summary,
        interests: data.interests,
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
      const updated = await api.updatePerson(Number(id), form);
      setPerson(updated);
      setEditing(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm('Видалити цю людину?')) return;
    try {
      await api.deletePerson(Number(id));
      router.push('/');
    } catch (e) {
      alert(e.message);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!person) return null;

  const fields = [
    { key: 'role', label: 'Роль' },
    { key: 'company', label: 'Компанія' },
    { key: 'expertise', label: 'Експертиза' },
    { key: 'contact', label: 'Контакти' },
    { key: 'interests', label: 'Інтереси' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-900/60 flex items-center justify-center text-2xl">👤</div>
          {editing
            ? <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field text-xl font-bold" />
            : <h1 className="text-2xl font-bold">{person.name}</h1>
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

      {/* Summary */}
      {(person.summary || editing) && (
        <div className="card">
          <h3 className="text-sm font-semibold text-zinc-400 mb-2">📝 Підсумок</h3>
          {editing
            ? <textarea value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} className="input-field min-h-[80px]" />
            : <p className="text-zinc-300 whitespace-pre-wrap">{person.summary || '—'}</p>
          }
        </div>
      )}

      {/* Fields */}
      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-zinc-400">ℹ️ Дані</h3>
        {fields.map(({ key, label }) => (
          <div key={key}>
            <div className="label">{label}</div>
            {editing
              ? <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="input-field" />
              : <p className="text-zinc-200">{person[key] || '—'}</p>
            }
          </div>
        ))}
      </div>

      {/* Projects */}
      <div className="card">
        <h3 className="text-sm font-semibold text-zinc-400 mb-3">🚀 Проєкти</h3>
        {person.projects?.length > 0 ? (
          <div className="space-y-2">
            {person.projects.map(p => (
              <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors">
                <span className="text-zinc-200">{p.name}</span>
                <span className="tag bg-green-900/50 text-green-300 text-xs">{p.stage || '—'}</span>
              </Link>
            ))}
          </div>
        ) : <p className="text-zinc-500 text-sm">Немає прив&apos;язаних проєктів</p>}
      </div>

      {/* Ideas */}
      <div className="card">
        <h3 className="text-sm font-semibold text-zinc-400 mb-3">💡 Ідеї</h3>
        {person.ideas?.length > 0 ? (
          <div className="space-y-2">
            {person.ideas.map(i => (
              <Link key={i.id} href={`/ideas/${i.id}`} className="flex items-center justify-between p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors">
                <span className="text-zinc-200">{i.name}</span>
                <span className="tag bg-amber-900/50 text-amber-300 text-xs">{IDEA_STAGES_MAP[i.status] || i.status}</span>
              </Link>
            ))}
          </div>
        ) : <p className="text-zinc-500 text-sm">Немає прив&apos;язаних ідей</p>}
      </div>

      {/* Meta */}
      <div className="text-xs text-zinc-600">
        Створено: {formatDate(person.created_at)} · Оновлено: {formatDate(person.updated_at)}
      </div>
    </div>
  );
}