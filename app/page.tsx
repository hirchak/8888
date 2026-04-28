'use client';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';
import KPIRow from '@/components/KPIRow';
import BotSuggestions from '@/components/BotSuggestions';
import MyFocusToday from '@/components/MyFocusToday';
import GraphView from '@/components/GraphView';
import TasksByProjects from '@/components/TasksByProjects';
import CalendarWidget from '@/components/CalendarWidget';
import Reports from '@/components/Reports';

export default function DashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0D1117' }}>
      {/* Sidebar */}
      <div className="flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-5">
          {/* KPI Row */}
          <KPIRow />

          {/* 3-column layout */}
          <div className="grid grid-cols-12 gap-5">
            {/* Left column */}
            <div className="col-span-12 lg:col-span-3 flex flex-col gap-0">
              <BotSuggestions />
              <GraphView />
            </div>

            {/* Center column */}
            <div className="col-span-12 lg:col-span-5 flex flex-col">
              <MyFocusToday />
              <TasksByProjects />
            </div>

            {/* Right column */}
            <div className="col-span-12 lg:col-span-4 flex flex-col">
              <CalendarWidget />
              <Reports />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
