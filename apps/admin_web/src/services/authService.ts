/**
 * Firebase Authentication Service - Centralized Instance
 */

import { initializeApp, deleteApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signOut,
  updateProfile,
  deleteUser as firebaseDeleteUser,
} from 'firebase/auth';
import type { User, Auth } from 'firebase/auth';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, firestore, firebaseConfig } from '../app/firebase.config';
import {
  AuthUser,
  LoginCredentials,
  SignupCredentials,
  UserRole,
} from '../types/auth';

/**
 * Hàm hỗ trợ ép kiểu ngày tháng an toàn tuyệt đối
 */
const safeToDate = (value: any): Date => {
  if (!value) return new Date();
  if (typeof value.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  if (value && typeof value === 'object' && value.seconds) return new Date(value.seconds * 1000);
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date() : d;
};

export const getDb = (): Firestore => firestore;
export const getAuthInstance = (): Auth => auth;

export const convertFirebaseUser = async (user: User): Promise<AuthUser> => {
  const userDocRef = doc(firestore, 'nguoiDung', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Người dùng mới',
      phoneNumber: '',
      role: UserRole.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: false,
      status: 'pending',
      source: 'admin_web'
    };
  }

  const data = userDoc.data();
  return {
    uid: user.uid,
    email: user.email || data.email || '',
    displayName: data.displayName || user.displayName || 'Thành viên',
    phoneNumber: data.phoneNumber || '',
    // Đảm bảo role luôn là kiểu number
    role: (data.role !== undefined && data.role !== null) ? Number(data.role) : UserRole.PENDING,
    isVerified: data.status === 'active',
    status: data.status || 'pending',
    source: data.source || 'admin_web',
    createdAt: safeToDate(data.createdAt),
    updatedAt: safeToDate(data.updatedAt),
    baseSalary: data.baseSalary || 0,
    commissionPerOrder: data.commissionPerOrder || 0
  };
};

export const loginWithEmail = async (credentials: LoginCredentials): Promise<AuthUser> => {
  const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
  const authUser = await convertFirebaseUser(userCredential.user);

  // Cho phép Admin đăng nhập ngay cả khi chưa active (để fix hệ thống) hoặc nếu status là active
  if (authUser.status !== 'active' && Number(authUser.role) !== UserRole.ADMIN) {
    await signOut(auth);
    throw new Error('Tài khoản của bạn chưa được kích hoạt hoặc đã bị khóa.');
  }

  return authUser;
};

export const signupWithEmail = async (credentials: SignupCredentials): Promise<void> => {
  let createdFirebaseUser: User | null = null;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
    createdFirebaseUser = userCredential.user;
    await updateProfile(createdFirebaseUser, { displayName: credentials.displayName });

    const userDocRef = doc(firestore, 'nguoiDung', createdFirebaseUser.uid);
    await setDoc(userDocRef, {
      uid: createdFirebaseUser.uid,
      email: credentials.email,
      displayName: credentials.displayName,
      phoneNumber: credentials.phoneNumber,
      role: Number(credentials.role ?? UserRole.PENDING),
      status: 'pending',
      source: credentials.source || 'admin_web',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await signOut(auth);
  } catch (error: any) {
    if (createdFirebaseUser) await firebaseDeleteUser(createdFirebaseUser).catch(() => {});
    throw error;
  }
};

/**
 * CẤP TÀI KHOẢN (ADMIN ONLY)
 */
export const adminCreateAuthUser = async (credentials: SignupCredentials): Promise<string> => {
  const tempAppName = `temp-app-${Date.now()}`;
  const tempApp = initializeApp(firebaseConfig, tempAppName);
  const tempAuth = getAuth(tempApp);

  try {
    const userCredential = await createUserWithEmailAndPassword(tempAuth, credentials.email, credentials.password);
    const uid = userCredential.user.uid;
    await signOut(tempAuth);
    await deleteApp(tempApp);
    return uid;
  } catch (error: any) {
    await deleteApp(tempApp);
    throw error;
  }
};

export const logout = async (): Promise<void> => { await signOut(auth); };

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  try { return await convertFirebaseUser(user); } catch { return null; }
};

export const sendPasswordReset = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};

export const resetPasswordWithCode = async (code: string, newPassword: string) => {
  await confirmPasswordReset(auth, code, newPassword);
};

export const initializeFirebase = (): void => {
  try {
    if (!auth || !firestore) throw new Error('Firebase instances not available');
  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
};

export const isFirebaseConfigured = (): boolean => {
  const requiredEnvVars = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID'];
  return requiredEnvVars.every(envVar => !!import.meta.env[envVar]);
};
