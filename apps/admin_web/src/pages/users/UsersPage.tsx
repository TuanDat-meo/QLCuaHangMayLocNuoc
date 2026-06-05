import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Shield, User as UserIcon, Loader, Smartphone, Globe,
  Search, Edit2, Trash2, X, Check, Key,
  CheckCircle, ChevronDown, Plus, Lock, Filter,
  Mail, Phone, UserCheck, ShieldAlert, Ban, Unlock,
  Activity, Users as UsersIcon, Briefcase, Calculator,
  Layers, Info, Zap, UserPlus, Sparkles, DollarSign, Wallet,
  ShieldCheck, History, MoreHorizontal, TrendingUp, Clock, Eye, EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  approveUser, getAllUsers, adminCreateUser,
  adminUpdateUser, adminDeleteUser, updateUserStatus
} from '../../services/userService';
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  getAllPermissions,
  seedStandardRoles,
  toggleRolePermission
} from '../../services/roleService';
import { AuthUser, UserRole } from '../../types/auth';
import { Role } from '../../types/role';
import toast from 'react-hot-toast';

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  // --- STATES ---
  const [allUsers, setAllUsers] = useState<AuthUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'staff' | 'roles' | 'all'>('staff');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<number | 'all'>('all');

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Khởi tạo form trống
  const initialFormState = {
    email: '',
    password: '',
    displayName: '',
    phoneNumber: '',
    role: 3 as number,
    status: 'active',
    baseSalary: 0,
    commissionPerOrder: 0
  };

  const [userForm, setUserForm] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [roleForm, setRoleForm] = useState({
    name: '', description: '', roleValue: 0, permissions: [] as string[]
  });

  const allPermissions = useMemo(() => getAllPermissions(), []);
  const [pendingRoleValue, setPendingRoleValue] = useState<Record<string, number>>({});

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [uData, rData] = await Promise.all([getAllUsers(), getAllRoles()]);
      setAllUsers(uData);
      setRoles(rData);

      if (selectedRole) {
        const updated = rData.find(r => r.id === selectedRole.id);
        if (updated) setSelectedRole(updated);
      } else if (rData.length > 0) {
        setSelectedRole(rData[0]);
      }
    } catch (err: any) {
      toast.error('Lỗi tải dữ liệu hệ thống!');
    } finally {
      setIsLoading(false);
    }
  }, [selectedRole]);

  useEffect(() => { fetchData(); }, []);

  const dynamicStats = useMemo(() => {
    const active = allUsers.filter(u => u.status === 'active');
    return {
      total: allUsers.length,
      pending: allUsers.filter(u => u.status === 'pending' || Number(u.role) === UserRole.PENDING).length,
      staffCount: active.filter(u => Number(u.role) !== UserRole.CUSTOMER && Number(u.role) !== UserRole.PENDING).length
    };
  }, [allUsers]);

  const filteredUsers = useMemo(() => {
    let result = allUsers;
    result = result.filter(u => u.status !== 'deleted');
    if (activeTab === 'pending') result = result.filter(u => u.status === 'pending' || Number(u.role) === UserRole.PENDING);
    else if (activeTab === 'staff') result = result.filter(u => u.status !== 'pending' && Number(u.role) !== UserRole.CUSTOMER && Number(u.role) !== UserRole.PENDING);

    if (roleFilter !== 'all') result = result.filter(u => Number(u.role) === Number(roleFilter));

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u =>
        (u.displayName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.phoneNumber || '').includes(q)
      );
    }
    return result;
  }, [allUsers, activeTab, roleFilter, searchQuery]);

  // Hàm validate form
  const validateUserForm = () => {
    const errors: Record<string, string> = {};

    if (!userForm.displayName?.trim()) {
      errors.displayName = 'Họ tên không được để trống';
    }

    if (!userForm.phoneNumber?.trim()) {
      errors.phoneNumber = 'Số điện thoại không được để trống';
    } else if (!/^\d{10,11}$/.test(userForm.phoneNumber)) {
      errors.phoneNumber = 'SĐT phải có 10-11 chữ số';
    }

    if (!userForm.email?.trim()) {
      errors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email)) {
      errors.email = 'Email không hợp lệ';
    }

    if (modalMode === 'create') {
      if (!userForm.password) {
        errors.password = 'Mật khẩu không được để trống';
      } else if (userForm.password.length < 6) {
        errors.password = 'Mật khẩu phải từ 6 ký tự';
      }
    }

    if (userForm.baseSalary < 0) {
      errors.baseSalary = 'Lương không hợp lệ';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUserForm()) return;

    setIsActionLoading(true);
    try {
      if (modalMode === 'create') {
        await adminCreateUser(userForm);
      } else if (selectedUser) {
        const updatePayload: any = { uid: selectedUser.uid, ...userForm };
        if (resetPassword) updatePayload.password = userForm.password;
        else delete updatePayload.password;
        await adminUpdateUser(updatePayload);
      }
      toast.success('Thành công!');
      setIsUserModalOpen(false);
      setResetPassword(false);
      fetchData();
    } catch (err: any) { toast.error(err.message || 'Lỗi'); }
    finally { setIsActionLoading(false); }
  };

  const handleToggleStatus = async (user: AuthUser) => {
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    if (window.confirm(`Xác nhận thay đổi trạng thái?`)) {
      try {
        await updateUserStatus(user.uid, newStatus);
        toast.success(`Đã cập nhật`);
        fetchData();
      } catch (err) { toast.error('Lỗi'); }
    }
  };

  const handleDeleteUser = async (user: AuthUser) => {
    if (window.confirm(`Xóa tài khoản ${user.displayName || user.email}?`)) {
      try {
        await updateUserStatus(user.uid, 'deleted');
        toast.success('Đã xóa');
        fetchData();
      } catch (err) { toast.error('Lỗi'); }
    }
  };

  const handleApprove = async (uid: string) => {
    const role = pendingRoleValue[uid] || 3;
    setIsActionLoading(true);
    try {
      await approveUser(uid, Number(role));
      toast.success('Đã duyệt!');
      fetchData();
    } catch (err) { toast.error('Lỗi'); }
    finally { setIsActionLoading(false); }
  };

  const handleSeedRoles = async () => {
    if (window.confirm('Khởi tạo bộ vai trò chuẩn?')) {
      setIsActionLoading(true);
      try {
        await seedStandardRoles();
        toast.success('Thành công!');
        fetchData();
      } catch (err) { toast.error('Lỗi'); }
      finally { setIsActionLoading(false); }
    }
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      if (modalMode === 'create') await createRole(roleForm);
      else if (selectedRole) await updateRole(selectedRole.id, roleForm);
      toast.success('Đã lưu!');
      setIsRoleModalOpen(false);
      fetchData();
    } catch (err: any) { toast.error('Lỗi'); }
    finally { setIsActionLoading(false); }
  };

  const handleQuickTogglePermission = async (roleId: string, permissionId: string, hasPermission: boolean) => {
    try {
      await toggleRolePermission(roleId, permissionId, hasPermission);
      setRoles(prev => prev.map(r => {
        if (r.id === roleId) {
          const newPerms = hasPermission ? r.permissions.filter(p => p !== permissionId) : [...r.permissions, permissionId];
          return { ...r, permissions: newPerms };
        }
        return r;
      }));
      fetchData();
      toast.success('Đã cập nhật');
    } catch (err) { toast.error('Lỗi'); }
  };

  const getRoleName = (val: any) => {
    const roleVal = Number(val);
    const found = roles.find(r => Number(r.roleValue) === roleVal);
    if (found) return found.name;
    const systemRoles: Record<number, string> = { 1: 'Quản trị', 2: 'Điều phối', 3: 'Nhân viên', 4: 'Kỹ thuật', 5: 'Khách hàng', 6: 'Kế toán' };
    return systemRoles[roleVal] || `Vai trò ${roleVal}`;
  };

  const getRoleIcon = (val: any) => {
    const roleVal = Number(val);
    switch(roleVal) {
      case 1: return <Shield size={14} className="text-rose-500" />;
      case 4: return <Zap size={14} className="text-amber-500" />;
      case 2: return <Briefcase size={14} className="text-blue-500" />;
      case 3: return <UserCheck size={14} className="text-emerald-500" />;
      case 6: return <Calculator size={14} className="text-purple-500" />;
      default: return <UserIcon size={14} className="text-slate-400" />;
    }
  };

  // Mở modal thêm mới với form trống
  const openCreateModal = () => {
    setModalMode('create');
    setUserForm(initialFormState);
    setFormErrors({});
    setIsUserModalOpen(true);
  };

  // Mở modal sửa với dữ liệu có sẵn
  const openEditModal = (user: AuthUser) => {
    setSelectedUser(user);
    setUserForm({
      email: user.email,
      displayName: user.displayName || '',
      phoneNumber: user.phoneNumber || '',
      role: Number(user.role || 3),
      baseSalary: user.baseSalary || 0,
      commissionPerOrder: user.commissionPerOrder || 0,
      password: '',
      status: user.status || 'active'
    });
    setFormErrors({});
    setModalMode('edit');
    setIsUserModalOpen(true);
  };

  return (
    <div className="w-full transition-all font-sans overflow-x-hidden p-2 md:p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-black text-[#0b1c30] dark:text-white uppercase tracking-tight flex items-center gap-2">
            <div className="p-2 bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
               <ShieldCheck className="text-[#00459a]" size={20} />
            </div>
            Quản trị Nhân sự
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input
              type="text" placeholder="Tìm kiếm..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
            />
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#00459a] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg"
          >
            <UserPlus size={16} /> Thêm nhân sự
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex bg-white dark:bg-[#1e293b] rounded-xl p-1 shadow-sm border border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
          {['staff', 'pending', 'roles', 'all'].map(t => (
            <button
              key={t} onClick={() => setActiveTab(t as any)}
              className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase transition-all whitespace-nowrap ${activeTab === t ? 'bg-[#0b1c30] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {t === 'staff' ? 'Hoạt động' : t === 'pending' ? `Duyệt (${dynamicStats.pending})` : t === 'roles' ? 'Quyền' : 'Tất cả'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Area */}
      <div className="w-full">
        {activeTab !== 'roles' ? (
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden w-full transition-all relative">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-auto min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-2 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Nhân viên</th>
                    <th className="px-2 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Liên hệ</th>
                    <th className="px-2 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Vai trò</th>
                    <th className="px-2 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Lương/Thưởng</th>
                    <th className="px-2 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Nguồn</th>
                    <th className="px-2 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Trạng thái</th>
                    <th className="sticky right-0 z-10 px-2 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right bg-slate-50 dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={7} className="py-10 text-center text-slate-300 font-black uppercase text-[10px]">Trống</td></tr>
                  ) : filteredUsers.map(user => (
                    <tr key={user.uid} className={`hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors group ${user.status === 'blocked' ? 'opacity-60 bg-rose-50/5' : ''}`}>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2 min-w-[140px]">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs bg-slate-100 dark:bg-slate-800 text-[#00459a] border border-slate-200 dark:border-slate-700 shrink-0">
                            {(user.displayName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-[#0b1c30] dark:text-white uppercase text-[10px] break-words line-clamp-2 leading-tight">{user.displayName || '---'}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase">UID: {user.uid.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <div className="text-left space-y-0.5 min-w-[140px]">
                          <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 break-all leading-tight">{user.email}</p>
                          <p className="text-[9px] font-medium text-slate-400 break-all">{user.phoneNumber || '---'}</p>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-1.5 min-w-[100px]">
                          <div className="shrink-0">{getRoleIcon(user.role)}</div>
                          <span className="text-[9px] font-black uppercase text-slate-700 dark:text-slate-300 break-words leading-tight">{getRoleName(user.role)}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                         <div className="text-left min-w-[110px]">
                            <p className="text-[9px] font-black text-slate-700 dark:text-slate-300">{user.baseSalary?.toLocaleString()}đ</p>
                            <p className="text-[8px] font-bold text-slate-400">+{user.commissionPerOrder?.toLocaleString()}đ/đơn</p>
                         </div>
                      </td>
                      <td className="px-2 py-3 text-center">
                         <div className="flex flex-col items-center">
                            {user.source === 'admin_web' ? <Globe size={12} className="text-blue-500" /> : <Smartphone size={12} className="text-emerald-500" />}
                            <span className="text-[8px] font-black text-slate-400 uppercase">{user.source === 'admin_web' ? 'Website' : 'Ứng dụng'}</span>
                         </div>
                      </td>
                      <td className="px-2 py-3 text-center">
                         <span className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                           user.status === 'active'
                             ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                             : user.status === 'pending'
                               ? 'bg-amber-50 text-amber-600 border border-amber-100'
                               : 'bg-rose-50 text-rose-600 border border-rose-100'
                         }`}>
                            {user.status === 'active' ? 'Hoạt động' : user.status === 'pending' ? 'Chờ duyệt' : 'Bị khóa'}
                         </span>
                      </td>
                      <td className="sticky right-0 z-10 px-2 py-3 text-right bg-white dark:bg-[#1e293b] border-l border-slate-50 dark:border-slate-800 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)]">
                         <div className="flex items-center justify-end gap-1">
                            {user.status === 'pending' ? (
                              <button onClick={() => handleApprove(user.uid)} className="p-1.5 bg-[#0b1c30] text-white rounded-lg" title="Duyệt"><Check size={14} /></button>
                            ) : (
                              <>
                                 <button onClick={() => navigate(`/audit-logs?email=${user.email}`)} className="p-1.5 text-slate-400 hover:text-amber-600" title="Log"><History size={14} /></button>
                                 <button onClick={() => openEditModal(user)} className="p-1.5 text-slate-400 hover:text-blue-600" title="Sửa"><Edit2 size={14} /></button>
                                 <button onClick={() => handleToggleStatus(user)} className={`p-1.5 ${user.status === 'active' ? 'text-rose-400' : 'text-emerald-400'}`} title="Khóa/Mở">
                                    {user.status === 'active' ? <Ban size={14} /> : <Unlock size={14} />}
                                 </button>
                                 <button onClick={() => handleDeleteUser(user)} className="p-1.5 text-slate-400 hover:text-rose-600" title="Xóa"><Trash2 size={14} /></button>
                              </>
                            )}
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-[#1e293b] rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
             <Layers size={40} className="text-slate-100 mx-auto mb-4" />
             <p className="text-xs font-bold text-slate-300 uppercase">Vui lòng chọn vai trò để quản lý</p>
          </div>
        )}
      </div>

      {/* Modal - Đã thêm Validation và Báo lỗi bên dưới ô */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-lg font-black text-[#0b1c30] dark:text-white uppercase tracking-tighter">
                 {modalMode === 'create' ? 'Cấp tài khoản mới' : 'Cập nhật tài khoản'}
               </h2>
               <button onClick={() => setIsUserModalOpen(false)} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleUserSubmit} className="space-y-4" noValidate>
              {/* Ô Họ Tên */}
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="HỌ TÊN NHÂN VIÊN"
                  value={userForm.displayName}
                  onChange={e => {
                    setUserForm({ ...userForm, displayName: e.target.value });
                    if (formErrors.displayName) setFormErrors({ ...formErrors, displayName: '' });
                  }}
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl outline-none font-bold text-xs border transition-all ${formErrors.displayName ? 'border-rose-500' : 'border-transparent focus:border-[#00459a]'}`}
                />
                {formErrors.displayName && <p className="text-[10px] text-rose-500 font-bold px-2 uppercase">{formErrors.displayName}</p>}
              </div>

              {/* Ô Số Điện Thoại */}
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="SỐ ĐIỆN THOẠI"
                  value={userForm.phoneNumber}
                  onChange={e => {
                    setUserForm({ ...userForm, phoneNumber: e.target.value });
                    if (formErrors.phoneNumber) setFormErrors({ ...formErrors, phoneNumber: '' });
                  }}
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl outline-none font-bold text-xs border transition-all ${formErrors.phoneNumber ? 'border-rose-500' : 'border-transparent focus:border-[#00459a]'}`}
                />
                {formErrors.phoneNumber && <p className="text-[10px] text-rose-500 font-bold px-2 uppercase">{formErrors.phoneNumber}</p>}
              </div>

              {/* Ô Email */}
              <div className="space-y-1">
                <input
                  disabled={modalMode === 'edit'}
                  type="email"
                  placeholder="ĐỊA CHỈ EMAIL"
                  value={userForm.email}
                  onChange={e => {
                    setUserForm({ ...userForm, email: e.target.value });
                    if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                  }}
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl outline-none font-bold text-xs border transition-all disabled:opacity-50 ${formErrors.email ? 'border-rose-500' : 'border-transparent focus:border-[#00459a]'}`}
                />
                {formErrors.email && <p className="text-[10px] text-rose-500 font-bold px-2 uppercase">{formErrors.email}</p>}
              </div>

              {/* Ô Mật Khẩu (Chỉ khi tạo mới) */}
              {modalMode === 'create' && (
                <div className="space-y-1">
                  <input
                    type="password"
                    placeholder="MẬT KHẨU ĐĂNG NHẬP"
                    value={userForm.password}
                    onChange={e => {
                      setUserForm({ ...userForm, password: e.target.value });
                      if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
                    }}
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl outline-none font-bold text-xs border transition-all ${formErrors.password ? 'border-rose-500' : 'border-transparent focus:border-[#00459a]'}`}
                  />
                  {formErrors.password && <p className="text-[10px] text-rose-500 font-bold px-2 uppercase">{formErrors.password}</p>}
                </div>
              )}

              {/* Ô Lương và Hoa Hồng */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Lương cơ bản</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={userForm.baseSalary}
                    onChange={e => setUserForm({ ...userForm, baseSalary: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl outline-none font-bold text-xs border border-transparent focus:border-[#00459a]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Hoa hồng/Đơn</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={userForm.commissionPerOrder}
                    onChange={e => setUserForm({ ...userForm, commissionPerOrder: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl outline-none font-bold text-xs border border-transparent focus:border-[#00459a]"
                  />
                </div>
              </div>

              {/* Ô Vai Trò */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Vai trò hệ thống</label>
                <select
                  value={userForm.role}
                  onChange={e => setUserForm({ ...userForm, role: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-blue-50 dark:bg-slate-900 rounded-xl font-bold text-xs outline-none border border-transparent focus:border-[#00459a]"
                >
                  {roles.map(r => <option key={r.id} value={r.roleValue}>{r.name}</option>)}
                </select>
              </div>

              <button
                type="submit"
                disabled={isActionLoading}
                className="w-full py-4 bg-[#00459a] text-white rounded-xl font-black uppercase text-xs shadow-lg hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isActionLoading ? 'ĐANG XỬ LÝ...' : modalMode === 'create' ? 'TẠO TÀI KHOẢN NGAY' : 'LƯU THAY ĐỔI'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
