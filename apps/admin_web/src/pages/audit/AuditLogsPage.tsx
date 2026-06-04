import React, { useState, useEffect } from 'react';
import {
  History, Search, Filter, Calendar, User,
  Tag, Info, ArrowRight, Clock, Shield, Database,
  Activity, CheckCircle, AlertTriangle, XCircle
} from 'lucide-react';
import { subscribeToAuditLogs, AuditLog } from '../../services/auditService';

const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const unsubscribe = subscribeToAuditLogs((data) => {
      setLogs(data);
    });
    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Vừa xong...';
    try {
      // Xử lý an toàn cho serverTimestamp() placeholder
      if (typeof timestamp === 'object' && !timestamp.toDate && !timestamp.seconds) {
        return 'Đang ghi...';
      }
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      if (isNaN(date.getTime())) return 'Đang ghi...';

      return date.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return 'Vừa xong';
    }
  };

  const getActionColor = (action: string) => {
    const a = action.toLowerCase();
    if (a.includes('tạo') || a.includes('thêm')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (a.includes('cập nhật') || a.includes('sửa')) return 'bg-blue-50 text-blue-600 border-blue-100';
    if (a.includes('xóa') || a.includes('hủy')) return 'bg-rose-50 text-rose-600 border-rose-100';
    return 'bg-slate-50 text-slate-600 border-slate-100';
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resourceType?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'all') return matchesSearch;
    return matchesSearch && log.resourceType === filterType;
  });

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-[#0f172a] p-4 md:p-6 font-sans overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 shrink-0 text-left">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#0b1c30] dark:text-white uppercase tracking-tight flex items-center gap-3">
             <div className="p-2.5 bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <History className="text-[#00459a]" size={24} />
             </div>
             Nhật ký Hệ thống
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] font-medium uppercase tracking-wider mt-1 italic">Truy vết mọi thao tác vận hành trên AquaCare Cloud</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col flex-1 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between text-left shrink-0">
           <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder="Tìm kiếm hành động, người thực hiện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-bold text-xs uppercase dark:text-white"
              />
           </div>
           <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none dark:text-white cursor-pointer"
              >
                <option value="all">Tất cả tài nguyên</option>
                <option value="Đơn hàng">Đơn hàng</option>
                <option value="Sản phẩm">Sản phẩm</option>
                <option value="Người dùng">Người dùng</option>
                <option value="Kho hàng">Kho hàng</option>
              </select>
           </div>
        </div>

        <div className="overflow-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-5">Thời gian</th>
                <th className="px-6 py-5">Nhân sự</th>
                <th className="px-6 py-5">Hành động</th>
                <th className="px-6 py-5">Tài nguyên</th>
                <th className="px-6 py-5">ID Đối tượng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-slate-300" />
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{formatDate(log.timestamp)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-[#00459a] uppercase">
                        {log.userName?.charAt(0)}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase">{log.userName}</span>
                        <span className="text-[9px] font-medium text-slate-400">{log.userEmail}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Database size={12} className="text-slate-300" />
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{log.resourceType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tighter">
                      {log.resourceId?.length > 10 ? `#...${log.resourceId.slice(-6)}` : log.resourceId}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <Activity size={48} className="text-slate-100 dark:text-slate-800 mb-4" />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Không tìm thấy nhật ký phù hợp</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex justify-between items-center text-left">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hiển thị {filteredLogs.length} thao tác gần nhất</p>
          <div className="flex items-center gap-2 text-emerald-500 font-black text-[9px] uppercase tracking-tighter animate-pulse">
            <RefreshCw size={10} className="animate-spin" /> Kết nối thời gian thực (Active)
          </div>
        </div>
      </div>
    </div>
  );
};

const RefreshCw = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
);

export default AuditLogsPage;
