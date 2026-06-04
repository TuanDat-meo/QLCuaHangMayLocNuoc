/**
 * Dashboard Page - Modernized Admin Overview
 * Aligned with Material Design 3 and responsive principles
 */

import React, { useEffect, useState, useMemo } from 'react';
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
  Users,
  Activity,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  subscribeDashboardStats,
  subscribeRevenueTrend,
  subscribePendingOrders,
  subscribeTopProducts,
  subscribeMaintenanceTasks,
  updateOrderStatus,
  exportDashboardToCSV,
  DashboardStats,
  RevenueRange
} from '../services/dashboardService';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
  const [revenueRange, setRevenueRange] = useState<RevenueRange>('week');
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubStats = subscribeDashboardStats((data) => {
      setStats(data);
      setLoading(false);
    });
    const unsubPending = subscribePendingOrders(setPendingOrders);
    const unsubTop = subscribeTopProducts(setTopProducts);
    const unsubMaintenance = subscribeMaintenanceTasks(setMaintenanceTasks);

    return () => {
      unsubStats();
      unsubPending();
      unsubTop();
      unsubMaintenance();
    };
  }, []);

  useEffect(() => {
    const unsubTrend = subscribeRevenueTrend(revenueRange, (data) => {
      setRevenueTrend(data);
    });
    return () => unsubTrend();
  }, [revenueRange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatCompactNumber = (number: number) => {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    }
    if (number >= 1000) {
      return (number / 1000).toFixed(0) + 'K';
    }
    return number.toString();
  };

  const handleConfirmOrder = async (id: string) => {
    try {
      await updateOrderStatus(id, 'confirmed');
      toast.success('Đã xác nhận đơn hàng');
    } catch (error) {
      toast.error('Lỗi khi xác nhận đơn hàng');
    }
  };

  const handleExport = async () => {
    try {
      await exportDashboardToCSV();
      toast.success('Đã xuất báo cáo CSV');
    } catch (error) {
      toast.error('Lỗi khi xuất báo cáo');
    }
  };

  const maxSales = useMemo(() => {
    return topProducts.length > 0 ? Math.max(...topProducts.map(p => p.sales)) : 1;
  }, [topProducts]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-on-surface-variant font-bold animate-pulse">ĐANG TẢI DỮ LIỆU...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-lg pb-xl animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div>
          <h1 className="h1 text-on-surface font-black tracking-tight">Tổng quan hệ thống</h1>
          <p className="body-md text-on-surface-variant mt-xs">
            Dữ liệu thời gian thực từ hệ thống quản trị AquaCare.
          </p>
        </div>
        <div className="flex items-center gap-sm">
          <div className="hidden sm:flex items-center gap-xs px-md py-sm bg-surface-container-high text-on-surface font-bold rounded-2xl border border-outline-variant/30">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>Trực tuyến</span>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-md py-sm bg-primary text-on-primary rounded-2xl font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Báo cáo</span>
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
            <div className={`flex items-center gap-xs px-xs py-1 rounded-full ${stats && stats.orderGrowth >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-error bg-error/5'}`}>
              {stats && stats.orderGrowth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              <span className="text-[10px] font-black">{stats ? Math.abs(stats.orderGrowth).toFixed(1) : 0}%</span>
            </div>
          </div>
          <div className="mt-md">
            <h3 className="text-4xl font-black text-on-surface tracking-tighter">{stats?.newOrders || 0}</h3>
            <p className="label-sm text-on-surface-variant font-bold uppercase tracking-widest mt-xs">Đơn hàng mới</p>
          </div>
        </div>

        {/* STAT: REVENUE */}
        <div className="card group hover:border-secondary/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-all duration-300">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className={`flex items-center gap-xs px-xs py-1 rounded-full ${stats && stats.revenueGrowth >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-error bg-error/5'}`}>
              {stats && stats.revenueGrowth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              <span className="text-[10px] font-black">{stats ? Math.abs(stats.revenueGrowth).toFixed(1) : 0}%</span>
            </div>
          </div>
          <div className="mt-md">
            <h3 className="text-2xl font-black text-on-surface tracking-tight truncate">
              {stats ? formatCurrency(stats.totalRevenue) : '0 ₫'}
            </h3>
            <p className="label-sm text-on-surface-variant font-bold uppercase tracking-widest mt-xs">Doanh thu tổng</p>
          </div>
        </div>

        {/* STAT: CUSTOMERS */}
        <div className="card group hover:border-tertiary/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary group-hover:bg-tertiary group-hover:text-on-tertiary transition-all duration-300">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-[10px] font-black text-on-surface-variant bg-surface-container px-2 py-1 rounded-full uppercase">Cá nhân</div>
          </div>
          <div className="mt-md">
            <h3 className="text-4xl font-black text-on-surface tracking-tighter">{stats?.totalCustomers || 0}</h3>
            <p className="label-sm text-on-surface-variant font-bold uppercase tracking-widest mt-xs">Khách hàng</p>
          </div>
        </div>

        {/* STAT: MAINTENANCE */}
        <div className="card group border-l-4 border-l-error">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-error/10 flex items-center justify-center text-error">
              <Clock className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-error animate-pulse">
               <Activity className="w-3 h-3" />
               <span className="text-[10px] font-black uppercase">Live</span>
            </div>
          </div>
          <div className="mt-md">
            <h3 className="text-4xl font-black text-on-surface tracking-tighter">{stats?.maintenanceCount || 0}</h3>
            <p className="label-sm text-on-surface-variant font-bold uppercase tracking-widest mt-xs">Phiếu bảo trì</p>
          </div>
        </div>
      </div>

      {/* Main Charts & Lists Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-md">
        {/* Revenue Trend - AreaChart with Filter */}
        <div className="xl:col-span-2 card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-lg gap-md">
            <div>
              <h2 className="h3 text-on-surface font-black">Xu hướng doanh thu</h2>
              <p className="text-xs text-on-surface-variant font-medium">Theo dõi tăng trưởng theo thời gian</p>
            </div>
            <div className="flex bg-surface-container rounded-xl p-1 border border-outline-variant/30 self-start">
              {[
                { id: 'week', label: 'Tuần' },
                { id: 'month', label: 'Tháng' },
                { id: 'year', label: 'Năm' }
              ].map((range) => (
                <button
                  key={range.id}
                  onClick={() => setRevenueRange(range.id as RevenueRange)}
                  className={`px-md py-xs rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${revenueRange === range.id ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-80 w-full mt-4">
            {revenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00459a" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#00459a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                    tickFormatter={formatCompactNumber}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-on-surface text-surface p-3 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md">
                            <p className="text-[10px] font-black opacity-70 uppercase tracking-tighter mb-1">
                              {payload[0].payload.label}
                            </p>
                            <p className="text-sm font-black text-primary-container">
                              {formatCurrency(payload[0].value as number)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#00459a"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/50">
                <p className="text-xs text-on-surface-variant font-medium">Đang tải dữ liệu biểu đồ...</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products - Takes 1 column */}
        <div className="card">
          <div className="flex items-center justify-between mb-lg">
            <h2 className="h3 text-on-surface font-black">Top sản phẩm</h2>
            <button className="p-1 hover:bg-surface-container rounded-lg"><MoreVertical className="w-4 h-4 text-on-surface-variant" /></button>
          </div>

          <div className="space-y-lg">
            {topProducts.length > 0 ? topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-md">
                <div className={`w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center font-bold text-xs text-primary`}>
                  #{i+1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate uppercase tracking-tight">{p.name}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">{formatCurrency(p.price)} • {p.sales} Đơn</p>
                </div>
                <div className="text-right">
                   <p className="text-sm font-black text-on-surface">{p.sales}</p>
                   <div className="w-16 bg-surface-container rounded-full h-1 mt-1 overflow-hidden">
                      <div className={`bg-primary h-full transition-all duration-1000`} style={{ width: `${(p.sales / maxSales) * 100}%` }} />
                   </div>
                </div>
              </div>
            )) : (
              <p className="text-xs text-on-surface-variant text-center py-xl">Chưa có dữ liệu sản phẩm</p>
            )}
          </div>

          <button className="w-full mt-xl py-4 border-2 border-outline-variant/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-on-primary hover:border-primary transition-all">
            Xem tất cả báo cáo
          </button>
        </div>
      </div>

      {/* Task & Maintenance Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        {/* Orders to process */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between mb-lg">
            <h2 className="h3 text-on-surface font-black">Đơn hàng cần xử lý</h2>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">{pendingOrders.length} ĐANG CHỜ</span>
          </div>

          <div className="divide-y divide-outline-variant/20">
            {pendingOrders.length > 0 ? pendingOrders.map((order) => (
              <div key={order.id} className="py-md first:pt-0 last:pb-0 group">
                <div className="flex items-start justify-between gap-md">
                  <div className="flex-1">
                    <div className="flex items-center gap-xs mb-1">
                      <span className="text-xs font-black text-on-surface uppercase tracking-tighter">ORD-{order.id.slice(-6).toUpperCase()}</span>
                      <span className="text-[9px] px-2 py-0.5 bg-surface-container-highest rounded-lg text-on-surface-variant font-black uppercase tracking-widest">{order.productName || 'SẢN PHẨM'}</span>
                    </div>
                    <p className="text-sm font-bold text-on-surface-variant mb-xs">{order.customerName}</p>
                    <p className="text-[10px] text-on-surface-variant flex items-center gap-1 opacity-70">
                      📍 {order.address || 'Địa chỉ không xác định'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-sm">
                     <span className="text-sm font-black text-primary">{formatCurrency(order.total)}</span>
                     <button
                        onClick={() => handleConfirmOrder(order.id)}
                        className="px-md py-1.5 bg-primary text-on-primary rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:brightness-110 active:scale-95 transition-all"
                     >
                       Xác nhận
                     </button>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-xs text-on-surface-variant text-center py-xl">Không có đơn hàng chờ xử lý</p>
            )}
          </div>
        </div>

        {/* Maintenance */}
        <div className="card">
          <div className="flex items-center justify-between mb-lg">
            <h2 className="h3 text-on-surface font-black">Bảo trì cần xử lý</h2>
            <div className="flex items-center gap-xs">
              <div className="w-2 h-2 bg-error rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-error uppercase tracking-widest">{maintenanceTasks.length} NHIỆM VỤ</span>
            </div>
          </div>

          <div className="space-y-md">
            {maintenanceTasks.length > 0 ? maintenanceTasks.map((task) => (
              <div key={task.id} className={`p-md rounded-[2rem] border-2 transition-all bg-surface-container-low border-transparent hover:border-primary/10 hover:bg-white`}>
                <div className="flex gap-md">
                  <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 bg-surface-container-highest text-on-surface border border-outline-variant/30 shadow-inner`}>
                    <span className="text-[9px] font-black opacity-50 uppercase tracking-tighter leading-none">ID</span>
                    <span className="text-lg font-black leading-none">{task.id.slice(-2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-on-surface truncate uppercase tracking-tight">{task.type}</h4>
                    <p className="text-xs text-on-surface-variant font-medium mt-1">{task.client} • {task.time}</p>
                    <div className="flex items-center gap-md mt-lg">
                       <span className={`text-[9px] font-black px-3 py-1 rounded-full bg-secondary/10 text-secondary uppercase tracking-widest`}>
                         Bình thường
                       </span>
                       <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Phân công</button>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-xs text-on-surface-variant text-center py-xl">Không có lịch bảo trì cần xử lý</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
