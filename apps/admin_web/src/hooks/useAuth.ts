/**
 * Custom Authentication Hooks - Using AuthContext for global stability
 */

import { useState, useCallback, useContext } from 'react';
import {
  loginWithEmail,
  signupWithEmail,
  sendPasswordReset,
  resetPasswordWithCode,
  logout,
} from '../services/authService';
import { LoginCredentials, SignupCredentials } from '../types/auth';
import { useAuth as useAuthContext } from '../context/AuthContext';

// Hook chính để lấy thông tin user từ Context
export const useAuth = () => {
  return useAuthContext();
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
