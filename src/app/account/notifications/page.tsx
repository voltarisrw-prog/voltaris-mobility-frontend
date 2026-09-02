import Link from 'next/link';
import { EmptyState } from '@/components/EmptyState';
import { getNotifications } from '@/lib/api/users';

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  return (
    <section>
      <h2 className="section-heading">Notifications</h2>
      <div className="mt-8">
        {notifications.items.length === 0 ? (
          <EmptyState
            title="Nothing to catch up on"
            body="Replies from sellers, test drive confirmations, and saved-search matches land here."
          />
        ) : (
          <ul className="divide-y divide-hairline/60 border-y border-hairline/60">
            {notifications.items.map((item) => (
              <li key={item.id} className="py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-sm font-semibold tracking-tight">
                    {item.href ? (
                      <Link href={item.href} className="hover:text-volt">
                        {item.title}
                      </Link>
                    ) : (
                      item.title
                    )}
                  </h3>
                  {!item.read && (
                    <span className="shrink-0 bg-volt px-2 py-0.5 font-data text-eyebrow uppercase text-surface">
                      New
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-steel">{item.body}</p>
                <p className="mt-1 font-data text-xs text-steel-muted">
                  {new Date(item.created_at).toLocaleDateString('en-RW', { dateStyle: 'medium' })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
