/**
 * Dashboard Page - AquaCare Admin Command Center
 * Synchronized with Dark/Light Mode
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  ShoppingCart,
  DollarSign,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Loader2,
  Activity,
  ChevronRight,
  Users,
  RefreshCw,
  Database,
  Lock,
  XCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import {
  subscribeDashboardStats,
  subscribeRevenueTrend,
  subscribeTopProducts,
  subscribePendingOrders,
  subscribeRecentLogs,
  subscribeMaintenanceTasks,
  updateOrderStatus,
  exportDashboardToCSV,
  RecentOrder,
  ActivityLog,
  MaintenanceTask,
  DashboardStats,
  RevenueData,
  TopProduct
} from '../../services/dashboardService';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  console.log("Rendering Dashboard Real File (pages/dashboard/DashboardPage.tsx)");
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasIndexError, setHasIndexError] = useState(false);
  const [hasPermissionError, setHasPermissionError] = useState(false);

  // Real-time Data States
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [pendingOrders, setPendingOrders] = useState<RecentOrder[]>([]);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    let isMounted = true;
    const unsubs: (() => void)[] = [];

    const createErrorHandler = (source: string) => (err: any) => {
      console.error(`Error in ${source}:`, err.code);
      if (err.code === 'failed-precondition') setHasIndexError(true);
      if (err.code === 'permission-denied') setHasPermissionError(true);
      if (source === 'Stats') setIsInitialLoading(false);
    };

    const timer = setTimeout(() => {
      if (!isMounted) return;

      unsubs.push(subscribeDashboardStats((data) => {
        if (isMounted) { setStats(data); setIsInitialLoading(false); }
      }, createErrorHandler('Stats')));

      unsubs.push(subscribeRevenueTrend((data) => isMounted && setRevenueData(data), createErrorHandler('Revenue')));
      unsubs.push(subscribeTopProducts((data) => isMounted && setTopProducts(data), createErrorHandler('TopProducts')));
      unsubs.push(subscribePendingOrders((data) => isMounted && setPendingOrders(data), createErrorHandler('Orders')));
      unsubs.push(subscribeMaintenanceTasks((data) => isMounted && setMaintenanceTasks(data), createErrorHandler('Maintenance')));
      unsubs.push(subscribeRecentLogs((data) => isMounted && setRecentLogs(data), createErrorHandler('Logs')));
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      unsubs.forEach(unsub => unsub());
    };
  }, [isAuthenticated, user]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
    onSuccess: (_, variables) => {
      toast.success(variables.status === 'confirmed' ? 'Đã duyệt đơn!' : 'Đã hủy đơn.');
    },
    onError: () => toast.error('Lỗi cập nhật trạng thái.')
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportDashboardToCSV();
      toast.success('Xuất file thành công!');
    } catch (error) {
      toast.error('Không thể xuất báo cáo.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-[10px]">Đang khởi tạo trung tâm điều hành...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 text-left animate-in fade-in duration-700">
      {/* System Alerts */}
      {(hasIndexError || hasPermissionError) && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-6 rounded-[2rem] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-sm">
              {hasIndexError ? <Database className="text-amber-500 w-6 h-6" /> : <Lock className="text-red-500 w-6 h-6" />}
            </div>
            <div>
              <p className="text-xs font-black uppercase text-amber-900 dark:text-amber-400 tracking-tight">
                {hasIndexError ? "Cần thiết lập chỉ mục (Index)" : "Lỗi quyền truy cập dữ liệu"}
              </p>
              <p className="text-[11px] text-amber-800 dark:text-amber-500 font-medium">
                {hasIndexError ? "Vui lòng kiểm tra Console để tạo Index Firestore." : "Bạn không có quyền xem một số dữ liệu hệ thống."}
              </p>
            </div>
          </div>
          <button onClick={() => window.location.reload()} className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors shadow-sm">
            <RefreshCw className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-[#0b1c30] dark:text-white uppercase tracking-tight">Dashboard Quản trị</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium italic">Giám sát vận hành Aquacare Cloud (Real-time)</p>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-6 py-3 bg-[#00459a] dark:bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all hover:scale-[1.02]"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Xuất báo cáo
        </button>
      </div>

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#1e293b] p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#00459a] dark:text-blue-400">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black ${stats.revenueGrowth >= 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-rose-600 bg-rose-50 dark:bg-rose-900/20'}`}>
                {stats.revenueGrowth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(stats.revenueGrowth).toFixed(1)}%
              </div>
            </div>
            <h3 className="text-2xl font-black text-[#0b1c30] dark:text-white">{formatCurrency(stats.totalRevenue)}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase mt-1 tracking-widest">TỔNG DOANH THU</p>
          </div>

          <div className="bg-white dark:bg-[#1e293b] p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black ${stats.orderGrowth >= 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-rose-600 bg-rose-50 dark:bg-rose-900/20'}`}>
                {stats.orderGrowth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(stats.orderGrowth).toFixed(1)}%
              </div>
            </div>
            <h3 className="text-3xl font-black text-[#0b1c30] dark:text-white">{stats.newOrders}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase mt-1 tracking-widest">ĐƠN HÀNG MỚI</p>
          </div>

          <div className="bg-white dark:bg-[#1e293b] p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-full">Tổng quát</span>
            </div>
            <h3 className="text-3xl font-black text-[#0b1c30] dark:text-white">{stats.totalCustomers}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase mt-1 tracking-widest">KHÁCH HÀNG</p>
          </div>
        </div>
      )}

      {/* Main Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white dark:bg-[#1e293b] p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
          <h2 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] mb-8">Xu hướng doanh thu (7 ngày)</h2>
          <div className="h-72 w-full">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <defs>
                    <linearGradient id="barGradientYellow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fde047" stopOpacity={1} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: 800 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: theme === 'dark' ? '#ffffff0a' : '#00000005' }}
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                    formatter={(v: number) => [formatCurrency(v), 'Doanh thu']}
                  />
                  {/* SỬ DỤNG MÀU VÀNG (YELLOW) CỰC SÁNG ĐỂ NỔI BẬT HOÀN TOÀN */}
                  <Bar dataKey="amount" radius={[10, 10, 0, 0]} barSize={45}>
                    {revenueData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill="url(#barGradientYellow)"
                        className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-300 dark:text-slate-700 font-black uppercase text-[10px]">Chưa có dữ liệu</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e293b] p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h2 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] mb-8">Sản phẩm bán chạy</h2>
          <div className="space-y-6">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4 group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-50 dark:bg-slate-900 text-slate-400'} group-hover:scale-110 transition-transform`}>#{i+1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-[#0b1c30] dark:text-white truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.sales} đơn</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-yellow-600">{p.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
        {/* Pending Orders */}
        <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em]">Đơn hàng chờ duyệt</h2>
            <span className="text-[10px] font-black text-amber-600 uppercase bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">{pendingOrders.length} Đang chờ</span>
          </div>
          <div className="p-4 space-y-2">
            {pendingOrders.map((order) => (
                <div key={order.id} className="p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors flex items-start justify-between gap-4 group">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 block mb-1 uppercase tracking-widest">#{order.id.slice(-6).toUpperCase()}</span>
                    <p className="text-sm font-black text-[#0b1c30] dark:text-white truncate group-hover:text-yellow-600 transition-colors">{order.customerName}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate mt-1">📍 {order.address}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                     <span className="text-sm font-black text-[#00459a] dark:text-yellow-500">{formatCurrency(order.total)}</span>
                     <div className="flex gap-2">
                        <button onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'cancelled' })} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"><XCircle className="w-5 h-5" /></button>
                        <button onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'confirmed' })} className="px-5 py-2 bg-[#00459a] dark:bg-yellow-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-yellow-700 transition-colors">Duyệt</button>
                     </div>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* Maintenance Tasks */}
        <div className="bg-white dark:bg-[#1e293b] p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
           <h2 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] mb-8">Lịch bảo trì khẩn cấp</h2>
           <div className="space-y-4">
              {maintenanceTasks.map((task) => (
                <div key={task.id} className="p-6 rounded-3xl border border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                  <div className="flex gap-4 items-center">
                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 bg-yellow-500 text-white shadow-lg shadow-yellow-500/20`}>
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className="text-sm font-black text-[#0b1c30] dark:text-white truncate uppercase tracking-tight">{task.type}</h4>
                       <p className="text-xs text-slate-400 font-bold italic mt-1">{task.client}</p>
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
