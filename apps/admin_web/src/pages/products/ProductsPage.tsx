import React from 'react';
import { Package, Plus, Search, Filter, Edit2, Trash2 } from 'lucide-react';

const ProductsPage: React.FC = () => {
  return (
    <div className="p-8 bg-[#f8fafc] dark:bg-[#0f172a] min-h-screen transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#0b1c30] dark:text-white tracking-tight uppercase">Quản lý Sản phẩm</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Quản lý danh mục máy lọc nước và linh kiện hệ thống</p>
        </div>
        <button className="flex items-center gap-2 bg-[#00459a] dark:bg-blue-600 hover:bg-[#00367a] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95">
          <Plus size={18} /> Thêm sản phẩm mới
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Tổng sản phẩm', value: '48', color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Đang kinh doanh', value: '42', color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Hết hàng', value: '6', color: 'text-rose-600 dark:text-rose-400' },
          { label: 'Danh mục', value: '5', color: 'text-amber-600 dark:text-amber-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#1e293b] p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm, mã SKU..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl outline-none focus:ring-2 ring-[#00459a]/10 dark:ring-blue-500/10 font-semibold text-sm dark:text-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="p-3 bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><Filter size={20} /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Sản phẩm</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Danh mục</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Giá bán</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tồn kho</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {[
                { name: 'AquaPure Pro Max RO', cat: 'Máy lọc RO', price: '12,500,000đ', stock: 15, status: 'Active' },
                { name: 'Nano Ultra-X 2024', cat: 'Máy Nano', price: '3,200,000đ', stock: 0, status: 'OutOfStock' },
                { name: 'Bộ 3 lõi lọc thô 1-2-3', cat: 'Linh kiện', price: '350,000đ', stock: 124, status: 'Active' },
              ].map((product, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center">
                        <Package size={20} className="text-slate-400 dark:text-slate-600" />
                      </div>
                      <div>
                        <p className="font-bold text-[#0b1c30] dark:text-white text-sm">{product.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter">SKU: AC-2024-{i}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">{product.cat}</span>
                  </td>
                  <td className="px-6 py-4 font-black text-[#00459a] dark:text-blue-400 text-sm">{product.price}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold ${product.stock < 5 ? 'text-rose-500' : 'text-slate-600 dark:text-slate-400'}`}>{product.stock} cái</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      product.status === 'Active' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'
                    }`}>
                      {product.status === 'Active' ? 'Đang bán' : 'Hết hàng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 dark:text-slate-600 hover:text-[#00459a] dark:hover:text-blue-400 transition-colors"><Edit2 size={16} /></button>
                      <button className="p-2 text-slate-400 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
