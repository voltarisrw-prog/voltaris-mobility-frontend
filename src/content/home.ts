/**
 * All static homepage and chrome copy lives here.
 *
 * The point is that a copywriter can rewrite the site without opening a component.
 * Nothing in this file is a factual claim about inventory, customer numbers, or
 * verification status — those come from the API, because writing "thousands of cars"
 * into a constant is how a marketplace ends up lying on its own homepage.
 */

export const nav = {
  primary: [
    { href: '/cars', label: 'Buy' },
    { href: '/cars?mode=rental', label: 'Rent' },
    { href: '/sell', label: 'Sell' },
    { href: '/compare', label: 'Compare' },
    { href: '/guides', label: 'EV Guide' },
    { href: '/blog', label: 'Blog' },
    { href: '/dealers', label: 'Dealers' },
  ],
  /**
   * Mobile bottom bar. Six items, tightened to a 2.75rem icon column so the row
   * still fits the thumb-reach ceiling from the five-item version. Compare sits
   * between Explore and Sell — it's a decision-stage action, not a destination,
   * so it belongs next to discovery rather than at either end of the bar.
   */
  mobile: [
    { href: '/', label: 'Home', icon: 'home' as const },
    { href: '/cars', label: 'Explore', icon: 'search' as const },
    { href: '/compare', label: 'Compare', icon: 'scale' as const },
    { href: '/sell', label: 'Sell', icon: 'plus' as const },
    { href: '/account/saved', label: 'Saved', icon: 'heart' as const },
    { href: '/account', label: 'Account', icon: 'user' as const },
  ],
};

export const hero = {
  eyebrow: 'Born in Kigali',
  headline: 'Find your next drive.',
  sub: 'Buy. Rent. Sell. Explore.',
  primaryCta: { label: 'Explore cars', href: '/cars' },
  secondaryCta: { label: 'Sell your car', href: '/sell' },
  searchPlaceholder: 'What are you looking for?',
  searchHint: 'Try a make, a model, a budget, or a body type',
  chips: [
    { label: 'Electric', href: '/cars?fuel=electric' },
    { label: 'SUVs', href: '/cars?body=suv' },
    { label: 'Sedans', href: '/cars?body=sedan' },
    { label: 'Under RWF 30M', href: '/cars?maxPrice=30000000' },
    { label: 'Used', href: '/cars?condition=used' },
    { label: 'Rentals', href: '/cars?mode=rental' },
    { label: 'New arrivals', href: '/cars?sort=newest' },
  ],
};

/** Section 02 — the marketplace entrance. Aisles, not tiles. */
export const entrance = {
  eyebrow: 'The entrance',
  headline: 'Choose your drive.',
  sub: 'Eight ways in. Every one leads somewhere organised.',
  categories: [
    { label: 'Buy', line: 'Own it outright', href: '/cars?mode=sale', span: 'lg:col-span-2' },
    { label: 'Rent', line: 'By the day or the month', href: '/cars?mode=rental' },
    { label: 'Sell', line: 'Reach real buyers', href: '/sell' },
    { label: 'Electric', line: 'Fully charged', href: '/electric-cars-rwanda', span: 'lg:col-span-2' },
    { label: 'SUV', line: 'Room and clearance', href: '/electric-suvs-rwanda' },
    { label: 'Sedan', line: 'Efficient and quiet', href: '/electric-sedans-rwanda' },
    { label: 'Luxury', line: 'Make an entrance', href: '/cars?segment=luxury' },
    { label: 'Commercial', line: 'Fleets and vans', href: '/cars?body=van' },
  ],
};

/**
 * Section 03 — the showcase. A real query (verified, highest price first), not a
 * hand-picked "featured" list — see the note on `aisles` below. Kept to a handful
 * of vehicles: this is a highlight reel, not another way to browse the catalog.
 */
export const showcase = {
  eyebrow: 'The showroom floor',
  headline: 'Verified. Priced. Ready to drive.',
  query: { verified: true, sort: 'price_desc' as const },
};

/**
 * Section 04 — the aisles.
 *
 * Each rail is a real query against the marketplace, so an empty aisle is an empty
 * aisle and the page says so. None of these are hand-picked lists pretending to be
 * algorithmic.
 */
