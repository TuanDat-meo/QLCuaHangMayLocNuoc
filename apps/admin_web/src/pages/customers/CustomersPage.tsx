import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Search, Mail, Phone, MapPin, Package,
  ShieldCheck, Clock, ExternalLink, Filter, ChevronRight,
  Database, User as UserIcon, MessageSquare, History
} from 'lucide-react';
import { getAllUsers } from '../../services/userService';
import { AuthUser, UserRole } from '../../types/auth';
import { useNavigate } from 'react-router-dom';

const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    return customers.filter(c =>
      c.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phoneNumber.includes(searchTerm)
    );
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
          <div key={customer.uid} className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] p-7 border-2 border-transparent hover:border-blue-500/20 transition-all group relative shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl shadow-inner border border-blue-100/50 dark:border-blue-800/50">
                {customer.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h3 className="font-black text-[#0b1c30] dark:text-white truncate uppercase tracking-tight text-base leading-none mb-1">{customer.displayName}</h3>
                <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-400 text-[8px] font-black uppercase rounded border border-slate-100 dark:border-slate-700 tracking-widest">ID: {customer.uid.slice(-6).toUpperCase()}</span>
              </div>
            </div>

            <div className="space-y-3 mb-8 text-left">
              <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl">
                <Mail size={14} className="text-slate-300 shrink-0" />
                <span className="font-bold text-[11px] truncate dark:text-slate-300">{customer.email}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl">
                <Phone size={14} className="text-slate-300 shrink-0" />
                <span className="font-bold text-[11px] dark:text-slate-300">{customer.phoneNumber || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-slate-50 dark:border-slate-800 rounded-2xl">
                <div className="flex items-center gap-2 text-blue-500 font-black text-[9px] uppercase tracking-widest">
                   <Package size={14} /> 2 Thiết bị
                </div>
                <div className="flex items-center gap-2 text-emerald-500 font-black text-[9px] uppercase tracking-widest">
                   <ShieldCheck size={14} /> Bảo hành ok
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-6 border-t border-slate-50 dark:border-slate-800">
               <button onClick={() => navigate(`/orders?search=${customer.email}`)} className="flex-1 py-3 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-blue-500 rounded-2xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 border border-transparent hover:border-blue-100">
                  <History size={14} /> Đơn hàng
               </button>
               <button onClick={() => navigate(`/devices?uid=${customer.uid}`)} className="flex-1 py-3 bg-[#0b1c30] dark:bg-blue-600 text-white rounded-2xl text-[9px] font-black uppercase shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
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
    </div>
  );
};

export default CustomersPage;
