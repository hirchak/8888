'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'nexus_email_capture_dismissed';

export default function EmailCapturePopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Show only once per user
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    // Show after 5 seconds
    const timer = setTimeout(() => {
      setVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Exit intent detection
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    let triggered = false;
    function handleMouseLeave(e) {
      if (triggered) return;
      if (e.clientY <= 0) {
        triggered = true;
        setVisible(true);
      }
    }
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  function handleClose() {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  }

  function validateEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) {
      setError('Введіть коректний email');
      return;
    }
    // POST to leads API
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source: 'email-capture-popup' })
    }).catch(console.error);
    localStorage.setItem('nexus_user_email', email);
    localStorage.setItem(STORAGE_KEY, 'true');
    setSubmitted(true);
    setTimeout(() => {
      setVisible(false);
    }, 2500);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md">
        {/* Glow border */}
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-cyan-600/40 via-violet-600/40 to-cyan-600/40 blur-sm" />

        <div className="relative bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl shadow-black/60 overflow-hidden">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-all duration-200 text-sm"
            aria-label="Закрити"
          >
            ✕
          </button>

          {/* Background glow blobs */}
          <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

          {!submitted ? (
            <>
              {/* Header */}
              <div className="mb-6">
                <div className="text-4xl mb-4">🧠</div>
                <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                  Отримайте безкоштовний
                  <span className="block bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                    AI Brain Audit
                  </span>
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Вставте будь-який текст — AI витягне всіх людей, ідеї, компанії. Без реєстрації.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="your@email.com"
                    className="input-field w-full"
                    autoFocus
                    autoComplete="email"
                  />
                  {error && (
                    <p className="text-red-400 text-xs mt-1.5 pl-1">{error}</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full btn-primary py-3 text-base"
                >
                  Отримати доступ →
                </button>
              </form>

              <p className="text-zinc-600 text-xs text-center mt-4">
                Без спаму. Тільки для вас.
              </p>
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="text-center py-6">
                <div className="text-5xl mb-5">✅</div>
                <h2 className="text-2xl font-bold text-white mb-2">Перевірте пошту!</h2>
                <p className="text-zinc-400 text-sm">
                  Ми надіслали посилання на <span className="text-cyan-400 font-medium">{email}</span>
                </p>
                <div className="mt-6 w-12 h-12 mx-auto rounded-full bg-emerald-900/30 border border-emerald-700/40 flex items-center justify-center">
                  <span className="text-emerald-400 text-xl">✓</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}