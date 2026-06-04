import React, { useState, useEffect, useMemo } from 'react';
import {
  Package, Search, Edit2, Trash2,
  X, Box, RefreshCcw, Truck,
  Building2, Layers as LayersIcon,
  Plus, AlertTriangle, Check, Info,
  ShoppingCart, PlusCircle, MinusCircle,
  CheckCircle2, Camera, TrendingUp, Wallet, ShieldCheck,
  ChevronDown, ChevronUp, FileText
} from 'lucide-react';
import {
  getProducts,
  updateProduct,
  addProduct,
  Product
} from '../../services/productService';
import {
  getSuppliers,
  getImportVouchers,
  addSupplier,
  updateSupplier,
  createImportVoucher
} from '../../services/supplierService';
import { Supplier, ImportVoucher, ImportVoucherItem } from '../../types/supplier';
import { toast, Toaster } from 'react-hot-toast';
import { logActivity } from '../../services/auditService';
import { useAuth } from '../../hooks/useAuth';

const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'suppliers' | 'imports'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [imports, setImports] = useState<ImportVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');

  // Trạng thái cho Form Phiếu nhập hàng
  const [importItems, setImportItems] = useState<Partial<ImportVoucherItem>[]>([
    { productName: '', quantity: 1, importPrice: 0, sellingPrice: 0, sku: '', category: 'Linh kiện', imageUrl: '' }
  ]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showModal, setShowModal] = useState<{
    visible: boolean,
    type: 'add' | 'edit' | 'detail' | 'import' | 'supplier_add' | 'supplier_edit',
    product?: Product,
    supplier?: Supplier,
    importData?: ImportVoucher
  }>({ visible: false, type: 'add' });

  const categories = ['Tất cả', 'Máy lọc RO', 'Máy Nano', 'Máy Ion Kiềm', 'Linh kiện', 'Lõi lọc', 'Khác'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodData, supData, impData] = await Promise.all([
        getProducts(),
        getSuppliers(),
        getImportVouchers()
      ]);
      setProducts(prodData);
      setSuppliers(supData);
      setImports(impData);
    } catch (error: any) {
      console.error("Lỗi tải dữ liệu:", error);
      toast.error("Lỗi tải dữ liệu hệ thống");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!showModal.visible) {
      setErrors({});
    }
  }, [showModal.visible]);

  const stats = useMemo(() => ({
    total: products.filter(p => p.trangThai !== 'Inactive').length,
    active: products.filter(p => p.trangThai === 'Active').length,
    outOfStock: products.filter(p => p.trangThai !== 'Inactive' && (Number(p.tonKho) || Number((p as any).soLuongTon) || 0) === 0).length,
    catCount: new Set(products.filter(p => p.trangThai !== 'Inactive').map(p => p.danhMuc)).size
  }), [products]);

  const filteredData = () => {
    const term = searchTerm.toLowerCase();
    if (activeTab === 'products') {
      return products.filter(p =>
        p.trangThai !== 'Inactive' &&
        (p.tenSanPham.toLowerCase().includes(term) || (p.sku || '').toLowerCase().includes(term) || (p.nhaCungCap || '').toLowerCase().includes(term)) &&
        (selectedCategory === 'Tất cả' || p.danhMuc === selectedCategory)
      );
    }
    if (activeTab === 'suppliers') {
      return suppliers.filter(s => s.name.toLowerCase().includes(term) || (s.phone || '').includes(term));
    }
    return imports.filter(i => (i.supplierName || '').toLowerCase().includes(term) || i.id.toLowerCase().includes(term));
  };

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newErrors: Record<string, string> = {};

    const tenSanPham = formData.get('tenSanPham') as string;
    const sku = formData.get('sku') as string;
    const giaBan = Number(formData.get('giaBan'));
    const thoiGianBaoHanh = Number(formData.get('thoiGianBaoHanh'));

    if (!tenSanPham) newErrors.tenSanPham = "Tên sản phẩm không được để trống";
    if (!sku) newErrors.sku = "Mã SKU không được để trống";
    if (isNaN(giaBan) || giaBan < 0) newErrors.giaBan = "Giá bán phải lớn hơn hoặc bằng 0";
    if (isNaN(thoiGianBaoHanh) || thoiGianBaoHanh < 0) newErrors.thoiGianBaoHanh = "Bảo hành không hợp lệ";

    if (showModal.type === 'add') {
      const tonKho = Number(formData.get('tonKho'));
      if (isNaN(tonKho) || tonKho < 0) newErrors.tonKho = "Số lượng tồn kho không hợp lệ";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    const currentStock = Number(showModal.product?.tonKho || (showModal.product as any)?.soLuongTon || 0);
    const tonKho = showModal.type === 'edit' ? currentStock : Number(formData.get('tonKho') || 0);

    const data: any = {
      tenSanPham,
      danhMuc: formData.get('danhMuc') as string,
      giaBan,
      tonKho: tonKho,
      soLuongTon: tonKho,
      moTa: formData.get('moTa') as string,
      sku,
      imageUrl: formData.get('imageUrl') as string,
      nhaCungCap: formData.get('nhaCungCap') as string,
      thoiGianBaoHanh,
      trangThai: tonKho > 0 ? 'Active' : 'OutOfStock'
    };

    try {
      if (showModal.type === 'edit' && showModal.product) {
        await updateProduct(showModal.product.id, data);
        toast.success("Đã cập nhật thông tin sản phẩm");
        await logActivity("Cập nhật sản phẩm", "Kho hàng", showModal.product.id, data);
      } else {
        await addProduct(data);
        toast.success("Đã thêm sản phẩm mới");
        await logActivity("Thêm sản phẩm", "Kho hàng", data.tenSanPham, data);
      }
      setShowModal({ ...showModal, visible: false });
      fetchData();
    } catch (error: any) {
      toast.error("Thao tác thất bại");
    }
  };

  const handleSupplierSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newErrors: Record<string, string> = {};

    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const address = formData.get('address') as string;

    if (!name) newErrors.name = "Tên nhà cung cấp không được để trống";
    if (!phone) newErrors.phone = "Số điện thoại không được để trống";
    else if (!/^\d{10,11}$/.test(phone)) newErrors.phone = "Số điện thoại không hợp lệ (10-11 số)";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Email không đúng định dạng";
    if (!address) newErrors.address = "Địa chỉ không được để trống";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    const data: any = {
      name,
      phone,
      email,
      address,
      taxCode: formData.get('taxCode') as string,
      status: formData.get('status') as string || 'Active'
    };

    try {
      if (showModal.type === 'supplier_add') {
        await addSupplier(data);
        toast.success("Đã thêm nhà cung cấp mới");
        await logActivity("Thêm nhà cung cấp", "Đối tác", data.name, data);
      } else if (showModal.type === 'supplier_edit' && showModal.supplier) {
        await updateSupplier(showModal.supplier.id, data);
        toast.success("Đã cập nhật nhà cung cấp");
        await logActivity("Cập nhật nhà cung cấp", "Đối tác", showModal.supplier.id, data);
      }
      setShowModal({ ...showModal, visible: false });
      fetchData();
    } catch (error) {
      toast.error("Thao tác thất bại");
    }
  };

  const handleImportSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!selectedSupplierId) {
      newErrors.selectedSupplierId = "Vui lòng chọn nhà cung cấp";
    }

    if (selectedSupplierId === 'NEW_SUPPLIER') {
      const formData = new FormData(e.currentTarget);
      if (!formData.get('newSupplierName')) newErrors.newSupplierName = "Tên NCC không được trống";
      if (!formData.get('newSupplierPhone')) newErrors.newSupplierPhone = "SĐT không được trống";
      if (!formData.get('newSupplierAddress')) newErrors.newSupplierAddress = "Địa chỉ không được trống";
    }

    importItems.forEach((item, index) => {
      if (!item.productName) newErrors[`item_${index}_productName`] = "Tên sản phẩm trống";
      if (!item.quantity || item.quantity <= 0) newErrors[`item_${index}_quantity`] = "Số lượng > 0";
      if (item.importPrice === undefined || item.importPrice <= 0) newErrors[`item_${index}_importPrice`] = "Giá nhập > 0";
      if (item.sellingPrice === undefined || item.sellingPrice < 0) newErrors[`item_${index}_sellingPrice`] = "Giá bán >= 0";
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Thông tin nhập hàng chưa hợp lệ");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const isNewSup = selectedSupplierId === 'NEW_SUPPLIER';
    const supplier = suppliers.find(s => s.id === selectedSupplierId);

    const voucherData: any = {
      supplierId: selectedSupplierId,
      supplierName: isNewSup ? formData.get('newSupplierName') : (supplier?.name || 'N/A'),
      importDate: new Date(),
      items: importItems as ImportVoucherItem[],
      totalAmount: importItems.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.importPrice) || 0)), 0),
      createdBy: user?.uid || 'unknown',
      createdByName: user?.displayName || user?.email || 'Hệ thống',
      status: 'Completed' as const,
      note: formData.get('note') as string
    };

    if (isNewSup) {
      voucherData.newSupplierName = formData.get('newSupplierName');
      voucherData.newSupplierPhone = formData.get('newSupplierPhone');
      voucherData.newSupplierTaxCode = formData.get('newSupplierTaxCode');
      voucherData.newSupplierAddress = formData.get('newSupplierAddress');
    }

    try {
      await createImportVoucher(voucherData);
      toast.success("Đã tạo phiếu nhập và cập nhật kho");
      await logActivity("Nhập hàng", "Kho hàng", voucherData.supplierName, voucherData);
      setShowModal({ ...showModal, visible: false });
      setImportItems([{ productName: '', quantity: 1, importPrice: 0, sellingPrice: 0, sku: '', category: 'Linh kiện', imageUrl: '' }]);
      setSelectedSupplierId('');
      setExpandedRows([]);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tạo phiếu nhập");
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    const stock = Number(product.tonKho || (product as any).soLuongTon || 0);
    let confirmMsg = stock > 0
      ? `Sản phẩm "${product.tenSanPham}" vẫn còn ${stock} hàng trong kho. Xác nhận xóa (ngừng hoạt động)?`
      : `Bạn có chắc muốn xóa sản phẩm "${product.tenSanPham}" không?`;

    if (window.confirm(confirmMsg)) {
      try {
        await updateProduct(product.id, { trangThai: 'Inactive' });
        toast.success("Đã ngừng hoạt động sản phẩm");
        await logActivity("Ngừng hoạt động sản phẩm", "Kho hàng", product.id, product);
        fetchData();
      } catch (error) {
        toast.error("Không thể thực hiện thao tác");
      }
    }
  };

  const toggleRowExpansion = (index: number) => {
    setExpandedRows(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const getSupplierStatusText = (status: string) => {
    return status === 'Active' ? 'Đang hợp tác' : 'Ngừng hợp tác';
  };

  return (
    <div className="w-full max-w-full transition-all font-sans text-left overflow-x-hidden">
      <Toaster position="top-right" />

      {/* Header - Optimized width */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8 w-full">
        <div>
          <h1 className="text-2xl font-black text-[#0b1c30] dark:text-white tracking-tight uppercase flex items-center gap-3">
            <div className="p-2.5 bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <Box className="text-[#00459a]" size={28} />
            </div>
            Quản lý Sản phẩm & Kho
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">
            Hệ thống quản lý vật tư AquaCare
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
           <button onClick={() => fetchData()} className="p-3.5 bg-white dark:bg-[#1e293b] text-slate-400 rounded-2xl border border-slate-100 dark:border-slate-800 hover:text-blue-500 transition-all shadow-sm active:scale-90" title="Làm mới">
             <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
           </button>
           {activeTab !== 'products' && (
             <button
               onClick={() => {
                 if (activeTab === 'suppliers') setShowModal({ visible: true, type: 'supplier_add' });
                 else setShowModal({ visible: true, type: 'import' });
               }}
               className="flex items-center gap-2 bg-[#00459a] hover:brightness-110 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95 whitespace-nowrap"
             >
               <Plus size={20} /> Thêm {activeTab === 'suppliers' ? 'Nhà cung cấp' : 'Đơn nhập'}
             </button>
           )}
        </div>
      </div>

      {/* Stats Overview - Expansive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 w-full">
        {[
          { label: 'Tổng sản phẩm', value: stats.total, color: 'text-blue-600', icon: Box, bg: 'bg-blue-50' },
          { label: 'Đang kinh doanh', value: stats.active, color: 'text-emerald-600', icon: Check, bg: 'bg-emerald-50' },
          { label: 'Sắp hết hàng', value: stats.outOfStock, color: 'text-rose-600', icon: AlertTriangle, bg: 'bg-rose-50' },
          { label: 'Nhóm danh mục', value: stats.catCount, color: 'text-amber-600', icon: LayersIcon, bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#1e293b] p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
            <div className={`w-14 h-14 ${stat.bg} dark:bg-slate-900/50 rounded-2xl flex items-center justify-center ${stat.color} shadow-inner`}>
              <stat.icon size={26} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color} dark:text-white`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Tabs Section */}
      <div className="flex flex-col space-y-6 mb-8 w-full">
        <div className="flex flex-col xl:flex-row gap-4 w-full">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text" placeholder={activeTab === 'products' ? "Tìm theo tên sản phẩm, SKU, nhà cung cấp..." : "Tìm tên đối tác, mã đơn..."}
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl text-[13px] font-bold outline-none shadow-sm focus:ring-2 ring-blue-500/10 transition-all"
            />
          </div>
          <div className="flex bg-white dark:bg-[#1e293b] rounded-2xl p-1.5 shadow-sm border border-slate-100 dark:border-slate-800 w-fit overflow-x-auto no-scrollbar">
            {[
              { id: 'products', label: 'Kho vật tư' },
              { id: 'suppliers', label: 'Nhà cung cấp' },
              { id: 'imports', label: 'Lịch sử nhập hàng' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-8 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-[#0b1c30] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>{tab.label}</button>
            ))}
          </div>
        </div>

        {activeTab === 'products' && (
          <div className="flex bg-white dark:bg-[#1e293b] rounded-2xl p-1.5 shadow-sm border border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar w-full">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-blue-50 text-[#00459a]' : 'text-slate-400 hover:text-slate-600'}`}>{cat}</button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area - Full Width Grid */}
      <div className="w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <RefreshCcw className="animate-spin text-[#00459a] mb-4" size={48} />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Đang đồng bộ hóa kho hàng...</p>
          </div>
        ) : (
          <>
            {activeTab === 'products' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-6 w-full">
                 {filteredData().map((product: any) => (
                    <div key={product.id} className="group bg-white dark:bg-[#1e293b] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden transition-all hover:shadow-2xl hover:translate-y-[-6px]">
                       <div className="relative h-52 bg-slate-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.tenSanPham} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          ) : (
                            <Box size={56} className="text-slate-200" />
                          )}
                          <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
                             <button onClick={() => setShowModal({ visible: true, type: 'edit', product })} className="p-3 bg-white dark:bg-slate-800 text-blue-500 rounded-xl shadow-xl hover:bg-blue-50 transition-all"><Edit2 size={16} /></button>
                             <button onClick={() => handleDeleteProduct(product)} className="p-3 bg-white dark:bg-slate-800 text-rose-500 rounded-xl shadow-xl hover:bg-rose-50 transition-all"><Trash2 size={16} /></button>
                          </div>
                          <div className="absolute bottom-4 left-4 flex gap-2">
                             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg ${Number(product.tonKho || product.soLuongTon) > 0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>{Number(product.tonKho || product.soLuongTon) > 0 ? 'Sẵn hàng' : 'Hết hàng'}</span>
                             {product.thoiGianBaoHanh > 0 && (
                               <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg bg-amber-500 text-white flex items-center gap-1">
                                 <ShieldCheck size={10} /> {product.thoiGianBaoHanh}T
                               </span>
                             )}
                          </div>
                       </div>
                       <div className="p-7">
                          <div className="flex items-center gap-2 mb-3">
                             <span className="text-[9px] font-black uppercase text-[#00459a] bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg">{product.danhMuc}</span>
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-auto">SKU: {product.sku || 'N/A'}</span>
                          </div>
                          <h3 className="font-black text-slate-800 dark:text-white truncate mb-6 uppercase tracking-tight text-sm leading-tight">{product.tenSanPham}</h3>
                          <div className="flex items-center justify-between pt-5 border-t border-slate-50 dark:border-slate-800">
                             <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Giá bán niêm yết</p>
                                <p className="text-base font-black text-[#00459a] dark:text-blue-400">{Number(product.giaBan).toLocaleString()}đ</p>
                             </div>
                             <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tồn kho</p>
                                <p className="text-base font-black text-slate-700 dark:text-slate-300">{Number(product.tonKho || product.soLuongTon || 0)}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
            )}

            {activeTab === 'suppliers' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 w-full">
                {filteredData().map((supplier: any) => (
                   <div key={supplier.id} className="bg-white dark:bg-[#1e293b] p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 relative group transition-all hover:shadow-2xl">
                      <div className="flex items-center gap-5 mb-10">
                         <div className="w-16 h-14 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-[#00459a] shadow-inner"><Building2 size={28} /></div>
                         <div className="flex-1 min-w-0">
                            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-base leading-tight truncate mb-1.5">{supplier.name}</h3>
                            <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${supplier.status === 'Active' ? 'text-emerald-500 bg-emerald-50 border border-emerald-100' : 'text-rose-500 bg-rose-50 border border-rose-100'}`}>{getSupplierStatusText(supplier.status)}</span>
                         </div>
                         <button onClick={() => setShowModal({ visible: true, type: 'supplier_edit', supplier })} className="p-2.5 text-slate-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all"><Edit2 size={20} /></button>
                      </div>
                      <div className="space-y-4">
                         <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400"><TrendingUp size={14} className="text-slate-300" /> SĐT: {supplier.phone}</div>
                         <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400"><ShoppingCart size={14} className="text-slate-300" /> {supplier.email}</div>
                         {supplier.taxCode && <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400"><FileText size={14} className="text-slate-300" /> MST: {supplier.taxCode}</div>}
                         <div className="flex items-start gap-3 text-[11px] font-bold text-slate-400 pt-5 border-t border-slate-50 dark:border-slate-800"><Info size={14} className="shrink-0 mt-0.5" /> {supplier.address}</div>
                      </div>
                   </div>
                ))}
              </div>
            )}

            {activeTab === 'imports' && (
              <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xl w-full">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-full">
                       <thead>
                          <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                             <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Mã đơn nhập</th>
                             <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Ngày giao dịch</th>
                             <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Đối tác cung ứng</th>
                             <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Tổng giá trị</th>
                             <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Nhân viên tạo</th>
                             <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Trạng thái</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                          {filteredData().map((imp: any) => (
                             <tr key={imp.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                                <td className="px-10 py-6 font-black text-xs text-[#00459a] uppercase">#{imp.id.slice(-8).toUpperCase()}</td>
                                <td className="px-10 py-6 font-bold text-xs text-slate-500">
                                  {imp.importDate?.toDate ? new Date(imp.importDate.toDate()).toLocaleDateString('vi-VN') : new Date(imp.importDate).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="px-10 py-6 font-black text-xs text-slate-700 dark:text-slate-300 uppercase tracking-tight">{imp.supplierName}</td>
                                <td className="px-10 py-6 font-black text-xs text-slate-700 dark:text-slate-300 text-right">{Number(imp.totalAmount).toLocaleString()}đ</td>
                                <td className="px-10 py-6 font-bold text-xs text-slate-500">{imp.createdByName}</td>
                                <td className="px-10 py-6 text-center"><span className="px-5 py-2 rounded-full bg-emerald-50 text-emerald-500 text-[9px] font-black uppercase tracking-widest border border-emerald-100">Đã nhập kho</span></td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* --- CÁC MODAL --- */}
      {/* Modal: Sản phẩm */}
      {showModal.visible && (showModal.type === 'add' || showModal.type === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
           <div className="bg-white dark:bg-[#1e293b] rounded-[3rem] w-full max-w-2xl p-10 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-8 text-left">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-[#00459a] shadow-inner">
                      <PlusCircle size={24} />
                   </div>
                   <h2 className="text-2xl font-black text-[#0b1c30] dark:text-white uppercase tracking-tight">{showModal.type === 'add' ? 'Khởi tạo vật tư' : 'Cập nhật thông tin'}</h2>
                 </div>
                 <button onClick={() => setShowModal({ visible: false, type: 'add' })} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={32} /></button>
              </div>
              <form onSubmit={handleProductSubmit} className="space-y-6 text-left">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tên gọi sản phẩm</label>
                       <input name="tenSanPham" defaultValue={showModal.product?.tenSanPham} type="text" className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-black text-xs uppercase dark:text-white ${errors.tenSanPham ? 'ring-2 ring-rose-500/50' : ''}`} />
                       {errors.tenSanPham && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.tenSanPham}</p>}
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Mã nhận diện SKU</label>
                       <input name="sku" defaultValue={showModal.product?.sku} type="text" className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-black text-xs dark:text-white ${errors.sku ? 'ring-2 ring-rose-500/50' : ''}`} />
                       {errors.sku && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.sku}</p>}
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nhóm hàng hóa</label>
                       <select name="danhMuc" defaultValue={showModal.product?.danhMuc || 'Máy lọc RO'} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-black text-[11px] uppercase text-slate-700 dark:text-white">
                          {categories.filter(c => c !== 'Tất cả').map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Giá bán ra niêm yết</label>
                       <input name="giaBan" defaultValue={showModal.product?.giaBan} type="number" className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-black text-xs dark:text-white ${errors.giaBan ? 'ring-2 ring-rose-500/50' : ''}`} />
                       {errors.giaBan && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.giaBan}</p>}
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Thời gian bảo hành (Tháng)</label>
                       <input name="thoiGianBaoHanh" defaultValue={showModal.product?.thoiGianBaoHanh || 0} type="number" className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-black text-xs dark:text-white ${errors.thoiGianBaoHanh ? 'ring-2 ring-rose-500/50' : ''}`} />
                       {errors.thoiGianBaoHanh && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.thoiGianBaoHanh}</p>}
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Đơn vị phân phối</label>
                       <select name="nhaCungCap" defaultValue={showModal.product?.nhaCungCap} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl font-black text-[11px] uppercase text-slate-700 dark:text-white">
                          <option value="">Chọn nhà cung cấp</option>
                          {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                       </select>
                    </div>
                    {showModal.type === 'add' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Số lượng hiện có</label>
                        <input name="tonKho" type="number" className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-black text-xs dark:text-white ${errors.tonKho ? 'ring-2 ring-rose-500/50' : ''}`} />
                        {errors.tonKho && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.tonKho}</p>}
                      </div>
                    )}
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Đường dẫn hình ảnh</label>
                    <div className="flex gap-2">
                       <input name="imageUrl" defaultValue={showModal.product?.imageUrl} type="text" placeholder="https://..." className="flex-1 px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-bold text-xs dark:text-white" />
                       <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-slate-400 flex items-center justify-center shadow-inner"><Camera size={20} /></div>
                    </div>
                 </div>
                 <button type="submit" className="w-full py-5 bg-[#00459a] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <CheckCircle2 size={22} />
                    {showModal.type === 'add' ? 'Xác nhận tạo mới' : 'Lưu mọi thay đổi'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Modal: Nhà cung cấp */}
      {showModal.visible && (showModal.type === 'supplier_add' || showModal.type === 'supplier_edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
           <div className="bg-white dark:bg-[#1e293b] rounded-[3rem] w-full max-w-2xl p-10 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-8 text-left">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-[#00459a] shadow-inner">
                      <Building2 size={24} />
                   </div>
                   <h2 className="text-2xl font-black text-[#0b1c30] dark:text-white uppercase tracking-tight">
                     {showModal.type === 'supplier_add' ? 'Thêm nhà cung cấp' : 'Cập nhật nhà cung cấp'}
                   </h2>
                 </div>
                 <button onClick={() => setShowModal({ visible: false, type: 'add' })} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={32} /></button>
              </div>
              <form onSubmit={handleSupplierSubmit} className="space-y-6 text-left">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tên nhà cung cấp</label>
                       <input name="name" defaultValue={showModal.supplier?.name} type="text" className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-black text-xs uppercase dark:text-white ${errors.name ? 'ring-2 ring-rose-500/50' : ''}`} />
                       {errors.name && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.name}</p>}
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Số điện thoại</label>
                       <input name="phone" defaultValue={showModal.supplier?.phone} type="text" className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-black text-xs dark:text-white ${errors.phone ? 'ring-2 ring-rose-500/50' : ''}`} />
                       {errors.phone && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.phone}</p>}
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Email liên hệ</label>
                       <input name="email" defaultValue={showModal.supplier?.email} type="email" className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-black text-xs dark:text-white ${errors.email ? 'ring-2 ring-rose-500/50' : ''}`} />
                       {errors.email && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.email}</p>}
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Mã số thuế</label>
                       <input name="taxCode" defaultValue={showModal.supplier?.taxCode} type="text" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-black text-xs dark:text-white" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Trạng thái</label>
                       <select name="status" defaultValue={showModal.supplier?.status || 'Active'} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-black text-[11px] uppercase text-slate-700 dark:text-white">
                          <option value="Active">Đang hợp tác</option>
                          <option value="Inactive">Ngừng hợp tác</option>
                       </select>
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Địa chỉ trụ sở</label>
                    <textarea name="address" defaultValue={showModal.supplier?.address} rows={3} className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-bold text-xs dark:text-white resize-none ${errors.address ? 'ring-2 ring-rose-500/50' : ''}`} />
                    {errors.address && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.address}</p>}
                 </div>
                 <button type="submit" className="w-full py-5 bg-[#00459a] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <CheckCircle2 size={22} />
                    {showModal.type === 'supplier_add' ? 'Xác nhận thêm mới' : 'Lưu thay đổi'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Modal: Phiếu nhập hàng - Optimized Large Width */}
      {showModal.visible && showModal.type === 'import' && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1e293b] rounded-[3rem] w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-300 text-left">
               <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center shrink-0">
                  <div>
                    <h2 className="text-2xl font-black text-[#0b1c30] dark:text-white uppercase tracking-tight">Tạo lệnh nhập vật tư</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Cập nhật số lượng tồn kho & giá vốn hệ thống</p>
                  </div>
                  <button onClick={() => setShowModal({ visible: false, type: 'add' })} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={36} /></button>
               </div>

               <form onSubmit={handleImportSubmit} className="flex-1 overflow-hidden flex flex-col">
                  <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Đơn vị cung ứng (Gợi ý NCC)</label>
                           <select value={selectedSupplierId} onChange={(e) => setSelectedSupplierId(e.target.value)} className={`w-full px-6 py-4 bg-blue-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-black text-[11px] uppercase text-[#00459a] shadow-inner ${errors.selectedSupplierId ? 'ring-2 ring-rose-500/50' : ''}`}>
                              <option value="">-- Lựa chọn nhà phân phối --</option>
                              <option value="NEW_SUPPLIER" className="font-bold text-blue-600">+ THÊM NHÀ CUNG CẤP MỚI TRỰC TIẾP</option>
                              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                           </select>
                           {errors.selectedSupplierId && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.selectedSupplierId}</p>}
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Ngày chứng từ (Hệ thống)</label>
                           <div className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl font-black text-[11px] uppercase text-slate-400 shadow-inner flex items-center gap-2"><RefreshCcw size={14} /> {new Date().toLocaleDateString('vi-VN')}</div>
                        </div>

                        {selectedSupplierId === 'NEW_SUPPLIER' && (
                          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-blue-500 uppercase ml-1">Tên nhà cung cấp mới</label>
                                <input name="newSupplierName" type="text" placeholder="Nhập tên..." className={`w-full px-5 py-3 bg-white dark:bg-slate-900 border-none rounded-xl outline-none font-bold text-xs ${errors.newSupplierName ? 'ring-1 ring-rose-500/50' : ''}`} />
                                {errors.newSupplierName && <p className="text-[8px] text-rose-500 font-bold ml-1">{errors.newSupplierName}</p>}
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-blue-500 uppercase ml-1">Số điện thoại</label>
                                <input name="newSupplierPhone" type="text" placeholder="SĐT..." className={`w-full px-5 py-3 bg-white dark:bg-slate-900 border-none rounded-xl outline-none font-bold text-xs ${errors.newSupplierPhone ? 'ring-1 ring-rose-500/50' : ''}`} />
                                {errors.newSupplierPhone && <p className="text-[8px] text-rose-500 font-bold ml-1">{errors.newSupplierPhone}</p>}
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-blue-500 uppercase ml-1">Mã số thuế</label>
                                <input name="newSupplierTaxCode" type="text" placeholder="MST (nếu có)..." className="w-full px-5 py-3 bg-white dark:bg-slate-900 border-none rounded-xl outline-none font-bold text-xs" />
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-blue-500 uppercase ml-1">Địa chỉ</label>
                                <input name="newSupplierAddress" type="text" placeholder="Địa chỉ..." className={`w-full px-5 py-3 bg-white dark:bg-slate-900 border-none rounded-xl outline-none font-bold text-xs ${errors.newSupplierAddress ? 'ring-1 ring-rose-500/50' : ''}`} />
                                {errors.newSupplierAddress && <p className="text-[8px] text-rose-500 font-bold ml-1">{errors.newSupplierAddress}</p>}
                             </div>
                          </div>
                        )}
                     </div>

                     <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-2">
                           <label className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Danh mục hàng hóa nhập kho (Gợi ý sản phẩm)</label>
                           <button type="button" onClick={() => setImportItems([...importItems, { productName: '', quantity: 1, importPrice: 0, sellingPrice: 0, sku: '', category: 'Linh kiện', imageUrl: '' }])} className="flex items-center gap-2 text-[#00459a] font-black text-[10px] uppercase tracking-widest bg-blue-50 px-5 py-2 rounded-xl hover:bg-blue-100 transition-all">
                              <PlusCircle size={16} /> Thêm dòng mới
                           </button>
                        </div>

                        {/* Hàng tiêu đề danh sách - Chỉ hiển thị trên Desktop */}
                        <div className="hidden md:grid grid-cols-12 gap-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <div className="col-span-4">Thông tin sản phẩm</div>
                           <div className="col-span-2">Số lượng</div>
                           <div className="col-span-2">Đơn giá nhập</div>
                           <div className="col-span-2">Giá niêm yết</div>
                        </div>

                        <datalist id="product-suggestions">
                          {products.map(p => (
                            <option key={p.id} value={p.tenSanPham} />
                          ))}
                        </datalist>

                        <div className="space-y-3">
                           {importItems.map((item, index) => (
                              <div key={index} className="flex flex-col p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 gap-4">
                                 <div className="grid grid-cols-12 gap-3 items-center">
                                    <div className="col-span-12 md:col-span-4">
                                      <label className="md:hidden text-[9px] font-black text-slate-400 uppercase mb-1 block">Sản phẩm</label>
                                      <div className="relative">
                                        <input list="product-suggestions" placeholder="Tên sản phẩm nhập..." value={item.productName}
                                          onChange={(e) => {
                                            const newItems = [...importItems];
                                            const val = e.target.value;
                                            newItems[index].productName = val;
                                            const existing = products.find(p => p.tenSanPham === val);
                                            if (existing) {
                                              newItems[index].sku = existing.sku;
                                              newItems[index].category = existing.danhMuc;
                                              newItems[index].imageUrl = existing.imageUrl;
                                              if (!newItems[index].sellingPrice) newItems[index].sellingPrice = existing.giaBan;
                                            } else {
                                              // Nếu gõ tên mới thì tự động mở rộng để nhập info sp mới
                                              if (!expandedRows.includes(index)) {
                                                setExpandedRows(prev => [...prev, index]);
                                              }
                                            }
                                            setImportItems(newItems);
                                          }}
                                          className={`w-full px-5 py-3.5 bg-white dark:bg-slate-800 border-none rounded-xl outline-none font-bold text-xs dark:text-white shadow-sm ${errors[`item_${index}_productName`] ? 'ring-2 ring-rose-500/50' : ''}`} />
                                          {errors[`item_${index}_productName`] && <p className="text-[8px] text-rose-500 font-bold mt-1 ml-1">{errors[`item_${index}_productName`]}</p>}
                                      </div>
                                    </div>
                                    <div className="col-span-4 md:col-span-2">
                                      <label className="md:hidden text-[9px] font-black text-slate-400 uppercase mb-1 block">Số lượng</label>
                                      <input type="number" placeholder="Số lượng" value={item.quantity} onChange={(e) => { const newItems = [...importItems]; newItems[index].quantity = Number(e.target.value); setImportItems(newItems); }} className={`w-full px-5 py-3.5 bg-white dark:bg-slate-800 border-none rounded-xl outline-none font-bold text-xs dark:text-white shadow-sm ${errors[`item_${index}_quantity`] ? 'ring-2 ring-rose-500/50' : ''}`} />
                                      {errors[`item_${index}_quantity`] && <p className="text-[8px] text-rose-500 font-bold mt-1 ml-1">{errors[`item_${index}_quantity`]}</p>}
                                    </div>
                                    <div className="col-span-4 md:col-span-2">
                                      <label className="md:hidden text-[9px] font-black text-slate-400 uppercase mb-1 block">Giá nhập</label>
                                      <input type="number" placeholder="Giá nhập" value={item.importPrice} onChange={(e) => { const newItems = [...importItems]; newItems[index].importPrice = Number(e.target.value); setImportItems(newItems); }} className={`w-full px-5 py-3.5 bg-white dark:bg-slate-800 border-none rounded-xl outline-none font-bold text-xs dark:text-white shadow-sm ${errors[`item_${index}_importPrice`] ? 'ring-2 ring-rose-500/50' : ''}`} />
                                      {errors[`item_${index}_importPrice`] && <p className="text-[8px] text-rose-500 font-bold mt-1 ml-1">{errors[`item_${index}_importPrice`]}</p>}
                                    </div>
                                    <div className="col-span-4 md:col-span-2">
                                      <label className="md:hidden text-[9px] font-black text-slate-400 uppercase mb-1 block">Giá bán</label>
                                      <input type="number" placeholder="Giá bán" value={item.sellingPrice} onChange={(e) => { const newItems = [...importItems]; newItems[index].sellingPrice = Number(e.target.value); setImportItems(newItems); }} className={`w-full px-5 py-3.5 bg-white dark:bg-slate-800 border-none rounded-xl outline-none font-bold text-xs dark:text-white shadow-sm ${errors[`item_${index}_sellingPrice`] ? 'ring-2 ring-rose-500/50' : ''}`} />
                                      {errors[`item_${index}_sellingPrice`] && <p className="text-[8px] text-rose-500 font-bold mt-1 ml-1">{errors[`item_${index}_sellingPrice`]}</p>}
                                    </div>
                                    <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-1">
                                       <button type="button" onClick={() => toggleRowExpansion(index)} className="p-2 text-slate-400 hover:text-blue-500 transition-all" title="Thông tin chi tiết (cho SP mới)">
                                          {expandedRows.includes(index) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                       </button>
                                       {importItems.length > 1 && (
                                         <button type="button" onClick={() => setImportItems(importItems.filter((_, i) => i !== index))} className="p-2 text-rose-400 hover:text-rose-600 transition-all">
                                            <Trash2 size={18} />
                                         </button>
                                       )}
                                    </div>
                                 </div>

                                 {expandedRows.includes(index) && (
                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
                                      <div className="space-y-1">
                                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mã SKU</label>
                                         <input placeholder="SKU sản phẩm..." value={item.sku} onChange={(e) => { const newItems = [...importItems]; newItems[index].sku = e.target.value; setImportItems(newItems); }} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border-none rounded-lg outline-none font-bold text-[11px]" />
                                      </div>
                                      <div className="space-y-1">
                                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Danh mục</label>
                                         <select value={item.category} onChange={(e) => { const newItems = [...importItems]; newItems[index].category = e.target.value; setImportItems(newItems); }} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border-none rounded-lg outline-none font-bold text-[11px]">
                                            {categories.filter(c => c !== 'Tất cả').map(c => <option key={c} value={c}>{c}</option>)}
                                         </select>
                                      </div>
                                      <div className="space-y-1">
                                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ảnh (URL)</label>
                                         <input placeholder="https://..." value={item.imageUrl} onChange={(e) => { const newItems = [...importItems]; newItems[index].imageUrl = e.target.value; setImportItems(newItems); }} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border-none rounded-lg outline-none font-bold text-[11px]" />
                                      </div>
                                   </div>
                                 )}
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="px-8 pb-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Ghi chú đơn hàng</label>
                           <textarea name="note" rows={2} placeholder="Nhập ghi chú hoặc lý do nhập kho..." className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-bold text-xs dark:text-white resize-none" />
                        </div>
                     </div>
                  </div>

                  <div className="p-8 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><Wallet size={12} /> Tổng giá trị lô hàng</p>
                        <p className="text-3xl font-black text-[#00459a] dark:text-blue-400">
                           {importItems.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.importPrice) || 0)), 0).toLocaleString()}đ
                        </p>
                     </div>
                     <div className="flex gap-4">
                        <button type="button" onClick={() => {
                           setShowModal({ visible: false, type: 'add' });
                           setExpandedRows([]);
                        }} className="px-10 py-4 bg-white dark:bg-slate-800 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">Hủy bỏ</button>
                        <button type="submit" className="px-14 py-4 bg-[#00459a] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-3">
                           <ShoppingCart size={22} /> Xác nhận nhập kho
                        </button>
                     </div>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default ProductsPage;
