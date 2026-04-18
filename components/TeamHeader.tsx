'use client';

import { useState, useEffect } from 'react';

const MODES = ['welcome', 'datetime', 'team'];
const MODE_LABELS = { welcome: '💬 Вітання', datetime: '🕐 Час', team: '🏷️ Команда' };

function pad(n: number) { return n < 10 ? '0' + n : n; }

function DateTimeView({ city, country }: { city: string; country: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const dateStr = now.toLocaleDateString('uk-UA', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="text-center space-y-1">
      <div className="text-3xl font-bold text-white tracking-widest">{timeStr}</div>
      <div className="text-zinc-400 text-sm">{dateStr}</div>
      <div className="text-cyan-400 text-xs mt-1">
        {city} · {country}
      </div>
    </div>
  );
}

function WelcomeView({ text, quote, quoteAuthor }: { text: string; quote: string; quoteAuthor: string }) {
  return (
    <div className="text-center space-y-3 max-w-lg mx-auto">
      <div className="text-zinc-300 text-lg font-medium">{text}</div>
      {quote && (
        <blockquote className="text-zinc-500 text-sm italic border-l-2 border-cyan-500/40 pl-3 text-left">
          «{quote}»{quoteAuthor && <span className="block text-zinc-600 text-xs mt-1 not-italic">— {quoteAuthor}</span>}
        </blockquote>
      )}
    </div>
  );
}

function TeamView({ name, motto, logo }: { name: string; motto: string; logo: string }) {
  return (
    <div className="text-center space-y-2">
      <div className="text-4xl">{logo}</div>
      <div className="text-xl font-bold text-white">{name}</div>
      {motto && <div className="text-cyan-400/70 text-sm italic">{motto}</div>}
    </div>
  );
}

function SettingsModal({ config, onSave, onClose }: { config: any; onSave: (c: any) => void; onClose: () => void }) {
  const [form, setForm] = useState(config);

  function set(key: string, val: string) {
    setForm((f: any) => ({ ...f, [key]: val }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-cyan-600/20 via-violet-600/20 to-cyan-600/20" />
        <div className="relative">
          <h2 className="text-lg font-bold text-white mb-5">Налаштування простору</h2>

          <div className="space-y-4">
            {/* Mode selector */}
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">Режим</label>
              <div className="flex gap-2">
                {MODES.map(m => (
                  <button
                    key={m}
                    onClick={() => set('mode', m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      form.mode === m
                        ? 'bg-cyan-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {MODE_LABELS[m]}
                  </button>
                ))}
              </div>
            </div>

            {form.mode === 'welcome' && (
              <>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Вітання</label>
                  <input value={form.welcomeText} onChange={e => set('welcomeText', e.target.value)} className="input-field w-full text-sm" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Цитата</label>
                  <textarea value={form.quote} onChange={e => set('quote', e.target.value)} className="input-field w-full text-sm resize-none h-16" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Автор цитати</label>
                  <input value={form.quoteAuthor} onChange={e => set('quoteAuthor', e.target.value)} className="input-field w-full text-sm" />
                </div>
              </>
            )}

            {form.mode === 'datetime' && (
              <>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Місто</label>
                  <input value={form.city} onChange={e => set('city', e.target.value)} className="input-field w-full text-sm" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Країна</label>
                  <input value={form.country} onChange={e => set('country', e.target.value)} className="input-field w-full text-sm" />
                </div>
              </>
            )}

            {form.mode === 'team' && (
              <>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Назва</label>
                  <input value={form.teamName} onChange={e => set('teamName', e.target.value)} className="input-field w-full text-sm" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Мото</label>
                  <input value={form.teamMotto} onChange={e => set('teamMotto', e.target.value)} className="input-field w-full text-sm" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Лого (емодзі)</label>
                  <input value={form.teamLogo} onChange={e => set('teamLogo', e.target.value)} className="input-field w-full text-sm" />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 btn-secondary text-sm py-2">Скасувати</button>
            <button onClick={() => onSave(form)} className="flex-1 btn-primary text-sm py-2">Зберегти</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamHeader() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetch('/api/team-config')
      .then(r => r.json())
      .then(data => { setConfig(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function handleSave(updated: any) {
    // Optimistic update — switch immediately
    const prev = config;
    setConfig((c: any) => ({ ...c, ...updated }));
    setShowSettings(false);
    fetch('/api/team-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
      .then(r => r.json())
      .then(data => setConfig(data))
      .catch(() => { setConfig(prev); });
  }

  if (loading || !config) {
    return <div className="hero-gradient rounded-2xl p-6 mb-2 h-24 animate-pulse" />;
  }

  return (
    <>
      <div className="hero-gradient rounded-2xl p-6 mb-2 relative group">
        {/* Settings button */}
        <button
          onClick={() => setShowSettings(true)}
          className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/80 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-all duration-200 opacity-0 group-hover:opacity-100 text-xs"
          title="Налаштування"
        >
          ⚙️
        </button>

        {/* Mode tabs */}
        <div className="flex justify-center gap-1 mb-3">
          {MODES.map(m => (
            <button
              key={m}
              onClick={() => handleSave({ ...config, mode: m })}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                config.mode === m
                  ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/30'
                  : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[60px] flex items-center justify-center">
          {config.mode === 'datetime' && (
            <DateTimeView city={config.city} country={config.country} />
          )}
          {config.mode === 'welcome' && (
            <WelcomeView text={config.welcomeText} quote={config.quote} quoteAuthor={config.quoteAuthor} />
          )}
          {config.mode === 'team' && (
            <TeamView name={config.teamName} motto={config.teamMotto} logo={config.teamLogo} />
          )}
        </div>
      </div>

      {showSettings && (
        <SettingsModal config={config} onSave={handleSave} onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}
