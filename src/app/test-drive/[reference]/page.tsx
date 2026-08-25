import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ApiError } from '@/lib/api/errors';
import { getTestDrive, type TestDriveStatus } from '@/lib/api/leads';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Test drive status',
  description: 'Track a Voltaris test drive request.',
  path: '/test-drive',
  noindex: true,
  follow: false,
});

const STATUS_COPY: Record<TestDriveStatus, { title: string; body: string }> = {
  requested: {
    title: 'Waiting on the seller',
    body: 'Voltaris has your request and is confirming the slot. You will get an email and an SMS when it is set.',
  },
  confirmed: {
    title: 'Confirmed',
    body: 'The seller has accepted the slot below. Bring your driving licence and an ID.',
  },
  rescheduled: {
    title: 'Moved to a new slot',
    body: 'The original time did not work. The new slot is below — reply to the email if it does not suit you.',
  },
  completed: {
    title: 'Drive completed',
    body: 'Hope it went well. If you want to take it further, send an enquiry from the listing.',
  },
  cancelled: {
    title: 'Cancelled',
    body: 'This request was cancelled. You can request another slot at any time.',
  },
};

export default async function TestDriveStatusPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;

  let record;
  try {
    record = await getTestDrive(reference);
  } catch (cause) {
    if (cause instanceof ApiError && cause.isNotFound) notFound();
    throw cause;
  }

  const copy = STATUS_COPY[record.status];

  return (
    <div className="shell max-w-2xl py-10">
      <Breadcrumbs
        trail={[
          { name: 'Home', path: '/' },
          { name: 'Test drive', path: '/test-drive' },
          { name: reference, path: `/test-drive/${reference}` },
        ]}
      />
      <p className="eyebrow mt-6">Reference {record.reference}</p>
      <h1 className="mt-2 font-display text-headline">{copy.title}</h1>
      <p className="mt-4 max-w-prose text-sm leading-relaxed text-steel">{copy.body}</p>
      {record.scheduled_for && (
        <p className="mt-6 border border-hairline p-5 font-data text-sm">
          {new Date(record.scheduled_for).toLocaleString('en-RW', {
            dateStyle: 'full',
            timeStyle: 'short',
          })}
        </p>
      )}
    </div>
  );
}
