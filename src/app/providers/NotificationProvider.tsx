import React, { createContext, useContext, useMemo, useState } from 'react';

import type { AppNotification } from '../../components/NotificationPanel';

interface NotificationContextValue {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'> & { id?: string }) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif_1',
      title: 'Leave request pending approval',
      description: 'Ava Brooks requested Annual Leave (3 days).',
      createdAt: new Date().toISOString(),
      read: false,
      type: 'warning',
    },
    {
      id: 'notif_2',
      title: 'New message from HR',
      description: 'Policy update: Annual leave carryover changes.',
      createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      read: false,
      type: 'info',
    },
    {
      id: 'notif_3',
      title: 'Leave approved',
      description: 'Your sick leave for Jan 12 has been approved.',
      createdAt: new Date(Date.now() - 86400 * 1000).toISOString(),
      read: true,
      type: 'success',
    },
  ]);

  const addNotification: NotificationContextValue['addNotification'] = (notification) => {
    const id = notification.id ?? `notif_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const newItem: AppNotification = {
      id,
      title: notification.title,
      description: notification.description,
      createdAt: new Date().toISOString(),
      read: false,
      type: notification.type ?? 'info',
    };
    setNotifications((prev) => [newItem, ...prev]);
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const value = useMemo(
    () => ({ notifications, addNotification, markRead, markAllRead }),
    [notifications]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
