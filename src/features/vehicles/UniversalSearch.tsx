'use client';

import Link from 'next/link';
import { hero } from '@/content/home';

/**
 * The entrance to the marketplace.
 *
 * It submits free text to `/cars?q=` rather than parsing it here. Interpreting
 * "electric SUV under 30M" is a backend job — it needs the inventory to resolve
 * against, and a client-side guess that silently drops "under 30M" is worse than
 * passing the whole phrase through.
 */
export function UniversalSearch() {
  return (
    <div>
      <ul className="flex flex-wrap gap-2">
        {hero.chips.map((chip) => (
          <li key={chip.label}>
            <Link
              href={chip.href}
              className="inline-flex items-center border border-white/20 px-4 py-2 font-data text-[0.62rem] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:border-white hover:bg-white hover:text-black"
            >
              {chip.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
