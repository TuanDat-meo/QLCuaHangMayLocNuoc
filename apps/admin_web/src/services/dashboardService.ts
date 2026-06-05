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

/**
 * Hàm ép kiểu ngày tháng an toàn tuyệt đối
 */
export const safeToDate = (value: any): Date => {
  if (!value) return new Date();
  try {
    if (typeof value.toDate === 'function') return value.toDate();
    if (value instanceof Date) return value;
    if (value instanceof Timestamp) return value.toDate();
    if (typeof value === 'object' && value.seconds !== undefined) return new Date(value.seconds * 1000);
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  } catch (e) {
    return new Date();
  }
};

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

/**
 * Lấy thống kê tổng quát Dashboard (Sử dụng trường tiếng Việt đồng bộ)
 */
export const subscribeDashboardStats = (callback: (stats: DashboardStats) => void, onError?: (err: any) => void) => {
  let orders: any[] = [];
  let users: any[] = [];
  let prods: any[] = [];

  const compute = () => {
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      let nOrders = 0, curRev = 0, prevRev = 0, curOrdersCount = 0, prevOrdersCount = 0, mCount = 0, totalRev = 0, completedCount = 0;

      orders.forEach(d => {
        const date = safeToDate(d.ngayTao || d.createdAt);
        const amount = Number(d.tongTien || d.totalAmount) || 0;
        const status = d.trangThai || d.status;

        if (date >= startOfToday) nOrders++;

        if (status === 'completed' || status === 'paid') {
          totalRev += amount;
          completedCount++;
          if (date >= sevenDaysAgo) { curRev += amount; curOrdersCount++; }
          else if (date >= fourteenDaysAgo) { prevRev += amount; prevOrdersCount++; }
        }

        if (status !== 'completed' && status !== 'paid' && (d.loaiDonHang === 'maintenance' || d.orderType === 'maintenance')) mCount++;
      });

      callback({
        newOrders: nOrders,
        totalRevenue: totalRev,
        totalCustomers: users.filter(u => u.role === UserRole.CUSTOMER || u.role === 5).length,
        maintenanceCount: mCount,
        lowStockCount: prods.filter(p => (Number(p.tonKho || 0)) <= (p.nguongCanhBao || 10)).length,
        avgOrderValue: completedCount > 0 ? totalRev / completedCount : 0,
        revenueGrowth: prevRev === 0 ? 100 : ((curRev - prevRev) / prevRev) * 100,
        orderGrowth: prevOrdersCount === 0 ? 100 : ((curOrdersCount - prevOrdersCount) / prevOrdersCount) * 100
      });
    } catch (err) {
      console.error("Dashboard Compute Failed:", err);
    }
  };

  const unsubO = onSnapshot(collection(firestore, 'donHang'), (s) => { orders = s.docs.map(d => d.data()); compute(); }, (err) => { if(onError) onError(err); });
  const unsubU = onSnapshot(collection(firestore, 'nguoiDung'), (s) => { users = s.docs.map(d => d.data()); compute(); }, (err) => { if(onError) onError(err); });
  const unsubP = onSnapshot(collection(firestore, 'sanPham'), (s) => { prods = s.docs.map(d => d.data()); compute(); }, (err) => { if(onError) onError(err); });

  return () => { unsubO(); unsubU(); unsubP(); };
};

/**
 * Xuất báo cáo CSV chuẩn hóa
 */
