import React, { useEffect, useState } from 'react';
import { Check, Shield, User as UserIcon, Settings, Search, Filter, Loader } from 'lucide-react';
import { getPendingUsers, approveUser, getAllUsers } from '../services/userService';
import { AuthUser, UserRole } from '../types/auth';
import toast from 'react-hot-toast';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = filter === 'pending' ? await getPendingUsers() : await getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const handleApprove = async (uid: string, role: UserRole) => {
    try {
      await approveUser(uid, role);
      toast.success('Đã duyệt tài khoản thành công!');
      fetchUsers(); // Refresh list
    } catch (error) {
      toast.error('Lỗi khi duyệt tài khoản');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#0b1c30]">Quản lý người dùng</h1>
          <p className="text-slate-500 font-medium">Duyệt và phân quyền cho thành viên hệ thống</p>
        </div>

        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-100">
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${filter === 'pending' ? 'bg-[#00459a] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            Chờ duyệt ({users.length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${filter === 'all' ? 'bg-[#00459a] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            Tất cả người dùng
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader className="animate-spin text-[#00459a]" size={40} />
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <UserIcon size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-400">Không có người dùng nào</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user.uid} className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#f3f6ff] rounded-2xl flex items-center justify-center text-[#00459a] font-black text-xl">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-[#0b1c30] line-clamp-1">{user.displayName}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{user.email}</p>
                </div>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Số điện thoại:</span>
                  <span className="font-bold text-slate-700">{user.phoneNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Ngày đăng ký:</span>
                  <span className="font-bold text-slate-700">{user.createdAt.toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Trạng thái:</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${user.isVerified ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    {user.isVerified ? 'Đã kích hoạt' : 'Chờ phê duyệt'}
                  </span>
                </div>
              </div>

              {!user.isVerified && (
                <div className="space-y-3 pt-4 border-t border-slate-50">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Cấp quyền và Duyệt</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleApprove(user.uid, 'technician')}
                      className="py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2"
                    >
                      <Settings size={14} /> Kỹ thuật
                    </button>
                    <button
                      onClick={() => handleApprove(user.uid, 'admin')}
                      className="py-2.5 bg-[#00459a] hover:bg-[#00367a] text-white rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2"
                    >
                      <Shield size={14} /> Quản trị
                    </button>
                  </div>
                  <button
                    onClick={() => handleApprove(user.uid, 'customer')}
                    className="w-full py-2.5 border-2 border-slate-100 text-slate-400 hover:border-[#00459a] hover:text-[#00459a] rounded-xl text-[10px] font-black uppercase transition-all"
                  >
                    Duyệt vai khách hàng
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersPage;
