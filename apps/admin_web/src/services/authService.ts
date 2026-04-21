/**
 * Firebase Authentication Service
 */

import {
  initializeApp,
  getApps,
  App as FirebaseApp,
} from 'firebase/app';
import {
  getAuth,
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  signOut,
  User,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  connectAuthEmulator,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  connectFirestoreEmulator,
} from 'firebase/firestore';
import {
  AuthUser,
  LoginCredentials,
  SignupCredentials,
  PasswordResetHistory,
} from '../types/auth';

// Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Check if Firebase is properly configured
export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Initialize Firebase
export const initializeFirebase = () => {
  if (!isFirebaseConfigured()) {
    console.warn(
      '⚠️ Firebase is not configured. Please set environment variables in .env.local'
    );
    // Return mock objects to prevent crashes
    return {
      auth: null as any,
      db: null as any,
    };
  }

  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      throw error;
    }
  } else {
    app = getApps()[0];
  }

  auth = getAuth(app!);
  db = getFirestore(app!);

  // Connect to Auth Emulator in development
  if (import.meta.env.DEV && !auth.emulatorConfig) {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      console.log('✅ Connected to Firebase Auth Emulator');
    } catch (error: any) {
      // Auth emulator might not be available, which is ok for production
      if (!error.message?.includes('already connected')) {
        console.warn('⚠️ Could not connect to Auth Emulator:', error.message);
      }
    }
  }

  // Connect to Firestore Emulator in development
  if (import.meta.env.DEV && db) {
    try {
      // Check if already connected to emulator
      const isEmulator = (db as any)._host?.isEmulator;
      if (!isEmulator) {
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log('✅ Connected to Firebase Firestore Emulator');
      }
    } catch (error: any) {
      // Firestore emulator might not be available, which is ok for production
      if (!error.message?.includes('already connected')) {
        console.warn('⚠️ Could not connect to Firestore Emulator:', error.message);
      }
    }
  }

  // Set persistence
  try {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.warn('Could not set persistence:', error);
    });
  } catch (error) {
    console.warn('Persistence not available:', error);
  }

  return { auth, db };
};

/**
 * Get Firestore instance
 */
export const getDb = (): Firestore => {
  if (!db) {
    initializeFirebase();
  }
  return db;
};

/**
 * Get Auth instance
 */
export const getAuthInstance = (): Auth => {
  if (!auth) {
    initializeFirebase();
  }
  return auth;
};

/**
 * Convert Firebase User to AuthUser
 */
const convertFirebaseUser = async (user: User): Promise<AuthUser> => {
  const userDoc = await getDoc(doc(getDb(), 'nguoiDung', user.uid));
  const userData = userDoc.data();

  return {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || userData?.displayName || '',
    phoneNumber: user.phoneNumber || userData?.phoneNumber || '',
    role: userData?.role || 'customer',
    createdAt: new Date(user.metadata?.creationTime || ''),
    updatedAt: new Date(),
    avatar: user.photoURL || userData?.avatar,
    isVerified: user.emailVerified,
  };
};

/**
 * Login with email and password
 */
export const loginWithEmail = async (
  credentials: LoginCredentials
): Promise<AuthUser> => {
  if (!isFirebaseConfigured()) {
    throw new Error(
      '❌ Firebase chưa được cấu hình. Vui lòng thiết lập biến môi trường trong .env.local\n\nXem hướng dẫn: docs/FIREBASE_SETUP.md'
    );
  }

  try {
    const authInstance = getAuthInstance();
    if (!authInstance) {
      throw new Error('Firebase Auth chưa được khởi tạo');
    }

    const userCredential = await signInWithEmailAndPassword(
      authInstance,
      credentials.email,
      credentials.password
    );

    const authUser = await convertFirebaseUser(userCredential.user);

    // Log login history
    await logLoginHistory(authUser.uid, credentials.email, 'success');

    return authUser;
  } catch (error: any) {
    // Log failed login attempt
    await logLoginHistory('unknown', credentials.email, 'failed');

    if (error.code === 'auth/user-not-found') {
      throw new Error('Email không tồn tại trong hệ thống');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Mật khẩu không chính xác');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau.');
    }
    throw new Error(error.message || 'Đăng nhập thất bại');
  }
};

/**
 * Signup with email and password
 */
