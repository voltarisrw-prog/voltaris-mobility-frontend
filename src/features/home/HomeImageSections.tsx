'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { HOME_LIBRARY_IMAGES } from './homeLibraryImages';

function imageAt(index: number): string {
  return HOME_LIBRARY_IMAGES[index % HOME_LIBRARY_IMAGES.length]!;
}

export function HomeImageSections() {
  const needs = [
    {
      image: imageAt(4),
      label: 'Everyday',
      title: 'For the rhythm of the city',
      text: 'Easy to live with, easy to find and ready for everyday Kigali',
      href: '/cars',
    },
    {
      image: imageAt(11),
      label: 'Family',
      title: 'Room for what matters',
      text: 'More space, more comfort and a calmer way to move together',
      href: '/cars?body=suv',
    },
    {
      image: imageAt(19),
      label: 'Executive',
      title: 'Arrive differently',
      text: 'Quiet cabins, considered details and vehicles built for presence',
      href: '/cars',
    },
    {
      image: imageAt(27),
      label: 'Adventure',
      title: 'Beyond the city',
      text: 'Capability for weekends, distance and roads that ask more of you',
      href: '/cars',
    },
  ];

  return (
    <>
      {/* 04 — DISCOVERY BY NEED */}
      <section className="border-b border-[color:var(--vds-border)] bg-[#100c09]">
        <div className="shell py-16 sm:py-20 lg:py-28">
          <div className="mb-10 flex flex-col justify-between gap-6 lg:mb-14 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="font-data text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--vds-brand-secondary)]">
                Find your way
              </p>
              <h2 className="mt-3 text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">
                Choose the way you move
              </h2>
            </div>
            <p className="max-w-md font-sans text-sm leading-relaxed text-[color:var(--vds-text-muted)] sm:text-base">
              Start with your life, not a specification sheet
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {needs.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                className={`group relative overflow-hidden border border-[color:var(--vds-border)] ${
                  index === 0 || index === 3 ? 'sm:aspect-[1.35]' : 'sm:aspect-[1.05]'
                } min-h-[23rem]`}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <p className="font-data text-[0.58rem] uppercase tracking-[0.18em] text-white/60">
                    {item.label}
                  </p>
                  <h3 className="mt-2 max-w-lg text-3xl leading-none sm:text-4xl">
                    {item.title}
                  </h3>
                  <p className="mt-3 max-w-md font-sans text-sm leading-relaxed text-white/70">
                    {item.text}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 font-data text-[0.58rem] uppercase tracking-[0.16em] text-white">
                    Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 05 — EDITORIAL VEHICLE MOMENT */}
      <section className="bg-[#0c0906]">
        <div className="shell py-16 sm:py-20 lg:py-28">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="font-data text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--vds-brand-secondary)]">
                The collection
              </p>
              <h2 className="mt-3 text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">
                Worth a closer look
              </h2>
              <p className="mt-5 max-w-md font-sans text-base leading-relaxed text-[color:var(--vds-text-muted)]">
                A changing selection of vehicles worth stopping for
              </p>
            </div>

            <Link
              href="/cars"
              className="group relative min-h-[25rem] overflow-hidden border border-[color:var(--vds-border)] sm:min-h-[38rem]"
            >
              <Image
                src={imageAt(34)}
                alt="Voltaris vehicle collection"
                fill
                sizes="(max-width: 1024px) 100vw, 65vw"
                className="object-cover transition-transform duration-[1400ms] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 sm:p-10">
                <p className="font-data text-[0.58rem] uppercase tracking-[0.18em] text-white/60">
                  Voltaris showroom
                </p>
                <p className="mt-2 text-3xl sm:text-5xl">
                  See the full collection
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 06 — RWANDA IN MOTION */}
      <section className="border-y border-[color:var(--vds-border)] bg-[#0f0b08]">
        <div className="shell py-16 sm:py-20 lg:py-28">
          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative min-h-[30rem] overflow-hidden border border-[color:var(--vds-border)] lg:min-h-[42rem]">
              <Image
                src={imageAt(40)}
                alt="Rwanda in motion"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />
              <div className="absolute bottom-0 left-0 p-6 sm:p-10">
                <div className="flex items-center gap-2 font-data text-[0.58rem] uppercase tracking-[0.18em] text-white/70">
                  <MapPin className="h-3.5 w-3.5" />
                  Rwanda
                </div>
                <h2 className="mt-3 text-4xl leading-none sm:text-6xl">
                  Rwanda in motion
                </h2>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="border border-[color:var(--vds-border)] bg-[#15100c] p-7 sm:p-10">
                <Sparkles className="h-5 w-5 text-[color:var(--vds-brand-secondary)]" />
                <h3 className="mt-6 text-3xl leading-none sm:text-4xl">
                  Built around how Rwanda moves
                </h3>
                <p className="mt-4 font-sans text-sm leading-relaxed text-[color:var(--vds-text-muted)]">
                  From Kigali commutes to long-distance journeys, Voltaris brings the marketplace closer to real life
                </p>
              </div>

              <div className="relative min-h-[17rem] overflow-hidden border border-[color:var(--vds-border)]">
                <Image
                  src={imageAt(45)}
                  alt="Driving through Rwanda"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/25" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 07 — TRUST */}
      <section className="bg-[#0c0906]">
        <div className="shell py-16 sm:py-20 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="font-data text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--vds-brand-secondary)]">
                Confidence
              </p>
              <h2 className="mt-3 text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">
                Buy with more confidence
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['Verified', 'Vehicle information checked before it reaches the showroom'],
                ['Transparent', 'Clear pricing and useful details without the noise'],
                ['Human', 'Real people when you need help making a decision'],
              ].map(([title, text]) => (
                <div key={title} className="border border-[color:var(--vds-border)] bg-[#15100c] p-6 sm:p-7">
                  <ShieldCheck className="h-5 w-5 text-[color:var(--vds-brand-secondary)]" />
                  <h3 className="mt-6 text-2xl">{title}</h3>
                  <p className="mt-3 font-sans text-sm leading-relaxed text-[color:var(--vds-text-muted)]">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 08 — SELL */}
      <section className="border-y border-[color:var(--vds-border)] bg-[#100c09]">
        <div className="shell py-16 sm:py-20 lg:py-28">
          <div className="grid overflow-hidden border border-[color:var(--vds-border)] lg:grid-cols-2">
            <div className="relative min-h-[25rem] lg:min-h-[38rem]">
              <Image
                src={imageAt(7)}
                alt="Sell your vehicle with Voltaris"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/45 to-transparent" />
            </div>

            <div className="flex flex-col justify-center bg-[#15100c] p-7 sm:p-12 lg:p-16">
              <p className="font-data text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--vds-brand-secondary)]">
                Sell with Voltaris
              </p>
              <h2 className="mt-3 text-4xl leading-[0.95] sm:text-5xl">
                Have a vehicle to sell?
              </h2>
              <p className="mt-5 max-w-lg font-sans text-base leading-relaxed text-[color:var(--vds-text-muted)]">
                Put your vehicle in front of serious buyers with a cleaner, more considered selling experience
              </p>

              <ul className="mt-7 space-y-3 font-sans text-sm text-white/75">
                {['Create your listing', 'Reach the right audience', 'Get support through the process'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-[color:var(--vds-brand-secondary)]" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/sell"
                className="mt-8 inline-flex w-fit items-center gap-3 border-b border-white/30 pb-2 font-data text-[0.62rem] uppercase tracking-[0.16em] transition-colors hover:border-[color:var(--vds-brand-secondary)] hover:text-[color:var(--vds-brand-secondary)]"
              >
                Start selling
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 09 — FINAL CTA */}
      <section className="relative overflow-hidden bg-black">
        <div className="absolute inset-0">
          <Image
            src={imageAt(16)}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-black/55" />
        </div>

        <div className="shell relative py-24 sm:py-32 lg:py-44">
          <p className="font-data text-[0.62rem] uppercase tracking-[0.2em] text-white/60">
            Your next move
          </p>
          <h2 className="mt-4 max-w-4xl text-5xl leading-[0.88] sm:text-7xl lg:text-8xl">
            Where are you going next?
          </h2>
          <Link
            href="/cars"
            className="mt-8 inline-flex items-center gap-3 border-b border-white/40 pb-2 font-data text-[0.62rem] uppercase tracking-[0.18em] text-white"
          >
            Find your vehicle
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* 10 — HUMAN HELP */}
      <section className="bg-[#0c0906]">
        <div className="shell py-16 sm:py-20 lg:py-24">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="font-data text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--vds-brand-secondary)]">
                Human help
              </p>
              <h2 className="mt-3 text-4xl leading-none sm:text-5xl">
                Tell us what you need
              </h2>
              <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-[color:var(--vds-text-muted)]">
                Looking for something specific? Our team can help you narrow it down
              </p>
            </div>

            <Link
              href="/contact"
              className="group relative min-h-[18rem] overflow-hidden border border-[color:var(--vds-border)]"
            >
              <Image
                src={imageAt(22)}
                alt="Talk to the Voltaris team"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/45" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <span className="inline-flex items-center gap-2 font-data text-[0.6rem] uppercase tracking-[0.16em]">
                  Talk to Voltaris
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 11 — NETWORK */}
      <section className="border-t border-[color:var(--vds-border)] bg-[#100c09]">
        <div className="shell py-16 sm:py-20 lg:py-28">
          <div className="mb-10 max-w-2xl">
            <p className="font-data text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--vds-brand-secondary)]">
              The network
            </p>
            <h2 className="mt-3 text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">
              A growing mobility network
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[31, 38, 49].map((index, i) => (
              <div key={index} className="group relative min-h-[20rem] overflow-hidden border border-[color:var(--vds-border)]">
                <Image
                  src={imageAt(index)}
                  alt={`Voltaris network ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                <div className="absolute bottom-0 left-0 p-5">
                  <p className="font-data text-[0.56rem] uppercase tracking-[0.16em] text-white/55">
                    Voltaris network
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
