/**
 * Custom Authentication Hooks - Fixed Redirect Logic
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

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | null = null;

    const setupAuth = async () => {
      try {
        const authInstance = getAuthInstance();
        unsubscribe = authInstance.onAuthStateChanged(async (firebaseUser) => {
          if (!mounted) return;

          if (firebaseUser) {
            try {
              const currentUser = await getCurrentUser();
              if (mounted) {
                setUser(currentUser);
              }
            } catch (err) {
              if (mounted) setUser(null);
            }
          } else {
            if (mounted) setUser(null);
          }
          if (mounted) setIsLoading(false);
        });
      } catch (err) {
        if (mounted) setIsLoading(false);
      }
    };

    setupAuth();
    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return {
    user,
    isLoading,
    error,
    // QUAN TRỌNG: Chỉ isAuthenticated khi user đã active
    isAuthenticated: user !== null && user.isVerified === true,
  };
};

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      return await loginWithEmail(credentials);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { login, isLoading, error };
};

export const useSignup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signup = useCallback(async (credentials: SignupCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      await signupWithEmail(credentials);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { signup, isLoading, error };
};

export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const sendReset = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await sendPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { sendReset, isLoading, error, success };
};

export const useResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const reset = useCallback(async (code: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await resetPasswordWithCode(code, newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { reset, isLoading, error, success };
};

export const useLogout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logout();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { logout: handleLogout, isLoading, error };
};
