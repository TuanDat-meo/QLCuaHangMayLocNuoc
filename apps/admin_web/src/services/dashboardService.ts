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
 * Hàm ép kiểu ngày tháng an toàn tuyệt đối 100%
 * Giúp tránh lỗi .toDate() is not a function làm trắng màn hình
 */
export const safeToDate = (value: any): Date => {
  if (!value) return new Date();
  try {
    if (typeof value.toDate === 'function') return value.toDate();
    if (value instanceof Date) return value;
    if (value instanceof Timestamp) return value.toDate();

    if (typeof value === 'object') {
      if (value.seconds !== undefined) return new Date(value.seconds * 1000);
      if ('_methodName' in value || 'serverTimestamp' in value) return new Date();
    }

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
        const amount = Number(d.tongTien) || 0;

        if (date >= startOfToday) nOrders++;
        if (d.trangThai === 'completed') {
          totalRev += amount;
          completedCount++;
          if (date >= sevenDaysAgo) { curRev += amount; curOrdersCount++; }
          else if (date >= fourteenDaysAgo) { prevRev += amount; prevOrdersCount++; }
        }
        if (d.trangThai !== 'completed' && (d.loaiDonHang === 'maintenance' || d.isMaintenance)) mCount++;
      });

      callback({
        newOrders: nOrders,
        totalRevenue: totalRev,
        totalCustomers: users.filter(u => u.role === UserRole.CUSTOMER || u.role === 5).length,
        maintenanceCount: mCount,
        lowStockCount: prods.filter(p => (Number(p.tonKho || p.soLuongTon || 0)) <= (p.nguongCanhBao || 10)).length,
        avgOrderValue: completedCount > 0 ? totalRev / completedCount : 0,
        revenueGrowth: prevRev === 0 ? 100 : ((curRev - prevRev) / prevRev) * 100,
        orderGrowth: prevOrdersCount === 0 ? 100 : ((curOrdersCount - prevOrdersCount) / prevOrdersCount) * 100
      });
    } catch (err) {
      console.error("Dashboard Compute Failed (Recovered):", err);
    }
  };

  const unsubO = onSnapshot(collection(firestore, 'donHang'), (s) => { orders = s.docs.map(d => d.data()); compute(); }, (err) => { console.warn("Orders error:", err.code); if(onError) onError(err); });
  const unsubU = onSnapshot(collection(firestore, 'nguoiDung'), (s) => { users = s.docs.map(d => d.data()); compute(); }, (err) => { console.warn("Users error:", err.code); if(onError) onError(err); });
  const unsubP = onSnapshot(collection(firestore, 'sanPham'), (s) => { prods = s.docs.map(d => d.data()); compute(); }, (err) => { console.warn("Products error:", err.code); if(onError) onError(err); });

  return () => { unsubO(); unsubU(); unsubP(); };
};

export type RevenueRange = 'week' | 'month' | 'year';

export const subscribeRevenueTrend = (range: RevenueRange, callback: (data: any[]) => void, onError?: (err: any) => void) => {
  const now = new Date();
  let startDate: Date;
  let labelFormatter: (d: Date) => string;
  let length: number;

  if (range === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    length = now.getDate();
    labelFormatter = (d) => `Ngày ${d.getDate()}`;
  } else if (range === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1);
    length = 12;
    labelFormatter = (d) => `Tháng ${d.getMonth() + 1}`;
  } else {
    // default week
    startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    startDate.setHours(0, 0, 0, 0);
    length = 7;
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    labelFormatter = (d) => days[d.getDay()];
  }

  return onSnapshot(
    query(
      collection(firestore, 'donHang'),
      where('trangThai', '==', 'completed'),
      where('ngayTao', '>=', Timestamp.fromDate(startDate))
    ),
    (snap) => {
      let results: any[] = [];

      if (range === 'year') {
        results = Array.from({ length: 12 }).map((_, i) => ({
          label: `T${i + 1}`,
          amount: 0,
          sortKey: i
        }));
        snap.forEach(doc => {
          const date = safeToDate(doc.data().ngayTao);
          if (date.getFullYear() === now.getFullYear()) {
            results[date.getMonth()].amount += (Number(doc.data().tongTien) || 0);
          }
        });
      } else if (range === 'month') {
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        results = Array.from({ length: daysInMonth }).map((_, i) => ({
          label: `${i + 1}`,
          amount: 0,
          sortKey: i
        }));
        snap.forEach(doc => {
          const date = safeToDate(doc.data().ngayTao);
          if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
            results[date.getDate() - 1].amount += (Number(doc.data().tongTien) || 0);
          }
        });
      } else {
        // week
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        results = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
          return { label: days[d.getDay()], amount: 0, sortKey: i };
        });
        snap.forEach(doc => {
          const date = safeToDate(doc.data().ngayTao);
          const dayLabel = days[date.getDay()];
          const entry = results.find(r => r.label === dayLabel);
          if (entry) entry.amount += (Number(doc.data().tongTien) || 0);
        });
      }

      callback(results);
    },
    (err) => {
      console.warn("Revenue trend error:", err.code);
      if (onError) onError(err);
    }
  );
};

