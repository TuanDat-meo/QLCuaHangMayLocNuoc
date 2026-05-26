import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Shield, User as UserIcon, Loader, Smartphone, Globe,
  AlertCircle, Filter, Users, Calculator, UserPlus,
  Briefcase, Settings, Edit2, Trash2, X, Check, Key,
  CheckCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  approveUser, getAllUsers, adminCreateUser,
  adminUpdateUser, adminDeleteUser
} from '../../services/userService';
import { AuthUser, UserRole } from '../../types/auth';
import toast from 'react-hot-toast';

const UsersPage: React.FC = () => {
  const [allUsers, setAllUsers] = useState<AuthUser[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'staff' | 'all'>('pending');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  // Quản lý dropdown vai trò đang mở cho từng user
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [pendingRoles, setPendingRoles] = useState<Record<string, UserRole>>({});

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    phoneNumber: '',
    role: UserRole.STAFF as UserRole,
    status: 'active' as string,
  });

  const roleOptions = [
    { value: UserRole.STAFF, label: 'Nhân viên', desc: 'Xử lý các tác vụ cơ bản', icon: <UserIcon size={16} />, color: 'bg-slate-100 text-slate-600' },
    { value: UserRole.TECHNICIAN, label: 'Kỹ thuật viên', desc: 'Thi công & bảo trì thiết bị', icon: <Settings size={16} />, color: 'bg-amber-100 text-amber-600' },
    { value: UserRole.ACCOUNTANT, label: 'Kế toán', desc: 'Quản lý thu chi & đơn hàng', icon: <Calculator size={16} />, color: 'bg-emerald-100 text-emerald-600' },
    { value: UserRole.MANAGER, label: 'Quản lý', desc: 'Điều phối nhân sự & khu vực', icon: <Briefcase size={16} />, color: 'bg-indigo-100 text-indigo-600' },
    { value: UserRole.ADMIN, label: 'Admin', desc: 'Toàn quyền quản trị hệ thống', icon: <Shield size={16} />, color: 'bg-red-100 text-red-600' },
  ];

  const fetchUsersData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const all = await getAllUsers();
      setAllUsers(all);

      let displayData: AuthUser[] = [];
      if (activeTab === 'pending') {
        displayData = all.filter(u => u.status !== 'active' || u.role === UserRole.PENDING);
      } else if (activeTab === 'staff') {
        displayData = all.filter(u =>
          u.status === 'active' &&
          u.role !== UserRole.CUSTOMER &&
          u.role !== UserRole.PENDING
        );
      } else {
        displayData = all;
      }
      setUsers(displayData);
    } catch (err: any) {
      console.error("Fetch Users Error:", err);
      setError(err.code === 'permission-denied' ? 'Lỗi quyền Admin (role=1).' : 'Lỗi tải dữ liệu.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchUsersData();
  }, [fetchUsersData]);

  const counts = useMemo(() => ({
    pending: allUsers.filter(u => u.status !== 'active' || u.role === UserRole.PENDING).length,
    staff: allUsers.filter(u => u.status === 'active' && u.role !== UserRole.CUSTOMER && u.role !== UserRole.PENDING).length,
    all: allUsers.length
  }), [allUsers]);

  const handleApprove = async (uid: string) => {
    const role = pendingRoles[uid] || UserRole.STAFF;
    try {
      setIsActionLoading(true);
      await approveUser(uid, role);
      toast.success('Đã kích hoạt tài khoản thành công!');
      fetchUsersData();
    } catch (error) {
      toast.error('Lỗi khi phê duyệt');
    } finally {
      setIsActionLoading(false);
      setOpenDropdownId(null);
    }
  };

  const handleDelete = async (uid: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này? Thao tác này không thể hoàn tác.')) return;
    try {
      setIsActionLoading(true);
      await adminDeleteUser(uid);
      toast.success('Đã xóa người dùng.');
      fetchUsersData();
    } catch (error: any) {
      toast.error('Lỗi: ' + (error.message || 'Không thể xóa'));
    } finally {
      setIsActionLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      email: '',
      password: '',
      displayName: '',
      phoneNumber: '',
      role: UserRole.STAFF,
      status: 'active'
    });
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: AuthUser) => {
    setModalMode('edit');
    setFormData({
      email: user.email,
      password: '',
      displayName: user.displayName,
      phoneNumber: user.phoneNumber || '',
      role: user.role || UserRole.STAFF,
      status: user.status || 'active',
    });
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      if (modalMode === 'create') {
        await adminCreateUser(formData);
        toast.success('Tạo người dùng mới thành công!');
      } else if (selectedUser) {
        const updatePayload: any = {
          uid: selectedUser.uid,
          displayName: formData.displayName,
          phoneNumber: formData.phoneNumber,
          role: formData.role,
          status: formData.status
        };
        if (formData.password) updatePayload.password = formData.password;

        await adminUpdateUser(updatePayload);
        toast.success('Cập nhật thông tin thành công!');
      }
      setIsModalOpen(false);
      fetchUsersData();
    } catch (error: any) {
      toast.error('Lỗi: ' + (error.message || 'Thao tác thất bại'));
    } finally {
      setIsActionLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (roleFilter === 'all') return users;
    return users.filter(user => user.role === roleFilter);
  }, [users, roleFilter]);

  const getRoleLabel = (role: UserRole | null) => {
    switch (role) {
      case UserRole.ADMIN: return 'Admin';
      case UserRole.MANAGER: return 'Quản lý';
      case UserRole.STAFF: return 'Nhân viên';
      case UserRole.TECHNICIAN: return 'Kỹ thuật viên';
      case UserRole.CUSTOMER: return 'Khách hàng';
      case UserRole.ACCOUNTANT: return 'Kế toán';
      default: return 'Chưa duyệt';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'pending': return 'Chờ duyệt';
      case 'blocked': return 'Đã khóa';
      default: return status;
    }
  };

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">{error}</h2>
        <p className="text-slate-500 mb-6">Vui lòng kiểm tra lại quyền hạn của tài khoản.</p>
        <button onClick={fetchUsersData} className="px-6 py-2 bg-[#00459a] text-white rounded-xl font-bold">Thử lại</button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#0b1c30]">Quản lý nhân sự & Thành viên</h1>
          <p className="text-slate-500 font-medium">Phê duyệt và quản lý đội ngũ vận hành AquaCare</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-3 bg-[#00459a] text-white rounded-2xl font-black shadow-lg shadow-blue-900/20 hover:scale-105 transition-all"
          >
            <UserPlus size={20} />
            Thêm nhân viên
          </button>

          <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-100">
            <button
              onClick={() => { setActiveTab('pending'); setRoleFilter('all'); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'pending' ? 'bg-[#00459a] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              Yêu cầu mới ({counts.pending})
            </button>
            <button
              onClick={() => { setActiveTab('staff'); setRoleFilter('all'); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'staff' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              Nhân viên ({counts.staff})
            </button>
            <button
              onClick={() => { setActiveTab('all'); setRoleFilter('all'); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'all' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              Tất cả ({counts.all})
            </button>
          </div>
        </div>
      </div>

      {/* Bộ lọc vai trò */}
      <div className="mb-8 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-slate-500">
          <Filter size={16} /> <span className="text-xs font-black uppercase tracking-widest">Lọc theo:</span>
        </div>
        {[
          { label: 'Admin', role: UserRole.ADMIN, color: 'hover:border-red-500' },
          { label: 'Kỹ thuật viên', role: UserRole.TECHNICIAN, color: 'hover:border-amber-500' },
          { label: 'Kế toán', role: UserRole.ACCOUNTANT, color: 'hover:border-emerald-500' },
          { label: 'Khách hàng', role: UserRole.CUSTOMER, color: 'hover:border-blue-500' },
          { label: 'Quản lý', role: UserRole.MANAGER, color: 'hover:border-indigo-500' },
          { label: 'Nhân viên', role: UserRole.STAFF, color: 'hover:border-slate-500' },
        ].map(btn => (
          <button
            key={btn.label}
            onClick={() => setRoleFilter(roleFilter === btn.role ? 'all' : btn.role)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${roleFilter === btn.role ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-400 ' + btn.color}`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader className="animate-spin text-[#00459a]" size={40} /></div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-100">
          <UserIcon size={40} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-bold text-slate-400">Không có dữ liệu hiển thị</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div key={user.uid} className="bg-white rounded-[2rem] p-6 shadow-xl border border-slate-50 flex flex-col h-full hover:border-[#00459a]/20 transition-all group relative overflow-visible text-left">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#f3f6ff] rounded-xl flex items-center justify-center text-[#00459a] font-black group-hover:rotate-12 transition-transform">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-[#0b1c30] truncate">{user.displayName}</h3>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-tight">
                    {user.source === 'admin_web' ? <Globe size={12} /> : <Smartphone size={12} />}
                    {user.source || 'Hệ thống'}
                  </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => openEditModal(user)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 size={16} />
                   </button>
                   <button onClick={() => handleDelete(user.uid)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                   </button>
                </div>
              </div>

              <div className="space-y-2 mb-6 flex-1 text-sm">
                <div className="flex justify-between"><span className="text-slate-400 font-bold text-[10px]">EMAIL:</span><span className="font-bold truncate ml-2 text-slate-700">{user.email}</span></div>
                <div className="flex justify-between"><span className="text-slate-400 font-bold text-[10px]">SĐT:</span><span className="font-bold text-slate-700">{user.phoneNumber || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400 font-bold text-[10px]">TRẠNG THÁI:</span><span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${user.status === 'active' ? 'bg-green-100 text-green-600' : user.status === 'blocked' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{getStatusLabel(user.status)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400 font-bold text-[10px]">VAI TRÒ:</span><span className="font-black text-[#00459a]">{getRoleLabel(user.role)}</span></div>
              </div>

              {user.status !== 'active' && user.status !== 'blocked' && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex gap-2 relative">
                    <div className="flex-1 relative">
                      <button
                        type="button"
                        onClick={() => setOpenDropdownId(openDropdownId === user.uid ? null : user.uid)}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 flex items-center justify-between hover:border-[#00459a]/30 hover:bg-white transition-all outline-none"
                      >
                        <span className="text-[#00459a] font-black uppercase">
                          {roleOptions.find(r => r.value === (pendingRoles[user.uid] || UserRole.STAFF))?.label}
                        </span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${openDropdownId === user.uid ? 'rotate-180' : ''}`} />
                      </button>

                      {openDropdownId === user.uid && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)}></div>

                          <div className="absolute z-20 bottom-full mb-3 w-48 bg-white/95 backdrop-blur-xl rounded-[1.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="p-1.5 grid grid-cols-1 gap-0.5">
                              {roleOptions.map(option => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => {
                                    setPendingRoles({ ...pendingRoles, [user.uid]: option.value });
                                    setOpenDropdownId(null);
                                  }}
                                  className={`w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-all text-left group ${pendingRoles[user.uid] === option.value ? 'bg-blue-50/50' : ''}`}
                                >
                                  <span className={`text-[11px] font-black uppercase transition-colors ${pendingRoles[user.uid] === option.value ? 'text-[#00459a]' : 'text-slate-600 group-hover:text-[#00459a]'}`}>
                                    {option.label}
                                  </span>
                                  {pendingRoles[user.uid] === option.value && (
                                    <Check size={12} className="text-[#00459a]" strokeWidth={4} />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => handleApprove(user.uid)}
                      disabled={isActionLoading}
                      className="bg-[#00459a] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase hover:bg-[#00367a] active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:scale-100"
                    >
                      {isActionLoading ? <Loader size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                      Duyệt
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-[#0b1c30]">
                  {modalMode === 'create' ? 'Thêm nhân viên mới' : 'Chỉnh sửa thông tin'}
                </h2>
                <p className="text-slate-500 text-sm font-medium">Vui lòng điền đầy đủ các thông tin bên dưới</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white text-slate-400 hover:text-slate-600 rounded-2xl shadow-sm border border-slate-100 transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Họ và tên</label>
                  <input
                    required
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-[#00459a] focus:bg-white outline-none transition-all font-bold text-slate-700"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
                    <input
                      required
                      disabled={modalMode === 'edit'}
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-[#00459a] focus:bg-white outline-none transition-all font-bold text-slate-700 disabled:opacity-50"
                      placeholder="example@gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Số điện thoại</label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-[#00459a] focus:bg-white outline-none transition-all font-bold text-slate-700"
                      placeholder="0987..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vai trò</label>
                    <div className="relative group">
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: Number(e.target.value)})}
                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-[#00459a] focus:bg-white outline-none transition-all font-bold text-slate-700 cursor-pointer appearance-none"
                      >
                        {roleOptions.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:rotate-180 transition-transform duration-300" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Trạng thái</label>
                    <div className="relative group">
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#00459a] focus:bg-white outline-none transition-all font-bold text-slate-700 cursor-pointer appearance-none"
                      >
                        <option value="active">Hoạt động</option>
                        <option value="pending">Chờ duyệt</option>
                        <option value="blocked">Đã khóa</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:rotate-180 transition-transform duration-300" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    {modalMode === 'create' ? 'Mật khẩu' : 'Mật khẩu mới (Để trống nếu không đổi)'}
                  </label>
                  <div className="relative group">
                    <input
                      required={modalMode === 'create'}
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-[#00459a] focus:bg-white outline-none transition-all font-bold text-slate-700 pr-12"
                      placeholder="••••••••"
                    />
                    <Key size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00459a] transition-colors" />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200 transition-all active:scale-95"
                >
                  Hủy bỏ
                </button>
                <button
                  disabled={isActionLoading}
                  type="submit"
                  className="flex-[2] px-6 py-4 bg-[#00459a] text-white rounded-2xl font-black shadow-lg shadow-blue-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isActionLoading ? <Loader size={20} className="animate-spin" /> : (modalMode === 'create' ? <Check size={20} /> : <Settings size={20} />)}
                  {modalMode === 'create' ? 'Tạo tài khoản' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
