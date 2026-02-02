import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth/actions';
import { AppShell } from '@/components/layout/app-shell';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <AppShell>
      {children}
    </AppShell>
  );
}
