/**
 * Forgot Password Page Component
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Loader, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForgotPassword } from '@/hooks';
import { validateEmail } from '@/utils/validation';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { sendReset, isLoading, success } = useForgotPassword();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    // Validate email
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }

    try {
      await sendReset(email);
      toast.success('Email hướng dẫn reset mật khẩu đã được gửi!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Email đã được gửi!
            </h2>

            <p className="text-gray-600 mb-6">
              Chúng tôi đã gửi hướng dẫn để reset mật khẩu tới email <strong>{email}</strong>. Vui lòng kiểm tra email của bạn (cả thư rác) trong vòng 24 giờ.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Hướng dẫn:</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Kiểm tra email của bạn</li>
                <li>Nhấp vào đường link trong email</li>
                <li>Tạo mật khẩu mới</li>
                <li>Đăng nhập với mật khẩu mới</li>
              </ol>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Quay lại Đăng nhập
            </button>

            <p className="mt-4 text-sm text-gray-600">
              Không nhận được email?{' '}
              <button
                onClick={() => setEmail('')}
                className="text-indigo-600 hover:text-indigo-700 font-medium transition"
              >
                Thử lại
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link
          to="/login"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-8 transition"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-lg mb-4">
            <svg
              className="w-6 h-6 text-white"
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
          <h1 className="text-3xl font-bold text-gray-900">Quên mật khẩu?</h1>
          <p className="text-gray-600 mt-2">
            Nhập email của bạn để nhận hướng dẫn reset mật khẩu
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                    emailError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p>
                Email hướng dẫn reset sẽ được gửi tới địa chỉ email của bạn. Hãy kiểm tra thư rác nếu không tìm thấy.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                'Gửi hướng dẫn reset'
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Gặp vấn đề? Liên hệ với
            </p>
            <a
              href="mailto:support@aquacare.vn"
              className="text-indigo-600 hover:text-indigo-700 font-medium transition"
            >
              support@aquacare.vn
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>© 2024 AquaCare System. Bảo vệ quyền riêng tư của bạn.</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
