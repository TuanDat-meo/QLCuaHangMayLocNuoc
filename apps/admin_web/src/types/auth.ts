/**
 * Authentication Types & Interfaces - Numeric Role Version
 */

export enum UserRole {
  ADMIN = 1,
  MANAGER = 2,
  STAFF = 3,
  TECHNICIAN = 4,
  CUSTOMER = 5,
  ACCOUNTANT = 6,
  PENDING = 0
}

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  role: UserRole | null;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
  isVerified: boolean;
  status: 'active' | 'pending' | 'blocked';
  source: 'admin_web' | 'customer_app' | 'technician_app';
}

export interface SignupCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  phoneNumber: string;
  role?: UserRole | null;
  source?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
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
