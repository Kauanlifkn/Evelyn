'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, Bell, Trash2, CheckCheck } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Focus restoration: when the panel closes, return focus to the element
  // that opened it (keyboard accessibility).
  useEffect(() => {
    if (open) {
      previouslyFocused.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      return () => {
        previouslyFocused.current?.focus();
      };
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 rounded-2xl border border-hydro-border bg-hydro-surface shadow-hydro-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-hydro-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-hydro-text-secondary" />
          <h2 className="text-sm font-semibold text-hydro-text">
            Notificações
          </h2>
          {unreadCount > 0 && (
            <Badge severity={3}>{unreadCount}</Badge>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-hydro-text-secondary hover:bg-hydro-surface-blue hover:text-hydro-text transition-colors"
          aria-label="Fechar notificações"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="flex items-center gap-2 border-b border-hydro-border px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs"
          >
            <CheckCheck className="h-3 w-3" />
            Marcar todas como lidas
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-xs text-hydro-danger hover:text-hydro-danger-dark"
          >
            <Trash2 className="h-3 w-3" />
            Limpar tudo
          </Button>
        </div>
      )}

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-hydro-text-secondary">
            <Bell className="h-8 w-8 mb-2" />
            <p className="text-sm">Nenhuma notificação</p>
          </div>
        ) : (
          <div>
            {notifications.map((notif) => {
              const content = (
                <div
                  key={notif.id}
                  className={cn(
                    'px-4 py-3 border-b border-hydro-border/50 transition-colors cursor-pointer',
                    'hover:bg-hydro-surface-blue',
                    !notif.read && 'border-l-[3px] border-l-hydro-blue-500 bg-hydro-surface-blue/50 font-medium'
                  )}
                  onClick={() => {
                    if (!notif.read) markAsRead(notif.id);
                  }}
                >
                  <div className="flex items-start gap-2">
                    {notif.severity !== undefined && (
                      <div className="shrink-0 mt-0.5">
                        <Badge severity={notif.severity}>
                          {notif.type === 'alert'
                            ? 'Alerta'
                            : notif.type === 'shelter'
                            ? 'Abrigo'
                            : notif.type === 'weather'
                            ? 'Clima'
                            : notif.type === 'tsunami'
                            ? 'Tsunami'
                            : 'Sistema'}
                        </Badge>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm truncate',
                        notif.read ? 'text-hydro-text-secondary' : 'text-hydro-text font-semibold'
                      )}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-hydro-text-secondary mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-hydro-text-muted mt-1">
                        {formatDate(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );

              if (notif.link) {
                return (
                  <Link key={notif.id} href={notif.link} onClick={() => {
                    if (!notif.read) markAsRead(notif.id);
                    onClose();
                  }}>
                    {content}
                  </Link>
                );
              }

              return <div key={notif.id}>{content}</div>;
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-hydro-border px-4 py-2">
        <p className="text-[10px] text-hydro-text-secondary text-center">
          Dados simulados
        </p>
      </div>
    </div>
  );
}
