import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Calendar, Clock, ChevronRight, User, MapPin,
  CheckCircle, XCircle, UserPlus, Plus, Trash2, Edit,
  Info, Bell, AlertTriangle, ArrowRight, Map as MapIcon, Navigation,
  Package, LayoutGrid, DollarSign, FileText, Activity, ShoppingCart, Minus,
  AlertOctagon, CreditCard, Briefcase, UserCheck, ShieldCheck, History
} from 'lucide-react';
import { Order, OrderStatus, OrderType, OrderItem } from '../../types/order';
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
import { getProducts, Product } from '../../services/productService';
import { AuthUser, UserRole } from '../../types/auth';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { logActivity } from '../../services/auditService';
import { useAuth } from '../../hooks/useAuth';

interface Province { code: number; name: string; }
interface District { code: number; name: string; }
interface Ward { code: number; name: string; }

function getStatusColor(status: OrderStatus) {
  switch (status) {
    case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400';
    case 'assigned': return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
    case 'processing': return 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400';
    case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400';
    case 'paid': return 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400';
    case 'incident': return 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400';
    case 'cancelled': return 'bg-slate-50 text-slate-400 border-slate-100 dark:bg-slate-800 dark:text-slate-500';
    case 'deleted': return 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-500';
    default: return 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400';
  }
}

function getStatusText(status: OrderStatus) {
  const map: Record<string, string> = {
    pending: 'Chờ duyệt',
    assigned: 'Đã phân công',
    processing: 'Đang xử lý',
    completed: 'Đã hoàn thành',
    paid: 'Đã tất toán',
    incident: 'Sự cố',
    cancelled: 'Đã hủy',
    deleted: 'Đã xóa'
  };
  return map[status] || status;
}

