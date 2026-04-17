'use client';
import '../app/globals.css';

import { Suspense } from 'react';
import Link from 'next/link';
import { Logo, NavLinks } from './Header';
import SearchForm from './SearchBar';
import OnboardingTour from './OnboardingTour';
import ThemeToggle from './ThemeToggle';
import BottomTabBar from './BottomTabBar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Logo />
          {/* Desktop search — hidden on mobile */}
          <div className="hidden sm:flex flex-1 max-w-xs mx-2">
            <Suspense fallback={<div className="flex-1 bg-zinc-800/80 rounded-xl h-9 animate-pulse" />}>
              <SearchForm />
            </Suspense>
          </div>
          <div className="flex items-center gap-1">
            {/* Mobile search icon */}
            <Link
              href="/"
              className="sm:hidden p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition-colors"
              aria-label="Пошук"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="7" cy="7" r="4.5"/>
                <path d="M10.5 10.5L14 14" strokeLinecap="round"/>
              </svg>
            </Link>
            <ThemeToggle />
            <NavLinks />
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>
      <BottomTabBar />
      <OnboardingTour />
    </div>
  );
}