export const aisles = [
  {
    id: 'new-arrivals',
    title: 'Just arrived',
    line: 'The newest listings to clear review.',
    query: { sort: 'newest' as const },
    href: '/cars?sort=newest',
  },
  {
    id: 'electric',
    title: 'Electric',
    line: 'Your future, fully charged.',
    query: { sort: 'range_desc' as const },
    href: '/electric-cars-rwanda',
  },
  {
    id: 'long-range',
    title: 'Goes the distance',
    line: 'For the trips that leave Kigali behind.',
    query: { minRange: 350, sort: 'range_desc' as const },
    href: '/cars?minRange=350',
  },
  {
    id: 'under-30',
    title: 'Under RWF 30M',
    line: 'Smart choices.',
    query: { maxPrice: 30_000_000, sort: 'price_asc' as const },
    href: '/cars?maxPrice=30000000',
  },
  {
    id: 'verified',
    title: 'Checked in person',
    line: 'Documents confirmed and physically inspected.',
    query: { verified: true, sort: 'newest' as const },
    href: '/cars?verified=true',
  },
];

/** Section 05 — lifestyle-first discovery, so nobody needs the vocabulary. */
export const needs = {
  eyebrow: 'Not sure where to start',
  headline: 'Tell us what it is for.',
  sub: 'Answer in plain language. We will translate it into specifications.',
  options: [
    { label: 'The city', line: 'Short trips, tight parking', href: '/cars?body=hatchback' },
    { label: 'Family', line: 'Five seats and a real boot', href: '/cars?body=suv' },
    { label: 'Business', line: 'Arrive properly', href: '/cars?body=sedan' },
    { label: 'Long distance', line: 'Range that clears the round trip', href: '/cars?minRange=400' },
    { label: 'Upcountry', line: 'Clearance for unpaved roads', href: '/cars?body=suv' },
    { label: 'Daily commute', line: 'Cheapest per kilometre', href: '/cars?sort=price_asc' },
  ],
};

/** Section 07 — trust. Each line describes a check the platform actually performs. */
export const trust = {
  eyebrow: 'Why this is not a classifieds page',
  headline: 'Know what you are buying.',
  sub: 'Voltaris does not own these vehicles. It checks them.',
  points: [
    { title: 'Ownership documents', line: 'Registration matched to the person or business listing the vehicle.' },
    { title: 'Import and duty status', line: 'Confirmed against RRA records where applicable.' },
    { title: 'Battery report', line: 'State of health read from the vehicle, not estimated by the seller.' },
    { title: 'Physical inspection', line: 'A Voltaris agent has seen the vehicle in person.' },
    { title: 'Test drives', line: 'Arranged by us, so you are not chasing a stranger for a slot.' },
    { title: 'Nothing auto-publishes', line: 'Every listing is reviewed before anyone can see it.' },
  ],
  note: 'A listing carries the verified mark only when all four checks are complete. Listings that have not been through the process say so.',
};

/** Section 08 — sell. */
export const sell = {
  eyebrow: 'Have a car to sell',
  headline: 'Put it in front of the right buyer.',
  sub: 'Not in front of everyone. In front of the people already searching for it.',
  steps: [
    { n: '01', title: 'Tell us about your car', line: 'Four steps, about ten minutes, including photos and documents.' },
    { n: '02', title: 'We check and prepare it', line: 'Documents verified, battery read, price agreed with you.' },
    { n: '03', title: 'Meet serious buyers', line: 'Enquiries and test drives come to you already qualified.' },
  ],
  primaryCta: { label: 'List your car', href: '/sell' },
  secondaryCta: { label: 'How it works', href: '/how-it-works' },
};

/** Section 09 — test drive. */
export const testDrive = {
  eyebrow: 'Before you decide',
  headline: 'See it. Feel it. Drive it.',
  sub: 'Range on paper and range on the Nyabugogo climb are different numbers. Pick a slot and a district; we arrange the rest.',
  cta: { label: 'Book a test drive', href: '/test-drive' },
};

/** Section 10 — editorial. */
export const editorial = {
  eyebrow: 'More than cars',
  headline: 'Written for this market.',
  sub: 'Not translated from a European one.',
  topics: [
    { label: 'EV guides', href: '/guides?category=buying-guides' },
    { label: 'Reviews', href: '/guides?category=reviews' },
    { label: 'Buying advice', href: '/guides?category=buying-guides' },
    { label: 'Charging', href: '/charging' },
    { label: 'Ownership', href: '/guides?category=ownership' },
    { label: 'Market insights', href: '/guides?category=market' },
    { label: 'Owner stories', href: '/guides?category=owner-stories' },
    { label: 'News from the team', href: '/blog' },
  ],
  cta: { label: 'Read the guides', href: '/guides' },
};

