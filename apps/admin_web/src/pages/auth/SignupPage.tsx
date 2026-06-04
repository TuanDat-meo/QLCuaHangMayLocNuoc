import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Loader, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSignup } from '../../hooks';
import { validateSignupForm } from '../../utils/validation';
import { createNotification } from '../../services/notificationService';
import { UserRole } from '../../types/auth';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isLoading } = useSignup();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    phoneNumber: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAgreed) {
      toast.error('Vui lòng xác nhận thông tin là chính xác');
      return;
    }

    setErrors({});
    const valErrors = validateSignupForm(
      formData.email,
      formData.password,
      formData.confirmPassword,
      formData.displayName,
      formData.phoneNumber,
      'null'
    );

    if (valErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      valErrors.forEach(err => {
        errorMap[err.field] = err.message;
      });
      if (errorMap.role) delete errorMap.role;

      if (Object.keys(errorMap).length > 0) {
        setErrors(errorMap);
        toast.error('Vui lòng kiểm tra lại các thông tin');
        return;
      }
    }

    try {
      await signup({
        ...formData,
        role: null,
        source: 'admin_web'
      });

      await createNotification({
        title: 'Yêu cầu đăng ký mới',
        message: `Thành viên ${formData.displayName} (${formData.email}) vừa gửi yêu cầu tham gia hệ thống.`,
        type: 'system',
        recipient_role: [UserRole.ADMIN]
      }).catch(err => console.error("Error creating signup notification:", err));

      toast.success('Đăng ký thành công! Vui lòng chờ Admin kích hoạt tài khoản.', {
        duration: 5000,
        icon: '🚀'
      });
      navigate('/login');
    } catch (err: any) {
      console.error("Signup Catch Error:", err);
      toast.error(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-100 relative z-10">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-slate-400 hover:text-[#00459a] font-bold mb-8 transition-colors group cursor-pointer border-none bg-transparent"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Quay lại Đăng nhập</span>
        </button>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-[#0b1c30] tracking-tight">Đăng ký thành viên nội bộ</h1>
          <p className="text-slate-500 mt-2 font-medium">Tài khoản sẽ được phê duyệt bởi Quản trị viên</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Email */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Email công việc</label>
            <div className={`relative flex items-center bg-slate-50 border-2 rounded-2xl transition-all ${
              errors.email ? 'border-red-400 bg-red-50/30' : 'border-slate-50 focus-within:border-[#00459a] focus-within:bg-white'
            }`}>
              <Mail className={`absolute left-4 ${errors.email ? 'text-red-400' : 'text-slate-300'}`} size={18} />
              <input
                name="email"
                type="email"
                autoComplete="username"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-4 bg-transparent outline-none font-semibold text-slate-700 placeholder:text-slate-300 text-sm"
                placeholder="example@aquacare.com"
              />
            </div>
            {errors.email && <p className="text-[10px] text-red-500 font-bold ml-2 mt-1 italic">*{errors.email}</p>}
          </div>

          {/* Họ tên */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Họ và tên</label>
            <div className={`relative flex items-center bg-slate-50 border-2 rounded-2xl transition-all ${
              errors.displayName ? 'border-red-400 bg-red-50/30' : 'border-slate-50 focus-within:border-[#00459a] focus-within:bg-white'
            }`}>
              <User className={`absolute left-4 ${errors.displayName ? 'text-red-400' : 'text-slate-300'}`} size={18} />
              <input
                name="displayName"
                type="text"
                autoComplete="name"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-4 bg-transparent outline-none font-semibold text-slate-700 placeholder:text-slate-300 text-sm"
                placeholder="Nguyễn Văn A"
              />
            </div>
            {errors.displayName && <p className="text-[10px] text-red-500 font-bold ml-2 mt-1 italic">*{errors.displayName}</p>}
          </div>

          {/* Số điện thoại */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Số điện thoại</label>
            <div className={`relative flex items-center bg-slate-50 border-2 rounded-2xl transition-all ${
              errors.phoneNumber ? 'border-red-400 bg-red-50/30' : 'border-slate-50 focus-within:border-[#00459a] focus-within:bg-white'
            }`}>
              <Phone className={`absolute left-4 ${errors.phoneNumber ? 'text-red-400' : 'text-slate-300'}`} size={18} />
              <input
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-4 bg-transparent outline-none font-semibold text-slate-700 placeholder:text-slate-300 text-sm"
                placeholder="098xxx"
              />
            </div>
            {errors.phoneNumber && <p className="text-[10px] text-red-500 font-bold ml-2 mt-1 italic">*{errors.phoneNumber}</p>}
          </div>

          {/* Mật khẩu */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Mật khẩu</label>
            <div className={`relative flex items-center bg-slate-50 border-2 rounded-2xl transition-all ${
              errors.password ? 'border-red-400 bg-red-50/30' : 'border-slate-50 focus-within:border-[#00459a] focus-within:bg-white'
            }`}>
              <Lock className={`absolute left-4 ${errors.password ? 'text-red-400' : 'text-slate-300'}`} size={18} />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-11 pr-12 py-4 bg-transparent outline-none font-semibold text-slate-700 placeholder:text-slate-300 text-sm"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-slate-300 hover:text-[#00459a] p-1 flex items-center justify-center">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-[10px] text-red-500 font-bold ml-2 mt-1 italic">*{errors.password}</p>}
          </div>

          {/* Xác nhận mật khẩu */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Xác nhận mật khẩu</label>
            <div className={`relative flex items-center bg-slate-50 border-2 rounded-2xl transition-all ${
              errors.confirmPassword ? 'border-red-400 bg-red-50/30' : 'border-slate-50 focus-within:border-[#00459a] focus-within:bg-white'
            }`}>
              <Lock className={`absolute left-4 ${errors.confirmPassword ? 'text-red-400' : 'text-slate-300'}`} size={18} />
              <input
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-11 pr-12 py-4 bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-300 text-sm"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 text-slate-300 hover:text-[#00459a] p-1 flex items-center justify-center">
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold ml-2 mt-1 italic">*{errors.confirmPassword}</p>}
          </div>

          {/* Checkbox điều khoản */}
          <div className="md:col-span-2 py-2">
            <label className="flex items-center gap-4 cursor-pointer p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 select-none">
              <input
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="w-6 h-6 rounded-lg accent-[#00459a] cursor-pointer"
              />
              <span className="text-sm font-bold text-slate-600">
                Tôi xác nhận các thông tin trên là chính xác và cam kết tuân thủ quy định bảo mật.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="md:col-span-2 w-full bg-[#00459a] hover:bg-[#00367a] text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <Loader className="animate-spin" size={20} />
            ) : (
              <>
                <CheckCircle2 size={20} />
                <span>Gửi yêu cầu đăng ký</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
