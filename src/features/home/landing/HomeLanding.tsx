import Link from 'next/link';
import { hero } from '@/content/home';
import type { CoverCard } from './cards';
import { Coverflow } from './Coverflow';
import { EnquiryForm } from './EnquiryForm';
import { HeroBackdrop } from './HeroBackdrop';
import { HomeRoot } from './HomeRoot';
import { NetworkCanvas } from './NetworkCanvas';
import { Photo } from './Photo';
import { homeFonts } from './fonts';
import { Arrow, Roll, words } from './text';
import s from './home.module.css';

const i = (n: number) => ({ '--i': n }) as React.CSSProperties;

const POWERTRAINS = [
  {
    key: s.e,
    tag: 'Fully electric',
    title: 'Electric',
    body: 'Quiet, responsive and designed for everyday electric driving',
    cta: 'Explore electric →',
    image: '/powertrain/electric.png',
    href: '/cars?fuel=electric',
  },
  {
    key: s.h,
    tag: 'Electric + fuel',
    title: 'Hybrid',
    body: 'Flexible power for city driving, longer journeys and everything between',
    cta: 'Explore hybrid →',
    image: '/powertrain/hybrid.jpeg',
    href: '/cars?fuel=hybrid',
  },
];

const GARAGE = [
  {
    kicker: 'The quiet arrival',
    make: 'Mercedes-Benz',
    model: 'EQS',
    body: 'Executive electric travel with presence, space, and restraint.',
    image: '/demo/vehicles/eqs-black.jpg',
    plate: undefined,
    href: '/cars',
  },
  {
    kicker: 'Electric, without the noise',
    make: 'Porsche',
    model: 'Taycan',
    body: 'A sharper interpretation of electric performance.',
    image: '/demo/vehicles/taycan-white.jpg',
    plate: 'linear-gradient(160deg,#cfd6e6,#7d879d)',
    href: '/cars',
  },
  {
    kicker: 'Built to go further',
    make: 'Toyota',
    model: 'Land Cruiser',
    body: 'Capability shaped for roads that do not always stay predictable.',
    image: '/demo/vehicles/landcruiser-black.jpg',
    plate: 'linear-gradient(160deg,#d3d8e6,#6f788d)',
    href: '/cars',
  },
];

