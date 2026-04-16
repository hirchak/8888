'use client';
import { useState } from 'react';
import { useEntityParser } from '@/hooks/useEntityParser';

export default function VoicePage() {
  const { proposal, loading, rawText, parse, reset } = useEntityParser();
  const [confirmed, setConfirmed] = useState(false);
  const [manualText, setManualText] = useState('');

  const handleTextSubmit = () => {
    if (manualText.trim()) {
      parse(manualText.trim());
    }
  };

  const handleConfirm = async () => {
    for (const entity of proposal || []) {
      await fetch(`/api/${entity.type}`, {
        method: 'POST',
        body: JSON.stringify({ name: entity.name }),
        headers: { 'Content-Type': 'application/json' }
      });
    }
    setConfirmed(true);
    setManualText('');
    setTimeout(reset, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="gradient-text text-2xl font-bold">🎤 Голосовий ввід</h1>
      
      {!proposal && !loading && (
        <div className="cyber-card space-y-4">
          <div className="text-center py-4">
            <div className="text-4xl mb-4">🎙️</div>
            <h2 className="text-lg font-semibold mb-2">Голосові повідомлення</h2>
            <p className="text-zinc-400 text-sm">
              Найкраще — скидай голосові напряму в Telegram бот <span className="text-cyan-400">@seos_prosvit_bot</span>
            </p>
            <p className="text-zinc-500 text-xs mt-2">
              Я отримаю, транскрибую і запропоную що створити
            </p>
          </div>
          
          <div className="divider" />
          
          <div>
            <label className="label">Або введи текст вручну:</label>
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Опиши кого/що хочеш додати..."
              className="input-field h-24 resize-none"
            />
            <button 
              onClick={handleTextSubmit}
              disabled={!manualText.trim()}
              className="btn-primary w-full mt-3"
            >
              Проаналізувати
            </button>
          </div>
        </div>
      )}
      
      {loading && (
        <div className="cyber-card text-center py-8">
          <div className="spinner mx-auto mb-4" />
          <p className="text-zinc-400">Аналізую текст...</p>
        </div>
      )}
      
      {proposal && !confirmed && (
        <div className="cyber-card space-y-4">
          <h2 className="text-lg font-semibold">📋 Що знайдено:</h2>
          
          {proposal.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-zinc-400">Нічого не знайдено в тексті.</p>
              <p className="text-zinc-500 text-sm mt-1">Спробуй написати: "додай Петра" або "проєкт новий сайт"</p>
            </div>
          ) : (
            <>
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
            </>
          )}
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
