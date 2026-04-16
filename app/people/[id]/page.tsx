'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CardActions, LoadingSpinner, ErrorMessage, formatDate } from '@/components/CardActions';

const IDEA_STAGES_MAP = {
  'Hypothesis': { label: 'Гіпотеза', color: 'bg-amber-900/50 text-amber-300 border border-amber-800/40' },
  'Research': { label: 'Дослідження', color: 'bg-blue-900/50 text-blue-300 border border-blue-800/40' },
  'Resources': { label: 'Збираємо ресурси', color: 'bg-cyan-900/50 text-cyan-300 border border-cyan-800/40' },
  'Ready': { label: 'Готова до запуску', color: 'bg-emerald-900/50 text-emerald-300 border border-emerald-800/40' },
  'Launched': { label: 'Запущена', color: 'bg-violet-900/50 text-violet-300 border border-violet-800/40' },
  'Paused': { label: 'Відкладена', color: 'bg-red-900/50 text-red-300 border border-red-800/40' },
};

export default function PersonPage() {
  const { id } = useParams();
  const router = useRouter();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
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
        tags: data.tags || '',
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header card */}
      <div className="cyber-card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="avatar-circle w-14 h-14 text-3xl shrink-0">
              👤
            </div>
            <div>
              {editing
                ? <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field text-xl font-bold" />
                : <h1 className="text-2xl font-bold text-white">{person.name}</h1>
              }
              {person.role && !editing && (
                <p className="text-zinc-500 text-sm mt-0.5">{person.role}</p>
              )}
            </div>
          </div>
          <CardActions
            editing={editing}
            onEdit={() => setEditing(true)}
            onCancel={() => { setEditing(false); setForm({ name: person.name, role: person.role, expertise: person.expertise, company: person.company, contact: person.contact, summary: person.summary, interests: person.interests }); }}
            onSave={save}
            saving={saving}
            onDelete={remove}
          />
        </div>
      </div>

      {/* Summary */}
      {(person.summary || editing) && (
        <div className="cyber-card">
          <h3 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
            <span>📝</span> Підсумок
          </h3>
          {editing
            ? (
              <textarea
                value={form.summary}
                onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                className="input-field min-h-[100px] resize-y"
              />
            ) : (
              <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{person.summary || <span className="text-zinc-600">—</span>}</p>
            )
          }
        </div>
      )}

      {/* Data fields */}
      <div className="cyber-card space-y-4">
        <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
          <span>ℹ️</span> Дані
        </h3>
        {[
          { key: 'role', label: 'Роль' },
          { key: 'company', label: 'Компанія' },
          { key: 'expertise', label: 'Експертиза' },
          { key: 'contact', label: 'Контакти' },
          { key: 'interests', label: 'Інтереси' },
          { key: 'tags', label: 'Теги' },
        ].map(({ key, label }) => (
          <div key={key}>
            <div className="label">{label}</div>
            {editing ? (
              <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="input-field" />
            ) : (
              <p className="text-zinc-200">{person[key] || <span className="text-zinc-600">—</span>}</p>
            )}
          </div>
        ))}
      </div>

      {/* Projects */}
      <div className="cyber-card">
        <h3 className="text-sm font-semibold text-zinc-400 mb-4 flex items-center gap-2">
          <span>🚀</span> Проєкти
        </h3>
        {person.projects?.length > 0 ? (
          <div className="space-y-2">
            {person.projects.map(p => (
              <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/40 hover:border-zinc-600/60 transition-all duration-200 group">
                <span className="text-zinc-200 font-medium group-hover:text-white transition-colors">{p.name}</span>
                <span className="tag bg-emerald-900/50 text-emerald-300 text-xs border border-emerald-800/40 shrink-0">{p.stage || '—'}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-zinc-600 text-sm py-2">Немає прив&apos;язаних проєктів</p>
        )}
      </div>

      {/* Ideas */}
      <div className="cyber-card">
        <h3 className="text-sm font-semibold text-zinc-400 mb-4 flex items-center gap-2">
          <span>💡</span> Ідеї
        </h3>
        {person.ideas?.length > 0 ? (
          <div className="space-y-2">
            {person.ideas.map(i => {
              const stageInfo = IDEA_STAGES_MAP[i.status] || { label: i.status, color: 'bg-zinc-700 text-zinc-300' };
              return (
                <Link key={i.id} href={`/ideas/${i.id}`} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/40 hover:border-zinc-600/60 transition-all duration-200 group">
                  <span className="text-zinc-200 font-medium group-hover:text-white transition-colors">{i.name}</span>
                  <span className={`tag text-xs shrink-0 ${stageInfo.color}`}>{stageInfo.label}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-zinc-600 text-sm py-2">Немає прив&apos;язаних ідей</p>
        )}
      </div>

      {/* Meta */}
      <div className="text-xs text-zinc-700 text-center space-y-1">
        <div>Створено: {formatDate(person.created_at)}</div>
        <div>Оновлено: {formatDate(person.updated_at)}</div>
      </div>
    </div>
  );
}
