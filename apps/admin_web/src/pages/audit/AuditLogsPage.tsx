import React, { useState, useEffect } from 'react';
import { Clock, Search, User, Activity, FileText, Calendar, Filter, XCircle, ChevronRight, Info, Database } from 'lucide-react';
import { AuditLog, subscribeToAuditLogs } from '../../services/auditService';
import { useSearchParams } from 'react-router-dom';

const AuditLogsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('email') || searchParams.get('search') || '';

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [filterType, setFilterType] = useState('Tất cả');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuditLogs((data) => {
      setLogs(data);
    });
    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '---';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredLogs = logs.filter(log => {
    const matchSearch =
      log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resourceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resourceId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchType = filterType === 'Tất cả' || log.resourceType === filterType;

    return matchSearch && matchType;
  });

  const resourceTypes = ['Tất cả', ...Array.from(new Set(logs.map(l => l.resourceType).filter(Boolean)))];

  const handleOpenDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const renderValue = (val: any): React.ReactNode => {
    if (val === null || val === undefined) return '---';
    if (Array.isArray(val)) {
      return (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {val.map((item, i) => (
            <span key={i} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] font-black border border-blue-100 dark:border-blue-800 uppercase tracking-tight">
              {typeof item === 'object' ? (item.name || item.tenSanPham || JSON.stringify(item)) : String(item)}
            </span>
          ))}
        </div>
      );
    }
    if (typeof val === 'object') {
      if (val.seconds) return formatDate(val);
      return (
        <pre className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800/40 p-3 rounded-xl mt-2 overflow-x-auto max-w-full custom-scrollbar whitespace-pre-wrap break-all leading-normal text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800/50 shadow-inner">
          {JSON.stringify(val, null, 2)}
        </pre>
      );
    }
    return String(val);
  };

  const DetailItem = ({ label, value, isNew }: { label: string, value: any, isNew?: boolean }) => {
    if (['id', 'uid', 'timestamp', 'before', 'userId', 'userEmail', 'userName'].includes(label)) return null;
    const isLong = String(value).length > 60 || typeof value === 'object';

    return (
      <div className={`p-5 rounded-2xl border transition-all ${isLong ? 'sm:col-span-2' : ''} ${isNew ? 'bg-emerald-50/20 border-emerald-100/50 dark:bg-emerald-900/10 dark:border-emerald-800/30 shadow-sm' : 'bg-slate-50/30 border-slate-100 dark:bg-slate-900/30 dark:border-slate-800/50 shadow-inner'}`}>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 break-words leading-relaxed">
          {renderValue(value)}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-300 font-sans p-4 md:p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#0b1c30] dark:text-white tracking-tight uppercase">Nhật ký hệ thống</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] font-medium uppercase tracking-wider">Hệ thống giám sát vận hành AquaCare</p>
        </div>
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="px-4 py-2 bg-rose-50 text-rose-500 rounded-xl font-black text-[10px] uppercase border border-rose-100">Xóa bộ lọc tìm kiếm</button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 shrink-0 scrollbar-hide">
        {resourceTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${
              filterType === type
                ? 'bg-[#0b1c30] text-white border-[#0b1c30] dark:bg-white dark:text-[#0b1c30] shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700 hover:bg-slate-50 shadow-sm'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 bg-white dark:bg-[#1e293b] rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors">
        <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-900/20">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input
              type="text"
              placeholder="Tìm theo người dùng, hành động, đối tượng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 ring-blue-500/10 font-semibold text-xs dark:text-white transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="sticky top-0 z-10 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md">
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Người thực hiện</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hành động</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Đối tượng</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-[10px]">
                      <Clock size={14} className="text-blue-500/60 shrink-0" />
                      <span className="whitespace-nowrap uppercase tracking-tighter">{formatDate(log.timestamp)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase border border-blue-100 dark:border-blue-800 shrink-0">
                        {log.userName?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 dark:text-white uppercase leading-tight truncate">{log.userName}</p>
                        <p className="text-[9px] text-slate-400 font-bold truncate tracking-tighter">{log.userEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm inline-block whitespace-nowrap ${
                      log.action === 'Xóa' || log.action?.includes('Khóa') ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400' :
                      log.action.includes('Tạo') || log.action?.includes('duyệt') ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400' :
                      'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                      <FileText size={14} className="text-slate-300 shrink-0" />
                      <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md text-slate-400 whitespace-nowrap tracking-tighter text-[9px]">{log.resourceType}</span>
                      <span className="text-slate-800 dark:text-slate-200 font-mono truncate max-w-[150px]" title={log.resourceId}>{log.resourceId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button
                        onClick={() => handleOpenDetail(log)}
                        className="p-2 hover:bg-[#0b1c30] hover:text-white dark:hover:bg-white dark:hover:text-[#0b1c30] rounded-xl text-slate-400 transition-all shadow-sm border border-transparent hover:border-slate-100"
                        title="Xem chi tiết"
                      >
                        <Info size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-300">
              <Activity size={48} className="mb-4 opacity-10" />
              <p className="text-xs font-black uppercase tracking-widest">Không tìm thấy nhật ký</p>
            </div>
          )}
        </div>
      </div>

      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-200 border border-slate-100 dark:border-slate-800">
            <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900 shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#0b1c30] text-white rounded-2xl shadow-lg"><Database size={24} /></div>
                <div>
                  <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm">Dữ liệu hoạt động</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hệ thống xử lý AquaCare</p>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-300 hover:text-rose-500 transition-colors transform hover:rotate-90 duration-200 shrink-0"><XCircle size={32} /></button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div className="p-5 bg-slate-50/30 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2"><User size={12} /> Người thực hiện</p>
                  <p className="text-xs font-black text-slate-800 dark:text-white uppercase break-words leading-none">{selectedLog.userName}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1.5 break-words">{selectedLog.userEmail}</p>
                </div>
                <div className="p-5 bg-slate-50/30 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Clock size={12} /> Thời gian ghi nhận</p>
                  <p className="text-xs font-black text-slate-800 dark:text-white uppercase">{formatDate(selectedLog.timestamp)}</p>
                  <p className="text-[10px] text-emerald-500 font-bold mt-1.5 uppercase tracking-wider">Hoạt động: {selectedLog.action}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4"><div className="w-1.5 h-4 bg-blue-500 rounded-full"></div><h4 className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Dữ liệu chi tiết hành động</h4></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(selectedLog.details || {}).map(([key, value]) => (
                      <DetailItem key={key} label={key} value={value} isNew={!!selectedLog.details?.before} />
                    ))}
                  </div>
                </div>

                {selectedLog.details?.before && (
                  <div className="mt-8 pt-8 border-t border-dashed border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-4"><div className="w-1.5 h-4 bg-slate-300 rounded-full"></div><h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Trạng thái dữ liệu gốc</h4></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-70 grayscale-[0.2]">
                      {Object.entries(selectedLog.details.before).map(([key, value]) => (
                        <DetailItem key={key} label={key} value={value} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-8 py-5 bg-white dark:bg-[#1e293b] border-t border-slate-100 dark:border-slate-800 shrink-0">
              <button onClick={() => setShowDetailModal(false)} className="w-full py-3 bg-[#0b1c30] dark:bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/10 hover:brightness-110 active:scale-[0.98] transition-all">Hoàn tất đối soát dữ liệu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
