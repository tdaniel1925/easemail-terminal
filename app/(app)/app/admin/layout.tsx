'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  Users,
  Building2,
  Webhook,
  Shield,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const adminNavItems = [
    {
      title: 'Analytics',
      href: '/app/admin/analytics',
      icon: BarChart3,
    },
    {
      title: 'Users',
      href: '/app/admin/users',
      icon: Users,
    },
    {
      title: 'Organizations',
      href: '/app/admin/organizations',
      icon: Building2,
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Admin Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Super Admin</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Manage all organizations, users, and system settings
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b">
        <div className="flex gap-1">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </button>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Page Content */}
      <div>{children}</div>
    </div>
  );
}
