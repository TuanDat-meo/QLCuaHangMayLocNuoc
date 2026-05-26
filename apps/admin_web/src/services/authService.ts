/**
 * Firebase Authentication Service - Production (Cloud) Version
 */

import { initializeApp, getApps, App as FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signOut,
  User,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  deleteUser,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  AuthUser,
  LoginCredentials,
  SignupCredentials,
  UserRole,
} from '../types/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Kiểm tra xem Firebase đã được cấu hình đủ thông tin chưa
 */
export const isFirebaseConfigured = (): boolean => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export const initializeFirebase = () => {
  if (app && auth && db) return { auth, db };
  if (!getApps().length) app = initializeApp(firebaseConfig);
  else app = getApps()[0];
  auth = getAuth(app!);
  db = getFirestore(app!);
  setPersistence(auth, browserLocalPersistence).catch(() => {});
  return { auth, db };
};

export const getDb = (): Firestore => {
  if (!db) initializeFirebase();
  return db!;
};

export const getAuthInstance = (): Auth => {
  if (!auth) initializeFirebase();
  return auth!;
};

export const convertFirebaseUser = async (user: User): Promise<AuthUser> => {
  const userDocRef = doc(getDb(), 'nguoiDung', user.uid);
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
    displayName: data.displayName || user.displayName || '',
    phoneNumber: data.phoneNumber || '',
    role: data.role as UserRole ?? UserRole.PENDING,
    isVerified: data.status === 'active',
    status: data.status || 'pending',
    source: data.source || 'admin_web',
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
  };
};

export const signupWithEmail = async (credentials: SignupCredentials): Promise<void> => {
  const authInstance = getAuthInstance();
  const dbInstance = getDb();
  let createdFirebaseUser: User | null = null;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      authInstance, credentials.email, credentials.password
    );
    createdFirebaseUser = userCredential.user;
    await updateProfile(createdFirebaseUser, { displayName: credentials.displayName });

    const userDocRef = doc(dbInstance, 'nguoiDung', createdFirebaseUser.uid);
    const userData = {
      uid: createdFirebaseUser.uid,
      email: credentials.email,
      displayName: credentials.displayName,
      phoneNumber: credentials.phoneNumber,
      role: credentials.role ?? UserRole.PENDING,
      status: 'pending',
      source: credentials.source || 'admin_web',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(userDocRef, userData);
    await signOut(authInstance);
  } catch (error: any) {
    if (createdFirebaseUser) await deleteUser(createdFirebaseUser).catch(() => {});
    throw error;
  }
};

export const loginWithEmail = async (credentials: LoginCredentials): Promise<AuthUser> => {
  const authInstance = getAuthInstance();
  const userCredential = await signInWithEmailAndPassword(authInstance, credentials.email, credentials.password);
  const authUser = await convertFirebaseUser(userCredential.user);

  if (authUser.status !== 'active') {
    await signOut(authInstance);
    throw new Error('Tài khoản của bạn đang chờ quản trị viên phê duyệt.');
  }

  return authUser;
};

export const logout = async (): Promise<void> => { await signOut(getAuthInstance()); };

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const user = getAuthInstance().currentUser;
  if (!user) return null;
  try { return await convertFirebaseUser(user); } catch { return null; }
};

export const sendPasswordReset = async (email: string) => {
  await sendPasswordResetEmail(getAuthInstance(), email);
};

export const resetPasswordWithCode = async (code: string, newPassword: string) => {
  await confirmPasswordReset(getAuthInstance(), code, newPassword);
};
