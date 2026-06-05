import { useState, useEffect, useCallback } from 'react';
import {
  subscribeToNotifications,
  markNotificationAsRead,
  markAllAsRead // Đảm bảo hàm này tồn tại trong notificationService.ts
} from '../services/notificationService';
import { AppNotification } from '../types/notification';
import { useAuth } from './useAuth';
import { UserRole } from '../types/auth';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role === undefined || user.role === null) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const unsubscribe = subscribeToNotifications(
      user.uid,
      user.role as UserRole,
      (data) => {
        if (isMounted) {
          setNotifications(data);
          setUnreadCount(data.filter(n => !n.is_read).length);
          setIsLoading(false);
        }
      },
      (err) => {
        if (isMounted) {
          console.warn("Notification error:", err.code);
          setError(err.message);
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const markRead = useCallback(async (nid: string) => {
    try {
      await markNotificationAsRead(nid);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const markAllReadAction = useCallback(async () => {
    if (!user?.role) return;
    try {
      await markAllAsRead(user.role);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead: markRead,
    markAllRead: markAllReadAction
  };
};
