import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  ShoppingCart, DollarSign, Clock, Download, Loader2,
  Activity, Users, RefreshCw, Database, Lock, XCircle,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, Cell
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

  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Sử dụng ref để quản lý việc unmount chính xác
  const unsubsRef = useRef<(() => void)[]>([]);

  const cleanupListeners = () => {
    unsubsRef.current.forEach(unsub => unsub());
    unsubsRef.current = [];
  };

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    cleanupListeners(); // Đảm bảo dọn dẹp trước khi tạo mới

    const createErrorHandler = (source: string) => (err: any) => {
      console.warn(`Dashboard [${source}] Error:`, err.code);
      if (err.code === 'failed-precondition') setHasIndexError(true);
      if (err.code === 'permission-denied') setHasPermissionError(true);
      if (source === 'Stats') setIsInitialLoading(false);
    };

    try {
      unsubsRef.current.push(subscribeDashboardStats((data) => {
        setStats(data);
        setIsInitialLoading(false);
      }, createErrorHandler('Stats')));

      unsubsRef.current.push(subscribeRevenueTrend((data) => setRevenueData(data), createErrorHandler('Revenue')));
      unsubsRef.current.push(subscribeTopProducts((data) => setTopProducts(data), createErrorHandler('TopProducts')));
      unsubsRef.current.push(subscribePendingOrders((data) => setPendingOrders(data), createErrorHandler('Orders')));
      unsubsRef.current.push(subscribeMaintenanceTasks((data) => setMaintenanceTasks(data), createErrorHandler('Maintenance')));
      unsubsRef.current.push(subscribeRecentLogs((data) => setRecentLogs(data), createErrorHandler('Logs')));
    } catch (e) {
      console.error("Critical Dashboard Error:", e);
      setIsInitialLoading(false);
    }

    return () => cleanupListeners();
  }, [isAuthenticated, user?.uid]); // Chỉ chạy lại khi UID thay đổi

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-400 font-black uppercase text-[10px]">Đang khởi tạo Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500 text-left">
      {(hasIndexError || hasPermissionError) && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex items-center justify-between">
          <div className="flex items-center gap-4 text-left">
            <Database className="text-amber-500" />
            <div>
              <p className="text-xs font-black uppercase">Cần thiết lập Index hệ thống</p>
              <p className="text-[10px] text-amber-700">Vui lòng kiểm tra Console Firestore để tạo các Index cần thiết cho biểu đồ.</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-[#0b1c30] dark:text-white uppercase tracking-tight">Trung tâm Điều hành</h1>
          <p className="text-slate-500 text-sm">Giám sát hoạt động AquaCare thời gian thực</p>
        </div>
      </div>

      {/* KPI Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-50 dark:border-slate-700">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-3 bg-blue-50 rounded-2xl"><DollarSign className="text-blue-600" /></div>
              </div>
              <h3 className="text-2xl font-black">{formatCurrency(stats.totalRevenue)}</h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Tổng doanh thu</p>
           </div>
           <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-50 dark:border-slate-700">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-3 bg-amber-50 rounded-2xl"><ShoppingCart className="text-amber-600" /></div>
              </div>
              <h3 className="text-3xl font-black">{stats.newOrders}</h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Đơn hàng mới</p>
           </div>
           <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-50 dark:border-slate-700">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-3 bg-indigo-50 rounded-2xl"><Users className="text-indigo-600" /></div>
              </div>
              <h3 className="text-3xl font-black">{stats.totalCustomers}</h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Khách hàng</p>
           </div>
        </div>
      )}

      {/* Revenue Chart Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-50 dark:border-slate-700">
          <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-8">Doanh thu 7 ngày</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800}} />
                <YAxis hide />
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-50 dark:border-slate-700">
          <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-8">Top Sản phẩm</h2>
          <div className="space-y-6">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-[10px] font-black">#{i+1}</div>
                <div className="flex-1 min-w-0">
                   <p className="text-xs font-black truncate uppercase">{p.name}</p>
                   <p className="text-[9px] text-slate-400 font-bold">{p.sales} đơn hàng</p>
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