export const subscribeRecentLogs = (cb: (l: any[]) => void, onError?: (err: any) => void) =>
  onSnapshot(query(collection(firestore, 'nhatKyHoatDong'), orderBy('ngayTao', 'desc'), limit(10)), (s) =>
    cb(s.docs.map(d => {
      const date = safeToDate(d.data().ngayTao);
      const diff = Math.floor((Date.now() - date.getTime()) / 60000);
      return { id: d.id, action: d.data().moTa || 'Hệ thống', timeLabel: diff < 1 ? 'Vừa xong' : `${diff}p trước`, type: d.data().loai || 'info' };
    })), (err) => {
      console.warn("Logs error:", err.code);
      if(onError) onError(err);
    });

export const exportDashboardToCSV = async () => {
  const snap = await getDocs(query(collection(firestore, 'donHang'), orderBy('ngayTao', 'desc'), limit(100)));
  let csv = '\ufeffMa don,Khach hang,San pham,Tong tien,Trang thai,Ngay tao\n';
  snap.forEach(d => {
    const data = d.data();
    csv += `${d.id.slice(-6)},${data.tenKhachHang},${data.tenSanPham},${data.tongTien},${data.trangThai},${safeToDate(data.ngayTao).toLocaleDateString('vi-VN')}\n`;
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  link.download = `BaoCao_Dashboard_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
};

export const updateOrderStatus = async (id: string, status: string) => updateDoc(doc(firestore, 'donHang', id), { trangThai: status, updatedAt: serverTimestamp() });
export const subscribePendingOrders = (cb: (o: any[]) => void, onError?: (err: any) => void) => onSnapshot(query(collection(firestore, 'donHang'), where('trangThai', '==', 'pending'), orderBy('ngayTao', 'desc'), limit(5)), (s) => cb(s.docs.map(d => ({ id: d.id, customerName: d.data().tenKhachHang, productName: d.data().tenSanPham, total: d.data().tongTien, status: d.data().trangThai, address: d.data().diaChiGiaoHang }))), onError);
export const subscribeTopProducts = (cb: (p: any[]) => void, onError?: (err: any) => void) => onSnapshot(query(collection(firestore, 'donHang'), where('trangThai', '==', 'completed')), (snap) => {
    const sales: Record<string, any> = {};
    snap.forEach(doc => {
      const d = doc.data();
      const name = d.tenSanPham || 'Khác';
      if (!sales[name]) sales[name] = { count: 0, name, price: d.tongTien || 0 };
      sales[name].count++;
    });
    const sorted = Object.values(sales).sort((a, b) => b.count - a.count).slice(0, 5);
    cb(sorted.map((p, i) => ({ id: `p-${i}`, name: p.name, price: p.price, sales: p.count, percentage: 100 })));
  }, onError);
export const subscribeMaintenanceTasks = (cb: (t: any[]) => void, onError?: (err: any) => void) => onSnapshot(query(collection(firestore, 'donHang'), where('loaiDonHang', '==', 'maintenance'), where('trangThai', '!=', 'completed'), limit(3)), (s) => cb(s.docs.map(d => ({ id: d.id, client: d.data().tenKhachHang, type: d.data().tenSanPham, time: 'Hôm nay' }))), onError);
