import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { listDealers } from '@/lib/api/dealers';

export async function NetworkHome() {
  let dealers: Awaited<ReturnType<typeof listDealers>>['items'] = [];

  try {
    dealers = (await listDealers()).items;
  } catch {
    dealers = [];
  }

  const partners = dealers
    .filter((dealer) => dealer.verified && dealer.logo_url)
    .slice(0, 10);

  return (
    <section className="border-t border-[color:var(--vds-border)] bg-[#0c0906]">
      <div className="shell py-20 sm:py-28 lg:py-36">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-end lg:gap-20">
          <div>
            <p className="eyebrow text-steel-muted/90">Our network</p>

            <h2 className="mt-4 max-w-xl font-display text-[clamp(3rem,6vw,5.8rem)] leading-[0.9] tracking-[-0.045em]">
              The companies moving with Voltaris
            </h2>

            <p className="mt-6 max-w-md text-base leading-relaxed text-steel sm:text-lg">
              Meet the dealers and mobility partners helping people discover better
              electric and hybrid vehicles across Rwanda
            </p>

            <Link
              href="/dealers"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-chrome transition hover:text-volt"
            >
              Explore our network
              <ArrowUpRight size={16} strokeWidth={1.7} />
            </Link>
          </div>

          <div className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.025] p-5 shadow-[0_30px_90px_-35px_rgba(0,0,0,0.85)] sm:p-8 lg:p-10">
            {partners.length > 0 ? (
              <div className="grid grid-cols-2 divide-x divide-y divide-white/[0.08] border-l border-t border-white/[0.08] sm:grid-cols-3">
                {partners.map((dealer) => (
                  <Link
                    key={dealer.id}
                    href={`/dealers/${dealer.slug}`}
                    aria-label={`View ${dealer.name}`}
                    className="group flex min-h-28 items-center justify-center border-r border-b border-white/[0.08] p-6 transition hover:bg-white/[0.045] sm:min-h-36 sm:p-8"
                  >
                    <div className="relative h-12 w-full max-w-[150px] opacity-65 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0 sm:h-14">
                      <Image
                        src={dealer.logo_url!}
                        alt={dealer.name}
                        fill
                        sizes="150px"
                        className="object-contain"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex min-h-56 items-center justify-center text-center">
                <div>
                  <p className="font-display text-3xl italic text-chrome">
                    Our network is growing
                  </p>
                  <p className="mt-3 text-sm text-steel">
                    New dealers and mobility partners will appear here as they join Voltaris
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