function formatDate(date: any) {
  if (!date) return '---';
  const d = date instanceof Date ? date : date.toDate?.() || new Date(date);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderIdFromUrl = searchParams.get('id');
  const { user } = useAuth();

  // Quyền truy cập theo vai trò AquaCare
  const isAdmin = user?.role === UserRole.ADMIN;
  const isCoordinator = user?.role === UserRole.COORDINATOR || isAdmin;
  const isAccountant = user?.role === UserRole.ACCOUNTANT || isAdmin;

  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [technicians, setTechnicians] = useState<AuthUser[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const productInputRef = useRef<HTMLDivElement>(null);

  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [manualTotalAmount, setManualTotalAmount] = useState<number | null>(null);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formDataState, setFormDataState] = useState({
    customerName: '',
    phoneNumber: '',
    provinceCode: '',
    districtCode: '',
    wardCode: '',
    street: '',
    orderType: 'installation' as OrderType,
    status: 'pending' as OrderStatus,
    note: ''
  });

  const [showAssignModal, setShowAssignModal] = useState<{orderId: string, visible: boolean}>({ orderId: '', visible: false });
  const [showOrderModal, setShowOrderModal] = useState<{type: 'add' | 'edit' | 'detail', order?: Order, visible: boolean}>({ type: 'add', visible: false });

  const tabs = ['Tất cả', 'Chờ duyệt', 'Đã phân công', 'Đang xử lý', 'Hoàn tất', 'Sự cố', 'Đã tất toán'];

  useEffect(() => {
    const unsubscribe = subscribeToOrders((data) => setOrders(data), activeTab);
    return () => unsubscribe();
  }, [activeTab]);

  useEffect(() => {
    if (orderIdFromUrl && orders.length > 0) {
      const order = orders.find(o => o.id === orderIdFromUrl);
      if (order) setShowOrderModal({ type: 'detail', order, visible: true });
    }
  }, [orderIdFromUrl, orders]);

  const fetchInitialData = async () => {
    try {
      const [techData, provinceRes, productsData] = await Promise.all([
        getTechnicians(),
        fetch('https://provinces.open-api.vn/api/p/').then(res => res.json()),
        getProducts()
      ]);
      setTechnicians(techData);
      setProvinces(provinceRes);
      setAvailableProducts(productsData);
    } catch (error) { console.error("Error fetching initial data:", error); }
  };

  useEffect(() => { fetchInitialData(); }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productInputRef.current && !productInputRef.current.contains(event.target as Node)) {
        setShowProductSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadModalData = async () => {
      setErrors({});
      if ((showOrderModal.type === 'edit' || showOrderModal.type === 'detail') && showOrderModal.order) {
        const order = showOrderModal.order;
        setFormDataState({
          customerName: order.customerName || '',
          phoneNumber: order.phoneNumber || '',
          provinceCode: order.provinceCode ? String(order.provinceCode) : '',
          districtCode: order.districtCode ? String(order.districtCode) : '',
          wardCode: order.wardCode ? String(order.wardCode) : '',
          street: order.street || '',
          orderType: order.orderType || 'installation',
          status: order.status || 'pending',
          note: order.note || ''
        });

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

        if (order.items && order.items.length > 0) setSelectedItems(order.items);
        else if (order.productName) setSelectedItems([{ id: 'legacy', name: order.productName, price: order.totalAmount, quantity: 1 }]);
        else setSelectedItems([]);

        setManualTotalAmount(order.totalAmount);
      } else {
        setFormDataState({
          customerName: '', phoneNumber: '', provinceCode: '', districtCode: '', wardCode: '',
          street: '', orderType: 'installation', status: 'pending', note: ''
        });
        setSelectedItems([]);
        setManualTotalAmount(null);
        setDistricts([]);
        setWards([]);
      }
      setProductSearch('');
    };
    if (showOrderModal.visible) loadModalData();
  }, [showOrderModal.visible, showOrderModal.order, showOrderModal.type]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormDataState(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    if (manualTotalAmount !== null && selectedItems.length === 1 && selectedItems[0].id === 'legacy') return manualTotalAmount;
    return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleAddProduct = (product: Product) => {
    const stock = Number(product.tonKho || 0);
    if (stock <= 0) { toast.error("Sản phẩm đã hết hàng!"); return; }
    const existing = selectedItems.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= stock) { toast.error("Số lượng trong kho không đủ!"); return; }
      setSelectedItems(selectedItems.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setSelectedItems([...selectedItems, { id: product.id, name: product.tenSanPham, price: product.giaBan, quantity: 1 }]);
    }
    setProductSearch('');
    setShowProductSuggestions(false);
  };

  const handleProvinceChange = async (code: string) => {
    setFormDataState(prev => ({ ...prev, provinceCode: code, districtCode: '', wardCode: '' }));
    if (!code) { setDistricts([]); setWards([]); return; }
    const res = await fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`);
    const data = await res.json();
    setDistricts(data.districts || []);
    setWards([]);
  };

  const handleDistrictChange = async (code: string) => {
    setFormDataState(prev => ({ ...prev, districtCode: code, wardCode: '' }));
    if (!code) { setWards([]); return; }
    const res = await fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`);
    const data = await res.json();
    setWards(data.wards || []);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formDataState.customerName.trim()) newErrors.customerName = "Vui lòng nhập tên khách hàng";
    const phone = formDataState.phoneNumber.trim().replace(/\s/g, '');
    if (!phone) newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
    else if (!/^(0|84|\+84)[0-9]{9,10}$/.test(phone)) newErrors.phoneNumber = "Số điện thoại không hợp lệ";
    if (!formDataState.provinceCode) newErrors.provinceCode = "Vui lòng chọn Tỉnh/Thành";
    if (!formDataState.districtCode) newErrors.districtCode = "Vui lòng chọn Quận/Huyện";
    if (!formDataState.wardCode) newErrors.wardCode = "Vui lòng chọn Phường/Xã";
    if (!formDataState.street.trim()) newErrors.street = "Vui lòng nhập địa chỉ chi tiết";
    if (selectedItems.length === 0) newErrors.products = "Vui lòng chọn ít nhất một sản phẩm";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) { toast.error("Vui lòng kiểm tra lại thông tin!"); return; }
    const pCode = Number(formDataState.provinceCode);
    const dCode = Number(formDataState.districtCode);
    const wCode = Number(formDataState.wardCode);
    const pName = provinces.find(p => p.code === pCode)?.name;
    const dName = districts.find(d => d.code === dCode)?.name;
    const wName = wards.find(w => w.code === wCode)?.name;

    const data: any = {
      ...formDataState,
      provinceCode: pCode, districtCode: dCode, wardCode: wCode,
      address: `${formDataState.street}, ${wName}, ${dName}, ${pName}`,
      productName: selectedItems.map(item => item.quantity > 1 ? `${item.name} (x${item.quantity})` : item.name).join(', '),
      items: selectedItems,
      totalAmount: manualTotalAmount !== null ? manualTotalAmount : calculateTotal(),
      updatedBy: user?.uid,
      updatedByName: user?.displayName,
    };

    try {
      if (showOrderModal.type === 'add') {
        data.createdBy = user?.uid;
        data.createdByName = user?.displayName;
        await addOrder(data);
        await logActivity("Tạo đơn hàng mới", "Đơn hàng", "Mới", { client: data.customerName, amount: data.totalAmount });
        toast.success("Tạo đơn hàng thành công!");
      } else if (showOrderModal.type === 'edit' && showOrderModal.order) {
        await updateOrder(showOrderModal.order.id, data);
        await logActivity("Cập nhật đơn hàng", "Đơn hàng", showOrderModal.order.id, { before: showOrderModal.order, after: data });
        toast.success("Cập nhật thành công");
      }
      setShowOrderModal({ ...showOrderModal, visible: false });
    } catch (error) { toast.error("Thao tác thất bại!"); }
  };

  const handleUpdateStatus = async (orderId: string, currentStatus: OrderStatus, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      const actionText = newStatus === 'paid' ? "Xác nhận COD" : `Chuyển sang: ${getStatusText(newStatus)}`;
      await logActivity(actionText, "Đơn hàng", orderId, { from: currentStatus, to: newStatus });
      toast.success(`Đã chuyển sang: ${getStatusText(newStatus)}`);
    } catch (error) { toast.error("Thao tác thất bại!"); }
  };

  const handleAssign = async (techId: string, techName: string) => {
    try {
      await assignTechnician(showAssignModal.orderId, techId, techName);
      await logActivity("Phân công kỹ thuật viên", "Đơn hàng", showAssignModal.orderId, { technician: techName });
      toast.success(`Đã phân công cho ${techName}`);
      setShowAssignModal({ orderId: '', visible: false });
    } catch (error) { toast.error("Phân công thất bại!"); }
  };

  const getValidNextStatusesForModal = (currentStatus: OrderStatus): OrderStatus[] => {
    const allStatuses: OrderStatus[] = ['pending', 'assigned', 'processing', 'completed', 'incident', 'paid', 'cancelled'];
    if (isAdmin) return allStatuses;
    return allStatuses.filter(s => s !== 'deleted');
  };

  const filteredProducts = availableProducts.filter(p => p.tenSanPham.toLowerCase().includes(productSearch.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-300 font-sans p-4 md:p-6 overflow-hidden">
      <Toaster position="top-right" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 shrink-0 text-left">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#0b1c30] dark:text-white uppercase tracking-tight flex items-center gap-3">
             <div className="p-2.5 bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <ShoppingCart className="text-[#00459a]" size={24} />
             </div>
             Trung tâm Đơn hàng
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] font-medium uppercase tracking-wider mt-1">Điều phối nhân sự & Nghiệp vụ tài chính AquaCare</p>
        </div>
        {isCoordinator && (
          <button onClick={() => setShowOrderModal({ type: 'add', visible: true })} className="flex items-center gap-2 bg-[#00459a] text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase shadow-lg shadow-blue-500/20 hover:brightness-110 active:scale-95 transition-all"><Plus size={18} /> Tạo đơn hàng mới</button>
        )}
      </div>

      {/* Tabs section */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 shrink-0 scrollbar-hide text-left">
        {tabs.map((status) => (
          <button key={status} onClick={() => setActiveTab(status)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeTab === status ? 'bg-[#0b1c30] text-white border-[#0b1c30] shadow-md' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700'}`}>{status}</button>
        ))}
      </div>

      {/* Main Order List Section */}
      <div className="flex-1 min-h-0 bg-white dark:bg-[#1e293b] rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors">
        <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-900/20">
          <div className="relative max-w-md w-full text-left">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input type="text" placeholder="Tìm đơn hàng, khách hàng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl outline-none text-xs dark:text-white shadow-sm font-bold uppercase" />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
             <Activity size={14} className="text-blue-500" /> Real-time Sync
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead className="sticky top-0 z-10 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md">
              <tr className="border-b border-slate-100 dark:border-slate-800 text-left">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Đơn hàng</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Khách hàng</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Điều phối</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thanh toán (COD)</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-left">
              {orders.filter(o => o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.includes(searchTerm)).map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4"><span className="font-black text-slate-800 dark:text-white block text-xs uppercase tracking-tight">{order.id.slice(-8).toUpperCase()}</span><span className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 font-bold uppercase"><Clock size={12} className="text-blue-500/50" /> {formatDate(order.createdAt)}</span></td>
                  <td className="px-6 py-4"><span className="font-black text-slate-700 dark:text-slate-200 block text-xs uppercase">{order.customerName}</span><span className="text-[10px] text-slate-400 font-bold tracking-widest">{order.phoneNumber}</span></td>
                  <td className="px-6 py-4">
                    {order.technicianName ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[10px] font-black text-blue-500 border border-blue-100/50 uppercase">{order.technicianName.charAt(0)}</div>
                        <span className="font-black text-slate-600 dark:text-slate-400 text-[10px] uppercase truncate max-w-[120px]">{order.technicianName}</span>
                      </div>
                    ) : (
                      isCoordinator && <button onClick={() => setShowAssignModal({ orderId: order.id, visible: true })} className="flex items-center gap-1.5 text-[9px] font-black uppercase text-blue-500 hover:text-blue-600 border border-blue-100 rounded-lg px-2 py-1 w-fit"><Briefcase size={12}/> Phân công</button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                       <span className="font-black text-slate-900 dark:text-blue-400 text-xs">{order.totalAmount?.toLocaleString('vi-VN')}đ</span>
                       {order.status === 'completed' && isAccountant && (
                         <button onClick={() => handleUpdateStatus(order.id, order.status, 'paid')} className="flex items-center gap-1 text-[9px] font-black text-emerald-500 hover:underline uppercase mt-1"><CreditCard size={10}/> Xác nhận COD</button>
                       )}
                       {order.status === 'paid' && <span className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase mt-1"><ShieldCheck size={10}/> Đã tất toán</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${getStatusColor(order.status)}`}>{getStatusText(order.status)}</span>
                      {order.status === 'incident' && <AlertOctagon size={14} className="text-rose-500 animate-pulse" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { if(!order.address) return; window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`, '_blank'); }} className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-500 shadow-sm transition-all hover:scale-110" title="Bản đồ"><Navigation size={16} /></button>
                      <button onClick={() => setShowOrderModal({ type: 'detail', order, visible: true })} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500 shadow-sm transition-all hover:scale-110" title="Chi tiết"><Info size={16} /></button>
                      {isCoordinator && <button onClick={() => setShowOrderModal({ type: 'edit', order, visible: true })} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500 shadow-sm transition-all hover:scale-110" title="Sửa"><Edit size={16} /></button>}
                      {isAdmin && <button onClick={() => { if(window.confirm('Xóa đơn hàng này?')) deleteOrder(order); }} className="p-2 bg-rose-50 text-rose-400 rounded-xl shadow-sm transition-all hover:scale-110" title="Xóa"><Trash2 size={16} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ORDER MODAL (ADD/EDIT/DETAIL) --- */}
      {showOrderModal.visible && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-2 sm:p-4 text-left">
          <div className="bg-white dark:bg-[#1e293b] rounded-[2rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-200">
            <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900 shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#0b1c30] text-white rounded-2xl shadow-lg"><ShoppingCart size={24} /></div>
                <div><h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm">{showOrderModal.type === 'add' ? 'Khởi tạo đơn hàng' : showOrderModal.type === 'edit' ? 'Cập nhật thông tin' : 'Chi tiết đơn hàng'}</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Xử lý nghiệp vụ bởi: {user?.displayName}</p></div>
              </div>
              <button onClick={() => setShowOrderModal({ ...showOrderModal, visible: false })} className="text-slate-300 hover:text-rose-500 transition-colors transform hover:rotate-90 duration-200"><XCircle size={32} /></button>
            </div>

            <form onSubmit={handleSubmitOrder} className="p-6 md:p-10 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="p-6 bg-slate-50/30 dark:bg-slate-900/30 rounded-3xl border border-slate-100 dark:border-slate-700 space-y-5 shadow-inner text-left">
                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] flex items-center gap-2"><User size={14} /> Khách hàng</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Họ tên</label>
                        <input name="customerName" value={formDataState.customerName} readOnly={showOrderModal.type === 'detail'} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-none rounded-xl outline-none font-bold text-xs uppercase" placeholder="NHẬP TÊN..." />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Số điện thoại</label>
                        <input name="phoneNumber" value={formDataState.phoneNumber} readOnly={showOrderModal.type === 'detail'} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-none rounded-xl outline-none font-bold text-xs" placeholder="0987xxxxxx" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50/30 dark:bg-slate-900/30 rounded-3xl border border-slate-100 dark:border-slate-700 space-y-5 shadow-inner text-left">
                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] flex items-center gap-2"><MapPin size={14} /> Địa chỉ</h4>
                    <div className="space-y-4 text-left">
                      <select name="provinceCode" value={formDataState.provinceCode} disabled={showOrderModal.type === 'detail'} onChange={(e) => handleProvinceChange(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-none rounded-xl text-xs font-black shadow-inner">
                        <option value="">-- CHỌN TỈNH/THÀNH --</option>
                        {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                      </select>
                      <div className="grid grid-cols-2 gap-4">
                        <select name="districtCode" value={formDataState.districtCode} onChange={(e) => handleDistrictChange(e.target.value)} disabled={showOrderModal.type === 'detail' || districts.length === 0} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-none rounded-xl text-xs font-black">
                           <option value="">-- QUẬN/HUYỆN --</option>
                           {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                        </select>
                        <select name="wardCode" value={formDataState.wardCode} onChange={handleInputChange} disabled={showOrderModal.type === 'detail' || wards.length === 0} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-none rounded-xl text-xs font-black">
                           <option value="">-- PHƯỜNG/XÃ --</option>
                           {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                        </select>
                      </div>
                      <input name="street" value={formDataState.street} readOnly={showOrderModal.type === 'detail'} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-none rounded-xl outline-none font-bold text-xs uppercase shadow-inner" placeholder="SỐ NHÀ, TÊN ĐƯỜNG..." />
                    </div>
                  </div>
                </div>

                <div className="space-y-8 text-left">
                  <div className="p-6 bg-slate-50/30 dark:bg-slate-900/30 rounded-3xl border border-slate-100 dark:border-slate-700 flex flex-col space-y-5 h-full shadow-inner">
                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] flex items-center gap-2"><Package size={14} /> Danh sách sản phẩm</h4>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 min-h-[150px]">
                       {selectedItems.map(item => (
                         <div key={item.id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-50 dark:border-slate-700 flex items-center justify-between shadow-sm">
                            <div className="text-left">
                               <p className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-200 truncate">{item.name}</p>
                               <p className="text-[9px] font-bold text-slate-400">{item.price.toLocaleString('vi-VN')}đ</p>
                            </div>
                            <div className="flex items-center gap-3">
                               <span className="text-[11px] font-black bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg text-blue-600">x{item.quantity}</span>
                               {showOrderModal.type !== 'detail' && (
                                 <button type="button" onClick={() => setSelectedItems(selectedItems.filter(i => i.id !== item.id))} className="text-rose-400 hover:text-rose-600 transition-colors"><Trash2 size={16}/></button>
                               )}
                            </div>
                         </div>
                       ))}
                       {showOrderModal.type !== 'detail' && (
                         <div className="relative text-left" ref={productInputRef}>
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                           <input type="text" placeholder="Thêm sản phẩm..." value={productSearch} onChange={(e) => { setProductSearch(e.target.value); setShowProductSuggestions(true); }} className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-blue-50 dark:border-slate-700 rounded-xl outline-none font-black text-[10px] uppercase shadow-sm" />
                           {showProductSuggestions && filteredProducts.length > 0 && (
                             <div className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl border border-slate-100 max-h-48 overflow-y-auto custom-scrollbar">
                               {filteredProducts.map(product => (
                                 <button key={product.id} type="button" onClick={() => handleAddProduct(product)} className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b border-slate-50 dark:border-slate-800 last:border-0 flex justify-between items-center text-left"><p className="font-black text-[10px] uppercase">{product.tenSanPham}</p><span className="text-[9px] font-bold text-blue-500">{product.giaBan.toLocaleString('vi-VN')}đ</span></button>
                               ))}
                             </div>
                           )}
                         </div>
                       )}
                    </div>

                    <div className="pt-6 border-t border-dashed border-slate-200 dark:border-slate-700 text-left">
                       <div className="flex justify-between items-center mb-5">
                          <span className="text-[10px] font-black text-slate-400 uppercase">Trạng thái xử lý</span>
                          <select name="status" value={formDataState.status} disabled={showOrderModal.type === 'detail'} onChange={handleInputChange} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase outline-none shadow-sm ${getStatusColor(formDataState.status)}`}>
                            {['pending', 'assigned', 'processing', 'completed', 'paid', 'incident', 'cancelled'].map(st => (
                              <option key={st} value={st}>{getStatusText(st as any)}</option>
                            ))}
                          </select>
                       </div>
                       <div className="flex justify-between items-center p-6 bg-[#0b1c30] rounded-3xl text-white shadow-xl">
                          <div className="text-left">
                             <p className="text-[10px] font-black uppercase opacity-60">Tổng tất toán (COD)</p>
                             <p className="text-xl font-black">{manualTotalAmount !== null ? manualTotalAmount?.toLocaleString('vi-VN') : calculateTotal().toLocaleString('vi-VN')}đ</p>
                          </div>
                          <CreditCard size={28} className="opacity-30" />
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {showOrderModal.type !== 'detail' ? (
                <div className="mt-10 flex gap-5">
                   <button type="button" onClick={() => setShowOrderModal({ ...showOrderModal, visible: false })} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Hủy bỏ</button>
                   <button type="submit" className="flex-[2] py-4 bg-[#00459a] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all">Xác nhận cập nhật</button>
                </div>
              ) : (
                <div className="mt-10 p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-left">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm"><History size={24} /></div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dữ liệu nghiệp vụ</p>
                         <p className="text-xs font-black text-[#0b1c30] dark:text-white uppercase mt-1">KTV đảm nhận: {showOrderModal.order?.technicianName || 'Chưa phân công'}</p>
                      </div>
                   </div>
                   {isCoordinator && showOrderModal.order?.status === 'pending' && (
                      <button type="button" onClick={() => { setShowAssignModal({ orderId: showOrderModal.order!.id, visible: true }); setShowOrderModal({ ...showOrderModal, visible: false }); }} className="bg-[#0b1c30] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Phân công ngay</button>
                   )}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* --- ASSIGN MODAL (ĐIỀU PHỐI) --- */}
      {showAssignModal.visible && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 text-left">
          <div className="bg-white dark:bg-[#1e293b] rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900 shrink-0">
               <div className="text-left">
                  <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-xs">Điều phối kỹ thuật</h3>
                  <p className="text-[8px] font-black text-blue-500 uppercase mt-1">Giao việc cho nhân sự hiện trường</p>
               </div>
               <button onClick={() => setShowAssignModal({ orderId: '', visible: false })} className="text-slate-300 hover:text-rose-500 transition-colors"><XCircle size={24} /></button>
            </div>
            <div className="p-4 max-h-[450px] overflow-y-auto custom-scrollbar space-y-2">
              {technicians.map(t => (
                <button key={t.uid} onClick={() => handleAssign(t.uid, t.displayName)} className="w-full flex items-center gap-4 p-4 rounded-[1.5rem] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left border-2 border-transparent hover:border-blue-100 group shadow-sm">
                   <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[#00459a] dark:text-blue-400 flex items-center justify-center font-black text-lg shadow-inner group-hover:scale-105 transition-transform">{t.displayName.charAt(0)}</div>
                   <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-800 dark:text-white text-xs uppercase truncate">{t.displayName}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t.phoneNumber}</p>
                   </div>
                   <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-300 group-hover:text-blue-500 transition-colors">
                      <ChevronRight size={16} />
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
