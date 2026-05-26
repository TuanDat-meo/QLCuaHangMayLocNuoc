/**
 * Login Page - Admin Web
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader, Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLogin } from '../../hooks';
import { validateLoginForm } from '../../utils/validation';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useLogin();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Xóa lỗi khi người dùng sửa thông tin
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    if (generalError) setGeneralError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    const valErrors = validateLoginForm(formData.email, formData.password);
    if (valErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      valErrors.forEach((err) => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    try {
      await login({ email: formData.email, password: formData.password });
      toast.success('Đăng nhập thành công!');
      navigate('/dashboard');
    } catch (error: any) {
      // Chỉ lấy phần tin nhắn đã được dịch sang tiếng Việt từ authService
      const msg = error.message || 'Đăng nhập không thành công';
      // Nếu có lỗi "Firebase" bị lọt ra, ta sẽ ẩn đi
      if (msg.includes('Firebase') || msg.includes('auth/')) {
        setGeneralError('Email hoặc mật khẩu không chính xác.');
      } else {
        setGeneralError(msg);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-10 border border-slate-100 relative z-50">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#00459a] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-100">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-[#0b1c30] tracking-tight">Aquacare Admin</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 text-center">SOC Operations Center</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase ml-1">Tài khoản Email</label>
            <div className={`relative flex items-center bg-slate-50 border-2 rounded-2xl transition-all ${
              errors.email ? 'border-red-400 bg-red-50/30' : 'border-slate-50 focus-within:border-[#00459a] focus-within:bg-white'
            }`}>
              <Mail className={`absolute left-4 ${errors.email ? 'text-red-400' : 'text-slate-300'}`} size={18} />
              <input
                name="email"
                type="text"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-4 bg-transparent outline-none font-semibold text-slate-700 placeholder:text-slate-300 text-sm"
                placeholder="admin@aquacare.com"
              />
            </div>
            {errors.email && (
              <p className="text-[10px] text-red-500 font-bold ml-2 mt-1 italic animate-pulse">
                * {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase ml-1">Mật khẩu</label>
            <div className={`relative flex items-center bg-slate-50 border-2 rounded-2xl transition-all ${
              errors.password ? 'border-red-400 bg-red-50/30' : 'border-slate-50 focus-within:border-[#00459a] focus-within:bg-white'
            }`}>
              <Lock className={`absolute left-4 ${errors.password ? 'text-red-400' : 'text-slate-300'}`} size={18} />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-11 pr-12 py-4 bg-transparent outline-none font-semibold text-slate-700 placeholder:text-slate-300 text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-300 hover:text-[#00459a] p-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex justify-end px-1">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-[10px] font-black text-[#00459a] hover:underline uppercase tracking-tighter"
              >
                Quên mật khẩu?
              </button>
            </div>

            {errors.password && (
              <p className="text-[10px] text-red-500 font-bold ml-2 mt-1 italic animate-pulse">
                * {errors.password}
              </p>
            )}
          </div>

          {/* Hiển thị lỗi chung (Sai tài khoản, chưa duyệt, v.v.) */}
          {generalError && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
              <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
              <p className="text-xs font-bold text-red-600 leading-tight">
                {generalError}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00459a] hover:bg-[#00367a] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                'Đăng nhập ngay'
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="w-full py-4 bg-blue-50 text-[#00459a] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <UserPlus size={18} /> Tạo tài khoản mới
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
