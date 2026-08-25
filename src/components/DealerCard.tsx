import Image from 'next/image';
import Link from 'next/link';
import { VerificationBadge } from './VerificationBadge';
import type { DealerSummary } from '@/types/dealer';

export function DealerCard({ dealer }: { dealer: DealerSummary }) {
  return (
    <article className="group relative flex items-start gap-4 border border-hairline p-5 transition-colors hover:border-volt/40">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-slab">
        {dealer.logo_url ? (
          <Image src={dealer.logo_url} alt="" fill sizes="56px" className="object-contain" />
        ) : (
          <span className="flex h-full items-center justify-center font-display text-lg font-bold text-steel-muted">
            {dealer.name.charAt(0)}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-base font-semibold tracking-tight">
          <Link href={`/dealers/${dealer.slug}`} className="after:absolute after:inset-0">
            {dealer.name}
          </Link>
        </h3>
        <p className="mt-1 font-data text-xs text-steel-muted">
          {dealer.city} · {dealer.vehicle_count}{' '}
          {dealer.vehicle_count === 1 ? 'vehicle' : 'vehicles'} listed
        </p>
        <div className="mt-3">
          <VerificationBadge verified={dealer.verified} />
        </div>
      </div>
    </article>
  );
}
