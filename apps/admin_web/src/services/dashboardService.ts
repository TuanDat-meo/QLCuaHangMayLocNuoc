/**
 * Dashboard Service - AquaCare Admin Command Center
 * 100% Real-time statistics, Growth calculation, Analysis, and Export
 */

import {
  collection,
  query,
  where,
  limit,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { firestore } from '../app/firebase.config';
import { UserRole } from '../types/auth';

export interface DashboardStats {
  newOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  maintenanceCount: number;
  lowStockCount: number;
  avgOrderValue: number;
  revenueGrowth: number;
  orderGrowth: number;
}

export interface RevenueData {
  day: string;
  amount: number;
}

export interface TopProduct {
  id: string;
  name: string;
  price: number;
  sales: number;
  percentage: number;
}

export interface RecentOrder {
  id: string;
  customerName: string;
  productName: string;
  total: number;
  status: string;
  address: string;
}

export interface MaintenanceTask {
  id: string;
  client: string;
  type: string;
  time: string;
  priority: 'High' | 'Normal';
}

export interface ActivityLog {
  id: string;
  action: string;
  timeLabel: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

/**
 * Lắng nghe KPI Widgets thời gian thực & Tính toán tăng trưởng
 */
export const subscribeDashboardStats = (callback: (stats: DashboardStats) => void, onError?: (err: any) => void) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  let orders: any[] = [];
  let users: any[] = [];
  let prods: any[] = [];

  const compute = () => {
    let nOrders = 0, curRev = 0, prevRev = 0, curOrdersCount = 0, prevOrdersCount = 0, mCount = 0, totalRev = 0, completedCount = 0;

    orders.forEach(d => {
      const date = d.ngayTao?.toDate() || d.createdAt?.toDate();
      const amount = d.tongTien || d.final_price || 0;
      if (date) {
        if (date >= startOfToday) nOrders++;
        if (d.trangThai === 'completed') {
          totalRev += amount;
          completedCount++;
          if (date >= sevenDaysAgo) { curRev += amount; curOrdersCount++; }
          else if (date >= fourteenDaysAgo) { prevRev += amount; prevOrdersCount++; }
        }
        if (d.trangThai !== 'completed' && (d.loaiDonHang === 'maintenance' || d.isMaintenance)) mCount++;
      }
    });

    const totalCusts = users.filter(u => u.role === UserRole.CUSTOMER || u.role === 5).length;

    callback({
      newOrders: nOrders,
      totalRevenue: totalRev,
      totalCustomers: totalCusts,
      maintenanceCount: mCount,
      lowStockCount: prods.filter(p => p.soLuongTon <= (p.nguongCanhBao || 10)).length,
      avgOrderValue: completedCount > 0 ? totalRev / completedCount : 0,
      revenueGrowth: prevRev === 0 ? 100 : ((curRev - prevRev) / prevRev) * 100,
      orderGrowth: prevOrdersCount === 0 ? 100 : ((curOrdersCount - prevOrdersCount) / prevOrdersCount) * 100
    });
  };

  const unsubO = onSnapshot(collection(firestore, 'donHang'), (s) => { orders = s.docs.map(d => d.data()); compute(); }, onError);
  const unsubU = onSnapshot(collection(firestore, 'nguoiDung'), (s) => { users = s.docs.map(d => d.data()); compute(); }, onError);
  const unsubP = onSnapshot(collection(firestore, 'sanPham'), (s) => { prods = s.docs.map(d => d.data()); compute(); }, onError);

  return () => { unsubO(); unsubU(); unsubP(); };
};

/**
 * Lắng nghe Biểu đồ Doanh thu (Real-time)
 */
export const subscribeRevenueTrend = (callback: (data: RevenueData[]) => void, onError?: (err: any) => void) => {
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const sevenDaysAgo = new Date(new Date().setHours(0, 0, 0, 0) - 6 * 24 * 60 * 60 * 1000);

  return onSnapshot(query(collection(firestore, 'donHang'), where('trangThai', '==', 'completed'), where('ngayTao', '>=', Timestamp.fromDate(sevenDaysAgo))), (snap) => {
    const results = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      return { day: days[d.getDay()], amount: 0 };
    });
    snap.forEach(doc => {
      const date = doc.data().ngayTao?.toDate();
      if (date) {
        const entry = results.find(r => r.day === days[date.getDay()]);
        if (entry) entry.amount += (doc.data().tongTien || doc.data().final_price || 0);
      }
    });
    callback(results);
  }, onError);
};

