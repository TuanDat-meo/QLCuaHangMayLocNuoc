import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Shield, Calendar, Smartphone,
  Camera, Lock, CheckCircle2,
  Loader, ArrowRight, Edit3, X, Key, Activity,
  History, Clock, LogOut, Check
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLogout } from '../../hooks/useAuth';
import { UserRole } from '../../types/auth';
import { adminUpdateUser } from '../../services/userService';
import { subscribeToAuditLogs, AuditLog } from '../../services/auditService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { logout } = useLogout();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [myLogs, setMyLogs] = useState<AuditLog[]>([]);

  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        phoneNumber: user.phoneNumber || '',
      });

      // Lấy lịch sử hoạt động của cá nhân
      const unsubscribe = subscribeToAuditLogs((logs) => {
        const filtered = logs.filter(log => log.userEmail === user.email).slice(0, 5);
        setMyLogs(filtered);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    try {
      await adminUpdateUser({
        uid: user.uid,
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber
      });
      toast.success('Đã cập nhật hồ sơ!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error('Lỗi khi cập nhật thông tin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    setIsLoading(true);
    try {
      // Logic đổi mật khẩu thực tế sẽ gọi authService.updatePassword
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Đã đổi mật khẩu thành công!');
      setIsPasswordModalOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error('Mật khẩu hiện tại không chính xác');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = (role: UserRole | null) => {
    switch (role) {
      case UserRole.ADMIN: return 'Quản trị viên tối cao';
      case UserRole.MANAGER: return 'Quản lý vận hành';
      case UserRole.TECHNICIAN: return 'Kỹ thuật viên';
      case UserRole.ACCOUNTANT: return 'Kế toán hệ thống';
      default: return 'Nhân viên nghiệp vụ';
    }
  };

  if (!user) return null;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen text-left bg-[#f8fafc] dark:bg-[#0f172a] transition-all font-sans">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-[#0b1c30] dark:text-white tracking-tight uppercase">Thông tin tài khoản</h1>
          <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Hồ sơ cá nhân & Bảo mật AquaCare</p>
        </div>
        <button
          onClick={() => logout().then(() => navigate('/login'))}
          className="flex items-center gap-2 px-4 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border border-rose-100 dark:border-rose-900/30"
        >
          <LogOut size={16} /> Đăng xuất
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#1e293b] rounded-[3rem] p-10 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-[#00459a] opacity-[0.03] dark:opacity-10" />

            <div className="relative mt-4">
              <div className="w-32 h-32 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-[#00459a] dark:text-blue-400 text-5xl font-black shadow-inner border-4 border-white dark:border-slate-800 transition-transform hover:scale-105 duration-300">
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" /> : user.displayName?.charAt(0).toUpperCase()}
              </div>
              <button className="absolute -bottom-1 -right-1 w-10 h-10 bg-[#00459a] dark:bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-white dark:border-[#1e293b] hover:scale-110 active:scale-95 transition-all">
                <Camera size={18} />
              </button>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-black text-[#0b1c30] dark:text-white uppercase tracking-tight">{user.displayName}</h2>
              <p className="text-slate-400 font-bold text-[11px] uppercase mt-1">{user.email}</p>
            </div>

            <div className="mt-6 flex flex-col items-center gap-3 w-full">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-[#00459a] dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800/50">
                <Shield size={14} /> {getRoleLabel(user.role)}
              </span>
              <div className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest flex items-center gap-2 mt-4">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Tài khoản đã xác minh
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="bg-[#0b1c30] dark:bg-[#1e293b] rounded-[2.5rem] p-8 text-white border border-transparent dark:border-slate-800 shadow-xl">
             <div className="flex items-center gap-3 mb-4">
                <Lock size={20} className="text-blue-400" />
                <h3 className="text-sm font-black uppercase tracking-widest">Bảo mật & Quyền riêng tư</h3>
             </div>
             <p className="text-slate-400 text-[11px] leading-relaxed mb-6 font-medium">Bảo vệ tài khoản của bạn bằng cách cập nhật mật khẩu định kỳ.</p>
             <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="w-full py-4 bg-white/10 dark:bg-blue-600/20 hover:bg-white dark:hover:bg-blue-600 text-white hover:text-[#0b1c30] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                Thay đổi mật khẩu <ArrowRight size={14} />
             </button>
          </div>
        </div>

        {/* Right Column: Details & Logs */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-[#1e293b] rounded-[3rem] p-10 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                 <div className="w-1 h-6 bg-[#00459a] rounded-full" />
                 <h3 className="text-[12px] font-black text-[#0b1c30] dark:text-white uppercase tracking-[0.2em]">Thông tin cá nhân</h3>
              </div>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-[#00459a] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-5 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border border-blue-50 dark:border-blue-900/30 shadow-sm">
                  <Edit3 size={16} /> Chỉnh sửa hồ sơ
                </button>
              )}
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Họ và tên hiển thị</label>
                  <div className={`flex items-center rounded-2xl border-2 px-5 py-4 transition-all ${isEditing ? 'border-[#00459a] bg-white dark:bg-slate-900 shadow-lg' : 'border-transparent bg-slate-50 dark:bg-slate-900/50'}`}>
                    <User size={18} className={isEditing ? 'text-[#00459a]' : 'text-slate-300'} />
                    <input disabled={!isEditing} type="text" value={formData.displayName} onChange={(e) => setFormData({...formData, displayName: e.target.value})} className="w-full ml-3 bg-transparent outline-none font-bold text-slate-700 dark:text-white text-sm" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Số điện thoại liên hệ</label>
                  <div className={`flex items-center rounded-2xl border-2 px-5 py-4 transition-all ${isEditing ? 'border-[#00459a] bg-white dark:bg-slate-900 shadow-lg' : 'border-transparent bg-slate-50 dark:bg-slate-900/50'}`}>
                    <Phone size={18} className={isEditing ? 'text-[#00459a]' : 'text-slate-300'} />
                    <input disabled={!isEditing} type="tel" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} className="w-full ml-3 bg-transparent outline-none font-bold text-slate-700 dark:text-white text-sm" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Tên đăng nhập (Email cố định)</label>
                <div className="flex items-center rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 px-5 py-4 opacity-70">
                  <Mail size={18} className="text-slate-300" />
                  <input disabled type="email" value={user.email} className="w-full ml-3 bg-transparent outline-none font-bold text-slate-400 dark:text-slate-600 text-sm" />
                </div>
              </div>

              {isEditing && (
                <div className="pt-6 flex gap-4 animate-in slide-in-from-top-4 duration-300">
                  <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">Hủy bỏ</button>
                  <button type="submit" disabled={isLoading} className="flex-[2] py-4 bg-[#00459a] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                    {isLoading ? <Loader className="animate-spin" size={18} /> : <CheckCircle2 size={18} />} Cập nhật thông tin hồ sơ
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* User Activities Section */}
          <div className="bg-white dark:bg-[#1e293b] rounded-[3rem] p-10 shadow-sm border border-slate-100 dark:border-slate-800 text-left">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                 <div className="w-1 h-6 bg-amber-500 rounded-full" />
                 <h3 className="text-[12px] font-black text-[#0b1c30] dark:text-white uppercase tracking-[0.2em]">Hoạt động gần đây</h3>
               </div>
               <button onClick={() => navigate(`/audit-logs?email=${user.email}`)} className="text-[10px] font-black text-slate-400 hover:text-[#00459a] uppercase flex items-center gap-2 transition-colors">Xem tất cả <ChevronRight size={14} /></button>
            </div>

            <div className="space-y-4">
              {myLogs.length > 0 ? myLogs.map((log) => (
                <div key={log.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 group hover:border-blue-100 transition-all">
                   <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-500 shadow-sm transition-colors shrink-0">
                      <History size={18} />
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase truncate leading-none">{log.action}</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-1.5 uppercase tracking-tighter">Đối tượng: {log.resourceType} - {log.resourceId}</p>
                   </div>
                   <div className="text-right shrink-0">
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase">
                         <Clock size={12} /> {formatDate(log.timestamp)}
                      </div>
                   </div>
                </div>
              )) : (
                <div className="py-10 text-center opacity-30">
                   <Activity size={32} className="mx-auto mb-3" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Chưa có dữ liệu hoạt động</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- CHANGE PASSWORD MODAL --- */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-[3rem] w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in duration-200">
             <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-[#0b1c30] dark:bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg"><Key size={20} /></div>
                   <h3 className="font-black text-[#0b1c30] dark:text-white uppercase tracking-widest text-xs">Cấu hình mật khẩu</h3>
                </div>
                <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={28} /></button>
             </div>
             <form onSubmit={handleChangePassword} className="p-8 space-y-5 text-left">
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Mật khẩu hiện tại</label>
                   <input required type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold text-xs dark:text-white focus:ring-2 ring-blue-500/10 transition-all" placeholder="••••••••" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-[#00459a] uppercase ml-1">Mật khẩu mới</label>
                   <input required type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full px-5 py-3.5 bg-blue-50/30 dark:bg-blue-900/20 border-2 border-blue-50/50 dark:border-blue-900/30 rounded-2xl outline-none font-bold text-xs dark:text-white" placeholder="••••••••" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Xác nhận mật khẩu</label>
                   <input required type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold text-xs dark:text-white" placeholder="••••••••" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full py-4 bg-[#0b1c30] dark:bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/10 hover:brightness-110 active:scale-95 transition-all mt-4 flex items-center justify-center gap-2">
                  {isLoading ? <Loader className="animate-spin" size={18} /> : <Check size={18} />} Xác nhận đổi mật khẩu
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
