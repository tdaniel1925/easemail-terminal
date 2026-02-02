'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Mail, PenSquare, Inbox, Send, Star, Trash2, Archive, Clock, Menu,
  Users, Newspaper, Bell, Sparkles, Calendar, UserCircle, Video, Tag,
  Settings, BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface AppSidebarProps {
  open: boolean;
  onToggle: () => void;
  onCompose?: () => void;
}

export function AppSidebar({ open, onToggle, onCompose }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [labels, setLabels] = useState<any[]>([]);

  useEffect(() => {
    fetchAccounts();
    fetchLabels();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/email-accounts');
      const data = await response.json();
      if (data.accounts) {
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  };

  const fetchLabels = async () => {
    try {
      const response = await fetch('/api/labels');
      const data = await response.json();
      if (data.labels) {
        setLabels(data.labels);
      }
    } catch (error) {
      console.error('Failed to fetch labels:', error);
    }
  };

  const isActive = (path: string) => pathname === path;

  if (!open) return null;

  return (
    <div className="w-64 border-r border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 hidden lg:flex flex-col h-screen" data-sidebar="app-sidebar-single">
      {/* Header - Fixed */}
      <div className="p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            EaseMail
          </h1>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggle}>
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-sm" onClick={onCompose}>
          <PenSquare className="mr-2 h-4 w-4" />
          Compose
        </Button>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {/* Main Folders */}
          <div className="space-y-0.5">
            {[
              { icon: Inbox, label: 'Inbox', href: '/app/inbox' },
              { icon: Star, label: 'Starred', href: '/app/inbox?filter=starred' },
              { icon: Send, label: 'Sent', href: '/app/inbox?filter=sent' },
              { icon: Clock, label: 'Snoozed', href: '/app/inbox?filter=snoozed' },
              { icon: Archive, label: 'Archive', href: '/app/inbox?filter=archive' },
              { icon: Trash2, label: 'Trash', href: '/app/inbox?filter=trash' },
            ].map((item) => (
              <Link key={item.label} href={item.href}>
                <button
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-r-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    isActive(item.href) ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                </button>
              </Link>
            ))}
          </div>

          {/* Apps */}
          <div className="space-y-0.5 mt-4">
            <div className="px-4 py-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Apps
              </span>
            </div>
            {[
              { icon: Mail, label: 'Home', href: '/app/home' },
              { icon: UserCircle, label: 'Contacts', href: '/app/contacts' },
              { icon: Calendar, label: 'Calendar', href: '/app/calendar' },
              { icon: Video, label: 'MS Teams', href: '/app/teams' },
            ].map((item) => (
              <Link key={item.label} href={item.href}>
                <button
                  className={`w-full flex items-center gap-4 px-4 py-2 rounded-r-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    isActive(item.href) ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              </Link>
            ))}
          </div>

          {/* Smart Categories */}
          <div className="space-y-0.5 mt-4">
            <div className="px-4 py-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Smart Categories
              </span>
            </div>
            {[
              { icon: Users, label: 'People', href: '/app/inbox?category=people' },
              { icon: Newspaper, label: 'Newsletters', href: '/app/inbox?category=newsletters' },
              { icon: Bell, label: 'Notifications', href: '/app/inbox?category=notifications' },
            ].map((item) => (
              <Link key={item.label} href={item.href}>
                <button className="w-full flex items-center gap-4 px-4 py-2 rounded-r-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              </Link>
            ))}
          </div>

          {/* Custom Labels */}
          <div className="space-y-0.5 mt-4">
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Labels
              </span>
              <Link href="/app/settings">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Tag className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            {labels.length === 0 ? (
              <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                No labels yet
              </div>
            ) : (
              labels.slice(0, 5).map((label) => (
                <button
                  key={label.id}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-r-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                >
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="text-sm">{label.name}</span>
                </button>
              ))
            )}
          </div>
        </nav>
      </ScrollArea>

      {/* Bottom Section - Sticky */}
      <div className="border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
        {/* Account Section */}
        <div className="p-2">
          <div className="px-4 py-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Accounts
            </span>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {accounts.length === 0 ? (
              <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                No accounts connected
              </div>
            ) : (
              accounts.slice(0, 2).map((account) => (
                <div
                  key={account.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs truncate flex-1 text-gray-700 dark:text-gray-300">{account.email}</span>
                  {account.is_primary && (
                    <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                      Primary
                    </Badge>
                  )}
                </div>
              ))
            )}
          </div>
          <Link href="/app/settings/email-accounts">
            <Button variant="outline" size="sm" className="w-full mt-2 border-gray-300 dark:border-gray-700">
              <Tag className="mr-2 h-3 w-3" />
              Manage Accounts
            </Button>
          </Link>
        </div>

        {/* Bottom Navigation */}
        <div className="p-2 space-y-0.5">
          <Link href="/app/settings">
            <button
              className={`w-full flex items-center gap-4 px-4 py-2 rounded-r-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                pathname?.startsWith('/app/settings') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span className="text-sm">Settings</span>
            </button>
          </Link>
          <Link href="/app/admin/analytics">
            <button
              className={`w-full flex items-center gap-4 px-4 py-2 rounded-r-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                pathname?.startsWith('/app/admin') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span className="text-sm">Admin</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
