/**
 * The admin area, section by section, with the permission each needs.
 * The menu shows a section only to people who hold one of its permissions;
 * each page checks again on the server; the backend checks every API call.
 */
export interface AdminSection {
  href: string;
  label: string;
  anyOf: string[];
}

export const ADMIN_SECTIONS: AdminSection[] = [
  { href: '/admin', label: 'Overview', anyOf: [] },
  { href: '/admin/vehicles', label: 'Vehicles', anyOf: ['listings.read_all'] },
  { href: '/admin/leads', label: 'Leads', anyOf: ['leads.read_all'] },
  { href: '/admin/people', label: 'People', anyOf: ['users.read', 'roles.assign'] },
  { href: '/admin/companies', label: 'Companies', anyOf: ['orgs.read', 'orgs.manage'] },
  { href: '/admin/roles', label: 'Roles', anyOf: ['users.read', 'roles.assign', 'audit.read'] },
  { href: '/admin/audit', label: 'Audit log', anyOf: ['audit.read'] },
];

export const DASHBOARD_PERMISSIONS = ['reports.operational', 'finance.reports', 'analytics.read'];

export function visibleSections(permissions: string[] = []): AdminSection[] {
  return ADMIN_SECTIONS.filter(
    (section) => section.anyOf.length === 0 || section.anyOf.some((p) => permissions.includes(p)),
  );
}

/** Company console sections, by company permission. */
export const ORG_SECTIONS = [
  {
    key: 'team',
    label: 'Team',
    anyOf: ['org.members.read', 'org.members.manage', 'org.members.manage_limited'],
  },
  { key: 'vehicles', label: 'Vehicles', anyOf: ['org.vehicles.read'] },
  { key: 'leads', label: 'Leads', anyOf: ['org.leads.read_all', 'org.leads.read_assigned'] },
] as const;
