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
  const { data: preferences, error: prefsError } = (await supabase
    .from('user_preferences')
    .select('onboarding_completed')
    .eq('user_id', user.id)
    .single()) as { data: { onboarding_completed: boolean } | null; error: any };

  // If error or no preferences record, redirect to onboarding
  if (prefsError || !preferences) {
    if (prefsError) {
      console.error('User preferences fetch error:', {
        userId: user.id,
        error: prefsError,
        code: prefsError.code,
        message: prefsError.message,
      });
    } else {
      console.log('User preferences record not found for user:', user.id);
    }
    redirect('/onboarding');
  }

  // Redirect to onboarding if not completed
  if (!preferences.onboarding_completed) {
    redirect('/onboarding');
  }

  return (
    <AppShell>
      {children}
    </AppShell>
  );
}
