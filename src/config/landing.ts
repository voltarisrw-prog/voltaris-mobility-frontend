import type { VehicleFilters } from '@/lib/vehicles/filters';

/**
 * Curated SEO landing pages.
 *
 * These are NOT filtered search results with a nicer title. Each one has editorial
 * copy and its own FAQs, because a page that adds nothing a filter view already
 * shows has no business being in the index. Adding a landing page means writing the
 * content for it — that friction is the point.
 */
export interface LandingPage {
  slug: string;
  h1: string;
  title: string;
  description: string;
  intro: string;
  filters: VehicleFilters;
  body: { heading: string; text: string }[];
  faqs: { question: string; answer: string }[];
}

export const LANDING_PAGES: LandingPage[] = [
  {
    slug: 'electric-cars-rwanda',
    h1: 'Electric cars for sale in Rwanda',
    title: 'Electric cars for sale in Rwanda',
    description:
      'Every electric car listed on Voltaris, from verified dealers and private owners across Rwanda. Compare range, battery size, price, and charging before you enquire.',
    intro:
      'Rwanda has moved faster on electric vehicles than most of the region — zero import duty on EVs, VAT relief, and electricity tariffs that make charging cheap next to petrol. What follows is everything currently listed, with the numbers that decide whether a car fits your week.',
    filters: {},
    body: [
      {
        heading: 'What an EV costs to run here',
        text: 'A typical EV uses about 17 kWh per 100 km. At the domestic tariff, that is a fraction of what the same distance costs in a petrol car of similar size. The saving is largest for people who drive a lot inside Kigali, and smallest for people who mostly sit in traffic on short trips — the opposite of what most buyers assume.',
      },
      {
        heading: 'The duty position',
        text: 'Rwanda exempts electric vehicles, batteries, and charging equipment from import duty, and applies relief on VAT and withholding tax. This is why a landed EV can be competitive with a petrol equivalent despite a higher factory price. Confirm the current position with RRA before you commit — incentive schemes are reviewed periodically.',
      },
      {
        heading: 'Where you will charge',
        text: 'Most owners charge at home overnight on a standard socket or a wall box. Public DC charging exists in Kigali but is not yet dense enough to plan around, so buy for the range you need rather than counting on topping up mid-journey.',
      },
    ],
    faqs: [
      {
        question: 'Do I pay import duty on an electric car in Rwanda?',
        answer:
          'Electric vehicles are exempt from import duty, with relief on VAT and withholding tax. Confirm the current schedule with the Rwanda Revenue Authority before purchase, as incentives are reviewed periodically.',
      },
      {
        question: 'Can I charge an EV from a normal household socket?',
        answer:
          'Yes. Most EVs come with a cable for a standard socket, which adds roughly 10–15 km of range per hour — enough to refill a typical day’s driving overnight. A dedicated wall box charges several times faster.',
      },
      {
        question: 'How long does an EV battery last?',
        answer:
          'Modern EV batteries typically retain 80–90% of capacity after eight years. Manufacturers usually warrant the battery for eight years or a set mileage. For used EVs, ask Voltaris for the battery health report rather than relying on the seller’s estimate.',
      },
    ],
  },
  {
    slug: 'electric-suvs-rwanda',
    h1: 'Electric SUVs for sale in Rwanda',
    title: 'Electric SUVs for sale in Rwanda',
    description:
      'Electric SUVs listed in Rwanda, with ground clearance, range, and battery size compared. Verified dealers and private owners on Voltaris.',
    intro:
      'The SUV is the practical shape for Rwandan roads once you leave tarmac, and it is where most of the EV models entering the market sit. Ground clearance and range matter more here than in the cities these cars were designed for.',
    filters: { body: ['suv'] },
    body: [
      {
        heading: 'Clearance is the specification to check',
        text: 'Battery packs sit under the floor, which lowers the centre of gravity but also fills the space a petrol SUV uses for clearance. Check the figure rather than trusting the silhouette — some electric SUVs sit lower than they look, which matters on unpaved district roads.',
      },
      {
        heading: 'Range with a full car',
        text: 'Manufacturer range figures assume a light load on flat roads at moderate speed. Loaded, on hills, with air conditioning running, expect meaningfully less. If your regular trip is Kigali to Rubavu and back, budget range against the round trip, not the one-way distance.',
      },
    ],
    faqs: [
      {
        question: 'Are electric SUVs practical outside Kigali?',
        answer:
          'Yes, if you buy for range rather than for the badge. Charging infrastructure outside Kigali is thin, so an SUV with enough range for a round trip without charging is far more usable than one that needs a top-up at the destination.',
      },
      {
        question: 'Do electric SUVs handle unpaved roads?',
        answer:
          'Ground clearance varies widely between models, and the battery pack sits low. Check the clearance figure on each listing and take a test drive on a road similar to the ones you actually use.',
      },
    ],
  },
  {
    slug: 'electric-sedans-rwanda',
    h1: 'Electric sedans for sale in Rwanda',
    title: 'Electric sedans for sale in Rwanda',
    description:
      'Electric sedans listed in Rwanda. Efficient, cheaper to run than an SUV, and well suited to Kigali city driving and ride-hailing work.',
    intro:
      'A sedan is the efficient choice: lower, lighter, and less aerodynamic drag than an SUV on the same battery, which translates directly into more kilometres per charge and lower running costs. For city driving and ride-hailing work, it is usually the better buy.',
    filters: { body: ['sedan'] },
    body: [
      {
        heading: 'Why sedans go further on the same battery',
        text: 'Aerodynamic drag rises with the square of speed, and an SUV pushes a much larger frontal area through the air. On the same battery, a sedan will typically deliver 10–20% more range on open road. In stop-start city traffic the gap narrows.',
      },
      {
        heading: 'The ride-hailing case',
        text: 'For drivers covering high daily distances, the fuel saving compounds quickly and the reduced servicing burden — no oil changes, minimal brake wear thanks to regenerative braking — matters as much as the electricity cost.',
      },
    ],
    faqs: [
      {
        question: 'Is an electric sedan good for ride-hailing in Kigali?',
        answer:
          'The economics favour it at high daily mileage: electricity costs a fraction of petrol per kilometre, and servicing is lighter. The constraint is charging — you need reliable overnight charging where you park.',
      },
    ],
  },
  {
    slug: 'used-electric-cars-rwanda',
    h1: 'Used electric cars for sale in Rwanda',
    title: 'Used electric cars for sale in Rwanda',
    description:
      'Used EVs listed in Rwanda with verified documents and battery health reports. Lower entry price, with the checks that make a used EV safe to buy.',
    intro:
      'A used EV is the cheapest way into electric driving, and it carries one risk a used petrol car does not: the battery. Everything below is listed with its documents checked, and Voltaris can supply a battery health report before you commit.',
    filters: { condition: 'used' },
    body: [
      {
        heading: 'The battery is the car',
        text: 'On a used EV, battery state of health is the single number that determines what the car is worth. A pack at 90% health has most of its life ahead of it; one at 70% has lost nearly a third of its range and will keep declining. Never accept a seller’s estimate — insist on a diagnostic read.',
      },
      {
        heading: 'What Voltaris checks before a used listing goes live',
        text: 'Registration matched to the seller, import and duty status confirmed where applicable, a battery state-of-health read from the vehicle’s own diagnostics, and a physical inspection by a Voltaris agent. A listing carries the verified mark only when all four are complete.',
      },
      {
        heading: 'Warranty transfer',
        text: 'Many manufacturer battery warranties transfer to a second owner, but the terms vary and some require servicing history to be intact. Ask before you buy — a transferable eight-year battery warranty materially changes what a used EV is worth.',
      },
    ],
    faqs: [
      {
        question: 'How do I check the battery health of a used EV?',
        answer:
          'Battery state of health is read from the vehicle’s own diagnostics, not estimated from the dashboard range display. Voltaris supplies this report for verified used listings — ask before you commit to a purchase.',
      },
      {
        question: 'Is it risky to buy a used electric car?',
        answer:
          'The main risk is battery degradation, which is measurable rather than a matter of judgement. With a diagnostic battery report and confirmed ownership documents, a used EV is no riskier than a used petrol car and has far fewer mechanical parts to fail.',
      },
    ],
  },
  {
    slug: 'electric-cars-kigali',
    h1: 'Electric cars for sale in Kigali',
    title: 'Electric cars for sale in Kigali',
    description:
      'Electric vehicles listed in Kigali. See the car the same week, charge at home overnight, and use the city’s public charging network.',
    intro:
      'Kigali is where Rwanda’s EV market actually is: the dealers, the public chargers, and most of the private sellers. Buying in the city means you can see the vehicle and drive it before deciding, which for a used EV is worth a great deal.',
    filters: { location: 'kigali' },
    body: [
      {
        heading: 'Kigali driving suits an EV',
        text: 'Short, dense trips with a lot of stopping are the worst case for a petrol engine and the best case for an electric one. Regenerative braking recovers energy on the descents that define driving in this city, and there is no idle consumption in traffic.',
      },
      {
        heading: 'Charging in the city',
        text: 'Home charging on a standard socket covers most Kigali driving overnight. Public DC charging is concentrated in the city, which makes Kigali the one place in Rwanda where you can realistically own an EV without a dedicated home charge point.',
      },
    ],
    faqs: [
      {
        question: 'Where can I charge an electric car in Kigali?',
        answer:
          'Most owners charge at home overnight. Public charging is concentrated in Kigali and is expanding — see the Voltaris charging directory for the current locations and connector types.',
      },
      {
        question: 'Can I see the vehicle before buying?',
        answer:
          'Yes. Every listing on Voltaris supports a test drive request, and for Kigali listings a slot is usually available within a few days.',
      },
    ],
  },
];

export function findLandingPage(slug: string): LandingPage | undefined {
  return LANDING_PAGES.find((page) => page.slug === slug);
}
