import React, { useState, useEffect, useMemo } from 'react';
import {
  Database, Search, RefreshCcw, Filter,
  Eye, Edit3, Trash2, X, CheckCircle2,
  Clock, AlertTriangle, ShieldCheck, MapPin,
  Calendar, User, Package, History as HistoryIcon,
  Smartphone, QrCode, FileText
} from 'lucide-react';
import {
  getDevices,
  updateDevice,
  getDeviceHistory,
  Device,
  DeviceHistory
} from '../../services/deviceService';
import { toast } from 'react-hot-toast';
import { logActivity } from '../../services/auditService';

const DevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const [showModal, setShowModal] = useState<{
    visible: boolean,
    type: 'detail' | 'edit',
    device?: Device
  }>({ visible: false, type: 'detail' });

  const [deviceHistory, setDeviceHistory] = useState<DeviceHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getDevices();
      setDevices(data);
    } catch (error) {
      console.error("Error fetching devices:", error);
      toast.error("Không thể tải danh sách thiết bị");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchHistory = async (deviceId: string) => {
    setLoadingHistory(true);
    try {
      const history = await getDeviceHistory(deviceId);
      setDeviceHistory(history);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredDevices = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return devices.filter(d => {
      const matchesStatus = statusFilter === 'All' || d.status === statusFilter;

      if (!term) return matchesStatus;

      const searchFields = [
        d.serial_number,
        d.customer_name,
        d.customer_phone,
        d.product_name,
        d.did,
        d.notes,
        d.address
      ].map(v => (v || '').toLowerCase());

      const matchesSearch = searchFields.some(field => field.includes(term));

      return matchesSearch && matchesStatus;
    });
  }, [devices, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    total: devices.length,
    active: devices.filter(d => d.status === 'active').length,
    maintenance: devices.filter(d => d.status === 'maintenance_due').length,
    warranty_ended: devices.filter(d => d.status === 'warranty_ended').length,
  }), [devices]);

  const handleUpdateStatus = async (id: string, newStatus: Device['status']) => {
    try {
      await updateDevice(id, { status: newStatus });
      toast.success("Đã cập nhật trạng thái thiết bị");
      await logActivity("Cập nhật trạng thái thiết bị", "Thiết bị", id, { status: newStatus });
      fetchData();
    } catch (error) {
      toast.error("Thao tác thất bại");
    }
  };

  const handleOpenDetail = (device: Device) => {
    setShowModal({ visible: true, type: 'detail', device });
    fetchHistory(device.id);
  };

  const getStatusBadge = (status: Device['status']) => {
    switch (status) {
      case 'active':
        return <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/50">Đang hoạt động</span>;
      case 'installing':
        return <span className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/50">Đang lắp đặt</span>;
      case 'maintenance_due':
        return <span className="bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-100 dark:border-amber-900/50">Cần bảo trì</span>;
      case 'warranty_ended':
        return <span className="bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-rose-100 dark:border-rose-900/50">Hết bảo hành</span>;
      case 'deactivated':
        return <span className="bg-slate-50 text-slate-600 dark:bg-slate-900/20 dark:text-slate-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-800">Ngừng kích hoạt</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] dark:bg-[#0f172a] min-h-screen transition-colors duration-300 font-sans">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#0b1c30] dark:text-white tracking-tight uppercase flex items-center gap-3">
            <Database className="text-blue-600" size={28} />
            Thiết Bị Lắp Đặt
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-widest mt-1">
            Quản lý vòng đời và bảo hành thiết bị khách hàng
          </p>
        </div>
        <div className="flex gap-2">
           <button
             onClick={fetchData}
             className="p-3 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl border border-slate-100 dark:border-slate-800 hover:text-blue-500 transition-all shadow-sm active:scale-90"
           >
             <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
           </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[
          { label: 'Tổng thiết bị', value: stats.total, color: 'text-blue-600', icon: Smartphone, bg: 'bg-blue-50' },
          { label: 'Đang hoạt động', value: stats.active, color: 'text-emerald-600', icon: CheckCircle2, bg: 'bg-emerald-50' },
          { label: 'Cần bảo trì', value: stats.maintenance, color: 'text-amber-600', icon: AlertTriangle, bg: 'bg-amber-50' },
          { label: 'Hết bảo hành', value: stats.warranty_ended, color: 'text-rose-600', icon: Clock, bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#1e293b] p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:translate-y-[-2px]">
            <div className={`w-12 h-12 ${stat.bg} dark:bg-slate-900/50 rounded-2xl flex items-center justify-center ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
              <p className={`text-xl font-black ${stat.color} dark:text-white`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mb-8 transition-colors">
        <div className="p-4 md:p-6 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
            <input
              type="text"
              placeholder="Tìm theo Serial, Tên khách hàng, Sản phẩm, SĐT, Ghi chú..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 rounded-2xl outline-none focus:ring-2 ring-blue-500/10 font-bold text-xs uppercase dark:text-white placeholder:normal-case"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {['All', 'active', 'maintenance_due', 'warranty_ended', 'installing'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                  statusFilter === status
                  ? 'bg-[#0b1c30] text-white border-[#0b1c30] dark:bg-white dark:text-[#0b1c30] shadow-md'
                  : 'bg-white dark:bg-slate-900/50 text-slate-400 border-slate-100 dark:border-slate-800'
                }`}
              >
                {status === 'All' ? 'Tất cả' :
                 status === 'active' ? 'Hoạt động' :
                 status === 'maintenance_due' ? 'Cần bảo trì' :
                 status === 'warranty_ended' ? 'Hết BH' : 'Đang lắp'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse min-w-[1000px]">
            <thead className="bg-slate-50 dark:bg-[#1e293b]">
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Thiết bị / Serial</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Khách hàng</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ngày lắp đặt</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Hết hạn BH</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                <th className="px-6 py-5 w-[100px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8"><div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-xl w-full"></div></td>
                  </tr>
                ))
              ) : filteredDevices.map((device) => (
                <tr key={device.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                        <Smartphone size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-[#0b1c30] dark:text-white text-xs uppercase truncate">{device.product_name || 'Sản phẩm không tên'}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">SN: {device.serial_number || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">{device.customer_name || 'Khách lẻ'}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{device.customer_phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-bold text-slate-500">
                      {device.install_date instanceof Date ? device.install_date.toLocaleDateString('vi-VN') : (device.install_date as any)?.toDate?.()?.toLocaleDateString('vi-VN') || '---'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-xs font-black ${new Date() > (device.warranty_until as any)?.toDate?.() ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {device.warranty_until instanceof Date ? device.warranty_until.toLocaleDateString('vi-VN') : (device.warranty_until as any)?.toDate?.()?.toLocaleDateString('vi-VN') || '---'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(device.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleOpenDetail(device)}
                      className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredDevices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400 uppercase font-black text-xs tracking-widest">
                    Không tìm thấy thiết bị nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showModal.visible && showModal.device && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Smartphone size={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm">
                    Chi tiết thiết bị
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">ID: {showModal.device.did}</p>
                </div>
              </div>
              <button onClick={() => setShowModal({ ...showModal, visible: false })} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Info Column */}
                <div className="lg:col-span-2 space-y-8">
                  {/* General Info */}
                  <div className="bg-slate-50 dark:bg-slate-900/30 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800">
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <FileText size={14} /> Thông tin chung
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">Sản phẩm</label>
                        <p className="text-xs font-black text-slate-700 dark:text-white uppercase">{showModal.device.product_name}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">Serial Number</label>
                        <p className="text-xs font-black text-[#0b1c30] dark:text-white">{showModal.device.serial_number}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">Khách hàng</label>
                        <p className="text-xs font-black text-slate-700 dark:text-white uppercase">{showModal.device.customer_name}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">Số điện thoại</label>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{showModal.device.customer_phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Warranty Info */}
                  <div className="bg-white dark:bg-[#1e293b] rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <ShieldCheck size={14} /> Thời hạn bảo hành
                    </h4>
                    <div className="flex items-center gap-8">
                      <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">Kích hoạt</label>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-300" />
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                             {(showModal.device.install_date as any)?.toDate?.()?.toLocaleDateString('vi-VN') || '---'}
                          </p>
                        </div>
                      </div>
                      <div className="w-px h-10 bg-slate-100 dark:bg-slate-800"></div>
                      <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">Hết hạn</label>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-rose-400" />
                          <p className="text-xs font-black text-rose-500">
                            {(showModal.device.warranty_until as any)?.toDate?.()?.toLocaleDateString('vi-VN') || '---'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Ghi chú kỹ thuật</label>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 italic">
                      {showModal.device.notes || "Không có ghi chú nào."}
                    </div>
                  </div>
                </div>

                {/* Status & History Column */}
                <div className="space-y-6">
                  <div className="bg-white dark:bg-[#1e293b] p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-4">Trạng thái hiện tại</label>
                    <div className="mb-6">
                      {getStatusBadge(showModal.device.status)}
                    </div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-2">Thay đổi nhanh</label>
                    <div className="flex flex-wrap gap-2">
                      {['active', 'maintenance_due', 'deactivated'].map((st) => (
                        <button
                          key={st}
                          disabled={showModal.device?.status === st}
                          onClick={() => handleUpdateStatus(showModal.device!.id, st as any)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                            showModal.device?.status === st
                            ? 'bg-slate-100 text-slate-400'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          }`}
                        >
                          {st === 'active' ? 'Hoạt động' : st === 'maintenance_due' ? 'Bảo trì' : 'Ngừng'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Activity Timeline */}
                  <div className="bg-white dark:bg-[#1e293b] p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[10px] font-black text-slate-800 dark:text-white uppercase flex items-center gap-2">
                        <HistoryIcon size={14} /> Lịch sử thiết bị
                      </h4>
                    </div>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                      {loadingHistory ? (
                        <div className="flex justify-center py-4"><RefreshCcw className="animate-spin text-slate-300" size={20} /></div>
                      ) : deviceHistory.length > 0 ? (
                        deviceHistory.map((h, i) => (
                          <div key={h.id} className="relative pl-6 pb-4 border-l-2 border-slate-100 dark:border-slate-800 last:pb-0">
                            <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-blue-500"></div>
                            <p className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase leading-none">{h.event}</p>
                            <p className="text-[9px] text-slate-400 mt-1">{h.description}</p>
                            <p className="text-[8px] font-bold text-slate-300 uppercase mt-1">
                              {(h.performed_at as any)?.toDate?.()?.toLocaleString('vi-VN') || '---'} • {h.performed_by_name || 'Hệ thống'}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-slate-400 text-center py-4 italic">Chưa có lịch sử thao tác</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex justify-end gap-3">
              <button
                onClick={() => setShowModal({ ...showModal, visible: false })}
                className="px-8 py-3 bg-white dark:bg-slate-800 text-slate-500 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-slate-100 dark:border-slate-800 hover:bg-slate-50 transition-all"
              >
                Đóng
              </button>
              <button className="px-8 py-3 bg-[#0b1c30] dark:bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2">
                <QrCode size={16} /> Xuất mã QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevicesPage;
