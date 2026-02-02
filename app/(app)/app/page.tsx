import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth/actions';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function AppDashboard() {
  const user = await getUser();

  // Check if user has connected email
  const supabase = await createClient();
  const { data: accounts } = await supabase
    .from('email_accounts')
    .select('*')
    .eq('user_id', user!.id);

  // If user has email account, redirect to home dashboard
  if (accounts && accounts.length > 0) {
    redirect('/app/home');
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Welcome to EaseMail</h1>
          <p className="text-muted-foreground">
            Hi {user?.user_metadata?.name || user?.email}! Let's get you set up.
          </p>
        </div>

        {/* Onboarding Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>📧 Connect Your Email</CardTitle>
              <CardDescription>
                Connect Gmail, Outlook, or any IMAP account to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/app/connect">
                <Button className="w-full">Connect Email Account</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎨 Customize Your Experience</CardTitle>
              <CardDescription>
                Set up your preferences and explore EaseMail features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/app/settings">
                <Button variant="outline" className="w-full">
                  Go to Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>✨ What you can do with EaseMail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-semibold">🤖 AI Remix</h3>
                <p className="text-sm text-muted-foreground">
                  Transform messy text into polished, professional emails instantly
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">🎤 AI Dictate</h3>
                <p className="text-sm text-muted-foreground">
                  Speak naturally and get a perfectly formatted email
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">🔊 Voice Messages</h3>
                <p className="text-sm text-muted-foreground">
                  Add personality with audio messages attached to emails
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">📅 Smart Calendar</h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered event creation from natural language
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
