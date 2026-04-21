/**
 * Custom Authentication Hooks
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getAuthInstance,
  loginWithEmail,
  signupWithEmail,
  sendPasswordReset,
  resetPasswordWithCode,
  logout,
  getCurrentUser,
} from '../services/authService';
import { AuthUser, LoginCredentials, SignupCredentials } from '../types/auth';

/**
 * useAuth - Main auth hook for authentication state management
 */
export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check current user on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const authInstance = getAuthInstance();
    const unsubscribe = authInstance.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: user !== null,
  };
};

/**
 * useLogin - Hook for login functionality
 */
export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await loginWithEmail(credentials);
      return user;
    } catch (err: any) {
      const errorMessage = err.message || 'Đăng nhập thất bại';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { login, isLoading, error };
};

/**
 * useSignup - Hook for signup functionality
 */
export const useSignup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signup = useCallback(async (credentials: SignupCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await signupWithEmail(credentials);
      return user;
    } catch (err: any) {
      const errorMessage = err.message || 'Đăng ký thất bại';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { signup, isLoading, error };
};

/**
 * useForgotPassword - Hook for forgot password functionality
 */
export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const sendReset = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await sendPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể gửi email reset mật khẩu';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { sendReset, isLoading, error, success };
};

/**
 * useResetPassword - Hook for reset password functionality
 */
export const useResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const reset = useCallback(async (code: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await resetPasswordWithCode(code, newPassword);
      setSuccess(true);
    } catch (err: any) {
      const errorMessage = err.message || 'Reset mật khẩu thất bại';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { reset, isLoading, error, success };
};

/**
 * useLogout - Hook for logout functionality
 */
export const useLogout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await logout();
    } catch (err: any) {
      const errorMessage = err.message || 'Đăng xuất thất bại';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { logout: handleLogout, isLoading, error };
};
