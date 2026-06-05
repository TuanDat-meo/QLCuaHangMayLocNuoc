import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck, Search, RefreshCcw, Clock,
  CheckCircle2, User, Smartphone, Calendar,
  ChevronRight, ShieldAlert, Shield, Info,
  AlertTriangle, Filter
} from 'lucide-react';
import { getDevices } from '../../services/deviceService';
import { Device } from '../../types/device';
import { toast, Toaster } from 'react-hot-toast';

const WarrantyPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'expiring_soon'>('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getDevices();
      setDevices(data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu bảo hành:", error);
      toast.error("Không thể kết nối danh sách bảo hành");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const safeToDate = (date: any): Date => {
    if (!date) return new Date();
    if (typeof date.toDate === 'function') return date.toDate();
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const filteredDevices = useMemo(() => {
    const now = new Date();
    return devices.filter(d => {
      const matchesSearch =
        (d.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.serial_number || '').toLowerCase().includes(searchTerm.toLowerCase());

      const expiryDate = safeToDate(d.warranty_until);
      const isExpired = now > expiryDate;
      const isExpiringSoon = !isExpired && (expiryDate.getTime() - now.getTime()) < (30 * 24 * 60 * 60 * 1000);

      if (filter === 'active') return matchesSearch && !isExpired;
      if (filter === 'expired') return matchesSearch && isExpired;
      if (filter === 'expiring_soon') return matchesSearch && isExpiringSoon;
      return matchesSearch;
    });
  }, [devices, searchTerm, filter]);

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: devices.length,
      active: devices.filter(d => safeToDate(d.warranty_until) > now).length,
      expired: devices.filter(d => safeToDate(d.warranty_until) <= now).length,
      expiringSoon: devices.filter(d => {
        const expiry = safeToDate(d.warranty_until);
        return expiry > now && (expiry.getTime() - now.getTime()) < (30 * 24 * 60 * 60 * 1000);
      }).length
    };
  }, [devices]);

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] dark:bg-[#0f172a] min-h-screen font-sans text-left transition-all">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#0b1c30] dark:text-white uppercase tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-emerald-500">
              <ShieldCheck size={28} />
            </div>
            Quản Lý & Theo Dõi Bảo Hành
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-widest mt-1">
            Hệ thống tự động kích hoạt bảo hành theo sản phẩm AquaCare
          </p>
        </div>
        <button onClick={fetchData} className="p-3 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl border border-slate-100 dark:border-slate-800 hover:text-blue-500 transition-all shadow-sm active:scale-90">
          <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[
          { label: 'Sản phẩm lắp đặt', value: stats.total, color: 'text-blue-600', icon: Smartphone, bg: 'bg-blue-50' },
          { label: 'Đang bảo hành', value: stats.active, color: 'text-emerald-600', icon: CheckCircle2, bg: 'bg-emerald-50' },
          { label: 'Sắp hết hạn (30 ngày)', value: stats.expiringSoon, color: 'text-amber-600', icon: Clock, bg: 'bg-amber-50' },
          { label: 'Hết hạn bảo hành', value: stats.expired, color: 'text-rose-600', icon: ShieldAlert, bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#1e293b] p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:translate-y-[-2px]">
            <div className={`w-12 h-12 ${stat.bg} dark:bg-slate-900/50 rounded-2xl flex items-center justify-center ${stat.color} shadow-inner`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
              <p className={`text-xl font-black ${stat.color} dark:text-white`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Table */}
      <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mb-8 transition-all">
        <div className="p-4 md:p-6 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="text" placeholder="Tìm theo tên khách, sản phẩm, serial..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-xs uppercase dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'active', label: 'Còn hạn' },
              { id: 'expiring_soon', label: 'Sắp hết' },
              { id: 'expired', label: 'Hết hạn' }
            ].map(f => (
              <button
                key={f.id} onClick={() => setFilter(f.id as any)}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  filter === f.id ? 'bg-[#0b1c30] text-white border-[#0b1c30] shadow-md' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse min-w-[1000px]">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50">
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Thiết bị & Khách hàng</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ngày kích hoạt</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Thời hạn bảo hành</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                <th className="px-6 py-5 w-[80px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8"><div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-full"></div></td>
                  </tr>
                ))
              ) : filteredDevices.length > 0 ? (
                filteredDevices.map((device) => {
                  const now = new Date();
                  const expiry = safeToDate(device.warranty_until);
                  const isExpired = now > expiry;
                  const isExpiringSoon = !isExpired && (expiry.getTime() - now.getTime()) < (30 * 24 * 60 * 60 * 1000);

                  return (
                    <tr key={device.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm shrink-0">
                            <Smartphone size={18} />
                          </div>
                          <div className="text-left">
                            <p className="font-black text-[#0b1c30] dark:text-white text-xs uppercase truncate max-w-[250px]">{device.product_name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                               <User size={10} className="text-slate-400" />
                               <p className="text-[10px] text-slate-500 font-bold uppercase">{device.customer_name} • {device.customer_phone}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <Calendar size={14} className="text-slate-300 mb-1" />
                          <span className="text-xs font-bold text-slate-500 uppercase">{safeToDate(device.install_date).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <Clock size={14} className={isExpired ? 'text-rose-400' : isExpiringSoon ? 'text-amber-400' : 'text-emerald-400'} />
                          <span className={`text-xs font-black mt-1 ${isExpired ? 'text-rose-500' : isExpiringSoon ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {expiry.toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border ${
                          isExpired ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          isExpiringSoon ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {isExpired ? 'Hết hạn' : isExpiringSoon ? 'Sắp hết hạn' : 'Đang bảo hành'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => window.location.href=`/devices?id=${device.id}`} className="p-2 text-slate-300 hover:text-blue-500 transition-all active:scale-90" title="Chi tiết thiết bị">
                          <ChevronRight size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center opacity-30">
                       <Shield size={56} className="text-slate-400 mb-4" />
                       <p className="text-sm font-black uppercase tracking-widest text-slate-500">Chưa có dữ liệu bảo hành phù hợp</p>
                       <p className="text-[10px] font-bold mt-2 max-w-xs mx-auto">Thiết bị sẽ tự động xuất hiện ở đây khi đơn hàng Lắp đặt được chuyển sang trạng thái "Hoàn tất".</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WarrantyPage;
