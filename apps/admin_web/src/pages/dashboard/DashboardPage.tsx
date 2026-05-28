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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-[10px]">Đang khởi tạo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 text-left animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-[#0b1c30] dark:text-white uppercase tracking-tight">Dashboard Quản trị</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium italic">Giám sát vận hành Aquacare Cloud (Real-time)</p>
        </div>
      </div>

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#1e293b] p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#00459a] dark:text-blue-400">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black ${stats.revenueGrowth >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
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
            </div>
            <h3 className="text-3xl font-black text-[#0b1c30] dark:text-white">{stats.newOrders}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase mt-1 tracking-widest">ĐƠN HÀNG MỚI</p>
          </div>
          <div className="bg-white dark:bg-[#1e293b] p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Users className="w-6 h-6" />
              </div>
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
                    <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ccff00" stopOpacity={1} />
                      <stop offset="100%" stopColor="#00ff99" stopOpacity={1} />
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
                    itemStyle={{ color: '#ccff00', fontWeight: 'bold' }}
                    formatter={(v: number) => [formatCurrency(v), 'Doanh thu']}
                  />
                  {/* SỬ DỤNG MÀU NEON CỰC MẠNH ĐỂ NỔI BẬT HOÀN TOÀN */}
                  <Bar dataKey="amount" radius={[10, 10, 0, 0]} barSize={45}>
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="url(#neonGradient)" className="transition-all duration-300 hover:opacity-80 cursor-pointer" />
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
              <div key={p.id} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-lime-100 text-lime-600' : 'bg-slate-50 dark:bg-slate-900 text-slate-400'}`}>#{i+1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-[#0b1c30] dark:text-white truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.sales} đơn</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-lime-600">{p.percentage}%</p>
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
