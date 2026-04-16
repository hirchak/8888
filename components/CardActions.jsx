'use client';

export function CardActions({ editing, onEdit, onCancel, onSave, saving, onDelete }) {
  return (
    <div className="flex gap-2 shrink-0">
      {editing ? (
        <>
          <button onClick={onCancel} className="btn-secondary text-sm">Скасувати</button>
          <button onClick={onSave} disabled={saving} className="btn-primary text-sm">
            {saving ? '...' : 'Зберегти'}
          </button>
        </>
      ) : (
        <>
          <button onClick={onEdit} className="btn-secondary text-sm">Редагувати</button>
          <button onClick={onDelete} className="btn-danger text-sm">Видалити</button>
        </>
      )}
    </div>
  );
}

export function LoadingSpinner() {
  return <div className="flex justify-center py-20"><div className="spinner" /></div>;
}

export function ErrorMessage({ error }) {
  return (
    <div className="text-center py-20 space-y-3">
      <div className="text-red-400 text-lg font-medium">⚠️ Помилка</div>
      <div className="text-zinc-500 text-sm max-w-sm mx-auto">{error}</div>
    </div>
  );
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return dateStr.replace('T', ' ').slice(0, 16);
}

export function EntityBadge({ entity, children }) {
  const map = {
    person:       'tag tag-people',
    project:      'tag tag-project',
    idea:         'tag tag-idea',
    opportunity:  'tag tag-opportunity',
  };
  return <span className={map[entity] || 'tag'}>{children}</span>;
}