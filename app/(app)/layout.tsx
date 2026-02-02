import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth/actions';
import { AppShell } from '@/components/layout/app-shell';
import { createClient } from '@/lib/supabase/server';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user has completed onboarding
  const supabase = await createClient();
  const { data: preferences } = (await supabase
    .from('user_preferences')
    .select('onboarding_completed')
    .eq('user_id', user.id)
    .single()) as { data: { onboarding_completed: boolean } | null };

  // Redirect to onboarding if not completed
  // (Existing users will have onboarding_completed = true from migration)
  if (!preferences?.onboarding_completed) {
    redirect('/onboarding');
  }

  return (
    <AppShell>
      {children}
    </AppShell>
  );
}
