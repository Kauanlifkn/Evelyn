'use client';

import { Droplets, Bell } from 'lucide-react';
import { NotificationBadge } from '@/components/notifications/NotificationBadge';

interface MobileHeaderProps {
  onNotificationClick?: () => void;
  unreadCount?: number;
}

export function MobileHeader({
  onNotificationClick,
  unreadCount = 0,
}: MobileHeaderProps) {
  return (
    <header className="lg:hidden sticky top-0 z-30 bg-hydro-gradient-sidebar px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-hydro-cyan-500/20">
            <Droplets className="h-4.5 w-4.5 text-hydro-cyan-400" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-hydro-text-on-dark tracking-tight">HIDRO</span>
            <span className="text-sm font-bold text-hydro-cyan-400 tracking-tight">ALERTA</span>
          </div>
        </div>

        {/* Notification bell */}
        <button
          onClick={onNotificationClick}
          className="relative p-2 rounded-xl text-hydro-text-on-dark hover:bg-white/10 transition-colors"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
        </button>
      </div>
    </header>
  );
}
