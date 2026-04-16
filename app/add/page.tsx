'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

const TABS = [
  { key: 'person', label: '👤 Людина' },
  { key: 'project', label: '🚀 Проєкт' },
  { key: 'idea', label: '💡 Ідея' },
  { key: 'opportunity', label: '🧩 Можливість' },
];

const IDEA_STATUSES = ['Hypothesis', 'Research', 'Resources', 'Ready', 'Launched', 'Paused'];
const PROJECT_STAGES = ['Planning', 'MVP', 'Beta', 'Active', 'Paused'];
const OPP_CATEGORIES = ['#Інструмент', '#Фінанси', '#Зв\'язки', '#Експертиза', '#Капітал', '#Партнерство'];
const SOURCE_TYPES = [['external', 'Від партнера'], ['own_project', 'Внутрішній ресурс']];

function Field({ label, value, onChange, type = 'text', placeholder, required = false }) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      {type === 'textarea'
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="input-field min-h-[100px] resize-y" />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="input-field" />
      }
    </div>
  );
}

function AddForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultTab = searchParams.get('type') || 'person';

  const [tab, setTab] = useState(defaultTab);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [person, setPerson] = useState({ name: '', role: '', expertise: '', company: '', contact: '', summary: '', interests: '' });
  const [project, setProject] = useState({ name: '', description: '', goal: '', stage: 'Planning', bottleneck: '' });
  const [idea, setIdea] = useState({ name: '', pitch: '', roi: '', origin: '', author: '', requirements: '', matched_assets: '', status: 'Hypothesis' });
  const [opp, setOpp] = useState({ name: '', description: '', category: '', source_type: 'external' });

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let created;
      if (tab === 'person') {
        if (!person.name.trim()) { setError("Ім'я обов'язкове"); setSaving(false); return; }
        created = await api.createPerson(person);
        router.push(`/people/${created.id}`);
      } else if (tab === 'project') {
        if (!project.name.trim()) { setError("Назва обов'язкова"); setSaving(false); return; }
        created = await api.createProject(project);
        router.push(`/projects/${created.id}`);
      } else if (tab === 'idea') {
        if (!idea.name.trim()) { setError("Назва обов'язкова"); setSaving(false); return; }
        created = await api.createIdea(idea);
        router.push(`/ideas/${created.id}`);
      } else {
        if (!opp.name.trim()) { setError("Назва обов'язкова"); setSaving(false); return; }
        created = await api.createOpportunity(opp);
        router.push(`/opportunities/${created.id}`);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Додати сутність</h1>
        <p className="text-zinc-500 text-sm">Оберіть тип та заповніть форму</p>
      </div>

      {/* Tabs — cyber pill style */}
      <div className="flex gap-1.5 mb-8 bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800/80">
        {TABS.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              tab === t.key
                ? 'bg-gradient-to-r from-cyan-600 to-violet-600 text-white shadow-lg shadow-cyan-900/20'
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/80'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-950/50 border border-red-800/50 rounded-xl text-red-300 text-sm flex items-center gap-2">
          <span className="text-lg">⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Person */}
        {tab === 'person' && (
          <>
            <div className="cyber-card space-y-5">
              <Field label="Ім&apos;я" value={person.name} onChange={v => setPerson(p => ({ ...p, name: v }))} required placeholder="Олександр Петренко" />
              <Field label="Роль / Посада" value={person.role} onChange={v => setPerson(p => ({ ...p, role: v }))} placeholder="Senior Developer" />
              <Field label="Експертиза" value={person.expertise} onChange={v => setPerson(p => ({ ...p, expertise: v }))} placeholder="AI, Python, Архітектура" />
              <Field label="Компанія" value={person.company} onChange={v => setPerson(p => ({ ...p, company: v }))} placeholder="TechCorp" />
              <Field label="Контакти" value={person.contact} onChange={v => setPerson(p => ({ ...p, contact: v }))} placeholder="email@t.com, @username" />
              <Field label="Інтереси" value={person.interests} onChange={v => setPerson(p => ({ ...p, interests: v }))} placeholder="AI, крипто, нерухомість" />
              <Field label="Підсумок" value={person.summary} onChange={v => setPerson(p => ({ ...p, summary: v }))} type="textarea" placeholder="Короткий опис..." />
            </div>
          </>
        )}

        {/* Project */}
        {tab === 'project' && (
          <>
            <div className="cyber-card space-y-5">
              <Field label="Назва" value={project.name} onChange={v => setProject(p => ({ ...p, name: v }))} required placeholder="AI Nexus Platform" />
              <Field label="Опис" value={project.description} onChange={v => setProject(p => ({ ...p, description: v }))} type="textarea" placeholder="Що це за проєкт..." />
              <Field label="Мета (KPI)" value={project.goal} onChange={v => setProject(p => ({ ...p, goal: v }))} placeholder="$10k MRR, реліз в AppStore..." />
              <div>
                <label className="label">Стадія</label>
                <select value={project.stage} onChange={e => setProject(p => ({ ...p, stage: e.target.value }))} className="input-field">
                  {PROJECT_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Field label="Вузьке місце" value={project.bottleneck} onChange={v => setProject(p => ({ ...p, bottleneck: v }))} type="textarea" placeholder="Що зараз гальмує..." />
            </div>
          </>
        )}

        {/* Idea */}
        {tab === 'idea' && (
          <>
            <div className="cyber-card space-y-5">
              <Field label="Назва" value={idea.name} onChange={v => setIdea(i => ({ ...i, name: v }))} required placeholder="Закритий клуб для інвесторів" />
              <Field label="Elevator Pitch" value={idea.pitch} onChange={v => setIdea(i => ({ ...i, pitch: v }))} type="textarea" placeholder="Короткий опис ідеї..." />
              <Field label="Потенційний ROI" value={idea.roi} onChange={v => setIdea(i => ({ ...i, roi: v }))} type="textarea" placeholder="Що отримаємо від реалізації..." />
              <Field label="Причина виникнення" value={idea.origin} onChange={v => setIdea(i => ({ ...i, origin: v }))} type="textarea" placeholder="Натхнення, побачена проблема..." />
              <Field label="Автор / Ініціатор" value={idea.author} onChange={v => setIdea(i => ({ ...i, author: v }))} placeholder="Ім&apos;я автора" />
              <Field label="Що потрібно для старту" value={idea.requirements} onChange={v => setIdea(i => ({ ...i, requirements: v }))} type="textarea" placeholder="Яких ресурсів бракує..." />
              <Field label="Наявні ресурси" value={idea.matched_assets} onChange={v => setIdea(i => ({ ...i, matched_assets: v }))} type="textarea" placeholder="Що вже є..." />
              <div>
                <label className="label">Статус</label>
                <select value={idea.status} onChange={e => setIdea(i => ({ ...i, status: e.target.value }))} className="input-field">
                  {IDEA_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </>
        )}

        {/* Opportunity */}
        {tab === 'opportunity' && (
          <>
            <div className="cyber-card space-y-5">
              <Field label="Назва" value={opp.name} onChange={v => setOpp(o => ({ ...o, name: v }))} required placeholder="Безкоштовні кредити на AWS" />
              <Field label="Опис" value={opp.description} onChange={v => setOpp(o => ({ ...o, description: v }))} type="textarea" placeholder="Деталі можливості..." />
              <div>
                <label className="label">Тег / Категорія</label>
                <select value={opp.category} onChange={e => setOpp(o => ({ ...o, category: e.target.value }))} className="input-field">
                  <option value="">Оберіть тег...</option>
                  {OPP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Тип джерела</label>
                <select value={opp.source_type} onChange={e => setOpp(o => ({ ...o, source_type: e.target.value }))} className="input-field">
                  {SOURCE_TYPES.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                </select>
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary flex-1 py-3 text-base">
            {saving ? 'Збереження...' : '💾 Зберегти'}
          </button>
          <Link href="/" className="btn-secondary py-3 px-6">Скасувати</Link>
        </div>
      </form>
    </div>
  );
}

export default function AddPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-24"><div className="spinner" /></div>}>
      <AddForm />
    </Suspense>
  );
}