/**
 * Lắng nghe Top Sản phẩm (Real-time)
 */
export const subscribeTopProducts = (callback: (data: TopProduct[]) => void, onError?: (err: any) => void) => {
  return onSnapshot(query(collection(firestore, 'donHang'), where('trangThai', '==', 'completed')), (snap) => {
    const sales: Record<string, { count: number; name: string; price: number }> = {};
    snap.forEach(doc => {
      const d = doc.data();
      const name = d.tenSanPham || 'Khác';
      if (!sales[name]) sales[name] = { count: 0, name, price: d.tongTien || d.final_price || 0 };
      sales[name].count++;
    });
    const sorted = Object.values(sales).sort((a, b) => b.count - a.count).slice(0, 5);
    const max = sorted.length > 0 ? sorted[0].count : 1;
    callback(sorted.map((p, i) => ({ id: `p-${i}`, name: p.name, price: p.price, sales: p.count, percentage: Math.round((p.count / max) * 100) })));
  }, onError);
};

/**
 * Các bộ lắng nghe danh sách Real-time khác
 */
export const subscribePendingOrders = (cb: (o: RecentOrder[]) => void, onError?: (err: any) => void) => onSnapshot(query(collection(firestore, 'donHang'), where('trangThai', '==', 'pending'), orderBy('ngayTao', 'desc'), limit(5)), (s) => cb(s.docs.map(d => ({ id: d.id, customerName: d.data().tenKhachHang || 'Khách', productName: d.data().tenSanPham || 'Máy lọc', total: d.data().tongTien || d.data().final_price || 0, status: d.data().trangThai, address: d.data().diaChiGiaoHang || 'N/A' }))), onError);
export const subscribeMaintenanceTasks = (cb: (t: MaintenanceTask[]) => void, onError?: (err: any) => void) => onSnapshot(query(collection(firestore, 'donHang'), where('loaiDonHang', '==', 'maintenance'), where('trangThai', '!=', 'completed'), limit(3)), (s) => cb(s.docs.map(d => ({ id: d.id.slice(-6).toUpperCase(), client: d.data().tenKhachHang || 'Khách', type: d.data().tenSanPham || 'Bảo trì', time: 'Hôm nay', priority: d.data().priority === 'high' ? 'High' : 'Normal' }))), onError);
export const subscribeRecentLogs = (cb: (l: ActivityLog[]) => void, onError?: (err: any) => void) => onSnapshot(query(collection(firestore, 'nhatKyHoatDong'), orderBy('ngayTao', 'desc'), limit(10)), (s) => cb(s.docs.map(d => { const date = d.data().ngayTao?.toDate(); const diff = date ? Math.floor((Date.now() - date.getTime()) / 60000) : 0; return { id: d.id, action: d.data().moTa || 'Hệ thống', timeLabel: diff < 1 ? 'Vừa xong' : `${diff}p trước`, type: (d.data().loai as any) || 'info' }; })), onError);

export const exportDashboardToCSV = async () => {
  const snap = await getDocs(query(collection(firestore, 'donHang'), orderBy('ngayTao', 'desc'), limit(100)));
  let csv = '\ufeffMa don,Khach hang,San pham,Tong tien,Trang thai,Ngay tao\n';
  snap.forEach(d => { const data = d.data(); csv += `${d.id.slice(-6)},${data.tenKhachHang},${data.tenSanPham},${data.tongTien},${data.trangThai},${data.ngayTao?.toDate()?.toLocaleDateString('vi-VN')}\n`; });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  link.download = `BaoCao_Dashboard_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
};

export const updateOrderStatus = async (id: string, status: string) => updateDoc(doc(firestore, 'donHang', id), { trangThai: status, ngayCapNhat: serverTimestamp() });
