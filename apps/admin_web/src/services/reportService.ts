import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { firestore } from '../app/firebase.config';
import { safeToDate } from './dashboardService';

export interface RevenueData {
  label: string;
  revenue: number;
  orders: number;
}

export const getMonthlyRevenueData = async (year: number, month: number): Promise<RevenueData[]> => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const q = query(
    collection(firestore, 'donHang'),
    where('trangThai', '==', 'completed'),
    where('ngayTao', '>=', Timestamp.fromDate(startDate)),
    where('ngayTao', '<=', Timestamp.fromDate(endDate)),
    orderBy('ngayTao', 'asc')
  );

  const querySnapshot = await getDocs(q);
  const daysInMonth = endDate.getDate();
  const results: RevenueData[] = Array.from({ length: daysInMonth }, (_, i) => ({
    label: (i + 1).toString(),
    revenue: 0,
    orders: 0
  }));

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const date = safeToDate(data.ngayTao);
    const day = date.getDate();
    if (day <= daysInMonth) {
      results[day - 1].revenue += Number(data.tongTien || 0);
      results[day - 1].orders += 1;
    }
  });

  return results;
};

export const getYearlyRevenueData = async (year: number): Promise<RevenueData[]> => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  const q = query(
    collection(firestore, 'donHang'),
    where('trangThai', '==', 'completed'),
    where('ngayTao', '>=', Timestamp.fromDate(startDate)),
    where('ngayTao', '<=', Timestamp.fromDate(endDate)),
    orderBy('ngayTao', 'asc')
  );

  const querySnapshot = await getDocs(q);
  const results: RevenueData[] = Array.from({ length: 12 }, (_, i) => ({
    label: `Tháng ${i + 1}`,
    revenue: 0,
    orders: 0
  }));

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const date = safeToDate(data.ngayTao);
    const month = date.getMonth();
    results[month].revenue += Number(data.tongTien || 0);
    results[month].orders += 1;
  });

  return results;
};

export const exportRevenueReport = async (year: number, month?: number) => {
  let startDate: Date;
  let endDate: Date;
  let fileName: string;

  if (month) {
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0, 23, 59, 59);
    fileName = `BaoCao_DoanhThu_Thang${month}_${year}.csv`;
  } else {
    startDate = new Date(year, 0, 1);
    endDate = new Date(year, 11, 31, 23, 59, 59);
    fileName = `BaoCao_DoanhThu_Nam${year}.csv`;
  }

  const q = query(
    collection(firestore, 'donHang'),
    where('trangThai', '==', 'completed'),
    where('ngayTao', '>=', Timestamp.fromDate(startDate)),
    where('ngayTao', '<=', Timestamp.fromDate(endDate)),
    orderBy('ngayTao', 'asc')
  );

  const querySnapshot = await getDocs(q);

  let csv = '\ufeffMa don,Khach hang,San pham,Tong tien,Ngay hoan tat\n';
  let totalRevenue = 0;
  let totalOrders = 0;

  querySnapshot.forEach((d) => {
    const data = d.data();
    const amount = Number(data.tongTien || 0);
    csv += `${d.id.slice(-6)},${data.tenKhachHang || 'N/A'},${data.tenSanPham || 'N/A'},${amount},${safeToDate(data.ngayTao).toLocaleDateString('vi-VN')}\n`;
    totalRevenue += amount;
    totalOrders += 1;
  });

  csv += `\nTong cong,,${totalOrders} don hang,${totalRevenue},\n`;

  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  link.download = fileName;
  link.click();
};
