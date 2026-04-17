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
  { key: 'quick', label: '⚡ Швидкий запис' },
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

// ── Sample Data ─────────────────────────────────────────────
async function loadSampleData() {
  const created = [];

  const p1 = await api.createPerson({ name: 'Андрій Пиха', role: 'Партнер', expertise: 'Marketing, Sales', company: 'SEO-Open', contact: '@andrisav', summary: 'Партнер та маркетинг-спеціаліст, Prague', interests: 'marketing, ai, automation', tags: 'partner, marketing', username: 'andrisav', isPublic: true });
  created.push(p1);
  const p2 = await api.createPerson({ name: 'Юрій Hirchak', role: 'Фаундер', expertise: 'AI, Full-stack', company: 'AI Nexus', contact: '@Hirchak', summary: 'Фаундер платформи AI Nexus, Warsaw', interests: 'ai, platform, saas', tags: 'founder, developer', username: 'hirchak', isPublic: true });
  created.push(p2);
  const p3 = await api.createPerson({ name: 'Маркіян К.', role: 'Юрист', expertise: 'IT Law, Contracts', company: 'Юрфірма', contact: 'markiyan@example.com', summary: 'Юрист з досвідом у IT-праві, Київ', interests: 'law, it, contracts', tags: 'lawyer, legal', isPublic: false });
  created.push(p3);

  const proj1 = await api.createProject({ name: 'SEO-Open', description: 'Маркетингова агенція з фокусом на SEO та контент-маркетинг для B2B', goal: '10 клієнтів, $5k MRR', stage: 'Active', bottleneck: 'Потрібен sales-менеджер', tags: 'marketing, seo, agency', isPublic: true });
  created.push(proj1);
  const proj2 = await api.createProject({ name: 'AI Nexus', description: 'Платформа для управління знаннями фаундерів — люди, проєкти, ідеї, можливості', goal: '1000 користувачів, $10k MRR', stage: 'MVP', bottleneck: 'Онбординг та AI-парсинг', tags: 'ai, saas, knowledge-management', isPublic: true });
  created.push(proj2);

  const i1 = await api.createIdea({ name: 'Dead Capital Tracker', pitch: 'Інструмент для відстеження невикористаних ресурсів (контакти, ідеї, можливості)', roi: 'Збільшення утилізації ресурсів на 30%', origin: 'Спостереження за власними невикористаними контактами', author: 'Юрій', requirements: 'UI/UX дизайнер, 2 тижні розробки', status: 'Hypothesis', tags: 'tool, capital, tracking', isPublic: true });
  created.push(i1);
  const i2 = await api.createIdea({ name: 'Voice → Entities', pitch: 'AI-парсинг голосових повідомлень у структуровані сутності Nexus', roi: 'Прискорення введення даних у 5 разів', origin: 'Фіча з Roadmap AI Nexus', author: 'Андрій', requirements: 'Whisper API, GPT-4', status: 'Research', tags: 'ai, voice, parsing', isPublic: true });
  created.push(i2);

  const o1 = await api.createOpportunity({ name: 'Знижка на Notion API', description: '50% знижка на Notion API план для стартапів — акція до кінця кварталу', category: '#Інструмент', source_type: 'external', tags: 'notion, api, discount', isPublic: true });
  created.push(o1);
  const o2 = await api.createOpportunity({ name: 'Партнерство з виробником', description: 'Виробник шукає маркетингового партнера для виходу на ринки ЄС', category: '#Партнерство', source_type: 'external', tags: 'partnership, manufacturing, eu', isPublic: true });
  created.push(o2);

  // Links
  try { await api.createLink('person', p1.id, 'project', proj1.id); } catch(e) {}
  try { await api.createLink('person', p2.id, 'project', proj2.id); } catch(e) {}
  try { await api.createLink('idea', i2.id, 'project', proj2.id); } catch(e) {}

  return created.length;
}

