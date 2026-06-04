import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  FileText, Download, Calendar, Filter, TrendingUp,
  DollarSign, ShoppingBag, PieChart, ChevronRight
} from 'lucide-react';
import {
  getMonthlyRevenueData,
  getYearlyRevenueData,
  exportRevenueReport,
  RevenueData
} from '../../services/reportService';
import toast from 'react-hot-toast';

const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(false);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    loadData();
  }, [reportType, selectedYear, selectedMonth]);

  const loadData = async () => {
    setLoading(true);
    try {
      let result: RevenueData[] = [];
      if (reportType === 'monthly') {
        result = await getMonthlyRevenueData(selectedYear, selectedMonth);
      } else {
        result = await getYearlyRevenueData(selectedYear);
      }
      setData(result);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      toast.loading("Đang chuẩn bị báo cáo...", { id: 'export' });
      await exportRevenueReport(selectedYear, reportType === 'monthly' ? selectedMonth : undefined);
      toast.success("Đã xuất báo cáo thành công", { id: 'export' });
    } catch (error) {
      toast.error("Lỗi khi xuất báo cáo", { id: 'export' });
    }
  };

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500 font-sans text-left">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Thống kê & Báo cáo</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Phân tích hiệu quả kinh doanh và xuất dữ liệu doanh thu</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95"
        >
          <Download size={20} />
          Xuất báo cáo (CSV)
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-[#1e293b] p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl">
            <button
              onClick={() => setReportType('monthly')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${reportType === 'monthly' ? 'bg-white dark:bg-slate-800 text-[#00459a] dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Báo cáo Tháng
            </button>
            <button
              onClick={() => setReportType('yearly')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${reportType === 'yearly' ? 'bg-white dark:bg-slate-800 text-[#00459a] dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Báo cáo Năm
            </button>
          </div>

          <div className="flex items-center gap-4 flex-1 min-w-[300px]">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 flex-1">
              <Calendar size={18} className="text-slate-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent border-none outline-none font-bold text-slate-700 dark:text-slate-300 w-full cursor-pointer"
              >
                {years.map(y => <option key={y} value={y}>Năm {y}</option>)}
              </select>
            </div>

            {reportType === 'monthly' && (
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 flex-1">
                <Filter size={18} className="text-slate-400" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-transparent border-none outline-none font-bold text-slate-700 dark:text-slate-300 w-full cursor-pointer"
                >
                  {months.map(m => <option key={m} value={m}>Tháng {m}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#00459a] to-blue-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-200 dark:shadow-none">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <DollarSign size={24} />
            </div>
            <TrendingUp size={20} className="text-blue-200" />
          </div>
          <p className="text-blue-100 font-bold uppercase tracking-widest text-[10px]">Tổng doanh thu</p>
          <h3 className="text-3xl font-black mt-2 tracking-tight">{formatCurrency(totalRevenue)}</h3>
        </div>

        <div className="bg-white dark:bg-[#1e293b] p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl text-slate-600 dark:text-slate-400">
              <ShoppingBag size={24} />
            </div>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Tổng đơn hàng</p>
          <h3 className="text-3xl font-black mt-2 text-slate-900 dark:text-white tracking-tight">{totalOrders} <span className="text-lg text-slate-400 font-medium lowercase">Đơn</span></h3>
        </div>

        <div className="bg-white dark:bg-[#1e293b] p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl text-slate-600 dark:text-slate-400">
              <PieChart size={24} />
            </div>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Trung bình / Đơn</p>
          <h3 className="text-3xl font-black mt-2 text-slate-900 dark:text-white tracking-tight">
            {totalOrders > 0 ? formatCurrency(totalRevenue / totalOrders) : '0 ₫'}
          </h3>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="bg-white dark:bg-[#1e293b] p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Tăng trưởng doanh thu</h2>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
             <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
             Doanh thu (VND)
          </div>
        </div>

        <div className="h-[400px] w-full">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Đang tính toán dữ liệu...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 800 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 800 }}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(1)}Tr`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl border border-slate-800 text-left">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{reportType === 'monthly' ? `Ngày ${label}` : `Năm ${label}`}</p>
                          <p className="text-lg font-black">{formatCurrency(payload[0].value as number)}</p>
                          <p className="text-[10px] font-bold text-blue-400 mt-1 uppercase">{payload[1]?.value || 0} đơn hàng thành công</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="transparent"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Details Table */}
      <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Chi tiết dữ liệu</h2>
          <span className="text-[10px] font-black text-slate-400 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-1.5 rounded-full uppercase tracking-widest">
            {reportType === 'monthly' ? `Tháng ${selectedMonth}/${selectedYear}` : `Năm ${selectedYear}`}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 dark:bg-slate-900/80">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Số đơn hàng</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Doanh thu</th>
                <th className="px-8 py-5 text-right w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.filter(item => item.orders > 0 || item.revenue > 0).map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-8 py-4">
                    <span className="font-black text-slate-700 dark:text-slate-300 uppercase text-xs">{reportType === 'monthly' ? `Ngày ${item.label}` : `Tháng ${item.label}`}</span>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-4 py-1 bg-blue-50 dark:bg-blue-900/30 text-[#00459a] dark:text-blue-400 rounded-full text-[11px] font-black">
                      {item.orders}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <span className="font-black text-slate-900 dark:text-white">{formatCurrency(item.revenue)}</span>
                  </td>
                  <td className="px-8 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="inline-block text-slate-300" size={18} />
                  </td>
                </tr>
              ))}
              {data.every(item => item.orders === 0) && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">
                    Không có dữ liệu kinh doanh trong giai đoạn này
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
