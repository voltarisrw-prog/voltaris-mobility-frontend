'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { hero } from '@/content/home';
import { track } from '@/lib/analytics';

/**
 * The entrance to the marketplace.
 *
 * It submits free text to `/cars?q=` rather than parsing it here. Interpreting
 * "electric SUV under 30M" is a backend job — it needs the inventory to resolve
 * against, and a client-side guess that silently drops "under 30M" is worse than
 * passing the whole phrase through.
 */
export function UniversalSearch({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const query = value.trim();
    if (!query) {
      router.push('/cars');
      return;
    }
    track('search', { query, result_count: 0 });
    router.push(`/cars?q=${encodeURIComponent(query)}`);
  }

  return (
    <div>
      <form onSubmit={submit} role="search" className="relative">
        <label htmlFor="universal-search" className="sr-only">
          {hero.searchPlaceholder}
        </label>
        <Search
          className="pointer-events-none absolute left-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-steel-muted"
          aria-hidden="true"
        />
        <input
          id="universal-search"
          ref={input}
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={hero.searchPlaceholder}
          autoFocus={autoFocus}
          autoComplete="off"
          aria-describedby="universal-search-hint"
          className="h-16 w-full border border-hairline bg-slab/70 pl-14 pr-32 text-base text-chrome backdrop-blur placeholder:text-steel-muted focus:border-volt sm:h-[4.5rem] sm:text-lg"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-volt px-5 py-3 font-data text-eyebrow uppercase text-surface transition-colors hover:bg-volt-bright"
        >
          Search
        </button>
      </form>

      <p id="universal-search-hint" className="mt-3 font-data text-xs text-steel-muted">
        {hero.searchHint}
      </p>

      <ul className="mt-5 flex flex-wrap gap-2">
        {hero.chips.map((chip) => (
          <li key={chip.label}>
            <Link
              href={chip.href}
              className="inline-block border border-hairline px-3.5 py-2 font-data text-eyebrow uppercase text-steel transition-colors duration-150 hover:border-volt hover:text-volt"
            >
              {chip.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