export const exportDashboardToCSV = async () => {
  const snap = await getDocs(query(collection(firestore, 'donHang'), orderBy('ngayTao', 'desc'), limit(500)));
  let csv = '\ufeffMa don,Khach hang,San pham,Tong tien,Trang thai,Ngay tao\n';
  snap.forEach(d => {
    const data = d.data();
    const id = d.id.slice(-6).toUpperCase();
    const customer = data.tenKhachHang || 'N/A';
    const product = (data.tenSanPham || 'N/A').replace(/,/g, ';');
    const total = data.tongTien || 0;
    const status = data.trangThai || 'pending';
    const date = safeToDate(data.ngayTao).toLocaleDateString('vi-VN');

    csv += `${id},${customer},${product},${total},${status},${date}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `AquaCare_Full_Report_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
};

export const updateOrderStatus = async (id: string, status: string) => updateDoc(doc(firestore, 'donHang', id), { trangThai: status, updatedAt: serverTimestamp() });

export const subscribePendingOrders = (cb: (o: any[]) => void, onError?: (err: any) => void) =>
  onSnapshot(query(collection(firestore, 'donHang'), where('trangThai', '==', 'pending'), orderBy('ngayTao', 'desc'), limit(5)),
  (s) => cb(s.docs.map(d => {
    const data = d.data();
    return {
        id: d.id,
        customerName: data.tenKhachHang,
        productName: data.tenSanPham,
        total: data.tongTien,
        status: data.trangThai,
        address: data.diaChiGiaoHang
    };
  })), onError);

export const subscribeMaintenanceTasks = (cb: (t: any[]) => void, onError?: (err: any) => void) =>
  onSnapshot(query(collection(firestore, 'donHang'), where('loaiDonHang', '==', 'maintenance'), where('trangThai', 'in', ['approved', 'pending']), limit(3)),
  (s) => cb(s.docs.map(d => {
    const data = d.data();
    return {
        id: d.id,
        client: data.tenKhachHang,
        type: data.tenSanPham || 'Bảo trì định kỳ',
        time: data.ngayTao ? safeToDate(data.ngayTao).toLocaleDateString('vi-VN') : 'Sớm nhất'
    };
  })), onError);

export type RevenueRange = 'week' | 'month' | 'year';

export const subscribeRevenueTrend = (range: RevenueRange, callback: (data: any[]) => void, onError?: (err: any) => void) => {
  const now = new Date();
  let startDate: Date;

  if (range === 'month') startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  else if (range === 'year') startDate = new Date(now.getFullYear(), 0, 1);
  else startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
  startDate.setHours(0, 0, 0, 0);

  const q = query(
    collection(firestore, 'donHang'),
    where('ngayTao', '>=', Timestamp.fromDate(startDate))
  );

  return onSnapshot(q, (snap) => {
    let results: any[] = [];
    const revenueOrders = snap.docs.filter(d => d.data().trangThai === 'completed' || d.data().trangThai === 'paid');

    if (range === 'year') {
      results = Array.from({ length: 12 }).map((_, i) => ({ label: `T${i + 1}`, amount: 0, sortKey: i }));
      revenueOrders.forEach(doc => {
        const date = safeToDate(doc.data().ngayTao);
        if (date.getFullYear() === now.getFullYear()) results[date.getMonth()].amount += (Number(doc.data().tongTien) || 0);
      });
    } else if (range === 'month') {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      results = Array.from({ length: daysInMonth }).map((_, i) => ({ label: `${i + 1}`, amount: 0, sortKey: i }));
      revenueOrders.forEach(doc => {
        const date = safeToDate(doc.data().ngayTao);
        if (date.getMonth() === now.getMonth()) results[date.getDate() - 1].amount += (Number(doc.data().tongTien) || 0);
      });
    } else {
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      results = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        return { label: days[d.getDay()], amount: 0, sortKey: i };
      });
      revenueOrders.forEach(doc => {
        const date = safeToDate(doc.data().ngayTao);
        const dayLabel = days[date.getDay()];
        const entry = results.find(r => r.label === dayLabel);
        if (entry) entry.amount += (Number(doc.data().tongTien) || 0);
      });
    }
    callback(results);
  }, onError);
};

export const subscribeTopProducts = (cb: (p: any[]) => void, onError?: (err: any) => void) =>
  onSnapshot(collection(firestore, 'donHang'), (snap) => {
    const sales: Record<string, any> = {};
    snap.forEach(doc => {
      const d = doc.data();
      if (d.trangThai === 'completed' || d.trangThai === 'paid') {
        const name = d.tenSanPham || 'Khác';
        if (!sales[name]) sales[name] = { count: 0, name, price: d.tongTien || 0 };
        sales[name].count += (d.items?.length || 1);
      }
    });
    const sorted = Object.values(sales).sort((a, b) => b.count - a.count).slice(0, 5);
    cb(sorted.map((p, i) => ({ id: `p-${i}`, name: p.name, price: p.price, sales: p.count })));
  }, onError);

export const subscribeRecentLogs = (cb: (l: any[]) => void, onError?: (err: any) => void) =>
  onSnapshot(query(collection(firestore, 'nhatKyHoatDong'), orderBy('ngayThucHien', 'desc'), limit(10)), (s) => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))), onError);
