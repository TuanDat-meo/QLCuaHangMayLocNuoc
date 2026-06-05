import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Search, Mail, Phone, MapPin, Package,
  ShieldCheck, Clock, ExternalLink, Filter, ChevronRight,
  Database, User as UserIcon, MessageSquare, History,
  Eye, X, Calendar, Info
} from 'lucide-react';
import { getAllUsers } from '../../services/userService';
import { AuthUser, UserRole } from '../../types/auth';
import { useNavigate } from 'react-router-dom';

const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // State cho Modal Chi tiết
  const [selectedCustomer, setSelectedCustomer] = useState<AuthUser | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const allUsers = await getAllUsers();
        // Lọc những người có role là Customer (5)
        setCustomers(allUsers.filter(u => u.role === UserRole.CUSTOMER));
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const displayName = c.displayName || '';
      const email = c.email || '';
      const phoneNumber = c.phoneNumber || '';
      return (
        displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phoneNumber.includes(searchTerm)
      );
    });
  }, [customers, searchTerm]);

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] dark:bg-[#0f172a] min-h-screen text-left transition-all font-sans">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-black text-[#0b1c30] dark:text-white uppercase tracking-tight flex items-center gap-3">
            <div className="p-3 bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
               <Users className="text-blue-500" size={28} />
            </div>
            Quản lý Khách hàng
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Tra cứu thông tin, thiết bị và lịch sử bảo hành của khách hàng AquaCare</p>
        </div>

        <div className="relative flex-1 xl:flex-none xl:min-w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input
            type="text" placeholder="Tìm tên, email, số điện thoại khách hàng..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none shadow-sm focus:ring-2 ring-blue-500/10 transition-all"
          />
        </div>
      </div>

      {/* Grid Danh sách */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#1e293b] h-64 rounded-[2.5rem] animate-pulse border border-slate-50 dark:border-slate-800" />
          ))
        ) : filteredCustomers.length > 0 ? filteredCustomers.map(customer => (
          <div key={customer.uid} className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] p-7 border-2 border-transparent hover:border-blue-500/20 transition-all group relative shadow-sm flex flex-col h-full">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl shadow-inner border border-blue-100/50 dark:border-blue-800/50 shrink-0">
                {(customer.displayName || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h3 className="font-black text-[#0b1c30] dark:text-white uppercase tracking-tight text-base leading-tight mb-1 break-words line-clamp-2" title={customer.displayName}>
                  {customer.displayName || 'Chưa đặt tên'}
                </h3>
                <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-400 text-[8px] font-black uppercase rounded border border-slate-100 dark:border-slate-700 tracking-widest">ID: {(customer.uid || '').slice(-6).toUpperCase()}</span>
              </div>
              <button
                onClick={() => {
                  setSelectedCustomer(customer);
                  setIsDetailModalOpen(true);
                }}
                className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all shrink-0"
                title="Xem chi tiết"
              >
                <Eye size={20} />
              </button>
            </div>

            <div className="space-y-3 mb-8 text-left flex-1">
              <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl">
                <Mail size={14} className="text-slate-300 shrink-0" />
                <span className="font-bold text-[11px] dark:text-slate-300 break-all leading-tight">{customer.email || 'Chưa cập nhật email'}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl">
                <Phone size={14} className="text-slate-300 shrink-0" />
                <span className="font-bold text-[11px] dark:text-slate-300 break-all">{customer.phoneNumber || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-slate-50 dark:border-slate-800 rounded-2xl">
                <div className="flex items-center gap-2 text-blue-500 font-black text-[9px] uppercase tracking-widest">
                   <Package size={14} /> Hệ thống AquaCare
                </div>
                <div className="flex items-center gap-2 text-emerald-500 font-black text-[9px] uppercase tracking-widest">
                   <ShieldCheck size={14} /> Hoạt động
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-6 border-t border-slate-50 dark:border-slate-800 mt-auto">
               <button onClick={() => navigate(`/orders?search=${customer.email || ''}`)} className="flex-1 py-3 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-blue-500 rounded-2xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 border border-transparent hover:border-blue-100">
                  <History size={14} /> Đơn hàng
               </button>
               <button onClick={() => navigate(`/devices?uid=${customer.uid || ''}`)} className="flex-1 py-3 bg-[#0b1c30] dark:bg-blue-600 text-white rounded-2xl text-[9px] font-black uppercase shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <Database size={14} /> Thiết bị
               </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-24 flex flex-col items-center justify-center opacity-30">
             <UserIcon size={64} className="mb-4" />
             <p className="font-black uppercase tracking-widest text-sm">Không tìm thấy khách hàng nào</p>
          </div>
        )}
      </div>

      {/* Modal Chi tiết Khách hàng */}
      {isDetailModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0b1c30]/60 backdrop-blur-md">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 border border-white/20">
            {/* Modal Header/Cover */}
            <div className="relative h-44 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="absolute top-6 right-6 p-3 bg-white/20 hover:bg-white/30 rounded-2xl text-white transition-all backdrop-blur-md z-10"
              >
                <X size={24} />
              </button>

              <div className="absolute -bottom-16 left-6 md:left-10 flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 w-full px-4 md:px-0">
                <div className="w-28 h-28 bg-white dark:bg-[#1e293b] rounded-[2rem] p-1.5 shadow-2xl shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-[1.6rem] flex items-center justify-center text-blue-600 font-black text-4xl border border-blue-100 dark:border-blue-800">
                    {(selectedCustomer.displayName || '?').charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="mb-0 md:mb-6 text-center md:text-left flex-1 min-w-0 pr-4 md:pr-10">
                   <h2 className="text-xl md:text-2xl font-black text-white md:text-white drop-shadow-md uppercase tracking-tight break-words line-clamp-2 leading-tight">
                    {selectedCustomer.displayName || 'Chưa đặt tên'}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/10">
                      ID: {selectedCustomer.uid.slice(-8).toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                      selectedCustomer.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/20'
                    }`}>
                      {selectedCustomer.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="pt-24 md:pt-20 px-6 md:px-10 pb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-10 mt-4 md:mt-0">
                <div className="space-y-4">
                  <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 transition-all hover:border-blue-200">
                    <div className="flex items-center gap-4 mb-1">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
                        <Mail size={18} />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Địa chỉ Email</p>
                    </div>
                    <p className="text-sm font-bold dark:text-white pl-12 break-all">{selectedCustomer.email || 'N/A'}</p>
                  </div>

                  <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 transition-all hover:border-blue-200">
                    <div className="flex items-center gap-4 mb-1">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600">
                        <Phone size={18} />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Số điện thoại</p>
                    </div>
                    <p className="text-sm font-bold dark:text-white pl-12 break-all">{selectedCustomer.phoneNumber || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 transition-all hover:border-blue-200">
                    <div className="flex items-center gap-4 mb-1">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600">
                        <Calendar size={18} />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày gia nhập</p>
                    </div>
                    <p className="text-sm font-bold dark:text-white pl-12">
                      {selectedCustomer.createdAt instanceof Date
                        ? selectedCustomer.createdAt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                        : 'N/A'}
                    </p>
                  </div>

                  <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 transition-all hover:border-blue-200">
                    <div className="flex items-center gap-4 mb-1">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600">
                        <Info size={18} />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nguồn khách hàng</p>
                    </div>
                    <p className="text-sm font-bold dark:text-white pl-12 uppercase tracking-tight">
                      {selectedCustomer.source === 'customer_app' ? 'Ứng dụng di động' : 'Quản trị viên tạo'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                 <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      navigate(`/orders?search=${selectedCustomer.email || ''}`);
                    }}
                    className="flex-1 py-4 bg-white dark:bg-[#1e293b] text-blue-600 dark:text-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-blue-50 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center gap-3 shadow-sm"
                  >
                    <History size={18} /> Lịch sử đơn hàng
                  </button>
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      navigate(`/devices?uid=${selectedCustomer.uid || ''}`);
                    }}
                    className="flex-1 py-4 bg-[#0b1c30] dark:bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <Database size={18} /> Quản lý thiết bị
                  </button>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Hệ thống quản trị AquaCare Professional v2.0</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
