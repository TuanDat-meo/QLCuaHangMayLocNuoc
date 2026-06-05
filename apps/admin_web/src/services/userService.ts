import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { getDb, adminCreateAuthUser, sendPasswordReset } from './authService';
import { AuthUser, UserRole } from '../types/auth';

/**
 * Hàm hỗ trợ ép kiểu ngày tháng an toàn
 */
const safeToDate = (value: any): Date => {
  if (!value) return new Date();
  if (typeof value.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  if (value && typeof value === 'object' && value.seconds) return new Date(value.seconds * 1000);
  return new Date(value) || new Date();
};

export const getTechnicians = async (): Promise<AuthUser[]> => {
  const db = getDb();
  const q = query(
    collection(db, 'nguoiDung'),
    where('role', '==', UserRole.TECHNICIAN),
    where('status', '==', 'active')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      uid: doc.id,
      ...data,
      createdAt: safeToDate(data.createdAt),
      updatedAt: safeToDate(data.updatedAt),
    } as AuthUser;
  });
};

export const subscribeToTechnicians = (callback: (technicians: AuthUser[]) => void): (() => void) => {
  const db = getDb();
  const q = query(
    collection(db, 'nguoiDung'),
    where('role', '==', UserRole.TECHNICIAN)
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const technicians = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: doc.id,
        ...data,
        createdAt: safeToDate(data.createdAt),
        updatedAt: safeToDate(data.updatedAt),
      } as AuthUser;
    });
    callback(technicians);
  });

  return unsubscribe;
};

export const getAllUsers = async (): Promise<AuthUser[]> => {
  const querySnapshot = await getDocs(collection(getDb(), 'nguoiDung'));
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      uid: doc.id,
      ...data,
      createdAt: safeToDate(data.createdAt),
      updatedAt: safeToDate(data.updatedAt),
    } as AuthUser;
  });
};

export const approveUser = async (uid: string, role: UserRole) => {
  const userRef = doc(getDb(), 'nguoiDung', uid);
  return updateDoc(userRef, {
    status: 'active',
    role: Number(role),
    updatedAt: serverTimestamp()
  });
};

export const adminCreateUser = async (userData: any) => {
  const db = getDb();

  // 1. Tạo tài khoản Authentication trước (Sử dụng hàm đặc biệt để không bị logout Admin)
  const uid = await adminCreateAuthUser({
    email: userData.email,
    password: userData.password,
    confirmPassword: userData.password,
    displayName: userData.displayName,
    phoneNumber: userData.phoneNumber
  });

  // 2. Tạo document trong Firestore với UID vừa lấy được
  const userRef = doc(db, 'nguoiDung', uid);
  const docData = {
    uid: uid,
    email: userData.email,
    displayName: userData.displayName,
    phoneNumber: userData.phoneNumber || '',
    role: Number(userData.role),
    status: userData.status || 'active',
    baseSalary: Number(userData.baseSalary || 0),
    commissionPerOrder: Number(userData.commissionPerOrder || 0),
    source: 'admin_web',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isVerified: true
  };

  return setDoc(userRef, docData);
};

export const adminUpdateUser = async (userData: any) => {
  const userRef = doc(getDb(), 'nguoiDung', userData.uid);
  const updateData = { ...userData };
  delete updateData.uid;
  delete updateData.password; // Không update password qua Firestore

  return updateDoc(userRef, {
    ...updateData,
    updatedAt: serverTimestamp()
  });
};

export const updateUserStatus = async (uid: string, status: string) => {
  return updateDoc(doc(getDb(), 'nguoiDung', uid), {
    status,
    updatedAt: serverTimestamp()
  });
};

export const resetUserPassword = async (email: string) => {
  return sendPasswordReset(email);
};

export const adminDeleteUser = async (uid: string) => {
  // Đánh dấu trạng thái là 'resigned' thay vì xóa hoàn toàn
  return updateDoc(doc(getDb(), 'nguoiDung', uid), {
    status: 'resigned',
    updatedAt: serverTimestamp()
  });
};
