'use client';

import { useEffect, useState, useCallback } from 'react';

export interface Badge {
  id: string;
  icon: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface Achievement {
  check: (ctx: AchievementContext) => boolean;
  badge: Badge;
}

export interface AchievementContext {
  totalEntities: number;
  ideasCount: number;
  linksCount: number;
  hasPublicEntity: boolean;
  hasFirstEntity: boolean;
  hasFirstLink: boolean;
}

const BADGE_DEFS: Achievement[] = [
  {
    check: (ctx) => ctx.hasFirstEntity,
    badge: {
      id: 'first-entity',
      icon: '🎯',
      name: 'Перший крок',
      description: 'Створена перша сутність',
      unlocked: false,
    },
  },
  {
    check: (ctx) => ctx.hasFirstLink,
    badge: {
      id: 'first-link',
      icon: '🔗',
      name: 'Перший зв\'язок',
      description: 'Створено перше лінкування',
      unlocked: false,
    },
  },
  {
    check: (ctx) => ctx.totalEntities >= 10,
    badge: {
      id: 'explorer',
      icon: '🧭',
      name: 'Розвідник',
      description: '10 сутностей у графі',
      unlocked: false,
    },
  },
  {
    check: (ctx) => ctx.ideasCount >= 10,
    badge: {
      id: 'many-ideas',
      icon: '💡',
      name: 'Багато ідей',
      description: '10 ідей створено',
      unlocked: false,
    },
  },
  {
    check: (ctx) => ctx.linksCount >= 10,
    badge: {
      id: 'networker',
      icon: '🌐',
      name: 'Мережевий',
      description: '10 зв\'язків створено',
      unlocked: false,
    },
  },
  {
    check: (ctx) => ctx.hasPublicEntity,
    badge: {
      id: 'public',
      icon: '🌍',
      name: 'Публічний',
      description: 'Перша публічна сутність',
      unlocked: false,
    },
  },
];

const STORAGE_KEY = 'nexus_achievements';

function loadAchievements(): Record<string, { unlocked: boolean; unlockedAt?: string }> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveAchievements(state: Record<string, { unlocked: boolean; unlockedAt?: string }>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ── Toast ────────────────────────────────────────────────────
interface ToastItem {
  id: string;
  badge: Badge;
  visible: boolean;
}

function Toast({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  useEffect(() => {
    toasts.forEach(t => {
      if (t.visible) {
        const timer = setTimeout(() => onDismiss(t.id), 4000);
        return () => clearTimeout(timer);
      }
    });
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="pointer-events-auto animate-fade-in flex items-center gap-3 px-4 py-3 rounded-2xl border border-cyan-500/40 bg-zinc-900/95 backdrop-blur shadow-xl shadow-cyan-500/20"
          style={{ minWidth: '260px', maxWidth: '340px' }}
        >
          <span className="text-2xl">{toast.badge.icon}</span>
          <div>
            <div className="text-xs text-cyan-400 font-semibold uppercase tracking-wide">Badge unlocked!</div>
            <div className="text-sm font-bold text-white">{toast.badge.name}</div>
            <div className="text-xs text-zinc-400">{toast.badge.description}</div>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="ml-auto text-zinc-500 hover:text-zinc-300 text-lg leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// ── BadgeCard ────────────────────────────────────────────────
function BadgeCard({ badge, glowing }: { badge: Badge; glowing?: boolean }) {
  return (
    <div
      className={`relative p-4 rounded-2xl border transition-all duration-300 ${
        badge.unlocked
          ? glowing
            ? 'bg-gradient-to-br from-cyan-950/60 to-violet-950/60 border-cyan-500/40 shadow-lg shadow-cyan-500/20'
            : 'bg-zinc-900/80 border-zinc-800/80'
          : 'bg-zinc-900/40 border-zinc-800/40 opacity-50'
      }`}
    >
      <div className={`text-3xl mb-2 ${badge.unlocked ? '' : 'grayscale'}`}>
        {badge.unlocked ? badge.icon : '🔒'}
      </div>
      <div className={`text-sm font-bold mb-1 ${badge.unlocked ? 'text-white' : 'text-zinc-500'}`}>
        {badge.name}
      </div>
      <div className="text-xs text-zinc-500 leading-relaxed">
        {badge.description}
      </div>
      {badge.unlocked && badge.unlockedAt && (
        <div className="text-[10px] text-zinc-600 mt-2 truncate">
          {new Date(badge.unlockedAt).toLocaleDateString('uk-UA')}
        </div>
      )}
    </div>
  );
}

// ── Main Badges component ───────────────────────────────────
interface BadgesProps {
  context?: AchievementContext;
  compact?: boolean;
}

export default function Badges({ context, compact = false }: BadgesProps) {
  const [saved, setSaved] = useState<Record<string, { unlocked: boolean; unlockedAt?: string }>>({});
  const [badges, setBadges] = useState<Badge[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Initialize badges and check achievements
  useEffect(() => {
    const stored = loadAchievements();
    setSaved(stored);

    const initial = BADGE_DEFS.map(def => ({
      ...def.badge,
      unlocked: stored[def.badge.id]?.unlocked ?? false,
      unlockedAt: stored[def.badge.id]?.unlockedAt,
    }));
    setBadges(initial);
    setLoaded(true);
  }, []);

  // Check achievements whenever context changes
  const checkAchievements = useCallback((ctx: AchievementContext) => {
    if (!loaded) return;

    setBadges(prev => {
      const next = [...prev];
      let changed = false;
      const newToasts: ToastItem[] = [];

      BADGE_DEFS.forEach(def => {
        const existing = next.find(b => b.id === def.badge.id);
        if (!existing) return;

        const shouldBeUnlocked = def.check(ctx);
        if (shouldBeUnlocked && !existing.unlocked) {
          const updated: Badge = {
            ...existing,
            unlocked: true,
            unlockedAt: new Date().toISOString(),
          };
          const idx = next.findIndex(b => b.id === def.badge.id);
          next[idx] = updated;
          changed = true;
          newToasts.push({ id: `toast-${updated.id}-${Date.now()}`, badge: updated, visible: true });
        }
      });

      if (changed) {
        const newSaved: Record<string, { unlocked: boolean; unlockedAt?: string }> = {};
        next.forEach(b => {
          newSaved[b.id] = { unlocked: b.unlocked, unlockedAt: b.unlockedAt };
        });
        saveAchievements(newSaved);
        setSaved(newSaved);

        if (newToasts.length > 0) {
          setToasts(prevT => [...prevT, ...newToasts]);
        }
      }

      return next;
    });
  }, [loaded]);

  // Run achievement check when context is provided
  useEffect(() => {
    if (context && loaded) {
      checkAchievements(context);
    }
  }, [context, loaded, checkAchievements]);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const unlockedBadges = badges.filter(b => b.unlocked);
  const lockedBadges = badges.filter(b => !b.unlocked);
  const displayBadges = compact ? unlockedBadges : badges;

  return (
    <>
      <div className={compact ? '' : 'cyber-card'}>
        {!compact && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <span>🏆</span> Досягнення
            </h3>
            <span className="text-xs text-zinc-600">
              {unlockedBadges.length}/{badges.length}
            </span>
          </div>
        )}

        {compact ? (
          <div className="flex flex-wrap gap-2">
            {displayBadges.map(badge => (
              <div key={badge.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60">
                <span className="text-base">{badge.unlocked ? badge.icon : '🔒'}</span>
                <span className={`text-xs font-medium ${badge.unlocked ? 'text-zinc-200' : 'text-zinc-600'}`}>
                  {badge.name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {displayBadges.map(badge => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        )}
      </div>

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

// Export helpers for use in other components
export { BADGE_DEFS, STORAGE_KEY, loadAchievements, saveAchievements };
