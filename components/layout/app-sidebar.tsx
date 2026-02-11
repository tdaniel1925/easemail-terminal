'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  PenSquare, Inbox, Send, Star, Trash2, Archive, Clock,
  Tag, Settings, BarChart3, HelpCircle, ChevronDown, Mail
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
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [labels, setLabels] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [folderCounts, setFolderCounts] = useState({
    inbox: 0,
    starred: 0,
    sent: 0,
    snoozed: 0,
    archive: 0,
    trash: 0,
    drafts: 0,
  });

  useEffect(() => {
    fetchAccounts();
    fetchLabels();
    fetchUserRole();

    // Refresh counts every 60 seconds
    const interval = setInterval(fetchFolderCounts, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch folders and counts when selected account changes
  useEffect(() => {
    if (selectedAccount) {
      fetchFolders();
      fetchFolderCounts();
    }
  }, [selectedAccount]);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/email-accounts');
      const data = await response.json();
      if (data.accounts) {
        setAccounts(data.accounts);

        // Set selected account on initial load
        if (!selectedAccount && data.accounts.length > 0) {
          // Try to get from localStorage
          const stored = localStorage.getItem('selectedAccountId');
          const storedAccount = stored ? data.accounts.find((a: any) => a.id === stored) : null;

          if (storedAccount) {
            setSelectedAccount(stored);
          } else {
            // Default to primary account
            const primary = data.accounts.find((a: any) => a.is_primary);
            if (primary) {
              setSelectedAccount(primary.id);
              localStorage.setItem('selectedAccountId', primary.id);
            }
          }
        }
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

  const fetchFolders = async (retryCount = 0) => {
    if (!selectedAccount) return;

    try {
      console.log('Fetching folders from API... (attempt', retryCount + 1, ')');
      const response = await fetch(`/api/folders?accountId=${selectedAccount}`);
      const data = await response.json();

      console.log('Folders API response:', {
        status: response.status,
        ok: response.ok,
        data,
      });

      if (response.status === 401 && retryCount < 2) {
        // Retry after a delay if unauthorized (session might still be loading)
        console.log('Session not ready, retrying in 1 second...');
        setTimeout(() => fetchFolders(retryCount + 1), 1000);
        return;
      }

      if (response.ok && data.folders) {
        console.log('Setting folders:', data.folders.length, 'folders');
        setFolders(data.folders);
      } else {
        console.error('Folders API error:', data.error || 'Unknown error', 'status:', response.status);
        setFolders([]);
      }
    } catch (error) {
      console.error('Failed to fetch folders:', error);
      if (retryCount < 2) {
        console.log('Retrying after error in 1 second...');
        setTimeout(() => fetchFolders(retryCount + 1), 1000);
      } else {
        setFolders([]);
      }
    }
  };

  const fetchFolderCounts = async () => {
    try {
      const response = await fetch('/api/folders/counts');
      const data = await response.json();
      if (response.ok) {
        setFolderCounts(data);
      }
    } catch (error) {
      console.error('Failed to fetch folder counts:', error);
    }
  };

  const fetchUserRole = async () => {
    try {
      const supabase = (await import('@/lib/supabase/client')).createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('is_super_admin')
        .eq('id', user.id)
        .single() as { data: { is_super_admin: boolean } | null };

      if (userData) {
        setIsSuperAdmin(userData.is_super_admin || false);
      }
    } catch (error) {
      console.error('Failed to fetch user role:', error);
    }
  };

  const isActive = (path: string) => pathname === path;

  const handleAccountSwitch = (accountId: string) => {
    setSelectedAccount(accountId);
    localStorage.setItem('selectedAccountId', accountId);

    // Navigate to inbox with account filter
    router.push(`/app/inbox?accountId=${accountId}`);
  };

  const selectedAccountData = accounts.find(a => a.id === selectedAccount);

  if (!open) return null;

  return (
    <div className="w-64 border-r border-border bg-card hidden lg:flex flex-col h-screen" data-sidebar="app-sidebar-single">
      {/* Header - Fixed */}
      <div className="p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-foreground">
            EaseMail
          </h1>
          <div className="flex items-center gap-1">
            <ThemeToggle />
          </div>
        </div>
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-sm mb-3" onClick={onCompose}>
          <PenSquare className="mr-2 h-4 w-4" />
          Compose
        </Button>

        {/* Account Switcher */}
        {accounts.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Account
            </label>
            <Select value={selectedAccount || undefined} onValueChange={handleAccountSwitch}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select account">
                  {selectedAccountData ? (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{selectedAccountData.email}</span>
                    </div>
                  ) : (
                    'Select account'
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{account.email}</span>
                      {account.is_primary && (
                        <Badge variant="secondary" className="text-[10px] px-1 py-0 ml-1">
                          Primary
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {/* Main Folders */}
          <div className="space-y-0.5">
            {[
              { icon: Inbox, label: 'Inbox', href: '/app/inbox', countKey: 'inbox' },
              { icon: Star, label: 'Starred', href: '/app/inbox?filter=starred', countKey: 'starred' },
              { icon: Send, label: 'Sent', href: '/app/inbox?filter=sent', countKey: 'sent' },
              { icon: Clock, label: 'Snoozed', href: '/app/inbox?filter=snoozed', countKey: 'snoozed' },
              { icon: Archive, label: 'Archive', href: '/app/inbox?filter=archive', countKey: 'archive' },
              { icon: Trash2, label: 'Trash', href: '/app/inbox?filter=trash', countKey: 'trash' },
            ].map((item) => {
              const count = item.countKey ? folderCounts[item.countKey as keyof typeof folderCounts] : 0;
              // Build href with accountId if selected
              let href = item.href;
              if (selectedAccount) {
                const hasQuery = href.includes('?');
                href = `${href}${hasQuery ? '&' : '?'}accountId=${selectedAccount}`;
              }
              return (
                <Link key={item.label} href={href}>
                  <button
                    className={`w-full flex items-center justify-between px-4 py-2 rounded-r-full hover:bg-accent transition-colors ${
                      isActive(item.href) ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground/80'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon className="h-5 w-5" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {item.countKey && count > 0 && (
                      <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs shrink-0">
                        {count > 99 ? '99+' : count}
                      </Badge>
                    )}
                  </button>
                </Link>
              );
            })}
          </div>

          {/* Custom Folders */}
          {folders.length > 0 ? (
            <div className="space-y-0.5 mt-4">
              <div className="px-4 py-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Folders ({folders.length})
                </span>
              </div>
              {folders.map((folder) => {
                // Build href with accountId
                let folderHref = `/app/inbox?folder=${folder.id}`;
                if (selectedAccount) {
                  folderHref += `&accountId=${selectedAccount}`;
                }
                return (
                  <Link key={folder.id} href={folderHref}>
                    <button
                      className={`w-full flex items-center justify-between px-4 py-2 rounded-r-full hover:bg-accent transition-colors text-foreground/80`}
                    >
                      <div className="flex items-center gap-4">
                        <Tag className="h-5 w-5" />
                        <span className="text-sm truncate">{folder.name}</span>
                      </div>
                      {folder.unread_count > 0 && (
                        <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs shrink-0">
                          {folder.unread_count}
                        </Badge>
                      )}
                    </button>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="space-y-0.5 mt-4">
              <div className="px-4 py-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Folders (0)
                </span>
              </div>
              <div className="px-4 py-2 text-xs text-muted-foreground">
                No folders available
              </div>
            </div>
          )}

          {/* Custom Labels */}
          <div className="space-y-0.5 mt-4">
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Labels
              </span>
              <Link href="/app/settings">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Tag className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            {labels.length === 0 ? (
              <div className="px-4 py-2 text-xs text-muted-foreground">
                No labels yet
              </div>
            ) : (
              labels.slice(0, 5).map((label) => (
                <button
                  key={label.id}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-r-full hover:bg-accent transition-colors text-foreground/80"
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
      <div className="border-t border-border flex-shrink-0">
        {/* Bottom Navigation */}
        <div className="p-2 space-y-0.5">
          <Link href="/app/help">
            <button
              className={`w-full flex items-center gap-4 px-4 py-2 rounded-r-full hover:bg-accent transition-colors ${
                pathname?.startsWith('/app/help') ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground/80'
              }`}
            >
              <HelpCircle className="h-5 w-5" />
              <span className="text-sm">Help</span>
            </button>
          </Link>
          <Link href="/app/settings">
            <button
              className={`w-full flex items-center gap-4 px-4 py-2 rounded-r-full hover:bg-accent transition-colors ${
                pathname?.startsWith('/app/settings') ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground/80'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span className="text-sm">Settings</span>
            </button>
          </Link>
          {isSuperAdmin && (
            <Link href="/app/admin/analytics">
              <button
                className={`w-full flex items-center gap-4 px-4 py-2 rounded-r-full hover:bg-accent transition-colors ${
                  pathname?.startsWith('/app/admin') ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground/80'
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-sm">Admin</span>
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
