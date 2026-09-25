'use client';

import Link from 'next/link';
import {
  Droplets,
  Map,
  AlertTriangle,
  ShieldPlus,
  FileText,
  Waves,
  User,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarSearch } from '@/components/layout/SidebarSearch';
import { mockUser } from '@/data/mocks/user';
import { NotificationBadge } from '@/components/notifications/NotificationBadge';

interface SidebarProps {
  activePath: string;
  onNotificationClick?: () => void;
  unreadCount?: number;
}

const navLinks = [
  { href: '/', label: 'Dashboard', icon: Droplets },
  { href: '/mapa', label: 'Mapa', icon: Map },
  { href: '/alertas', label: 'Alertas', icon: AlertTriangle },
  { href: '/abrigos', label: 'Abrigos', icon: ShieldPlus },
  { href: '/ocorrencias', label: 'Ocorrências', icon: FileText },
  { href: '/tsunami', label: 'Tsunami', icon: Waves },
];

export function Sidebar({
  activePath,
  onNotificationClick,
  unreadCount = 0,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        'hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 z-20',
        'bg-hydro-gradient-sidebar'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-hydro-cyan-500/20">
          <Droplets className="h-5 w-5 text-hydro-cyan-400" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-base font-bold text-hydro-text-on-dark tracking-tight">HIDRO</span>
          <span className="text-base font-bold text-hydro-cyan-400 tracking-tight">ALERTA</span>
        </div>
      </div>

      {/* Functional search (pages, alerts, shelters) */}
      <SidebarSearch />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 mt-1" aria-label="Navegação principal">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/' ? activePath === '/' : activePath.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  // blue-700: white text on blue-600 is ~4.1:1 (below AA).
                  ? 'bg-hydro-blue-700 text-white shadow-md shadow-hydro-blue-700/30'
                  : 'text-hydro-text-muted hover:bg-white/8 hover:text-hydro-text-on-dark'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={cn('h-5 w-5', isActive ? 'text-white' : '')} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/10 px-3 py-4 space-y-2">
        {/* Notification bell */}
        <button
          onClick={onNotificationClick}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-hydro-text-muted hover:bg-white/8 hover:text-hydro-text-on-dark transition-all"
          aria-label="Notificações"
        >
          <div className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <NotificationBadge count={unreadCount} />
            )}
          </div>
          <span>Notificações</span>
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-hydro-cyan-500/20 text-hydro-cyan-400">
            <User className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-hydro-text-on-dark truncate">
              {mockUser.name}
            </p>
            <p className="text-xs text-hydro-text-muted truncate">{mockUser.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
