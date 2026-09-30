/**
 * Site navigation. One tree, consumed by the header on every breakpoint.
 *
 * A group with `items` opens a panel on desktop and an accordion on phones;
 * a plain link is just a link. `match` is the pathname prefix that marks a
 * group active (Marketplace lights up on /cars/… even though no item points
 * there).
 */
export type NavItem = {
  label: string;
  href: string;
  /** One short line, shown in the desktop panel and the phone accordion. */
  description?: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
  match: string[];
};

export type NavLink = { label: string; href: string; match?: string[] };

export type NavEntry = NavGroup | NavLink;

export function isGroup(entry: NavEntry): entry is NavGroup {
  return 'items' in entry;
}

export const siteNav: NavEntry[] = [
  { label: 'Home', href: '/', match: ['/'] },
  {
    label: 'Marketplace',
    match: ['/buy', '/rent', '/sell', '/cars', '/brands', '/dealers'],
    items: [
      { label: 'Buy', href: '/buy', description: 'Electric and hybrid cars, reviewed before listing.' },
      { label: 'Rent', href: '/rent', description: 'By the day or the week, inspected before handover.' },
      { label: 'Sell', href: '/sell', description: 'Put your car in the room. We handle the paperwork.' },
    ],
  },
  { label: 'Compare', href: '/compare', match: ['/compare'] },
  {
    label: 'Booking',
    match: ['/test-drive', '/order', '/garage', '/finance', '/checkout'],
    items: [
      { label: 'Test drive', href: '/test-drive', description: 'Drive it before you decide, in Kigali.' },
      { label: 'Reserve a vehicle', href: '/cars', description: 'Pick a car and reserve it from its page.' },
      { label: 'Garage', href: '/garage', description: 'Service, inspection and charger installation.' },
      { label: 'Finance calculator', href: '/finance', description: 'What it costs per month, with partner rates.' },
    ],
  },
  {
    label: 'About',
    match: ['/about', '/contact', '/guides', '/blog', '/help', '/careers'],
    items: [
      { label: 'About us', href: '/about', description: 'Who we are and why Voltaris exists.' },
      { label: 'Contact us', href: '/contact', description: 'A person replies within a working day.' },
      { label: 'Guides', href: '/guides', description: 'Owning an EV in Rwanda, explained.' },
      { label: 'Blog', href: '/blog', description: 'Market news and what we are building.' },
    ],
  },
];
