/**
 * Reset Password Page - Admin Web Authentication
 * Aligned with DESIGN.md Material Design 3 system
 */

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Loader, CheckCircle, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useResetPassword } from '@/hooks';
import { validateResetPasswordForm } from '@/utils/validation';
import { ValidationError } from '@/types/auth';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');
  const { reset, isLoading, success } = useResetPassword();

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [invalidCode, setInvalidCode] = useState(false);

  useEffect(() => {
    if (!code) {
      setInvalidCode(true);
    }
  }, [code]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validateResetPasswordForm(
      formData.newPassword,
      formData.confirmPassword
    );

    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach((error: ValidationError) => {
        errorMap[error.field] = error.message;
      });
      setErrors(errorMap);
      return;
    }

    if (!code) {
      toast.error('Mã reset không hợp lệ');
      return;
    }

    try {
      await reset(code, formData.newPassword);
      toast.success('Mật khẩu đã được reset thành công!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (invalidCode) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-md py-lg">
        <div className="w-full max-w-md">
          <div className="card text-center shadow-ambient-md border-none ring-1 ring-outline-variant/30">
            <div className="mb-lg">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-error/10 rounded-full">
                <AlertCircle className="h-10 w-10 text-error" />
              </div>
            </div>

            <h2 className="h2 text-on-surface mb-xs font-bold">Đường link không hợp lệ</h2>

            <p className="body-md text-on-surface-variant mb-lg">
              Đường link reset mật khẩu không có hoặc đã hết hạn. <br />
              Vui lòng yêu cầu một đường link mới.
            </p>

            <Link
              to="/forgot-password"
              className="btn-primary w-full py-3 inline-block"
            >
              Yêu cầu mã mới
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-md py-lg">
        <div className="w-full max-w-md">
          <div className="card text-center shadow-ambient-md border-none ring-1 ring-outline-variant/30">
            <div className="mb-lg">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full">
                <CheckCircle className="h-10 w-10 text-emerald-600" />
              </div>
            </div>

            <h2 className="h2 text-on-surface mb-xs font-bold">Thành công!</h2>

            <p className="body-md text-on-surface-variant mb-lg">
              Mật khẩu của bạn đã được thay đổi. <br />
              Bây giờ bạn có thể đăng nhập với mật khẩu mới.
            </p>

            <button
              onClick={() => navigate('/login')}
              className="btn-primary w-full py-3"
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-md py-xl">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-xs text-primary hover:text-primary-container font-bold mb-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại đăng nhập
        </Link>

        {/* Header */}
        <div className="text-center mb-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-md shadow-ambient-sm">
            <svg
              className="w-8 h-8 text-on-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="h1 text-on-surface font-bold">Đặt lại mật khẩu</h1>
          <p className="body-md text-on-surface-variant mt-xs">Tạo mật khẩu mới cho tài khoản của bạn</p>
        </div>

        {/* Form Card */}
        <div className="card shadow-ambient-md border-none ring-1 ring-outline-variant/30">
          <form onSubmit={handleSubmit} className="space-y-md">
            {/* New Password Field */}
            <div>
              <label htmlFor="newPassword" className="block label-sm text-on-surface mb-xs font-semibold">
                Mật khẩu mới
              </label>
              <div className="relative">
                <Lock className="absolute left-md top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`input-field pl-12 pr-12 ${
                    errors.newPassword ? 'border-error focus:ring-error' : 'border-outline focus:ring-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-xs text-label-sm text-error font-medium">{errors.newPassword}</p>
              )}

              <div className="mt-md p-md bg-surface-container rounded-lg border border-outline-variant/30">
                <p className="label-sm text-on-surface font-bold mb-xs">Yêu cầu bảo mật:</p>
                <ul className="text-xs text-on-surface-variant space-y-1 list-disc list-inside">
                  <li>Tối thiểu 8 ký tự</li>
                  <li>Bao gồm chữ hoa và chữ thường</li>
                  <li>Bao gồm ít nhất 1 chữ số</li>
                  <li>Bao gồm ký tự đặc biệt (@, #, $, ...)</li>
                </ul>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block label-sm text-on-surface mb-xs font-semibold">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-md top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`input-field pl-12 pr-12 ${
                    errors.confirmPassword ? 'border-error focus:ring-error' : 'border-outline focus:ring-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-xs text-label-sm text-error font-medium">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-xs mt-lg py-3"
            >
              {isLoading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Đang cập nhật...</span>
                </>
              ) : (
                'Cập nhật mật khẩu'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
