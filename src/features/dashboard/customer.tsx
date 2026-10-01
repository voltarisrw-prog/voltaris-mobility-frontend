import Link from 'next/link';
import {
  DashHead,
  Feed,
  Grid,
  Kpis,
  MiniTable,
  Panel,
  Status,
  VehicleTiles,
  ago,
  rwf,
} from './kit';
import {
  getMyInquiries,
  getMyTestDrives,
  getNotifications,
  getSavedVehicles,
} from '@/lib/api/users';
import { listOrders } from '@/lib/api/orders';
import { getMySellerListings } from '@/lib/api/sellers';
import type { PublicUser } from '@/lib/api/auth';

/** Settle every call: one empty list must not take the whole page down. */
async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

/**
 * Registered Customer (14) and Individual Seller (5). Everything here is the
 * signed-in person's own data, scoped by the backend to their session.
 */
export async function CustomerDashboard({ user }: { user: PublicUser }) {
  const seller = user.roles.includes('SELLER');
  const [saved, drives, inquiries, notes, orders, listings] = await Promise.all([
    safe(getSavedVehicles(), []),
    safe(getMyTestDrives(), []),
    safe(getMyInquiries(), []),
    safe(getNotifications(), []),
    safe(listOrders(), { items: [], next_cursor: null }),
    safe(getMySellerListings(), { items: [] }),
  ]);
  const isSeller = seller || listings.items.length > 0;
  const first = user.full_name.split(' ')[0];

  return (
    <>
      <DashHead
        eyebrow={isSeller ? 'Individual Seller' : 'Your account'}
        title={isSeller ? 'Your vehicles. Your business.' : `Your journey, ${first}.`}
        actions={
          <>
            <Link href="/buy" className="vds-button vds-button-primary">
              Browse cars
            </Link>
            <Link href="/sell" className="vds-button vds-button-secondary">
              Sell a car
            </Link>
          </>
        }
      />
      <Kpis
        items={
          isSeller
            ? [
                { label: 'My listings', value: listings.items.length },
                {
                  label: 'In review',
                  value: listings.items.filter((l) => /submitted|review/.test(l.status)).length,
                },
                { label: 'Enquiries sent', value: inquiries.length, href: '/account/inquiries' },
                { label: 'Saved cars', value: saved.length, href: '/account/saved' },
              ]
            : [
                { label: 'Saved cars', value: saved.length, href: '/account/saved' },
                { label: 'Test drives', value: drives.length, href: '/account/test-drives' },
                { label: 'Enquiries', value: inquiries.length, href: '/account/inquiries' },
                { label: 'Orders', value: orders.items.length, href: '/account/orders' },
              ]
        }
      />
      <Grid>
        {isSeller && (
          <Panel title="My listings" span={12} action={{ href: '/sell', label: 'List another' }}>
            <MiniTable
              head={['Reference', 'Vehicle', 'Asking', 'Status']}
              rows={listings.items.map((l) => [
                <span key="r" className="font-data text-xs">
                  {l.reference}
                </span>,
                [l.year, l.make, l.model].filter(Boolean).join(' '),
                l.expected_price ? rwf(l.expected_price) : '—',
                <Status key="s" tone={l.status === 'published' ? 'ok' : 'neutral'}>
                  {l.status.replace(/_/g, ' ')}
                </Status>,
              ])}
              empty="You haven't listed a vehicle yet."
            />
          </Panel>
        )}
        <Panel
          title="Saved cars"
          span={12}
          flush
          action={{ href: '/account/saved', label: 'All saved' }}
        >
          <VehicleTiles
            items={saved.slice(0, 8).map((v) => ({
              id: v.id,
              slug: v.slug,
              title: `${v.year} ${v.make} ${v.model}`,
              image_url: v.primary_image?.card,
              line: v.price ? rwf(v.price) : 'Price on request',
            }))}
            empty="Tap the heart on any car to keep it here."
          />
        </Panel>
        <Panel title="Test drives" span={7} action={{ href: '/account/test-drives', label: 'All' }}>
          <MiniTable
            head={['Vehicle', 'Where', 'When', 'Status']}
            rows={drives
              .slice(0, 5)
              .map((d) => [
                `${d.vehicle.year} ${d.vehicle.make} ${d.vehicle.model}`,
                d.location,
                d.scheduled_for
                  ? new Date(d.scheduled_for).toLocaleDateString('en-RW', {
                      day: 'numeric',
                      month: 'short',
                    })
                  : '—',
                <Status key="s">{d.status}</Status>,
              ])}
            empty="No test drives booked."
          />
        </Panel>
        <Panel
          title="Notifications"
          span={5}
          action={{ href: '/account/notifications', label: 'All' }}
        >
          <Feed
            items={notes
              .slice(0, 5)
              .map((n) => ({ title: n.title, meta: n.body, when: ago(n.created_at) }))}
            empty="You're all caught up."
          />
        </Panel>
        <Panel
          title="Orders and bookings"
          span={12}
          action={{ href: '/account/orders', label: 'All' }}
        >
          <MiniTable
            head={['Reference', 'Vehicle', 'Total', 'Status']}
            rows={orders.items.slice(0, 5).map((o) => [
              <span key="r" className="font-data text-xs">
                {o.reference}
              </span>,
              o.vehicle.title,
              rwf(o.total),
              <Status key="s" tone={o.payment_state === 'PAID' ? 'ok' : 'warn'}>
                {o.status.replace(/_/g, ' ')}
              </Status>,
            ])}
            empty="No orders yet."
          />
        </Panel>
      </Grid>
    </>
  );
}
