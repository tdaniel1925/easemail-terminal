'use client';

/**
 * Billing Settings Page - Beta Version
 *
 * Simplified billing page that shows beta status and provides basic
 * subscription management without payment processing during beta.
 *
 * Access: OWNER and ADMIN roles only. MEMBER role users are redirected.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SubscriptionStatus } from '@/components/billing/subscription-status';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowRight, CreditCard, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserOrganization {
  id: string;
  name: string;
  role: string;
}

export default function BillingPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<UserOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccessAndFetchData = async () => {
      try {
        // Check user role
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/app/settings/account');
          return;
        }

        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single() as { data: { role: string } | null };

        // MEMBER role users cannot access billing page
        if (userData && userData.role === 'MEMBER') {
          router.push('/app/settings/account');
          return;
        }

        setHasAccess(true);

        // Fetch organizations
        const response = await fetch('/api/organization/list');
        if (response.ok) {
          const data = await response.json();
          setOrganizations(data.organizations || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAccessAndFetchData();
  }, [router]);

  const isOrgAdmin = organizations.some((org) => org.role === 'admin' || org.role === 'owner');
  const isMemberOnly = organizations.length > 0 && !isOrgAdmin;

  // Show nothing while checking access (will redirect if no access)
  if (loading || !hasAccess) {
    return null;
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Beta Notice */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          EaseMail is currently in beta. All users have full access to all features at no charge
          during the beta period.
        </AlertDescription>
      </Alert>

      {/* Individual Subscription Status */}
      {!isMemberOnly && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Individual Subscription</h2>
            <p className="text-sm text-muted-foreground">
              Your personal subscription for individual use
            </p>
          </div>
          <SubscriptionStatus type="individual" />
        </div>
      )}

      {/* Organization Member Notice */}
      {isMemberOnly && (
        <Card>
          <CardHeader>
            <CardTitle>Organization Member</CardTitle>
            <CardDescription>Your subscription is managed by your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You are a member of an organization. Your subscription and billing are handled by
              your organization administrator. If you have questions about billing, please contact
              your organization admin.
            </p>
            <div className="mt-4">
              <Link href="/app/organization">
                <Button variant="outline">
                  View Organization
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Organization Billing (for admins) */}
      {isOrgAdmin && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Organization Subscriptions</h2>
            <p className="text-sm text-muted-foreground">
              Manage subscriptions for organizations you administer
            </p>
          </div>
          {organizations
            .filter((org) => org.role === 'admin' || org.role === 'owner')
            .map((org) => (
              <div key={org.id} className="space-y-2">
                <h3 className="text-lg font-medium">{org.name}</h3>
                <SubscriptionStatus type="organization" organizationId={org.id} />
              </div>
            ))}
        </div>
      )}

      {/* Pricing Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pricing Information
          </CardTitle>
          <CardDescription>View our pricing plans and features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Individual Plan</div>
              <div className="text-2xl font-bold">$20/month</div>
              <div className="text-xs text-muted-foreground">Perfect for solo users</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Team Plan</div>
              <div className="text-2xl font-bold">$18/seat</div>
              <div className="text-xs text-muted-foreground">2-9 team members</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Growth Plan</div>
              <div className="text-2xl font-bold">$15/seat</div>
              <div className="text-xs text-muted-foreground">10+ team members</div>
            </div>
          </div>
          <div className="pt-4 border-t">
            <Link href="/app/pricing">
              <Button variant="outline" className="w-full sm:w-auto">
                View Full Pricing Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Beta Period Notice */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">Beta Period</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-blue-800 dark:text-blue-200">
          <p className="text-sm">
            During the beta period, all features are available at no charge. When billing is
            activated:
          </p>
          <ul className="text-sm space-y-1 ml-4 list-disc">
            <li>You'll receive advance notice before any charges begin</li>
            <li>You can choose to subscribe or export your data</li>
            <li>14-day free trial for all new subscribers</li>
            <li>Cancel anytime with no long-term commitment</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
