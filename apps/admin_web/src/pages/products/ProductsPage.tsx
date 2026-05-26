import React from 'react';
import { Package, Plus, Search, Filter, MoreVertical, Edit2, Trash2, Eye } from 'lucide-react';

const ProductsPage: React.FC = () => {
  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#0b1c30] tracking-tight">Quản lý Sản phẩm</h1>
          <p className="text-slate-500 text-sm font-medium">Quản lý danh mục máy lọc nước và linh kiện hệ thống</p>
        </div>
        <button className="flex items-center gap-2 bg-[#00459a] hover:bg-[#00367a] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95">
          <Plus size={18} /> Thêm sản phẩm mới
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Tổng sản phẩm', value: '48', color: 'blue' },
          { label: 'Đang kinh doanh', value: '42', color: 'emerald' },
          { label: 'Hết hàng', value: '6', color: 'rose' },
          { label: 'Danh mục', value: '5', color: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-2xl font-black text-${stat.color}-600`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm, mã SKU..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 ring-[#00459a]/10 font-semibold text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="p-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors"><Filter size={20} /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sản phẩm</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh mục</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Giá bán</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tồn kho</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { name: 'AquaPure Pro Max RO', cat: 'Máy lọc RO', price: '12,500,000đ', stock: 15, status: 'Active' },
                { name: 'Nano Ultra-X 2024', cat: 'Máy Nano', price: '3,200,000đ', stock: 0, status: 'OutOfStock' },
                { name: 'Bộ 3 lõi lọc thô 1-2-3', cat: 'Linh kiện', price: '350,000đ', stock: 124, status: 'Active' },
              ].map((product, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                        <Package size={20} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="font-bold text-[#0b1c30] text-sm">{product.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">SKU: AC-2024-{i}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">{product.cat}</span>
                  </td>
                  <td className="px-6 py-4 font-black text-[#00459a] text-sm">{product.price}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold ${product.stock < 5 ? 'text-rose-500' : 'text-slate-600'}`}>{product.stock} cái</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      product.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {product.status === 'Active' ? 'Đang bán' : 'Hết hàng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-[#00459a] transition-colors"><Edit2 size={16} /></button>
                      <button className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
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
