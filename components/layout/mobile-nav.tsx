'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Menu, PenSquare, Inbox, Send, Star, Trash2, Archive, Clock, Tag, Settings, BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileNavProps {
  onCompose?: () => void;
  folderCounts?: {
    inbox: number;
    starred: number;
    sent: number;
    snoozed: number;
    archive: number;
    trash: number;
    drafts: number;
  };
  folders?: any[];
  labels?: any[];
  accounts?: any[];
  isSuperAdmin?: boolean;
}

export function MobileNav({
  onCompose,
  folderCounts = { inbox: 0, starred: 0, sent: 0, snoozed: 0, archive: 0, trash: 0, drafts: 0 },
  folders = [],
  labels = [],
  accounts = [],
  isSuperAdmin = false
}: MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const mainFolders = [
    { icon: Inbox, label: 'Inbox', href: '/app/inbox', countKey: 'inbox' },
    { icon: Star, label: 'Starred', href: '/app/inbox?filter=starred', countKey: 'starred' },
    { icon: Send, label: 'Sent', href: '/app/inbox?filter=sent', countKey: 'sent' },
    { icon: Clock, label: 'Snoozed', href: '/app/inbox?filter=snoozed', countKey: 'snoozed' },
    { icon: Archive, label: 'Archive', href: '/app/inbox?filter=archive', countKey: 'archive' },
    { icon: Trash2, label: 'Trash', href: '/app/inbox?filter=trash', countKey: 'trash' },
  ];

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
      <div className="flex items-center justify-between p-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="text-xl font-bold">EaseMail</SheetTitle>
            </SheetHeader>

            <div className="p-4">
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-sm"
                onClick={() => {
                  setOpen(false);
                  onCompose?.();
                }}
              >
                <PenSquare className="mr-2 h-4 w-4" />
                Compose
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-180px)]">
              <nav className="p-2 space-y-1">
                {/* Main Folders */}
                <div className="space-y-0.5">
                  {mainFolders.map((item) => {
                    const count = folderCounts[item.countKey as keyof typeof folderCounts];
                    return (
                      <Link key={item.label} href={item.href} onClick={() => setOpen(false)}>
                        <button
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-accent transition-colors ${
                            isActive(item.href) ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground/80'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="h-5 w-5" />
                            <span className="text-sm">{item.label}</span>
                          </div>
                          {count > 0 && (
                            <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                              {count > 99 ? '99+' : count}
                            </Badge>
                          )}
                        </button>
                      </Link>
                    );
                  })}
                </div>

                {/* Custom Folders */}
                {folders.length > 0 && (
                  <div className="space-y-0.5 mt-4">
                    <div className="px-4 py-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Folders ({folders.length})
                      </span>
                    </div>
                    {folders.map((folder) => (
                      <Link key={folder.id} href={`/app/inbox?folder=${folder.id}`} onClick={() => setOpen(false)}>
                        <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-accent transition-colors text-foreground/80">
                          <div className="flex items-center gap-3">
                            <Tag className="h-5 w-5" />
                            <span className="text-sm truncate">{folder.name}</span>
                          </div>
                          {folder.unread_count > 0 && (
                            <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                              {folder.unread_count}
                            </Badge>
                          )}
                        </button>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Labels */}
                {labels.length > 0 && (
                  <div className="space-y-0.5 mt-4">
                    <div className="px-4 py-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Labels
                      </span>
                    </div>
                    {labels.slice(0, 5).map((label) => (
                      <button
                        key={label.id}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-foreground/80"
                        onClick={() => setOpen(false)}
                      >
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="text-sm">{label.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </nav>
            </ScrollArea>

            {/* Bottom Navigation */}
            <div className="border-t p-2 space-y-0.5">
              <Link href="/app/settings" onClick={() => setOpen(false)}>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors ${
                    pathname?.startsWith('/app/settings') ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground/80'
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  <span className="text-sm">Settings</span>
                </button>
              </Link>
              {isSuperAdmin && (
                <Link href="/app/admin/analytics" onClick={() => setOpen(false)}>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors ${
                      pathname?.startsWith('/app/admin') ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground/80'
                    }`}
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-sm">Admin</span>
                  </button>
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>

        <h1 className="text-lg font-bold">EaseMail</h1>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {onCompose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCompose}
              className="h-9 w-9"
            >
              <PenSquare className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
