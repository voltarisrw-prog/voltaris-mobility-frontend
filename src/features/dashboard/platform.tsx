import { BarChart, LineChart, type Point } from './charts';
import {
  DashHead,
  Feed,
  Grid,
  Kpis,
  Meters,
  MiniTable,
  Panel,
  Ranked,
  Split,
  Status,
  VehicleTiles,
  ago,
  rwf,
} from './kit';
import { RwandaMap } from './RwandaMap';
import { cars, people, pick, series } from './sample';
import { listAdminLeads, listAdminVehicles, type AdminStats, type DayPoint } from '@/lib/api/admin';

/*
 * One dashboard per platform staff role. Each draws only from /admin/stats blocks
 * that role may see (the backend leaves the rest out), plus a list endpoint or two.
 * Panels marked `preview` stand in for modules that aren't built yet.
 */

const pts = (d?: DayPoint[]): Point[] => (d ?? []).map((p) => ({ label: p.day, value: p.value }));
const sum = (d?: DayPoint[]) => (d ?? []).reduce((s, p) => s + p.value, 0);
const n = (v?: number) => (v ?? 0).toLocaleString('en-RW');
const pct = (a = 0, b = 0) => (b ? Math.round((a / b) * 100) : 0);
const pretty = (action: string) => action.replace(/^(auth|admin|org)\./, '').replace(/[._]/g, ' ');

const auditFeed = (s: AdminStats) =>
  (s.audit ?? []).map((a) => ({
    title: pretty(a.action),
    meta: `${a.actor} · ${a.entity}`,
    when: ago(a.created_at),
  }));

const listingSplit = (s: AdminStats) => [
  { label: 'Live', value: s.listings?.live ?? 0 },
  { label: 'Reserved', value: s.listings?.reserved ?? 0 },
  { label: 'Sold', value: s.listings?.sold ?? 0 },
  { label: 'Unpublished', value: s.listings?.unpublished ?? 0 },
];

async function latestVehicles(status?: string) {
  const r = await listAdminVehicles(status ? { status } : {});
  return r.items.slice(0, 8).map((v) => ({
    id: v.id,
    slug: v.slug,
    title: v.title,
    image_url: v.image_url,
    line: v.price ? rwf(v.price) : 'Price on request',
    status: v.status.replace('_', ' '),
  }));
}

