import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Shield, Calendar, Smartphone,
  Camera, Lock, CheckCircle2, AlertCircle,
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
    <div className="p-4 md:p-10 max-w-xl mx-auto min-h-screen text-left">
      <div className="mb-6">
        <h1 className="text-xl font-black text-[#0b1c30] tracking-tight">Hồ sơ cá nhân</h1>
        <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] mt-0.5">Quản lý tài khoản hệ thống</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-[#00459a] text-3xl font-black shadow-inner overflow-hidden border-2 border-white ring-1 ring-slate-100">
              {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.displayName?.charAt(0).toUpperCase()}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#00459a] text-white rounded-lg flex items-center justify-center shadow-md border-2 border-white cursor-pointer">
              <Camera size={12} />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-black text-[#0b1c30] uppercase tracking-tight truncate">{user.displayName}</h2>
            <div className="mt-1 flex gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-[#00459a] rounded-full text-[8px] font-black uppercase tracking-widest border border-blue-100/50">
                <Shield size={10} strokeWidth={3} /> {getRoleLabel(user.role)}
              </span>
              <span className="text-emerald-600 font-black text-[8px] uppercase bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> Trực tuyến
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thông tin liên hệ</h3>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="text-[#00459a] hover:bg-blue-50 p-1.5 rounded-lg transition-colors">
                <Edit3 size={14} />
              </button>
            )}
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Họ và tên</label>
                <div className={`flex items-center rounded-xl border px-3 py-2 transition-all ${isEditing ? 'border-[#00459a] bg-white shadow-sm' : 'border-transparent bg-slate-50'}`}>
                  <User size={14} className={isEditing ? 'text-[#00459a]' : 'text-slate-300'} />
                  <input disabled={!isEditing} type="text" value={formData.displayName} onChange={(e) => setFormData({...formData, displayName: e.target.value})} className="w-full ml-2 bg-transparent outline-none font-bold text-slate-700 disabled:text-slate-400 text-xs" />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Số điện thoại</label>
                <div className={`flex items-center rounded-xl border px-3 py-2 transition-all ${isEditing ? 'border-[#00459a] bg-white shadow-sm' : 'border-transparent bg-slate-50'}`}>
                  <Phone size={14} className={isEditing ? 'text-[#00459a]' : 'text-slate-300'} />
                  <input disabled={!isEditing} type="tel" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} className="w-full ml-2 bg-transparent outline-none font-bold text-slate-700 disabled:text-slate-400 text-xs" />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Email định danh</label>
                <div className="flex items-center rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 opacity-70">
                  <Mail size={14} className="text-slate-300" />
                  <input disabled type="email" value={user.email} className="w-full ml-2 bg-transparent outline-none font-bold text-slate-400 text-xs cursor-not-allowed" />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="pt-2 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-slate-100 text-slate-500 rounded-lg font-black text-[9px] uppercase tracking-widest">Hủy</button>
                <button type="submit" disabled={isLoading} className="flex-[2] py-2 bg-[#00459a] text-white rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-md">
                  {isLoading ? <Loader className="animate-spin" size={12} /> : <CheckCircle2 size={12} />} Cập nhật
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#0b1c30] rounded-2xl p-4 text-white flex flex-col justify-between min-h-[100px]">
            <div className="flex items-center gap-2 mb-1">
              <Lock size={14} className="text-blue-400" />
              <h3 className="text-[10px] font-black uppercase tracking-tight">Bảo mật</h3>
            </div>
            <p className="text-slate-400 text-[8px] leading-tight mb-3">Cập nhật mật khẩu định kỳ.</p>
            <button className="w-full py-1.5 bg-white/10 hover:bg-white text-white hover:text-[#0b1c30] rounded-lg font-black text-[8px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 active:scale-95">
              Đổi mật khẩu <ArrowRight size={10} />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[100px]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                <Calendar size={16} />
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Gia nhập</p>
                <p className="text-xs font-black text-[#0b1c30]">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '---'}</p>
              </div>
            </div>
            <div className="text-[8px] font-bold text-slate-400 italic">ID: #{user.uid?.substring(0, 10).toUpperCase()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
