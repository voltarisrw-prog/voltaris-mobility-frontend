'use client';

import { usePathname } from 'next/navigation';

/** The overview is a dashboard of panels; every other account page sits on one white sheet. */
export function AccountFrame({ children }: { children: React.ReactNode }) {
  return usePathname() === '/account' ? (
    <>{children}</>
  ) : (
    <div className="max-w-5xl border border-hairline bg-surface p-5 sm:p-8">{children}</div>
  );
}
