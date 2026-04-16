'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CardActions, LoadingSpinner, ErrorMessage, formatDate } from '@/components/CardActions';

const STAGES = ['Planning', 'MVP', 'Beta', 'Active', 'Paused'];
const STAGE_CLASSES = {
  'Planning': 'stage-planning',
  'MVP':      'stage-mvp',
  'Beta':     'stage-beta',
  'Active':   'stage-active',
  'Paused':   'stage-paused',
};

export default function ProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string,string>>({});
  const [saving, setSaving] = useState(false);
  const [showPersonPicker, setShowPersonPicker] = useState(false);
  const [showOppPicker, setShowOppPicker] = useState(false);
  const [allPeople, setAllPeople] = useState<any[]>([]);
  const [allOpps, setAllOpps] = useState<any[]>([]);
  const [linkingPerson, setLinkingPerson] = useState(false);
  const [linkingOpp, setLinkingOpp] = useState(false);

  useEffect(() => { load(); }, [id]);

  async function load() {
    setLoading(true);
    try {
      const data = await api.getProject(Number(id));
      setProject(data);
      setForm({
        name: data.name,
        description: data.description,
        goal: data.goal,
        stage: data.stage,
        bottleneck: data.bottleneck,
        tags: data.tags || '',
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function openPersonPicker() {
    const people = await api.listPeople();
    setAllPeople(people);
    setShowPersonPicker(true);
  }

  async function openOppPicker() {
    const opps = await api.listOpportunities();
    setAllOpps(opps);
    setShowOppPicker(true);
  }

  async function linkPerson(personId: number) {
    setLinkingPerson(true);
    try {
      await api.createLink('project', Number(id), 'person', personId);
      await load();
      setShowPersonPicker(false);
    } catch (e) { alert(e.message); }
    finally { setLinkingPerson(false); }
  }

  async function linkOpp(oppId: number) {
    setLinkingOpp(true);
    try {
      await api.createLink('project', Number(id), 'opportunity', oppId);
      await load();
      setShowOppPicker(false);
    } catch (e) { alert(e.message); }
    finally { setLinkingOpp(false); }
  }

  async function save() {
    setSaving(true);
    try {
      const updated = await api.updateProject(Number(id), form);
      setProject(updated);
      setEditing(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm('Видалити цей проєкт?')) return;
    try {
      await api.deleteProject(Number(id));
      router.push('/');
    } catch (e) {
      alert(e.message);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!project) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-900/50 flex items-center justify-center text-2xl">🚀</div>
          {editing
            ? <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field text-xl font-bold" />
            : <h1 className="text-2xl font-bold">{project.name}</h1>
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

      {/* Stage */}
      {editing ? (
        <div className="card">
          <div className="label">Стадія</div>
          <select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))} className="input-field">
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      ) : (
        <span className={`tag ${STAGE_CLASSES[project.stage] || 'stage-planning'}`}>{project.stage || 'Planning'}</span>
      )}

      {/* Info */}
      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-zinc-400">ℹ️ Про проєкт</h3>
        {[
          { key: 'description', label: 'Опис' },
          { key: 'goal', label: 'Мета (KPI)' },
          { key: 'bottleneck', label: 'Вузьке місце / Наступний крок' },
          { key: 'tags', label: 'Теги' },
        ].map(({ key, label }) => (
          <div key={key}>
            <div className="label">{label}</div>
            {editing
              ? <textarea value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="input-field min-h-[60px]" />
              : <p className="text-zinc-200 whitespace-pre-wrap">{project[key] || '—'}</p>
            }
          </div>
        ))}
      </div>

      {/* People */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-zinc-400">👤 Команда</h3>
          <button onClick={openPersonPicker} className="btn-secondary text-xs py-1.5 px-3 rounded-xl">+ Прив&apos;язати</button>
        </div>
        {showPersonPicker && (
          <div className="mb-3 p-3 bg-zinc-900/80 border border-zinc-700/50 rounded-xl space-y-1.5">
            {allPeople.filter(p => !project.people?.some(lp => lp.id === p.id)).map(p => (
              <button key={p.id} onClick={() => linkPerson(p.id)} disabled={linkingPerson} className="w-full text-left px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm transition-colors disabled:opacity-50">
                {p.name}
              </button>
            ))}
            {allPeople.filter(p => !project.people?.some(lp => lp.id === p.id)).length === 0 && <p className="text-zinc-600 text-xs">Всі люди вже прив&apos;язані</p>}
            <button onClick={() => setShowPersonPicker(false)} className="w-full text-center text-xs text-zinc-600 hover:text-zinc-400 mt-2">Закрити</button>
          </div>
        )}
        {project.people?.length > 0 ? (
          <div className="space-y-2">
            {project.people.map(p => (
              <Link key={p.id} href={`/people/${p.id}`} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors">
                <span>👤</span>
                <span className="text-zinc-200">{p.name}</span>
                {p.role && <span className="text-xs text-zinc-500 ml-auto">{p.role}</span>}
              </Link>
            ))}
          </div>
        ) : !showPersonPicker && <p className="text-zinc-500 text-sm">Немає учасників</p>}
      </div>

      {/* Opportunities */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-zinc-400">🧩 Можливості</h3>
          <button onClick={openOppPicker} className="btn-secondary text-xs py-1.5 px-3 rounded-xl">+ Прив&apos;язати</button>
        </div>
        {showOppPicker && (
          <div className="mb-3 p-3 bg-zinc-900/80 border border-zinc-700/50 rounded-xl space-y-1.5">
            {allOpps.filter(o => !project.opportunities?.some(lo => lo.id === o.id)).map(o => (
              <button key={o.id} onClick={() => linkOpp(o.id)} disabled={linkingOpp} className="w-full text-left px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm transition-colors disabled:opacity-50">
                {o.name}
              </button>
            ))}
            {allOpps.filter(o => !project.opportunities?.some(lo => lo.id === o.id)).length === 0 && <p className="text-zinc-600 text-xs">Всі можливості вже прив&apos;язані</p>}
            <button onClick={() => setShowOppPicker(false)} className="w-full text-center text-xs text-zinc-600 hover:text-zinc-400 mt-2">Закрити</button>
          </div>
        )}
        {project.opportunities?.length > 0 ? (
          <div className="space-y-2">
            {project.opportunities.map(o => (
              <Link key={o.id} href={`/opportunities/${o.id}`} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors">
                <span className="text-zinc-200">{o.name}</span>
                {o.category && <span className="tag bg-purple-900/50 text-purple-300 text-xs ml-auto">{o.category}</span>}
              </Link>
            ))}
          </div>
        ) : !showOppPicker && <p className="text-zinc-500 text-sm">Немає прив&apos;язаних можливостей</p>}
      </div>

      {/* Meta */}
      <div className="text-xs text-zinc-600">
        Створено: {formatDate(project.created_at)} · Оновлено: {formatDate(project.updated_at)}
      </div>
    </div>
  );
}