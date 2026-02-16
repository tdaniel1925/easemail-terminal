'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Mail, Inbox, Send, Star, Trash2, Archive, Clock, Settings, Users,
  PenSquare, Search, RefreshCw, LogOut, Bell, Shield, CreditCard,
  FileText, Tag, Calendar, Video, Sparkles, Zap, Home, BarChart3,
  User, Palette, HelpCircle, Keyboard
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: any;
  action: () => void;
  category: 'Navigation' | 'Actions' | 'Settings' | 'Help';
  keywords?: string[];
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompose?: () => void;
  onRefresh?: () => void;
}

export function CommandPalette({ open, onOpenChange, onCompose, onRefresh }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: Command[] = [
    // Navigation
    {
      id: 'nav-inbox',
      label: 'Go to Inbox',
      description: 'View your inbox messages',
      icon: Inbox,
      category: 'Navigation',
      keywords: ['inbox', 'messages', 'mail'],
      action: () => router.push('/app/inbox'),
    },
    {
      id: 'nav-starred',
      label: 'Go to Starred',
      description: 'View starred messages',
      icon: Star,
      category: 'Navigation',
      keywords: ['starred', 'favorites', 'important'],
      action: () => router.push('/app/inbox?filter=starred'),
    },
    {
      id: 'nav-sent',
      label: 'Go to Sent',
      description: 'View sent messages',
      icon: Send,
      category: 'Navigation',
      keywords: ['sent', 'outbox'],
      action: () => router.push('/app/inbox?filter=sent'),
    },
    {
      id: 'nav-drafts',
      label: 'Go to Drafts',
      description: 'View draft messages',
      icon: FileText,
      category: 'Navigation',
      keywords: ['drafts', 'unsent'],
      action: () => router.push('/app/inbox?filter=drafts'),
    },
    {
      id: 'nav-archive',
      label: 'Go to Archive',
      description: 'View archived messages',
      icon: Archive,
      category: 'Navigation',
      keywords: ['archive', 'archived'],
      action: () => router.push('/app/inbox?filter=archive'),
    },
    {
      id: 'nav-trash',
      label: 'Go to Trash',
      description: 'View deleted messages',
      icon: Trash2,
      category: 'Navigation',
      keywords: ['trash', 'deleted', 'bin'],
      action: () => router.push('/app/inbox?filter=trash'),
    },
    {
      id: 'nav-snoozed',
      label: 'Go to Snoozed',
      description: 'View snoozed messages',
      icon: Clock,
      category: 'Navigation',
      keywords: ['snoozed', 'reminders'],
      action: () => router.push('/app/inbox?filter=snoozed'),
    },
    {
      id: 'nav-home',
      label: 'Go to Home',
      description: 'Dashboard overview',
      icon: Home,
      category: 'Navigation',
      keywords: ['home', 'dashboard'],
      action: () => router.push('/app/home'),
    },
    {
      id: 'nav-calendar',
      label: 'Go to Calendar',
      description: 'View calendar and events',
      icon: Calendar,
      category: 'Navigation',
      keywords: ['calendar', 'events', 'meetings'],
      action: () => router.push('/app/calendar'),
    },
    {
      id: 'nav-contacts',
      label: 'Go to Contacts',
      description: 'Manage contacts',
      icon: Users,
      category: 'Navigation',
      keywords: ['contacts', 'people', 'address book'],
      action: () => router.push('/app/contacts'),
    },
    {
      id: 'nav-teams',
      label: 'Go to Teams',
      description: 'Microsoft Teams integration',
      icon: Video,
      category: 'Navigation',
      keywords: ['teams', 'meetings', 'video'],
      action: () => router.push('/app/teams'),
    },

    // Actions
    {
      id: 'action-compose',
      label: 'Compose Email',
      description: 'Write a new email',
      icon: PenSquare,
      category: 'Actions',
      keywords: ['compose', 'new', 'write', 'send'],
      action: () => {
        onOpenChange(false);
        onCompose?.();
      },
    },
    {
      id: 'action-refresh',
      label: 'Refresh Inbox',
      description: 'Check for new messages',
      icon: RefreshCw,
      category: 'Actions',
      keywords: ['refresh', 'reload', 'sync'],
      action: () => {
        onOpenChange(false);
        onRefresh?.();
      },
    },
    {
      id: 'action-search',
      label: 'Search Emails',
      description: 'Find messages',
      icon: Search,
      category: 'Actions',
      keywords: ['search', 'find', 'filter'],
      action: () => {
        onOpenChange(false);
        setTimeout(() => {
          (document.querySelector('input[placeholder*="Search"]') as HTMLInputElement)?.focus();
        }, 100);
      },
    },

    // Settings
    {
      id: 'settings-account',
      label: 'Account Settings',
      description: 'Manage your account',
      icon: User,
      category: 'Settings',
      keywords: ['account', 'profile', 'settings'],
      action: () => router.push('/app/settings/account'),
    },
    {
      id: 'settings-appearance',
      label: 'Appearance Settings',
      description: 'Customize theme and display',
      icon: Palette,
      category: 'Settings',
      keywords: ['appearance', 'theme', 'dark mode'],
      action: () => router.push('/app/settings/appearance'),
    },
    {
      id: 'settings-email-accounts',
      label: 'Email Accounts',
      description: 'Manage connected accounts',
      icon: Mail,
      category: 'Settings',
      keywords: ['email', 'accounts', 'connect'],
      action: () => router.push('/app/settings/email-accounts'),
    },
    {
      id: 'settings-rules',
      label: 'Email Rules',
      description: 'Automate email workflows',
      icon: Zap,
      category: 'Settings',
      keywords: ['rules', 'filters', 'automation'],
      action: () => router.push('/app/settings/rules'),
    },
    {
      id: 'settings-notifications',
      label: 'Notification Settings',
      description: 'Configure notifications',
      icon: Bell,
      category: 'Settings',
      keywords: ['notifications', 'alerts', 'sounds'],
      action: () => router.push('/app/settings/notifications'),
    },
    {
      id: 'settings-security',
      label: 'Security Settings',
      description: 'Security and privacy',
      icon: Shield,
      category: 'Settings',
      keywords: ['security', 'privacy', '2fa'],
      action: () => router.push('/app/settings/security'),
    },
    {
      id: 'settings-billing',
      label: 'Billing & Subscription',
      description: 'Manage subscription',
      icon: CreditCard,
      category: 'Settings',
      keywords: ['billing', 'subscription', 'payment'],
      action: () => router.push('/app/settings/billing'),
    },
    {
      id: 'settings-api-keys',
      label: 'API Keys',
      description: 'Manage API access',
      icon: Sparkles,
      category: 'Settings',
      keywords: ['api', 'keys', 'developer'],
      action: () => router.push('/app/settings/api-keys'),
    },

    // Help
    {
      id: 'help-shortcuts',
      label: 'Keyboard Shortcuts',
      description: 'View all shortcuts',
      icon: Keyboard,
      category: 'Help',
      keywords: ['shortcuts', 'keyboard', 'hotkeys'],
      action: () => {
        onOpenChange(false);
        // Trigger keyboard shortcuts dialog
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }));
        }
      },
    },
  ];

  const filteredCommands = commands.filter((command) => {
    const searchLower = search.toLowerCase();
    return (
      command.label.toLowerCase().includes(searchLower) ||
      command.description?.toLowerCase().includes(searchLower) ||
      command.keywords?.some((k) => k.includes(searchLower)) ||
      command.category.toLowerCase().includes(searchLower)
    );
  });

  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, Command[]>);

  const executeCommand = useCallback(
    (command: Command) => {
      command.action();
      onOpenChange(false);
      setSearch('');
      setSelectedIndex(0);
    },
    [onOpenChange]
  );

  useEffect(() => {
    if (!open) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        executeCommand(filteredCommands[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedIndex, filteredCommands, executeCommand]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <div className="flex items-center border-b px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12"
            autoFocus
          />
          <Badge variant="outline" className="text-xs shrink-0">
            Ctrl+K
          </Badge>
        </div>

        <ScrollArea className="max-h-[400px]">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No commands found
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
                <div key={category} className="mb-4 last:mb-0">
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {category}
                  </div>
                  <div className="space-y-0.5">
                    {categoryCommands.map((command, index) => {
                      const globalIndex = filteredCommands.indexOf(command);
                      const isSelected = globalIndex === selectedIndex;
                      const Icon = command.icon;

                      return (
                        <button
                          key={command.id}
                          type="button"
                          onClick={() => executeCommand(command)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                            isSelected
                              ? 'bg-accent text-accent-foreground'
                              : 'hover:bg-accent/50'
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{command.label}</div>
                            {command.description && (
                              <div className="text-xs text-muted-foreground truncate">
                                {command.description}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t px-4 py-3 text-xs text-muted-foreground flex items-center justify-between bg-muted/50">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Badge variant="outline" className="px-1.5 py-0.5 text-[10px]">↑</Badge>
              <Badge variant="outline" className="px-1.5 py-0.5 text-[10px]">↓</Badge>
              <span className="ml-1">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <Badge variant="outline" className="px-1.5 py-0.5 text-[10px]">Enter</Badge>
              <span className="ml-1">Select</span>
            </span>
            <span className="flex items-center gap-1">
              <Badge variant="outline" className="px-1.5 py-0.5 text-[10px]">Esc</Badge>
              <span className="ml-1">Close</span>
            </span>
          </div>
          <span>{filteredCommands.length} commands</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
