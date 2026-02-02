'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User, Palette, Mail, Bell, Shield, CreditCard } from 'lucide-react';

const settingsSections = [
  {
    name: 'Account',
    href: '/app/settings/account',
    icon: User,
  },
  {
    name: 'Appearance',
    href: '/app/settings/appearance',
    icon: Palette,
  },
  {
    name: 'Email Accounts',
    href: '/app/settings/email-accounts',
    icon: Mail,
  },
  {
    name: 'Notifications',
    href: '/app/settings/notifications',
    icon: Bell,
  },
  {
    name: 'Security',
    href: '/app/settings/security',
    icon: Shield,
  },
  {
    name: 'Billing',
    href: '/app/settings/billing',
    icon: CreditCard,
  },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <nav className="w-64 space-y-1">
          {settingsSections.map((section) => {
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
