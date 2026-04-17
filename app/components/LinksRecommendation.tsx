'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

// Entity type icons and labels
const ENTITY_META = {
  people: { icon: '👤', label: 'Людина', tagClass: 'tag-people', hrefPrefix: '/people/' },
  projects: { icon: '🚀', label: 'Проєкт', tagClass: 'tag-project', hrefPrefix: '/projects/' },
  ideas: { icon: '💡', label: 'Ідея', tagClass: 'tag-idea', hrefPrefix: '/ideas/' },
  opportunities: { icon: '🧩', label: 'Можливість', tagClass: 'tag-opportunity', hrefPrefix: '/opportunities/' },
};

// Which entity types can be linked TO from each source type
const LINK_TARGETS: Record<string, { type: string; label: string }[]> = {
  people: [
    { type: 'project', label: 'Проєкт' },
    { type: 'idea', label: 'Ідея' },
  ],
  projects: [
    { type: 'person', label: 'Людина' },
    { type: 'opportunity', label: 'Можливість' },
  ],
  ideas: [
    { type: 'person', label: 'Людина' },
    { type: 'opportunity', label: 'Можливість' },
  ],
  opportunities: [
    { type: 'project', label: 'Проєкт' },
    { type: 'idea', label: 'Ідея' },
  ],
};

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-emerald-900/90 border border-emerald-700/60 text-emerald-200 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2 animate-fade-in">
      <span>✅</span> {message}
    </div>
  );
}

export default function LinksRecommendation({ entityType, entityId }: {
  entityType: 'people' | 'projects' | 'ideas' | 'opportunities';
  entityId: number;
}) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkingTarget, setLinkingTarget] = useState<{ entityId: number; entityType: string; entityName: string } | null>(null);
  const [selectedLinkType, setSelectedLinkType] = useState<string>('');
  const [linking, setLinking] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    api.getRecommendations(entityType, entityId, 5)
      .then(data => setRecommendations(data.recommendations || []))
      .catch(() => setRecommendations([]))
      .finally(() => setLoading(false));
  }, [entityType, entityId]);

  const targets = LINK_TARGETS[entityType] || [];

  async function handleLink() {
    if (!linkingTarget || !selectedLinkType) return;
    setLinking(true);
    try {
      // Determine direction: sourceType -> targetType
      // selectedLinkType is the type of the target we're linking TO
      await api.createLink(entityType, entityId, selectedLinkType, linkingTarget.entityId);
      setToast(`Зв'язок "${linkingTarget.entityName}" додано!`);
      setLinkingTarget(null);
      setSelectedLinkType('');
      // Refresh recommendations
      const data = await api.getRecommendations(entityType, entityId, 5);
      setRecommendations(data.recommendations || []);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLinking(false);
    }
  }

  if (loading) return null;
  if (recommendations.length === 0) return null;

  return (
    <>
      <div className="cyber-card">
        <h3 className="text-sm font-semibold text-zinc-400 mb-4 flex items-center gap-2">
          <span>🔗</span> Можливо вас зацікавить
        </h3>
        <div className="space-y-2">
          {recommendations.map((rec, idx) => {
            const meta = ENTITY_META[rec.entityType as keyof typeof ENTITY_META];
            if (!meta) return null;
            return (
              <div
                key={`${rec.entityType}-${rec.entityId}-${idx}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/40 hover:border-zinc-600/60 hover:bg-zinc-800 transition-all duration-200 group"
              >
                <div className="text-xl shrink-0">{meta.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`${meta.hrefPrefix}${rec.entityId}`}
                      className="text-zinc-200 font-medium text-sm hover:text-white transition-colors truncate"
                    >
                      {rec.entityName}
                    </Link>
                    <span className={`tag text-xs shrink-0 ${meta.tagClass}`}>{meta.label}</span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5 truncate">{rec.reason}</div>
                </div>
                <button
                  onClick={() => {
                    setLinkingTarget({ entityId: rec.entityId, entityType: rec.entityType, entityName: rec.entityName });
                    setSelectedLinkType(targets[0]?.type || '');
                  }}
                  className="btn-secondary text-xs py-1.5 px-3 rounded-xl shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Зв&apos;язати
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Link Modal */}
      {linkingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700/60 rounded-2xl p-5 w-full max-w-sm shadow-2xl">
            <h4 className="text-white font-semibold mb-1">Зв&apos;язати з</h4>
            <p className="text-zinc-400 text-sm mb-4 truncate">{linkingTarget.entityName}</p>

            <div className="label mb-2">Тип зв&apos;язку</div>
            <div className="space-y-2 mb-4">
              {targets.map(t => (
                <button
                  key={t.type}
                  onClick={() => setSelectedLinkType(t.type)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    selectedLinkType === t.type
                      ? 'bg-violet-600/80 text-white border border-violet-500/60'
                      : 'bg-zinc-800 text-zinc-300 border border-zinc-700/50 hover:bg-zinc-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setLinkingTarget(null); setSelectedLinkType(''); }}
                className="btn-secondary flex-1 py-2.5 rounded-xl text-sm"
              >
                Скасувати
              </button>
              <button
                onClick={handleLink}
                disabled={!selectedLinkType || linking}
                className="btn-primary flex-1 py-2.5 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {linking ? '...' : '✅ Зв&apos;язати'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}
