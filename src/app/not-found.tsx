import { EmptyState } from '@/components/EmptyState';

export default function NotFound() {
  return (
    <div className="shell py-24">
      <EmptyState
        title="That page is not here"
        body="The link may be out of date, or the listing may have been sold and removed. Browse what is currently available instead."
        action={{ label: 'Browse electric vehicles', href: '/cars' }}
      />
    </div>
  );
}
