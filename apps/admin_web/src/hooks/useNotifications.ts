import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { AppNotification } from '../types/notification';
import { subscribeToNotifications, markNotificationAsRead, markAllAsRead } from '../services/notificationService';

export const useNotifications = () => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Chỉ chạy khi đã xác thực và có thông tin user/role
    if (!isAuthenticated || !user || !user.role) return;

    let isMounted = true;

    // Thêm một khoảng trễ nhỏ 500ms để đảm bảo Firestore Auth State đã sẵn sàng
    const timer = setTimeout(() => {
      if (!isMounted) return;

      const unsubscribe = subscribeToNotifications(
        user.uid,
        user.role,
        (data) => {
          if (isMounted) {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
          }
        },
        (error) => {
          console.warn("🔔 Notification Error:", error.code);
          // Nếu bị từ chối quyền, thử lại tối đa 3 lần
          if (error.code === 'permission-denied' && retryCount < 3) {
            setTimeout(() => setRetryCount(prev => prev + 1), 2000);
          }
        }
      );

      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [user, isAuthenticated, retryCount]);

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
