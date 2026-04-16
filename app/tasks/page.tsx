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
      <div className="relative cyber-card w-full max-w-md p-6">
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
    // done at bottom
    if (a.status !== b.status) return a.status === 'done' ? 1 : -1;
    // then by date
    if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    // then by priority
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            📅 Задачі
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {openCount} відкритих
            {overdueCount > 0 && <span className="text-red-400 ml-2">· {overdueCount} прострочених</span>}
          </p>
        </div>
        <button
          onClick={() => { setEditTask(null); setShowModal(true); }}
          className="btn-primary"
        >
          + Нова задача
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
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
    </div>
  );
}
