import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { AppNotification } from '../types/notification';
import { subscribeToNotifications, markNotificationAsRead, markAllAsRead } from '../services/notificationService';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || !user.role) return;

    const unsubscribe = subscribeToNotifications(user.uid, user.role, (data) => {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (nid: string) => {
    await markNotificationAsRead(nid);
  };

  const markAllRead = async () => {
    if (user && user.role) {
      await markAllAsRead(user.role);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead
  };
};
