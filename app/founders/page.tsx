'use client';

const FOUNDERS = [
  {
    name: 'Юрій',
    username: '@Hirchak',
    role: 'SEO, Кофаундер, Стратег, СМО',
    zones: ['ідеї + реалізація', 'кодування', 'AI боти', 'маркетинг'],
    talents: ['спокій', 'стратегічність', 'націленість на результат'],
    antiFocus: ['рутина без мети', 'бюрократія без сенсу', 'хаос в комунікаціях'],
    gradientFrom: 'from-cyan-600',
    gradientTo: 'to-violet-600',
    accent: 'cyan',
  },
  {
    name: 'Андрій',
    username: '@andrisav',
    role: 'Founder & Project Lead — Automation & Marketing Agency',
    zones: ['етична агенція', 'бізнес-автоматизація', 'маркетинг', 'координація команди'],
    talents: ['AI workflows', 'international project management', '6 мов'],
    antiFocus: ['мікроменеджмент', 'безоплатна робота', 'токсичні проєкти'],
    gradientFrom: 'from-violet-600',
    gradientTo: 'to-cyan-600',
    accent: 'violet',
  },
];

function FounderCard({ founder, index }) {
  return (
    <div
      className="founder-card group relative"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* Glow top */}
      <div className={`absolute -top-8 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-15 transition-opacity duration-700 bg-gradient-to-b ${founder.gradientFrom} to-transparent`} />

      {/* Avatar */}
      <div className={`w-16 h-16 sm:w-20 md:w-24 mx-auto mb-4 sm:mb-5 rounded-2xl bg-gradient-to-br ${founder.gradientFrom} ${founder.gradientTo} flex items-center justify-center text-3xl sm:text-4xl font-bold text-white shadow-xl`}>
        {founder.name[0]}
      </div>

      {/* Name + Badge */}
      <div className="flex items-center justify-center gap-3 mb-1">
        <h2 className="text-2xl font-bold text-white">{founder.name}</h2>
        <span className={`tag text-xs bg-${founder.accent}-900/60 text-${founder.accent}-300 border border-${founder.accent}-700/40`}>
          Кофаундер
        </span>
      </div>
      <p className="text-center text-zinc-400 text-sm mb-6">{founder.username}</p>
      <p className="text-center text-zinc-300 text-sm font-medium mb-7 leading-snug">{founder.role}</p>

      {/* Three blocks */}
      <div className="space-y-4">

        {/* Зони */}
        <div className="cyber-section">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Зони</span>
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/40 to-transparent" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {founder.zones.map((z) => (
              <span key={z} className="tag bg-cyan-900/30 text-cyan-300 border border-cyan-800/40 text-xs">
                {z}
              </span>
            ))}
          </div>
        </div>

        {/* Таланти */}
        <div className="cyber-section">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Таланти</span>
            <div className="h-px flex-1 bg-gradient-to-r from-violet-500/40 to-transparent" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {founder.talents.map((t) => (
              <span key={t} className="tag bg-violet-900/30 text-violet-300 border border-violet-800/40 text-xs">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Анти-фокус */}
        <div className="cyber-section">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Анти-фокус</span>
            <div className="h-px flex-1 bg-gradient-to-r from-red-500/30 to-transparent" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {founder.antiFocus.map((a) => (
              <span key={a} className="tag bg-red-900/20 text-red-300/80 border border-red-800/30 text-xs">
                ✕ {a}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function FoundersPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <div className="hero-gradient rounded-2xl p-8 mb-10 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">Команда AI Nexus</h1>
        <p className="text-zinc-400 text-sm">Два фаундери, одна місія — будувати етичну AI-екосистему</p>
      </div>

      {/* Cards grid — sticky on desktop */}
      <div className="grid md:grid-cols-2 gap-6 lg:sticky lg:top-6">
        {FOUNDERS.map((founder, i) => (
          <FounderCard key={founder.name} founder={founder} index={i} />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-10 text-center">
        <p className="text-zinc-500 text-sm">
          Хочеш приєднатися?{' '}
          <a href="https://t.me/hirchak" className="text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-2">
            Напиши Юрію
          </a>
          {' '}або{' '}
          <a href="https://t.me/andrisav" className="text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-2">
            Андрію
          </a>
        </p>
      </div>
    </div>
  );
}
