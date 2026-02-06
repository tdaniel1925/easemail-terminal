'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  Users,
  Building2,
  Webhook,
  Shield,
  Settings,
  CreditCard,
  TrendingUp,
  Briefcase,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications?limit=10');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.notifications?.filter((n: Notification) => !n.read).length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, read: true }),
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

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
    {
      title: 'Billing',
      href: '/app/admin/billing',
      icon: CreditCard,
    },
    {
      title: 'Revenue',
      href: '/app/admin/revenue',
      icon: TrendingUp,
    },
    {
      title: 'Sales Pipeline',
      href: '/app/admin/sales',
      icon: Briefcase,
    },
    {
      title: 'System',
      href: '/app/admin/system',
      icon: Settings,
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

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  variant="destructive"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-3 py-2 border-b">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {unreadCount} unread
                </p>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex flex-col items-start p-3 cursor-pointer"
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between w-full gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{notification.title}</p>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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
