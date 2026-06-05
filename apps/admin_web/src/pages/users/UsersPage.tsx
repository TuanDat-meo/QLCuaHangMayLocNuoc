import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Shield, User as UserIcon, Loader, Smartphone, Globe,
  Search, Edit2, Trash2, X, Check, Key,
  CheckCircle, ChevronDown, Plus, Lock, Filter,
  Mail, Phone, UserCheck, ShieldAlert, Ban, Unlock,
  Activity, Users as UsersIcon, Briefcase, Calculator,
  Layers, Info, Zap, UserPlus, Sparkles, DollarSign, Wallet,
  ShieldCheck, History, MoreHorizontal, TrendingUp, Clock
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
  const [activeTab, setActiveTab] = useState<'pending' | 'staff' | 'roles' | 'all'>('staff');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<number | 'all'>('all');

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const [userForm, setUserForm] = useState({
    email: '', password: '', displayName: '', phoneNumber: '', role: 3 as number, status: 'active',
    baseSalary: 0, commissionPerOrder: 50000
  });
  const [roleForm, setRoleForm] = useState({
    name: '', description: '', roleValue: 0, permissions: [] as string[]
  });

  const allPermissions = useMemo(() => getAllPermissions(), []);
  const [pendingRoleValue, setPendingRoleValue] = useState<Record<string, number>>({});

  // --- DATA FETCHING ---
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

  // --- LOGIC ---
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

  // --- ACTIONS ---
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      if (modalMode === 'create') await adminCreateUser(userForm);
      else if (selectedUser) await adminUpdateUser({ uid: selectedUser.uid, ...userForm });
      toast.success('Cập nhật nhân sự thành công!');
      setIsUserModalOpen(false);
      fetchData();
    } catch (err: any) { toast.error(err.message || 'Lỗi thao tác'); }
    finally { setIsActionLoading(false); }
  };

  const handleToggleStatus = async (user: AuthUser) => {
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    if (window.confirm(`Xác nhận thay đổi trạng thái tài khoản ${user.displayName || 'này'}?`)) {
      try {
        await updateUserStatus(user.uid, newStatus);
        toast.success(`Đã cập nhật trạng thái`);
        fetchData();
      } catch (err) { toast.error('Lỗi'); }
    }
  };

  const handleApprove = async (uid: string) => {
    const role = pendingRoleValue[uid] || 3;
    setIsActionLoading(true);
    try {
      await approveUser(uid, Number(role));
      toast.success('Đã duyệt nhân sự!');
      fetchData();
    } catch (err) { toast.error('Lỗi'); }
    finally { setIsActionLoading(false); }
  };

  const handleSeedRoles = async () => {
    if (window.confirm('Hệ thống sẽ khởi tạo bộ vai trò chuẩn. Bạn có chắc chắn?')) {
      setIsActionLoading(true);
      try {
        await seedStandardRoles();
        toast.success('Đã khởi tạo vai trò chuẩn thành công!');
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
      toast.success('Đã lưu cấu hình vai trò!');
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
      if (selectedRole?.id === roleId) {
        const newPerms = hasPermission ? selectedRole.permissions.filter(p => p !== permissionId) : [...selectedRole.permissions, permissionId];
        setSelectedRole({ ...selectedRole, permissions: newPerms });
      }
      toast.success('Đã cập nhật quyền');
    } catch (err) { toast.error('Lỗi'); }
  };

  const getRoleName = (val: any) => {
    const roleVal = Number(val);
    if (isNaN(roleVal) || roleVal === 0) return 'Chờ duyệt';
    const found = roles.find(r => Number(r.roleValue) === roleVal);
    if (found) return found.name;
    const systemRoles: Record<number, string> = { 1: 'Admin', 2: 'Điều phối', 3: 'Nhân viên', 4: 'Kỹ thuật', 5: 'Khách hàng', 6: 'Kế toán' };
    return systemRoles[roleVal] || `Vai trò ${roleVal}`;
  };

  const getRoleIcon = (val: any) => {
    const roleVal = Number(val);
    switch(roleVal) {
      case 1: return <Shield size={16} className="text-rose-500" />;
      case 4: return <Zap size={16} className="text-amber-500" />;
      case 2: return <Briefcase size={16} className="text-blue-500" />;
      case 3: return <UserCheck size={16} className="text-emerald-500" />;
      case 6: return <Calculator size={16} className="text-purple-500" />;
      default: return <UserIcon size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="w-full transition-all font-sans overflow-x-hidden">
      {/* Header - Stretches full width */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10 w-full">
        <div className="shrink-0">
          <h1 className="text-2xl font-black text-[#0b1c30] dark:text-white uppercase tracking-tight flex items-center gap-3">
            <div className="p-3 bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
               <ShieldCheck className="text-[#00459a]" size={28} />
            </div>
            Quản trị Nhân sự
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs mt-1 uppercase tracking-widest">Phân quyền & Quản lý nhân sự AquaCare</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto xl:flex-1 xl:justify-end">
          <div className="relative w-full xl:max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="text" placeholder="Tìm tên, email, sđt..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl text-[13px] font-bold outline-none shadow-sm focus:ring-2 ring-blue-500/10 transition-all"
            />
          </div>
          <button
            onClick={() => {
              if (activeTab === 'roles') {
                setRoleForm({ name: '', description: '', roleValue: roles.length + 10, permissions: [] });
                setModalMode('create'); setIsRoleModalOpen(true);
              } else {
                setUserForm({ email: '', password: '', displayName: '', phoneNumber: '', role: Number(roles[0]?.roleValue || 3), status: 'active', baseSalary: 0, commissionPerOrder: 50000 });
                setModalMode('create'); setIsUserModalOpen(true);
              }
            }}
            className="flex items-center gap-2 px-8 py-4 bg-[#00459a] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:brightness-110 active:scale-95 transition-all whitespace-nowrap"
          >
            <UserPlus size={20} /> {activeTab === 'roles' ? 'Thêm vai trò' : 'Thêm nhân sự'}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 w-full">
        {[
          { label: 'Tổng nhân sự', value: dynamicStats.total, color: 'text-blue-600', icon: UsersIcon, bg: 'bg-blue-50' },
          { label: 'Đang làm việc', value: dynamicStats.staffCount, color: 'text-emerald-600', icon: UserCheck, bg: 'bg-emerald-50' },
          { label: 'Chờ phê duyệt', value: dynamicStats.pending, color: 'text-amber-600', icon: Clock, bg: 'bg-amber-50' },
          { label: 'Bộ vai trò', value: roles.length, color: 'text-purple-600', icon: ShieldCheck, bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#1e293b] p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
            <div className={`w-14 h-14 ${stat.bg} dark:bg-slate-900/50 rounded-2xl flex items-center justify-center ${stat.color} shadow-inner`}>
              <stat.icon size={26} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color} dark:text-white`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Bars */}
      <div className="flex flex-wrap items-center justify-between gap-6 mb-8 w-full">
        <div className="flex bg-white dark:bg-[#1e293b] rounded-2xl p-1.5 shadow-sm border border-slate-100 dark:border-slate-800 w-fit overflow-x-auto no-scrollbar">
          {[
            { id: 'staff', label: 'Hoạt động' },
            { id: 'pending', label: `Duyệt mới (${dynamicStats.pending})` },
            { id: 'roles', label: 'Vai trò & Quyền' },
            { id: 'all', label: 'Tất cả' }
          ].map(t => (
            <button
              key={t.id} onClick={() => setActiveTab(t.id as any)}
              className={`px-8 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-[#0b1c30] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {activeTab === 'roles' ? (
          <button onClick={handleSeedRoles} className="flex items-center gap-2 px-6 py-3.5 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-all shadow-sm">
             <Sparkles size={16} /> Bộ vai trò chuẩn
          </button>
        ) : (
          <div className="flex items-center gap-3 bg-white dark:bg-[#1e293b] p-1.5 px-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
             <Filter size={14} className="text-slate-300" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-3 border-r border-slate-100 dark:border-slate-800">Lọc vai trò:</span>
             <select
               value={roleFilter}
               onChange={e => setRoleFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
               className="bg-transparent text-[11px] font-black uppercase outline-none text-slate-700 dark:text-white cursor-pointer ml-2"
             >
                <option value="all">Tất cả</option>
                {roles.map(r => <option key={r.id} value={r.roleValue}>{r.name}</option>)}
             </select>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="w-full">
        {activeTab !== 'roles' ? (
          <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden w-full transition-all">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-auto">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Nhân viên</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Thông tin liên hệ</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Vai trò</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Định mức lương</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Nguồn</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Trạng thái</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={7} className="py-24 text-center text-slate-300 font-black uppercase text-xs tracking-widest">Không tìm thấy dữ liệu nhân sự</td></tr>
                  ) : filteredUsers.map(user => (
                    <tr key={user.uid} className={`hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors group ${user.status === 'blocked' ? 'opacity-60 bg-rose-50/5' : ''}`}>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4 text-left">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shadow-inner border bg-slate-100 dark:bg-slate-800 text-[#00459a] border-slate-200 dark:border-slate-700`}>
                            {(user.displayName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-[#0b1c30] dark:text-white uppercase tracking-tight text-sm truncate">{user.displayName || 'Chưa đặt tên'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">UID: {user.uid.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-left space-y-0.5">
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2 whitespace-nowrap"><Mail size={12} className="text-slate-300" /> {user.email}</p>
                          <p className="text-[11px] font-medium text-slate-400 flex items-center gap-2"><Phone size={12} className="text-slate-300" /> {user.phoneNumber || '---'}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2.5 text-left">
                          <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">{getRoleIcon(user.role)}</div>
                          <span className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 tracking-tight whitespace-nowrap">{getRoleName(user.role)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                         <div className="text-left">
                            <p className="text-[11px] font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><Wallet size={12} className="text-emerald-500" /> {user.baseSalary?.toLocaleString()}đ</p>
                            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 mt-0.5 whitespace-nowrap"><TrendingUp size={12} className="text-blue-500" /> +{user.commissionPerOrder?.toLocaleString()}đ/đơn</p>
                         </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                         <div className="flex flex-col items-center gap-0.5">
                            {user.source === 'admin_web' ? <Globe size={14} className="text-blue-500" /> : <Smartphone size={14} className="text-emerald-500" />}
                            <span className="text-[9px] font-black text-slate-400 uppercase whitespace-nowrap">{user.source || 'App KTV'}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                         <span className={`inline-flex px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${user.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                            {user.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                         </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {user.status === 'pending' ? (
                              <button onClick={() => handleApprove(user.uid)} className="p-2.5 bg-[#0b1c30] text-white rounded-xl hover:brightness-110 shadow-lg" title="Duyệt nhân sự"><Check size={18} /></button>
                            ) : (
                              <>
                                 <button onClick={() => navigate(`/audit-logs?email=${user.email}`)} className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all" title="Nhật ký"><History size={18} /></button>
                                 <button onClick={() => { setSelectedUser(user); setUserForm({ ...userForm, email: user.email, displayName: user.displayName || '', phoneNumber: user.phoneNumber || '', role: Number(user.role || 3), baseSalary: user.baseSalary || 0, commissionPerOrder: user.commissionPerOrder || 50000, password: '' }); setModalMode('edit'); setIsUserModalOpen(true); }} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Sửa"><Edit2 size={18} /></button>
                                 <button onClick={() => handleToggleStatus(user)} className={`p-2.5 rounded-xl transition-all ${user.status === 'active' ? 'text-rose-400 hover:text-rose-600 hover:bg-rose-50' : 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50'}`} title={user.status === 'active' ? 'Khóa' : 'Mở'}>
                                    {user.status === 'active' ? <Ban size={18} /> : <Unlock size={18} />}
                                 </button>
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
          <div className="flex flex-col lg:flex-row gap-6 text-left items-start w-full">
            {/* Sidebar danh sách vai trò */}
            <div className="w-full lg:w-72 xl:w-80 shrink-0 space-y-4">
              {roles.length === 0 ? (
                 <div className="bg-white dark:bg-[#1e293b] p-10 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center">
                    <ShieldAlert size={40} className="text-slate-100 mx-auto mb-4" />
                    <p className="text-xs font-bold text-slate-300 uppercase mb-6">Chưa có vai trò</p>
                    <button onClick={handleSeedRoles} className="px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] uppercase">Khởi tạo</button>
                 </div>
              ) : roles.map(role => (
                <div key={role.id} onClick={() => setSelectedRole(role)} className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${selectedRole?.id === role.id ? 'border-[#00459a] bg-blue-50/50 dark:bg-blue-900/10 shadow-lg' : 'border-slate-50 dark:border-slate-800 bg-white dark:bg-[#1e293b] hover:border-slate-200 shadow-sm'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center shadow-inner">
                      {getRoleIcon(role.roleValue)}
                    </div>
                    <h3 className="font-black text-[#0b1c30] dark:text-white uppercase tracking-tight text-xs truncate">{role.name}</h3>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-50 dark:border-slate-800 pt-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {role.roleValue}</p>
                     <button onClick={(e) => { e.stopPropagation(); setRoleForm({ name: role.name, description: role.description, roleValue: Number(role.roleValue), permissions: role.permissions || [] }); setModalMode('edit'); setSelectedRole(role); setIsRoleModalOpen(true); }} className="text-slate-300 hover:text-blue-500 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-lg"><Edit2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Chi tiết quyền hạn */}
            <div className="flex-1 w-full overflow-hidden">
              {selectedRole ? (
                <div className="bg-white dark:bg-[#1e293b] rounded-[3rem] border border-slate-100 dark:border-slate-800 p-8 shadow-xl animate-in fade-in duration-300 w-full">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-8 border-b border-slate-50 dark:border-slate-800">
                    <div className="text-left">
                      <h2 className="text-3xl font-black text-[#0b1c30] dark:text-white uppercase tracking-tighter">{selectedRole.name}</h2>
                      <p className="text-[11px] font-bold text-slate-400 uppercase mt-2 flex items-center gap-2 tracking-widest"><Lock size={14} className="text-[#00459a]" /> Quyền hạn đặc biệt ({(selectedRole.permissions || []).length})</p>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] text-[#00459a] shrink-0 border border-slate-100 dark:border-slate-800 shadow-inner"><ShieldCheck size={36} /></div>
                  </div>

                  <div className="space-y-12">
                    {Object.entries(allPermissions.reduce((acc: any, p) => ({ ...acc, [p.module]: [...(acc[p.module] || []), p] }), {})).map(([module, perms]: any) => (
                      <div key={module}>
                        <div className="flex items-center gap-4 mb-6">
                          <div className="px-5 py-2 bg-[#0b1c30] text-white rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Hệ thống: {module}</div>
                          <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                        </div>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5 text-left">
                          {perms.map((p: any) => {
                            const has = (selectedRole.permissions || []).includes(p.id);
                            return (
                              <button
                                key={p.id} onClick={() => handleQuickTogglePermission(selectedRole.id, p.id, has)}
                                className={`p-6 rounded-2xl border-2 flex items-center justify-between transition-all group ${has ? 'border-[#00459a]/10 bg-blue-50/10' : 'border-slate-50 dark:border-slate-800 bg-slate-50/30 hover:border-blue-100 shadow-sm'}`}
                              >
                                <div className="min-w-0 pr-4 text-left">
                                  <p className={`text-[12px] font-black uppercase truncate ${has ? 'text-[#00459a] dark:text-blue-400' : 'text-slate-400'}`}>{p.name}</p>
                                  <p className="text-[9px] text-slate-400 mt-1 font-bold line-clamp-1">{p.description}</p>
                                </div>
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${has ? 'bg-[#00459a] text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-300'}`}>
                                  {has ? <Check size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[550px] bg-white dark:bg-[#1e293b] rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center p-20 text-center w-full">
                   <Layers size={84} className="text-slate-100 mb-8" />
                   <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Chọn vai trò để quản lý đặc quyền</h3>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS (Optimized for width) --- */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
          <div className="bg-white dark:bg-[#1e293b] rounded-[3rem] w-full max-w-2xl p-10 shadow-2xl animate-in zoom-in duration-200 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-10 text-left">
               <h2 className="text-2xl font-black text-[#0b1c30] dark:text-white uppercase tracking-tight">{modalMode === 'create' ? 'Cấp tài khoản mới' : 'Sửa tài khoản'}</h2>
               <button onClick={() => setIsUserModalOpen(false)} className="text-slate-300 hover:text-rose-500"><X size={32} /></button>
            </div>
            <form onSubmit={handleUserSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Họ tên nhân viên</label>
                  <input required type="text" placeholder="NGUYỄN VĂN A" value={userForm.displayName} onChange={e => setUserForm({ ...userForm, displayName: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-black text-xs uppercase dark:text-white" />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Số điện thoại</label>
                  <input required type="text" placeholder="09xxxxxxxx" value={userForm.phoneNumber} onChange={e => setUserForm({ ...userForm, phoneNumber: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-bold text-xs dark:text-white" />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Email đăng nhập</label>
                  <input required disabled={modalMode === 'edit'} type="email" placeholder="email@aquacare.vn" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-bold text-xs dark:text-white disabled:opacity-50" />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Mật khẩu</label>
                  <input required={modalMode === 'create'} type="password" placeholder="••••••••" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-bold text-xs dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 text-left">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2"><Wallet size={12} className="text-emerald-500" /> Lương cơ bản</label>
                  <input type="number" value={userForm.baseSalary} onChange={e => setUserForm({ ...userForm, baseSalary: Number(e.target.value) })} className="w-full px-6 py-4 bg-white dark:bg-slate-800 border-none rounded-2xl outline-none font-black text-xs dark:text-white shadow-sm" />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2"><TrendingUp size={12} className="text-blue-500" /> Hoa hồng / Đơn</label>
                  <input type="number" value={userForm.commissionPerOrder} onChange={e => setUserForm({ ...userForm, commissionPerOrder: Number(e.target.value) })} className="w-full px-6 py-4 bg-white dark:bg-slate-800 border-none rounded-2xl outline-none font-black text-xs dark:text-white shadow-sm" />
                </div>
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black text-[#00459a] uppercase ml-1 tracking-widest">Vai trò hệ thống</label>
                <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: Number(e.target.value) })} className="w-full px-6 py-4 bg-blue-50 dark:bg-slate-900 border-none rounded-2xl font-black text-[11px] uppercase text-slate-700 dark:text-white outline-none shadow-inner">
                  {roles.map(r => <option key={r.id} value={r.roleValue}>{r.name}</option>)}
                </select>
              </div>
              <button disabled={isActionLoading} type="submit" className="w-full py-5 bg-[#00459a] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 mt-6 flex items-center justify-center gap-3 active:scale-95 transition-all">
                {isActionLoading ? <Loader size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                {modalMode === 'create' ? 'Khởi tạo nhân sự' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
          <div className="bg-white dark:bg-[#1e293b] rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl p-10 border border-slate-100 dark:border-slate-800 text-left">
            <div className="flex justify-between items-center mb-10 shrink-0">
               <h2 className="text-2xl font-black text-[#0b1c30] dark:text-white uppercase tracking-tight">{modalMode === 'create' ? 'Định nghĩa vai trò' : 'Sửa vai trò'}</h2>
               <button onClick={() => setIsRoleModalOpen(false)} className="text-slate-300 hover:text-rose-500"><X size={32} /></button>
            </div>
            <form onSubmit={handleRoleSubmit} className="flex-1 overflow-hidden flex flex-col text-left">
              <div className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tên vai trò</label>
                      <input required type="text" placeholder="VD: KỸ THUẬT" value={roleForm.name} onChange={e => setRoleForm({ ...roleForm, name: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-black text-xs uppercase dark:text-white shadow-inner" />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Mã định danh (Value)</label>
                      <input required type="number" value={roleForm.roleValue} onChange={e => setRoleForm({ ...roleForm, roleValue: Number(e.target.value) })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-bold text-xs dark:text-white shadow-inner" />
                    </div>
                </div>
                <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Mô tả đặc quyền</label>
                    <textarea value={roleForm.description} onChange={e => setRoleForm({ ...roleForm, description: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-bold text-xs h-24 resize-none dark:text-white" />
                </div>
                <div className="space-y-8 text-left mt-4">
                    {Object.entries(allPermissions.reduce((acc: any, p) => ({ ...acc, [p.module]: [...(acc[p.module] || []), p] }), {})).map(([module, perms]: any) => (
                      <div key={module} className="text-left">
                        <h4 className="text-[11px] font-black text-[#00459a] uppercase mb-5 flex items-center gap-2 text-left"><div className="w-2 h-2 rounded-full bg-blue-500" /> Phân hệ: {module}</h4>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4 text-left">
                          {perms.map((p: any) => {
                            const isSelected = (roleForm.permissions || []).includes(p.id);
                            return (
                              <button
                                key={p.id} type="button" onClick={() => { const current = roleForm.permissions || []; const updated = isSelected ? current.filter(id => id !== p.id) : [...current, p.id]; setRoleForm({ ...roleForm, permissions: updated }); }}
                                className={`p-5 rounded-2xl border-2 text-[10px] font-black uppercase transition-all flex items-center justify-between ${isSelected ? 'border-[#00459a] bg-blue-50/50 text-[#00459a]' : 'border-slate-50 dark:border-slate-800 text-slate-400 hover:border-blue-100 shadow-sm'}`}
                              >
                                <div className="text-left flex-1 pr-2"><p className="truncate">{p.name}</p></div>
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#00459a] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-300'}`}>{isSelected ? <Check size={14} /> : <Plus size={12} />}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="pt-8 flex gap-5 shrink-0">
                <button type="button" onClick={() => setIsRoleModalOpen(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all shadow-sm">Đóng</button>
                <button type="submit" disabled={isActionLoading} className="flex-[2] py-4 bg-[#00459a] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                  {isActionLoading && <Loader size={16} className="animate-spin" />}
                  Lưu cấu hình vai trò
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
