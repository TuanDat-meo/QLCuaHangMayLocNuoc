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
 * Lấy tất cả người dùng
 */
export const getAllUsers = async (): Promise<AuthUser[]> => {
  try {
    const db = getDb();
    const q = query(collection(db, 'nguoiDung'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(mapUserDoc);
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.error("❌ QUYỀN TRUY CẬP BỊ TỪ CHỐI: Kiểm tra role của bạn trong Firestore (Admin phải có role = 1).");
    }
    throw error;
  }
};

/**
 * Lấy danh sách kỹ thuật viên (Role = 4)
 */
export const getTechnicians = async (): Promise<AuthUser[]> => {
  try {
    const db = getDb();
    const q = query(
      collection(db, 'nguoiDung'),
      where('role', '==', UserRole.TECHNICIAN),
      where('status', '==', 'active')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(mapUserDoc);
  } catch (error) {
    console.error("[UserService] Error fetching technicians:", error);
    throw error;
  }
};

/**
 * Duyệt tài khoản và cấp quyền (Numeric Role)
 */
export const approveUser = async (uid: string, role: UserRole): Promise<void> => {
  try {
    const db = getDb();
    const userRef = doc(db, 'nguoiDung', uid);

    await updateDoc(userRef, {
      role: role,
      status: 'active',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("[UserService] Error approving user:", error);
    throw error;
  }
};

/**
 * CRUD Operations via Cloud Functions (To handle Password & Auth changes)
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
