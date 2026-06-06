import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, Calendar, Clock, ChevronRight, User, MapPin,
  CheckCircle, XCircle, UserPlus, Plus, Trash2, Edit,
  Info, Bell, AlertTriangle, ArrowRight, Map as MapIcon, Navigation,
  Package, LayoutGrid, DollarSign, FileText, Activity, ShoppingCart, Minus,
  AlertOctagon, CreditCard, Briefcase, UserCheck, ShieldCheck, History,
  Sparkles, Tag, X, ChevronDown, Check, AlertCircle, Receipt, Printer, Download
} from 'lucide-react';
import { Order, OrderStatus, OrderType, OrderItem, OrderTechnician } from '../../types/order';
import {
  subscribeToOrders,
  updateOrderStatus,
  assignTechnicians,
  addOrder,
  updateOrder,
  deleteOrder
} from '../../services/orderService';
import { getTechnicians } from '../../services/userService';
import { getProducts, Product } from '../../services/productService';
import { createDevicesFromOrder } from '../../services/deviceService';
import { createInvoiceFromOrder, getInvoiceByOrderId, Invoice } from '../../services/invoiceService';
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
    case 'approved': return 'bg-teal-50 text-teal-600 border-teal-100 dark:bg-teal-900/20 dark:text-teal-400';
    case 'assigned': return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
    case 'processing': return 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400';
    case 'installing': return 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
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
    approved: 'Đã duyệt',
    assigned: 'Đã phân công',
    processing: 'Đang xử lý',
    installing: 'Đang lắp đặt',
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

function isBeforeScheduledDate(scheduledDate: any) {
  if (!scheduledDate) return false;
  const sched = scheduledDate.toDate ? scheduledDate.toDate() : new Date(scheduledDate);
  const now = new Date();
  const schedDate = new Date(sched.getFullYear(), sched.getMonth(), sched.getDate());
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return nowDate < schedDate;
}

