'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

const PRIORITY_COLORS = {
  high: 'bg-red-900/50 text-red-300 border border-red-800/40',
  medium: 'bg-amber-900/50 text-amber-300 border border-amber-800/40',
  low: 'bg-zinc-700/50 text-zinc-300 border border-zinc-600/40',
};

const ENTITY_TYPE_LABELS = {
  person: '👤 Людина',
  project: '🚀 Проєкт',
  idea: '💡 Ідея',
  opportunity: '🧩 Можливість',
};

const FILTER_TABS = [
  { key: 'all', label: 'Всі' },
  { key: 'today', label: 'Сьогодні' },
  { key: 'week', label: 'Цей тиждень' },
  { key: 'overdue', label: 'Прострочені' },
];

function isOverdue(task) {
  return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function entityHref(task) {
  if (!task.entityId || !task.entityType) return null;
  return `/${task.entityType}s/${task.entityId}`;
}

// ── Task Modal ─────────────────────────────────────────────
function TaskModal({ onClose, onSave, initial }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [dueDate, setDueDate] = useState(initial?.dueDate || '');
  const [priority, setPriority] = useState(initial?.priority || 'medium');
  const [entityType, setEntityType] = useState(initial?.entityType || '');
  const [entityId, setEntityId] = useState(initial?.entityId || '');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        dueDate: dueDate || null,
        priority,
        entityType: entityType || null,
        entityId: entityId ? Number(entityId) : null,
      });
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative cyber-card w-full max-w-md max-w-sm mx-4 p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-white mb-5">
          {initial ? '✏️ Редагувати задачу' : '📅 Нова задача'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Назва <span className="text-red-400 ml-0.5">*</span></label>
            <input
              className="input-field"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Що потрібно зробити..."
              required
              autoFocus
            />
          </div>
          <div>
            <label className="label">Дедлайн</label>
            <input
              type="date"
              className="input-field"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Пріоритет</label>
            <select
              className="input-field"
              value={priority}
              onChange={e => setPriority(e.target.value)}
            >
              <option value="high">🔴 Високий</option>
              <option value="medium">🟡 Середній</option>
              <option value="low">⚪ Низький</option>
            </select>
          </div>
          <div>
            <label className="label">Зв&apos;язати з</label>
            <div className="flex gap-2">
              <select
                className="input-field flex-1"
                value={entityType}
                onChange={e => { setEntityType(e.target.value); setEntityId(''); }}
              >
                <option value="">—</option>
                <option value="person">👤 Людина</option>
                <option value="project">🚀 Проєкт</option>
                <option value="idea">💡 Ідея</option>
                <option value="opportunity">🧩 Можливість</option>
              </select>
              {entityType && (
                <input
                  type="number"
                  className="input-field w-24"
                  value={entityId}
                  onChange={e => setEntityId(e.target.value)}
                  placeholder="ID"
                />
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? '...' : (initial ? 'Зберегти' : 'Створити')}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Скасувати
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── AI Query Modal ────────────────────────────────────────
function AIQueryModal({ tasks, onClose }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const res = await fetch('/api/tasks/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, tasks }),
      });
      if (!res.ok) throw new Error('Помилка запиту');
      const data = await res.json();
      setResults(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setQuery('');
    setResults(null);
    setError('');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-cyan-600/30 via-violet-600/30 to-cyan-600/30" />
        <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              🧠 Спитай AI
            </h3>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-xl">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Наприклад: термінові задачі на сьогодні, задачі по AI Nexus, для Юрія..."
              className="input-field w-full resize-none h-20 text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <button type="submit" disabled={loading || !query.trim()} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {loading ? <><div className="spinner w-4 h-4" /> Шукаю...</> : '🔍 Шукати'}
              </button>
              {results && (
                <button type="button" onClick={handleClear} className="btn-secondary">Очистити</button>
              )}
            </div>
          </form>

          {error && (
            <div className="mt-3 text-red-400 text-sm">{error}</div>
          )}

          {results && (
            <div className="mt-4 space-y-3">
              <div className="text-xs text-zinc-500">
                Знайдено: <span className="text-cyan-400 font-bold">{results.filtered.length}</span> задач
                {results.filters?.priority && <span className="ml-2">· пріоритет: {results.filters.priority}</span>}
                {results.filters?.dateFilter && <span className="ml-2">· {results.filters.dateFilter}</span>}
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {results.filtered.map((task: any) => (
                  <div key={task.id} className="flex items-start gap-2 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                    <span className={`w-4 h-4 rounded border mt-0.5 shrink-0 ${
                      task.status === 'done' ? 'bg-emerald-600 border-emerald-500' : 'border-zinc-600'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                        {task.title}
                      </div>
                      <div className="flex gap-2 mt-1">
                        {task.dueDate && (
                          <span className="text-xs text-zinc-500">📅 {formatDate(task.dueDate)}</span>
                        )}
                        <span className={`text-xs ${
                          task.priority === 'high' ? 'text-red-400' :
                          task.priority === 'medium' ? 'text-amber-400' : 'text-zinc-500'
                        }`}>
                          {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '⚪'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {results.filtered.length === 0 && (
                  <div className="text-center py-4 text-zinc-500 text-sm">Нічого не знайдено</div>
                )}
              </div>
            </div>
          )}

          {!results && !loading && (
            <div className="mt-4 text-xs text-zinc-600 space-y-1">
              <p>Приклади запитів:</p>
              <p>· "термінові задачі на сьогодні"</p>
              <p>· "всі задачі по темі AI"</p>
              <p>· "для Юрія"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Zen Mode ──────────────────────────────────────────────
function ZenMode({ tasks, onExit, focusTasks, setFocusTasks }) {
  const sessionTasks = focusTasks.length > 0
    ? tasks.filter((t: any) => focusTasks.includes(t.id))
    : tasks.filter((t: any) => t.status !== 'done');

  function toggleFocusTask(id) {
    if (focusTasks.includes(id)) {
      setFocusTasks(focusTasks.filter(fid => fid !== id));
    } else {
      setFocusTasks([...focusTasks, id]);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800/60">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧘</span>
          <div>
            <div className="text-white font-bold">Режим фокусу</div>
            <div className="text-zinc-500 text-xs">{sessionTasks.length} задач</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFocusTasks([])}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white text-xs transition-colors"
          >
            Показати всі
          </button>
          <button
            onClick={onExit}
            className="px-4 py-1.5 rounded-lg bg-violet-600 text-white text-sm hover:bg-violet-500 transition-colors"
          >
            ✕ Вийти
          </button>
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-3">
          {sessionTasks.map((task: any) => {
            const inFocus = focusTasks.includes(task.id);
            return (
              <div
                key={task.id}
                className={`flex items-start gap-4 p-4 rounded-2xl transition-all ${
                  task.status === 'done'
                    ? 'bg-zinc-900/40 opacity-60'
                    : inFocus
                    ? 'bg-violet-950/40 border border-violet-500/30'
                    : 'bg-zinc-900/60 border border-zinc-800/60'
                }`}
              >
                <button
                  onClick={() => toggleFocusTask(task.id)}
                  className={`mt-1 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                    task.status === 'done'
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : focusTasks.includes(task.id)
                      ? 'bg-violet-600 border-violet-500'
                      : 'border-zinc-600 hover:border-violet-500'
                  }`}
                >
                  {task.status === 'done' || inFocus ? '✓' : ''}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`text-lg font-medium ${task.status === 'done' ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                    {task.title}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    {task.dueDate && (
                      <span className={`text-sm ${isOverdue(task) ? 'text-red-400' : 'text-zinc-500'}`}>
                        📅 {formatDate(task.dueDate)}
                      </span>
                    )}
                    <span className={`text-sm ${
                      task.priority === 'high' ? 'text-red-400' :
                      task.priority === 'medium' ? 'text-amber-400' : 'text-zinc-500'
                    }`}>
                      {task.priority === 'high' ? '🔴 Високий' : task.priority === 'medium' ? '🟡 Середній' : '⚪ Низький'}
                    </span>
                    {task.entityType && (
                      <span className="text-sm text-zinc-500">
                        {ENTITY_TYPE_LABELS[task.entityType]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Task Card ─────────────────────────────────────────────
function TaskCard({ task, onToggle, onDelete, onEdit }) {
  const overdue = isOverdue(task);
  const href = entityHref(task);

  return (
    <div className="cyber-card group">
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(task.id, task.status === 'done' ? 'open' : 'done')}
          className={`mt-0.5 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
            task.status === 'done'
              ? 'bg-emerald-600 border-emerald-500 text-white text-xs'
              : 'border-zinc-600 hover:border-violet-500'
          }`}
        >
          {task.status === 'done' && '✓'}
        </button>
        <div className="flex-1 min-w-0">
          <div className={`font-medium mb-1 ${task.status === 'done' ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
            {task.title}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {task.dueDate && (
              <span className={`tag ${overdue ? 'bg-red-900/50 text-red-300 border border-red-800/40' : 'bg-zinc-800 text-zinc-400'}`}>
                {overdue ? '🔴 ' : '📅 '}
                {formatDate(task.dueDate)}
              </span>
            )}
            <span className={`tag ${PRIORITY_COLORS[task.priority]}`}>
              {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '⚪'}
              {' '}{task.priority === 'high' ? 'Високий' : task.priority === 'medium' ? 'Середній' : 'Низький'}
            </span>
            {task.entityType && (
              <Link
                href={href || '#'}
                className="tag bg-zinc-800 text-zinc-400 hover:text-cyan-400 transition-colors"
              >
                {ENTITY_TYPE_LABELS[task.entityType]}
                {task.entityId ? ` #${task.entityId}` : ''}
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-800/60">
        <button
          onClick={() => onEdit(task)}
          className="btn-ghost text-xs py-1 px-2"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="btn-ghost text-xs py-1 px-2 text-red-400 hover:text-red-300"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

// ── Main Tasks Page ────────────────────────────────────────
export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAiQuery, setShowAiQuery] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [focusTasks, setFocusTasks] = useState([]);

  // Load focus tasks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nexus_zen_focus');
    if (saved) {
      try {
        setFocusTasks(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nexus_zen_focus', JSON.stringify(focusTasks));
  }, [focusTasks]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listTasks();
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = tasks.filter(task => {
    if (filter === 'overdue') return isOverdue(task);
    if (filter === 'today') {
      if (!task.dueDate || task.status === 'done') return false;
      const today = new Date();
      const due = new Date(task.dueDate);
      return due.getFullYear() === today.getFullYear() &&
        due.getMonth() === today.getMonth() &&
        due.getDate() === today.getDate();
    }
    if (filter === 'week') {
      if (!task.dueDate || task.status === 'done') return false;
      const now = Date.now();
      const due = new Date(task.dueDate).getTime();
      const week = 7 * 24 * 60 * 60 * 1000;
      return due >= now && due <= now + week;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'done' ? 1 : -1;
    if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    const pOrder = { high: 0, medium: 1, low: 2 };
    return (pOrder[a.priority] ?? 1) - (pOrder[b.priority] ?? 1);
  });

  async function handleSave(data) {
    if (editTask) {
      const updated = await api.updateTask(editTask.id, data);
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    } else {
      const created = await api.createTask(data);
      setTasks(prev => [...prev, created]);
    }
    setEditTask(null);
  }

  async function handleToggle(id, status) {
    const updated = await api.updateTask(id, { status });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  }

  async function handleDelete(id) {
    if (!confirm('Видалити задачу?')) return;
    await api.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  const openCount = tasks.filter(t => t.status !== 'done').length;
  const overdueCount = tasks.filter(t => isOverdue(t)).length;

  return (
    <>
      {zenMode && (
        <ZenMode
          tasks={tasks}
          onExit={() => setZenMode(false)}
          focusTasks={focusTasks}
          setFocusTasks={setFocusTasks}
        />
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              📅 Задачі
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {openCount} відкритих
              {overdueCount > 0 && <span className="text-red-400 ml-2">· {overdueCount} прострочених</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAiQuery(true)}
              className="px-3 py-2 rounded-xl bg-zinc-800/80 text-zinc-400 hover:text-white border border-zinc-700/60 text-sm transition-colors"
            >
              🧠 AI
            </button>
            <button
              onClick={() => setZenMode(true)}
              className="px-3 py-2 rounded-xl bg-zinc-800/80 text-zinc-400 hover:text-white border border-zinc-700/60 text-sm transition-colors"
            >
              🧘 Фокус
            </button>
            <button
              onClick={() => { setEditTask(null); setShowModal(true); }}
              className="btn-primary"
            >
              + Нова задача
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === tab.key
                  ? 'bg-violet-600 text-white'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Task list */}
        {loading ? (
          <div className="flex justify-center py-16"><div className="spinner" /></div>
        ) : sorted.length === 0 ? (
          <div className="cyber-card border-dashed border-2 border-zinc-800 flex flex-col items-center justify-center py-16 rounded-2xl">
            <div className="text-4xl mb-3">📋</div>
            <div className="text-zinc-500 text-sm mb-4">Немає задач у цій категорії</div>
            <button onClick={() => { setEditTask(null); setShowModal(true); }} className="btn-primary text-sm">
              + Створити першу задачу
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={task => { setEditTask(task); setShowModal(true); }}
              />
            ))}
          </div>
        )}

        {showModal && (
          <TaskModal
            initial={editTask}
            onClose={() => { setShowModal(false); setEditTask(null); }}
            onSave={handleSave}
          />
        )}

        {showAiQuery && (
          <AIQueryModal tasks={tasks} onClose={() => setShowAiQuery(false)} />
        )}
      </div>
    </>
  );
}
