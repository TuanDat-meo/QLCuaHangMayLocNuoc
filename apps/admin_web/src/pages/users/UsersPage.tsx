import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Shield, User as UserIcon, Loader, Smartphone, Globe,
  AlertCircle, Users, Calculator, UserPlus, Search,
  Briefcase, Settings, Edit2, Trash2, X, Check, Key,
  CheckCircle, ChevronDown, Plus, Lock
} from 'lucide-react';
import {
  approveUser, getAllUsers, adminCreateUser,
  adminUpdateUser, adminDeleteUser
} from '../../services/userService';
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  getAllPermissions
} from '../../services/roleService';
import { AuthUser, UserRole } from '../../types/auth';
import { Role, Permission } from '../../types/role';
import toast from 'react-hot-toast';

const UsersPage: React.FC = () => {
  // --- STATES ---
  const [allUsers, setAllUsers] = useState<AuthUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'staff' | 'roles' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<number | 'all'>('all');

  // Modal States
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Form States
  const [userForm, setUserForm] = useState({
    email: '', password: '', displayName: '', phoneNumber: '', role: UserRole.STAFF as number, status: 'active'
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
    } catch (err: any) {
      toast.error('Lỗi tải dữ liệu. Hãy đảm bảo bạn có quyền Admin!');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- LOGIC ---
  const counts = useMemo(() => ({
    pending: allUsers.filter(u => u.status === 'pending' || u.role === UserRole.PENDING).length,
    staff: allUsers.filter(u => u.status === 'active' && u.role !== UserRole.CUSTOMER && u.role !== UserRole.PENDING).length
  }), [allUsers]);

  const filteredUsers = useMemo(() => {
    let result = allUsers;
    if (activeTab === 'pending') result = result.filter(u => u.status === 'pending' || u.role === UserRole.PENDING);
    else if (activeTab === 'staff') result = result.filter(u => u.status === 'active' && u.role !== UserRole.CUSTOMER && u.role !== UserRole.PENDING);

    if (roleFilter !== 'all') result = result.filter(u => u.role === roleFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u => u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
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
      toast.success(modalMode === 'create' ? 'Tạo tài khoản thành công!' : 'Cập nhật thành công!');
      setIsUserModalOpen(false);
      fetchData();
    } catch (err: any) { toast.error(err.message || 'Thao tác thất bại'); }
    finally { setIsActionLoading(false); }
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
    } catch (err) { toast.error('Lỗi thao tác role'); }
    finally { setIsActionLoading(false); }
  };

  const handleApprove = async (uid: string) => {
    const role = pendingRoleValue[uid] || 3;
    setIsActionLoading(true);
    try {
      await approveUser(uid, role);
      toast.success('Đã duyệt nhân sự');
      fetchData();
    } catch (err) { toast.error('Lỗi phê duyệt'); }
    finally { setIsActionLoading(false); setOpenApproveId(null); }
  };

  const getRoleName = (val: number | null) => roles.find(r => r.roleValue === val)?.name || 'Chưa duyệt';

  return (
    <div className="p-8 bg-[#f8fafc] dark:bg-[#0f172a] min-h-screen text-left transition-all">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-black text-[#0b1c30] dark:text-white uppercase tracking-tight">Hệ thống Nhân sự</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Quản lý tài khoản Admin & Cấu hình phân quyền chi tiết</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text" placeholder="Tìm kiếm..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none w-64 shadow-sm"
            />
          </div>

          <button
            onClick={() => {
              if (activeTab === 'roles') {
                setRoleForm({ name: '', description: '', roleValue: roles.length + 10, permissions: [] });
                setModalMode('create'); setIsRoleModalOpen(true);
              } else {
                setUserForm({ email: '', password: '', displayName: '', phoneNumber: '', role: 3, status: 'active' });
                setModalMode('create'); setIsUserModalOpen(true);
              }
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#00459a] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all"
          >
            <Plus size={20} /> {activeTab === 'roles' ? 'Tạo vai trò' : 'Thêm Admin'}
          </button>

          <div className="flex bg-white dark:bg-[#1e293b] rounded-[1.25rem] p-1.5 shadow-sm border border-slate-100 dark:border-slate-800">
            {['pending', 'staff', 'roles', 'all'].map(t => (
              <button
                key={t} onClick={() => setActiveTab(t as any)}
                className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === t ? 'bg-[#0b1c30] text-white shadow-md' : 'text-slate-400'}`}
              >
                {t === 'pending' ? `Yêu cầu (${counts.pending})` : t === 'roles' ? 'Vai trò' : t === 'staff' ? 'Nhân sự' : 'Tất cả'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab !== 'roles' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <div key={user.uid} className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 hover:border-[#00459a]/30 transition-all group relative">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-[#00459a] font-black text-xl shadow-inner">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="font-black text-[#0b1c30] dark:text-white truncate uppercase tracking-tight">{user.displayName}</h3>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[9px] font-black uppercase mt-1">
                    {user.source === 'admin_web' ? <Globe size={12} /> : <Smartphone size={12} />} {user.source || 'Hệ thống'}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setSelectedUser(user); setUserForm({ ...userForm, email: user.email, displayName: user.displayName, phoneNumber: user.phoneNumber || '', role: user.role || 3 }); setModalMode('edit'); setIsUserModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={16} /></button>
                  <button onClick={() => { if (window.confirm('Xóa tài khoản này?')) adminDeleteUser(user.uid).then(() => fetchData()); }} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 p-3 rounded-2xl">
                  <span className="text-slate-400 font-black text-[9px] uppercase tracking-widest">EMAIL</span>
                  <span className="font-bold text-xs truncate ml-4 dark:text-slate-300">{user.email}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 p-3 rounded-2xl">
                  <span className="text-slate-400 font-black text-[9px] uppercase tracking-widest">VAI TRÒ</span>
                  <span className="font-black text-[11px] text-[#00459a] dark:text-blue-400 uppercase">{getRoleName(user.role)}</span>
                </div>
              </div>

              {user.status === 'pending' && (
                <div className="flex gap-2 pt-6 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex-1 relative">
                    <button onClick={() => setOpenApproveId(openApproveId === user.uid ? null : user.uid)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 text-[10px] font-black uppercase flex items-center justify-between">
                      {getRoleName(pendingRoleValue[user.uid] || 3)} <ChevronDown size={14} />
                    </button>
                    {openApproveId === user.uid && (
                      <div className="absolute z-20 bottom-full mb-2 w-full bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                        {roles.map(r => (
                          <button key={r.id} onClick={() => { setPendingRoleValue({ ...pendingRoleValue, [user.uid]: r.roleValue }); setOpenApproveId(null); }} className="w-full p-3 text-left text-[10px] font-black uppercase hover:bg-slate-50 dark:hover:bg-slate-800">
                            {r.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleApprove(user.uid)} className="bg-[#0b1c30] dark:bg-white text-white dark:text-[#0b1c30] px-6 py-3 rounded-2xl text-[10px] font-black uppercase shadow-lg">Duyệt</button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
          <div className="lg:col-span-1 space-y-4">
            {roles.map(role => (
              <div key={role.id} onClick={() => setSelectedRole(role)} className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${selectedRole?.id === role.id ? 'border-[#00459a] bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1e293b] hover:border-slate-200'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-[#00459a]"><Shield size={24} /></div>
                  <div className="flex gap-2">
                    <button onClick={() => { setRoleForm({ ...role }); setModalMode('edit'); setIsRoleModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-500"><Edit2 size={16} /></button>
                    <button onClick={() => { if (window.confirm('Xóa vai trò này?')) deleteRole(role.id).then(() => fetchData()); }} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
                  </div>
                </div>
                <h3 className="font-black text-[#0b1c30] dark:text-white uppercase tracking-tight">{role.name}</h3>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500 uppercase">{role.permissions.length} Quyền</span>
                  <span className="text-[10px] font-black text-[#00459a] uppercase">Mã: {role.roleValue}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selectedRole ? (
              <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-10 shadow-sm">
                <div className="flex justify-between items-center mb-8 pb-8 border-b border-slate-50 dark:border-slate-800">
                  <h2 className="text-xl font-black text-[#0b1c30] dark:text-white uppercase tracking-tight">Quyền hạn: {selectedRole.name}</h2>
                  <Lock size={24} className="text-slate-200" />
                </div>
                <div className="space-y-8">
                  {Object.entries(allPermissions.reduce((acc: any, p) => ({ ...acc, [p.module]: [...(acc[p.module] || []), p] }), {})).map(([module, perms]: any) => (
                    <div key={module}>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00459a]" /> Module: {module}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {perms.map((p: any) => {
                          const has = selectedRole.permissions.includes(p.id);
                          return (
                            <div key={p.id} className={`p-4 rounded-2xl border-2 flex items-center justify-between ${has ? 'border-emerald-100 bg-emerald-50/30 dark:border-emerald-900/10' : 'border-slate-50 dark:border-slate-800 bg-slate-50/50'}`}>
                              <div>
                                <p className={`text-sm font-black uppercase ${has ? 'text-emerald-600' : 'text-slate-400'}`}>{p.name}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{p.description}</p>
                              </div>
                              {has ? <Check size={14} className="text-emerald-500" /> : <X size={14} className="text-slate-300" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full bg-white dark:bg-[#1e293b] rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center p-20 text-center">
                 <Shield size={48} className="text-slate-200 mb-6" />
                 <h3 className="text-lg font-black text-slate-300 uppercase">Chọn vai trò để cấu hình</h3>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODALS --- */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
          <div className="bg-white dark:bg-[#1e293b] rounded-[3rem] w-full max-w-xl p-10 shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-2xl font-black text-[#0b1c30] dark:text-white uppercase mb-8">{modalMode === 'create' ? 'Thêm nhân sự' : 'Sửa thông tin'}</h2>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <input required type="text" placeholder="Họ tên" value={userForm.displayName} onChange={e => setUserForm({ ...userForm, displayName: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl outline-none font-bold text-slate-700 dark:text-white" />
              <input required disabled={modalMode === 'edit'} type="email" placeholder="Email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl outline-none font-bold disabled:opacity-50 text-slate-700 dark:text-white" />
              <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: Number(e.target.value) })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-black text-[11px] uppercase text-slate-700 dark:text-white">
                {roles.map(r => <option key={r.id} value={r.roleValue}>{r.name}</option>)}
              </select>
              <div className="relative">
                <input required={modalMode === 'create'} type="password" placeholder="Mật khẩu" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl outline-none font-bold pr-14 text-slate-700 dark:text-white" />
                <Key className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              </div>
              <button disabled={isActionLoading} type="submit" className="w-full py-5 bg-[#00459a] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 mt-4 flex items-center justify-center gap-2">
                {isActionLoading ? <Loader size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                Xác nhận lưu
              </button>
            </form>
          </div>
        </div>
      )}

      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
          <div className="bg-white dark:bg-[#1e293b] rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl p-10">
            <h2 className="text-2xl font-black text-[#0b1c30] dark:text-white uppercase mb-8">{modalMode === 'create' ? 'Cấu hình vai trò' : 'Cập nhật vai trò'}</h2>
            <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
               <div className="grid grid-cols-2 gap-4">
                  <input required type="text" placeholder="Tên vai trò" value={roleForm.name} onChange={e => setRoleForm({ ...roleForm, name: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl outline-none font-bold text-slate-700 dark:text-white" />
                  <input required type="number" placeholder="Mã định danh (Số)" value={roleForm.roleValue} onChange={e => setRoleForm({ ...roleForm, roleValue: Number(e.target.value) })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl outline-none font-bold text-slate-700 dark:text-white" />
               </div>
               <textarea placeholder="Mô tả quyền hạn..." value={roleForm.description} onChange={e => setRoleForm({ ...roleForm, description: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl outline-none font-bold h-20 resize-none text-slate-700 dark:text-white" />
               <div className="space-y-6">
                  {Object.entries(allPermissions.reduce((acc: any, p) => ({ ...acc, [p.module]: [...(acc[p.module] || []), p] }), {})).map(([module, perms]: any) => (
                    <div key={module}>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3 px-2">Module: {module}</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {perms.map((p: any) => (
                          <button key={p.id} type="button" onClick={() => setRoleForm({ ...roleForm, permissions: roleForm.permissions.includes(p.id) ? roleForm.permissions.filter(id => id !== p.id) : [...roleForm.permissions, p.id] })} className={`p-4 rounded-xl border-2 text-[10px] font-black uppercase transition-all flex items-center justify-between group ${roleForm.permissions.includes(p.id) ? 'border-[#00459a] bg-blue-50/50 text-[#00459a] dark:text-blue-400' : 'border-slate-50 dark:border-slate-800 text-slate-400'}`}>
                            {p.name} {roleForm.permissions.includes(p.id) && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
               </div>
            </div>
            <div className="pt-8 flex gap-4">
               <button onClick={() => setIsRoleModalOpen(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black text-xs uppercase">Hủy</button>
               <button onClick={handleRoleSubmit} className="flex-[2] py-4 bg-[#00459a] text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-blue-500/20">Lưu vai trò</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
