/**
 * Forgot Password Page - Admin Web
 * Optimized UI for AquaCare System
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Loader, ArrowLeft, CheckCircle2, KeyRound, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForgotPassword } from '../../hooks';
import { validateEmail } from '../../utils/validation';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { sendReset, isLoading, success } = useForgotPassword();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }

    try {
      await sendReset(email);
      toast.success('Email hướng dẫn đã được gửi!');
    } catch (error: any) {
      toast.error(error.message || 'Gửi yêu cầu thất bại');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-10 border border-slate-100 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-emerald-50/50">
            <CheckCircle2 className="text-emerald-500" size={48} />
          </div>

          <h2 className="text-3xl font-black text-[#0b1c30] tracking-tight mb-3">Kiểm tra Email</h2>
          <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
            Chúng tôi đã gửi link đặt lại mật khẩu tới <br />
            <span className="font-bold text-[#00459a] text-base">{email}</span>
          </p>

          <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Hướng dẫn tiếp theo:</h3>
            <ul className="text-[13px] text-slate-600 space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-[#00459a] flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">1</div>
                <span>Mở hộp thư đến (kiểm tra cả mục <b>Spam</b>)</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-[#00459a] flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">2</div>
                <span>Nhấn vào nút <b>"Reset Password"</b> trong mail</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-[#00459a] flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">3</div>
                <span>Tạo mật khẩu mới và đăng nhập lại</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="w-full bg-[#0b1c30] hover:bg-[#1a2e44] text-white py-4.5 rounded-2xl font-bold text-sm tracking-wide transition-all active:scale-[0.98] shadow-lg"
          >
            QUAY LẠI ĐĂNG NHẬP
          </button>

          <p className="mt-8 text-xs font-semibold text-slate-400">
            Không nhận được email?{' '}
            <button onClick={() => window.location.reload()} className="text-[#00459a] hover:underline font-bold">Thử lại</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-[0_25px_60px_rgba(0,0,0,0.04)] p-12 border border-slate-100 relative overflow-hidden">
        {/* Decorative Background Blob */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50" />

        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-slate-400 hover:text-[#00459a] font-bold mb-10 transition-colors group relative z-10"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs uppercase tracking-widest">Trở về</span>
        </button>

        <div className="text-center mb-12 relative z-10">
          <div className="w-20 h-20 bg-[#00459a]/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 rotate-3">
            <KeyRound className="text-[#00459a]" size={36} />
          </div>
          <h1 className="text-3xl font-black text-[#0b1c30] tracking-tight mb-2">Quên mật khẩu?</h1>
          <p className="text-slate-400 text-sm font-medium px-4">Đừng lo lắng, hãy nhập email của bạn để lấy lại quyền truy cập</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-[0.15em]">Email quản trị</label>
            <div className={`relative flex items-center bg-slate-50 border-2 rounded-[1.25rem] transition-all duration-300 ${
              emailError ? 'border-red-200 bg-red-50/30' : 'border-slate-50 focus-within:border-[#00459a] focus-within:bg-white focus-within:shadow-sm'
            }`}>
              <Mail className={`absolute left-5 ${emailError ? 'text-red-400' : 'text-slate-300'}`} size={20} />
              <input
                type="email"
                value={email}
                onChange={handleChange}
                className="w-full pl-14 pr-6 py-5 bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-300 text-sm"
                placeholder="admin@aquacare.com"
              />
            </div>
            {emailError && (
              <p className="text-[10px] text-red-500 font-bold ml-4 mt-1 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" /> {emailError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#00459a] hover:bg-[#00367a] text-white py-5 rounded-[1.25rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-60"
          >
            {isLoading ? <Loader className="animate-spin" size={20} /> : 'Gửi mã xác thực'}
          </button>
        </form>

        <div className="mt-12 p-5 bg-blue-50/40 rounded-2xl border border-blue-100/50 flex gap-3 relative z-10">
          <Info className="text-blue-400 shrink-0" size={18} />
          <p className="text-[11px] text-blue-800/70 leading-relaxed font-semibold italic">
            Mã khôi phục sẽ có hiệu lực trong <b>5 phút</b>. Vui lòng kiểm tra kỹ hòm thư của bạn.
          </p>
        </div>
      </div>

      <p className="mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
        AquaCare System © 2024
      </p>
    </div>
  );
};

export default ForgotPasswordPage;
