import React from 'react';
import { Search, Filter, Calendar, Clock, ChevronRight, User, MapPin } from 'lucide-react';

const OrdersPage: React.FC = () => {
  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#0b1c30] tracking-tight">Hệ thống Đơn hàng</h1>
        <p className="text-slate-500 text-sm font-medium">Theo dõi và xử lý đơn hàng lắp đặt, bảo trì máy lọc nước</p>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {['Tất cả', 'Chờ duyệt', 'Đã phân công', 'Đang xử lý', 'Hoàn tất', 'Đã hủy'].map((status, i) => (
          <button
            key={i}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              i === 0 ? 'bg-[#00459a] text-white shadow-lg shadow-blue-500/20' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="text"
              placeholder="Tìm theo Mã đơn, tên khách hàng, số điện thoại..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 ring-[#00459a]/10 font-semibold text-sm"
            />
          </div>
          <button className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest px-4 py-2 hover:bg-slate-50 rounded-xl transition-colors">
            <Calendar size={18} /> Lọc theo ngày
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã đơn & Ngày tạo</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Khách hàng</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sản phẩm</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng tiền</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { id: 'ORD-8821', date: '12/05/2024', customer: 'Nguyễn Văn A', phone: '0988xxxxxx', items: 1, total: '11,700,000đ', status: 'Pending' },
                { id: 'ORD-8820', date: '11/05/2024', customer: 'Trần Thị B', phone: '0912xxxxxx', items: 2, total: '350,000đ', status: 'Assigned' },
                { id: 'ORD-8819', date: '10/05/2024', customer: 'Lê Văn C', phone: '0905xxxxxx', items: 1, total: '3,200,000đ', status: 'Completed' },
              ].map((order, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-black text-[#0b1c30] text-sm mb-1">{order.id}</span>
                      <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase">
                        <Clock size={12} /> {order.date}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700 text-sm">{order.customer}</span>
                      <span className="text-[10px] text-slate-400 font-bold tracking-wider">{order.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">{order.items} sản phẩm</span>
                  </td>
                  <td className="px-6 py-5 font-black text-[#00459a] text-sm">{order.total}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      order.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                      order.status === 'Assigned' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {order.status === 'Pending' ? 'Chờ duyệt' : order.status === 'Assigned' ? 'Đã phân công' : 'Hoàn tất'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <ChevronRight className="text-slate-200 group-hover:text-[#00459a] transition-colors inline-block" size={20} />
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

export default OrdersPage;
