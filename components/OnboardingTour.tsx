'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'nexus_onboarding_done';

const steps = [
  {
    id: 1,
    emoji: '👋',
    title: 'Вітаємо в Nexus!',
    subtitle: 'Ваш другий мозок для управління людьми, проєктами, ідеями та можливостями.',
    action: null,
    cta: 'Далі →',
  },
  {
    id: 2,
    emoji: '👤',
    title: 'Додайте першу людину',
    subtitle: 'Зберігайте контакти партнерів, експертів, інвесторів — все в одному місці.',
    action: 'person',
    cta: 'Додати людину',
    actionHref: '/add?type=person',
  },
  {
    id: 3,
    emoji: '💡',
    title: 'Додайте першу ідею',
    subtitle: 'Зафіксуйте гіпотезу, пітч або концепцію. Система допоможе оцінити ROI та ресурси.',
    action: 'idea',
    cta: 'Додати ідею',
    actionHref: '/add?type=idea',
  },
  {
    id: 4,
    emoji: '🔗',
    title: 'Зв\'яжіть сутності',
    subtitle: 'Створіть ланцюжок: Людина → Ідея → Проєкт. Знаходьте зв\'язки, які генерують цінність.',
    action: null,
    cta: 'Далі →',
  },
  {
    id: 5,
    emoji: '🎤',
    title: 'Спробуйте AI-парсинг',
    subtitle: 'Говоріть або пишіть — AI автоматично розпізнає тип сутності та створить записи.',
    action: 'voice',
    cta: 'Спробувати',
    actionHref: '/voice',
  },
];

function ProgressDots({ current, total }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i < current
              ? 'w-6 bg-gradient-to-r from-cyan-500 to-violet-500'
              : i === current
              ? 'w-3 bg-zinc-500'
              : 'w-1.5 bg-zinc-700'
          }`}
        />
      ))}
    </div>
  );
}

function StepContent({ step, onAction }) {
  return (
    <div className="text-center">
      <div className="text-5xl mb-6">{step.emoji}</div>
      <h2 className="text-xl font-bold text-white mb-3">{step.title}</h2>
      <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-xs mx-auto">{step.subtitle}</p>

      {step.action && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-sm font-medium transition-all duration-200 mb-6"
        >
          <span>→</span>
          {step.cta}
        </button>
      )}
    </div>
  );
}

export default function OnboardingTour({ onClose }) {
  const [step, setStep] = useState(0);
  const [closed, setClosed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (done === 'true') {
      setClosed(true);
    }
  }, []);

  function handleNext() {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      handleFinish();
    }
  }

  function handleAction() {
    const currentStep = steps[step];
    if (currentStep?.actionHref) {
      handleFinish();
      router.push(currentStep.actionHref);
    }
  }

  function handleFinish() {
    localStorage.setItem(STORAGE_KEY, 'true');
    setClosed(true);
    if (onClose) onClose();
  }

  if (closed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleFinish} />

      {/* Modal */}
      <div className="relative w-full max-w-sm">
        {/* Glow */}
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-cyan-600/30 via-violet-600/30 to-cyan-600/30 blur-sm" />

        <div className="relative bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl shadow-black/50">
          {/* Close button */}
          <button
            onClick={handleFinish}
            className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors text-xs"
          >
            ✕
          </button>

          {/* Progress */}
          <div className="mb-8">
            <ProgressDots current={step} total={steps.length} />
            <div className="text-xs text-zinc-600 mt-2">{step + 1} / {steps.length}</div>
          </div>

          {/* Content */}
          <StepContent
            step={steps[step]}
            onAction={handleAction}
          />

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={handleFinish}
              className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors"
            >
              Пропустити
            </button>

            {!steps[step]?.action && (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                {step === steps.length - 1 ? 'Завершити' : steps[step]?.cta}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
