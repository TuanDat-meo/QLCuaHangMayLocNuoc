import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Calendar, Clock, ChevronRight, User, MapPin,
  CheckCircle, XCircle, UserPlus, Plus, Trash2, Edit,
  Info, Bell, AlertTriangle, ArrowRight, Map as MapIcon, Navigation,
  Package, LayoutGrid, DollarSign, FileText, Activity, ShoppingCart, Minus,
  AlertOctagon, CreditCard, Briefcase, UserCheck, ShieldCheck, History,
  Sparkles, Tag, X, ChevronDown, Check, AlertCircle
} from 'lucide-react';
import { Order, OrderStatus, OrderType, OrderItem, OrderTechnician } from '../../types/order';
import {
  subscribeToOrders,
  updateOrderStatus,
  assignTechnicians,
  addOrder,
  updateOrder,
  deleteOrder,
  getMaintenanceDueOrders
} from '../../services/orderService';
import { getTechnicians } from '../../services/userService';
import { getProducts, Product } from '../../services/productService';
import { createDevicesFromOrder } from '../../services/deviceService';
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
    completed: 'Hoàn tất',
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

function formatDateTime(date: any) {
  if (!date) return '---';
  const d = date instanceof Date ? date : date.toDate?.() || new Date(date);
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderIdFromUrl = searchParams.get('id');
  const { user } = useAuth();

  const isAdmin = user?.role === UserRole.ADMIN;
  const isCoordinator = user?.role === UserRole.COORDINATOR || isAdmin;

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
    note: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    scheduledDate: ''
  });

  const [showAssignModal, setShowAssignModal] = useState<{orderId: string, currentTechs: OrderTechnician[], visible: boolean}>({
    orderId: '', currentTechs: [], visible: false
  });
  const [selectedTechsInModal, setSelectedTechsInModal] = useState<OrderTechnician[]>([]);

  const [showOrderModal, setShowOrderModal] = useState<{type: 'add' | 'edit' | 'detail', order?: Order, visible: boolean}>({ type: 'add', visible: false });

  const [showCustomProductForm, setShowCustomProductForm] = useState(false);
  const [customProduct, setCustomProduct] = useState({ name: '', price: 0, thoiGianBaoHanh: 0 });

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

        let formattedScheduledDate = '';
        if (order.scheduledDate) {
           const d = order.scheduledDate.toDate ? order.scheduledDate.toDate() : new Date(order.scheduledDate);
           formattedScheduledDate = d.toISOString().slice(0, 16);
        }

        setFormDataState({
          customerName: order.customerName || '',
          phoneNumber: order.phoneNumber || '',
          provinceCode: order.provinceCode ? String(order.provinceCode) : '',
          districtCode: order.districtCode ? String(order.districtCode) : '',
          wardCode: order.wardCode ? String(order.wardCode) : '',
          street: order.street || '',
          orderType: order.orderType || 'installation',
          status: order.status || 'pending',
          note: order.note || '',
          latitude: order.latitude,
          longitude: order.longitude,
          scheduledDate: formattedScheduledDate
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
          street: '', orderType: 'installation', status: 'pending', note: '',
          latitude: undefined, longitude: undefined, scheduledDate: ''
        });
        setSelectedItems([]);
        setManualTotalAmount(null);
        setDistricts([]);
        setWards([]);
      }
      setProductSearch('');
      setShowCustomProductForm(false);
    };
    if (showOrderModal.visible) loadModalData();
  }, [showOrderModal.visible, showOrderModal.order, showOrderModal.type]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormDataState(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => { const n = {...prev}; delete n[name]; return n; });
  };

  const calculateTotal = () => {
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
      setSelectedItems([...selectedItems, {
        id: product.id,
        name: product.tenSanPham,
        price: product.giaBan,
        quantity: 1,
        imageUrl: product.imageUrl,
        thoiGianBaoHanh: product.thoiGianBaoHanh || 0
      }]);
    }
    setProductSearch('');
    setShowProductSuggestions(false);
    if (errors.products) setErrors(prev => { const n = {...prev}; delete n.products; return n; });
  };

  const handleAddCustomProduct = () => {
    const newErrors: Record<string, string> = {};
    if (!customProduct.name.trim()) newErrors.customProductName = "Vui lòng nhập tên sản phẩm";
    if (customProduct.price <= 0) newErrors.customProductPrice = "Giá sản phẩm phải lớn hơn 0";

    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      return;
    }

    const customId = `custom-${Date.now()}`;
    setSelectedItems([...selectedItems, {
       id: customId,
       name: customProduct.name,
       price: customProduct.price,
       quantity: 1,
       thoiGianBaoHanh: customProduct.thoiGianBaoHanh
    }]);
    setCustomProduct({ name: '', price: 0, thoiGianBaoHanh: 0 });
    setShowCustomProductForm(false);
    toast.success("Đã thêm sản phẩm linh động");
    if (errors.products) setErrors(prev => { const n = {...prev}; delete n.products; return n; });
  };

  const handleProvinceChange = async (code: string) => {
    setFormDataState(prev => ({ ...prev, provinceCode: code, districtCode: '', wardCode: '' }));
    setErrors(prev => {
      const n = { ...prev };
      delete n.provinceCode;
      delete n.districtCode;
      delete n.wardCode;
      return n;
    });
    if (!code) { setDistricts([]); setWards([]); return; }
    const res = await fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`);
    const data = await res.json();
    setDistricts(data.districts || []);
    setWards([]);
  };

  const handleDistrictChange = async (code: string) => {
    setFormDataState(prev => ({ ...prev, districtCode: code, wardCode: '' }));
    setErrors(prev => {
      const n = { ...prev };
      delete n.districtCode;
      delete n.wardCode;
      return n;
    });
    if (!code) { setWards([]); return; }
    const res = await fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`);
    const data = await res.json();
    setWards(data.wards || []);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const nameRegex = /^[\p{L}\s]{2,50}$/u;
    const nameTrimmed = (formDataState.customerName || '').trim();

    if (!nameTrimmed) {
      newErrors.customerName = "Họ tên khách hàng không được để trống";
    } else if (!nameRegex.test(nameTrimmed)) {
      if (nameTrimmed.length < 2 || nameTrimmed.length > 50) {
        newErrors.customerName = "Họ tên phải từ 2 đến 50 ký tự";
      } else {
        newErrors.customerName = "Tên không hợp lệ";
      }
    }

    const phoneRegex = /^(0|84|\+84)(3|5|7|8|9)[0-9]{8}$/;
    const phoneTrimmed = (formDataState.phoneNumber || '').trim().replace(/\s/g, '');
    if (!phoneTrimmed) {
      newErrors.phoneNumber = "Số điện thoại không được để trống";
    } else if (!phoneRegex.test(phoneTrimmed)) {
      newErrors.phoneNumber = "Số điện thoại không đúng định dạng Việt Nam (10 chữ số)";
    }

    if (!formDataState.provinceCode) newErrors.provinceCode = "Vui lòng chọn Tỉnh/Thành phố";
    if (!formDataState.districtCode) newErrors.districtCode = "Vui lòng chọn Quận/Huyện";
    if (!formDataState.wardCode) newErrors.wardCode = "Vui lòng chọn Phường/Xã";

    const streetTrimmed = (formDataState.street || '').trim();
    if (!streetTrimmed) {
      newErrors.street = "Địa chỉ chi tiết không được để trống";
    } else if (streetTrimmed.length < 2) {
      newErrors.street = "Địa chỉ chi tiết quá ngắn (VD: Số 123, đường A...)";
    }

    if (selectedItems.length === 0) {
      newErrors.products = "Vui lòng chọn ít nhất một sản phẩm hoặc dịch vụ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Vui lòng hoàn thiện các thông tin bị lỗi màu đỏ!");
      return;
    }

    if (!user) {
      alert("Lỗi: Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
      return;
    }

    const pCode = Number(formDataState.provinceCode);
    const dCode = Number(formDataState.districtCode);
    const wCode = Number(formDataState.wardCode);
    const pName = provinces.find(p => p.code === pCode)?.name;
    const dName = districts.find(d => d.code === dCode)?.name;
    const wName = wards.find(w => w.code === wCode)?.name;

    const rawData: any = {
      ...formDataState,
      provinceCode: pCode, districtCode: dCode, wardCode: wCode,
      address: `${formDataState.street}, ${wName}, ${dName}, ${pName}`,
      productName: selectedItems.map(item => item.quantity > 1 ? `${item.name} (x${item.quantity})` : item.name).join(', '),
      items: selectedItems,
      totalAmount: calculateTotal(),
      updatedBy: user.uid,
      updatedByName: user.displayName || user.email || "Quản trị viên",
      scheduledDate: formDataState.scheduledDate ? new Date(formDataState.scheduledDate) : null
    };

    const data = JSON.parse(JSON.stringify(rawData, (k, v) => v === undefined ? null : v));

    try {
      if (showOrderModal.type === 'add') {
        data.createdBy = user.uid;
        data.createdByName = user.displayName || user.email || "Quản trị viên";
        await addOrder(data);
        await logActivity("Tạo đơn hàng mới", "Đơn hàng", "Mới", { client: data.customerName, amount: data.totalAmount });
        toast.success("Tạo đơn hàng thành công!");
      } else if (showOrderModal.type === 'edit' && showOrderModal.order) {
        await updateOrder(showOrderModal.order.id, data);

        // Nếu chuyển sang hoàn tất tại đây
        if (data.status === 'completed' && showOrderModal.order.status !== 'completed' && data.orderType === 'installation') {
           await createDevicesFromOrder({ ...showOrderModal.order, ...data });
           toast.success("Đã tự động kích hoạt bảo hành cho thiết bị");
        }

        await logActivity("Cập nhật đơn hàng", "Đơn hàng", showOrderModal.order.id, { before: showOrderModal.order, after: data });
        toast.success("Cập nhật thành công");
      }
      setShowOrderModal({ ...showOrderModal, visible: false });
    } catch (error: any) {
      console.error("LỖI HỆ THỐNG:", error);
      alert("LỖI FIREBASE: " + (error.message || "Không thể kết nối Firestore"));
      toast.error("Thao tác thất bại!");
    }
  };

  const handleUpdateStatus = async (orderId: string, currentStatus: OrderStatus, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);

      // Tự động tạo thiết bị khi hoàn tất lắp đặt
      if (newStatus === 'completed') {
         const order = orders.find(o => o.id === orderId);
         if (order && order.orderType === 'installation') {
            await createDevicesFromOrder(order);
            toast.success("Hệ thống đã tự động đăng ký thiết bị & kích hoạt bảo hành");
         }
      }

      const actionText = newStatus === 'paid' ? "Xác nhận COD" : `Chuyển sang: ${getStatusText(newStatus)}`;
      await logActivity(actionText, "Đơn hàng", orderId, { from: currentStatus, to: newStatus });
      toast.success(`Đã chuyển sang: ${getStatusText(newStatus)}`);
    } catch (error: any) {
      console.error("Lỗi cập nhật trạng thái:", error);
      toast.error(`Lỗi: ${error.message || "Không thể cập nhật trạng thái"}`);
    }
  };

  const handleSaveTechnicians = async () => {
    try {
      await assignTechnicians(showAssignModal.orderId, selectedTechsInModal);
      const techNames = selectedTechsInModal.map(t => t.name).join(', ');
      await logActivity("Cập nhật danh sách kỹ thuật viên", "Đơn hàng", showAssignModal.orderId, { technicians: techNames });
      toast.success(`Đã cập nhật nhân sự: ${techNames || 'Trống'}`);
      setShowAssignModal({ orderId: '', currentTechs: [], visible: false });
    } catch (error: any) {
      console.error("Lỗi phân công kỹ thuật:", error);
      toast.error(`Lỗi: ${error.message || "Cập nhật nhân sự thất bại"}`);
    }
  };

  const toggleTechSelection = (techId: string, techName: string) => {
    const isSelected = selectedTechsInModal.some(t => t.id === techId);
    if (isSelected) {
      setSelectedTechsInModal(selectedTechsInModal.filter(t => t.id !== techId));
    } else {
      setSelectedTechsInModal([...selectedTechsInModal, { id: techId, name: techName }]);
    }
  };

  const getAllowedStatuses = (current: OrderStatus) => {
    const all: OrderStatus[] = ['pending', 'assigned', 'processing', 'completed', 'incident', 'paid', 'cancelled'];
    if (isAdmin) return all;

    const flow: OrderStatus[] = ['pending', 'assigned', 'processing', 'completed', 'paid'];
    const idx = flow.indexOf(current);

    if (idx !== -1) {
      const nextFlow = flow.slice(idx + 1);
      const extras: OrderStatus[] = [];
      if (['assigned', 'processing'].includes(current)) extras.push('incident');
      if (['pending', 'assigned'].includes(current)) extras.push('cancelled');
      return [...nextFlow, ...extras];
    }

    if (current === 'incident') return ['processing', 'completed', 'paid'];

    return [];
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
          <button key={status} onClick={() => setActiveTab(status)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === status ? 'bg-[#0b1c30] text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700 hover:text-[#00459a]'}`}>{status}</button>
        ))}
      </div>

      {/* Main content table */}
      <div className="h-[750px] bg-white dark:bg-[#1e293b] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="p-4 md:p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between text-left">
           <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" placeholder="Tìm kiếm đơn hàng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-bold text-xs uppercase dark:text-white" />
           </div>
        </div>

        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="sticky top-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-5">Đơn hàng</th>
                <th className="px-6 py-5">Khách hàng / Địa chỉ</th>
                <th className="px-6 py-5">Lịch hẹn</th>
                <th className="px-6 py-5">Nhân sự</th>
                <th className="px-6 py-5">Trạng thái</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {orders.filter(o => o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || o.phoneNumber.includes(searchTerm)).map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4 text-left">
                    <div className="flex flex-col text-left">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">#{order.id.slice(-6).toUpperCase()}</span>
                       <span className="text-xs font-black text-[#0b1c30] dark:text-white uppercase truncate max-w-[150px]">{order.productName || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col text-left">
                        <div className="flex items-center gap-2">
                           <User size={12} className="text-[#00459a]" />
                           <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">{order.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                           <MapPin size={12} className="text-slate-300" />
                           <span className="text-[10px] font-medium text-slate-400 truncate max-w-[200px]">{order.address}</span>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col text-left">
                        <div className="flex items-center gap-2">
                           <Calendar size={12} className="text-blue-500" />
                           <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase">{formatDate(order.scheduledDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                           <Clock size={12} className="text-slate-300" />
                           <span className="text-[10px] font-bold text-slate-400">{order.scheduledDate ? formatDateTime(order.scheduledDate).split(' ')[1] : 'Chưa hẹn'}</span>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-left">
                      {order.technicians && order.technicians.length > 0 ? (
                        <div className="flex flex-wrap gap-1 items-center">
                          {order.technicians.map(t => (
                            <span key={t.id} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-[#00459a] dark:text-blue-300 rounded text-[9px] font-black uppercase whitespace-nowrap">
                              {t.name}
                            </span>
                          ))}
                          {isCoordinator && !['completed', 'paid', 'cancelled'].includes(order.status) && (
                            <button onClick={() => setShowAssignModal({ orderId: order.id, currentTechs: order.technicians || [], visible: true })} className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded transition-colors">
                              <Edit size={12} />
                            </button>
                          )}
                        </div>
                      ) : (
                        isCoordinator && !['completed', 'paid', 'cancelled'].includes(order.status) && (
                          <button onClick={() => setShowAssignModal({ orderId: order.id, currentTechs: [], visible: true })} className="text-[9px] font-black text-blue-500 uppercase flex items-center gap-1 hover:underline">
                            <UserPlus size={14} /> Phân công
                          </button>
                        )
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2 group/status">
                        <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border ${getStatusColor(order.status)}`}>
                           {getStatusText(order.status)}
                        </span>
                        {isCoordinator && getAllowedStatuses(order.status).length > 0 && (
                           <div className="relative">
                              <button className="p-1 text-slate-300 hover:text-[#00459a] transition-colors"><ChevronDown size={14} /></button>
                              <div className="absolute left-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 py-2 hidden group-hover/status:block min-w-[140px]">
                                 {getAllowedStatuses(order.status).map(s => (
                                    <button
                                      key={s}
                                      onClick={() => handleUpdateStatus(order.id, order.status, s)}
                                      className="w-full text-left px-4 py-2 text-[10px] font-black uppercase hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-2"
                                    >
                                       <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(s).split(' ')[0]}`}></div>
                                       {getStatusText(s)}
                                    </button>
                                 ))}
                              </div>
                           </div>
                        )}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                       <button onClick={() => setShowOrderModal({ type: 'detail', order, visible: true })} className="p-2 text-slate-400 hover:text-blue-500 bg-slate-50 dark:bg-slate-900 rounded-xl" title="Chi tiết"><Info size={16} /></button>
                       <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`, '_blank')} className="p-2 text-slate-400 hover:text-emerald-500 bg-slate-50 dark:bg-slate-900 rounded-xl" title="Xem bản đồ"><MapIcon size={16} /></button>
                       {isCoordinator && order.status !== 'deleted' && (
                         <button onClick={() => setShowOrderModal({ type: 'edit', order, visible: true })} className="p-2 text-slate-400 hover:text-amber-500 bg-slate-50 dark:bg-slate-900 rounded-xl" title="Chỉnh sửa"><Edit size={16} /></button>
                       )}
                       {isAdmin && (
                         <button onClick={() => { if(confirm('Xóa đơn hàng này?')) deleteOrder(order.id, order.status); }} className="p-2 text-slate-400 hover:text-rose-500 bg-slate-50 dark:bg-slate-900 rounded-xl" title="Xóa"><Trash2 size={16} /></button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal.visible && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-200 text-left">
             <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-4 text-left">
                   <div className="w-12 h-12 bg-[#0b1c30] text-white rounded-2xl flex items-center justify-center shadow-lg"><FileText size={24} /></div>
                   <div>
                      <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm">{showOrderModal.type === 'add' ? 'Khởi tạo đơn hàng mới' : 'Chi tiết đơn hàng'}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-widest">Hệ thống AquaCare Professional</p>
                   </div>
                </div>
                <button onClick={() => setShowOrderModal({ ...showOrderModal, visible: false })} className="text-slate-300 hover:text-rose-500 p-2 transition-colors"><X size={28} /></button>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-2 gap-10 text-left">
                   <div className="space-y-6">
                      <div className="space-y-4">
                         <div className="flex items-center gap-2 px-1 text-left"><User size={16} className="text-blue-600" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Khách hàng</span></div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5 text-left">
                               <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Tên khách hàng</label>
                               <input name="customerName" value={formDataState.customerName} onChange={handleInputChange} readOnly={showOrderModal.type === 'detail'} className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.customerName ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-none'} rounded-2xl outline-none font-bold text-xs uppercase dark:text-white transition-all`} placeholder="VD: Nguyễn Văn A" />
                               {errors.customerName && (
                                  <div className="flex items-center gap-1.5 mt-1.5 text-rose-500 animate-in slide-in-from-top-1">
                                    <AlertCircle size={12} className="shrink-0" />
                                    <p className="text-[10px] font-bold leading-tight">{errors.customerName}</p>
                                  </div>
                               )}
                            </div>
                            <div className="space-y-1.5 text-left">
                               <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Số điện thoại</label>
                               <input name="phoneNumber" value={formDataState.phoneNumber} onChange={handleInputChange} readOnly={showOrderModal.type === 'detail'} className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.phoneNumber ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-none'} rounded-2xl outline-none font-bold text-xs dark:text-white transition-all`} placeholder="Số điện thoại Việt Nam..." />
                               {errors.phoneNumber && (
                                  <div className="flex items-center gap-1.5 mt-1.5 text-rose-500 animate-in slide-in-from-top-1">
                                    <AlertCircle size={12} className="shrink-0" />
                                    <p className="text-[10px] font-bold leading-tight">{errors.phoneNumber}</p>
                                  </div>
                               )}
                            </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="flex items-center gap-2 px-1 text-left"><MapPin size={16} className="text-blue-600" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Địa điểm thi công</span></div>
                         <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5 text-left">
                               <select value={formDataState.provinceCode} onChange={(e) => handleProvinceChange(e.target.value)} disabled={showOrderModal.type === 'detail'} className={`w-full px-3 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.provinceCode ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-none'} rounded-xl outline-none font-bold text-[10px] uppercase dark:text-white transition-all`}>
                                  <option value="">Tỉnh/Thành</option>
                                  {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                               </select>
                               {errors.provinceCode && (
                                  <div className="flex items-center gap-1 mt-1 text-rose-500 animate-in fade-in">
                                    <AlertCircle size={10} className="shrink-0" />
                                    <p className="text-[9px] font-bold">{errors.provinceCode}</p>
                                  </div>
                               )}
                            </div>
                            <div className="space-y-1.5 text-left">
                               <select value={formDataState.districtCode} onChange={(e) => handleDistrictChange(e.target.value)} disabled={showOrderModal.type === 'detail'} className={`w-full px-3 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.districtCode ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-none'} rounded-xl outline-none font-bold text-[10px] uppercase dark:text-white transition-all`}>
                                  <option value="">Quận/Huyện</option>
                                  {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                               </select>
                               {errors.districtCode && (
                                  <div className="flex items-center gap-1 mt-1 text-rose-500 animate-in fade-in">
                                    <AlertCircle size={10} className="shrink-0" />
                                    <p className="text-[9px] font-bold">{errors.districtCode}</p>
                                  </div>
                               )}
                            </div>
                            <div className="space-y-1.5 text-left">
                               <select name="wardCode" value={formDataState.wardCode} onChange={handleInputChange} disabled={showOrderModal.type === 'detail'} className={`w-full px-3 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.wardCode ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-none'} rounded-xl outline-none font-bold text-[10px] uppercase dark:text-white transition-all`}>
                                  <option value="">Phường/Xã</option>
                                  {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                               </select>
                               {errors.wardCode && (
                                  <div className="flex items-center gap-1 mt-1 text-rose-500 animate-in fade-in">
                                    <AlertCircle size={10} className="shrink-0" />
                                    <p className="text-[9px] font-bold">{errors.wardCode}</p>
                                  </div>
                               )}
                            </div>
                         </div>
                         <div className="space-y-1.5 text-left">
                            <input name="street" value={formDataState.street} onChange={handleInputChange} readOnly={showOrderModal.type === 'detail'} className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.street ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-none'} rounded-2xl outline-none font-bold text-xs dark:text-white transition-all`} placeholder="Số nhà, tên đường chi tiết..." />
                            {errors.street && (
                               <div className="flex items-center gap-1.5 mt-1.5 text-rose-500 animate-in slide-in-from-top-1">
                                 <AlertCircle size={12} className="shrink-0" />
                                 <p className="text-[10px] font-bold leading-tight">{errors.street}</p>
                               </div>
                            )}
                         </div>

                         {(() => {
                            const mapAddress = (formDataState.latitude && formDataState.longitude)
                               ? `${formDataState.latitude},${formDataState.longitude}`
                               : (formDataState.street && formDataState.provinceCode)
                                  ? `${formDataState.street}, ${wards.find(w => String(w.code) === formDataState.wardCode)?.name || ''}, ${districts.find(d => String(d.code) === formDataState.districtCode)?.name || ''}, ${provinces.find(p => String(p.code) === formDataState.provinceCode)?.name || ''}`
                                  : showOrderModal.order?.address;

                            return mapAddress ? (
                               <div className="mt-4 rounded-2xl overflow-hidden h-48 border border-slate-100 dark:border-slate-800 shadow-inner">
                                  <iframe
                                     width="100%"
                                     height="100%"
                                     frameBorder="0"
                                     title="Order Location"
                                     src={`https://maps.google.com/maps?q=${encodeURIComponent(mapAddress)}&z=15&output=embed`}
                                  ></iframe>
                               </div>
                            ) : (
                               <div className="mt-4 flex flex-col items-center justify-center h-48 bg-slate-50 dark:bg-slate-900/20 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                                  <MapIcon size={32} className="text-slate-200 mb-2" />
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cập nhật địa chỉ để xem bản đồ</p>
                               </div>
                            );
                         })()}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1 text-left">
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Lịch hẹn khách hàng</label>
                            <input name="scheduledDate" type="datetime-local" value={formDataState.scheduledDate} onChange={handleInputChange} readOnly={showOrderModal.type === 'detail'} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold text-xs dark:text-white" />
                         </div>
                         <div className="space-y-1 text-left">
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Loại dịch vụ</label>
                            <select name="orderType" value={formDataState.orderType} onChange={handleInputChange} disabled={showOrderModal.type === 'detail'} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold text-xs uppercase dark:text-white">
                               <option value="installation">Lắp đặt mới</option>
                               <option value="maintenance">Bảo trì định kỳ</option>
                               <option value="repair">Sửa chữa sự cố</option>
                            </select>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1 text-left">
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Trạng thái đơn</label>
                            {showOrderModal.type === 'edit' ? (
                               <select
                                 name="status"
                                 value={formDataState.status}
                                 onChange={handleInputChange}
                                 className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold text-xs uppercase dark:text-white"
                               >
                                 <option value={formDataState.status}>{getStatusText(formDataState.status)} (Hiện tại)</option>
                                 {getAllowedStatuses(showOrderModal.order?.status || 'pending')
                                   .filter(s => s !== formDataState.status)
                                   .map(s => (
                                   <option key={s} value={s}>{getStatusText(s)}</option>
                                 ))}
                               </select>
                            ) : (
                               <span className={`block w-full px-4 py-3 rounded-2xl font-black text-[10px] uppercase text-center border ${getStatusColor(formDataState.status)}`}>{getStatusText(formDataState.status)}</span>
                            )}
                         </div>
                         <div className="space-y-1.5 text-left">
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Ghi chú đơn hàng</label>
                            <textarea name="note" value={formDataState.note} onChange={handleInputChange} readOnly={showOrderModal.type === 'detail'} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold text-xs dark:text-white min-h-[50px]" placeholder="Nhập ghi chú chi tiết..." />
                         </div>
                      </div>
                   </div>

                   {/* Flexible Product Section */}
                   <div className="space-y-6">
                      <div className="space-y-4">
                         <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-2"><Package size={16} className="text-blue-600" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Hàng hóa & Vật tư</span></div>
                            {showOrderModal.type !== 'detail' && (
                               <button type="button" onClick={() => { setShowCustomProductForm(!showCustomProductForm); setErrors(prev => {const n={...prev}; delete n.customProductName; delete n.customProductPrice; return n;}); }} className="text-[9px] font-black text-blue-600 uppercase flex items-center gap-1 hover:brightness-125 transition-all">
                                  {showCustomProductForm ? <Minus size={14} /> : <Sparkles size={14} />} {showCustomProductForm ? 'Đóng tùy chỉnh' : 'Tùy chỉnh linh động'}
                               </button>
                            )}
                         </div>

                         {showOrderModal.type !== 'detail' && !showCustomProductForm && (
                            <div className="relative" ref={productInputRef}>
                               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                               <input type="text" placeholder="Tìm tên sản phẩm trong kho..." value={productSearch} onChange={(e) => {setProductSearch(e.target.value); setShowProductSuggestions(true);}} onFocus={() => setShowProductSuggestions(true)} className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border ${errors.products ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-none'} rounded-2xl outline-none font-bold text-xs dark:text-white shadow-inner transition-all`} />
                               {showProductSuggestions && (
                                  <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 mt-2 z-[110] max-h-60 overflow-y-auto no-scrollbar">
                                     {filteredProducts.map(p => (
                                        <button key={p.id} type="button" onClick={() => handleAddProduct(p)} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border-b border-slate-50 dark:border-slate-800 last:border-0 text-left">
                                           <div className="flex items-center gap-3">
                                              {p.imageUrl ? (
                                                <img src={p.imageUrl} alt={p.tenSanPham} className="w-10 h-10 object-cover rounded-lg border border-slate-100" />
                                              ) : (
                                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400"><Package size={16} /></div>
                                              )}
                                              <div>
                                                 <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase">{p.tenSanPham}</p>
                                                 <p className="text-[8px] text-slate-400 font-bold uppercase text-left">Tồn kho: {p.tonKho} • BH: {p.thoiGianBaoHanh || 0}T</p>
                                              </div>
                                           </div>
                                           <span className="text-[11px] font-black text-blue-600">{p.giaBan?.toLocaleString()}₫</span>
                                        </button>
                                     ))}
                                  </div>
                               )}
                            </div>
                         )}

                         {showCustomProductForm && showOrderModal.type !== 'detail' && (
                            <div className="p-5 bg-blue-50/30 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-900/20 space-y-4 animate-in slide-in-from-top-2 text-left">
                               <div className="flex items-center gap-2 mb-2"><Tag size={14} className="text-blue-500" /><span className="text-[9px] font-black text-blue-600 uppercase">Thêm hàng hóa ngoài danh mục</span></div>
                               <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1.5 text-left">
                                     <label className="text-[8px] font-black text-slate-400 uppercase">Tên mặt hàng</label>
                                     <input value={customProduct.name} onChange={(e) => { setCustomProduct({...customProduct, name: e.target.value}); if(errors.customProductName) setErrors(prev => { const n = {...prev}; delete n.customProductName; return n; }); }} className={`w-full px-4 py-2 bg-white dark:bg-slate-800 rounded-xl font-bold text-xs uppercase dark:text-white outline-none border ${errors.customProductName ? 'border-rose-500' : 'border-blue-100'}`} placeholder="..." />
                                     {errors.customProductName && (
                                        <div className="flex items-center gap-1 mt-1 text-rose-500">
                                          <AlertCircle size={10} className="shrink-0" />
                                          <p className="text-[9px] font-bold leading-tight">{errors.customProductName}</p>
                                        </div>
                                     )}
                                  </div>
                                  <div className="space-y-1.5 text-left">
                                     <label className="text-[8px] font-black text-slate-400 uppercase">Đơn giá (VNĐ)</label>
                                     <input type="number" value={customProduct.price} onChange={(e) => { setCustomProduct({...customProduct, price: Number(e.target.value)}); if(errors.customProductPrice) setErrors(prev => { const n = {...prev}; delete n.customProductPrice; return n; }); }} className={`w-full px-4 py-2 bg-white dark:bg-slate-800 rounded-xl font-bold text-xs text-blue-600 outline-none border ${errors.customProductPrice ? 'border-rose-500' : 'border-blue-100'}`} />
                                     {errors.customProductPrice && (
                                        <div className="flex items-center gap-1 mt-1 text-rose-500">
                                          <AlertCircle size={10} className="shrink-0" />
                                          <p className="text-[9px] font-bold leading-tight">{errors.customProductPrice}</p>
                                        </div>
                                     )}
                                  </div>
                               </div>
                               <div className="space-y-1.5 text-left">
                                   <label className="text-[8px] font-black text-slate-400 uppercase">Thời gian bảo hành (Tháng)</label>
                                   <input type="number" value={customProduct.thoiGianBaoHanh} onChange={(e) => setCustomProduct({...customProduct, thoiGianBaoHanh: Number(e.target.value)})} className="w-full px-4 py-2 bg-white dark:bg-slate-800 rounded-xl font-bold text-xs dark:text-white outline-none border border-blue-100" />
                               </div>
                               <button type="button" onClick={handleAddCustomProduct} className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-blue-500/20">Xác nhận thêm</button>
                            </div>
                         )}

                         <div className="space-y-3">
                            {selectedItems.map((item, index) => (
                               <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 group transition-all">
                                  <div className="flex items-center gap-3">
                                     {item.imageUrl ? (
                                       <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                                     ) : (
                                       <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400"><Package size={16} /></div>
                                     )}
                                     <div className="text-left">
                                        <p className="text-[11px] font-black text-slate-700 dark:text-white uppercase flex items-center gap-2">
                                           {item.id.startsWith('custom-') && <Sparkles size={10} className="text-amber-500" />}
                                           {item.name}
                                        </p>
                                        <p className="text-[9px] text-slate-400 font-bold">
                                          {item.price?.toLocaleString()}₫ • BH: {item.thoiGianBaoHanh || 0}T
                                        </p>
                                     </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                     <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                        {showOrderModal.type !== 'detail' && <button type="button" onClick={() => setSelectedItems(selectedItems.map((si, i) => i === index ? { ...si, quantity: Math.max(1, si.quantity - 1) } : si))} className="text-slate-400 hover:text-rose-500 transition-colors"><Minus size={14} /></button>}
                                        <span className="text-xs font-black dark:text-white min-w-[20px] text-center">{item.quantity}</span>
                                        {showOrderModal.type !== 'detail' && <button type="button" onClick={() => setSelectedItems(selectedItems.map((si, i) => i === index ? { ...si, quantity: si.quantity + 1 } : si))} className="text-slate-400 hover:text-blue-500 transition-colors"><Plus size={14} /></button>}
                                     </div>
                                     {showOrderModal.type !== 'detail' && <button type="button" onClick={() => setSelectedItems(selectedItems.filter((_, i) => i !== index))} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>}
                                  </div>
                               </div>
                            ))}
                            {errors.products && (
                               <div className="flex items-center gap-1.5 mt-1.5 text-rose-500 animate-in slide-in-from-top-1">
                                 <AlertCircle size={12} className="shrink-0" />
                                 <p className="text-[10px] font-bold leading-tight">{errors.products}</p>
                               </div>
                            )}
                            {selectedItems.length === 0 && <div className={`py-12 text-center border-2 border-dashed rounded-[2rem] transition-all ${errors.products ? 'border-rose-300 bg-rose-50/20' : 'border-slate-100 dark:border-slate-800'}`}><Package className={`mx-auto mb-2 ${errors.products ? 'text-rose-300' : 'text-slate-200'}`} size={32} /><p className={`text-[10px] font-bold uppercase ${errors.products ? 'text-rose-400' : 'text-slate-400'}`}>Chưa chọn sản phẩm</p></div>}
                         </div>
                      </div>

                      <div className="p-8 bg-[#0b1c30] rounded-[2.5rem] text-white space-y-4 shadow-2xl">
                         <div className="flex justify-between items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <span>Thành tiền đơn hàng</span>
                            <span>{calculateTotal().toLocaleString()}₫</span>
                         </div>
                         <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase text-slate-400 mb-1">Tổng cộng (VNĐ)</span>
                            <span className="text-3xl font-black text-emerald-400 tracking-tighter">{calculateTotal().toLocaleString()}₫</span>
                         </div>
                      </div>
                   </div>

                   <div className="lg:col-span-2 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <div className="text-left">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Người lập: {showOrderModal.order?.createdByName || user?.displayName}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Ngày tạo: {formatDate(showOrderModal.order?.createdAt)}</p>
                      </div>
                      <div className="flex gap-4">
                         <button type="button" onClick={() => setShowOrderModal({...showOrderModal, visible: false})} className="px-8 py-4 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all hover:bg-slate-100">Đóng</button>
                         {showOrderModal.type !== 'detail' && (
                            <button type="submit" className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all hover:brightness-110 active:scale-95">Xác nhận đơn hàng</button>
                         )}
                      </div>
                   </div>
                </form>
             </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal.visible && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[80vh]">
             <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center text-left">
                <div className="text-left">
                   <h3 className="font-black text-[#0b1c30] dark:text-white uppercase text-sm tracking-widest">Phân công kỹ thuật</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Chọn một hoặc nhiều nhân sự</p>
                </div>
                <button onClick={() => setShowAssignModal({ orderId: '', currentTechs: [], visible: false })} className="text-slate-300 hover:text-rose-500 transition-colors p-1"><X size={24} /></button>
             </div>
             <div className="p-4 space-y-2 overflow-y-auto custom-scrollbar flex-1">
                {technicians.map(tech => {
                  const isSelected = selectedTechsInModal.some(t => t.id === tech.uid);
                  return (
                    <button
                      key={tech.uid}
                      onClick={() => toggleTechSelection(tech.uid, tech.displayName || 'Unknown')}
                      className={`w-full p-4 flex items-center justify-between rounded-2xl transition-all border ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs uppercase ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                          {tech.displayName?.charAt(0)}
                        </div>
                        <div className="text-left">
                          <p className={`text-[11px] font-black uppercase ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-white'}`}>{tech.displayName}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{tech.email}</p>
                        </div>
                      </div>
                      {isSelected && <Check size={18} className="text-blue-600" />}
                    </button>
                  );
                })}
             </div>
             <div className="p-6 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <button
                  onClick={handleSaveTechnicians}
                  className="w-full py-4 bg-[#00459a] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:brightness-110 transition-all"
                >
                  Xác nhận phân công ({selectedTechsInModal.length})
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
