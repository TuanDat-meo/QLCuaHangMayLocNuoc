import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  limit,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { getDb } from './authService';
import { AppNotification, NotificationType } from '../types/notification';
import { UserRole } from '../types/auth';

const NOTIFICATION_COLLECTION = 'notifications';

/**
 * Lấy danh sách thông báo theo thời gian thực cho một user hoặc role cụ thể
 */
export const subscribeToNotifications = (
  userId: string,
  role: UserRole,
  callback: (notifications: AppNotification[]) => void
) => {
  const db = getDb();
  const q = query(
    collection(db, NOTIFICATION_COLLECTION),
    where('recipient_role', 'array-contains', role),
    orderBy('created_at', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      nid: doc.id,
      ...doc.data()
    })) as AppNotification[];
    callback(notifications);
  }, (error) => {
    console.error("Error subscribing to notifications:", error);
  });
};

/**
 * Đánh dấu thông báo đã đọc
 */
export const markNotificationAsRead = async (nid: string) => {
  try {
    const db = getDb();
    const notificationRef = doc(db, NOTIFICATION_COLLECTION, nid);
    await updateDoc(notificationRef, {
      is_read: true,
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Đánh dấu tất cả thông báo của một role là đã đọc
 */
export const markAllAsRead = async (role: UserRole) => {
  try {
    const db = getDb();
    const q = query(
      collection(db, NOTIFICATION_COLLECTION),
      where('recipient_role', 'array-contains', role),
      where('is_read', '==', false)
    );

    const snapshot = await getDocs(q);
    const promises = snapshot.docs.map(d => updateDoc(d.ref, { is_read: true }));
    await Promise.all(promises);
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

/**
 * Tạo thông báo mới (Thường gọi từ Cloud Functions, nhưng Admin cũng có thể tạo)
 */
export const createNotification = async (notification: Omit<AppNotification, 'nid' | 'created_at' | 'is_read'>) => {
  try {
    const db = getDb();
    await addDoc(collection(db, NOTIFICATION_COLLECTION), {
      ...notification,
      is_read: false,
      created_at: serverTimestamp()
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};
