/**
 * Chat Service - Quản lý hệ thống chat thời gian thực giữa khách hàng và admin
 * Sử dụng Cloud Firestore real-time listeners
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit,
  Unsubscribe,
} from 'firebase/firestore';
import { firestore } from '../app/firebase.config';

export interface ChatSession {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  adminId: string | null;
  adminName?: string;
  status: 'bot' | 'waiting' | 'active' | 'closed';
  createdAt: Date;
  lastMessage: string;
  lastMessageAt: Date;
  unreadByAdmin: number;
  unreadByCustomer: number;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderType: 'customer' | 'admin' | 'bot';
  senderName?: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
}

const SESSIONS_COLLECTION = 'chatSessions';

// Helper để parse timestamp an toàn
const safeToDate = (value: any): Date => {
  if (!value) return new Date();
  if (typeof value.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  if (value?.seconds) return new Date(value.seconds * 1000);
  return new Date(value);
};

// ============================================================
// ADMIN SIDE: Lắng nghe tất cả sessions
// ============================================================

/**
 * Lắng nghe tất cả sessions đang chờ / đang active (realtime)
 */
export const subscribeToActiveSessions = (
  callback: (sessions: ChatSession[]) => void
): Unsubscribe => {
  const q = query(
    collection(firestore, SESSIONS_COLLECTION),
    where('status', 'in', ['waiting', 'active', 'bot'])
  );

  return onSnapshot(q, (snapshot) => {
    let sessions: ChatSession[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: safeToDate(d.data().createdAt),
      lastMessageAt: safeToDate(d.data().lastMessageAt),
    })) as ChatSession[];
    
    // Sort locally to avoid Firestore composite index requirement
    sessions.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
    callback(sessions);
  });
};

/**
 * Lắng nghe sessions đã đóng (realtime)
 */
export const subscribeToClosedSessions = (
  callback: (sessions: ChatSession[]) => void
): Unsubscribe => {
  const q = query(
    collection(firestore, SESSIONS_COLLECTION),
    where('status', '==', 'closed')
  );

  return onSnapshot(q, (snapshot) => {
    let sessions: ChatSession[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: safeToDate(d.data().createdAt),
      lastMessageAt: safeToDate(d.data().lastMessageAt),
    })) as ChatSession[];
    
    // Sort locally to avoid Firestore composite index requirement
    sessions.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
    
    // Only return the 50 most recent closed sessions
    if (sessions.length > 50) {
      sessions = sessions.slice(0, 50);
    }
    
    callback(sessions);
  });
};

/**
 * Lắng nghe tin nhắn của 1 session (realtime)
 */
export const subscribeToMessages = (
  sessionId: string,
  callback: (messages: ChatMessage[]) => void
): Unsubscribe => {
  const q = query(
    collection(firestore, SESSIONS_COLLECTION, sessionId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = snapshot.docs.map((d) => ({
      id: d.id,
      sessionId,
      ...d.data(),
      createdAt: safeToDate(d.data().createdAt),
    })) as ChatMessage[];
    callback(messages);
  });
};

/**
 * Admin gửi tin nhắn
 */
export const sendAdminMessage = async (
  sessionId: string,
  content: string,
  adminId: string,
  adminName: string
): Promise<void> => {
  const messagesRef = collection(firestore, SESSIONS_COLLECTION, sessionId, 'messages');
  await addDoc(messagesRef, {
    senderId: adminId,
    senderType: 'admin',
    senderName: adminName,
    content,
    createdAt: serverTimestamp(),
    isRead: false,
  });

  // Update session lastMessage và reset unread cho customer
  const sessionRef = doc(firestore, SESSIONS_COLLECTION, sessionId);
  await updateDoc(sessionRef, {
    lastMessage: content,
    lastMessageAt: serverTimestamp(),
    unreadByCustomer: 1,
    adminId,
    adminName,
    status: 'active',
  });
};

/**
 * Admin đánh dấu đã đọc tất cả tin nhắn của session
 */
export const markSessionReadByAdmin = async (sessionId: string): Promise<void> => {
  const sessionRef = doc(firestore, SESSIONS_COLLECTION, sessionId);
  await updateDoc(sessionRef, {
    unreadByAdmin: 0,
  });
};

/**
 * Admin gán mình vào session (nhận cuộc chat)
 */
export const assignAdminToSession = async (
  sessionId: string,
  adminId: string,
  adminName: string
): Promise<void> => {
  const sessionRef = doc(firestore, SESSIONS_COLLECTION, sessionId);
  await updateDoc(sessionRef, {
    adminId,
    adminName,
    status: 'active',
  });
};

/**
 * Admin đóng session chat
 */
export const closeSession = async (sessionId: string): Promise<void> => {
  const sessionRef = doc(firestore, SESSIONS_COLLECTION, sessionId);
  await updateDoc(sessionRef, {
    status: 'closed',
    lastMessage: 'Cuộc trò chuyện đã kết thúc.',
    lastMessageAt: serverTimestamp(),
  });

  // Gửi tin nhắn thông báo kết thúc
  const messagesRef = collection(firestore, SESSIONS_COLLECTION, sessionId, 'messages');
  await addDoc(messagesRef, {
    senderId: 'system',
    senderType: 'bot',
    senderName: 'Hệ thống',
    content: '✅ Cuộc trò chuyện đã kết thúc. Cảm ơn bạn đã liên hệ với AquaCare!',
    createdAt: serverTimestamp(),
    isRead: false,
  });
};

/**
 * Tổng số tin chưa đọc của admin (từ tất cả sessions)
 */
export const getTotalUnreadForAdmin = (sessions: ChatSession[]): number => {
  return sessions.reduce((sum, s) => sum + (s.unreadByAdmin || 0), 0);
};
