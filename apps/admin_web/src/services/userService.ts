/**
 * User Management Service for Admin - Numeric Role Version
 */

import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy,
  where,
  onSnapshot,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { getDb } from './authService';
import { AuthUser, UserRole } from '../types/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Helper để chuyển đổi Document từ Firestore sang AuthUser
 */
const mapUserDoc = (doc: QueryDocumentSnapshot<DocumentData>): AuthUser => {
  const data = doc.data();

  return {
    uid: doc.id,
    email: data.email || '',
    displayName: data.displayName || 'Người dùng mới',
    phoneNumber: data.phoneNumber || '',
    role: data.role !== undefined ? (data.role as UserRole) : UserRole.PENDING,
    isVerified: data.status === 'active',
    status: data.status || 'pending',
    source: data.source || 'admin_web',
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
    avatar: data.avatar
  } as AuthUser;
};

/**
 * Lấy tất cả người dùng (Nhân viên & Admin)
 */
export const getAllUsers = async (): Promise<AuthUser[]> => {
  const db = getDb();
  // Lấy tất cả trừ Customer (Role 5) để tối ưu cho trang nhân sự
  const q = query(
    collection(db, 'nguoiDung'),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(mapUserDoc);
};

/**
 * Theo dõi danh sách Kỹ thuật viên (Real-time)
 */
export const subscribeToTechnicians = (callback: (techs: AuthUser[]) => void) => {
  const db = getDb();
  const q = query(
    collection(db, 'nguoiDung'),
    where('role', '==', UserRole.TECHNICIAN)
  );

  return onSnapshot(q, (snapshot) => {
    const techs = snapshot.docs.map(mapUserDoc);
    callback(techs);
  });
};

/**
 * Cập nhật trạng thái người dùng (Hoạt động / Khóa)
 */
export const updateUserStatus = async (uid: string, status: 'active' | 'blocked' | 'pending') => {
  const db = getDb();
  const userRef = doc(db, 'nguoiDung', uid);
  return await updateDoc(userRef, {
    status,
    updatedAt: serverTimestamp()
  });
};

/**
 * Lấy danh sách nhân sự theo vai trò cụ thể
 */
export const getUsersByRole = async (role: UserRole): Promise<AuthUser[]> => {
  const db = getDb();
  const q = query(
    collection(db, 'nguoiDung'),
    where('role', '==', role),
    where('status', '==', 'active')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(mapUserDoc);
};

/**
 * Lấy danh sách kỹ thuật viên (Sử dụng cho phân công đơn hàng)
 */
export const getTechnicians = async (): Promise<AuthUser[]> => {
  return getUsersByRole(UserRole.TECHNICIAN);
};

/**
 * Duyệt tài khoản và cấp quyền
 */
export const approveUser = async (uid: string, role: UserRole): Promise<void> => {
  const db = getDb();
  const userRef = doc(db, 'nguoiDung', uid);

  await updateDoc(userRef, {
    role: role,
    status: 'active',
    updatedAt: serverTimestamp()
  });
};

/**
 * --- CLOUD FUNCTIONS INTERFACE ---
 * Các hàm này gọi Firebase Functions để quản lý Firebase Auth (Tạo/Xóa user từ Admin)
 */
export const adminCreateUser = async (userData: any) => {
  const functions = getFunctions();
  const createUser = httpsCallable(functions, 'adminCreateUser');
  return createUser(userData);
};

export const adminUpdateUser = async (userData: any) => {
  const functions = getFunctions();
  const updateUser = httpsCallable(functions, 'adminUpdateUser');
  return updateUser(userData);
};

export const adminDeleteUser = async (uid: string) => {
  const functions = getFunctions();
  const deleteUser = httpsCallable(functions, 'adminDeleteUser');
  return deleteUser({ uid });
};
