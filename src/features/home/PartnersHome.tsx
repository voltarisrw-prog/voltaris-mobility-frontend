import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function PartnersHome() {
  return (
    <section
      aria-labelledby="partners-home-title"
      className="relative isolate overflow-hidden border-b border-hairline bg-surface"
    >
      <div className="shell py-20 sm:py-24 lg:py-32">
        <div className="grid items-end gap-12 lg:grid-cols-[1fr_0.72fr] lg:gap-20">
          <div>
            <p className="font-data text-[0.62rem] uppercase tracking-[0.18em] text-steel-muted sm:text-[0.68rem]">
              Partners
            </p>

            <h2
              id="partners-home-title"
              className="mt-7 max-w-4xl font-display text-[clamp(4rem,10vw,9.5rem)] font-medium uppercase leading-[0.78] tracking-[-0.055em] text-chrome"
            >
              Built with
              <br />
              the right people
            </h2>
          </div>

          <div className="lg:pb-2">
            <p className="max-w-md font-display text-[clamp(1.45rem,2.8vw,2.4rem)] leading-[0.98] tracking-[-0.02em] text-chrome/85">
              Dealers, businesses, and mobility partners moving Rwanda
              forward.
            </p>

            <Link
              href="/partners"
              className="group mt-8 inline-flex items-center gap-3 border-b border-chrome/35 pb-2 font-data text-[0.62rem] uppercase tracking-[0.16em] text-chrome transition-colors hover:border-volt hover:text-volt focus-visible:border-volt focus-visible:text-volt sm:mt-10"
            >
              Meet our partners
              <ArrowUpRight
                className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        <div className="mt-16 overflow-hidden sm:mt-20 lg:mt-24">
          <div className="relative aspect-[16/8] min-h-[18rem] sm:min-h-[24rem] lg:min-h-[30rem]">
            <Image
              src="/demo/lifestyle/dealership-handshake.jpg"
              alt=""
              fill
              sizes="(min-width: 1024px) 90vw, 100vw"
              className="object-cover object-center grayscale transition-transform duration-1000 ease-out hover:scale-[1.025]"
            />

            <div
              className="absolute inset-0 bg-gradient-to-t from-[#050A16]/65 via-transparent to-[#050A16]/10"
              aria-hidden="true"
            />

            <div className="absolute bottom-5 left-5 sm:bottom-7 sm:left-7 lg:bottom-9 lg:left-9">
              <span className="font-data text-[0.58rem] uppercase tracking-[0.18em] text-chrome/60">
                Voltaris network
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