export const signupWithEmail = async (
  credentials: SignupCredentials
): Promise<AuthUser> => {
  try {
    const authInstance = getAuthInstance();
    const db = getDb();

    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(
      authInstance,
      credentials.email,
      credentials.password
    );

    // Update profile
    await updateProfile(userCredential.user, {
      displayName: credentials.displayName,
    });

    // Save user data to Firestore
    const userData = {
      uid: userCredential.user.uid,
      email: credentials.email,
      displayName: credentials.displayName,
      phoneNumber: credentials.phoneNumber,
      role: credentials.role,
      avatar: null,
      isVerified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(
      doc(db, 'nguoiDung', userCredential.user.uid),
      userData
    );

    // Log signup history
    await logSignupHistory(userCredential.user.uid, credentials.email, credentials.role);

    return await convertFirebaseUser(userCredential.user);
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Email này đã được đăng ký');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Mật khẩu quá yếu');
    }
    throw new Error(error.message || 'Đăng ký thất bại');
  }
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    const authInstance = getAuthInstance();
    await sendPasswordResetEmail(authInstance, email);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      throw new Error('Email không tồn tại trong hệ thống');
    }
    throw new Error(error.message || 'Không thể gửi email reset mật khẩu');
  }
};

/**
 * Verify reset password code and get email
 */
export const verifyResetCode = async (code: string): Promise<string> => {
  try {
    const authInstance = getAuthInstance();
    const email = await verifyPasswordResetCode(authInstance, code);
    return email;
  } catch (error: any) {
    throw new Error('Mã reset không hợp lệ hoặc đã hết hạn');
  }
};

/**
 * Reset password with code
 */
export const resetPasswordWithCode = async (
  code: string,
  newPassword: string
): Promise<void> => {
  try {
    const authInstance = getAuthInstance();
    const email = await verifyPasswordResetCode(authInstance, code);
    await confirmPasswordReset(authInstance, code, newPassword);

    // Log password reset
    await logPasswordResetHistory(email, 'success');
  } catch (error: any) {
    await logPasswordResetHistory('unknown', 'failed');
    throw new Error(error.message || 'Không thể reset mật khẩu');
  }
};

/**
 * Logout
 */
export const logout = async (): Promise<void> => {
  try {
    const authInstance = getAuthInstance();
    await signOut(authInstance);
  } catch (error: any) {
    throw new Error(error.message || 'Đăng xuất thất bại');
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase not configured - returning null user');
    return null;
  }

  return new Promise((resolve) => {
    try {
      const authInstance = getAuthInstance();
      if (!authInstance) {
        resolve(null);
        return;
      }

      const unsubscribe = authInstance.onAuthStateChanged(async (user) => {
        if (user) {
          try {
            const authUser = await convertFirebaseUser(user);
            resolve(authUser);
          } catch (error) {
            console.warn('Error converting Firebase user:', error);
            resolve(null);
          }
        } else {
          resolve(null);
        }
        unsubscribe();
      });
    } catch (error) {
      console.warn('Error getting current user:', error);
      resolve(null);
    }
  });
};

/**
 * Check if user exists
 */
export const checkUserExists = async (email: string): Promise<boolean> => {
  try {
    const db = getDb();
    const q = query(
      collection(db, 'nguoiDung'),
      where('email', '==', email)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch {
    return false;
  }
};

/**
 * Log login history
 */
export const logLoginHistory = async (
  userId: string,
  email: string,
  status: 'success' | 'failed'
): Promise<void> => {
  try {
    const db = getDb();
    await addDoc(collection(db, 'loginHistory'), {
      userId,
      email,
      status,
      timestamp: serverTimestamp(),
      ipAddress: await getClientIpAddress(),
      userAgent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Failed to log login history:', error);
  }
};

/**
 * Log signup history
 */
export const logSignupHistory = async (
  userId: string,
  email: string,
  role: string
): Promise<void> => {
  try {
    const db = getDb();
    await addDoc(collection(db, 'signupHistory'), {
      userId,
      email,
      role,
      timestamp: serverTimestamp(),
      ipAddress: await getClientIpAddress(),
      userAgent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Failed to log signup history:', error);
  }
};

/**
 * Log password reset history
 */
export const logPasswordResetHistory = async (
  email: string,
  status: 'success' | 'failed'
): Promise<void> => {
  try {
    const db = getDb();
    await addDoc(collection(db, 'passwordResetHistory'), {
      email,
      status,
      timestamp: serverTimestamp(),
      ipAddress: await getClientIpAddress(),
      userAgent: navigator.userAgent,
      method: 'email',
    });
  } catch (error) {
    console.error('Failed to log password reset:', error);
  }
};

/**
 * Get client IP address (helper - may need backend support for accurate IP)
 */
const getClientIpAddress = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch {
    return 'unknown';
  }
};

/**
 * Get password reset history for user
 */
export const getPasswordResetHistory = async (
  email: string
): Promise<PasswordResetHistory[]> => {
  try {
    const db = getDb();
    const q = query(
      collection(db, 'passwordResetHistory'),
      where('email', '==', email)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId || '',
        email: data.email,
        resetAt: data.timestamp?.toDate() || new Date(),
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        status: data.status,
        method: data.method || 'email',
      };
    });
  } catch (error) {
    console.error('Failed to get password reset history:', error);
    return [];
  }
};
