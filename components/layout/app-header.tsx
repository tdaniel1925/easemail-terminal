'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, UserCircle, Calendar, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const pathname = usePathname();

  const navItems = [
    { icon: Mail, label: 'Home', href: '/app/home' },
    { icon: UserCircle, label: 'Contacts', href: '/app/contacts' },
    { icon: Calendar, label: 'Calendar', href: '/app/calendar' },
    { icon: Video, label: 'MS Teams', href: '/app/teams' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <button
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive(item.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