/** Section 11 — mobility culture. Aspirational, not a sustainability lecture. */
export const culture = {
  eyebrow: 'From Kigali to everywhere',
  headline: 'The future of driving is already moving.',
  body: 'Rwanda dropped the duty on electric vehicles before most of the continent had a policy at all. The chargers are going in, the imports are landing, and the people driving them are not making a statement — they are just paying less per kilometre and enjoying the quiet.',
  stats: [
    { value: 'Zero', label: 'import duty on EVs' },
    { value: '~17', label: 'kWh per 100 km, typical' },
    { value: '8 yrs', label: 'typical battery warranty' },
  ],
};

/** Section 15 — the enquiry form, immediately before the closing CTA. */
export const inquiry = {
  eyebrow: 'Talk to a person',
  headline: 'Not finding it?',
  sub: 'Tell us what you are after and someone from the team will come back within a working day. No listing required — most people who write to us have not picked a car yet.',
  points: [
    'We search stock that has not been listed yet',
    'We tell you what a fair price looks like',
    'We arrange the test drive',
  ],
};

export const finalCta = {
  headline: 'Your next drive is waiting.',
  primaryCta: { label: 'Explore cars', href: '/cars' },
  secondaryCta: { label: 'Sell your car', href: '/sell' },
};

/**
 * Only platforms with a configured URL render. An empty string removes the icon
 * rather than linking to a page that does not exist.
 */
export const socialLinks: Record<string, string> = {
  instagram: 'https://instagram.com/voltarismobility',
  facebook: 'https://facebook.com/voltarismobility',
  tiktok: '',
  youtube: '',
  linkedin: 'https://www.linkedin.com/company/voltarismobility',
  x: 'https://x.com/voltarisrw',
  whatsapp: 'https://wa.me/250788000000',
};

/**
 * Build credit. Add `url` to turn the name into a link, or extend `people` if the
 * credit should cover more than one person.
 */
export const credits = {
  people: [{ name: 'Patrice IRADUKUNDA', role: 'Designed & Developed', url: 'https://www.linkedin.com/in/patrice-iradukunda-74931827a/' }],
};

export const footerColumns = [
  {
    heading: 'Explore',
    links: [
      { href: '/cars', label: 'Buy' },
      { href: '/cars?mode=rental', label: 'Rent' },
      { href: '/sell', label: 'Sell' },
      { href: '/compare', label: 'Compare' },
      { href: '/cars?sort=newest', label: 'New arrivals' },
      { href: '/electric-cars-kigali', label: 'Cars in Kigali' },
    ],
  },
  {
    heading: 'Discover',
    links: [
      { href: '/guides', label: 'EV guide' },
      { href: '/guides?category=reviews', label: 'Reviews' },
      { href: '/charging', label: 'Charging' },
      { href: '/guides?category=insights', label: 'Mobility' },
      { href: '/guides?category=market', label: 'Market insights' },
      { href: '/blog', label: 'Blog' },
      { href: '/brands', label: 'Brands' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/about', label: 'About Voltaris' },
      { href: '/careers', label: 'Careers' },
      { href: '/dealers', label: 'Partners' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { href: '/help', label: 'Help centre' },
      { href: '/how-it-works', label: 'How it works' },
      { href: '/trust-and-verification', label: 'Trust & verification' },
      { href: '/legal/terms', label: 'Terms' },
      { href: '/legal/privacy', label: 'Privacy' },
    ],
  },
];

/**
 * DELIBERATELY ABSENT: partner logos (section 12) and testimonials (section 13).
 *
 * Both sections are specified in the brief and both need real inputs. Partner logos
 * require signed partners and their permission to display a mark; testimonials
 * require customers who have actually transacted. Writing placeholders here would
 * put fabricated social proof on the homepage, which is the one thing a marketplace
 * asking for trust cannot do.
 *
 * When the inputs exist, add them as `partners` and `testimonials` arrays here and
 * render them between the culture and final-CTA sections. The layout leaves room.
 */
