'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CardActions, LoadingSpinner, ErrorMessage, formatDate } from '@/components/CardActions';
import LinksRecommendation from '@/app/components/LinksRecommendation';

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
  type PersonForm = Record<string, string | boolean>;
  const [form, setForm] = useState<PersonForm>({});
  const [saving, setSaving] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [showIdeaPicker, setShowIdeaPicker] = useState(false);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [allIdeas, setAllIdeas] = useState<any[]>([]);
  const [linkingProject, setLinkingProject] = useState<number | null>(null);
  const [linkingIdea, setLinkingIdea] = useState<number | null>(null);

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
        username: data.username || '',
        isPublic: data.isPublic === true,
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

  async function openProjectPicker() {
    const projects = await api.listProjects();
    setAllProjects(projects);
    setShowProjectPicker(true);
  }

  async function openIdeaPicker() {
    const ideas = await api.listIdeas();
    setAllIdeas(ideas);
    setShowIdeaPicker(true);
  }

  async function linkProject(projectId: number) {
    setLinkingProject(projectId);
    try {
      await api.createLink('person', Number(id), 'project', projectId);
      await load();
      setShowProjectPicker(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setLinkingProject(null);
    }
  }

  async function linkIdea(ideaId: number) {
    setLinkingIdea(ideaId);
    try {
      await api.createLink('person', Number(id), 'idea', ideaId);
      await load();
      setShowIdeaPicker(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setLinkingIdea(null);
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
                ? <input value={String(form.name || '')} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field text-xl font-bold" />
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
            onCancel={() => { setEditing(false); setForm({ name: person.name, role: person.role, expertise: person.expertise, company: person.company, contact: person.contact, summary: person.summary, interests: person.interests, tags: person.tags || '', username: person.username || '', isPublic: person.isPublic === true }); }}
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
                value={String(form.summary || '')}
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
              <input value={String(form[key] || '')} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="input-field" />
            ) : (
              <p className="text-zinc-200">{person[key] || <span className="text-zinc-600">—</span>}</p>
            )}
          </div>
        ))}

        {/* Username field */}
        <div>
          <div className="label">Username (публічний URL)</div>
          {editing ? (
            <input value={String(form.username || '')} onChange={e => setForm(f => ({ ...f, username: e.target.value.replace(/^@/, '') }))} className="input-field" placeholder="hirchak" />
          ) : (
            <p className="text-zinc-200">
              {person.username ? (
                <span>
                  <a href={`/${person.username}`} className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">@{person.username}</a>
                  <span className="text-zinc-500 text-xs ml-2">(переглянути публічний профіль)</span>
                </span>
              ) : <span className="text-zinc-600">—</span>}
            </p>
          )}
        </div>

        {/* isPublic toggle — only shown in edit mode */}
        {editing && (
          <div className="flex items-center gap-3 pt-2 border-t border-zinc-800/80">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={Boolean(form.isPublic)}
                onChange={e => setForm(f => ({ ...f, isPublic: e.target.checked }))}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-cyan-500 focus:ring-cyan-500/30 focus:ring-offset-0"
              />
              <div>
                <span className="text-sm font-medium text-zinc-200">Публічний профіль</span>
                <p className="text-xs text-zinc-500">Дозволить ділитися посиланням /username</p>
              </div>
            </label>
          </div>
        )}
        {!editing && person.username && (
          <div className="flex items-center gap-2 pt-1">
            <span className={`tag text-xs ${person.isPublic ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-800/40' : 'bg-zinc-800/60 text-zinc-500 border border-zinc-700/50'}`}>
              {person.isPublic ? '🌐 Публічний' : '🔒 Приватний'}
            </span>
          </div>
        )}
      </div>

      {/* Projects */}
      <div className="cyber-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
            <span>🚀</span> Проєкти
          </h3>
          <button onClick={openProjectPicker} className="btn-secondary text-xs py-1.5 px-3 rounded-xl">
            + Прив&apos;язати
          </button>
        </div>

        {showProjectPicker && (
          <div className="mb-3 p-3 bg-zinc-900/80 border border-zinc-700/50 rounded-xl space-y-1.5">
            <div className="text-xs text-zinc-500 mb-2 font-medium">Оберіть проєкт:</div>
            {allProjects.filter(p => !person.projects?.some(lp => lp.id === p.id)).map(p => (
              <button
                key={p.id}
                onClick={() => linkProject(p.id)}
                disabled={linkingProject !== null}
                className="w-full text-left px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm transition-colors disabled:opacity-50"
              >
                {p.name}
              </button>
            ))}
            {allProjects.filter(p => !person.projects?.some(lp => lp.id === p.id)).length === 0 && (
              <p className="text-zinc-600 text-xs">Всі проєкти вже прив&apos;язані</p>
            )}
            <button onClick={() => setShowProjectPicker(false)} className="w-full text-center text-xs text-zinc-600 hover:text-zinc-400 mt-2">Закрити</button>
          </div>
        )}

        {person.projects?.length > 0 ? (
          <div className="space-y-2">
            {person.projects.map(p => (
              <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/40 hover:border-zinc-600/60 transition-all duration-200 group">
                <span className="text-zinc-200 font-medium group-hover:text-white transition-colors">{p.name}</span>
                <span className="tag bg-emerald-900/50 text-emerald-300 text-xs border border-emerald-800/40 shrink-0">{p.stage || '—'}</span>
              </Link>
            ))}
          </div>
        ) : !showProjectPicker && (
          <p className="text-zinc-600 text-sm py-2">Немає прив&apos;язаних проєктів</p>
        )}
      </div>

      {/* Ideas */}
      <div className="cyber-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
            <span>💡</span> Ідеї
          </h3>
          <button onClick={openIdeaPicker} className="btn-secondary text-xs py-1.5 px-3 rounded-xl">
            + Прив&apos;язати
          </button>
        </div>

        {showIdeaPicker && (
          <div className="mb-3 p-3 bg-zinc-900/80 border border-zinc-700/50 rounded-xl space-y-1.5">
            <div className="text-xs text-zinc-500 mb-2 font-medium">Оберіть ідею:</div>
            {allIdeas.filter(i => !person.ideas?.some(li => li.id === i.id)).map(i => (
              <button
                key={i.id}
                onClick={() => linkIdea(i.id)}
                disabled={linkingIdea !== null}
                className="w-full text-left px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm transition-colors disabled:opacity-50"
              >
                {i.name}
              </button>
            ))}
            {allIdeas.filter(i => !person.ideas?.some(li => li.id === i.id)).length === 0 && (
              <p className="text-zinc-600 text-xs">Всі ідеї вже прив&apos;язані</p>
            )}
            <button onClick={() => setShowIdeaPicker(false)} className="w-full text-center text-xs text-zinc-600 hover:text-zinc-400 mt-2">Закрити</button>
          </div>
        )}

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
        ) : !showIdeaPicker && (
          <p className="text-zinc-600 text-sm py-2">Немає прив&apos;язаних ідей</p>
        )}
      </div>

      {/* Recommendations */}
      <LinksRecommendation entityType="people" entityId={Number(id)} />

      {/* Meta */}
      <div className="text-xs text-zinc-700 text-center space-y-1">
        <div>Створено: {formatDate(person.created_at)}</div>
        <div>Оновлено: {formatDate(person.updated_at)}</div>
      </div>
    </div>
  );
}
