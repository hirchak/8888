'use client';
import { Users, FolderKanban, Lightbulb, TrendingUp, CheckSquare, TrendingUp as TrendingUpIcon } from 'lucide-react';

const kpis = [
  {
    label: 'Люди',
    value: '112',
    change: '+6',
    changeLabel: 'this week',
    icon: Users,
    iconClass: 'kpi-icon-purple',
    accent: '#A855F7',
  },
  {
    label: 'Проєкти',
    value: '18',
    change: '+2',
    changeLabel: 'this week',
    icon: FolderKanban,
    iconClass: 'kpi-icon-blue',
    accent: '#3B82F6',
  },
  {
    label: 'Ідеї',
    value: '37',
    change: '+5',
    changeLabel: 'this week',
    icon: Lightbulb,
    iconClass: 'kpi-icon-amber',
    accent: '#F59E0B',
  },
  {
    label: 'Можливості',
    value: '24',
    change: '+3',
    changeLabel: 'this week',
    icon: TrendingUp,
    iconClass: 'kpi-icon-green',
    accent: '#34C779',
  },
  {
    label: 'Задачі активні',
    value: '86',
    change: '+27',
    changeLabel: 'on week',
    icon: CheckSquare,
    iconClass: 'kpi-icon-blue',
    accent: '#3B82F6',
  },
];

export default function KPIRow() {
  return (
    <div className="grid grid-cols-5 gap-3 mb-5">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="glass-card p-4 glow-hover transition-all duration-200 fade-in-up">
          <div className="flex items-start justify-between mb-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${kpi.iconClass}`}>
              <kpi.icon size={18} />
            </div>
            <div className="flex items-center gap-0.5 text-xs" style={{ color: '#34C779' }}>
              <TrendingUpIcon size={11} />
              <span className="font-medium">{kpi.change}</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-0.5">{kpi.value}</div>
          <div className="text-xs text-gray-500">{kpi.label}</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(52,199,123,0.7)' }}>{kpi.change} {kpi.changeLabel}</div>
        </div>
      ))}
    </div>
  );
}
