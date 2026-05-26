/**
 * Form Validation Utilities - Numeric Role Version
 */

import { ValidationError, UserRole } from '../types/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+84|0)[0-9]{9,10}$/; // Vietnam phone format
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

export const ValidationRules = {
  email: {
    required: 'Email là bắt buộc',
    invalid: 'Email không hợp lệ',
  },
  password: {
    required: 'Mật khẩu là bắt buộc',
    tooShort: `Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự`,
    weak: 'Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt',
  },
  confirmPassword: {
    required: 'Xác nhận mật khẩu là bắt buộc',
    mismatch: 'Mật khẩu không khớp',
  },
  displayName: {
    required: 'Họ tên là bắt buộc',
    tooShort: 'Họ tên phải có ít nhất 2 ký tự',
    tooLong: 'Họ tên không được vượt quá 50 ký tự',
  },
  phoneNumber: {
    required: 'Số điện thoại là bắt buộc',
    invalid: 'Số điện thoại không hợp lệ (Việt Nam)',
  },
  role: {
    required: 'Vị trí là bắt buộc',
  },
};

/**
 * Validate email
 */
export const validateEmail = (email: string): string | null => {
  if (!email) {
    return ValidationRules.email.required;
  }
  if (!EMAIL_REGEX.test(email)) {
    return ValidationRules.email.invalid;
  }
  return null;
};

/**
 * Validate password
 */
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return ValidationRules.password.required;
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return ValidationRules.password.tooShort;
  }
  if (!PASSWORD_REGEX.test(password)) {
    return ValidationRules.password.weak;
  }
  return null;
};

/**
 * Validate confirm password
 */
export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): string | null => {
  if (!confirmPassword) {
    return ValidationRules.confirmPassword.required;
  }
  if (password !== confirmPassword) {
    return ValidationRules.confirmPassword.mismatch;
  }
  return null;
};

/**
 * Validate display name
 */
export const validateDisplayName = (displayName: string): string | null => {
  if (!displayName) {
    return ValidationRules.displayName.required;
  }
  if (displayName.length < 2) {
    return ValidationRules.displayName.tooShort;
  }
  if (displayName.length > 50) {
    return ValidationRules.displayName.tooLong;
  }
  return null;
};

/**
 * Validate phone number (Vietnam format)
 */
export const validatePhoneNumber = (phoneNumber: string): string | null => {
  if (!phoneNumber) {
    return ValidationRules.phoneNumber.required;
  }
  if (!PHONE_REGEX.test(phoneNumber)) {
    return ValidationRules.phoneNumber.invalid;
  }
  return null;
};

/**
 * Validate role (Numeric)
 */
export const validateRole = (role: any): string | null => {
  if (role === null || role === undefined) {
    return null; // Cho phép null khi đăng ký từ Web
  }

  const validRoles = Object.values(UserRole).filter(v => typeof v === 'number');
  if (!validRoles.includes(role)) {
    return 'Vị trí không hợp lệ';
  }
  return null;
};

/**
 * Validate login form
 */
export const validateLoginForm = (
  email: string,
  password: string
): ValidationError[] => {
  const errors: ValidationError[] = [];

  const emailError = validateEmail(email);
  if (emailError) {
    errors.push({ field: 'email', message: emailError });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    errors.push({ field: 'password', message: passwordError });
  }

  return errors;
};

/**
 * Validate signup form
 */
export const validateSignupForm = (
  email: string,
  password: string,
  confirmPassword: string,
  displayName: string,
  phoneNumber: string,
  role?: any
): ValidationError[] => {
  const errors: ValidationError[] = [];

  const emailError = validateEmail(email);
  if (emailError) {
    errors.push({ field: 'email', message: emailError });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    errors.push({ field: 'password', message: passwordError });
  }

  const confirmPasswordError = validateConfirmPassword(password, confirmPassword);
  if (confirmPasswordError) {
    errors.push({ field: 'confirmPassword', message: confirmPasswordError });
  }

  const displayNameError = validateDisplayName(displayName);
  if (displayNameError) {
    errors.push({ field: 'displayName', message: displayNameError });
  }

  const phoneError = validatePhoneNumber(phoneNumber);
  if (phoneError) {
    errors.push({ field: 'phoneNumber', message: phoneError });
  }

  if (role !== undefined) {
    const roleError = validateRole(role);
    if (roleError) {
      errors.push({ field: 'role', message: roleError });
    }
  }

  return errors;
};

/**
 * Validate reset password form
 */
export const validateResetPasswordForm = (
  newPassword: string,
  confirmPassword: string
): ValidationError[] => {
  const errors: ValidationError[] = [];

  const passwordError = validatePassword(newPassword);
  if (passwordError) {
    errors.push({ field: 'newPassword', message: passwordError });
  }

  const confirmPasswordError = validateConfirmPassword(newPassword, confirmPassword);
  if (confirmPasswordError) {
    errors.push({ field: 'confirmPassword', message: confirmPasswordError });
  }

  return errors;
};
