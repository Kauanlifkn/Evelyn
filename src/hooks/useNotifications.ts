'use client';
import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Notification } from '@/types/notification';
import { mockNotifications } from '@/data/mocks/notifications';

const STORAGE_KEY = 'hidro-alerta-notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useLocalStorage<Notification[]>(
    STORAGE_KEY,
    mockNotifications
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markAsRead = useCallback(
    (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    },
    [setNotifications]
  );

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [setNotifications]);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, [setNotifications]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}
