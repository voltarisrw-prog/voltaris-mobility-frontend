import Link from 'next/link';

/** An empty screen is an invitation to act, so it always carries a way forward. */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="border border-dashed border-hairline px-6 py-16 text-center">
      <h2 className="font-display text-headline">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-steel">{body}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-6 inline-block bg-volt px-5 py-2.5 font-data text-eyebrow uppercase text-surface transition-colors hover:bg-volt-bright"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
