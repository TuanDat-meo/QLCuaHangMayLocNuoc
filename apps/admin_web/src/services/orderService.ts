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
import { Order, OrderStatus } from '../types/order';

const COLLECTION_NAME = 'donHang';

/**
 * Lấy danh sách đơn hàng theo thời gian thực
 */
export const subscribeToOrders = (
  callback: (orders: Order[]) => void,
  statusFilter?: string
) => {
  const db = getDb();
  const constraints: QueryConstraint[] = [orderBy('ngayTao', 'desc')];

  if (statusFilter && statusFilter !== 'Tất cả') {
    const statusMap: Record<string, string> = {
      'Chờ duyệt': 'pending',
      'Đã phân công': 'assigned',
      'Đang xử lý': 'processing',
      'Hoàn tất': 'completed',
      'Đã hủy': 'cancelled'
    };
    if (statusMap[statusFilter]) {
      constraints.push(where('trangThai', '==', statusMap[statusFilter]));
    }
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
        street: data.street,
        provinceCode: data.provinceCode,
        districtCode: data.districtCode,
        wardCode: data.wardCode,
        latitude: data.latitude,
        longitude: data.longitude,
        createdAt: data.ngayTao,
        nextMaintenanceDate: data.ngayBaoTriTiepTheo,
      } as unknown as Order;
    });
    callback(orders);
  });
};

/**
 * Thêm đơn hàng mới
 */
export const addOrder = async (orderData: Omit<Order, 'id'>) => {
  const db = getDb();
  return addDoc(collection(db, COLLECTION_NAME), {
    tenKhachHang: orderData.customerName,
    phoneNumber: orderData.phoneNumber,
    diaChiGiaoHang: orderData.address,
    street: orderData.street || '',
    provinceCode: orderData.provinceCode || null,
    districtCode: orderData.districtCode || null,
    wardCode: orderData.wardCode || null,
    latitude: orderData.latitude || null,
    longitude: orderData.longitude || null,
    tenSanPham: orderData.productName,
    tongTien: orderData.totalAmount,
    trangThai: orderData.status || 'pending',
    loaiDonHang: orderData.orderType,
    ngayTao: serverTimestamp(),
    updatedAt: serverTimestamp(),
    note: orderData.note || '',
    ngayBaoTriTiepTheo: Timestamp.fromDate(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000))
  });
};

/**
 * Cập nhật đơn hàng
 */
export const updateOrder = async (orderId: string, orderData: Partial<Order>) => {
  const db = getDb();
  const orderRef = doc(db, COLLECTION_NAME, orderId);
  const updatePayload: any = {
    updatedAt: serverTimestamp()
  };

  if (orderData.customerName) updatePayload.tenKhachHang = orderData.customerName;
  if (orderData.phoneNumber) updatePayload.phoneNumber = orderData.phoneNumber;
  if (orderData.address) updatePayload.diaChiGiaoHang = orderData.address;
  if (orderData.street !== undefined) updatePayload.street = orderData.street;
  if (orderData.provinceCode !== undefined) updatePayload.provinceCode = orderData.provinceCode;
  if (orderData.districtCode !== undefined) updatePayload.districtCode = orderData.districtCode;
  if (orderData.wardCode !== undefined) updatePayload.wardCode = orderData.wardCode;
  if (orderData.latitude !== undefined) updatePayload.latitude = orderData.latitude;
  if (orderData.longitude !== undefined) updatePayload.longitude = orderData.longitude;
  if (orderData.productName) updatePayload.tenSanPham = orderData.productName;
  if (orderData.totalAmount !== undefined) updatePayload.tongTien = orderData.totalAmount;
  if (orderData.status) updatePayload.trangThai = orderData.status;
  if (orderData.orderType) updatePayload.loaiDonHang = orderData.orderType;
  if (orderData.note !== undefined) updatePayload.note = orderData.note;

  return updateDoc(orderRef, updatePayload);
};

/**
 * Xóa đơn hàng
 */
export const deleteOrder = async (orderId: string) => {
  const db = getDb();
  return deleteDoc(doc(db, COLLECTION_NAME, orderId));
};

/**
 * Lấy chi tiết một đơn hàng
 */
export const getOrderDetail = async (orderId: string): Promise<Order | null> => {
  const db = getDb();
  const docSnap = await getDoc(doc(db, COLLECTION_NAME, orderId));
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      customerName: data.tenKhachHang,
      productName: data.tenSanPham,
      totalAmount: data.tongTien,
      status: data.trangThai,
      orderType: data.loaiDonHang,
      address: data.diaChiGiaoHang,
      street: data.street,
      provinceCode: data.provinceCode,
      districtCode: data.districtCode,
      wardCode: data.wardCode,
      latitude: data.latitude,
      longitude: data.longitude,
      createdAt: data.ngayTao,
    } as unknown as Order;
  }
  return null;
};

/**
 * Cập nhật trạng thái đơn hàng
 */
export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  const db = getDb();
  const orderRef = doc(db, COLLECTION_NAME, orderId);
  return updateDoc(orderRef, {
    trangThai: status,
    updatedAt: serverTimestamp()
  });
};

/**
 * Phân công kỹ thuật viên cho đơn hàng
 */
export const assignTechnician = async (orderId: string, techId: string, techName: string) => {
  const db = getDb();
  const orderRef = doc(db, COLLECTION_NAME, orderId);
  return updateDoc(orderRef, {
    technicianId: techId,
    technicianName: techName,
    trangThai: 'assigned',
    updatedAt: serverTimestamp()
  });
};

/**
 * Lấy danh sách đơn hàng sắp đến hạn bảo trì
 */
export const getMaintenanceDueOrders = async (): Promise<Order[]> => {
  const db = getDb();
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);

  const q = query(
    collection(db, COLLECTION_NAME),
    where('ngayBaoTriTiepTheo', '>=', Timestamp.fromDate(now)),
    where('ngayBaoTriTiepTheo', '<=', Timestamp.fromDate(nextWeek)),
    orderBy('ngayBaoTriTiepTheo', 'asc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      customerName: data.tenKhachHang,
      phoneNumber: data.phoneNumber,
      productName: data.tenSanPham,
      nextMaintenanceDate: data.ngayBaoTriTiepTheo,
      status: data.trangThai,
      address: data.diaChiGiaoHang,
      latitude: data.latitude,
      longitude: data.longitude,
    } as unknown as Order;
  });
};
