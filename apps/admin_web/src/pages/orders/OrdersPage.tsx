import React, { useState, useEffect } from 'react';
import {
  Search, Calendar, Clock, ChevronRight, User, MapPin,
  CheckCircle, XCircle, UserPlus, Plus, Trash2, Edit,
  Info, Bell, AlertTriangle, ArrowRight, Map as MapIcon, Navigation
} from 'lucide-react';
import { Order, OrderStatus, OrderType } from '../../types/order';
import {
  subscribeToOrders,
  updateOrderStatus,
  assignTechnician,
  addOrder,
  updateOrder,
  deleteOrder,
  getMaintenanceDueOrders
} from '../../services/orderService';
import { getTechnicians } from '../../services/userService';
import { AuthUser } from '../../types/auth';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Province { code: number; name: string; }
interface District { code: number; name: string; }
interface Ward { code: number; name: string; }

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [technicians, setTechnicians] = useState<AuthUser[]>([]);
  const [maintenanceDue, setMaintenanceDue] = useState<Order[]>([]);
  const [showMaintenanceList, setShowMaintenanceList] = useState(false);

  // Administrative data states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // Modal states
  const [showAssignModal, setShowAssignModal] = useState<{orderId: string, visible: boolean}>({ orderId: '', visible: false });
  const [showOrderModal, setShowOrderModal] = useState<{type: 'add' | 'edit' | 'detail', order?: Order, visible: boolean}>({ type: 'add', visible: false });

  const tabs = ['Tất cả', 'Chờ duyệt', 'Đã phân công', 'Đang xử lý', 'Hoàn tất', 'Đã hủy'];

  useEffect(() => {
    const unsubscribe = subscribeToOrders((data) => {
      setOrders(data);
    }, activeTab);
    return () => unsubscribe();
  }, [activeTab]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [techData, dueData, provinceRes] = await Promise.all([
          getTechnicians(),
          getMaintenanceDueOrders(),
          fetch('https://provinces.open-api.vn/api/p/').then(res => res.json())
        ]);
        setTechnicians(techData);
        setMaintenanceDue(dueData);
        setProvinces(provinceRes);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const loadAddrData = async () => {
      if ((showOrderModal.type === 'edit' || showOrderModal.type === 'detail') && showOrderModal.order) {
        const order = showOrderModal.order;
        if (order.provinceCode) {
          const resP = await fetch(`https://provinces.open-api.vn/api/p/${order.provinceCode}?depth=2`);
          const dataP = await resP.json();
          setDistricts(dataP.districts || []);

          if (order.districtCode) {
            const resD = await fetch(`https://provinces.open-api.vn/api/d/${order.districtCode}?depth=2`);
            const dataD = await resD.json();
            setWards(dataD.wards || []);
          }
        }
      }
    };
    if (showOrderModal.visible) loadAddrData();
  }, [showOrderModal.visible, showOrderModal.order, showOrderModal.type]);

  const handleProvinceChange = async (code: string) => {
    if (!code) { setDistricts([]); setWards([]); return; }
    const res = await fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`);
    const data = await res.json();
    setDistricts(data.districts || []);
    setWards([]);
  };

  const handleDistrictChange = async (code: string) => {
    if (!code) { setWards([]); return; }
    const res = await fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`);
    const data = await res.json();
    setWards(data.wards || []);
  };

  const handleAssign = async (techId: string, techName: string) => {
    if (!showAssignModal.orderId) return;
    try {
      await assignTechnician(showAssignModal.orderId, techId, techName);
      setShowAssignModal({ orderId: '', visible: false });
      toast.success(`Đã phân công cho ${techName}`);
    } catch (error) {
      toast.error("Phân công thất bại!");
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) {
      try {
        await deleteOrder(id);
        toast.success("Đã xóa đơn hàng");
      } catch (error) {
        toast.error("Xóa thất bại!");
      }
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const street = formData.get('street') as string;
    const pCode = Number(formData.get('provinceCode'));
    const dCode = Number(formData.get('districtCode'));
    const wCode = Number(formData.get('wardCode'));

    const provinceName = provinces.find(p => p.code === pCode)?.name || '';
    const districtName = districts.find(d => d.code === dCode)?.name || '';
    const wardName = wards.find(w => w.code === wCode)?.name || '';
    const fullAddress = `${street}${wardName ? ', ' + wardName : ''}${districtName ? ', ' + districtName : ''}${provinceName ? ', ' + provinceName : ''}`;

    const data = {
      customerName: formData.get('customerName') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      address: fullAddress,
      street,
      provinceCode: pCode,
      districtCode: dCode,
      wardCode: wCode,
      productName: formData.get('productName') as string,
      totalAmount: formData.get('totalAmount') ? Number(formData.get('totalAmount')) : 0,
      orderType: formData.get('orderType') as OrderType,
      status: (formData.get('status') as OrderStatus) || 'pending',
      note: formData.get('note') as string,
    };

    try {
      if (showOrderModal.type === 'add') {
        await addOrder(data as any);
        toast.success("Thêm đơn hàng thành công");
      } else if (showOrderModal.type === 'edit' && showOrderModal.order) {
        await updateOrder(showOrderModal.order.id, data);
        toast.success("Cập nhật thành công");
      }
      setShowOrderModal({ ...showOrderModal, visible: false });
    } catch (error) {
      toast.error("Thao tác thất bại!");
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50';
      case 'assigned': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50';
      case 'processing': return 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/50';
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50';
      case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'Chờ duyệt';
      case 'assigned': return 'Đã phân công';
      case 'processing': return 'Đang xử lý';
      case 'completed': return 'Hoàn tất';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '---';
    const d = date instanceof Date ? date : date.toDate?.() || new Date(date);
    return d.toLocaleDateString('vi-VN');
  };

  const filteredOrders = orders.filter(o =>
    o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.phoneNumber?.includes(searchTerm)
  );

  return (
    <div className="h-screen p-8 bg-[#f8fafc] dark:bg-[#0f172a] flex flex-col overflow-hidden transition-colors duration-300 font-sans">
      <Toaster position="top-right" />

      {/* Header section (fixed) */}
      <div className="flex justify-between items-start mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-[#0b1c30] dark:text-white tracking-tight uppercase">Hệ thống Đơn hàng</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Quản lý lắp đặt & bảo trì máy lọc nước</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Maintenance Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowMaintenanceList(!showMaintenanceList)}
              className={`p-3 rounded-2xl transition-all relative ${maintenanceDue.length > 0 ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100' : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700'}`}
            >
              <Bell size={20} />
              {maintenanceDue.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#f8fafc] dark:border-[#0f172a]">
                  {maintenanceDue.length}
                </span>
              )}
            </button>

            {showMaintenanceList && (
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <AlertTriangle size={14} className="text-orange-500" /> Sắp đến hạn bảo trì
                  </h3>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {maintenanceDue.length > 0 ? (
                    maintenanceDue.map(order => (
                      <div key={order.id} onClick={() => navigate('/warranty')} className="p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                        <p className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-1">{order.customerName}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{order.productName}</span>
                          <span className="text-[10px] text-orange-600 font-black">Hạn: {formatDate(order.nextMaintenanceDate)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs font-medium">Không có đơn hàng nào sắp đến hạn</div>
                  )}
                </div>
                <button onClick={() => navigate('/warranty')} className="w-full p-3 text-[10px] font-black text-[#00459a] dark:text-blue-400 uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-2">
                  Xem tất cả bảo hành <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowOrderModal({ type: 'add', visible: true })}
            className="flex items-center gap-2 bg-[#00459a] dark:bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus size={18} /> Tạo đơn hàng
          </button>
        </div>
      </div>

      {/* Tabs (fixed) */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 shrink-0 scrollbar-hide">
        {tabs.map((status) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
              activeTab === status ? 'bg-[#0b1c30] text-white border-[#0b1c30] dark:bg-white dark:text-[#0b1c30] shadow-lg' : 'bg-white text-slate-400 border-slate-100 dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Main Order List Section (flexible & scrollable) */}
      <div className="flex-1 min-h-0 bg-white dark:bg-[#1e293b] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors flex flex-col">
        {/* Search Bar (fixed within card) */}
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
            <input
              type="text"
              placeholder="Tìm theo Mã đơn, tên khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl outline-none font-semibold text-sm dark:text-white"
            />
          </div>
        </div>

        {/* Scrollable Table Area */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="sticky top-0 z-10 bg-white dark:bg-[#1e293b]">
              <tr className="bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mã đơn & Ngày tạo</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Khách hàng</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Địa chỉ</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Kỹ thuật viên</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tổng tiền</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-black text-[#0b1c30] dark:text-white text-sm mb-1">{order.id.slice(0, 8).toUpperCase()}</span>
                      <span className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                        <Clock size={12} /> {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{order.customerName}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wider">{order.phoneNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate max-w-[200px] block" title={order.address}>{order.address}</span>
                  </td>
                  <td className="px-6 py-5">
                    {order.technicianName ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                          {order.technicianName.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{order.technicianName}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAssignModal({ orderId: order.id, visible: true })}
                        className="flex items-center gap-1.5 text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-tight hover:underline"
                      >
                        <UserPlus size={14} /> Phân công
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-5 font-black text-[#00459a] dark:text-blue-400 text-sm">
                    {order.totalAmount > 0 ? `${order.totalAmount?.toLocaleString('vi-VN')}đ` : <span className="text-slate-400 dark:text-slate-600 text-[10px] font-bold italic uppercase">Chờ báo giá...</span>}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>{getStatusText(order.status)}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`} target="_blank" rel="noreferrer" className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 rounded-lg transition-colors" title="Xem vị trí"><Navigation size={16} /></a>
                      <button onClick={() => setShowOrderModal({ type: 'detail', order, visible: true })} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 rounded-lg transition-colors" title="Chi tiết"><Info size={16} /></button>
                      <button onClick={() => setShowOrderModal({ type: 'edit', order, visible: true })} className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-500 rounded-lg transition-colors" title="Sửa"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteOrder(order.id)} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 rounded-lg transition-colors" title="Xóa"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showOrderModal.visible && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-black text-[#0b1c30] dark:text-white uppercase tracking-wider text-xs">
                {showOrderModal.type === 'add' ? 'Tạo đơn hàng mới' : showOrderModal.type === 'edit' ? 'Cập nhật đơn hàng' : 'Chi tiết đơn hàng'}
              </h3>
              <button onClick={() => setShowOrderModal({ ...showOrderModal, visible: false })} className="text-slate-400 dark:text-slate-500 hover:text-rose-500 transition-colors"><XCircle size={24} /></button>
            </div>

            <form onSubmit={handleSubmitOrder} className="p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="p-5 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl space-y-4 border border-slate-100 dark:border-slate-800">
                    <h4 className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2"><User size={14} /> Thông tin khách hàng</h4>
                    <input name="customerName" placeholder="Họ và tên" defaultValue={showOrderModal.order?.customerName} readOnly={showOrderModal.type === 'detail'} className="w-full px-5 py-3.5 bg-white dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 ring-blue-100 dark:ring-blue-900/30 font-bold text-sm dark:text-white transition-all" required />
                    <input name="phoneNumber" placeholder="Số điện thoại" defaultValue={showOrderModal.order?.phoneNumber} readOnly={showOrderModal.type === 'detail'} className="w-full px-5 py-3.5 bg-white dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 ring-blue-100 dark:ring-blue-900/30 font-bold text-sm dark:text-white transition-all" required />
                  </div>

                  <div className="p-5 bg-blue-50/30 dark:bg-blue-900/10 rounded-3xl space-y-4 border border-blue-100/50 dark:border-blue-900/20">
                    <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2"><MapIcon size={14} /> Địa chỉ lắp đặt</h4>
                    <select name="provinceCode" defaultValue={showOrderModal.order?.provinceCode || ""} disabled={showOrderModal.type === 'detail'} onChange={(e) => handleProvinceChange(e.target.value)} className="w-full px-5 py-3 bg-white dark:bg-slate-800 border-none rounded-xl text-xs font-bold dark:text-white outline-none ring-1 ring-slate-100 dark:ring-slate-700" required>
                      <option value="">-- Tỉnh/Thành --</option>
                      {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-3">
                      <select name="districtCode" defaultValue={showOrderModal.order?.districtCode || ""} onChange={(e) => handleDistrictChange(e.target.value)} disabled={showOrderModal.type === 'detail' || districts.length === 0} className="px-5 py-3 bg-white dark:bg-slate-800 border-none rounded-xl text-xs font-bold dark:text-white ring-1 ring-slate-100 dark:ring-slate-700" required>
                        <option value="">-- Quận/Huyện --</option>
                        {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                      </select>
                      <select name="wardCode" defaultValue={showOrderModal.order?.wardCode || ""} disabled={showOrderModal.type === 'detail' || wards.length === 0} className="px-5 py-3 bg-white dark:bg-slate-800 border-none rounded-xl text-xs font-bold dark:text-white ring-1 ring-slate-100 dark:ring-slate-700" required>
                        <option value="">-- Phường/Xã --</option>
                        {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                      </select>
                    </div>
                    <input name="street" placeholder="Số nhà, tên đường (Cũ/Mới)" defaultValue={showOrderModal.order?.street} readOnly={showOrderModal.type === 'detail'} className="w-full px-5 py-3 bg-white dark:bg-slate-800 border-none rounded-xl text-xs font-bold dark:text-white ring-1 ring-slate-100 dark:ring-slate-700" required />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-5 bg-amber-50/30 dark:bg-amber-900/10 rounded-3xl space-y-4 border border-amber-100/50 dark:border-amber-900/20">
                    <h4 className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em]">Thông tin đơn hàng</h4>
                    <input name="productName" placeholder="Tên máy/linh kiện" defaultValue={showOrderModal.order?.productName} readOnly={showOrderModal.type === 'detail'} className="w-full px-5 py-3.5 bg-white dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 ring-amber-100 dark:ring-amber-900/30 font-bold text-sm dark:text-white transition-all" required />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1">Báo giá (đ)</label>
                        <input name="totalAmount" type="number" placeholder="KTV sẽ nhập..." defaultValue={showOrderModal.order?.totalAmount || 0} readOnly={showOrderModal.type === 'detail'} className="w-full px-5 py-3 bg-white dark:bg-slate-800 border-none rounded-xl text-sm font-bold dark:text-white" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1">Loại yêu cầu</label>
                        <select name="orderType" defaultValue={showOrderModal.order?.orderType} disabled={showOrderModal.type === 'detail'} className="w-full px-5 py-3 bg-white dark:bg-slate-800 border-none rounded-xl text-sm font-bold dark:text-white">
                          <option value="installation">Lắp đặt</option>
                          <option value="maintenance">Bảo trì</option>
                          <option value="repair">Sửa chữa</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl space-y-4 border border-slate-100 dark:border-slate-800">
                    <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Ghi chú cho KTV</h4>
                    <textarea name="note" placeholder="Mô tả cụ thể vị trí hoặc tình trạng máy..." defaultValue={showOrderModal.order?.note} readOnly={showOrderModal.type === 'detail'} rows={6} className="w-full px-5 py-3.5 bg-white dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 ring-slate-100 dark:ring-slate-700 font-bold text-sm dark:text-white" />
                  </div>
                </div>
              </div>

              {showOrderModal.type !== 'detail' ? (
                <div className="mt-10 flex gap-4">
                  <button type="button" onClick={() => setShowOrderModal({ ...showOrderModal, visible: false })} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Hủy bỏ</button>
                  <button type="submit" className="flex-1 py-4 bg-[#00459a] dark:bg-blue-600 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                    {showOrderModal.type === 'add' ? 'Tạo đơn hàng' : 'Lưu thay đổi'}
                  </button>
                </div>
              ) : (
                <div className="mt-10 pt-6 border-t border-slate-50 dark:border-slate-800">
                  <div className="p-5 bg-blue-50 dark:bg-blue-900/10 rounded-3xl flex items-center justify-between border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#00459a] dark:bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
                         <User size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-[0.2em] mb-1">Kỹ thuật viên phụ trách</p>
                        <p className="font-black text-[#0b1c30] dark:text-white text-base leading-none">{showOrderModal.order?.technicianName || 'Chưa phân công'}</p>
                      </div>
                    </div>
                    {showOrderModal.order?.status === 'pending' && (
                       <button
                        type="button"
                        onClick={() => {
                          setShowAssignModal({ orderId: showOrderModal.order!.id, visible: true });
                          setShowOrderModal({ ...showOrderModal, visible: false });
                        }}
                        className="bg-white dark:bg-slate-800 text-[#00459a] dark:text-blue-400 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-slate-700 shadow-sm hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                       >
                         Phân công ngay
                       </button>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Assign Technician Modal */}
      {showAssignModal.visible && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-black text-[#0b1c30] dark:text-white uppercase tracking-wider text-xs">Phân công kỹ thuật viên</h3>
              <button onClick={() => setShowAssignModal({ orderId: '', visible: false })} className="text-slate-400 dark:text-slate-500 hover:text-rose-500 transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-4 max-h-[450px] overflow-y-auto custom-scrollbar">
              {technicians.map(tech => (
                <button
                  key={tech.uid}
                  onClick={() => handleAssign(tech.uid, tech.displayName)}
                  className="w-full flex items-center gap-5 p-5 rounded-[1.75rem] hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-all text-left group mb-2 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-lg uppercase group-hover:scale-110 transition-transform">{tech.displayName.charAt(0)}</div>
                  <div>
                    <p className="font-black text-slate-800 dark:text-white text-sm uppercase">{tech.displayName}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{tech.phoneNumber}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