const MOVES = [
  {
    title: 'Buy',
    body: 'Find an electric or hybrid vehicle that fits your life, your budget and the way you move',
    cta: 'Find a vehicle ↗',
    image: '/next/buy.png',
    href: '/buy',
    icon: <path d="M4 16V12l2-5h12l2 5v4zM4 16v3M20 16v3" strokeLinejoin="round" />,
  },
  {
    title: 'Rent',
    body: 'Choose a vehicle for the journey you have in mind without making a long-term commitment',
    cta: 'Find a rental ↗',
    image: '/next/rent.png',
    href: '/rent',
    icon: (
      <>
        <circle cx="8" cy="15" r="4" />
        <path d="M11 12l9-9M16 7l3 3" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: 'Sell',
    body: 'Put your EV or hybrid in front of people who are already looking for their next vehicle',
    cta: 'Sell your vehicle ↗',
    image: '/next/sell.png',
    href: '/sell',
    icon: <path d="M3 12V4h8l10 10-8 8z" strokeLinejoin="round" />,
  },
];

/** Without JavaScript nothing is held back for an entrance. */
const NO_JS = [
  `.${s.rv},.${s.wi},.${s.fw},.${s.sw} span{opacity:1!important;transform:none!important;filter:none!important}`,
  `.${s.eb}{clip-path:none!important}`,
  `.${s.ph} img,.${s.bgp} img{opacity:1!important;filter:none!important;transform:none!important}`,
  `.${s.cf}[data-pre] .${s.cc}{opacity:1!important;transform:translate(-50%,-50%)!important}`,
  `.${s.cc}:last-child .${s.a}{max-height:60px;opacity:1}`,
].join('');

/**
 * The home page: hero, featured vehicles, powertrains, the statement, the
 * garage, the next move, an enquiry and the network. The site header and
 * footer are the layout's and are not part of this.
 */
export function HomeLanding({ cards }: { cards: CoverCard[] }) {
  return (
    <HomeRoot className={`${s.home} ${homeFonts}`}>
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: NO_JS }} />
      </noscript>

      {/* hero */}
      <section className={s.hero} id="top" data-hero="">
        <HeroBackdrop />
        <div className={`${s.tint} ${s.te}`} />
        <div className={`${s.tint} ${s.th}`} />
        <p className={`${s.kick} ${s.rv}`}>{hero.eyebrow}</p>
        <h1 className={`${s.rv} ${s.sp}`} data-wide="">
          {words(
            <>
              <span className={s.we} data-cur="Electric" data-tint="e">
                Electric
              </span>{' '}
              or{' '}
              <span className={`${s.wh} ${s.g} ${s.ser}`} data-cur="Hybrid" data-tint="h">
                Hybrid
              </span>
            </>,
          )}
        </h1>
        <div className={`${s.btns} ${s.rv}`} style={i(6)}>
          <Link className={`${s.btn} ${s.solid}`} data-mag="" href={hero.primaryCta.href}>
            <Roll>{`${hero.primaryCta.label} →`}</Roll>
          </Link>
          <Link className={`${s.btn} ${s.ghost}`} data-mag="" href={hero.secondaryCta.href}>
            <Roll>{hero.secondaryCta.label}</Roll>
          </Link>
        </div>
        <span className={s.scrl} aria-hidden="true" />
      </section>

      {/* worth a closer look */}
      {cards.length > 0 && (
        <section className={s.sec} id="cars" style={{ paddingBottom: 50 }}>
          <div className={`${s.w} ${s.hd}`}>
            <div>
              <span className={`${s.eb} ${s.rv}`}>Worth a closer look</span>
              <h2 className={`${s.h2} ${s.rv} ${s.sp}`} data-wide="">
                {words(
                  <>
                    <span className={s.ln}>A few vehicles that</span>{' '}
                    <span className={s.ln}>
                      <em className={s.ser}>deserve</em> your attention
                    </span>
                  </>,
                )}
              </h2>
            </div>
            <Link className={`${s.lnk} ${s.rv}`} href="/cars">
              <Roll>Explore all vehicles →</Roll>
            </Link>
          </div>
          <Coverflow cards={cards} />
        </section>
      )}

      {/* find your fit */}
      <section className={`${s.sec} ${s.pt}`} id="fit">
        <div className={s.w}>
          <div className={s.hd}>
            <div>
              <span className={`${s.eb} ${s.rv}`}>Find your fit</span>
              <h2 className={`${s.h2} ${s.rv} ${s.sp}`} data-wide="">
                {words(
                  <>
                    Choose your <em className={s.ser}>powertrain</em>
                  </>,
                )}
              </h2>
            </div>
            <p className={`${s.lead} ${s.rv} ${s.sp}`} style={{ maxWidth: '30ch' }}>
              {words(
                'Two ways to move, one place to find the vehicle that fits your life',
                'focus',
              )}
            </p>
          </div>
          <div className={s.two}>
            {POWERTRAINS.map((p, k) => (
              <Link key={p.title} className={`${s.pc} ${s.rv}`} style={i(k)} href={p.href}>
                <div className={`${s.pcard} ${p.key}`} data-tilt="" data-cur="Explore">
                  <Photo src={p.image} sizes="(min-width: 980px) 560px, 100vw" />
                  <span className={s.n}>{`0${k + 1} / 02`}</span>
                  <span className={s.t}>{p.tag}</span>
                  <span className={s.go}>
                    <Arrow size={22} />
                  </span>
                </div>
                <div className={s.cap}>
                  <small>{p.tag}</small>
                  <h3 className={s.sp}>{words(p.title)}</h3>
                  <p className={s.sp}>{words(p.body, 'focus')}</p>
                  <span className={s.lnk}>
                    <Roll>{p.cta}</Roll>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* beyond the showroom */}
      <section className={s.st2} id="move" data-statement="">
        <div className={s.w}>
          <span className={`${s.eb} ${s.rv}`}>Beyond the showroom</span>
          {['Not just a car', 'A way to move'].map((line) => (
            <h2 key={line} className={s.sw} data-sw="" data-wide="">
              {line
                .split(' ')
                .flatMap((w, k) =>
                  k ? [' ', <span key={w}>{w}</span>] : [<span key={w}>{w}</span>],
                )}
            </h2>
          ))}
        </div>
        <div className={s.mq} aria-hidden="true">
          <div data-mq="">
            {Array.from({ length: 8 }, (_, k) => (
              <span key={k}>Keep moving</span>
            ))}
          </div>
        </div>
      </section>

      {/* the garage */}
      <section className={s.sec} id="garage">
        <div className={s.w}>
          <h2 className={`${s.gt} ${s.rv} ${s.sp}`} data-wide="">
            {words(
              <>
                The <em className={s.ser}>Garage</em>
              </>,
            )}
          </h2>
          {GARAGE.map((g, k) => (
            <Link
              key={g.model}
              className={s.gc}
              style={i(k)}
              href={g.href}
              data-cur="View"
              data-gc=""
            >
              <Photo
                src={g.image}
                alt={`${g.make} ${g.model}`}
                sizes="(min-width: 1160px) 1080px, 100vw"
                style={g.plate ? { background: g.plate } : undefined}
              />
              <span className={s.num}>{`0${k + 1}`}</span>
              <small>{g.kicker}</small>
              <h3 className={s.sp} data-wide="">
                {words(
                  <>
                    {g.make} <em className={s.ser}>{g.model}</em>
                  </>,
                )}
              </h3>
              <p className={s.sp}>{words(g.body, 'focus')}</p>
              <span className={s.go} aria-hidden="true">
                ↗
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* your next move */}
      <section className={s.sec} id="next" style={{ paddingTop: 30 }}>
        <div className={s.w}>
          <span className={`${s.eb} ${s.rv}`}>Your next move</span>
          <h2 className={`${s.h2} ${s.rv} ${s.sp}`} data-wide="">
            {words(
              <>
                Where are you going <em className={s.ser}>next?</em>
              </>,
            )}
          </h2>
          <p className={`${s.lead} ${s.rv} ${s.sp}`}>
            {words(
              'Whether you want to buy, rent or sell, Voltaris gives you one place to make your next move',
              'focus',
            )}
          </p>
          <div className={`${s.tri} ${s.rv}`}>
            {MOVES.map((m, k) => (
              <Link
                key={m.title}
                className={`${s.tc} ${s.rv}`}
                style={i(k)}
                href={m.href}
                data-cur="Open"
                data-glow=""
              >
                <Photo
                  src={m.image}
                  sizes="(min-width: 1160px) 720px, (min-width: 640px) 60vw, 100vw"
                />
                <span className={s.n}>{`0${k + 1}`}</span>
                <span className={s.ico}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    {m.icon}
                  </svg>
                </span>
                <h3 className={s.sp} data-wide="">
                  {words(m.title)}
                </h3>
                <p className={s.sp}>{words(m.body, 'focus')}</p>
                <span className={s.lnk}>
                  <Roll>{m.cta}</Roll>
                </span>
              </Link>
            ))}
          </div>
          <div className={s.ft2}>
            <span>One marketplace for the way you want to move</span>
            <Link className={s.lnk} href="/cars">
              <Roll>Explore all vehicles ↗</Roll>
            </Link>
          </div>
        </div>
      </section>

      {/* talk to voltaris */}
      <section className={`${s.sec} ${s.enq}`} id="enquire">
        <div className={s.w}>
          <span className={`${s.eb} ${s.rv}`}>Talk to Voltaris</span>
          <h2 className={`${s.h2} ${s.rv} ${s.sp}`} data-wide="">
            {words(
              <>
                Tell us what <em className={s.ser}>you need</em>
              </>,
            )}
          </h2>
        </div>
        <div className={`${s.w} ${s.eg}`}>
          <div>
            <p className={`${s.lead} ${s.rv} ${s.sp}`} style={{ marginTop: 0 }}>
              {words(
                "Not sure where to start? Tell us what you're looking for and we'll help you find the right next move",
                'focus',
              )}
            </p>
            <div className={`${s.real} ${s.rv}`}>
              <i>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 12a8 8 0 0 1-11.800 7L4 20l1.100-4.100A8 8 0 1 1 20 12z" />
                </svg>
              </i>
              Real people, practical answers
            </div>
          </div>
          <EnquiryForm />
        </div>
      </section>

      {/* our network */}
      <section className={s.sec} id="network">
        <div className={s.w}>
          <span className={`${s.eb} ${s.rv}`}>Our network</span>
          <h2 className={`${s.h2} ${s.rv} ${s.sp}`} data-wide="">
            {words(
              <>
                <span className={s.ln}>The companies moving</span>{' '}
                <span className={s.ln}>
                  with <em className={s.ser}>Voltaris</em>
                </span>
              </>,
            )}
          </h2>
        </div>
        <div className={`${s.w} ${s.ng}`}>
          <div>
            <p className={`${s.lead} ${s.rv} ${s.sp}`} style={{ marginTop: 0 }}>
              {words(
                'Meet the dealers and mobility partners helping people discover better electric and hybrid vehicles across Rwanda',
                'focus',
              )}
            </p>
            <Link className={`${s.lnk} ${s.rv}`} href="/dealers">
              <Roll>Explore our network ↗</Roll>
            </Link>
          </div>
          <div className={`${s.map} ${s.rv}`}>
            <NetworkCanvas />
            <div className={s.cap}>
              <h3>Our network is growing</h3>
              <p>New dealers and mobility partners will appear here as they join Voltaris</p>
            </div>
          </div>
        </div>
      </section>
    </HomeRoot>
  );
}
