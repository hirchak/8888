'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');

  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    } else if (search === '') {
      router.push('/');
    }
  }

  function handleChange(e) {
    setSearch(e.target.value);
    if (e.target.value === '') router.push('/');
  }

  return (
    <form onSubmit={handleSearch} className="flex-1 max-w-xs">
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500">
            <circle cx="7" cy="7" r="4.5"/>
            <path d="M10.5 10.5L14 14" strokeLinecap="round"/>
          </svg>
        </div>
        <input
          type="text"
          value={search}
          onChange={handleChange}
          placeholder="Пошук..."
          className="input-field text-sm py-1.5 pl-9 pr-8"
        />
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(''); router.push('/'); }}
            className="absolute inset-y-0 right-2.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 2l8 8M10 2L2 10" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>
    </form>
  );
}
