import { BarChart, type Point } from './charts';
import {
  DashHead,
  Feed,
  Grid,
  Kpis,
  Meters,
  MiniTable,
  Panel,
  Split,
  Status,
  VehicleTiles,
  ago,
  rwf,
} from './kit';
import { RwandaMap } from './RwandaMap';
import { cars, people, pick, series } from './sample';
import {
  orgLeads,
  orgMembers,
  orgVehicles,
  type OrgHome,
  type OrgLead,
  type OrgVehicle,
} from '@/lib/api/orgs';

/*
 * One dashboard per company role (dealership, rental company, business customer).
 * Every list comes from this company's own endpoints, so nothing from another
 * company can appear; figures are computed here from those lists.
 */

const has = (home: OrgHome, ...p: string[]) => p.some((x) => home.permissions.includes(x));

function perDay(leads: OrgLead[], days = 14): Point[] {
  const counts = new Map<string, number>();
  for (const l of leads)
    counts.set(l.created_at.slice(0, 10), (counts.get(l.created_at.slice(0, 10)) ?? 0) + 1);
  const out: Point[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ label: key, value: counts.get(key) ?? 0 });
  }
  return out;
}

const stock = (v: OrgVehicle[]) => [
  { label: 'Available', value: v.filter((x) => x.status === 'available').length },
  { label: 'Reserved', value: v.filter((x) => x.status === 'reserved').length },
  { label: 'Sold', value: v.filter((x) => x.status === 'sold').length },
  { label: 'Unavailable', value: v.filter((x) => x.status === 'unavailable').length },
];

const tiles = (v: OrgVehicle[]) =>
  v.slice(0, 8).map((x) => ({
    id: x.id,
    slug: x.slug,
    title: x.title,
    image_url: x.image_url,
    line: x.price
      ? rwf(x.price)
      : x.rental_price_per_day
        ? `${rwf(x.rental_price_per_day)}/day`
        : '—',
    status: x.status,
  }));

const leadRows = (leads: OrgLead[], team: Map<string, string>) =>
  leads.slice(0, 8).map((l) => [
    <div key="c">
      <p>{l.customer_name}</p>
      <p className="text-xs text-steel-muted">{l.phone}</p>
    </div>,
    l.vehicle_title,
    l.kind === 'test_drive' ? 'Test drive' : 'Enquiry',
    l.assigned_to ? (
      (team.get(l.assigned_to) ?? 'Assigned')
    ) : (
      <Status key="s" tone="warn">
        Unassigned
      </Status>
    ),
  ]);

