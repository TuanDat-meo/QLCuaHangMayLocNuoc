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
 * Hàm hỗ trợ tạo thông báo cho khách hàng
 */
const createCustomerNotification = async (userId: string, title: string, body: string, data: any) => {
  const db = getDb();
  if (!db || !userId) return;
  try {
    await addDoc(collection(db, 'thongBao'), {
      userId,
      title,
      body,
      type: 'order_status',
      data,
      isRead: false,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.error("Error creating notification:", e);
  }
};

/**
 * Hàm hỗ trợ tạo thông báo cho kỹ thuật viên
 */
const createTechnicianNotification = async (
  ktvId: string,
  title: string,
  body: string,
  jobId: string,
  type: string
) => {
  const db = getDb();
  if (!db || !ktvId) return;
  try {
    await addDoc(collection(db, 'thongBao'), {
      ktvId,
      tieuDe: title,
      noiDung: body,
      loai: type,
      donHangId: jobId,
      daDoc: false,
      ngayTao: serverTimestamp()
    });
  } catch (e) {
    console.error("Error creating technician notification:", e);
  }
};

/**
 * Hàm ép kiểu ngày tháng an toàn
 */
export const safeToDate = (value: any): Date => {
  if (!value) return new Date();
  if (typeof value.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  if (value && typeof value === 'object' && (value.seconds || value._methodName)) {
    return new Date((value.seconds || Date.now() / 1000) * 1000);
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

  let customerId = orderData.customerId || null;

  if (!customerId && orderData.phoneNumber) {
    try {
      let q = query(collection(db, 'nguoiDung'), where('phoneNumber', '==', String(orderData.phoneNumber).trim()));
      let snap = await getDocs(q);
      if (snap.empty) {
        q = query(collection(db, 'nguoiDung'), where('phone', '==', String(orderData.phoneNumber).trim()));
        snap = await getDocs(q);
      }
      if (!snap.empty) {
        customerId = snap.docs[0].id;
      }
    } catch (e) {
      console.error("Error finding customer by phone:", e);
    }
  }

  const orderCode = 'ORD-' + Math.random().toString(36).toUpperCase().substring(2, 8);

  const docData = {
    customerId: customerId,
    khachHangId: customerId,
    orderCode: orderCode,
    tenKhachHang: String(orderData.customerName || 'Khách hàng'),
    phoneNumber: String(orderData.phoneNumber || ''),
    diaChiGiaoHang: String(orderData.address || ''),
    street: String(orderData.street || ''),
    provinceCode: Number(orderData.provinceCode) || null,
    districtCode: Number(orderData.districtCode) || null,
    wardCode: Number(orderData.wardCode) || null,
    tenSanPham: String(orderData.productName || ''),
    items: (orderData.items || []).map((item: any) => ({
      id: String(item.id || ''),
      name: String(item.name || 'Sản phẩm'),
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      imageUrl: item.imageUrl || null,
      thoiGianBaoHanh: Number(item.thoiGianBaoHanh) || 0
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

  const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);

  // Thông báo cho khách hàng nếu có customerId
  if (customerId) {
    await createCustomerNotification(
      customerId,
      'Đơn hàng mới đã được tạo',
      `Đơn hàng ${orderCode} của bạn đã được tạo thành công trên hệ thống.`,
      { orderId: docRef.id, status: docData.trangThai }
    );
  }

  return docRef;
};

export const subscribeToOrders = (callback: (orders: Order[]) => void, statusFilter?: string) => {
  const db = getDb();
  const constraints: QueryConstraint[] = [orderBy('ngayTao', 'desc')];
  if (statusFilter && statusFilter !== 'Tất cả') {
    const statusMap: Record<string, string> = {
      'Chờ duyệt': 'pending',
      'Đã duyệt': 'approved',
      'Đã phân công': 'assigned',
      'Đang xử lý': 'processing',
      'Đang lắp đặt': 'installing',
      'Hoàn tất': 'completed',
      'Sự cố': 'incident',
      'Đã tất toán': 'paid',
      'Đã hủy': 'cancelled'
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

/**
 * Cập nhật trạng thái đơn hàng kèm thông báo
 */
export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  const db = getDb();
  const orderDoc = await getDoc(doc(db, COLLECTION_NAME, orderId));
  if (!orderDoc.exists()) return;

  const orderData = orderDoc.data();
  await updateDoc(doc(db, COLLECTION_NAME, orderId), {
    trangThai: status,
    updatedAt: serverTimestamp()
  });

  // Gửi thông báo cho khách hàng
  const statusLabels: any = {
    'approved': 'đã được duyệt',
    'assigned': 'đã được phân công kỹ thuật viên',
    'processing': 'đang được xử lý',
    'installing': 'đang được tiến hành lắp đặt',
    'completed': 'đã hoàn tất thành công',
    'cancelled': 'đã bị hủy',
    'incident': 'gặp sự cố kỹ thuật'
  };

  if (orderData.customerId || orderData.khachHangId) {
    const uid = orderData.customerId || orderData.khachHangId;
    await createCustomerNotification(
      uid,
      'Cập nhật trạng thái đơn hàng',
      `Đơn hàng ${orderData.orderCode || ''} ${statusLabels[status] || status}.`,
      { orderId, status }
    );
  }
};

/**
 * Cập nhật KTV và gửi thông báo
 */
export const assignTechnicians = async (orderId: string, technicians: OrderTechnician[], scheduledDate: Date, currentStatus: string) => {
  const db = getDb();
  const updateData: any = {
    technicians,
    updatedAt: serverTimestamp()
  };

  if (['pending', 'approved'].includes(currentStatus)) {
    updateData.trangThai = 'assigned';
  }

  if (scheduledDate) {
    updateData.scheduledDate = Timestamp.fromDate(scheduledDate);
  }

  await updateDoc(doc(db, COLLECTION_NAME, orderId), updateData);

  // Thông báo phân công
  const orderDoc = await getDoc(doc(db, COLLECTION_NAME, orderId));
  if (orderDoc.exists()) {
    const data = orderDoc.data();
    const uid = data.customerId || data.khachHangId;
    if (uid) {
      await createCustomerNotification(
        uid,
        'Kỹ thuật viên đã được phân công',
        `Đơn hàng ${data.orderCode} sẽ được xử lý bởi ${technicians.length} kỹ thuật viên vào lúc ${scheduledDate.toLocaleString('vi-VN')}.`,
        { orderId, status: 'assigned' }
      );
    }

    // Gửi thông báo cho từng KTV được phân công
    const orderCode = data.orderCode || '';
    const customerName = data.tenKhachHang || data.customerName || '';
    const formattedDate = scheduledDate ? scheduledDate.toLocaleString('vi-VN') : '';
    for (const tech of technicians) {
      if (tech.id) {
        await createTechnicianNotification(
          tech.id,
          '🔧 Bạn có công việc mới được phân công!',
          `Đơn hàng ${orderCode} (KH: ${customerName}) đã được gán cho bạn. Lịch hẹn: ${formattedDate}.`,
          orderId,
          'new_job'
        );
      }
    }
  }
};

export const deleteOrder = async (orderId: string, status: OrderStatus) => {
  if (status === 'pending') return deleteDoc(doc(getDb(), COLLECTION_NAME, orderId));
  return updateDoc(doc(getDb(), COLLECTION_NAME, orderId), { trangThai: 'deleted', updatedAt: serverTimestamp() });
};

export const updateOrder = async (orderId: string, orderData: any) => {
  const db = getDb();

  // Lấy đơn hàng hiện tại để so sánh trạng thái
  const orderDoc = await getDoc(doc(db, COLLECTION_NAME, orderId));
  if (orderDoc.exists()) {
    const oldData = orderDoc.data();
    // Nếu có sự thay đổi trạng thái và trạng thái mới khác trạng thái cũ
    if (orderData.status && oldData.trangThai !== orderData.status) {
      const uid = oldData.customerId || oldData.khachHangId;
      if (uid) {
        const statusLabels: any = {
          'approved': 'đã được duyệt',
          'assigned': 'đã được phân công kỹ thuật viên',
          'processing': 'đang được xử lý',
          'installing': 'đang được tiến hành lắp đặt',
          'completed': 'đã hoàn tất thành công',
          'cancelled': 'đã bị hủy',
          'incident': 'gặp sự cố kỹ thuật'
        };
        await createCustomerNotification(
          uid,
          'Cập nhật trạng thái đơn hàng',
          `Đơn hàng ${oldData.orderCode || ''} ${statusLabels[orderData.status] || orderData.status}.`,
          { orderId, status: orderData.status }
        );
      }
    }

    // Kiểm tra nếu đổi giờ hẹn (scheduledDate)
    let isScheduledDateChanged = false;
    let oldDateStr = '';
    let newDateStr = '';
    if (orderData.scheduledDate) {
      const oldSched = oldData.scheduledDate;
      const newSched = orderData.scheduledDate;
      const oldTime = oldSched ? (oldSched.toDate ? oldSched.toDate().getTime() : new Date(oldSched).getTime()) : 0;
      const newTime = newSched instanceof Date ? newSched.getTime() : new Date(newSched).getTime();
      // Duy Binh sua cai nay
      orderData.scheduledDate = Timestamp.fromDate(new Date(orderData.scheduledDate));

      if (oldTime !== newTime) {
        isScheduledDateChanged = true;
        oldDateStr = oldSched ? (oldSched.toDate ? oldSched.toDate().toLocaleString('vi-VN') : new Date(oldSched).toLocaleString('vi-VN')) : 'chưa có';
        newDateStr = newSched instanceof Date ? newSched.toLocaleString('vi-VN') : new Date(newSched).toLocaleString('vi-VN');
      }
    }

    if (isScheduledDateChanged) {
      const orderCode = oldData.orderCode || '';
      const customerName = oldData.tenKhachHang || oldData.customerName || '';
      const technicians: OrderTechnician[] = oldData.technicians || [];
      for (const tech of technicians) {
        if (tech.id) {
          await createTechnicianNotification(
            tech.id,
            '⏰ Lịch hẹn công việc đã thay đổi!',
            `Đơn hàng ${orderCode} (KH: ${customerName}) đã được dời lịch từ [${oldDateStr}] sang [${newDateStr}].`,
            orderId,
            'reschedule'
          );
        }
      }
    }
  }

  // Cập nhật dữ liệu
  const updatePayload = {
    ...orderData,
    trangThai: orderData.status || orderData.trangThai || 'pending',
    updatedAt: serverTimestamp()
  };
  await updateDoc(doc(db, COLLECTION_NAME, orderId), updatePayload);
};
