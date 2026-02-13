'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User, Palette, Mail, Bell, Shield, CreditCard, PenTool, Zap, BookOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const settingsSections = [
  {
    name: 'Account',
    href: '/app/settings/account',
    icon: User,
    requiresRole: null, // Available to all users
  },
  {
    name: 'Appearance',
    href: '/app/settings/appearance',
    icon: Palette,
    requiresRole: null,
  },
  {
    name: 'Email Accounts',
    href: '/app/settings/email-accounts',
    icon: Mail,
    requiresRole: null,
  },
  {
    name: 'Email Rules',
    href: '/app/settings/rules',
    icon: Zap,
    requiresRole: null,
  },
  {
    name: 'Signatures',
    href: '/app/settings/signatures',
    icon: PenTool,
    requiresRole: null,
  },
  {
    name: 'Notifications',
    href: '/app/settings/notifications',
    icon: Bell,
    requiresRole: null,
  },
  {
    name: 'Security',
    href: '/app/settings/security',
    icon: Shield,
    requiresRole: null,
  },
  {
    name: 'Help & Guides',
    href: '/app/settings/help',
    icon: BookOpen,
    requiresRole: null,
  },
  {
    name: 'Billing',
    href: '/app/settings/billing',
    icon: CreditCard,
    requiresRole: ['OWNER', 'ADMIN'], // Only OWNER and ADMIN can see billing
  },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's organization role from organization_members table
      const { data: orgMembership, error } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', user.id)
        .eq('status', 'ACTIVE')
        .maybeSingle() as { data: { role: string } | null; error: any };

      if (error) {
        // Silently handle error - user might not be in an organization
        console.log('User not in organization (or RLS policy blocking):', error.message);
        return;
      }

      if (orgMembership) {
        setUserRole(orgMembership.role);
      }
    } catch (error) {
      console.error('Failed to fetch user role:', error);
    } finally {
      setLoading(false);
    }
  };

  const canAccessSection = (section: typeof settingsSections[0]) => {
    if (!section.requiresRole) return true;
    if (!userRole) return false;
    return section.requiresRole.includes(userRole);
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <nav className="w-64 space-y-1">
          {settingsSections
            .filter(canAccessSection)
            .map((section) => {
              const Icon = section.icon;
              const isActive = pathname === section.href;

              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {section.name}
                </Link>
              );
            })}
        </nav>

        {/* Content Area */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
