import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Shield, Calendar, Smartphone,
  Camera, Lock, CheckCircle2,
  Loader, ArrowRight, Edit3
} from 'lucide-react';
import { useAuth } from '../../hooks';
import { UserRole } from '../../types/auth';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Đã cập nhật hồ sơ!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error('Lỗi hệ thống');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = (role: UserRole | null) => {
    switch (role) {
      case UserRole.ADMIN: return 'Quản trị viên';
      case UserRole.MANAGER: return 'Quản lý';
      default: return 'Nhân viên';
    }
  };

  if (!user) return null;

  return (
    <div className="p-4 md:p-10 max-w-xl mx-auto min-h-screen text-left bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#0b1c30] dark:text-white tracking-tight uppercase">Hồ sơ cá nhân</h1>
        <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Quản lý tài khoản hệ thống chuyên nghiệp</p>
      </div>

      <div className="space-y-6">
        {/* Avatar Card */}
        <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-6 transition-colors">
          <div className="relative">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center text-[#00459a] dark:text-blue-400 text-4xl font-black shadow-inner overflow-hidden border-4 border-white dark:border-slate-800">
              {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" /> : user.displayName?.charAt(0).toUpperCase()}
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#00459a] dark:bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800 cursor-pointer hover:scale-110 transition-transform">
              <Camera size={14} />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-[#0b1c30] dark:text-white uppercase tracking-tight truncate">{user.displayName}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-[#00459a] dark:text-blue-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100/50 dark:border-blue-800/50">
                <Shield size={12} strokeWidth={3} /> {getRoleLabel(user.role)}
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black text-[9px] uppercase bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-100/50 dark:border-emerald-800/50">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Trực tuyến
              </span>
            </div>
          </div>
        </div>

        {/* Info Form Card */}
        <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Thông tin chi tiết</h3>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-[#00459a] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest">
                <Edit3 size={16} /> Chỉnh sửa
              </button>
            )}
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Họ và tên</label>
                <div className={`flex items-center rounded-2xl border-2 px-4 py-3.5 transition-all ${isEditing ? 'border-[#00459a] dark:border-blue-500 bg-white dark:bg-slate-900 shadow-sm' : 'border-transparent bg-slate-50 dark:bg-slate-900/50'}`}>
                  <User size={18} className={isEditing ? 'text-[#00459a] dark:text-blue-400' : 'text-slate-300 dark:text-slate-700'} />
                  <input disabled={!isEditing} type="text" value={formData.displayName} onChange={(e) => setFormData({...formData, displayName: e.target.value})} className="w-full ml-3 bg-transparent outline-none font-bold text-slate-700 dark:text-white text-sm disabled:text-slate-400 dark:disabled:text-slate-600" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Số điện thoại</label>
                <div className={`flex items-center rounded-2xl border-2 px-4 py-3.5 transition-all ${isEditing ? 'border-[#00459a] dark:border-blue-500 bg-white dark:bg-slate-900 shadow-sm' : 'border-transparent bg-slate-50 dark:bg-slate-900/50'}`}>
                  <Phone size={18} className={isEditing ? 'text-[#00459a] dark:text-blue-400' : 'text-slate-300 dark:text-slate-700'} />
                  <input disabled={!isEditing} type="tel" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} className="w-full ml-3 bg-transparent outline-none font-bold text-slate-700 dark:text-white text-sm disabled:text-slate-400 dark:disabled:text-slate-600" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Địa chỉ Email</label>
                <div className="flex items-center rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 px-4 py-3.5 opacity-70">
                  <Mail size={18} className="text-slate-300 dark:text-slate-700" />
                  <input disabled type="email" value={user.email} className="w-full ml-3 bg-transparent outline-none font-bold text-slate-400 dark:text-slate-600 text-sm cursor-not-allowed" />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="pt-4 flex gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Hủy bỏ</button>
                <button type="submit" disabled={isLoading} className="flex-[2] py-4 bg-[#00459a] dark:bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                  {isLoading ? <Loader className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} Cập nhật hồ sơ
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Bottom Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-[#0b1c30] dark:bg-[#1e293b] rounded-[2rem] p-6 text-white border border-transparent dark:border-slate-800 flex flex-col justify-between min-h-[140px] shadow-lg shadow-slate-900/20">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lock size={16} className="text-blue-400" />
                <h3 className="text-[11px] font-black uppercase tracking-widest">Bảo mật hệ thống</h3>
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed mb-4">Chúng tôi khuyến nghị thay đổi mật khẩu định kỳ 6 tháng một lần.</p>
            </div>
            <button className="w-full py-3 bg-white/10 dark:bg-blue-600/20 hover:bg-white dark:hover:bg-blue-600 text-white hover:text-[#0b1c30] rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 active:scale-95">
              Thay đổi mật khẩu <ArrowRight size={12} />
            </button>
          </div>

          <div className="bg-white dark:bg-[#1e293b] rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between min-h-[140px] transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-sm border border-emerald-100/50 dark:border-emerald-800/50">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Ngày gia nhập</p>
                <p className="text-sm font-black text-[#0b1c30] dark:text-white uppercase">
                  {user.createdAt ? (user.createdAt instanceof Date ? user.createdAt : (user.createdAt as any).toDate?.() || new Date(user.createdAt)).toLocaleDateString('vi-VN') : '---'}
                </p>
              </div>
            </div>
            <div className="text-[9px] font-black text-slate-300 dark:text-slate-700 italic tracking-widest mt-4">SYSTEM ID: #{user.uid?.substring(0, 12).toUpperCase()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
