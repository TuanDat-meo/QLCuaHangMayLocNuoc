import React, { useState, useEffect } from 'react';
import {
  Package, Plus, Search, Filter, Edit2, Trash2,
  X, Check, AlertTriangle, Info, Box, DollarSign,
  Layers, RefreshCcw, MoreVertical, Image as ImageIcon,
  Truck
} from 'lucide-react';
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  Product
} from '../../services/productService';
import { toast, Toaster } from 'react-hot-toast';
import { logActivity } from '../../services/auditService';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  // Modal states
  const [showModal, setShowModal] = useState<{
    visible: boolean,
    type: 'add' | 'edit' | 'detail',
    product?: Product
  }>({ visible: false, type: 'add' });

  const categories = ['Tất cả', 'Máy lọc RO', 'Máy Nano', 'Máy Ion Kiềm', 'Linh kiện', 'Lõi lọc'];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (product: Product) => {
    if (window.confirm(`Bạn có chắc muốn xóa sản phẩm "${product.tenSanPham}"?`)) {
      try {
        await deleteProduct(product.id);
        await logActivity("Xóa sản phẩm", "Sản phẩm", product.id, product, 'warning');
        toast.success("Đã xóa sản phẩm");
        fetchProducts();
      } catch (error) {
        toast.error("Xóa thất bại");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const productData = {
      tenSanPham: formData.get('tenSanPham') as string,
      danhMuc: formData.get('danhMuc') as string,
      nhaCungCap: formData.get('nhaCungCap') as string,
      giaBan: Number(formData.get('giaBan')),
      tonKho: Number(formData.get('tonKho')),
      trangThai: (Number(formData.get('tonKho')) > 0 ? 'Active' : 'OutOfStock') as any,
      moTa: formData.get('moTa') as string,
      sku: formData.get('sku') as string,
      imageUrl: formData.get('imageUrl') as string,
    };

    try {
      if (showModal.type === 'add') {
        await addProduct(productData);
        await logActivity("Thêm sản phẩm mới", "Sản phẩm", "new", productData, 'success');
        toast.success("Đã thêm sản phẩm");
      } else if (showModal.type === 'edit' && showModal.product) {
        await updateProduct(showModal.product.id, productData);
        await logActivity("Cập nhật sản phẩm", "Sản phẩm", showModal.product.id, productData, 'info');
        toast.success("Đã cập nhật sản phẩm");
      }
      setShowModal({ ...showModal, visible: false });
      fetchProducts();
    } catch (error) {
      toast.error("Thao tác thất bại");
    }
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.tenSanPham.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.nhaCungCap?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'Tất cả' || p.danhMuc === selectedCategory;
    return matchSearch && matchCat;
  });

  const stats = {
    total: products.length,
    active: products.filter(p => p.trangThai === 'Active').length,
    outOfStock: products.filter(p => p.tonKho === 0).length,
    categories: new Set(products.map(p => p.danhMuc)).size
  };

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] dark:bg-[#0f172a] min-h-screen transition-colors duration-300 font-sans">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#0b1c30] dark:text-white tracking-tight uppercase flex items-center gap-3">
            <Box className="text-blue-600" size={28} />
            Quản lý Sản phẩm & Kho
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-widest mt-1">
            Hệ thống quản lý vật tư AquaCare
          </p>
        </div>
        <div className="flex gap-2">
           <button
             onClick={() => fetchProducts()}
             className="p-3 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl border border-slate-100 dark:border-slate-800 hover:text-blue-500 transition-all shadow-sm"
           >
             <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
           </button>
           <button
             onClick={() => setShowModal({ visible: true, type: 'add' })}
             className="flex items-center gap-2 bg-[#00459a] dark:bg-blue-600 hover:brightness-110 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95"
           >
             <Plus size={18} /> Thêm sản phẩm
           </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[
          { label: 'Tổng sản phẩm', value: stats.total, color: 'text-blue-600', icon: Box, bg: 'bg-blue-50' },
          { label: 'Đang bán', value: stats.active, color: 'text-emerald-600', icon: Check, bg: 'bg-emerald-50' },
          { label: 'Hết hàng', value: stats.outOfStock, color: 'text-rose-600', icon: AlertTriangle, bg: 'bg-rose-50' },
          { label: 'Danh mục', value: stats.categories, color: 'text-amber-600', icon: Layers, bg: 'bg-amber-50' },
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

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mb-8 transition-colors">
        <div className="p-4 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm, SKU, Nhà cung cấp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl outline-none focus:ring-2 ring-blue-500/10 font-bold text-xs uppercase dark:text-white placeholder:normal-case shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  selectedCategory === cat
                  ? 'bg-[#0b1c30] text-white dark:bg-white dark:text-[#0b1c30]'
                  : 'bg-slate-50 dark:bg-slate-900/50 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sản phẩm</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh mục</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nhà cung cấp</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tồn kho</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Giá bán</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-8"><div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-xl w-full"></div></td>
                  </tr>
                ))
              ) : filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-800">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package size={20} className="text-slate-300 dark:text-slate-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-black text-[#0b1c30] dark:text-white text-xs uppercase tracking-tight">{product.tenSanPham}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">SKU: {product.sku || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg uppercase">{product.danhMuc}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Truck size={14} className="text-slate-300" />
                      <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase">{product.nhaCungCap || 'Chưa cập nhật'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                       <span className={`text-xs font-black ${product.tonKho < 5 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>{product.tonKho}</span>
                       <div className="w-16 h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${product.tonKho < 5 ? 'bg-rose-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(100, (product.tonKho / 50) * 100)}%` }}
                          />
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-blue-600 dark:text-blue-400 text-xs">
                    {product.giaBan?.toLocaleString('vi-VN')}₫
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                      product.trangThai === 'Active'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50'
                      : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/50'
                    }`}>
                      {product.trangThai === 'Active' ? 'Đang kinh doanh' : 'Hết hàng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button
                        onClick={() => setShowModal({ visible: true, type: 'detail', product })}
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                      >
                        <Info size={16} />
                      </button>
                      <button
                        onClick={() => setShowModal({ visible: true, type: 'edit', product })}
                        className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                     <Package size={48} className="mx-auto text-slate-200 mb-4" />
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Không tìm thấy sản phẩm nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {showModal.visible && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-200 border border-slate-100 dark:border-slate-800">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0b1c30] text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm">
                    {showModal.type === 'add' ? 'Thêm sản phẩm mới' : showModal.type === 'edit' ? 'Cập nhật sản phẩm' : 'Chi tiết sản phẩm'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cấu hình thông tin hàng hóa & kho</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal({ ...showModal, visible: false })}
                className="text-slate-300 hover:text-rose-500 transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Tên sản phẩm</label>
                    <input
                      name="tenSanPham"
                      defaultValue={showModal.product?.tenSanPham}
                      required
                      readOnly={showModal.type === 'detail'}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold text-xs uppercase focus:ring-2 ring-blue-500/10 dark:text-white"
                      placeholder="VD: MÁY LỌC NƯỚC AQUA PRO..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Danh mục</label>
                      <select
                        name="danhMuc"
                        defaultValue={showModal.product?.danhMuc}
                        disabled={showModal.type === 'detail'}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold text-xs uppercase appearance-none dark:text-white"
                      >
                        {categories.filter(c => c !== 'Tất cả').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Nhà cung cấp</label>
                      <input
                        name="nhaCungCap"
                        defaultValue={showModal.product?.nhaCungCap}
                        readOnly={showModal.type === 'detail'}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold text-xs uppercase dark:text-white"
                        placeholder="TÊN NHÀ CUNG CẤP..."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Mã SKU</label>
                      <input
                        name="sku"
                        defaultValue={showModal.product?.sku}
                        readOnly={showModal.type === 'detail'}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold text-xs uppercase dark:text-white"
                        placeholder="AC-001"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Tồn kho</label>
                      <div className="relative">
                        <input
                          name="tonKho"
                          type="number"
                          defaultValue={showModal.product?.tonKho ?? 0}
                          readOnly={showModal.type === 'detail'}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-black text-xs uppercase dark:text-white"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase">Cái</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1 text-blue-600">Giá bán niêm yết</label>
                    <div className="relative">
                      <input
                        name="giaBan"
                        type="number"
                        defaultValue={showModal.product?.giaBan}
                        required
                        readOnly={showModal.type === 'detail'}
                        className="w-full pl-8 pr-4 py-3 bg-blue-50/30 dark:bg-blue-900/20 border-2 border-blue-50 dark:border-blue-900/30 rounded-2xl outline-none font-black text-sm text-blue-600 dark:text-blue-400"
                        placeholder="0"
                      />
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={14} />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-400 uppercase">VNĐ</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Link ảnh sản phẩm</label>
                    <div className="relative">
                      <input
                        name="imageUrl"
                        defaultValue={showModal.product?.imageUrl}
                        readOnly={showModal.type === 'detail'}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold text-[10px] dark:text-white"
                        placeholder="https://example.com/image.jpg"
                      />
                      <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Mô tả sản phẩm</label>
                    <textarea
                      name="moTa"
                      defaultValue={showModal.product?.moTa}
                      readOnly={showModal.type === 'detail'}
                      rows={5}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold text-xs dark:text-white resize-none"
                      placeholder="Thông số kỹ thuật, bảo hành..."
                    />
                  </div>
                </div>
              </div>

              {showModal.type !== 'detail' ? (
                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowModal({ ...showModal, visible: false })}
                    className="flex-1 py-4 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100 dark:border-slate-800"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-4 bg-[#0b1c30] dark:bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-500/10 hover:brightness-110 transition-all"
                  >
                    {showModal.type === 'add' ? 'Khởi tạo sản phẩm' : 'Lưu thay đổi'}
                  </button>
                </div>
              ) : (
                <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                   <div className="text-[9px] font-black text-slate-400 uppercase">
                      Cập nhật lần cuối: {showModal.product?.updatedAt?.toDate().toLocaleString('vi-VN') || '---'}
                   </div>
                   <button
                    type="button"
                    onClick={() => setShowModal({ ...showModal, type: 'edit' })}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-500/20"
                   >
                     Chỉnh sửa
                   </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