function SampleDataBanner() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleLoad() {
    setLoading(true);
    try {
      const count = await loadSampleData();
      setDone(true);
      setTimeout(() => router.push('/'), 2000);
    } catch(e) {
      alert('Помилка: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mb-6 p-4 bg-emerald-950/50 border border-emerald-800/50 rounded-xl text-emerald-300 text-sm flex items-center gap-2">
        <span>✅</span> Приклад дані завантажено! Перенаправляємо на головну...
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-sm font-semibold text-zinc-200">🧪 Не знаєте з чого почати?</div>
          <div className="text-xs text-zinc-500 mt-0.5">Завантажте 10 прикладів сутностей з демо-даними</div>
        </div>
        <button
          onClick={handleLoad}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          {loading ? 'Завантаження...' : '🚀 Завантажити приклад'}
        </button>
      </div>
    </div>
  );
}

// ── Quick Add ───────────────────────────────────────────────
function parseQuickInput(text: string) {
  const result: { type: string; name: string; details: string }[] = [];
  const lines = text.split('\n').filter(l => l.trim());

  const ideaKeywords = ['ідея', 'ідею', 'гіпотеза', 'думаю', 'можна зробити', 'може бути', 'variant', 'concept', 'pitch', 'startup'];
  const personKeywords = ['ceo', 'cto', 'coo', 'founder', 'партнер', 'експерт', 'людина', 'contact', 'зв\'язок', 'знайшов'];
  const projectKeywords = ['проєкт', 'проект', 'продукт', 'launch', 'build', 'MVP', 'реліз', 'app', 'platform'];
  const oppKeywords = ['можливість', 'оффер', 'пропозиція', 'bonus', 'знижка', 'access', 'free', 'кредит'];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();

    if (ideaKeywords.some(k => lower.includes(k))) {
      result.push({ type: 'idea', name: trimmed.slice(0, 60), details: trimmed });
    } else if (oppKeywords.some(k => lower.includes(k))) {
      result.push({ type: 'opportunity', name: trimmed.slice(0, 60), details: trimmed });
    } else if (personKeywords.some(k => lower.includes(k))) {
      result.push({ type: 'person', name: trimmed.slice(0, 60), details: trimmed });
    } else if (projectKeywords.some(k => lower.includes(k))) {
      result.push({ type: 'project', name: trimmed.slice(0, 60), details: trimmed });
    } else {
      // Default: treat as idea if first char is capital or has common patterns
      result.push({ type: 'idea', name: trimmed.slice(0, 60), details: trimmed });
    }
  }

  return result;
}

