'use client';

import { Suspense } from 'react';
import { Logo, NavLinks } from './Header';
import SearchForm from './SearchForm';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Logo />
          <Suspense fallback={<div className="flex-1 max-w-sm bg-zinc-800/80 rounded-xl h-9 animate-pulse" />}>
            <SearchForm />
          </Suspense>
          <NavLinks />
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}