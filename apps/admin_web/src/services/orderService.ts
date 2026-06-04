import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  orderBy,
  where,
  addDoc,
  deleteDoc,
  serverTimestamp,
  QueryConstraint,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { getDb } from './authService';
import { Order, OrderStatus, OrderTechnician } from '../types/order';

const COLLECTION_NAME = 'donHang';

/**
 * Hàm ép kiểu ngày tháng an toàn tuyệt đối 100%
 */
export const safeToDate = (value: any): Date => {
  if (!value) return new Date();
  if (typeof value.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  if (value && typeof value === 'object' && (value.seconds || value._methodName)) {
     return new Date((value.seconds || Date.now()/1000) * 1000);
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date() : d;
};

/**
 * Thêm đơn hàng mới
 */
export const addOrder = async (orderData: any) => {
  const db = getDb();
  if (!db) throw new Error("Kết nối Firestore thất bại");

  // Ép kiểu dữ liệu chuẩn để Firestore không từ chối
  const docData = {
    tenKhachHang: String(orderData.customerName || 'Khách hàng'),
    phoneNumber: String(orderData.phoneNumber || ''),
    diaChiGiaoHang: String(orderData.address || ''),
    street: String(orderData.street || ''),
    provinceCode: Number(orderData.provinceCode) || null,
    districtCode: Number(orderData.districtCode) || null,
    wardCode: Number(orderData.wardCode) || null,
    latitude: orderData.latitude ? Number(orderData.latitude) : null,
    longitude: orderData.longitude ? Number(orderData.longitude) : null,
    tenSanPham: String(orderData.productName || ''),
    items: (orderData.items || []).map((item: any) => ({
      id: String(item.id || ''),
      name: String(item.name || 'Sản phẩm'),
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      imageUrl: item.imageUrl || null
    })),
    technicians: orderData.technicians || [],
    tongTien: Number(orderData.totalAmount) || 0,
    trangThai: String(orderData.status || 'pending'),
    loaiDonHang: String(orderData.orderType || 'installation'),
    note: String(orderData.note || ''),
    createdBy: orderData.createdBy || null,
    createdByName: orderData.createdByName || null,
    ngayTao: serverTimestamp(),
    updatedAt: serverTimestamp(),
    scheduledDate: orderData.scheduledDate ? Timestamp.fromDate(new Date(orderData.scheduledDate)) : null,
    ngayBaoTriTiepTheo: Timestamp.fromDate(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000))
  };

  console.log("DEBUG: Gửi đơn hàng lên Firestore", docData);
  return addDoc(collection(db, COLLECTION_NAME), docData);
};

export const subscribeToOrders = (callback: (orders: Order[]) => void, statusFilter?: string) => {
  const db = getDb();
  const constraints: QueryConstraint[] = [orderBy('ngayTao', 'desc')];
  if (statusFilter && statusFilter !== 'Tất cả') {
    const statusMap: Record<string, string> = {
      'Chờ duyệt': 'pending', 'Đã phân công': 'assigned', 'Đang xử lý': 'processing',
      'Hoàn tất': 'completed', 'Sự cố': 'incident', 'Đã tất toán': 'paid', 'Đã hủy': 'cancelled'
    };
    if (statusMap[statusFilter]) constraints.push(where('trangThai', '==', statusMap[statusFilter]));
  }
  const q = query(collection(db, COLLECTION_NAME), ...constraints);
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
        scheduledDate: data.scheduledDate
      } as any;
    }).filter(o => o.status !== 'deleted');
    callback(orders);
  });
};

export const updateOrder = async (orderId: string, orderData: Partial<Order>) => {
  const db = getDb();
  const updateData: any = { ...orderData, updatedAt: serverTimestamp() };

  // Xử lý các trường mapping ngược nếu cần
  if (orderData.customerName) updateData.tenKhachHang = orderData.customerName;
  if (orderData.productName) updateData.tenSanPham = orderData.productName;
  if (orderData.totalAmount !== undefined) updateData.tongTien = orderData.totalAmount;
  if (orderData.status) updateData.trangThai = orderData.status;
  if (orderData.orderType) updateData.loaiDonHang = orderData.orderType;
  if (orderData.address) updateData.diaChiGiaoHang = orderData.address;
  if (orderData.scheduledDate) {
    updateData.scheduledDate = orderData.scheduledDate instanceof Date
      ? Timestamp.fromDate(orderData.scheduledDate)
      : Timestamp.fromDate(new Date(orderData.scheduledDate));
  }

  return updateDoc(doc(db, COLLECTION_NAME, orderId), updateData);
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  return updateDoc(doc(getDb(), COLLECTION_NAME, orderId), { trangThai: status, updatedAt: serverTimestamp() });
};

export const assignTechnicians = async (orderId: string, technicians: OrderTechnician[]) => {
  return updateDoc(doc(getDb(), COLLECTION_NAME, orderId), {
    technicians,
    trangThai: 'assigned', // Tự động chuyển trạng thái khi phân công
    updatedAt: serverTimestamp()
  });
};

export const deleteOrder = async (orderId: string, status: OrderStatus) => {
  if (status === 'pending') return deleteDoc(doc(getDb(), COLLECTION_NAME, orderId));
  return updateDoc(doc(getDb(), COLLECTION_NAME, orderId), { trangThai: 'deleted', updatedAt: serverTimestamp() });
};
