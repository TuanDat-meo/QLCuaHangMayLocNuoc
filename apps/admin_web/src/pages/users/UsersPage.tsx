import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Shield, User as UserIcon, Loader, Smartphone, Globe,
  Search, Edit2, Trash2, X, Check, Key,
  CheckCircle, ChevronDown, Plus, Lock, Filter,
  Mail, Phone, UserCheck, ShieldAlert, Ban, Unlock,
  Activity, Users as UsersIcon, Briefcase, Calculator,
  Layers, Info, Zap, UserPlus, Sparkles
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
  seedStandardRoles
} from '../../services/roleService';
import { AuthUser, UserRole } from '../../types/auth';
import { Role } from '../../types/role';
import toast from 'react-hot-toast';
import { logActivity } from '../../services/auditService';

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
    email: '', password: '', displayName: '', phoneNumber: '', role: 3 as number, status: 'active'
  });
  const [roleForm, setRoleForm] = useState({
    name: '', description: '', roleValue: 0, permissions: [] as string[]
  });

  const allPermissions = useMemo(() => getAllPermissions(), []);
  const [openApproveId, setOpenApproveId] = useState<string | null>(null);
  const [pendingRoleValue, setPendingRoleValue] = useState<Record<string, number>>({});

  // --- DATA FETCHING ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [uData, rData] = await Promise.all([getAllUsers(), getAllRoles()]);
      setAllUsers(uData);
      setRoles(rData);
      if (rData.length > 0 && !selectedRole) setSelectedRole(rData[0]);
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
    const roleCounts = roles.map(role => ({
      name: role.name,
      value: active.filter(u => u.role === role.roleValue).length,
      roleValue: role.roleValue
    }));

    return {
      total: allUsers.length,
      pending: allUsers.filter(u => u.status === 'pending' || u.role === UserRole.PENDING).length,
      roleCounts,
      staffCount: active.filter(u => u.role !== UserRole.CUSTOMER && u.role !== UserRole.PENDING).length
    };
  }, [allUsers, roles]);

  const filteredUsers = useMemo(() => {
    let result = allUsers;
    if (activeTab === 'pending') result = result.filter(u => u.status === 'pending' || u.role === UserRole.PENDING);
    else if (activeTab === 'staff') result = result.filter(u => u.status !== 'pending' && u.role !== UserRole.CUSTOMER && u.role !== UserRole.PENDING);
    if (roleFilter !== 'all') result = result.filter(u => u.role === roleFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u => u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phoneNumber?.includes(q));
    }
    return result;
  }, [allUsers, activeTab, roleFilter, searchQuery]);

  const usersInSelectedRole = useMemo(() => {
    if (!selectedRole) return [];
    return allUsers.filter(u => u.role === selectedRole.roleValue);
  }, [allUsers, selectedRole]);

  // --- ACTIONS ---
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      if (modalMode === 'create') await adminCreateUser(userForm);
      else if (selectedUser) await adminUpdateUser({ uid: selectedUser.uid, ...userForm });
      toast.success('Thành công!');
      setIsUserModalOpen(false);
      fetchData();
    } catch (err: any) { toast.error(err.message || 'Lỗi thao tác'); }
    finally { setIsActionLoading(false); }
  };

  const handleToggleStatus = async (user: AuthUser) => {
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    if (window.confirm(`Xác nhận thay đổi trạng thái tài khoản ${user.displayName}?`)) {
      try {
        await updateUserStatus(user.uid, newStatus);
        toast.success(`Đã cập nhật trạng thái`);
        fetchData();
      } catch (err) { toast.error('Lỗi cập nhật'); }
    }
  };

  const handleApprove = async (uid: string) => {
    const role = pendingRoleValue[uid] || 3;
    setIsActionLoading(true);
    try {
      await approveUser(uid, role);
      toast.success('Đã duyệt nhân sự!');
      fetchData();
    } catch (err) { toast.error('Lỗi phê duyệt'); }
    finally { setIsActionLoading(false); setOpenApproveId(null); }
  };

  const handleSeedRoles = async () => {
    if (window.confirm('Hệ thống sẽ khởi tạo bộ vai trò chuẩn (Admin, KTV, Điều phối, Kế toán, Khách hàng) theo đúng nghiệp vụ AquaCare. Bạn có chắc chắn?')) {
      setIsActionLoading(true);
      try {
        await seedStandardRoles();
        toast.success('Đã khởi tạo vai trò chuẩn thành công!');
        fetchData();
      } catch (err) { toast.error('Lỗi khởi tạo'); }
      finally { setIsActionLoading(false); }
    }
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      if (modalMode === 'create') await createRole(roleForm);
      else if (selectedRole) await updateRole(selectedRole.id, roleForm);
      toast.success('Đã lưu vai trò!');
      setIsRoleModalOpen(false);
      fetchData();
    } catch (err) { toast.error('Lỗi vai trò'); }
    finally { setIsActionLoading(false); }
  };

  const getRoleName = (val: number | null) => {
    if (val === 0) return 'Chờ duyệt';
    return roles.find(r => r.roleValue === val)?.name || 'N/A';
  };

  const getRoleIcon = (val: number) => {
    switch(val) {
      case 1: return <Shield size={20} className="text-rose-500" />;
      case 4: return <Zap size={20} className="text-amber-500" />;
      case 2: return <Briefcase size={20} className="text-blue-500" />;
      case 6: return <Calculator size={20} className="text-purple-500" />;
      default: return <UserIcon size={20} className="text-slate-400" />;
    }
  };

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] dark:bg-[#0f172a] min-h-screen text-left transition-all font-sans">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-black text-[#0b1c30] dark:text-white uppercase tracking-tight flex items-center gap-3">
            <div className="p-3 bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
               <UserCheck className="text-[#00459a]" size={28} />
            </div>
            Quản trị Nhân sự
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Hệ thống phân quyền & Điều phối nhân sự AquaCare</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="relative flex-1 xl:flex-none xl:min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="text" placeholder="Tìm tên, email, sđt..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none shadow-sm focus:ring-2 ring-blue-500/10 transition-all"
            />
          </div>
          <button
            onClick={() => {
              if (activeTab === 'roles') {
                setRoleForm({ name: '', description: '', roleValue: roles.length + 10, permissions: [] });
                setModalMode('create'); setIsRoleModalOpen(true);
              } else {
                setUserForm({ email: '', password: '', displayName: '', phoneNumber: '', role: roles[0]?.roleValue || 3, status: 'active' });
                setModalMode('create'); setIsUserModalOpen(true);
              }
            }}
            className="flex items-center gap-2 px-6 py-3.5 bg-[#00459a] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <UserPlus size={20} /> {activeTab === 'roles' ? 'Thêm vai trò' : 'Thêm nhân sự'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <div className="bg-[#0b1c30] p-6 rounded-[2.5rem] shadow-xl flex items-center gap-5 min-w-[240px] shrink-0 text-white">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><UsersIcon size={24} /></div>
          <div>
            <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Tổng nhân sự</p>
            <p className="text-2xl font-black">{dynamicStats.staffCount}</p>
          </div>
        </div>
        {dynamicStats.roleCounts.map((roleStat, i) => (
          <div key={i} className="bg-white dark:bg-[#1e293b] p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-5 min-w-[200px] shrink-0">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800">
               {getRoleIcon(roleStat.roleValue)}
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase truncate max-w-[100px] tracking-widest">{roleStat.name}</p>
              <p className="text-2xl font-black text-[#0b1c30] dark:text-white leading-none mt-1">{roleStat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
        <div className="flex bg-white dark:bg-[#1e293b] rounded-2xl p-1.5 shadow-sm border border-slate-100 dark:border-slate-800 w-fit">
          {[
            { id: 'staff', label: 'Hoạt động' },
            { id: 'pending', label: `Yêu cầu (${dynamicStats.pending})` },
            { id: 'roles', label: 'Vai trò' },
            { id: 'all', label: 'Tất cả' }
          ].map(t => (
            <button
              key={t.id} onClick={() => setActiveTab(t.id as any)}
              className={`px-8 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-[#0b1c30] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {activeTab === 'roles' && (
          <button onClick={handleSeedRoles} disabled={isActionLoading} className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-all">
             <Sparkles size={16} /> Khởi tạo vai trò chuẩn
          </button>
        )}
      </div>

      {activeTab !== 'roles' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map(user => (
            <div key={user.uid} className={`bg-white dark:bg-[#1e293b] rounded-[2.5rem] p-7 border-2 transition-all group relative shadow-sm ${user.status === 'blocked' ? 'border-rose-100 opacity-80' : 'border-transparent hover:border-[#00459a]/20'}`}>
              <div className="flex items-center gap-5 mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner border ${user.status === 'blocked' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-slate-50 dark:bg-slate-900 text-[#00459a] border-slate-100 dark:border-slate-800'}`}>
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="font-black text-[#0b1c30] dark:text-white truncate uppercase tracking-tight text-base">{user.displayName}</h3>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase mt-1">
                    {user.source === 'admin_web' ? <Globe size={12} /> : <Smartphone size={12} />} {user.source || 'Hệ thống'}
                  </div>
                </div>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setSelectedUser(user); setUserForm({ ...userForm, email: user.email, displayName: user.displayName, phoneNumber: user.phoneNumber || '', role: user.role || 3 }); setModalMode('edit'); setIsUserModalOpen(true); }} className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={16} /></button>
                  <button onClick={() => handleToggleStatus(user)} className={`p-2.5 rounded-xl transition-all ${user.status === 'active' ? 'text-slate-400 hover:text-rose-500 hover:bg-rose-50' : 'text-emerald-500 hover:bg-emerald-50'}`}>
                    {user.status === 'active' ? <Ban size={16} /> : <Unlock size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-center gap-3 p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-transparent">
                  <Mail size={16} className="text-slate-300" />
                  <span className="font-bold text-xs truncate dark:text-slate-300">{user.email}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-transparent">
                  <div className="flex items-center gap-2">
                     {getRoleIcon(user.role || 0)}
                     <span className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300">{getRoleName(user.role)}</span>
                  </div>
                  {user.status === 'active' ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase"><CheckCircle size={12} /> Active</span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-rose-500 uppercase">Blocked</span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-50 dark:border-slate-800">
                <button onClick={() => navigate(`/audit-logs?email=${user.email}`)} className="flex-1 py-3 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-[#00459a] rounded-2xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 border border-transparent hover:border-blue-100">
                   <Activity size={14} /> Nhật ký
                </button>
                {user.status === 'pending' && (
                  <button onClick={() => handleApprove(user.uid)} className="flex-1 py-3 bg-[#0b1c30] dark:bg-white text-white dark:text-[#0b1c30] rounded-2xl text-[10px] font-black uppercase shadow-lg hover:scale-105 active:scale-95 transition-all">Duyệt</button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
          {/* Vai trò Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {roles.map(role => (
              <div key={role.id} onClick={() => setSelectedRole(role)} className={`p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all ${selectedRole?.id === role.id ? 'border-[#00459a] bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1e293b] hover:border-slate-200 shadow-sm'}`}>
                <div className="flex justify-between items-start mb-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${selectedRole?.id === role.id ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-900'}`}>
                    {getRoleIcon(role.roleValue)}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setRoleForm({ ...role }); setModalMode('edit'); setIsRoleModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-500 transition-all"><Edit2 size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); if(window.confirm('Xóa vai trò này?')) deleteRole(role.id).then(fetchData); }} className="p-2 text-slate-400 hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>
                <h3 className="font-black text-[#0b1c30] dark:text-white uppercase tracking-tight text-lg leading-tight">{role.name}</h3>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-slate-500 uppercase">{role.permissions.length} Quyền</span>
                  <span className="text-[10px] font-black text-[#00459a] dark:text-blue-400 uppercase tracking-widest">ID: {role.roleValue}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Vai trò Detail */}
          <div className="lg:col-span-2 space-y-6">
            {selectedRole ? (
              <div className="bg-white dark:bg-[#1e293b] rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10 shadow-xl animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-10 pb-8 border-b border-slate-50 dark:border-slate-800">
                  <div>
                    <h2 className="text-2xl font-black text-[#0b1c30] dark:text-white uppercase tracking-tight">{selectedRole.name}</h2>
                    <p className="text-[11px] font-bold text-slate-400 uppercase mt-2 line-clamp-3 leading-relaxed italic">{selectedRole.description || 'Chưa có mô tả chi tiết'}</p>
                  </div>
                  <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-3xl shrink-0"><Lock size={32} className="text-[#00459a]" /></div>
                </div>
                <div className="space-y-10">
                  {Object.entries(allPermissions.reduce((acc: any, p) => ({ ...acc, [p.module]: [...(acc[p.module] || []), p] }), {})).map(([module, perms]: any) => (
                    <div key={module}>
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#00459a]" /> Module: {module}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {perms.map((p: any) => {
                          const has = selectedRole.permissions.includes(p.id);
                          return (
                            <div key={p.id} className={`p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${has ? 'border-emerald-100 bg-emerald-50/20 dark:border-emerald-900/10' : 'border-slate-50 dark:border-slate-800 bg-slate-50/30'}`}>
                              <div className="min-w-0 pr-4">
                                <p className={`text-[12px] font-black uppercase truncate ${has ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>{p.name}</p>
                                <p className="text-[9px] text-slate-400 mt-1 font-bold">{p.description}</p>
                              </div>
                              {has ? <Check size={18} className="text-emerald-500" /> : <X size={16} className="text-slate-200" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[500px] bg-white dark:bg-[#1e293b] rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center p-20 text-center shadow-inner">
                 <Layers size={84} className="text-slate-100 mb-8" />
                 <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">Chọn vai trò để quản lý</h3>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- ADD/EDIT MODAL --- */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
          <div className="bg-white dark:bg-[#1e293b] rounded-[3rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in duration-200 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-10">
               <h2 className="text-2xl font-black text-[#0b1c30] dark:text-white uppercase tracking-tight">{modalMode === 'create' ? 'Tạo nhân sự mới' : 'Cập nhật tài khoản'}</h2>
               <button onClick={() => setIsUserModalOpen(false)} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={32} /></button>
            </div>
            <form onSubmit={handleUserSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Họ tên nhân viên</label>
                <input required type="text" placeholder="NGUYỄN VĂN A" value={userForm.displayName} onChange={e => setUserForm({ ...userForm, displayName: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-black text-xs uppercase dark:text-white" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Email đăng nhập</label>
                  <input required disabled={modalMode === 'edit'} type="email" placeholder="email@aquacare.vn" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-bold text-xs dark:text-white disabled:opacity-50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Số điện thoại</label>
                  <input required type="text" placeholder="09xxxxxxxx" value={userForm.phoneNumber} onChange={e => setUserForm({ ...userForm, phoneNumber: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-bold text-xs dark:text-white" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-blue-500 uppercase ml-1 tracking-widest">Chọn vai trò công việc</label>
                <div className="relative">
                   <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: Number(e.target.value) })} className="w-full px-6 py-4 bg-blue-50/50 dark:bg-slate-900 border-2 border-blue-50 dark:border-slate-800 rounded-2xl font-black text-[11px] uppercase text-slate-700 dark:text-white outline-none appearance-none">
                     {roles.map(r => <option key={r.id} value={r.roleValue}>{r.name} (Mã: {r.roleValue})</option>)}
                   </select>
                   <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" size={18} />
                </div>
                {userForm.role && (
                   <div className="mt-3 p-4 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border border-blue-50/50 dark:border-blue-900/20 shadow-inner">
                      <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase flex items-center gap-2"><Info size={10} /> Chức năng chính:</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed italic">{roles.find(r => r.roleValue === userForm.role)?.description || 'Đã phân quyền trong tab vai trò.'}</p>
                   </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">{modalMode === 'create' ? 'Mật khẩu khởi tạo' : 'Mật khẩu mới (Để trống nếu không đổi)'}</label>
                <div className="relative">
                  <input required={modalMode === 'create'} type="password" placeholder="••••••••" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-bold pr-14 text-slate-700 dark:text-white" />
                  <Key className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                </div>
              </div>
              <button disabled={isActionLoading} type="submit" className="w-full py-5 bg-[#00459a] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 mt-6 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all">
                {isActionLoading ? <Loader size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                {modalMode === 'create' ? 'Khởi tạo tài khoản' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ROLE MODAL --- */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
          <div className="bg-white dark:bg-[#1e293b] rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl p-10 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-10 shrink-0">
               <h2 className="text-2xl font-black text-[#0b1c30] dark:text-white uppercase tracking-tight">{modalMode === 'create' ? 'Định nghĩa vai trò' : 'Cập nhật vai trò'}</h2>
               <button onClick={() => setIsRoleModalOpen(false)} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={32} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tên hiển thị</label>
                     <input required type="text" placeholder="TÊN VAI TRÒ" value={roleForm.name} onChange={e => setRoleForm({ ...roleForm, name: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-black text-xs uppercase dark:text-white shadow-inner" />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Mã định danh số</label>
                     <input required type="number" placeholder="Mã số" value={roleForm.roleValue} onChange={e => setRoleForm({ ...roleForm, roleValue: Number(e.target.value) })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-bold text-xs dark:text-white shadow-inner" />
                  </div>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Mô tả chức năng chi tiết</label>
                  <textarea placeholder="Giải thích về trách nhiệm của vai trò này..." value={roleForm.description} onChange={e => setRoleForm({ ...roleForm, description: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-bold text-xs h-24 resize-none dark:text-white shadow-inner" />
               </div>
               <div className="space-y-8">
                  {Object.entries(allPermissions.reduce((acc: any, p) => ({ ...acc, [p.module]: [...(acc[p.module] || []), p] }), {})).map(([module, perms]: any) => (
                    <div key={module} className="text-left">
                      <h4 className="text-[11px] font-black text-[#00459a] dark:text-blue-400 uppercase mb-5 px-2 tracking-widest flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-blue-500" /> Module: {module}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {perms.map((p: any) => {
                          const isSelected = roleForm.permissions.includes(p.id);
                          return (
                            <button key={p.id} type="button" onClick={() => setRoleForm({ ...roleForm, permissions: isSelected ? roleForm.permissions.filter(id => id !== p.id) : [...roleForm.permissions, p.id] })} className={`p-5 rounded-2xl border-2 text-[10px] font-black uppercase transition-all flex items-center justify-between group ${isSelected ? 'border-[#00459a] bg-blue-50/50 text-[#00459a] dark:text-blue-400' : 'border-slate-50 dark:border-slate-800 text-slate-400 hover:border-blue-100 shadow-sm'}`}>
                               <div className="text-left flex-1 min-w-0 pr-2"><p className="truncate font-black">{p.name}</p><p className="text-[7px] opacity-60 lowercase mt-0.5">{p.id}</p></div>
                               <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors shrink-0 ${isSelected ? 'bg-[#00459a] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-300'}`}>{isSelected ? <Check size={12} /> : <Plus size={10} />}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
               </div>
            </div>
            <div className="pt-8 flex gap-5 shrink-0">
               <button onClick={() => setIsRoleModalOpen(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all shadow-sm">Đóng</button>
               <button onClick={handleRoleSubmit} className="flex-[2] py-4 bg-[#00459a] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all">Lưu cấu hình vai trò</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
