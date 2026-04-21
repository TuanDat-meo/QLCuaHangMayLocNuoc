/**
 * Authentication Types & Interfaces
 */

export type UserRole = 'customer' | 'technician' | 'admin';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
  isVerified: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  phoneNumber: string;
  role: UserRole;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface PasswordResetHistory {
  id: string;
  userId: string;
  email: string;
  resetAt: Date;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed';
  method: 'email' | 'security_questions';
}

export interface ValidationError {
  field: string;
  message: string;
}
