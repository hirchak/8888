'use client';
import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
const MONTHS = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];

const events = [
  { time: '10:00', title: 'Дзвінок з інвестором', platform: 'Zoom', color: '#A855F7' },
  { time: '14:00', title: 'Sprint Planning', platform: 'Google Meet', color: '#3B82F6' },
  { time: '16:30', title: 'Фінансовий огляд', platform: 'Zoom', color: '#34C779' },
];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Adjust: Monday = 0
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function CalendarWidget() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const days = getCalendarDays(year, month);

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  return (
    <div className="glass-card p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Calendar size={15} style={{ color: '#A855F7' }} />
          Календар
        </h2>
        <div className="flex items-center gap-1">
          <button onClick={prev} className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
            <ChevronLeft size={13} />
          </button>
          <span className="text-xs text-gray-300 w-28 text-center">
            {MONTHS[month]} {year}
          </span>
          <button onClick={next} className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs text-gray-600 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, idx) => {
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          return (
            <button
              key={idx}
              className={`aspect-square rounded-lg flex items-center justify-center text-xs transition-all
                ${day === null ? 'invisible' : ''}
                ${isToday ? 'font-bold ring-1 ring-offset-1 ring-offset-transparent' : 'text-gray-400 hover:text-white'}
              `}
              style={isToday ? { background: '#A855F7', color: '#fff' } : {}}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Events */}
      <div className="mt-4">
        <h3 className="text-xs font-semibold text-gray-500 mb-2">Події сьогодні</h3>
        <div className="space-y-2">
          {events.map((ev, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-0.5 rounded-full self-stretch" style={{ background: ev.color, minHeight: 32 }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Clock size={10} className="text-gray-500" />
                  <span className="text-xs font-medium" style={{ color: ev.color }}>{ev.time}</span>
                </div>
                <div className="text-xs text-gray-200 leading-snug">{ev.title}</div>
                <div className="text-xs text-gray-600">{ev.platform}</div>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-2 text-xs text-gray-500 hover:text-gray-300 transition-colors">
          Всі події в календарі →
        </button>
      </div>
    </div>
  );
}
