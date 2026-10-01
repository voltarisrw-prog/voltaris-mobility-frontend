import { CustomerDashboard } from '@/features/dashboard/customer';
import { getSession } from '@/lib/api/auth';

/** Registered Customer and Individual Seller dashboard. */
export default async function AccountOverview() {
  const { user } = await getSession();
  return <CustomerDashboard user={user} />;
}
