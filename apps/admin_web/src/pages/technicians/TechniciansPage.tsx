import React, { useState, useEffect, useCallback } from 'react';
import {
  Zap, Plus, Search, RefreshCcw, Edit2, Trash2,
  User as UserIcon, Phone, Mail, MapPin, Star,
  CheckCircle, Clock, XCircle, ChevronRight, BarChart3,
  Calendar, Shield, Loader2, MoreVertical, ExternalLink,
  Lock, Unlock, History, Briefcase, Key, Activity
} from 'lucide-react';
import {
  subscribeToTechnicians,
  updateUserStatus,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser
} from '../../services/userService';
import {
  subscribeToTechnicianOrders,
  subscribeToTechnicianStats
} from '../../services/technicianService';
import { AuthUser, UserRole } from '../../types/auth';
import { Order } from '../../types/order';
import { toast, Toaster } from 'react-hot-toast';
import { logActivity } from '../../services/auditService';
import { useNavigate } from 'react-router-dom';

// Helper function for date formatting
function formatDate(date: any) {
  if (!date) return '---';
  const d = date instanceof Date ? date : date.toDate?.() || new Date(date);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

const TechniciansPage: React.FC = () => {
  const navigate = useNavigate();
  const [technicians, setTechnicians] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTech, setSelectedTech] = useState<AuthUser | null>(null);
  const [techOrders, setTechOrders] = useState<Order[]>([]);
  const [techStats, setTechStats] = useState<any>(null);
  const [isDetailLoading, setIsTechDetailLoading] = useState(false);

  // Modal states
  const [showFormModal, setShowFormModal] = useState<{visible: boolean, type: 'add' | 'edit', tech?: AuthUser}>({ visible: false, type: 'add' });

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToTechnicians((data) => {
      setTechnicians(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedTech) {
      setTechOrders([]);
      setTechStats(null);
      return;
    }

    setIsTechDetailLoading(true);
    const unsubOrders = subscribeToTechnicianOrders(selectedTech.uid, (orders) => {
      setTechOrders(orders);
      setIsTechDetailLoading(false);
    });

    const unsubStats = subscribeToTechnicianStats(selectedTech.uid, (stats) => {
      setTechStats(stats);
    });

    return () => {
      unsubOrders();
      unsubStats();
    };
  }, [selectedTech?.uid]);

  const handleToggleStatus = async (tech: AuthUser) => {
    const newStatus = tech.status === 'active' ? 'blocked' : 'active';
    const actionText = newStatus === 'active' ? 'mở khóa' : 'khóa';

    if (window.confirm(`Bạn có chắc muốn ${actionText} tài khoản của ${tech.displayName}?`)) {
      try {
        await updateUserStatus(tech.uid, newStatus);
        await logActivity(`${newStatus === 'active' ? 'Mở khóa' : 'Khóa'} tài khoản KTV`, "Nhân sự", tech.uid, { name: tech.displayName, status: newStatus }, 'warning');
        toast.success(`Đã ${actionText} tài khoản thành công`);
        if (selectedTech?.uid === tech.uid) {
           setSelectedTech(prev => prev ? { ...prev, status: newStatus } : null);
        }
      } catch (error) {
        toast.error("Cập nhật trạng thái thất bại");
      }
    }
  };

  const handleDeleteTech = async (tech: AuthUser) => {
    if (window.confirm(`XÓA VĨNH VIỄN kỹ thuật viên "${tech.displayName}"? Hành động này không thể hoàn tác.`)) {
      try {
        await adminDeleteUser(tech.uid);
        await logActivity("Xóa kỹ thuật viên", "Nhân sự", tech.uid, tech, 'warning');
        toast.success("Đã xóa kỹ thuật viên khỏi hệ thống");
        if (selectedTech?.uid === tech.uid) setSelectedTech(null);
      } catch (error: any) {
        toast.error(error.message || "Xóa thất bại");
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      displayName: formData.get('displayName') as string,
      email: formData.get('email') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      password: formData.get('password') as string,
      role: UserRole.TECHNICIAN,
      status: 'active'
    };

    try {
      if (showFormModal.type === 'add') {
        await adminCreateUser(data);
        await logActivity("Tạo mới kỹ thuật viên", "Nhân sự", "new", data, 'success');
        toast.success("Đã thêm kỹ thuật viên thành công");
      } else if (showFormModal.type === 'edit' && showFormModal.tech) {
        await adminUpdateUser({ uid: showFormModal.tech.uid, ...data });
        await logActivity("Cập nhật kỹ thuật viên", "Nhân sự", showFormModal.tech.uid, data, 'info');
        toast.success("Đã cập nhật thông tin kỹ thuật viên");
      }
      setShowFormModal({ visible: false, type: 'add' });
    } catch (error: any) {
      toast.error(error.message || "Thao tác thất bại");
    }
  };

  const filteredTechs = technicians.filter(t =>
    t.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.phoneNumber.includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase rounded-md border border-emerald-100">Đang hoạt động</span>;
    }
    return <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[8px] font-black uppercase rounded-md border border-rose-100">Đã khóa</span>;
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-600';
      case 'cancelled': return 'bg-rose-50 text-rose-600';
      case 'processing': return 'bg-blue-50 text-blue-600';
      default: return 'bg-amber-50 text-amber-600';
    }
  };

  return (
    <div className="flex h-full bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-300 font-sans p-4 md:p-8 overflow-hidden gap-6">
      <Toaster position="top-right" />

      {/* Sidebar List */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all ${selectedTech ? 'hidden lg:flex lg:max-w-sm xl:max-w-md' : 'w-full'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 shrink-0">
          <div>
            <h1 className="text-2xl font-black text-[#0b1c30] dark:text-white tracking-tight uppercase flex items-center gap-3">
              <Zap className="text-amber-500 fill-amber-500" size={28} />
              Kỹ thuật viên
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-widest mt-1">Hệ thống quản lý AquaCare</p>
          </div>
          <button
            onClick={() => setShowFormModal({ visible: true, type: 'add' })}
            className="bg-[#00459a] dark:bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={16} /> Thêm mới
          </button>
        </div>

        <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col flex-1">
          <div className="p-4 border-b border-slate-50 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                type="text"
                placeholder="Tìm KTV..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border-none rounded-xl outline-none font-bold text-xs uppercase dark:text-white placeholder:normal-case shadow-inner"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full opacity-20"><Loader2 className="animate-spin mb-2" /> <p className="text-[10px] font-black uppercase">Đang tải...</p></div>
            ) : filteredTechs.length > 0 ? filteredTechs.map((tech) => (
              <div
                key={tech.uid}
                onClick={() => setSelectedTech(tech)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                  selectedTech?.uid === tech.uid
                  ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/20'
                  : 'border-transparent bg-white dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm'
                }`}
              >
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-sm font-black text-[#00459a] shrink-0 border border-slate-200 dark:border-slate-700">
                  {tech.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-[11px] uppercase text-[#0b1c30] dark:text-white truncate tracking-tight">{tech.displayName}</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{tech.phoneNumber}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {getStatusBadge(tech.status)}
                </div>
              </div>
            )) : (
              <div className="text-center py-20 opacity-30">
                 <UserIcon size={32} className="mx-auto mb-2" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Không tìm thấy KTV</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {selectedTech ? (
        <div className="flex-1 flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300 min-w-0">
          <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col flex-1 transition-colors">
            {/* Detail Header */}
            <div className="p-6 md:p-10 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 bg-white dark:bg-[#1e293b] rounded-3xl flex items-center justify-center text-2xl font-black text-[#00459a] shadow-lg border-2 border-white dark:border-slate-800 shrink-0">
                {selectedTech.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="text-center md:text-left flex-1">
                <h2 className="text-2xl font-black text-[#0b1c30] dark:text-white uppercase leading-none tracking-tight">{selectedTech.displayName}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase"><Mail size={12} className="text-blue-500" /> {selectedTech.email}</p>
                  <p className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase"><Phone size={12} className="text-emerald-500" /> {selectedTech.phoneNumber}</p>
                  <p className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase"><Clock size={12} className="text-amber-500" /> Tham gia: {formatDate(selectedTech.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/audit-logs?email=${selectedTech.email}`)}
                  className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-amber-500 shadow-sm transition-all"
                  title="Xem nhật ký hoạt động"
                >
                  <Activity size={20} />
                </button>
                <button
                  onClick={() => handleToggleStatus(selectedTech)}
                  className={`p-3 rounded-2xl transition-all shadow-sm ${
                    selectedTech.status === 'active'
                    ? 'bg-rose-50 text-rose-500 hover:bg-rose-100 border border-rose-100'
                    : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100 border border-emerald-100'
                  }`}
                  title={selectedTech.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
                >
                  {selectedTech.status === 'active' ? <Lock size={20} /> : <Unlock size={20} />}
                </button>
                <button
                  onClick={() => setShowFormModal({ visible: true, type: 'edit', tech: selectedTech })}
                  className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-blue-500 shadow-sm transition-all"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={() => handleDeleteTech(selectedTech)}
                  className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-rose-500 shadow-sm transition-all"
                >
                  <Trash2 size={20} />
                </button>
                <button onClick={() => setSelectedTech(null)} className="p-3 lg:hidden text-slate-400"><XCircle size={24} /></button>
              </div>
            </div>

            {/* Detail Content */}
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Nhiệm vụ', value: techStats?.total || 0, icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50' },
                  { label: 'Hoàn tất', value: techStats?.completed || 0, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { label: 'Đang làm', value: techStats?.processing || 0, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
                  { label: 'Hủy/Lỗi', value: techStats?.cancelled || 0, icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
                ].map((s, i) => (
                  <div key={i} className="p-5 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-50 dark:border-slate-800 shadow-sm hover:translate-y-[-2px] transition-transform">
                    <div className={`w-10 h-10 ${s.bg} dark:bg-slate-800 rounded-xl flex items-center justify-center ${s.color} mb-3`}>
                      <s.icon size={20} />
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                    <p className="text-2xl font-black dark:text-white">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Order List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                   <h4 className="text-[10px] font-black text-[#0b1c30] dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    <History size={14} className="text-[#00459a]" /> Nhật ký nhiệm vụ
                   </h4>
                   <span className="text-[9px] font-black text-slate-400 uppercase">{techOrders.length} Đơn hàng</span>
                </div>

                <div className="space-y-3">
                  {isDetailLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-20"><Loader2 className="animate-spin mb-2" /> <p className="text-[10px] font-black uppercase">Đang đồng bộ dữ liệu...</p></div>
                  ) : techOrders.length > 0 ? techOrders.map(order => (
                    <div key={order.id} className="p-4 bg-white dark:bg-slate-900/30 rounded-2xl border border-slate-50 dark:border-slate-800 flex items-center gap-4 hover:border-blue-100 transition-all group shadow-sm">
                       <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:text-blue-500 transition-colors">
                          {order.id.slice(-4).toUpperCase()}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                             <p className="font-black text-xs uppercase text-[#0b1c30] dark:text-white truncate">{order.customerName}</p>
                             <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${getOrderStatusColor(order.status)}`}>
                               {order.status}
                             </span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 truncate">{order.productName || 'Không xác định'}</p>
                       </div>
                       <div className="text-right hidden sm:block mr-4">
                          <p className="text-[10px] font-black dark:text-white uppercase">{order.totalAmount.toLocaleString('vi-VN')}đ</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{formatDate(order.createdAt)}</p>
                       </div>
                       <button
                         onClick={() => navigate(`/orders?id=${order.id}`)}
                         className="p-2.5 text-slate-300 hover:text-[#00459a] hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-xl transition-all"
                         title="Xem chi tiết đơn hàng"
                       >
                         <ExternalLink size={16} />
                       </button>
                    </div>
                  )) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50/30 dark:bg-slate-900/10 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                       <History size={32} className="text-slate-200 mb-3" />
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Kỹ thuật viên chưa có nhiệm vụ nào</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden lg:flex flex-col items-center justify-center bg-white dark:bg-[#1e293b] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 border-dashed transition-colors shadow-inner">
          <div className="p-10 bg-slate-50 dark:bg-slate-900 rounded-[3rem] mb-6">
            <UserIcon size={64} className="text-slate-200" />
          </div>
          <h2 className="text-lg font-black text-slate-400 uppercase tracking-widest">Chọn kỹ thuật viên để xem chi tiết</h2>
          <p className="text-slate-400 text-xs mt-2 font-medium">Theo dõi hiệu suất và nhật ký công việc real-time</p>
        </div>
      )}

      {/* Form Modal */}
      {showFormModal.visible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200 border border-slate-100 dark:border-slate-800">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#0b1c30] text-white rounded-xl flex items-center justify-center shadow-lg"><Zap size={20} /></div>
                <div>
                  <h3 className="font-black text-[#0b1c30] dark:text-white uppercase tracking-widest text-xs">
                    {showFormModal.type === 'add' ? 'Khởi tạo KTV mới' : 'Cập nhật tài khoản'}
                  </h3>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Cấu hình nhân sự hiện trường</p>
                </div>
              </div>
              <button onClick={() => setShowFormModal({ ...showFormModal, visible: false })} className="text-slate-400 hover:text-rose-500 transition-colors"><XCircle size={28} /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Họ tên nhân viên</label>
                <input name="displayName" defaultValue={showFormModal.tech?.displayName} required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-black text-xs uppercase dark:text-white focus:ring-2 ring-blue-500/10 transition-all" placeholder="NGUYỄN VĂN A" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Email đăng nhập (ID)</label>
                <input name="email" type="email" defaultValue={showFormModal.tech?.email} required disabled={showFormModal.type === 'edit'} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold text-xs dark:text-white disabled:opacity-50 focus:ring-2 ring-blue-500/10 transition-all" placeholder="ktv@aquacare.vn" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Số điện thoại liên hệ</label>
                <input name="phoneNumber" defaultValue={showFormModal.tech?.phoneNumber} required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold text-xs dark:text-white focus:ring-2 ring-blue-500/10 transition-all" placeholder="0987xxxxxx" />
              </div>
              {showFormModal.type === 'add' && (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-blue-600 uppercase ml-1 tracking-widest">Mật khẩu khởi tạo</label>
                  <div className="relative">
                    <input name="password" type="password" required className="w-full px-5 py-3.5 bg-blue-50/30 dark:bg-blue-900/20 border-2 border-blue-50 dark:border-blue-900/30 rounded-2xl outline-none font-bold text-xs dark:text-white focus:ring-2 ring-blue-500/20 transition-all" placeholder="••••••••" />
                    <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400" size={16} />
                  </div>
                </div>
              )}
              <button type="submit" className="w-full py-4 bg-[#0b1c30] dark:bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/10 hover:brightness-110 active:scale-95 transition-all mt-4 flex items-center justify-center gap-2">
                {showFormModal.type === 'add' ? <Plus size={18} /> : <CheckCircle size={18} />}
                {showFormModal.type === 'add' ? 'Khởi tạo tài khoản KTV' : 'Cập nhật thay đổi'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechniciansPage;