export async function PlatformDashboard({
  role,
  label,
  stats: s,
}: {
  role: string;
  label: string;
  stats: AdminStats;
}) {
  switch (role) {
    /* ------------------------------------------------------------ 1 */
    case 'SUPER_ADMIN':
      return (
        <>
          <DashHead
            eyebrow={label}
            title="Full control. Total visibility."
            lead="Everything on Voltaris at a glance."
          />
          <Kpis
            items={[
              {
                label: 'Accounts',
                value: n(s.accounts?.total),
                hint: `+${n(s.accounts?.new_7d)} this week`,
                href: '/admin/people',
              },
              {
                label: 'Live listings',
                value: n(s.listings?.live),
                hint: `${n(s.listings?.pending_review)} waiting review`,
                href: '/admin/vehicles',
              },
              { label: 'Leads, 14 days', value: n(sum(s.leads)), href: '/admin/leads' },
              {
                label: 'Staff with 2-step',
                value: `${n(s.security?.staff_mfa)}/${n(s.security?.staff)}`,
                hint: 'Required for staff powers',
              },
            ]}
          />
          <Grid>
            <Panel
              title="Leads per day"
              span={8}
              action={{ href: '/admin/leads', label: 'All leads' }}
            >
              <BarChart data={pts(s.leads)} title="Leads per day, last 14 days" />
            </Panel>
            <Panel title="Listings" span={4} action={{ href: '/admin/vehicles', label: 'Review' }}>
              <Split parts={listingSplit(s)} />
            </Panel>
            <Panel title="New accounts, 30 days" span={6}>
              <LineChart data={pts(s.signups)} title="New accounts per day" />
            </Panel>
            <Panel
              title="Companies"
              span={6}
              action={{ href: '/admin/companies', label: 'Manage' }}
            >
              <Split
                parts={[
                  { label: 'Dealerships', value: s.companies?.dealers ?? 0 },
                  { label: 'Rental companies', value: s.companies?.rentals ?? 0 },
                  { label: 'Business customers', value: s.companies?.businesses ?? 0 },
                  { label: 'Suspended', value: s.companies?.suspended ?? 0 },
                ]}
              />
              <p className="mt-4 text-sm text-steel">
                {n(s.companies?.members)} people work in companies.
              </p>
            </Panel>
            <Panel
              title="Recent staff activity"
              span={6}
              action={{ href: '/admin/audit', label: 'Audit log' }}
            >
              <Feed items={auditFeed(s)} empty="No staff activity yet." />
            </Panel>
            <Panel title="Platform" span={6}>
              <Meters
                items={[
                  {
                    label: 'Staff using two-step sign-in',
                    value: pct(s.security?.staff_mfa, s.security?.staff),
                  },
                  {
                    label: 'Listings verified',
                    value: pct(s.listings?.verified, s.listings?.total),
                  },
                  {
                    label: 'Orders paid',
                    value: pct(s.orders?.paid, s.orders?.total),
                    note: `${n(s.orders?.paid)} of ${n(s.orders?.total)}`,
                  },
                ]}
              />
            </Panel>
          </Grid>
        </>
      );

    /* ------------------------------------------------------------ 2 */
    case 'PLATFORM_ADMIN': {
      const vehicles = await latestVehicles();
      return (
        <>
          <DashHead eyebrow={label} title="Manage users, listings & platform settings." />
          <Kpis
            items={[
              {
                label: 'Waiting review',
                value: n(s.listings?.pending_review),
                href: '/admin/vehicles?status=pending_review',
              },
              {
                label: 'Live listings',
                value: n(s.listings?.live),
                href: '/admin/vehicles?status=live',
              },
              { label: 'Leads, 14 days', value: n(sum(s.leads)), href: '/admin/leads' },
              {
                label: 'Companies',
                value: n(
                  (s.companies?.dealers ?? 0) +
                    (s.companies?.rentals ?? 0) +
                    (s.companies?.businesses ?? 0),
                ),
                href: '/admin/companies',
              },
            ]}
          />
          <Grid>
            <Panel
              title="Newest listings"
              span={12}
              flush
              action={{ href: '/admin/vehicles', label: 'All vehicles' }}
            >
              <VehicleTiles items={vehicles} />
            </Panel>
            <Panel title="Leads per day" span={7}>
              <BarChart data={pts(s.leads)} title="Leads per day" />
            </Panel>
            <Panel title="Stock by body type" span={5}>
              <Ranked items={s.by_body ?? []} />
            </Panel>
            <Panel title="Accounts" span={6} action={{ href: '/admin/people', label: 'People' }}>
              <Split
                parts={[
                  { label: 'Customers', value: s.accounts?.customers ?? 0 },
                  { label: 'Sellers', value: s.accounts?.sellers ?? 0 },
                  { label: 'Staff', value: s.accounts?.staff ?? 0 },
                  { label: 'Suspended', value: s.accounts?.suspended ?? 0 },
                ]}
              />
            </Panel>
            <Panel
              title="Recent staff activity"
              span={6}
              action={{ href: '/admin/audit', label: 'Audit log' }}
            >
              <Feed items={auditFeed(s).slice(0, 5)} empty="No staff activity yet." />
            </Panel>
          </Grid>
        </>
      );
    }

    /* ------------------------------------------------------------ 3 */
    case 'SECURITY_ADMIN': {
      const sec = s.security;
      return (
        <>
          <DashHead
            eyebrow={label}
            title="Stronger security. Safer journeys."
            lead="Sign-in health, two-step coverage and anything unusual."
          />
          <Kpis
            items={[
              {
                label: 'Staff with 2-step',
                value: `${n(sec?.staff_mfa)}/${n(sec?.staff)}`,
                hint: `${pct(sec?.staff_mfa, sec?.staff)}% covered`,
              },
              { label: 'Failed codes, 24 h', value: n(sec?.mfa_failed_24h) },
              { label: 'Active sessions', value: n(sec?.active_sessions) },
              {
                label: 'Stolen-token alerts, 7 d',
                value: n(sec?.token_reuse_7d),
                hint: 'Sign-ins we shut down',
              },
            ]}
          />
          <Grid>
            <Panel title="Sign-ins per day" span={8}>
              <BarChart data={pts(s.signins)} title="Sign-ins per day, last 14 days" />
            </Panel>
            <Panel title="Coverage" span={4}>
              <Meters
                items={[
                  { label: 'Staff two-step', value: pct(sec?.staff_mfa, sec?.staff) },
                  {
                    label: 'All accounts two-step',
                    value: pct(sec?.mfa_total, s.accounts?.total),
                    note: `${n(sec?.mfa_total)} accounts`,
                  },
                ]}
              />
              <p className="mt-6 text-sm text-steel">
                {n(s.accounts?.suspended)} suspended · {n(sec?.throttled_now)} addresses being
                slowed down now
              </p>
            </Panel>
            <Panel
              title="Security events"
              span={12}
              action={{ href: '/admin/audit', label: 'Audit log' }}
            >
              <MiniTable
                head={['Event', 'Who', 'From', 'When']}
                rows={(s.security_events ?? []).map((e) => [
                  <Status key="s" tone={/failed|reuse|refused/.test(e.action) ? 'bad' : 'neutral'}>
                    {pretty(e.action)}
                  </Status>,
                  e.actor,
                  <span key="ip" className="font-data text-xs text-steel">
                    {e.ip ?? '—'}
                  </span>,
                  ago(e.created_at),
                ])}
                empty="No security events yet."
              />
            </Panel>
          </Grid>
        </>
      );
    }

    /* ------------------------------------------------------------ 4 */
    case 'SUPPORT_ADMIN': {
      const leads = await listAdminLeads();
      return (
        <>
          <DashHead eyebrow={label} title="Happier customers. Faster resolutions." />
          <Kpis
            items={[
              {
                label: 'Open enquiries',
                value: n(s.leads_total?.open_inquiries),
                href: '/admin/leads',
              },
              { label: 'Test-drive requests', value: n(s.leads_total?.test_drives) },
              { label: 'Leads, 14 days', value: n(sum(s.leads)) },
              {
                label: 'Suspended accounts',
                value: n(s.accounts?.suspended),
                href: '/admin/people',
              },
            ]}
          />
          <Grid>
            <Panel
              title="Latest enquiries"
              span={8}
              action={{ href: '/admin/leads', label: 'All' }}
            >
              <MiniTable
                head={['Reference', 'Customer', 'About', 'Status']}
                rows={leads.items.slice(0, 6).map((l) => [
                  <span key="r" className="font-data text-xs">
                    {l.reference}
                  </span>,
                  l.customer_name,
                  l.vehicle_title,
                  <Status key="s">{l.status}</Status>,
                ])}
                empty="No enquiries yet."
              />
            </Panel>
            <Panel title="Support queues" span={4} preview>
              <Meters
                items={[
                  { label: 'Answered within 1 hour', value: 82 },
                  { label: 'Resolved first contact', value: 64 },
                  { label: 'Satisfaction', value: 91 },
                ]}
              />
            </Panel>
            <Panel title="Leads per day" span={6}>
              <BarChart data={pts(s.leads)} title="Leads per day" />
            </Panel>
            <Panel title="Open disputes" span={6} preview>
              <MiniTable
                head={['Case', 'Customer', 'Topic', 'Age']}
                rows={[0, 1, 2].map((i) => [
                  `CS-10${42 + i}`,
                  pick(people, i + 1),
                  pick(['Refund', 'Delivery date', 'Listing accuracy'], i),
                  `${i + 1} d`,
                ])}
              />
            </Panel>
          </Grid>
        </>
      );
    }

    /* ------------------------------------------------------------ 17 */
    case 'FINANCE_MANAGER':
      return (
        <>
          <DashHead
            eyebrow={label}
            title="Track. Analyze. Grow."
            lead="Payments aren't switched on yet, so most values are zero until they are."
          />
          <Kpis
            items={[
              { label: 'Paid, all time', value: rwf(s.orders?.paid_value ?? 0) },
              {
                label: 'Awaiting payment',
                value: rwf(s.orders?.pending_value ?? 0),
                hint: `${n(s.orders?.pending)} orders`,
              },
              { label: 'Orders', value: n(s.orders?.total) },
              { label: 'Reservations', value: n(s.orders?.reservations) },
            ]}
          />
          <Grid>
            <Panel title="Revenue, 30 days" span={8}>
              <LineChart data={pts(s.revenue)} title="Paid revenue per day" unit="rwf" />
            </Panel>
            <Panel title="Payment state" span={4}>
              <Split
                parts={[
                  { label: 'Paid', value: s.orders?.paid ?? 0 },
                  { label: 'Pending', value: s.orders?.pending ?? 0 },
                  { label: 'Other', value: s.orders?.other ?? 0 },
                ]}
              />
            </Panel>
            <Panel title="Seller payouts" span={7} preview>
              <MiniTable
                head={['Payee', 'Vehicle', 'Amount', 'Status']}
                rows={[0, 1, 2, 3].map((i) => [
                  pick(people, i),
                  pick(cars, i),
                  rwf(18_500_000 + i * 2_250_000),
                  <Status key="s" tone={i === 0 ? 'warn' : 'ok'}>
                    {i === 0 ? 'To approve' : 'Paid'}
                  </Status>,
                ])}
              />
            </Panel>
            <Panel title="Commission by channel" span={5} preview>
              <BarChart
                data={series(8, 4_000_000, 1_500_000, 3)}
                title="Commission per week"
                unit="rwf"
              />
            </Panel>
          </Grid>
        </>
      );

    /* ------------------------------------------------------------ 18 */
    case 'FINANCE_OFFICER':
      return (
        <>
          <DashHead eyebrow={label} title="Accurate records. Smooth operations." />
          <Kpis
            items={[
              { label: 'Orders', value: n(s.orders?.total) },
              { label: 'Purchases', value: n(s.orders?.purchases) },
              { label: 'Rentals', value: n(s.orders?.rentals) },
              { label: 'Awaiting payment', value: rwf(s.orders?.pending_value ?? 0) },
            ]}
          />
          <Grid>
            <Panel title="Orders by type" span={5}>
              <Split
                parts={[
                  { label: 'Purchases', value: s.orders?.purchases ?? 0 },
                  { label: 'Rentals', value: s.orders?.rentals ?? 0 },
                  { label: 'Reservations', value: s.orders?.reservations ?? 0 },
                ]}
              />
            </Panel>
            <Panel title="Revenue, 30 days" span={7}>
              <BarChart data={pts(s.revenue)} title="Paid revenue per day" unit="rwf" />
            </Panel>
            <Panel title="Payout requests to prepare" span={12} preview>
              <MiniTable
                head={['Request', 'Payee', 'Period', 'Amount']}
                rows={[0, 1, 2, 3, 4].map((i) => [
                  `PO-2${310 + i}`,
                  pick(people, i + 2),
                  'September',
                  rwf(2_400_000 + i * 875_000),
                ])}
              />
            </Panel>
          </Grid>
        </>
      );

    /* ------------------------------------------------------------ 19 */
    case 'RECONCILIATION_OFFICER':
      return (
        <>
          <DashHead eyebrow={label} title="Every transaction. Accounted for." />
          <Kpis
            items={[
              { label: 'Paid orders', value: n(s.orders?.paid) },
              { label: 'Pending', value: n(s.orders?.pending) },
              { label: 'Failed or other', value: n(s.orders?.other) },
              { label: 'Paid value', value: rwf(s.orders?.paid_value ?? 0) },
            ]}
          />
          <Grid>
            <Panel title="Provider matching" span={5} preview>
              <Meters
                items={[
                  { label: 'Matched automatically', value: 96 },
                  { label: 'Matched by hand', value: 3 },
                  { label: 'Unmatched', value: 1 },
                ]}
              />
            </Panel>
            <Panel title="Settlements" span={7} preview>
              <BarChart data={series(14, 12, 6, 2)} title="Settlements per day" />
            </Panel>
            <Panel title="Discrepancies to investigate" span={12} preview>
              <MiniTable
                head={['Provider ref', 'Order', 'Difference', 'Flag']}
                rows={[0, 1, 2].map((i) => [
                  `MTN-88${21 + i}`,
                  `VO-7K2${i}M9`,
                  rwf(5_000 * (i + 1)),
                  <Status key="s" tone="warn">
                    {pick(['Amount', 'Duplicate', 'Missing'], i)}
                  </Status>,
                ])}
              />
            </Panel>
          </Grid>
        </>
      );

    /* ------------------------------------------------------------ 20 */
    case 'VEHICLE_INSPECTOR': {
      const vehicles = await latestVehicles();
      return (
        <>
          <DashHead eyebrow={label} title="Quality vehicles. Trusted marketplace." />
          <Kpis
            items={[
              {
                label: 'Waiting review',
                value: n(s.listings?.pending_review),
                href: '/admin/vehicles?status=pending_review',
              },
              {
                label: 'Verified',
                value: `${pct(s.listings?.verified, s.listings?.total)}%`,
                hint: `${n(s.listings?.verified)} of ${n(s.listings?.total)}`,
              },
              { label: 'Live', value: n(s.listings?.live) },
              { label: 'For rent', value: n(s.listings?.rentable) },
            ]}
          />
          <Grid>
            <Panel title="Inspection queue" span={7} preview>
              <MiniTable
                head={['Vehicle', 'Location', 'Booked', 'Result']}
                rows={[0, 1, 2, 3].map((i) => [
                  pick(cars, i),
                  pick(['Kigali', 'Musanze', 'Huye', 'Rubavu'], i),
                  `${10 + i}:00`,
                  <Status key="s" tone={i === 0 ? 'ok' : 'neutral'}>
                    {i === 0 ? 'Passed' : 'Scheduled'}
                  </Status>,
                ])}
              />
            </Panel>
            <Panel title="Checklist completion" span={5} preview>
              <Meters
                items={[
                  { label: 'Battery health report', value: 88 },
                  { label: 'VIN matches documents', value: 100 },
                  { label: 'Photos meet standard', value: 74 },
                ]}
              />
            </Panel>
            <Panel
              title="Latest listings to check"
              span={12}
              flush
              action={{ href: '/admin/vehicles', label: 'All' }}
            >
              <VehicleTiles items={vehicles} />
            </Panel>
          </Grid>
        </>
      );
    }

    /* ------------------------------------------------------------ 21 */
    case 'VERIFICATION_OFFICER':
      return (
        <>
          <DashHead
            eyebrow={label}
            title="Verified. Authentic. Secure."
            lead="Identity documents are restricted; every view is logged."
          />
          <Kpis
            items={[
              { label: 'Dealerships', value: n(s.companies?.dealers), href: '/admin/companies' },
              {
                label: 'Rental companies',
                value: n(s.companies?.rentals),
                href: '/admin/companies',
              },
              { label: 'Sellers', value: n(s.accounts?.sellers) },
              { label: 'Suspended companies', value: n(s.companies?.suspended) },
            ]}
          />
          <Grid>
            <Panel title="Documents waiting" span={8} preview>
              <MiniTable
                head={['Applicant', 'Document', 'Submitted', 'Decision']}
                rows={[0, 1, 2, 3].map((i) => [
                  pick(people, i),
                  pick(
                    ['National ID', 'RDB certificate', 'Vehicle logbook', 'Proof of address'],
                    i,
                  ),
                  `${i + 1} h ago`,
                  <Status key="s" tone="warn">
                    To review
                  </Status>,
                ])}
              />
            </Panel>
            <Panel title="Decisions this week" span={4} preview>
              <Split
                parts={[
                  { label: 'Approved', value: 23 },
                  { label: 'More info', value: 6 },
                  { label: 'Rejected', value: 2 },
                ]}
              />
            </Panel>
          </Grid>
        </>
      );

    /* ------------------------------------------------------------ 22 */
    case 'COMPLIANCE_OFFICER':
      return (
        <>
          <DashHead eyebrow={label} title="Stay compliant. Build trust." />
          <Kpis
            items={[
              { label: 'Live listings', value: n(s.listings?.live) },
              { label: 'Unpublished', value: n(s.listings?.unpublished) },
              { label: 'Suspended accounts', value: n(s.accounts?.suspended) },
              { label: 'Suspended companies', value: n(s.companies?.suspended) },
            ]}
          />
          <Grid>
            <Panel title="Policy checks" span={5} preview>
              <Meters
                items={[
                  { label: 'Listings with full documents', value: 92 },
                  { label: 'Claims backed by evidence', value: 97 },
                  { label: 'Companies with current licence', value: 88 },
                ]}
              />
            </Panel>
            <Panel title="Open cases" span={7} preview>
              <MiniTable
                head={['Case', 'Subject', 'Reason', 'Status']}
                rows={[0, 1, 2].map((i) => [
                  `CO-${301 + i}`,
                  pick(cars, i + 2),
                  pick(['Range claim', 'Duplicate listing', 'Expired licence'], i),
                  <Status key="s" tone="warn">
                    {i ? 'On hold' : 'Investigating'}
                  </Status>,
                ])}
              />
            </Panel>
            <Panel
              title="Recent staff activity"
              span={12}
              action={{ href: '/admin/audit', label: 'Audit log' }}
            >
              <Feed items={auditFeed(s)} empty="No staff activity yet." />
            </Panel>
          </Grid>
        </>
      );

    /* ------------------------------------------------------------ 23 */
    case 'MARKETING_MANAGER':
      return (
        <>
          <DashHead eyebrow={label} title="More reach. More customers." />
          <Kpis
            items={[
              { label: 'Leads, 14 days', value: n(sum(s.leads)) },
              { label: 'New accounts, 7 days', value: n(s.accounts?.new_7d) },
              { label: 'Guides', value: n(s.content?.guides) },
              { label: 'Blog posts', value: n(s.content?.posts) },
            ]}
          />
          <Grid>
            <Panel title="Leads per day" span={8}>
              <LineChart data={pts(s.leads)} title="Leads per day" />
            </Panel>
            <Panel title="Most-listed makes" span={4}>
              <Ranked items={s.by_make ?? []} />
            </Panel>
            <Panel title="Campaigns" span={12} preview>
              <MiniTable
                head={['Campaign', 'Channel', 'Budget used', 'Leads']}
                rows={[
                  ['EV Week Kigali', 'Instagram', '62%', '148'],
                  ['Charge-free October', 'Radio', '40%', '57'],
                  ['Fleet switch for businesses', 'LinkedIn', '18%', '21'],
                ]}
              />
            </Panel>
          </Grid>
        </>
      );

    /* ------------------------------------------------------------ 24 */
    case 'CONTENT_EDITOR':
      return (
        <>
          <DashHead eyebrow={label} title="Great content. Stronger brand." />
          <Kpis
            items={[
              { label: 'Guides', value: n(s.content?.guides), href: '/guides' },
              { label: 'Blog posts', value: n(s.content?.posts), href: '/blog' },
              {
                label: 'Last updated',
                value: s.content?.last_updated ? ago(s.content.last_updated) : '—',
              },
              {
                label: 'Drafts to approve',
                value: '—',
                hint: 'Editor arrives with the content module',
              },
            ]}
          />
          <Grid>
            <Panel title="Latest articles" span={8}>
              <MiniTable
                head={['Title', 'Type', 'Category', 'Published']}
                rows={(s.articles ?? []).map((a) => [
                  <a
                    key="t"
                    href={`/${a.kind === 'guide' ? 'guides' : 'blog'}/${a.slug}`}
                    className="hover:underline"
                  >
                    {a.title}
                  </a>,
                  a.kind === 'guide' ? 'Guide' : 'Blog',
                  <span key="c" className="capitalize">
                    {a.category.replace(/-/g, ' ')}
                  </span>,
                  ago(a.published_at),
                ])}
                empty="No articles yet."
              />
            </Panel>
            <Panel title="Homepage banners" span={4} preview>
              <Feed
                items={[
                  { title: 'October charging offer', meta: 'Draft · needs approval' },
                  { title: 'New BYD arrivals', meta: 'Scheduled · 12 Oct' },
                  { title: 'Rent before you buy', meta: 'Live' },
                ]}
              />
            </Panel>
          </Grid>
        </>
      );

    /* ------------------------------------------------------------ 25 */
    case 'ADVERTISING_MANAGER':
      return (
        <>
          <DashHead eyebrow={label} title="Target. Engage. Convert." />
          <Kpis
            preview
            items={[
              { label: 'Impressions, 30 d', value: '412k' },
              { label: 'Clicks', value: '9,860' },
              { label: 'Click-through', value: '2.4%' },
              { label: 'Active placements', value: '7' },
            ]}
          />
          <Grid>
            <Panel title="Impressions per day" span={8} preview>
              <LineChart data={series(30, 14000, 4000, 5)} title="Impressions per day" />
            </Panel>
            <Panel title="Placements" span={4} preview>
              <Ranked
                items={[
                  { label: 'Search results', value: 182000 },
                  { label: 'Vehicle pages', value: 121000 },
                  { label: 'Home spotlight', value: 76000 },
                  { label: 'Newsletter', value: 33000 },
                ]}
              />
            </Panel>
            <Panel title="Advertiser submissions" span={12} preview>
              <MiniTable
                head={['Advertiser', 'Placement', 'Dates', 'Status']}
                rows={[0, 1, 2].map((i) => [
                  pick(['Kigali Motors', 'EV Charge RW', 'Green Fleet Ltd'], i),
                  pick(['Search results', 'Home spotlight', 'Vehicle pages'], i),
                  '1–31 Oct',
                  <Status key="s" tone={i ? 'ok' : 'warn'}>
                    {i ? 'Running' : 'To approve'}
                  </Status>,
                ])}
              />
            </Panel>
          </Grid>
        </>
      );

    /* ------------------------------------------------------------ 26 */
    case 'DEVELOPER': {
      const p = s.platform;
      return (
        <>
          <DashHead
            eyebrow={label}
            title="Build. Innovate. Scale."
            lead="System health only — no customer data here."
          />
          <Kpis
            items={[
              { label: 'API', value: 'Healthy', hint: `v${p?.api_version ?? '—'}` },
              { label: 'Database size', value: p?.db_size ?? '—' },
              { label: 'Migrations', value: n(p?.migrations.length) },
              { label: 'Tables tracked', value: n(p?.tables.length) },
            ]}
          />
          <Grid>
            <Panel title="Rows per table" span={6}>
              <Ranked items={p?.tables ?? []} />
            </Panel>
            <Panel title="Applied migrations" span={6}>
              <pre className="overflow-x-auto bg-chrome p-4 font-mono text-xs leading-relaxed text-white/90">
                {(p?.migrations ?? []).map((m) => `✓ ${m}`).join('\n') || '—'}
              </pre>
            </Panel>
            <Panel title="Deploys" span={12} preview>
              <MiniTable
                head={['Commit', 'Service', 'Took', 'Result']}
                rows={[0, 1, 2].map((i) => [
                  <span key="c" className="font-data text-xs">
                    {pick(['3f15e65', 'bdacb1f', '8d8dfdd'], i)}
                  </span>,
                  pick(['API', 'Website', 'API'], i),
                  `${2 + i} min`,
                  <Status key="s" tone="ok">
                    Live
                  </Status>,
                ])}
              />
            </Panel>
          </Grid>
        </>
      );
    }

    /* ------------------------------------------------------------ 27 */
    case 'DATA_ANALYST':
      return (
        <>
          <DashHead
            eyebrow={label}
            title="Data-driven decisions."
            lead="Aggregated figures only — no personal data."
          />
          <Kpis
            items={[
              { label: 'Accounts', value: n(s.accounts?.total) },
              { label: 'Listings', value: n(s.listings?.total) },
              { label: 'Leads, 14 days', value: n(sum(s.leads)) },
              { label: 'Rentable', value: `${pct(s.listings?.rentable, s.listings?.total)}%` },
            ]}
          />
          <Grid>
            <Panel title="Leads per day" span={6}>
              <BarChart data={pts(s.leads)} title="Leads per day" />
            </Panel>
            <Panel title="New accounts, 30 days" span={6}>
              <LineChart data={pts(s.signups)} title="New accounts per day" />
            </Panel>
            <Panel title="Stock by make" span={4}>
              <Ranked items={s.by_make ?? []} />
            </Panel>
            <Panel title="Stock by body type" span={4}>
              <Ranked items={s.by_body ?? []} />
            </Panel>
            <Panel title="Demand by district" span={4} preview>
              <RwandaMap
                points={[
                  { place: 'Kigali', value: 64 },
                  { place: 'Musanze', value: 12 },
                  { place: 'Huye', value: 9 },
                  { place: 'Rubavu', value: 7 },
                  { place: 'Rwamagana', value: 5 },
                ]}
              />
            </Panel>
          </Grid>
        </>
      );

    /* ------------------------------------------------------------ 28 */
    case 'AUDITOR':
      return (
        <>
          <DashHead
            eyebrow={label}
            title="Transparency. Accountability."
            lead="Read-only. Nothing here can be changed or deleted."
          />
          <Kpis
            items={[
              { label: 'Orders', value: n(s.orders?.total) },
              { label: 'Paid value', value: rwf(s.orders?.paid_value ?? 0) },
              { label: 'Pending value', value: rwf(s.orders?.pending_value ?? 0) },
              {
                label: 'Latest action',
                value: s.audit?.[0] ? ago(s.audit[0].created_at) : '—',
                href: '/admin/audit',
              },
            ]}
          />
          <Grid>
            <Panel
              title="Audit trail"
              span={8}
              action={{ href: '/admin/audit', label: 'Full log' }}
            >
              <MiniTable
                head={['Action', 'Who', 'On', 'When']}
                rows={(s.audit ?? []).map((a) => [
                  pretty(a.action),
                  a.actor,
                  <span key="e" className="text-xs text-steel">
                    {a.entity}
                  </span>,
                  ago(a.created_at),
                ])}
                empty="No actions recorded yet."
              />
            </Panel>
            <Panel title="Revenue, 30 days" span={4}>
              <BarChart data={pts(s.revenue)} title="Paid revenue per day" unit="rwf" />
            </Panel>
          </Grid>
        </>
      );

    default:
      return <DashHead eyebrow={label} title="Welcome." />;
  }
}
