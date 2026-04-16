'use client';
import { useState } from 'react';
import VoiceInput from '@/components/VoiceInput';
import { useEntityParser } from '@/hooks/useEntityParser';

export default function VoicePage() {
  const { proposal, loading, rawText, parse, reset } = useEntityParser();
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = async () => {
    for (const entity of proposal || []) {
      await fetch(`/api/${entity.type}`, {
        method: 'POST',
        body: JSON.stringify({ name: entity.name }),
        headers: { 'Content-Type': 'application/json' }
      });
    }
    setConfirmed(true);
    setTimeout(reset, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="gradient-text text-2xl font-bold">🎤 Голосовий ввід</h1>

      {!proposal && !loading && (
        <div className="cyber-card text-center py-8">
          <p className="text-zinc-400 mb-4">Натисни запис і розкажи що хочеш додати</p>
          <VoiceInput onTranscript={parse} />
        </div>
      )}

      {loading && (
        <div className="cyber-card text-center py-8">
          <div className="spinner mx-auto mb-4" />
          <p className="text-zinc-400">Аналізую...</p>
        </div>
      )}

      {proposal && !confirmed && (
        <div className="cyber-card space-y-4">
          <h2 className="text-lg font-semibold">📋 Що знайдено:</h2>
          <div className="space-y-2">
            {proposal.map((entity, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl">
                <span className="text-2xl">
                  {entity.type === 'people' ? '👤' :
                   entity.type === 'project' ? '📁' :
                   entity.type === 'idea' ? '💡' : '⭐'}
                </span>
                <div>
                  <p className="font-medium">{entity.name}</p>
                  <p className="text-xs text-zinc-500 capitalize">{entity.type}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={handleConfirm} className="btn-primary flex-1">
              ✅ Створити все
            </button>
            <button onClick={reset} className="btn-secondary">
              Відміна
            </button>
          </div>
        </div>
      )}

      {confirmed && (
        <div className="cyber-card text-center py-6 bg-emerald-900/20 border-emerald-700">
          <p className="text-emerald-400 text-lg">✅ Збережено!</p>
        </div>
      )}
    </div>
  );
}
