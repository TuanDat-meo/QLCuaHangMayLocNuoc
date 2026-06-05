import React, { useEffect, useState, useRef } from 'react';
import {
  Plus, Search, Filter, MoreVertical, Eye, Edit2, Trash2,
  CheckCircle, Clock, AlertCircle, MapPin, Phone, User,
  Calendar, Package, Tool, DollarSign, X, Check, Loader,
  ChevronRight, Map as MapIcon, Info, Users
} from 'lucide-react';
import {
  getOrders,
  subscribeToOrders,
  addOrder,
  updateOrder,
  deleteOrder,
  assignTechnicians as assignTechniciansToOrder,
  createDevicesFromOrder
} from '../../services/orderService';
import { getTechnicians } from '../../services/technicianService';
import { getProducts } from '../../services/productService';
import { logActivity } from '../../services/auditService';
import { Order, OrderStatus, OrderType, OrderTechnician } from '../../types/order';
import { Product } from '../../types/product';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const orderIdFromUrl = searchParams.get('id');
  const actionFromUrl = searchParams.get('action'); // Nhận diện hành động từ URL

  const [orders, setOrders] = useState<Order[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('Tất cả');

  const [productSearch, setProductSearch] = useState('');
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const productInputRef = useRef<HTMLDivElement>(null);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [manualTotalAmount, setManualTotalAmount] = useState<number | null>(null);
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

  const [showAssignModal, setShowAssignModal] = useState<{orderId: string, currentTechs: OrderTechnician[], scheduledDate: string, visible: boolean}>({
    orderId: '', currentTechs: [], scheduledDate: '', visible: false
  });
  const [selectedTechsInModal, setSelectedTechsInModal] = useState<OrderTechnician[]>([]);

  const [showOrderModal, setShowOrderModal] = useState<{type: 'add' | 'edit' | 'detail', order?: Order, visible: boolean}>({ type: 'add', visible: false });

  const [showCustomProductForm, setShowCustomProductForm] = useState(false);
  const [customProduct, setCustomProduct] = useState({ name: '', price: 0, thoiGianBaoHanh: 0 });

  const tabs = ['Tất cả', 'Chờ duyệt', 'Đã duyệt', 'Đã phân công', 'Đang xử lý', 'Hoàn tất', 'Sự cố', 'Đã tất toán'];

  useEffect(() => {
    const unsubscribe = subscribeToOrders((data) => {
      setOrders(data);
      setIsLoading(false);
    }, activeTab);
    return () => unsubscribe();
  }, [activeTab]);

  // Xử lý logic tự động mở modal khi có tham số từ Dashboard
  useEffect(() => {
    if (orderIdFromUrl && orders.length > 0) {
      const order = orders.find(o => o.id === orderIdFromUrl);
      if (order) {
        if (actionFromUrl === 'assign') {
          handleOpenAssign(order); // Mở modal phân công
        } else {
          setShowOrderModal({ type: 'detail', order, visible: true }); // Mặc định xem chi tiết
        }
      }
    }
  }, [orderIdFromUrl, orders, actionFromUrl]);

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

        // Tự động tạo thiết bị khi hoàn tất lắp đặt (Bảo hành)
        if (data.status === 'completed' && showOrderModal.order.status !== 'completed' && data.orderType === 'installation') {
           await createDevicesFromOrder({ ...showOrderModal.order, ...data });
           toast.success("Đã tự động kích hoạt bảo hành cho thiết bị");
        }

        await logActivity("Cập nhật đơn hàng", "Đơn hàng", showOrderModal.order.id, { before: showOrderModal.order.status, after: data.status });
        toast.success("Cập nhật đơn hàng thành công!");
      }
      setShowOrderModal({ type: 'add', visible: false });
    } catch (error) {
      console.error("Lỗi khi lưu đơn hàng:", error);
      toast.error("Lỗi hệ thống khi lưu đơn hàng");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) {
      try {
        await deleteOrder(id);
        toast.success("Đã xóa đơn hàng");
      } catch (error) { toast.error("Lỗi khi xóa đơn hàng"); }
    }
  };

  const handleOpenAssign = (order: Order) => {
    let formattedScheduledDate = '';
    if (order.scheduledDate) {
      const d = order.scheduledDate.toDate ? order.scheduledDate.toDate() : new Date(order.scheduledDate);
      formattedScheduledDate = d.toISOString().slice(0, 16);
    }
    setShowAssignModal({
      orderId: order.id,
      currentTechs: order.technicians || [],
      scheduledDate: formattedScheduledDate,
      visible: true
    });
    setSelectedTechsInModal(order.technicians || []);
  };

  const handleConfirmAssign = async () => {
    if (selectedTechsInModal.length === 0) {
      toast.error("Vui lòng chọn ít nhất một kỹ thuật viên");
      return;
    }
    try {
      const scheduledDate = showAssignModal.scheduledDate ? new Date(showAssignModal.scheduledDate) : null;
      await assignTechniciansToOrder(showAssignModal.orderId, selectedTechsInModal, scheduledDate);
      toast.success("Đã phân công kỹ thuật viên!");
      setShowAssignModal({ orderId: '', currentTechs: [], scheduledDate: '', visible: false });
    } catch (error) {
      toast.error("Lỗi khi phân công");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'approved': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'assigned': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'processing': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'paid': return 'bg-slate-800 text-white border-slate-700';
      case 'incident': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'Chờ duyệt';
      case 'approved': return 'Đã duyệt';
      case 'assigned': return 'Đã phân công';
      case 'processing': return 'Đang xử lý';
      case 'completed': return 'Hoàn tất';
      case 'cancelled': return 'Đã hủy';
      case 'incident': return 'Sự cố';
      case 'paid': return 'Đã tất toán';
      default: return status;
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-[#00459a] rounded-2xl shadow-lg shadow-blue-200">
                <Package className="text-white w-6 h-6" />
             </div>
             <h1 className="text-3xl font-black text-[#0b1c30] tracking-tight">Quản lý Đơn hàng</h1>
          </div>
          <p className="text-slate-500 font-medium ml-12">Điều hành và theo dõi quy trình phục vụ khách hàng</p>
        </div>

        <button
          onClick={() => setShowOrderModal({ type: 'add', visible: true })}
          className="group flex items-center gap-2 px-8 py-4 bg-[#00459a] text-white rounded-[2rem] font-black text-sm shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
          <span>TẠO ĐƠN HÀNG MỚI</span>
        </button>
      </div>

      {/* Tabs Section */}
      <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
              activeTab === tab
                ? 'bg-white text-[#00459a] shadow-xl shadow-blue-100/50 border border-blue-50 ring-2 ring-blue-500/10'
                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-50 overflow-hidden min-h-[500px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40">
             <Loader className="animate-spin text-[#00459a] mb-4" size={48} />
             <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Đang tải dữ liệu...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 opacity-40">
             <Package size={80} className="text-slate-200 mb-6" />
             <p className="text-slate-400 font-black text-xl uppercase tracking-tighter">Chưa có đơn hàng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Đơn hàng</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Khách hàng</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sản phẩm / Dịch vụ</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng tiền</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-6">
                       <div className="flex flex-col">
                          <span className="text-xs font-black text-[#0b1c30] uppercase mb-1">ORD-{order.id.slice(-6).toUpperCase()}</span>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                             <Clock size={10} />
                             {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('vi-VN') : new Date(order.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#f3f6ff] rounded-xl flex items-center justify-center text-[#00459a] font-black text-sm">
                             {order.customerName?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                             <span className="text-sm font-black text-[#0b1c30]">{order.customerName}</span>
                             <span className="text-[10px] font-bold text-slate-400">{order.phoneNumber}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6 max-w-[300px]">
                       <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-600 line-clamp-1">{order.productName}</span>
                          <span className={`text-[9px] font-black uppercase mt-1 ${order.orderType === 'maintenance' ? 'text-amber-500' : 'text-blue-500'}`}>
                             {order.orderType === 'maintenance' ? 'Bảo trì / Sửa chữa' : 'Lắp đặt mới'}
                          </span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-sm font-black text-[#00459a]">{formatCurrency(order.totalAmount)}</span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex justify-center">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border tracking-widest ${getStatusColor(order.status)}`}>
                             {getStatusLabel(order.status)}
                          </span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button
                             onClick={() => setShowOrderModal({ type: 'detail', order, visible: true })}
                             className="p-2 hover:bg-blue-100 text-blue-600 rounded-xl transition-all" title="Xem chi tiết"
                          >
                             <Eye size={18} strokeWidth={2.5} />
                          </button>

                          {(order.status === 'approved' || order.status === 'assigned') && (
                            <button
                               onClick={() => handleOpenAssign(order)}
                               className="p-2 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all" title="Phân công KTV"
                            >
                               <Users size={18} strokeWidth={2.5} />
                            </button>
                          )}

                          <button
                             onClick={() => setShowOrderModal({ type: 'edit', order, visible: true })}
                             className="p-2 hover:bg-amber-100 text-amber-600 rounded-xl transition-all" title="Chỉnh sửa"
                          >
                             <Edit2 size={18} strokeWidth={2.5} />
                          </button>

                          {activeTab === 'Tất cả' && (
                             <button
                                onClick={() => handleDelete(order.id)}
                                className="p-2 hover:bg-rose-100 text-rose-600 rounded-xl transition-all" title="Xóa"
                             >
                                <Trash2 size={18} strokeWidth={2.5} />
                             </button>
                          )}
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT / DETAIL ORDER */}
      {showOrderModal.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0b1c30]/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowOrderModal({ ...showOrderModal, visible: false })} />

          <div className="relative bg-[#f8fafc] w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 no-scrollbar">

            <form onSubmit={handleSubmitOrder}>
              {/* Modal Header */}
              <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-10 py-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-[#0b1c30] uppercase tracking-tight">
                    {showOrderModal.type === 'add' ? 'Tạo đơn hàng mới' : showOrderModal.type === 'edit' ? 'Cập nhật đơn hàng' : 'Chi tiết đơn hàng'}
                  </h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    {showOrderModal.type === 'detail' ? `Mã đơn: ORD-${showOrderModal.order?.id.slice(-6).toUpperCase()}` : 'Vui lòng điền đầy đủ thông tin bên dưới'}
                  </p>
                </div>
                <button type="button" onClick={() => setShowOrderModal({ ...showOrderModal, visible: false })} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-10 space-y-10">
                {/* Section 1: Customer Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                         <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600"><User size={18} /></div>
                         <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Thông tin khách hàng</h3>
                      </div>

                      <div className="space-y-4">
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Họ và tên *</label>
                            <input
                               type="text" name="customerName" required disabled={showOrderModal.type === 'detail'}
                               value={formDataState.customerName} onChange={handleInputChange}
                               placeholder="VD: Nguyễn Văn A"
                               className={`w-full px-6 py-4 bg-white rounded-2xl border-2 transition-all outline-none font-bold text-slate-700 ${errors.customerName ? 'border-rose-400 bg-rose-50' : 'border-slate-100 focus:border-[#00459a]'}`}
                            />
                            {errors.customerName && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-2">{errors.customerName}</p>}
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Số điện thoại *</label>
                            <input
                               type="tel" name="phoneNumber" required disabled={showOrderModal.type === 'detail'}
                               value={formDataState.phoneNumber} onChange={handleInputChange}
                               placeholder="VD: 0912345678"
                               className={`w-full px-6 py-4 bg-white rounded-2xl border-2 transition-all outline-none font-bold text-slate-700 ${errors.phoneNumber ? 'border-rose-400 bg-rose-50' : 'border-slate-100 focus:border-[#00459a]'}`}
                            />
                            {errors.phoneNumber && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-2">{errors.phoneNumber}</p>}
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                         <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600"><MapPin size={18} /></div>
                         <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Địa chỉ lắp đặt</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="col-span-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Tỉnh / Thành phố *</label>
                            <select
                               disabled={showOrderModal.type === 'detail'}
                               value={formDataState.provinceCode} onChange={(e) => handleProvinceChange(e.target.value)}
                               className={`w-full px-6 py-4 bg-white rounded-2xl border-2 transition-all outline-none font-bold text-slate-700 appearance-none ${errors.provinceCode ? 'border-rose-400' : 'border-slate-100 focus:border-[#00459a]'}`}
                            >
                               <option value="">-- Chọn Tỉnh/Thành --</option>
                               {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                            </select>
                            {errors.provinceCode && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-2">{errors.provinceCode}</p>}
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Quận / Huyện *</label>
                            <select
                               disabled={showOrderModal.type === 'detail' || !formDataState.provinceCode}
                               value={formDataState.districtCode} onChange={(e) => handleDistrictChange(e.target.value)}
                               className={`w-full px-6 py-4 bg-white rounded-2xl border-2 transition-all outline-none font-bold text-slate-700 appearance-none ${errors.districtCode ? 'border-rose-400' : 'border-slate-100 focus:border-[#00459a]'}`}
                            >
                               <option value="">-- Quận/Huyện --</option>
                               {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                            </select>
                            {errors.districtCode && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-2">{errors.districtCode}</p>}
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Phường / Xã *</label>
                            <select
                               disabled={showOrderModal.type === 'detail' || !formDataState.districtCode}
                               value={formDataState.wardCode} onChange={(e) => setFormDataState(prev => ({ ...prev, wardCode: e.target.value }))}
                               className={`w-full px-6 py-4 bg-white rounded-2xl border-2 transition-all outline-none font-bold text-slate-700 appearance-none ${errors.wardCode ? 'border-rose-400' : 'border-slate-100 focus:border-[#00459a]'}`}
                            >
                               <option value="">-- Phường/Xã --</option>
                               {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                            </select>
                            {errors.wardCode && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-2">{errors.wardCode}</p>}
                         </div>
                         <div className="col-span-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Số nhà, tên đường *</label>
                            <input
                               type="text" name="street" required disabled={showOrderModal.type === 'detail'}
                               value={formDataState.street} onChange={handleInputChange}
                               placeholder="VD: Số 123, đường Nguyễn Văn Linh"
                               className={`w-full px-6 py-4 bg-white rounded-2xl border-2 transition-all outline-none font-bold text-slate-700 ${errors.street ? 'border-rose-400' : 'border-slate-100 focus:border-[#00459a]'}`}
                            />
                            {errors.street && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-2">{errors.street}</p>}
                         </div>
                      </div>
                   </div>
                </div>

                {/* Section 2: Order Type & Status & Schedule */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Loại đơn hàng</label>
                      <select
                         name="orderType" disabled={showOrderModal.type === 'detail'}
                         value={formDataState.orderType} onChange={handleInputChange}
                         className="w-full px-6 py-4 bg-white rounded-2xl border-2 border-slate-100 focus:border-[#00459a] outline-none font-bold text-slate-700"
                      >
                         <option value="installation">Lắp đặt mới</option>
                         <option value="maintenance">Bảo trì / Sửa chữa</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Trạng thái xử lý</label>
                      <select
                         name="status" disabled={showOrderModal.type === 'detail'}
                         value={formDataState.status} onChange={handleInputChange}
                         className={`w-full px-6 py-4 bg-white rounded-2xl border-2 border-slate-100 focus:border-[#00459a] outline-none font-black uppercase text-xs ${getStatusColor(formDataState.status)}`}
                      >
                         <option value="pending">Chờ duyệt</option>
                         <option value="approved">Đã duyệt (Chờ phân công)</option>
                         <option value="assigned">Đã phân công</option>
                         <option value="processing">Đang thực hiện</option>
                         <option value="completed">Đã hoàn tất</option>
                         <option value="incident">Sự cố</option>
                         <option value="cancelled">Đã hủy</option>
                         <option value="paid">Đã tất toán</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Ngày giờ dự kiến</label>
                      <input
                         type="datetime-local" name="scheduledDate"
                         disabled={showOrderModal.type === 'detail'}
                         value={formDataState.scheduledDate} onChange={handleInputChange}
                         className="w-full px-6 py-4 bg-white rounded-2xl border-2 border-slate-100 focus:border-[#00459a] outline-none font-bold text-slate-700"
                      />
                   </div>
                </div>

                {/* Section 3: Product Selection */}
                <div className="space-y-6">
                   <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600"><Package size={18} /></div>
                         <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Sản phẩm & Dịch vụ</h3>
                      </div>

                      {showOrderModal.type !== 'detail' && (
                        <div className="relative" ref={productInputRef}>
                           <div className="flex items-center gap-2">
                              <div className="relative flex-1 min-w-[300px]">
                                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                 <input
                                    type="text" value={productSearch} onChange={(e) => {setProductSearch(e.target.value); setShowProductSuggestions(true);}}
                                    onFocus={() => setShowProductSuggestions(true)}
                                    placeholder="Tìm theo tên sản phẩm..."
                                    className={`w-full pl-12 pr-4 py-3 bg-white rounded-xl border-2 border-slate-100 focus:border-[#00459a] outline-none font-bold text-sm transition-all ${errors.products ? 'border-rose-400' : ''}`}
                                 />
                              </div>
                              <button
                                 type="button" onClick={() => setShowCustomProductForm(true)}
                                 className="px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase hover:bg-indigo-100 transition-all flex items-center gap-2"
                              >
                                 <Plus size={14} /> Linh động
                              </button>
                           </div>

                           {showProductSuggestions && productSearch && (
                              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-60 overflow-y-auto z-20">
                                 {availableProducts.filter(p => p.tenSanPham.toLowerCase().includes(productSearch.toLowerCase())).map(p => (
                                    <button
                                       key={p.id} type="button" onClick={() => handleAddProduct(p)}
                                       className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center justify-between group"
                                    >
                                       <div className="flex items-center gap-3">
                                          {p.imageUrl && <img src={p.imageUrl} className="w-10 h-10 rounded-lg object-cover" />}
                                          <div>
                                             <p className="text-sm font-black text-slate-700">{p.tenSanPham}</p>
                                             <p className="text-[10px] font-bold text-slate-400">{formatCurrency(p.giaBan)} • Tồn: {p.tonKho}</p>
                                          </div>
                                       </div>
                                       <Plus size={16} className="text-[#00459a] opacity-0 group-hover:opacity-100 transition-all" />
                                    </button>
                                 ))}
                                 {availableProducts.filter(p => p.tenSanPham.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
                                    <p className="p-4 text-center text-xs text-slate-400 font-bold">Không tìm thấy sản phẩm nào</p>
                                 )}
                              </div>
                           )}
                        </div>
                      )}
                   </div>

                   {/* Custom Product Form */}
                   {showCustomProductForm && (
                      <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2">
                         <div className="md:col-span-2">
                            <label className="text-[9px] font-black text-indigo-400 uppercase mb-2 block">Tên mặt hàng linh động</label>
                            <input
                               type="text" value={customProduct.name} onChange={(e) => setCustomProduct({...customProduct, name: e.target.value})}
                               className={`w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-400 outline-none font-bold text-sm ${errors.customProductName ? 'border-rose-400' : ''}`}
                               placeholder="VD: Công lắp đặt, Thay lõi số 1..."
                            />
                         </div>
                         <div>
                            <label className="text-[9px] font-black text-indigo-400 uppercase mb-2 block">Giá tiền (VND)</label>
                            <input
                               type="number" value={customProduct.price} onChange={(e) => setCustomProduct({...customProduct, price: Number(e.target.value)})}
                               className={`w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-400 outline-none font-bold text-sm ${errors.customProductPrice ? 'border-rose-400' : ''}`}
                            />
                         </div>
                         <div className="flex items-end gap-2">
                            <button type="button" onClick={handleAddCustomProduct} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase shadow-lg shadow-indigo-200">Xác nhận</button>
                            <button type="button" onClick={() => setShowCustomProductForm(false)} className="p-3 bg-white text-slate-400 rounded-xl hover:text-rose-500 transition-all"><X size={18} /></button>
                         </div>
                      </div>
                   )}

                   {/* Selected Items Table */}
                   <div className="border-2 border-slate-100 rounded-[2rem] overflow-hidden">
                      <table className="w-full">
                         <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                               <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase">Tên mặt hàng</th>
                               <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase">Đơn giá</th>
                               <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase">Số lượng</th>
                               <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase">Thành tiền</th>
                               {showOrderModal.type !== 'detail' && <th className="px-6 py-4 w-10"></th>}
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {selectedItems.map((item, idx) => (
                               <tr key={idx} className="bg-white">
                                  <td className="px-6 py-4">
                                     <div className="flex items-center gap-3">
                                        {item.imageUrl && <img src={item.imageUrl} className="w-8 h-8 rounded-lg object-cover" />}
                                        <span className="text-sm font-black text-slate-700">{item.name}</span>
                                     </div>
                                  </td>
                                  <td className="px-6 py-4 text-center font-bold text-slate-600 text-sm">{formatCurrency(item.price)}</td>
                                  <td className="px-6 py-4">
                                     <div className="flex items-center justify-center gap-3">
                                        {showOrderModal.type !== 'detail' ? (
                                          <>
                                            <button type="button" onClick={() => item.quantity > 1 && setSelectedItems(selectedItems.map((it, i) => i === idx ? {...it, quantity: it.quantity - 1} : it))} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:border-[#00459a] hover:text-[#00459a]">-</button>
                                            <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                                            <button type="button" onClick={() => setSelectedItems(selectedItems.map((it, i) => i === idx ? {...it, quantity: it.quantity + 1} : it))} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:border-[#00459a] hover:text-[#00459a]">+</button>
                                          </>
                                        ) : (
                                          <span className="text-sm font-black">{item.quantity}</span>
                                        )}
                                     </div>
                                  </td>
                                  <td className="px-6 py-4 text-right font-black text-slate-700 text-sm">{formatCurrency(item.price * item.quantity)}</td>
                                  {showOrderModal.type !== 'detail' && (
                                    <td className="px-6 py-4 text-right">
                                       <button type="button" onClick={() => setSelectedItems(selectedItems.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
                                    </td>
                                  )}
                               </tr>
                            ))}
                            {selectedItems.length === 0 && (
                               <tr>
                                  <td colSpan={showOrderModal.type === 'detail' ? 4 : 5} className="px-6 py-10 text-center text-xs font-bold text-slate-300 uppercase tracking-widest italic">Chưa chọn sản phẩm nào</td>
                               </tr>
                            )}
                         </tbody>
                         <tfoot className="bg-slate-50/50">
                            <tr>
                               <td colSpan={3} className="px-6 py-6 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Tổng thanh toán:</td>
                               <td className="px-6 py-6 text-right">
                                  <span className="text-2xl font-black text-[#00459a]">{formatCurrency(manualTotalAmount || calculateTotal())}</span>
                               </td>
                               {showOrderModal.type !== 'detail' && <td></td>}
                            </tr>
                         </tfoot>
                      </table>
                   </div>
                   {errors.products && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-2 uppercase tracking-tighter">{errors.products}</p>}
                </div>

                {/* Section 4: Note */}
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600"><Info size={18} /></div>
                      <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Ghi chú & Lưu ý</h3>
                   </div>
                   <textarea
                      name="note" value={formDataState.note} onChange={handleInputChange} disabled={showOrderModal.type === 'detail'}
                      className="w-full px-8 py-6 bg-white rounded-[2rem] border-2 border-slate-100 focus:border-[#00459a] outline-none font-bold text-slate-700 min-h-[120px]"
                      placeholder="Nhập các lưu ý đặc biệt về địa chỉ hoặc yêu cầu của khách hàng..."
                   />
                </div>

                {/* Section 5: Assigned Technicians (Detail only) */}
                {showOrderModal.type === 'detail' && showOrderModal.order?.technicians && showOrderModal.order.technicians.length > 0 && (
                  <div className="space-y-4 pt-4">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600"><Users size={18} /></div>
                        <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Kỹ thuật viên phụ trách</h3>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {showOrderModal.order.technicians.map((tech, i) => (
                           <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl border-2 border-slate-50 shadow-sm">
                              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs">KT</div>
                              <div>
                                 <p className="text-sm font-black text-slate-700">{tech.name}</p>
                                 <p className="text-[10px] font-bold text-slate-400">{tech.phone}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white/90 backdrop-blur-md px-10 py-8 border-t border-slate-100 flex items-center justify-between gap-4">
                <button
                  type="button" onClick={() => setShowOrderModal({ ...showOrderModal, visible: false })}
                  className="px-10 py-4 border-2 border-slate-100 text-slate-400 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:border-slate-300 hover:text-slate-600 transition-all"
                >
                  Đóng
                </button>

                {showOrderModal.type !== 'detail' && (
                   <button
                      type="submit"
                      className="group flex items-center gap-3 px-12 py-5 bg-[#00459a] text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
                   >
                      <CheckCircle size={20} className="group-hover:scale-110 transition-transform" />
                      {showOrderModal.type === 'add' ? 'Xác nhận tạo đơn' : 'Lưu thay đổi'}
                   </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN TECHNICIANS */}
      {showAssignModal.visible && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-[#0b1c30]/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowAssignModal({ ...showAssignModal, visible: false })} />

           <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
                 <div>
                    <h2 className="text-2xl font-black text-[#0b1c30] uppercase tracking-tight">Phân công kỹ thuật</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Chọn kỹ thuật viên và thời gian thực hiện</p>
                 </div>
                 <button onClick={() => setShowAssignModal({ ...showAssignModal, visible: false })} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                    <X size={24} />
                 </button>
              </div>

              <div className="p-10 space-y-8">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 ml-1 tracking-widest">Thời gian dự kiến thực hiện</label>
                    <div className="relative">
                       <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={20} />
                       <input
                          type="datetime-local" value={showAssignModal.scheduledDate}
                          onChange={(e) => setShowAssignModal({...showAssignModal, scheduledDate: e.target.value})}
                          className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none font-black text-slate-700 transition-all"
                       />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Danh sách Kỹ thuật viên ({selectedTechsInModal.length} đã chọn)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 no-scrollbar">
                       {technicians.map((tech) => {
                          const isSelected = selectedTechsInModal.some(t => t.id === tech.uid);
                          return (
                             <button
                                key={tech.uid} type="button"
                                onClick={() => {
                                   if (isSelected) setSelectedTechsInModal(selectedTechsInModal.filter(t => t.id !== tech.uid));
                                   else setSelectedTechsInModal([...selectedTechsInModal, { id: tech.uid, name: tech.displayName, phone: tech.phoneNumber }]);
                                }}
                                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${isSelected ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                             >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400'}`}>KT</div>
                                <div className="text-left flex-1">
                                   <p className={`text-sm font-black ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>{tech.displayName}</p>
                                   <p className="text-[10px] font-bold text-slate-400">{tech.phoneNumber}</p>
                                </div>
                                {isSelected && <Check size={16} className="text-indigo-500" />}
                             </button>
                          );
                       })}
                    </div>
                 </div>
              </div>

              <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                 <button
                    onClick={() => setShowAssignModal({ ...showAssignModal, visible: false })}
                    className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-slate-300 transition-all"
                 >
                    Hủy bỏ
                 </button>
                 <button
                    onClick={handleConfirmAssign}
                    className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all"
                 >
                    Xác nhận phân công
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
