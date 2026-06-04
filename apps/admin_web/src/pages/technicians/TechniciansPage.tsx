import React, { useState, useEffect } from 'react';
import {
  Zap, Plus, Search, Edit2, Trash2,
  User as UserIcon, Phone, Mail, Clock,
  CheckCircle, XCircle, BarChart3,
  Calendar, Loader2, ExternalLink,
  Lock, Unlock, History, Briefcase, Activity,
  ChevronLeft, RotateCcw, Wallet, TrendingUp, Award, Info
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
  const [activeTab, setActiveTab] = useState<'history' | 'salary'>('history');

  // Modal states
  const [showFormModal, setShowFormModal] = useState<{visible: boolean, type: 'add' | 'edit', tech?: AuthUser}>({ visible: false, type: 'add' });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Reset errors khi đóng/mở modal
  useEffect(() => {
    setErrors({});
  }, [showFormModal.visible, showFormModal.type]);

  const validateForm = (data: any) => {
    const newErrors: Record<string, string> = {};

    if (!data.displayName?.trim()) {
      newErrors.displayName = "Vui lòng nhập họ tên kỹ thuật viên";
    }

    if (showFormModal.type === 'add') {
      if (!data.email?.trim()) {
        newErrors.email = "Vui lòng nhập địa chỉ email";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        newErrors.email = "Email không đúng định dạng";
      }
    }

    const phoneClean = data.phoneNumber?.trim().replace(/\s/g, '');
    if (!phoneClean) {
      newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
    }

    if (showFormModal.type === 'add') {
      if (!data.password) {
        newErrors.password = "Vui lòng nhập mật khẩu khởi tạo";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleToggleStatus = async (tech: AuthUser) => {
    if (tech.status === 'resigned') {
      toast.error("Nhân viên đã nghỉ việc, hãy khôi phục trước khi thực hiện");
      return;
    }
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
    const isResigned = tech.status === 'resigned';
    const confirmMsg = isResigned
      ? `Bạn có chắc muốn KHÔI PHỤC kỹ thuật viên "${tech.displayName}" quay lại làm việc?`
      : `Bạn có chắc muốn cho kỹ thuật viên "${tech.displayName}" NGHỈ VIỆC?`;

    if (window.confirm(confirmMsg)) {
      try {
        if (isResigned) {
          await updateUserStatus(tech.uid, 'active');
        } else {
          await adminDeleteUser(tech.uid);
        }
        toast.success("Thao tác thành công");
        if (selectedTech?.uid === tech.uid) {
           setSelectedTech(prev => prev ? { ...prev, status: isResigned ? 'active' : 'resigned' } : null);
        }
      } catch (error: any) {
        toast.error("Thao tác thất bại");
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const email = showFormModal.type === 'edit'
      ? showFormModal.tech?.email
      : (formData.get('email') as string);

    const data = {
      displayName: formData.get('displayName') as string,
      email: email || '',
      phoneNumber: formData.get('phoneNumber') as string,
      password: formData.get('password') as string,
      role: UserRole.TECHNICIAN,
      status: showFormModal.type === 'edit' ? showFormModal.tech?.status : 'active',
      baseSalary: Number(formData.get('baseSalary') || 0),
      commissionPerOrder: Number(formData.get('commissionPerOrder') || 500000)
    };

    if (!validateForm(data)) {
      return;
    }

    try {
      if (showFormModal.type === 'add') {
        await adminCreateUser(data);
        toast.success("Đã thêm kỹ thuật viên thành công");
      } else if (showFormModal.type === 'edit' && showFormModal.tech) {
        await adminUpdateUser({ uid: showFormModal.tech.uid, ...data });
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
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-1 bg-emerald-100/50 text-emerald-600 text-[10px] font-bold uppercase rounded-lg border border-emerald-200">Hoạt động</span>;
      case 'resigned':
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-lg border border-slate-200">Nghỉ việc</span>;
      case 'blocked':
        return <span className="px-2.5 py-1 bg-rose-100/50 text-rose-600 text-[10px] font-bold uppercase rounded-lg border border-rose-200">Bị khóa</span>;
      default:
        return <span className="px-2.5 py-1 bg-amber-100/50 text-amber-600 text-[10px] font-bold uppercase rounded-lg border border-amber-200">{status}</span>;
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'assigned': return 'Đã bàn giao';
      case 'processing': return 'Đang thực hiện';
      case 'completed': return 'Hoàn thành';
      case 'incident': return 'Sự cố';
      case 'paid': return 'Đã thanh toán';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'processing': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'incident': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  // Salary Calculation
  const baseSalary = selectedTech?.baseSalary || 0;
  const commissionPerOrder = selectedTech?.commissionPerOrder || 500000;
  const completedOrders = techStats?.completed || 0;
  const totalCommission = completedOrders * commissionPerOrder;
  const totalSalary = baseSalary + totalCommission;

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-300 font-sans overflow-hidden">
      <Toaster position="top-right" />

      {/* Top Header */}
      <div className="bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-wrap justify-between items-center gap-4 shrink-0 z-10">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#0b1c30] dark:text-white uppercase tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <Zap className="text-blue-600 fill-blue-600" size={24} />
            </div>
            Quản lý Kỹ thuật viên
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm nhân sự..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm focus:ring-2 ring-blue-500/20 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFormModal({ visible: true, type: 'add' })}
            className="bg-[#00459a] hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <Plus size={18} /> <span className="hidden sm:inline">Thêm KTV</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar List */}
        <div className={`
          absolute inset-0 z-20 bg-[#f8fafc] dark:bg-[#0f172a] flex flex-col border-r border-slate-200 dark:border-slate-800 transition-all duration-300
          lg:relative lg:translate-x-0 lg:w-80 xl:w-96
          ${selectedTech ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        `}>
          <div className="md:hidden p-4 border-b border-slate-200 dark:border-slate-800">
             <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Tìm KTV..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 opacity-50">
                <Loader2 className="animate-spin text-blue-500 mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">Đang tải...</p>
              </div>
            ) : filteredTechs.length > 0 ? (
              filteredTechs.map((tech) => (
                <div
                  key={tech.uid}
                  onClick={() => setSelectedTech(tech)}
                  className={`
                    group p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4
                    ${selectedTech?.uid === tech.uid
                      ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm'
                    }
                  `}
                >
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shrink-0 border
                    ${selectedTech?.uid === tech.uid
                      ? 'bg-white/20 border-white/20 text-white'
                      : 'bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800 text-blue-600'
                    }
                  `}>
                    {tech.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-sm truncate ${selectedTech?.uid === tech.uid ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {tech.displayName}
                    </h3>
                    <p className={`text-[11px] font-medium mt-0.5 ${selectedTech?.uid === tech.uid ? 'text-blue-100' : 'text-slate-500'}`}>
                      {tech.phoneNumber}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {(tech.status === 'blocked' || tech.status === 'resigned') && (
                       <Lock size={14} className={selectedTech?.uid === tech.uid ? 'text-white' : 'text-rose-500'} />
                    )}
                    <div className={`w-2 h-2 rounded-full ${
                      tech.status === 'active' ? 'bg-emerald-500' :
                      tech.status === 'resigned' ? 'bg-slate-400' : 'bg-rose-500'
                    }`} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 opacity-30">
                <UserIcon size={48} className="mx-auto mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">Không tìm thấy KTV</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail Content */}
        <div className={`
          flex-1 flex flex-col bg-white dark:bg-[#0f172a] transition-all duration-300 overflow-hidden
          ${!selectedTech ? 'hidden lg:flex' : 'flex'}
        `}>
          {selectedTech ? (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Detail Header */}
              <div className="p-6 md:p-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center gap-6">
                <button
                  onClick={() => setSelectedTech(null)}
                  className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>

                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center text-3xl font-black text-blue-600 shadow-inner border border-blue-100 dark:border-blue-800 shrink-0">
                  {selectedTech.displayName.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedTech.displayName}</h2>
                    {getStatusBadge(selectedTech.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Mail size={16} className="text-blue-500" /> {selectedTech.email}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Phone size={16} className="text-emerald-500" /> {selectedTech.phoneNumber}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Calendar size={16} className="text-amber-500" /> Tham gia: {formatDate(selectedTech.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 md:mt-0 self-end md:self-center">
                  <button
                    onClick={() => navigate(`/audit-logs?email=${selectedTech.email}`)}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all border border-slate-200 dark:border-slate-700"
                    title="Nhật ký hoạt động"
                  >
                    <Activity size={20} />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(selectedTech)}
                    className={`p-2.5 rounded-xl transition-all border ${
                      selectedTech.status === 'active'
                      ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                      : selectedTech.status === 'resigned'
                      ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                    }`}
                    title={selectedTech.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
                    disabled={selectedTech.status === 'resigned'}
                  >
                    {selectedTech.status === 'active' ? <Lock size={20} /> : <Unlock size={20} />}
                  </button>
                  <button
                    onClick={() => setShowFormModal({ visible: true, type: 'edit', tech: selectedTech })}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-slate-200 dark:border-slate-700"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteTech(selectedTech)}
                    className={`p-2.5 rounded-xl transition-all border ${
                      selectedTech.status === 'resigned'
                      ? 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'
                      : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                    }`}
                    title={selectedTech.status === 'resigned' ? 'Khôi phục làm việc' : 'Cho nghỉ việc'}
                  >
                    {selectedTech.status === 'resigned' ? <RotateCcw size={20} /> : <Trash2 size={20} />}
                  </button>
                </div>
              </div>

              {/* Tabs Switcher */}
              <div className="px-6 md:px-8 border-b border-slate-200 dark:border-slate-800 flex gap-8">
                <button
                  onClick={() => setActiveTab('history')}
                  className={`py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${
                    activeTab === 'history'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <History size={16} /> Lịch sử công việc
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('salary')}
                  className={`py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${
                    activeTab === 'salary'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Wallet size={16} /> Tính lương & Thưởng
                  </div>
                </button>
              </div>

              {/* Detail Content Area */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar bg-slate-50/30 dark:bg-transparent">
                {activeTab === 'history' ? (
                  <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                      {[
                        { label: 'Tổng nhiệm vụ', value: techStats?.total || 0, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                        { label: 'Đã hoàn tất', value: techStats?.completed || 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                        { label: 'Đang xử lý', value: techStats?.processing || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                        { label: 'Hủy / Sự cố', value: (techStats?.cancelled || 0) + (techStats?.incident || 0), icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
                      ].map((s, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                          <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center ${s.color} mb-3`}>
                            <s.icon size={20} />
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                          <p className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                          <History size={16} className="text-blue-600" />
                          Lịch sử đơn hàng
                        </h3>
                        <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-500 uppercase">
                          {techOrders.length} Đơn hàng
                        </div>
                      </div>

                      <div className="space-y-3">
                        {isDetailLoading ? (
                          <div className="flex flex-col items-center justify-center py-20 opacity-40">
                            <Loader2 className="animate-spin text-blue-500 mb-2" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Đang tải dữ liệu...</p>
                          </div>
                        ) : techOrders.length > 0 ? (
                          techOrders.map(order => (
                            <div
                              key={order.id}
                              className="group p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:border-blue-400 dark:hover:border-blue-600 transition-all shadow-sm"
                            >
                              <div className=" p-2 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                                #{order.id.slice(-5).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                  <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{order.customerName}</p>
                                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${getOrderStatusColor(order.status)}`}>
                                    {getOrderStatusText(order.status)}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 truncate">
                                  {order.productName || 'Dịch vụ kỹ thuật'}
                                </p>
                              </div>
                              <div className="hidden sm:block text-right">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                  {order.totalAmount?.toLocaleString('vi-VN')}đ
                                </p>
                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                                  {formatDate(order.createdAt)}
                                </p>
                              </div>
                              <button
                                onClick={() => navigate(`/orders?id=${order.id}`)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                                title="Chi tiết đơn hàng"
                              >
                                <ExternalLink size={18} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-4">
                              <Briefcase size={32} className="text-slate-300" />
                            </div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Chưa có nhiệm vụ nào</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                             <Wallet size={80} className="text-blue-600" />
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lương cứng cơ bản</p>
                          <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                             {baseSalary.toLocaleString('vi-VN')}đ
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase">
                             <CheckCircle size={12} /> Cố định hàng tháng
                          </div>
                       </div>

                       <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                             <Award size={80} className="text-emerald-600" />
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tổng thưởng hoa hồng</p>
                          <p className="text-3xl font-black text-emerald-600 mb-1">
                             +{totalCommission.toLocaleString('vi-VN')}đ
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase">
                             <TrendingUp size={12} /> {completedOrders} đơn đã hoàn thành
                          </div>
                       </div>

                       <div className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-500/20 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                             <BarChart3 size={80} className="text-white" />
                          </div>
                          <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-2">Tổng thu nhập dự tính</p>
                          <p className="text-3xl font-black text-white mb-1">
                             {totalSalary.toLocaleString('vi-VN')}đ
                          </p>
                          <p className="text-[10px] font-bold text-blue-100/80 uppercase">Cập nhật theo thời gian thực</p>
                       </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/30 flex items-start gap-4">
                       <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl text-amber-600 shadow-sm">
                          <Info size={24} />
                       </div>
                       <div>
                          <h4 className="font-black text-amber-900 dark:text-amber-100 text-sm uppercase tracking-tight mb-1">Cơ chế tính lương</h4>
                          <p className="text-xs text-amber-800/70 dark:text-amber-200/60 leading-relaxed font-medium">
                             Lương của kỹ thuật viên được tính bằng: <b>Lương cơ bản + (Số đơn hoàn thành × Định mức thưởng mỗi đơn)</b>.
                             Định mức thưởng hiện tại cho nhân sự này là <b>{commissionPerOrder.toLocaleString('vi-VN')}đ/đơn</b>.
                             Bạn có thể thay đổi định mức này trong phần chỉnh sửa thông tin kỹ thuật viên.
                          </p>
                       </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                       <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                          <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Bảng kê đơn hàng tính thưởng</h3>
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-tighter">
                             Chỉ tính đơn trạng thái "Hoàn thành"
                          </span>
                       </div>
                       <div className="p-0">
                          {techOrders.filter(o => o.status === 'completed' || o.status === 'paid').length > 0 ? (
                            <table className="w-full text-left">
                               <thead className="bg-slate-50 dark:bg-slate-900/50">
                                  <tr>
                                     <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Đơn hàng</th>
                                     <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Ngày xong</th>
                                     <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Định mức</th>
                                     <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Thành tiền</th>
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                  {techOrders.filter(o => o.status === 'completed' || o.status === 'paid').map(order => (
                                     <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                           <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[10px] font-black text-blue-600">
                                                 #{order.id.slice(-5).toUpperCase()}
                                              </div>
                                              <div>
                                                 <p className="text-xs font-bold text-slate-900 dark:text-white">{order.customerName}</p>
                                                 <p className="text-[10px] text-slate-400">{order.productName}</p>
                                              </div>
                                           </div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-[11px] font-medium text-slate-500">
                                           {formatDate(order.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-[11px] font-bold text-slate-600 dark:text-slate-300">
                                           {commissionPerOrder.toLocaleString('vi-VN')}đ
                                        </td>
                                        <td className="px-6 py-4 text-right text-[11px] font-black text-emerald-600">
                                           {commissionPerOrder.toLocaleString('vi-VN')}đ
                                        </td>
                                     </tr>
                                  ))}
                               </tbody>
                            </table>
                          ) : (
                             <div className="p-12 text-center opacity-40">
                                <Briefcase size={40} className="mx-auto mb-3 text-slate-300" />
                                <p className="text-xs font-bold uppercase tracking-widest">Chưa có đơn hàng nào được tính thưởng</p>
                             </div>
                          )}
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-transparent">
              <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-[3rem] shadow-xl flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-800">
                <UserIcon size={64} className="text-slate-200" />
              </div>
              <h2 className="text-xl font-black text-slate-400 uppercase tracking-[0.2em]">Chọn kỹ thuật viên</h2>
              <p className="text-slate-400 text-sm mt-3 max-w-xs font-medium">
                Vui lòng chọn một nhân sự từ danh sách bên trái để quản lý thông tin và theo dõi tiến độ công việc.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showFormModal.visible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg"><Zap size={20} /></div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-sm">
                    {showFormModal.type === 'add' ? 'Thêm KTV mới' : 'Cập nhật thông tin'}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Hệ thống AquaCare</p>
                </div>
              </div>
              <button
                onClick={() => setShowFormModal({ ...showFormModal, visible: false })}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Họ và tên</label>
                <input
                  name="displayName"
                  defaultValue={showFormModal.tech?.displayName}
                  onChange={handleInputChange}
                  placeholder="Vd: Nguyễn Văn A"
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.displayName ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl outline-none text-sm focus:ring-2 ring-blue-500/20 dark:text-white transition-all`}
                />
                {errors.displayName && <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1 italic">{errors.displayName}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={showFormModal.tech?.email}
                  onChange={handleInputChange}
                  disabled={showFormModal.type === 'edit'}
                  placeholder="ktv@gmail.com"
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.email ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl outline-none text-sm focus:ring-2 ring-blue-500/20 dark:text-white disabled:opacity-50 transition-all`}
                />
                {errors.email && <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1 italic">{errors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Số điện thoại</label>
                <input
                  name="phoneNumber"
                  defaultValue={showFormModal.tech?.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="09xx xxx xxx"
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.phoneNumber ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl outline-none text-sm focus:ring-2 ring-blue-500/20 dark:text-white transition-all`}
                />
                {errors.phoneNumber && <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1 italic">{errors.phoneNumber}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Lương cơ bản</label>
                    <input
                      name="baseSalary"
                      type="number"
                      defaultValue={showFormModal.tech?.baseSalary || 0}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-emerald-50/30 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl outline-none text-sm focus:ring-2 ring-emerald-500/20 dark:text-white transition-all"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Thưởng mỗi đơn</label>
                    <input
                      name="commissionPerOrder"
                      type="number"
                      defaultValue={showFormModal.tech?.commissionPerOrder || 500000}
                      placeholder="500000"
                      className="w-full px-4 py-3 bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl outline-none text-sm focus:ring-2 ring-blue-500/20 dark:text-white transition-all"
                    />
                 </div>
              </div>

              {showFormModal.type === 'add' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Mật khẩu khởi tạo</label>
                  <input
                    name="password"
                    type="password"
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border ${errors.password ? 'border-rose-500 ring-1 ring-rose-500' : 'border-blue-100 dark:border-blue-800'} rounded-xl outline-none text-sm focus:ring-2 ring-blue-500/20 dark:text-white transition-all`}
                  />
                  {errors.password && <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1 italic">{errors.password}</p>}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 transition-all mt-6 flex items-center justify-center gap-2"
              >
                {showFormModal.type === 'add' ? (
                  <><Plus size={18} /> Tạo tài khoản</>
                ) : (
                  <><CheckCircle size={18} /> Lưu thay đổi</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechniciansPage;
