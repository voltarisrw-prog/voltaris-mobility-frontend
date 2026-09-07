import type { Metadata } from 'next';
import { ActivitiesShowcase } from '@/features/activities/ActivitiesShowcase';

export const metadata: Metadata = {
  title: 'Activities | Voltaris Mobility',
  description:
    'Discover Voltaris drives, experiences, mobility events and automotive gatherings across Rwanda.',
};

export default function ActivitiesPage() {
  return (
    <main className="shell pb-24 pt-28 sm:pb-32 sm:pt-36">
      <ActivitiesShowcase />
    </main>
  );
}
