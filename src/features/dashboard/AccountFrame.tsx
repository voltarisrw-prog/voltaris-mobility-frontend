'use client';

import { usePathname } from 'next/navigation';

/** The overview is a dashboard of panels; every other account page sits on one white sheet. */
export function AccountFrame({ children }: { children: React.ReactNode }) {
  return usePathname() === '/account' ? (
    <>{children}</>
  ) : (
    <div className="max-w-5xl rounded-[14px] border border-[var(--d-line)] bg-[var(--d-card)] p-5 shadow-[var(--d-shadow)] sm:p-8">
      {children}
    </div>
  );
}