function QuickAddForm() {
  const router = useRouter();
  const [raw, setRaw] = useState('');
  const [parsed, setParsed] = useState<{ type: string; name: string; details: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<string[]>([]);

  function handleRawChange(value: string) {
    setRaw(value);
    setParsed(parseQuickInput(value));
  }

  async function handleCreateAll() {
    setSaving(true);
    const made: string[] = [];
    try {
      for (const item of parsed) {
        if (item.type === 'person') {
          const p = await api.createPerson({ name: item.name, summary: item.details });
          made.push(`👤 ${p.name}`);
        } else if (item.type === 'project') {
          const p = await api.createProject({ name: item.name, description: item.details });
          made.push(`🚀 ${p.name}`);
        } else if (item.type === 'idea') {
          const p = await api.createIdea({ name: item.name, pitch: item.details });
          made.push(`💡 ${p.name}`);
        } else {
          const p = await api.createOpportunity({ name: item.name, description: item.details });
          made.push(`🧩 ${p.name}`);
        }
      }
      setCreated(made);
      setRaw('');
      setParsed([]);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="cyber-card">
        <h3 className="text-sm font-semibold text-zinc-400 mb-3">Вставте текст</h3>
        <textarea
          value={raw}
          onChange={e => handleRawChange(e.target.value)}
          placeholder={`Вставте будь-який текст — нотатки, ідеї, контакти...

Приклади:
— Ідея: Закритий клуб для інвесторів
— CEO Олександр Петренко, TechCorp
— Проєкт: AI Nexus Platform
— Можливість: Безкоштовні кредити на AWS`}
          className="input-field min-h-[200px] resize-y font-mono text-sm"
        />
        <p className="text-xs text-zinc-600 mt-2">Система автоматично визначить тип кожного рядка</p>
      </div>

      {parsed.length > 0 && (
        <div className="cyber-card">
          <h3 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
            <span>👁️</span> Попередній перегляд — буде створено:
          </h3>
          <div className="space-y-1.5 mb-4">
            {parsed.map((item, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-800/60 border border-zinc-700/40">
                <span className="text-lg">
                  {item.type === 'person' ? '👤' : item.type === 'project' ? '🚀' : item.type === 'idea' ? '💡' : '🧩'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-zinc-200 text-sm font-medium truncate">{item.name}</div>
                  <div className="text-zinc-600 text-xs truncate">{item.type}</div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleCreateAll}
            disabled={saving}
            className="btn-primary w-full py-3 text-base"
          >
            {saving ? 'Створення...' : `✅ Створити ${parsed.length} ${parsed.length === 1 ? 'запис' : 'записів'}`}
          </button>
        </div>
      )}

      {created.length > 0 && (
        <div className="cyber-card border border-emerald-800/40">
          <h3 className="text-sm font-semibold text-emerald-400 mb-3">✅ Створено:</h3>
          <div className="space-y-1">
            {created.map((c, i) => (
              <div key={i} className="text-zinc-300 text-sm">{c}</div>
            ))}
          </div>
          <button onClick={() => { setCreated([]); router.push('/'); }} className="btn-secondary w-full mt-4 py-2">
            На головну
          </button>
        </div>
      )}
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

  const [person, setPerson] = useState({ name: '', role: '', expertise: '', company: '', contact: '', summary: '', interests: '', tags: '', username: '', isPublic: false });
  const [project, setProject] = useState({ name: '', description: '', goal: '', stage: 'Planning', bottleneck: '', tags: '', isPublic: false });
  const [idea, setIdea] = useState({ name: '', pitch: '', roi: '', origin: '', author: '', requirements: '', matched_assets: '', status: 'Hypothesis', tags: '', isPublic: false });
  const [opp, setOpp] = useState({ name: '', description: '', category: '', source_type: 'external', tags: '', isPublic: false });

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

      <SampleDataBanner />

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
              <Field label="Username (без @)" value={person.username} onChange={v => setPerson(p => ({ ...p, username: v.replace(/^@/, '') }))} placeholder="hirchak" />
              <Field label="Роль / Посада" value={person.role} onChange={v => setPerson(p => ({ ...p, role: v }))} placeholder="Senior Developer" />
              <Field label="Експертиза" value={person.expertise} onChange={v => setPerson(p => ({ ...p, expertise: v }))} placeholder="AI, Python, Архітектура" />
              <Field label="Компанія" value={person.company} onChange={v => setPerson(p => ({ ...p, company: v }))} placeholder="TechCorp" />
              <Field label="Контакти" value={person.contact} onChange={v => setPerson(p => ({ ...p, contact: v }))} placeholder="email@t.com, @username" />
              <Field label="Інтереси" value={person.interests} onChange={v => setPerson(p => ({ ...p, interests: v }))} placeholder="AI, крипто, нерухомість" />
              <Field label="Теги" value={person.tags} onChange={v => setPerson(p => ({ ...p, tags: v }))} placeholder="ukraine, fintech, ai (comma-separated)" />
              <Field label="Підсумок" value={person.summary} onChange={v => setPerson(p => ({ ...p, summary: v }))} type="textarea" placeholder="Короткий опис..." />
              {/* Public toggle */}
              <div className="flex items-center gap-3 pt-2 border-t border-zinc-800/80">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={person.isPublic}
                    onChange={e => setPerson(p => ({ ...p, isPublic: e.target.checked }))}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-cyan-500 focus:ring-cyan-500/30 focus:ring-offset-0"
                  />
                  <div>
                    <span className="text-sm font-medium text-zinc-200">Зробити публічним</span>
                    <p className="text-xs text-zinc-500">Дозволить ділитися профілем через публічне посилання</p>
                  </div>
                </label>
              </div>
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
              <Field label="Теги" value={project.tags} onChange={v => setProject(p => ({ ...p, tags: v }))} placeholder="saas, b2b, ai (comma-separated)" />
              {/* Public toggle */}
              <div className="flex items-center gap-3 pt-2 border-t border-zinc-800/80">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={project.isPublic}
                    onChange={e => setProject(p => ({ ...p, isPublic: e.target.checked }))}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-emerald-500/30 focus:ring-offset-0"
                  />
                  <div>
                    <span className="text-sm font-medium text-zinc-200">Зробити публічним</span>
                    <p className="text-xs text-zinc-500">Відображатиметься у публічному профілі</p>
                  </div>
                </label>
              </div>
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
              <Field label="Теги" value={idea.tags} onChange={v => setIdea(i => ({ ...i, tags: v }))} placeholder="fintech, b2c, marketplace (comma-separated)" />
              <div>
                <label className="label">Статус</label>
                <select value={idea.status} onChange={e => setIdea(i => ({ ...i, status: e.target.value }))} className="input-field">
                  {IDEA_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {/* Public toggle */}
              <div className="flex items-center gap-3 pt-2 border-t border-zinc-800/80">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={idea.isPublic}
                    onChange={e => setIdea(i => ({ ...i, isPublic: e.target.checked }))}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500/30 focus:ring-offset-0"
                  />
                  <div>
                    <span className="text-sm font-medium text-zinc-200">Зробити публічним</span>
                    <p className="text-xs text-zinc-500">Відображатиметься у публічному профілі</p>
                  </div>
                </label>
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
              <Field label="Теги" value={opp.tags} onChange={v => setOpp(o => ({ ...o, tags: v }))} placeholder="aws, credits, cloud (comma-separated)" />
              {/* Public toggle */}
              <div className="flex items-center gap-3 pt-2 border-t border-zinc-800/80">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={opp.isPublic}
                    onChange={e => setOpp(o => ({ ...o, isPublic: e.target.checked }))}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-violet-500 focus:ring-violet-500/30 focus:ring-offset-0"
                  />
                  <div>
                    <span className="text-sm font-medium text-zinc-200">Зробити публічним</span>
                    <p className="text-xs text-zinc-500">Відображатиметься у публічному профілі</p>
                  </div>
                </label>
              </div>
            </div>
          </>
        )}

        {/* Quick Add */}
        {tab === 'quick' && <QuickAddForm />}

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