function getDaysUntilScheduled(scheduledDate: any) {
  if (!scheduledDate) return null;
  const sched = scheduledDate.toDate ? scheduledDate.toDate() : new Date(scheduledDate);
  const now = new Date();
  const schedDate = new Date(sched.getFullYear(), sched.getMonth(), sched.getDate());
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = schedDate.getTime() - nowDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
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

  const [showAssignModal, setShowAssignModal] = useState<{orderId: string, currentTechs: OrderTechnician[], scheduledDate: string, visible: boolean}>({
    orderId: '', currentTechs: [], scheduledDate: '', visible: false
  });
  const [selectedTechsInModal, setSelectedTechsInModal] = useState<OrderTechnician[]>([]);

  const [showOrderModal, setShowOrderModal] = useState<{type: 'add' | 'edit' | 'detail', order?: Order, visible: boolean}>({ type: 'add', visible: false });
  const [showInvoiceModal, setShowInvoiceModal] = useState<{visible: boolean, invoice?: Invoice}>({ visible: false });

  const [showCustomProductForm, setShowCustomProductForm] = useState(false);
  const [customProduct, setCustomProduct] = useState({ name: '', price: 0, thoiGianBaoHanh: 0 });

  const tabs = ['Tất cả', 'Chờ duyệt', 'Đã duyệt', 'Đã phân công', 'Đang xử lý', 'Đang lắp đặt', 'Hoàn tất', 'Sự cố', 'Đã tất toán'];

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
          customerName: order.customerName || order.tenKhachHang || '',
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
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      // 1. Kiểm tra yêu cầu phân công KTV cho các trạng thái nghiệp vụ
      if ((!order.technicians || order.technicians.length === 0) && ['assigned', 'processing', 'installing', 'completed', 'paid', 'incident'].includes(newStatus)) {
        toast.error("Bắt buộc phải Phân công Kỹ thuật viên trước khi chuyển sang trạng thái này!");
        return;
      }

      // 2. Kiểm tra yêu cầu Lịch hẹn
      if (!order.scheduledDate && ['assigned', 'processing', 'installing', 'completed', 'paid'].includes(newStatus)) {
        toast.error("Bắt buộc phải có Lịch hẹn thi công trước khi chuyển sang trạng thái này!");
        return;
      }

      await updateOrderStatus(orderId, newStatus);

      // --- LOGIC DOANH THU & HÓA ĐƠN ---
      if (newStatus === 'paid') {
        await createInvoiceFromOrder(order);
        toast.success("Đã ghi nhận doanh thu & Tự động xuất hóa đơn");
      } else if (newStatus === 'completed' && order.orderType === 'installation') {
        await createDevicesFromOrder(order);
        toast.success("Hệ thống đã tự động đăng ký thiết bị & kích hoạt bảo hành");
      } else {
        toast.success(`Đã chuyển sang: ${getStatusText(newStatus)}`);
      }

      const actionText = newStatus === 'paid' ? "Xác nhận COD" : `Chuyển sang: ${getStatusText(newStatus)}`;
      await logActivity(actionText, "Đơn hàng", orderId, { from: currentStatus, to: newStatus });
    } catch (error: any) {
      console.error("Lỗi cập nhật trạng thái:", error);
      toast.error(`Lỗi: ${error.message || "Không thể cập nhật trạng thái"}`);
    }
  };

  const handleSaveTechnicians = async () => {
    // 1. Ràng buộc: Bắt buộc chọn ít nhất một KTV
    if (selectedTechsInModal.length === 0) {
      toast.error("Bắt buộc phải chọn ít nhất một Kỹ thuật viên để phân công!");
      return;
    }

    // 2. Ràng buộc: Bắt buộc phải có lịch hẹn
    if (!showAssignModal.scheduledDate) {
      toast.error("Bắt buộc phải nhập Lịch hẹn thi công trước khi phân công!");
      return;
    }

    try {
      const order = orders.find(o => o.id === showAssignModal.orderId);
      const scheduledDate = new Date(showAssignModal.scheduledDate);

      // Gọi assignTechnicians với 4 tham số như định nghĩa trong orderService.ts
      await assignTechnicians(showAssignModal.orderId, selectedTechsInModal, scheduledDate, order?.status || 'pending');

      const techNames = selectedTechsInModal.map(t => t.name).join(', ');
      await logActivity("Phân công KTV & Lịch hẹn", "Đơn hàng", showAssignModal.orderId, {
        technicians: techNames,
        scheduledDate: showAssignModal.scheduledDate
      });

      toast.success(`Đã phân công ${techNames} và cập nhật lịch hẹn`);
      setShowAssignModal({ orderId: '', currentTechs: [], scheduledDate: '', visible: false });
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

  const handleViewInvoice = async (orderId: string) => {
    const loadingToast = toast.loading("Đang tải hóa đơn...");
    try {
      const invoice = await getInvoiceByOrderId(orderId);
      if (invoice) {
        setShowInvoiceModal({ visible: true, invoice });
        toast.dismiss(loadingToast);
      } else {
        toast.error("Không tìm thấy hóa đơn cho đơn hàng này!");
        toast.dismiss(loadingToast);
      }
    } catch (error) {
      console.error("Lỗi tải hóa đơn:", error);
      toast.error("Không thể tải hóa đơn");
      toast.dismiss(loadingToast);
    }
  };

  const handleDownloadPdf = (invoice: Invoice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = invoice.items.map(item => `
      <tr class="item-row">
        <td>${item.name || item.productName || 'Dịch vụ'}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">${item.price.toLocaleString()}₫</td>
        <td style="text-align: right;">${(item.price * item.quantity).toLocaleString()}₫</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Hoa Don - ${invoice.invoiceNumber}</title>
          <style>
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              padding: 40px;
              color: #334155;
              background-color: #fff;
            }
            .invoice-box {
              max-width: 800px;
              margin: auto;
              border: 1px solid #e2e8f0;
              padding: 40px;
              border-radius: 20px;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: start;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: 900;
              color: #00459a;
              text-transform: uppercase;
              font-style: italic;
            }
            .title {
              font-size: 20px;
              font-weight: 900;
              color: #1e293b;
              text-align: right;
              text-transform: uppercase;
            }
            .grid {
              display: grid;
              grid-template-cols: 1fr 1fr;
              gap: 20px;
              border-top: 2px dashed #e2e8f0;
              border-bottom: 2px dashed #e2e8f0;
              padding: 20px 0;
              margin-bottom: 30px;
            }
            .info-col {
              font-size: 13px;
            }
            .info-col p {
              margin: 4px 0;
            }
            .label {
              font-size: 10px;
              font-weight: 900;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .value {
              font-weight: 800;
              color: #1e293b;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              font-size: 10px;
              font-weight: 900;
              color: #94a3b8;
              text-transform: uppercase;
              text-align: left;
              padding: 8px 12px;
              border-bottom: 2px solid #e2e8f0;
            }
            td {
              padding: 12px;
              font-size: 13px;
              border-bottom: 1px solid #f1f5f9;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .total-section {
              display: flex;
              justify-content: space-between;
              align-items: end;
              margin-top: 30px;
              border-top: 2px solid #e2e8f0;
              padding-top: 20px;
            }
            .signature-box {
              width: 120px;
              height: 60px;
              border: 1px dashed #cbd5e1;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 9px;
              font-weight: 700;
              color: #94a3b8;
              text-transform: uppercase;
              margin-top: 10px;
            }
            .grand-total {
              font-size: 36px;
              font-weight: 900;
              color: #00459a;
              margin: 0;
            }
            @media print {
              body { padding: 0; }
              .invoice-box { border: none; box-shadow: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div>
                <div class="logo">AquaCare</div>
                <p style="font-size: 10px; margin: 4px 0; color: #94a3b8; font-weight: 800; text-transform: uppercase;">He thong giai phap loc nuoc thong minh</p>
              </div>
              <div>
                <div class="title">Hoa Don Dien Tu</div>
                <p style="font-size: 11px; margin: 4px 0; color: #64748b; font-weight: 700; text-align: right;">So: ${invoice.invoiceNumber}</p>
              </div>
            </div>
            <div class="grid">
              <div class="info-col">
                <span class="label">Khach Hang</span>
                <p class="value" style="text-transform: uppercase;">${invoice.customerName}</p>
                <p style="color: #64748b; font-weight: 700;">SDT: ${invoice.customerPhone}</p>
              </div>
              <div class="info-col" style="text-align: right;">
                <span class="label">Ngay Phat Hanh</span>
                <p class="value">${new Date(invoice.issuedAt?.seconds * 1000 || Date.now()).toLocaleDateString('vi-VN')} ${new Date(invoice.issuedAt?.seconds * 1000 || Date.now()).toLocaleTimeString('vi-VN')}</p>
                <p style="color: #10b981; font-weight: 800; font-size: 11px; text-transform: uppercase; margin-top: 6px;">Da thanh toan (${invoice.paymentMethod || 'COD'})</p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Dien giai hang muc</th>
                  <th class="text-center" style="width: 80px;">SL</th>
                  <th class="text-right" style="width: 150px;">Don gia</th>
                  <th class="text-right" style="width: 150px;">Thanh tien</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            <div class="total-section">
              <div>
                <span class="label">Chu ky dien tu</span>
                <div class="signature-box">Digital Signed</div>
              </div>
              <div style="text-align: right;">
                <span class="label">Tong cong thanh toan</span>
                <p class="grand-total">${invoice.amount.toLocaleString()}₫</p>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getAllowedStatuses = (order: Order) => {
    const current = order.status;
    const all: OrderStatus[] = ['pending', 'approved', 'assigned', 'processing', 'installing', 'completed', 'incident', 'paid', 'cancelled'];
    const beforeScheduled = isBeforeScheduledDate(order.scheduledDate);
    const hasTechnicians = order.technicians && order.technicians.length > 0;

    let allowed: OrderStatus[] = [];

    if (isAdmin) {
      allowed = [...all];
    } else {
      const flow: OrderStatus[] = ['pending', 'approved', 'assigned', 'processing', 'installing', 'completed', 'paid'];
      const idx = flow.indexOf(current);

      if (idx !== -1) {
        const nextFlow = flow.slice(idx + 1);
        const extras: OrderStatus[] = [];
        if (['approved', 'assigned', 'processing', 'installing'].includes(current)) extras.push('incident');
        if (['pending', 'approved', 'assigned'].includes(current)) extras.push('cancelled');
        allowed = [...nextFlow, ...extras];
      } else if (current === 'incident') {
        allowed = ['processing', 'installing', 'completed', 'paid'];
      }
    }

    if (beforeScheduled) {
      const lockedStatuses: OrderStatus[] = ['processing', 'installing', 'completed', 'incident', 'paid'];
      allowed = allowed.filter(s => !lockedStatuses.includes(s));
    }

    if (!hasTechnicians) {
      const lockedStatuses: OrderStatus[] = ['assigned', 'processing', 'installing', 'completed', 'incident', 'paid'];
      allowed = allowed.filter(s => !lockedStatuses.includes(s));
    }

    allowed = allowed.filter(s => s !== current);

    return allowed;
  };

  const filteredProducts = availableProducts.filter(p => p.tenSanPham.toLowerCase().includes(productSearch.toLowerCase()));

  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;
    const q = searchTerm.toLowerCase().trim();
    return orders.filter(order => {
      const techNames = order.technicians?.map(t => t.name).join(' ') || '';
      const statusText = getStatusText(order.status);
      const itemsText = order.items?.map(i => i.name).join(' ') || '';
      const orderIdShort = order.id.slice(-6).toUpperCase();

      return (
        order.id.toLowerCase().includes(q) ||
        orderIdShort.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.phoneNumber.includes(q) ||
        (order.productName || '').toLowerCase().includes(q) ||
        (order.address || '').toLowerCase().includes(q) ||
        (order.note || '').toLowerCase().includes(q) ||
        statusText.toLowerCase().includes(q) ||
        techNames.toLowerCase().includes(q) ||
        itemsText.toLowerCase().includes(q)
      );
    });
  }, [orders, searchTerm]);

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
      <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col overflow-x-auto">
        <div className="p-4 md:p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between text-left">
           <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" placeholder="Tìm kiếm đơn hàng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-bold text-xs uppercase dark:text-white" />
           </div>
        </div>

        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-full">
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
              {filteredOrders.map((order) => (
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
                    <div className="flex flex-wrap gap-1 items-center">
                      {order.technicians && order.technicians.length > 0 ? (
                        <>
                          {order.technicians.map(t => (
                            <span key={t.id} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-[#00459a] dark:text-blue-300 rounded text-[9px] font-black uppercase whitespace-nowrap">
                              {t.name}
                            </span>
                          ))}
                          {isCoordinator && !['completed', 'paid', 'cancelled'].includes(order.status) && (
                            <button onClick={() => {
                                let formattedDate = '';
                                if (order.scheduledDate) {
                                  const d = order.scheduledDate.toDate ? order.scheduledDate.toDate() : new Date(order.scheduledDate);
                                  formattedDate = d.toISOString().slice(0, 16);
                                }
                                setSelectedTechsInModal(order.technicians || []);
                                setShowAssignModal({ orderId: order.id, currentTechs: order.technicians || [], scheduledDate: formattedDate, visible: true });
                            }} className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded transition-colors">
                              <UserPlus size={14} />
                            </button>
                          )}
                        </>
                      ) : (
                        isCoordinator && !['completed', 'paid', 'cancelled'].includes(order.status) && (
                          <button onClick={() => {
                              let formattedDate = '';
                              if (order.scheduledDate) {
                                const d = order.scheduledDate.toDate ? order.scheduledDate.toDate() : new Date(order.scheduledDate);
                                formattedDate = d.toISOString().slice(0, 16);
                              }
                              setSelectedTechsInModal([]);
                              setShowAssignModal({ orderId: order.id, currentTechs: [], scheduledDate: formattedDate, visible: true });
                          }} className="text-[9px] font-black text-blue-500 uppercase flex items-center gap-1 hover:underline">
                            <UserPlus size={14} /> Phân công
                          </button>
                        )
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                        {isCoordinator ? (
                           <div className="relative group/locked">
                              <select
                                 value={order.status}
                                 onChange={(e) => handleUpdateStatus(order.id, order.status, e.target.value as OrderStatus)}
                                 className={`px-3 py-1.5 pr-8 rounded-lg text-[9px] font-black uppercase border appearance-none cursor-pointer outline-none transition-colors ${getStatusColor(order.status)}`}
                                 style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem top 50%', backgroundSize: '0.65rem auto' }}
                              >
                                 <option value={order.status}>{getStatusText(order.status)}</option>
                                 {getAllowedStatuses(order).map(s => (
                                    <option key={s} value={s}>{getStatusText(s)}</option>
                                 ))}
                              </select>
                              {isBeforeScheduledDate(order.scheduledDate) && (
                                 <div className="absolute left-0 top-full mt-1 bg-slate-900 dark:bg-slate-950 text-white rounded-xl shadow-xl border border-slate-700 z-50 py-3 px-3 hidden group-hover/locked:block min-w-[160px] text-[9px] font-bold text-center pointer-events-none">
                                    <AlertTriangle size={14} className="mx-auto mb-2 text-amber-400" />
                                    <p className="leading-tight">Chưa đến ngày hẹn</p>
                                    <p className="text-slate-400 mt-1">Các trạng thái xử lý bị khóa.</p>
                                    <p className="text-slate-400 mt-1">Còn {getDaysUntilScheduled(order.scheduledDate)} ngày</p>
                                 </div>
                              )}
                           </div>
                        ) : (
                           <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                           </span>
                        )}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                       <button onClick={() => setShowOrderModal({ type: 'detail', order, visible: true })} className="p-2 text-slate-400 hover:text-blue-500 bg-slate-50 dark:bg-slate-900 rounded-xl" title="Chi tiết"><Info size={16} /></button>
                       {(order.status === 'paid' || order.status === 'completed') && (
                         <button onClick={() => handleViewInvoice(order.id)} className="p-2 text-purple-500 hover:text-purple-700 bg-purple-50 dark:bg-purple-900/30 rounded-xl transition-all" title="Hóa đơn"><Receipt size={16} /></button>
                       )}
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
          <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-200 text-left">
             <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-4 text-left">
                   <div className="w-12 h-12 bg-[#0b1c30] text-white rounded-2xl flex items-center justify-center shadow-lg"><FileText size={24} /></div>
                   <div>
                      <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm">{showOrderModal.type === 'add' ? 'Khởi tạo đơn hàng mới' : 'Chi tiết nghiệp vụ'}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-widest">Hệ thống AquaCare Professional</p>
                   </div>
                </div>
                <button onClick={() => setShowOrderModal({ ...showOrderModal, visible: false })} className="text-slate-300 hover:text-rose-500 p-2 transition-colors"><X size={28} /></button>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-2 gap-10 text-left">
                   {/* Column 1: Info & Map */}
                   <div className="space-y-6">
                      <div className="p-6 bg-slate-50/30 dark:bg-slate-800/20 rounded-[2.5rem] space-y-4">
                         <div className="flex items-center gap-2 px-1 text-left"><User size={16} className="text-blue-600" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thông tin khách hàng</span></div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5 text-left">
                               <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Tên khách hàng</label>
                               <input name="customerName" value={formDataState.customerName} onChange={handleInputChange} readOnly={showOrderModal.type === 'detail'} className={`w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl outline-none font-bold text-xs uppercase ${errors.customerName ? 'border border-rose-500' : 'border-none shadow-sm'}`} placeholder="Nhập họ tên..." />
                               {errors.customerName && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.customerName}</p>}
                            </div>
                            <div className="space-y-1.5 text-left">
                               <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Số điện thoại</label>
                               <input name="phoneNumber" value={formDataState.phoneNumber} onChange={handleInputChange} readOnly={showOrderModal.type === 'detail'} className={`w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl outline-none font-bold text-xs ${errors.phoneNumber ? 'border border-rose-500' : 'border-none shadow-sm'}`} placeholder="090..." />
                               {errors.phoneNumber && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.phoneNumber}</p>}
                            </div>
                         </div>
                      </div>

                      <div className="p-6 bg-slate-50/30 dark:bg-slate-800/20 rounded-[2.5rem] space-y-4">
                         <div className="flex items-center gap-2 px-1 text-left"><MapPin size={16} className="text-blue-600" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Địa chỉ thi công</span></div>
                         <div className="grid grid-cols-3 gap-3">
                            <select value={formDataState.provinceCode} onChange={e => handleProvinceChange(e.target.value)} disabled={showOrderModal.type === 'detail'} className={`w-full px-3 py-3 bg-white dark:bg-slate-800 rounded-xl outline-none font-bold text-[10px] uppercase dark:text-white ${errors.provinceCode ? 'border border-rose-500' : 'border-none shadow-sm'}`}>
                               <option value="">Tỉnh/Thành</option>
                               {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                            </select>
                            <select value={formDataState.districtCode} onChange={e => handleDistrictChange(e.target.value)} disabled={showOrderModal.type === 'detail'} className={`w-full px-3 py-3 bg-white dark:bg-slate-800 rounded-xl outline-none font-bold text-[10px] uppercase dark:text-white ${errors.districtCode ? 'border border-rose-500' : 'border-none shadow-sm'}`}>
                               <option value="">Quận/Huyện</option>
                               {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                            </select>
                            <select value={formDataState.wardCode} onChange={e => {setFormDataState({...formDataState, wardCode: e.target.value}); setErrors(prev => {const n={...prev}; delete n.wardCode; return n;})}} disabled={showOrderModal.type === 'detail'} className={`w-full px-3 py-3 bg-white dark:bg-slate-800 rounded-xl outline-none font-bold text-[10px] uppercase dark:text-white ${errors.wardCode ? 'border border-rose-500' : 'border-none shadow-sm'}`}>
                               <option value="">Phường/Xã</option>
                               {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                            </select>
                            {(errors.provinceCode || errors.districtCode || errors.wardCode) && (
                               <p className="text-[9px] text-rose-500 font-bold ml-1 mt-1 col-span-3">
                                  {errors.provinceCode || errors.districtCode || errors.wardCode}
                               </p>
                            )}
                         </div>
                         <div className="space-y-1.5 text-left">
                            <input name="street" value={formDataState.street} onChange={handleInputChange} readOnly={showOrderModal.type === 'detail'} placeholder="Số nhà, tên đường..." className={`w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl outline-none font-bold text-xs dark:text-white border-none shadow-sm ${errors.street ? 'border border-rose-500' : ''}`} />
                            {errors.street && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.street}</p>}
                         </div>

                         {/* Google Maps Frame */}
                         <div className="mt-4 rounded-3xl overflow-hidden h-48 border border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 relative">
                            {formDataState.street ? (
                               <iframe width="100%" height="100%" frameBorder="0" style={{ border: 0 }} src={`https://www.google.com/maps?q=${encodeURIComponent(formDataState.street + ' ' + (wards.find(w => w.code === Number(formDataState.wardCode))?.name || ''))}&output=embed`} allowFullScreen title="Map"></iframe>
                            ) : (
                               <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                                  <MapIcon size={32} className="opacity-20" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Chưa xác định vị trí</span>
                               </div>
                            )}
                         </div>
                      </div>
                   </div>

                   {/* Column 2: Items & Summary */}
                   <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1.5 text-left">
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Lịch hẹn dự kiến</label>
                            <input type="datetime-local" name="scheduledDate" value={formDataState.scheduledDate} onChange={handleInputChange} readOnly={showOrderModal.type === 'detail'} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold text-xs border-none shadow-inner dark:text-white" />
                         </div>
                         <div className="space-y-1.5 text-left">
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Loại nghiệp vụ</label>
                            <select name="orderType" value={formDataState.orderType} onChange={handleInputChange} disabled={showOrderModal.type === 'detail'} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold text-xs uppercase border-none shadow-inner dark:text-white">
                               <option value="installation">Lắp đặt thiết bị</option>
                               <option value="maintenance">Bảo trì lõi lọc</option>
                               <option value="repair">Sửa chữa lỗi</option>
                            </select>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-2">
                                <Package size={16} className="text-blue-600" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hạng mục hàng hóa</span>
                                {errors.products && <span className="text-[9px] text-rose-500 font-bold ml-auto">{errors.products}</span>}
                            </div>
                            {showOrderModal.type !== 'detail' && (
                               <button type="button" onClick={() => setShowCustomProductForm(!showCustomProductForm)} className="text-[9px] font-black text-blue-600 uppercase flex items-center gap-1 hover:brightness-125 transition-all">
                                  {showCustomProductForm ? 'Quay lại kho' : <><Sparkles size={14} /> Tùy chỉnh linh động</>}
                               </button>
                            )}
                         </div>

                         {!showCustomProductForm && showOrderModal.type !== 'detail' && (
                            <div className="relative" ref={productInputRef}>
                               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                               <input type="text" placeholder="Tìm sản phẩm trong kho..." value={productSearch} onChange={(e) => {setProductSearch(e.target.value); setShowProductSuggestions(true);}} onFocus={() => setShowProductSuggestions(true)} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-bold text-xs dark:text-white shadow-inner" />
                               {showProductSuggestions && (
                                  <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 mt-2 z-[110] max-h-60 overflow-y-auto no-scrollbar">
                                     {filteredProducts.length > 0 ? filteredProducts.map(p => (
                                        <button key={p.id} type="button" onClick={() => handleAddProduct(p)} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border-b border-slate-50 dark:border-slate-700 last:border-0 text-left">
                                           <div>
                                              <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase">{p.tenSanPham}</p>
                                              <p className="text-[8px] text-slate-400 font-bold uppercase">Kho: {p.tonKho}</p>
                                           </div>
                                           <span className="text-[11px] font-black text-blue-600">{p.giaBan?.toLocaleString()}₫</span>
                                        </button>
                                     )) : (
                                        <div className="p-4 text-center text-slate-400 text-[10px] font-bold uppercase">Không tìm thấy sản phẩm</div>
                                     )}
                                  </div>
                               )}
                            </div>
                         )}

                         {showCustomProductForm && showOrderModal.type !== 'detail' && (
                            <div className="p-5 bg-blue-50/30 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-900/20 space-y-4 animate-in slide-in-from-top-2">
                               <input placeholder="Tên hàng hóa..." value={customProduct.name} onChange={e => setCustomProduct({...customProduct, name: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl font-bold text-xs uppercase dark:text-white outline-none shadow-sm" />
                               <div className="flex gap-3">
                                  <input type="number" placeholder="Đơn giá" value={customProduct.price} onChange={e => setCustomProduct({...customProduct, price: Number(e.target.value)})} className="w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl font-bold text-xs text-blue-600 outline-none shadow-sm" />
                                  <button type="button" onClick={handleAddCustomProduct} className="px-8 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Thêm</button>
                               </div>
                            </div>
                         )}

                         <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                            {selectedItems.map((item, idx) => (
                               <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-transparent group transition-all">
                                  <div className="text-left">
                                     <p className="text-[11px] font-black text-slate-700 dark:text-white uppercase">{item.name}</p>
                                     <p className="text-[9px] text-slate-400 font-bold">{item.price?.toLocaleString()}₫ x {item.quantity}</p>
                                  </div>
                                  <div className="flex items-center gap-4">
                                     <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                        {showOrderModal.type !== 'detail' && <button type="button" onClick={() => setSelectedItems(selectedItems.map((si, i) => i === idx ? { ...si, quantity: Math.max(1, si.quantity - 1) } : si))} className="text-slate-400 hover:text-rose-500"><Minus size={14} /></button>}
                                        <span className="text-xs font-black dark:text-white min-w-[20px] text-center">{item.quantity}</span>
                                        {showOrderModal.type !== 'detail' && <button type="button" onClick={() => setSelectedItems(selectedItems.map((si, i) => i === idx ? { ...si, quantity: si.quantity + 1 } : si))} className="text-slate-400 hover:text-blue-500"><Plus size={14} /></button>}
                                     </div>
                                     {showOrderModal.type !== 'detail' && <button type="button" onClick={() => setSelectedItems(selectedItems.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={16} /></button>}
                                  </div>
                               </div>
                            ))}
                            {errors.products && <p className="text-[10px] text-rose-500 font-bold text-center mt-2">{errors.products}</p>}
                         </div>
                      </div>

                      <div className="p-8 bg-[#0b1c30] rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                         <div className="flex justify-between items-center text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">
                            <span>Tổng thanh toán dự kiến</span>
                            <span>{selectedItems.length} hạng mục</span>
                         </div>
                         <div className="flex justify-between items-end border-t border-white/5 pt-4">
                            <span className="text-[10px] font-black uppercase text-slate-400">Thành tiền (VND)</span>
                            <span className="text-4xl font-black text-emerald-400 tracking-tighter">{calculateTotal().toLocaleString()}₫</span>
                         </div>
                      </div>

                      {showOrderModal.type !== 'detail' && (
                        <button type="submit" className="w-full py-5 bg-[#00459a] text-white rounded-[2rem] font-black uppercase text-xs shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all">Xác nhận nghiệp vụ</button>
                      )}
                   </div>
                </form>
             </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal.visible && showInvoiceModal.invoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200 text-left border border-slate-200 dark:border-slate-800">
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-purple-600"><Receipt size={24} /></div>
                    <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm">Hóa đơn điện tử</h3>
                 </div>
                 <button onClick={() => setShowInvoiceModal({ visible: false })} className="text-slate-300 hover:text-rose-500 p-2 transition-colors"><X size={28} /></button>
              </div>

              <div className="p-10 space-y-8 overflow-y-auto max-h-[75vh] custom-scrollbar bg-[radial-gradient(#f1f5f9_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]">
                 {/* Invoice Header */}
                 <div className="flex justify-between items-start">
                    <div className="text-left">
                       <h2 className="text-2xl font-black text-[#00459a] tracking-tighter uppercase italic">AquaCare</h2>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hệ thống giải pháp lọc nước thông minh</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase">Số hóa đơn</p>
                       <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tighter">{showInvoiceModal.invoice.invoiceNumber}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8 py-6 border-y border-dashed border-slate-200 dark:border-slate-800">
                    <div className="text-left space-y-1">
                       <p className="text-[9px] font-black text-slate-400 uppercase">Khách hàng</p>
                       <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">{showInvoiceModal.invoice.customerName}</p>
                       <p className="text-[10px] font-bold text-slate-500 italic">{showInvoiceModal.invoice.customerPhone}</p>
                    </div>
                    <div className="text-right space-y-1">
                       <p className="text-[9px] font-black text-slate-400 uppercase">Ngày phát hành</p>
                       <p className="text-xs font-black text-slate-700 dark:text-slate-200">{formatDateTime(showInvoiceModal.invoice.issuedAt)}</p>
                       <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded inline-block">Đã thanh toán (COD)</p>
                    </div>
                 </div>

                 {/* Items Table */}
                 <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">
                       <div className="col-span-6">Diễn giải hạng mục</div>
                       <div className="col-span-2 text-center">SL</div>
                       <div className="col-span-4 text-right">Thành tiền</div>
                    </div>
                    <div className="space-y-2">
                       {showInvoiceModal.invoice.items.map((item, i) => (
                          <div key={i} className="grid grid-cols-12 gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                             <div className="col-span-6 text-xs font-black text-slate-700 dark:text-slate-200 uppercase truncate">{item.name}</div>
                             <div className="col-span-2 text-xs font-bold text-slate-500 text-center">{item.quantity}</div>
                             <div className="col-span-4 text-xs font-black text-[#00459a] dark:text-blue-400 text-right">{(item.price * item.quantity).toLocaleString()}₫</div>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Totals */}
                 <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-end">
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Chữ ký điện tử</p>
                          <div className="w-24 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center italic text-slate-400 text-[8px] font-bold uppercase tracking-widest border border-dashed border-slate-200 dark:border-slate-700">Digital Signed</div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng cộng thanh toán</p>
                          <p className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">{showInvoiceModal.invoice.amount.toLocaleString()}₫</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-4">
                  <button onClick={() => handleDownloadPdf(showInvoiceModal.invoice!)} className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all"><Printer size={18} /> In bản vật lý</button>
                  <button onClick={() => handleDownloadPdf(showInvoiceModal.invoice!)} className="flex-1 py-4 bg-[#00459a] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all"><Download size={18} /> Tải PDF (E-Invoice)</button>
               </div>
            </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal.visible && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in duration-200 text-left">
             <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-widest">Phân công thi công</h3>
                <button onClick={() => setShowAssignModal({...showAssignModal, visible: false})} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all text-slate-400"><X size={24}/></button>
             </div>
             <div className="p-6 bg-blue-50/30 dark:bg-blue-900/10 border-b border-slate-100 dark:border-slate-800">
                <label className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-2">Lịch hẹn khách hàng</label>
                <input type="datetime-local" value={showAssignModal.scheduledDate} onChange={e => setShowAssignModal({...showAssignModal, scheduledDate: e.target.value})} className={`w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl font-bold text-xs outline-none shadow-sm dark:text-white ${!showAssignModal.scheduledDate ? 'border border-rose-500/50' : ''}`} />
                {!showAssignModal.scheduledDate && <p className="text-[9px] text-rose-500 font-bold mt-1 ml-1 uppercase">Bắt buộc phải có lịch hẹn</p>}
             </div>
             <div className="p-4 space-y-2 overflow-y-auto max-h-80 custom-scrollbar">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Chọn kỹ thuật viên ({selectedTechsInModal.length})</p>
                {technicians.map(tech => {
                  const isSelected = selectedTechsInModal.some(t => t.id === tech.uid);
                  return (
                    <button key={tech.uid} onClick={() => toggleTechSelection(tech.uid, tech.displayName || 'KTV')} className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                       <div className="text-left">
                          <p className={`text-xs font-black uppercase ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>{tech.displayName}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">{tech.email}</p>
                       </div>
                       {isSelected && <CheckCircle size={20} className="text-blue-600 dark:text-blue-400" />}
                    </button>
                  );
                })}
                {selectedTechsInModal.length === 0 && <p className="text-[9px] text-rose-500 font-bold text-center mt-2 uppercase">Vui lòng chọn ít nhất 1 nhân sự</p>}
             </div>
             <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <button onClick={handleSaveTechnicians} className="w-full py-4 bg-[#00459a] text-white rounded-2xl font-black text-[11px] uppercase shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Xác nhận phân công ({selectedTechsInModal.length})</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
