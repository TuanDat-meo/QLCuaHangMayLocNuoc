/**
 * Dashboard Page - Modernized Admin Overview (Reverted to Original Colors)
 * Aligned with Material Design 3 and responsive principles
 */

import React from 'react';
import {
  ShoppingCart,
  DollarSign,
  Zap,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Download,
  Calendar,
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-lg pb-xl text-left">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div>
          <h1 className="h1 text-on-surface">Tổng quan hệ thống</h1>
          <p className="body-md text-on-surface-variant mt-xs font-medium">
            Chào mừng trở lại! Đây là những gì đang diễn ra với Aquacare hôm nay.
          </p>
        </div>
        <div className="flex items-center gap-sm">
          <button className="flex items-center gap-xs px-md py-sm bg-white text-on-surface font-semibold rounded-xl border border-outline-variant/30 hover:bg-slate-50 transition-all shadow-sm">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-xs uppercase tracking-widest">Hôm nay</span>
          </button>
          <button className="p-sm bg-primary text-on-primary rounded-xl hover:shadow-ambient-md transition-all active:scale-95">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        {/* STAT: NEW ORDERS */}
        <div className="card group hover:border-primary/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-xs text-emerald-600 bg-emerald-50 px-xs py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" />
              <span className="text-[10px] font-bold">+12.5%</span>
            </div>
          </div>
          <div className="mt-md">
            <h3 className="text-3xl font-bold text-on-surface tracking-tight">128</h3>
            <p className="label-sm text-on-surface-variant font-semibold mt-xs">ĐƠN HÀNG MỚI</p>
          </div>
          <div className="mt-md pt-md border-t border-outline-variant/20">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>

        {/* STAT: REVENUE */}
        <div className="card group hover:border-secondary/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-all duration-300">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-xs text-emerald-600 bg-emerald-50 px-xs py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" />
              <span className="text-[10px] font-bold">+8.2%</span>
            </div>
          </div>
          <div className="mt-md">
            <h3 className="text-3xl font-bold text-on-surface tracking-tight">45.8M</h3>
            <p className="label-sm text-on-surface-variant font-semibold mt-xs">DOANH THU (VND)</p>
          </div>
          <div className="mt-md pt-md border-t border-outline-variant/20">
             <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: '42%' }}></div>
            </div>
          </div>
        </div>

        {/* STAT: ACTIVE TECHS */}
        <div className="card group hover:border-tertiary/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary group-hover:bg-tertiary group-hover:text-on-tertiary transition-all duration-300">
              <Zap className="w-6 h-6" />
            </div>
            <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-xs py-1 rounded-full uppercase tracking-tighter">
              ONLINE
            </div>
          </div>
          <div className="mt-md">
            <h3 className="text-3xl font-bold text-on-surface tracking-tight">8/10</h3>
            <p className="label-sm text-on-surface-variant font-semibold mt-xs">KỸ THUẬT VIÊN</p>
          </div>
          <div className="mt-md pt-md border-t border-outline-variant/20">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                  KT
                </div>
              ))}
              <div className="w-7 h-7 rounded-full border-2 border-white bg-blue-50 flex items-center justify-center text-[8px] font-bold text-primary">
                +4
              </div>
            </div>
          </div>
        </div>

        {/* STAT: MAINTENANCE */}
        <div className="card group hover:border-error/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-error/10 flex items-center justify-center text-error group-hover:bg-error group-hover:text-on-error transition-all duration-300">
              <Clock className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-xs text-error bg-error/5 px-xs py-1 rounded-full">
              <ArrowDownRight className="w-3 h-3" />
              <span className="text-[10px] font-bold">-2%</span>
            </div>
          </div>
          <div className="mt-md">
            <h3 className="text-3xl font-bold text-on-surface tracking-tight">15</h3>
            <p className="label-sm text-on-surface-variant font-semibold mt-xs">LỊCH BẢO TRÌ SẮP TỚI</p>
          </div>
          <div className="mt-md pt-md border-t border-outline-variant/20">
             <p className="text-[10px] text-error font-bold flex items-center gap-1 uppercase">
               <AlertTriangle className="w-3 h-3" /> 3 lịch bị quá hạn
             </p>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-red-50 text-error p-md rounded-2xl flex items-center justify-between border border-red-100 shadow-sm">
        <div className="flex items-center gap-md">
          <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-body-md uppercase tracking-widest">Cảnh báo hệ thống</p>
            <p className="text-sm opacity-80 font-medium">Có 3 sản phẩm trong kho sắp hết hàng. Vui lòng nhập thêm hàng sớm.</p>
          </div>
        </div>
        <button className="px-md py-xs bg-error text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200">
          Xử lý ngay
        </button>
      </div>

      {/* Main Charts & Lists Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-md">

        {/* Revenue Trend */}
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-lg">
            <div>
              <h2 className="h3 text-on-surface uppercase tracking-tight">Xu hướng doanh thu</h2>
              <p className="text-xs text-on-surface-variant font-bold">THỐNG KÊ CHI TIẾT THEO TUẦN</p>
            </div>
            <div className="flex bg-slate-100 rounded-xl p-1">
              <button className="px-md py-xs bg-white text-primary shadow-sm rounded-lg text-xs font-bold uppercase tracking-widest">Tuần</button>
              <button className="px-md py-xs text-on-surface-variant text-xs font-bold uppercase tracking-widest">Tháng</button>
            </div>
          </div>

          <div className="h-64 bg-slate-50/50 rounded-2xl border-2 border-dashed border-outline-variant/50 flex flex-col items-center justify-center gap-md">
             <div className="flex items-end gap-sm h-32">
                {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                  <div key={i} className="w-8 bg-primary/10 rounded-t-lg relative group">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-lg transition-all duration-1000 group-hover:scale-105"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
             </div>
             <p className="text-xs text-on-surface-variant font-black uppercase tracking-[0.2em]">Biểu đồ tương tác sẽ hiển thị tại đây</p>
          </div>
        </div>

        {/* Top Products */}
        <div className="card">
          <div className="flex items-center justify-between mb-lg">
            <h2 className="h3 text-on-surface uppercase tracking-tight">Top sản phẩm</h2>
            <button className="p-1 hover:bg-slate-100 rounded-lg transition-colors"><MoreVertical className="w-4 h-4 text-on-surface-variant" /></button>
          </div>

          <div className="space-y-lg">
            {[
              { name: 'AquaPro RO-7 Plus', price: '4.5M', sales: 42, color: 'bg-primary' },
              { name: 'EcoFilter UV Max', price: '3.2M', sales: 28, color: 'bg-secondary' },
              { name: 'Basic Inline 3-Step', price: '0.8M', sales: 16, color: 'bg-tertiary' },
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-md">
                <div className={`w-12 h-12 ${p.color}/10 rounded-xl flex items-center justify-center font-bold text-xs ${p.color.replace('bg-', 'text-')}`}>
                  #{i+1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">{p.name}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mt-1">{p.price} • {p.sales} Đơn</p>
                </div>
                <div className="text-right">
                   <p className="text-sm font-bold text-on-surface">{p.sales}%</p>
                   <div className="w-16 bg-slate-100 rounded-full h-1 mt-1 overflow-hidden">
                      <div className={`${p.color} h-full`} style={{ width: `${p.sales}%` }} />
                   </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-xl py-sm border-2 border-dashed border-outline-variant/30 rounded-xl text-xs font-bold text-primary hover:bg-primary/5 transition-all uppercase tracking-widest">
            Xem tất cả báo cáo
          </button>
        </div>
      </div>

      {/* Task & Maintenance Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        {/* Orders to process */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between mb-lg">
            <h2 className="h3 text-on-surface uppercase tracking-tight">Đơn hàng mới</h2>
            <span className="px-xs py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold uppercase tracking-widest">5 ĐANG CHỜ</span>
          </div>

          <div className="divide-y divide-outline-variant/20">
            {[1, 2].map((id) => (
              <div key={id} className="py-md first:pt-0 last:pb-0 group">
                <div className="flex items-start justify-between gap-md">
                  <div className="flex-1">
                    <div className="flex items-center gap-xs mb-1">
                      <span className="text-xs font-bold text-on-surface">ORD-2023-890{id}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-on-surface-variant font-black">MÁY LỌC NƯỚC</span>
                    </div>
                    <p className="text-sm font-medium text-on-surface-variant mb-xs">Khách hàng: Nguyễn Văn {id === 1 ? 'A' : 'B'}</p>
                    <p className="text-[10px] text-on-surface-variant flex items-center gap-1">
                      📍 Quận {id === 1 ? '1' : '7'}, TP. Hồ Chí Minh
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-sm">
                     <span className="text-sm font-bold text-primary">4.500.000đ</span>
                     <button className="px-md py-1.5 bg-primary text-on-primary rounded-xl text-[10px] font-bold shadow-sm hover:shadow-ambient-md active:scale-95 transition-all uppercase tracking-widest">
                       Xác nhận
                     </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance */}
        <div className="card">
          <div className="flex items-center justify-between mb-lg">
            <h2 className="h3 text-on-surface uppercase tracking-tight">Bảo trì hôm nay</h2>
            <div className="flex items-center gap-xs">
              <div className="w-2 h-2 bg-error rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              <span className="text-[10px] font-bold text-error uppercase tracking-widest">3 KHẨN CẤP</span>
            </div>
          </div>

          <div className="space-y-md">
            {[1, 2].map((id) => (
              <div key={id} className={`p-md rounded-2xl border transition-all ${id === 1 ? 'bg-red-50/30 border-red-100 shadow-inner' : 'bg-slate-50/50 border-transparent hover:border-outline-variant/30'}`}>
                <div className="flex gap-md">
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${id === 1 ? 'bg-error text-on-error' : 'bg-white text-on-surface shadow-sm'}`}>
                    <span className="text-[10px] font-bold opacity-80 uppercase leading-none mb-1">JAN</span>
                    <span className="text-lg font-bold leading-none uppercase">14</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-on-surface truncate uppercase tracking-tight leading-tight">Thay lõi lọc định kỳ - DEV-4558</h4>
                    <p className="text-xs text-on-surface-variant mt-1 font-medium">Lê Văn C • TP. Thủ Đức</p>
                    <div className="flex items-center justify-between mt-md">
                       <span className={`text-[9px] font-bold px-md py-1 rounded-lg border ${id === 1 ? 'bg-white text-error border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100'} uppercase tracking-widest`}>
                         {id === 1 ? 'ƯU TIÊN CAO' : 'BÌNH THƯỜNG'}
                       </span>
                       <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">Phân công</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
