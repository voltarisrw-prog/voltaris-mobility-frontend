import { ProfileForm } from '@/features/auth/ProfileForm';
import { getProfile } from '@/lib/api/users';

export default async function ProfilePage() {
  const profile = await getProfile();
  return (
    <section>
      <h2 className="section-heading">Profile</h2>
      <p className="mt-2 text-sm text-steel">
        Member since{' '}
        {new Date(profile.created_at).toLocaleDateString('en-RW', { dateStyle: 'long' })}.
      </p>
      <div className="mt-8">
        <ProfileForm profile={profile} />
      </div>
    </section>
  );
}
