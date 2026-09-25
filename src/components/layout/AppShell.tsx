'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { MobileNav } from '@/components/layout/MobileNav';
import { SOSButton } from '@/components/layout/SOSButton';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { useNotifications } from '@/hooks/useNotifications';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Desktop Sidebar */}
      <Sidebar
        activePath={pathname}
        onNotificationClick={() => setNotifOpen(true)}
        unreadCount={unreadCount}
      />

      {/* Mobile Header */}
      <MobileHeader
        onNotificationClick={() => setNotifOpen(true)}
        unreadCount={unreadCount}
      />

      {/* Main Content */}
      <main id="conteudo-principal" tabIndex={-1} className="lg:pl-64 pb-24 lg:pb-0">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileNav activePath={pathname} />

      {/* SOS Button — desktop only (mobile SOS is in MobileNav) */}
      <SOSButton />

      {/* Notification Center Dropdown */}
      <NotificationCenter
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
      />
    </div>
  );
}
