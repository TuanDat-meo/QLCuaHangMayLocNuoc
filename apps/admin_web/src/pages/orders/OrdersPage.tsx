import React, { useEffect, useState, useRef } from 'react';
import {
  Plus, Search, Eye, Edit2, Trash2,
  CheckCircle, Clock, AlertCircle, MapPin, Phone, User,
  Calendar, Package, Wrench, X, Check, Loader,
  Users
} from 'lucide-react';
import {
  subscribeToOrders,
  addOrder,
  updateOrder,
  deleteOrder,
  assignTechnicians as assignTechniciansToOrder
} from '../../services/orderService';
import { createDevicesFromOrder } from '../../services/deviceService';
import { getTechnicians } from '../../services/userService';
import { getProducts, Product } from '../../services/productService';
import { logActivity } from '../../services/auditService';
import { Order, OrderStatus, OrderType, OrderTechnician } from '../../types/order';
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

      } else {
        setFormDataState({
          customerName: '', phoneNumber: '', provinceCode: '', districtCode: '', wardCode: '',
          street: '', orderType: 'installation', status: 'pending', note: '',
          latitude: undefined, longitude: undefined, scheduledDate: ''
        });
        setSelectedItems([]);
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
      scheduledDate: formDataState.scheduledDate ? new Date(formDataState.scheduledDate) : undefined
    };

    const data = JSON.parse(JSON.stringify(rawData, (_v) => _v === undefined ? null : _v));

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

  const handleDelete = async (order: Order) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) {
      try {
        await deleteOrder(order.id, order.status);
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
      const scheduledDate = showAssignModal.scheduledDate ? new Date(showAssignModal.scheduledDate) : undefined;
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
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Đơn hàng</h1>
          <p className="text-slate-500">Theo dõi và điều phối đơn hàng khách hàng</p>
        </div>
        <button
          onClick={() => setShowOrderModal({ type: 'add', visible: true })}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Tạo đơn hàng
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 overflow-x-auto whitespace-nowrap">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Tìm theo tên khách, SĐT hoặc mã đơn..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Order List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm font-medium">
            <tr>
              <th className="px-6 py-4">Khách hàng</th>
              <th className="px-6 py-4">Sản phẩm</th>
              <th className="px-6 py-4">Tổng tiền</th>
              <th className="px-6 py-4">Loại đơn</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader className="animate-spin text-blue-600" size={32} />
                    <p className="text-slate-400">Đang tải dữ liệu...</p>
                  </div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  Không tìm thấy đơn hàng nào
                </td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{order.customerName}</div>
                    <div className="text-sm text-slate-500 flex items-center gap-1">
                      <Phone size={12} /> {order.phoneNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs truncate" title={order.productName}>{order.productName}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-blue-600">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm px-2 py-1 bg-slate-100 rounded-md">
                      {order.orderType === 'installation' ? 'Lắp đặt' : order.orderType === 'maintenance' ? 'Bảo trì' : 'Sửa chữa'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowOrderModal({ type: 'detail', order, visible: true })}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => setShowOrderModal({ type: 'edit', order, visible: true })}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(order)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showOrderModal.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">
                {showOrderModal.type === 'add' ? 'Tạo đơn hàng mới' : showOrderModal.type === 'edit' ? 'Chỉnh sửa đơn hàng' : 'Chi tiết đơn hàng'}
              </h2>
              <button onClick={() => setShowOrderModal({ ...showOrderModal, visible: false })} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tên khách hàng</label>
                  <input
                    name="customerName"
                    value={formDataState.customerName}
                    onChange={handleInputChange}
                    placeholder="Nhập tên khách hàng..."
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none ${errors.customerName ? 'border-rose-500' : 'border-slate-200'}`}
                    disabled={showOrderModal.type === 'detail'}
                  />
                  {errors.customerName && <p className="text-xs text-rose-500">{errors.customerName}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Số điện thoại</label>
                  <input
                    name="phoneNumber"
                    value={formDataState.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại..."
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none ${errors.phoneNumber ? 'border-rose-500' : 'border-slate-200'}`}
                    disabled={showOrderModal.type === 'detail'}
                  />
                  {errors.phoneNumber && <p className="text-xs text-rose-500">{errors.phoneNumber}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tỉnh/Thành phố</label>
                  <select
                    value={formDataState.provinceCode}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                    disabled={showOrderModal.type === 'detail'}
                  >
                    <option value="">Chọn Tỉnh/Thành</option>
                    {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quận/Huyện</label>
                  <select
                    value={formDataState.districtCode}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                    disabled={showOrderModal.type === 'detail'}
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phường/Xã</label>
                  <select
                    value={formDataState.wardCode}
                    onChange={(e) => setFormDataState({...formDataState, wardCode: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                    disabled={showOrderModal.type === 'detail'}
                  >
                    <option value="">Chọn Phường/Xã</option>
                    {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Địa chỉ chi tiết</label>
                <input
                  name="street"
                  value={formDataState.street}
                  onChange={handleInputChange}
                  placeholder="VD: Số 123, đường Láng..."
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  disabled={showOrderModal.type === 'detail'}
                />
              </div>

              <div className="space-y-4 border-t pt-6">
                <h3 className="font-bold flex items-center gap-2"><Package size={20} className="text-blue-600" /> Sản phẩm & Dịch vụ</h3>
                {showOrderModal.type !== 'detail' && (
                  <div className="relative" ref={productInputRef}>
                    <input
                      type="text"
                      placeholder="Tìm sản phẩm..."
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setShowProductSuggestions(true);
                      }}
                      onFocus={() => setShowProductSuggestions(true)}
                      className="w-full p-2 pl-10 border border-slate-200 rounded-lg"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />

                    {showProductSuggestions && productSearch && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
                          {availableProducts.filter(p => p.tenSanPham.toLowerCase().includes(productSearch.toLowerCase())).map(p => (
                            <div
                              key={p.id}
                              onClick={() => handleAddProduct(p)}
                              className="p-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center"
                            >
                              <span>{p.tenSanPham}</span>
                              <span className="text-blue-600 font-bold">{formatCurrency(p.giaBan)}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  {selectedItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded border flex items-center justify-center font-bold text-blue-600">
                          {item.quantity}x
                        </div>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-slate-500">{formatCurrency(item.price)}</div>
                        </div>
                      </div>
                      {showOrderModal.type !== 'detail' && (
                        <button
                          type="button"
                          onClick={() => setSelectedItems(selectedItems.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100 mt-4 shadow-inner">
                    <span className="font-bold text-blue-800">TỔNG CỘNG:</span>
                    <span className="font-black text-xl text-blue-600">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>

              {showOrderModal.type !== 'detail' && (
                <div className="flex justify-end gap-3 border-t pt-6 sticky bottom-0 bg-white">
                  <button
                    type="button"
                    onClick={() => setShowOrderModal({...showOrderModal, visible: false})}
                    className="px-6 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-bold text-slate-600"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/20 flex items-center gap-2 font-bold"
                  >
                    <Check size={20} />
                    {showOrderModal.type === 'add' ? 'Tạo đơn hàng' : 'Cập nhật thay đổi'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {showAssignModal.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold flex items-center gap-2"><Users size={24} className="text-indigo-600" /> Phân công KTV</h2>
              <button onClick={() => setShowAssignModal({...showAssignModal, visible: false})} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 uppercase tracking-widest">Lịch hẹn thi công</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                  <input
                    type="datetime-local"
                    value={showAssignModal.scheduledDate}
                    onChange={(e) => setShowAssignModal({...showAssignModal, scheduledDate: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 uppercase tracking-widest">Chọn Kỹ thuật viên ({selectedTechsInModal.length})</label>
                <div className="space-y-2 max-h-60 overflow-y-auto border border-slate-100 rounded-xl p-2 bg-slate-50/30">
                  {technicians.map(tech => (
                    <label key={tech.uid} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                      selectedTechsInModal.some(t => t.id === tech.uid) ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-slate-50 border-transparent'
                    }`}>
                      <input
                        type="checkbox"
                        checked={selectedTechsInModal.some(t => t.id === tech.uid)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTechsInModal([...selectedTechsInModal, { id: tech.uid, name: tech.displayName }]);
                          } else {
                            setSelectedTechsInModal(selectedTechsInModal.filter(t => t.id !== tech.uid));
                          }
                        }}
                        className="w-5 h-5 text-indigo-600 rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-slate-800">{tech.displayName}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{tech.phoneNumber || 'Không có SĐT'} • KTV</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAssignModal({...showAssignModal, visible: false})}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-500 font-bold hover:bg-slate-50"
                >
                  Bỏ qua
                </button>
                <button
                  onClick={handleConfirmAssign}
                  className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 font-bold flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} /> Xác nhận phân công
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