export async function CompanyDashboard({ org, home }: { org: string; home: OrgHome }) {
  const [vehicles, leads, members] = await Promise.all([
    has(home, 'org.vehicles.read')
      ? orgVehicles(org).then((r) => r.items)
      : Promise.resolve([] as OrgVehicle[]),
    has(home, 'org.leads.read_all', 'org.leads.read_assigned')
      ? orgLeads(org).then((r) => r.items)
      : Promise.resolve([] as OrgLead[]),
    has(home, 'org.members.read', 'org.members.manage', 'org.members.manage_limited')
      ? orgMembers(org).then((r) => r.items)
      : Promise.resolve([]),
  ]);
  const team = new Map(members.map((m) => [m.user_id, m.full_name]));
  const available = vehicles.filter((v) => v.status === 'available').length;
  const unassigned = leads.filter((l) => !l.assigned_to).length;
  const tab = (t: string) => `/business/${org}?tab=${t}`;
  const key = `${home.kind}:${home.role}`;
  const head = (title: string, lead?: string) => (
    <DashHead eyebrow={`${home.name} · ${home.role_label}`} title={title} lead={lead} />
  );

  switch (key) {
    /* ------------------------------------------------------------ 6 */
    case 'dealer:OWNER':
      return (
        <>
          {head('Grow your dealership. Drive more sales.')}
          <Kpis
            items={[
              { label: 'Vehicles', value: vehicles.length, href: tab('vehicles') },
              { label: 'Available', value: available },
              {
                label: 'Leads',
                value: leads.length,
                hint: `${unassigned} unassigned`,
                href: tab('leads'),
              },
              { label: 'Team', value: members.length, href: tab('team') },
            ]}
          />
          <Grid>
            <Panel
              title="Your vehicles"
              span={12}
              flush
              action={{ href: tab('vehicles'), label: 'Manage' }}
            >
              <VehicleTiles items={tiles(vehicles)} empty="No vehicles linked yet." />
            </Panel>
            <Panel title="Leads per day" span={7}>
              <BarChart data={perDay(leads)} title="Leads per day" />
            </Panel>
            <Panel title="Stock" span={5}>
              <Split parts={stock(vehicles)} />
            </Panel>
            <Panel title="Revenue" span={6} preview>
              <BarChart
                data={series(8, 42_000_000, 15_000_000, 4)}
                title="Sales per week"
                unit="rwf"
              />
            </Panel>
            <Panel title="Team" span={6} action={{ href: tab('team'), label: 'Manage' }}>
              <Feed items={members.map((m) => ({ title: m.full_name, meta: m.role_label }))} />
            </Panel>
          </Grid>
        </>
      );

    /* ------------------------------------------------------------ 7 */
    case 'dealer:MANAGER':
      return (
        <>
          {head('Coordinate. Optimize. Sell.')}
          <Kpis
            items={[
              { label: 'Unassigned leads', value: unassigned, href: tab('leads') },
              { label: 'All leads', value: leads.length },
              { label: 'Available stock', value: available, href: tab('vehicles') },
              { label: 'Team', value: members.length, href: tab('team') },
            ]}
          />
          <Grid>
            <Panel title="Lead pipeline" span={8} action={{ href: tab('leads'), label: 'Assign' }}>
              <MiniTable
                head={['Customer', 'Vehicle', 'Type', 'Owner']}
                rows={leadRows(leads, team)}
                empty="No leads yet."
              />
            </Panel>
            <Panel title="Stock" span={4}>
              <Split parts={stock(vehicles)} />
            </Panel>
            <Panel title="Team performance" span={12} preview>
              <Meters
                items={members
                  .slice(0, 4)
                  .map((m, i) => ({
                    label: m.full_name,
                    value: [72, 58, 41, 30][i] ?? 20,
                    note: `${[18, 14, 9, 6][i] ?? 3} leads closed`,
                  }))}
              />
            </Panel>
          </Grid>
        </>
      );

    /* ------------------------------------------------------------ 8 */
    case 'dealer:SALES_AGENT':
      return (
        <>
          {head('More leads. More conversations.', 'Leads your manager assigned to you.')}
          <Kpis
            items={[
              { label: 'My leads', value: leads.length, href: tab('leads') },
              { label: 'Test drives', value: leads.filter((l) => l.kind === 'test_drive').length },
              { label: 'Enquiries', value: leads.filter((l) => l.kind === 'inquiry').length },
              { label: 'Cars to show', value: available, href: tab('vehicles') },
            ]}
          />
          <Grid>
            <Panel title="My leads" span={7} action={{ href: tab('leads'), label: 'All' }}>
              <MiniTable
                head={['Customer', 'Vehicle', 'Type', 'Received']}
                rows={leads.slice(0, 8).map((l) => [
                  <div key="c">
                    <p>{l.customer_name}</p>
                    <p className="text-xs text-steel-muted">{l.phone}</p>
                  </div>,
                  l.vehicle_title,
                  l.kind === 'test_drive' ? 'Test drive' : 'Enquiry',
                  ago(l.created_at),
                ])}
                empty="Nothing assigned to you yet."
              />
            </Panel>
            <Panel title="Today" span={5} preview>
              <Feed
                items={[0, 1, 2].map((i) => ({
                  title: `${pick(['Call back', 'Test drive', 'Send offer'], i)} — ${pick(people, i)}`,
                  meta: pick(cars, i),
                  when: `${9 + i * 2}:00`,
                }))}
              />
            </Panel>
            <Panel title="Cars you can show" span={12} flush>
              <VehicleTiles items={tiles(vehicles.filter((v) => v.status === 'available'))} />
            </Panel>
          </Grid>
        </>
      );

    /* ------------------------------------------------------------ 9 */
    case 'dealer:INVENTORY_MANAGER':
      return (
        <>
          {head('Keep your inventory in perfect shape.')}
          <Kpis
            items={stock(vehicles).map((s) => ({
              label: s.label,
              value: s.value,
              href: tab('vehicles'),
            }))}
          />
          <Grid>
            <Panel
              title="Inventory"
              span={8}
              action={{ href: tab('vehicles'), label: 'Update status' }}
            >
              <MiniTable
                head={['Vehicle', 'Body', 'Range', 'Status']}
                rows={vehicles.slice(0, 10).map((v) => [
                  v.title,
                  <span key="b" className="capitalize">
                    {(v.body_type ?? '—').replace(/_/g, ' ')}
                  </span>,
                  v.range_km ? `${v.range_km} km` : '—',
                  <Status key="s" tone={v.status === 'available' ? 'ok' : 'neutral'}>
                    {v.status}
                  </Status>,
                ])}
                empty="No vehicles linked yet."
              />
            </Panel>
            <Panel title="Stock" span={4}>
              <Split parts={stock(vehicles)} />
            </Panel>
            <Panel title="Documents" span={12} preview>
              <Meters
                items={[
                  { label: 'VIN recorded', value: 100 },
                  { label: 'Logbook uploaded', value: 83 },
                  { label: 'Battery report uploaded', value: 67 },
                ]}
              />
            </Panel>
          </Grid>
        </>
      );

    /* ------------------------------------------------------------ 10 */
    case 'rental:OWNER':
      return (
        <>
          {head('Manage your fleet. Grow your business.')}
          <Kpis
            items={[
              { label: 'Fleet', value: vehicles.length, href: tab('vehicles') },
              { label: 'Available now', value: available },
              { label: 'Requests', value: leads.length, href: tab('leads') },
              { label: 'Team', value: members.length, href: tab('team') },
            ]}
          />
          <Grid>
            <Panel
              title="Your fleet"
              span={12}
              flush
              action={{ href: tab('vehicles'), label: 'Manage' }}
            >
              <VehicleTiles items={tiles(vehicles)} empty="No vehicles linked yet." />
            </Panel>
            <Panel title="Rental revenue" span={7} preview>
              <BarChart
                data={series(14, 1_800_000, 700_000, 6)}
                title="Rental revenue per day"
                unit="rwf"
              />
            </Panel>
            <Panel title="Branches" span={5} preview>
              <RwandaMap
                points={[
                  { place: 'Kigali', value: 14 },
                  { place: 'Musanze', value: 4 },
                  { place: 'Rubavu', value: 3 },
                ]}
              />
            </Panel>
          </Grid>
        </>
      );

    /* ------------------------------------------------------------ 11 */
    case 'rental:MANAGER':
      return (
        <>
          {head('Smooth bookings. Happy renters.')}
          <Kpis
            items={[
              { label: 'Requests to handle', value: unassigned, href: tab('leads') },
              { label: 'Available cars', value: available, href: tab('vehicles') },
              { label: 'Fleet', value: vehicles.length },
              { label: 'Team', value: members.length, href: tab('team') },
            ]}
          />
          <Grid>
            <Panel
              title="Rental requests"
              span={8}
              action={{ href: tab('leads'), label: 'Assign' }}
            >
              <MiniTable
                head={['Customer', 'Vehicle', 'Type', 'Agent']}
                rows={leadRows(leads, team)}
                empty="No requests yet."
              />
            </Panel>
            <Panel title="Utilisation" span={4} preview>
              <Meters
                items={[
                  { label: 'This week', value: 71 },
                  { label: 'Weekends', value: 88 },
                  { label: 'Long rentals (7+ days)', value: 34 },
                ]}
              />
            </Panel>
            <Panel title="Fleet" span={12}>
              <Split parts={stock(vehicles)} />
            </Panel>
          </Grid>
        </>
      );

    /* ------------------------------------------------------------ 12 */
    case 'rental:RENTAL_AGENT':
      return (
        <>
          {head('Deliver great rental experiences.', 'Reservations assigned to you.')}
          <Kpis
            items={[
              { label: 'My reservations', value: leads.length, href: tab('leads') },
              { label: 'Cars ready', value: available, href: tab('vehicles') },
              { label: 'Pick-ups today', value: '—', hint: 'Arrives with bookings' },
              { label: 'Returns today', value: '—', hint: 'Arrives with bookings' },
            ]}
          />
          <Grid>
            <Panel title="My reservations" span={7}>
              <MiniTable
                head={['Renter', 'Vehicle', 'Phone', 'Received']}
                rows={leads
                  .slice(0, 8)
                  .map((l) => [l.customer_name, l.vehicle_title, l.phone, ago(l.created_at)])}
                empty="Nothing assigned to you yet."
              />
            </Panel>
            <Panel title="Pick-ups and returns" span={5} preview>
              <Feed
                items={[0, 1, 2].map((i) => ({
                  title: `${i % 2 ? 'Return' : 'Pick-up'} — ${pick(people, i + 3)}`,
                  meta: pick(cars, i + 1),
                  when: `${10 + i}:30`,
                }))}
              />
            </Panel>
            <Panel title="Cars ready to go" span={12} flush>
              <VehicleTiles items={tiles(vehicles.filter((v) => v.status === 'available'))} />
            </Panel>
          </Grid>
        </>
      );

    /* ------------------------------------------------------------ 13 */
    case 'rental:FLEET_MANAGER':
      return (
        <>
          {head('Healthy fleet. Maximum uptime.')}
          <Kpis
            items={stock(vehicles).map((s) => ({
              label: s.label,
              value: s.value,
              href: tab('vehicles'),
            }))}
          />
          <Grid>
            <Panel title="Where the fleet is" span={5} preview>
              <RwandaMap
                points={[
                  { place: 'Kigali', value: 11 },
                  { place: 'Musanze', value: 3 },
                  { place: 'Huye', value: 2 },
                ]}
              />
            </Panel>
            <Panel title="Charge and service" span={7} preview>
              <Meters
                items={[
                  { label: 'Average charge', value: 76 },
                  { label: 'Due for service this month', value: 18, note: '3 vehicles' },
                  { label: 'Tyres within spec', value: 94 },
                ]}
              />
            </Panel>
            <Panel title="Maintenance schedule" span={12} preview>
              <MiniTable
                head={['Vehicle', 'Job', 'Branch', 'Due']}
                rows={[0, 1, 2].map((i) => [
                  pick(cars, i + 1),
                  pick(['Annual service', 'Tyre rotation', 'Battery check'], i),
                  pick(['Kigali', 'Musanze', 'Kigali'], i),
                  `${3 + i * 4} Oct`,
                ])}
              />
            </Panel>
          </Grid>
        </>
      );

    /* ------------------------------------------------------------ 15 */
    case 'business:OWNER':
    case 'business:EMPLOYEE':
      return (
        <>
          {head('Fleet solutions for your organization.')}
          <Kpis
            preview
            items={[
              { label: 'Team members', value: members.length || '—' },
              { label: 'Company orders', value: '6' },
              { label: 'Spend this year', value: rwf(186_000_000) },
              { label: 'Approvals waiting', value: '2' },
            ]}
          />
          <Grid>
            <Panel title="Company orders" span={8} preview>
              <MiniTable
                head={['Order', 'Vehicle', 'Requested by', 'Status']}
                rows={[0, 1, 2].map((i) => [
                  `VO-B${41 + i}`,
                  pick(cars, i),
                  pick(people, i),
                  <Status key="s" tone={i ? 'ok' : 'warn'}>
                    {i ? 'Delivered' : 'To approve'}
                  </Status>,
                ])}
              />
            </Panel>
            <Panel title="Spending limits" span={4} preview>
              <Meters
                items={[
                  { label: 'Vehicles budget', value: 62 },
                  { label: 'Rentals budget', value: 35 },
                ]}
              />
            </Panel>
            {members.length > 0 && (
              <Panel title="Your team" span={12} action={{ href: tab('team'), label: 'Manage' }}>
                <Feed items={members.map((m) => ({ title: m.full_name, meta: m.role_label }))} />
              </Panel>
            )}
          </Grid>
        </>
      );

    default:
      return head(`Welcome to ${home.name}.`);
  }
}
