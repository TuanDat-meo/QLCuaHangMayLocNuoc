import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { getDb } from './authService';
import { Order } from '../types/order';

const ORDERS_COLLECTION = 'donHang';

/**
 * Theo dõi danh sách đơn hàng của một kỹ thuật viên (Real-time)
 */
export const subscribeToTechnicianOrders = (technicianId: string, callback: (orders: Order[]) => void) => {
  const db = getDb();
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where('technicianId', '==', technicianId),
    orderBy('ngayTao', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        customerName: data.tenKhachHang,
        productName: data.tenSanPham,
        totalAmount: data.tongTien,
        status: data.trangThai,
        orderType: data.loaiDonHang,
        address: data.diaChiGiaoHang,
        createdAt: data.ngayTao,
      } as unknown as Order;
    });
    callback(orders);
  });
};

/**
 * Theo dõi thống kê hiệu suất của kỹ thuật viên (Real-time)
 */
export const subscribeToTechnicianStats = (technicianId: string, callback: (stats: any) => void) => {
  const db = getDb();
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where('technicianId', '==', technicianId)
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(d => d.data());

    const stats = {
      total: orders.length,
      completed: orders.filter(o => ['completed', 'hoan_thanh', 'HOAN_THANH'].includes(o.trangThai)).length,
      processing: orders.filter(o => o.trangThai === 'processing' || o.trangThai === 'assigned').length,
      cancelled: orders.filter(o => o.trangThai === 'cancelled').length
    };
    callback(stats);
  });
};
