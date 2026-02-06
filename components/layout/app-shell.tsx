'use client';

import { useState } from 'react';
import { AppSidebar } from './app-sidebar';
import { AppHeader } from './app-header';
import { Chatbot } from '@/components/chatbot/chatbot';
import { LoginTracker } from '@/components/login-tracker';
import { useRouter } from 'next/navigation';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [composing, setComposing] = useState(false);
  const router = useRouter();

  const handleCompose = () => {
    // Navigate to inbox with compose intent
    router.push('/app/inbox?compose=true');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <LoginTracker />
      <AppSidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onCompose={handleCompose}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
      <Chatbot />
    </div>
  );
}
