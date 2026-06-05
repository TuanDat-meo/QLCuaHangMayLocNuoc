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
import { Order, OrderStatus, OrderTechnician, CreateOrderDTO, UpdateOrderDTO } from '../types/order';

const COLLECTION_NAME = 'donHang';

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Safe date parsing from multiple formats
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
 * Generate unique order code
 */
const generateOrderCode = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 100000);
  return `ORD-${year}-${random}`;
};

/**
 * Normalize order data for Firestore
 */
const normalizeOrderData = (orderData: any) => {
  return {
    orderCode: orderData.orderCode || generateOrderCode(),
    orderType: String(orderData.orderType || 'home'),
    
    // Customer Information
    customerId: String(orderData.customerId || ''),
    customerName: String(orderData.customerName || 'Khách hàng'),
    customerEmail: String(orderData.customerEmail || ''),
    phoneNumber: String(orderData.phoneNumber || ''),
    
    // Delivery Address
    deliveryAddress: {
      type: orderData.deliveryAddress?.type || 'home',
      recipientName: String(orderData.deliveryAddress?.recipientName || 'Địa chỉ giao hàng'),
      street: String(orderData.deliveryAddress?.street || ''),
      ward: String(orderData.deliveryAddress?.ward || ''),
      district: String(orderData.deliveryAddress?.district || ''),
      city: String(orderData.deliveryAddress?.city || ''),
      wardCode: orderData.deliveryAddress?.wardCode ? Number(orderData.deliveryAddress.wardCode) : null,
      districtCode: orderData.deliveryAddress?.districtCode ? Number(orderData.deliveryAddress.districtCode) : null,
      provinceCode: orderData.deliveryAddress?.provinceCode ? Number(orderData.deliveryAddress.provinceCode) : null,
      latitude: orderData.deliveryAddress?.latitude ? Number(orderData.deliveryAddress.latitude) : null,
      longitude: orderData.deliveryAddress?.longitude ? Number(orderData.deliveryAddress.longitude) : null,
    },
    
    // Order Items
    items: (orderData.items || []).map((item: any) => ({
      id: String(item.id || ''),
      productId: String(item.productId || ''),
      productName: String(item.productName || 'Sản phẩm'),
      imageUrl: item.imageUrl || null,
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      subtotal: Number(item.subtotal) || 0,
      warrantyPeriod: item.warrantyPeriod ? Number(item.warrantyPeriod) : null,
    })),
    
    // Financial Information
    subtotal: Number(orderData.subtotal) || 0,
    discount: Number(orderData.discount) || 0,
    shippingFee: Number(orderData.shippingFee) || 0,
    totalAmount: Number(orderData.totalAmount) || 0,
    
    // Notes & Status
    notes: String(orderData.notes || ''),
    status: String(orderData.status || 'pending'),
    
    // Scheduling
    scheduledDate: orderData.scheduledDate 
      ? Timestamp.fromDate(new Date(orderData.scheduledDate))
      : null,
    scheduledSlot: orderData.scheduledSlot ? {
      slotId: String(orderData.scheduledSlot.slotId || ''),
      label: String(orderData.scheduledSlot.label || ''),
    } : null,
    
    // Technicians
    technicians: (orderData.technicians || []).map((tech: any) => ({
      id: String(tech.id || ''),
      name: String(tech.name || ''),
      phone: String(tech.phone || ''),
      isPrimary: Boolean(tech.isPrimary || false),
    })),
    
    // Audit Information
    updatedAt: serverTimestamp(),
    updatedBy: orderData.updatedBy || null,
    updatedByName: orderData.updatedByName || null,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// CRUD Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Add new order
 */
export const addOrder = async (orderData: CreateOrderDTO) => {
  const db = getDb();
  if (!db) throw new Error("Kết nối Firestore thất bại");

  const docData = {
    ...normalizeOrderData(orderData),
    createdAt: serverTimestamp(),
  };

  console.log("DEBUG: Gửi đơn hàng mới lên Firestore", docData);
  const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
  return docRef.id;
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const db = getDb();
  if (!db) throw new Error("Kết nối Firestore thất bại");

  const docRef = doc(db, COLLECTION_NAME, orderId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Order;
};

/**
 * Subscribe to orders with real-time updates
 */
export const subscribeToOrders = (
  callback: (orders: Order[]) => void,
  statusFilter?: string
) => {
  const db = getDb();
  if (!db) {
    callback([]);
    return () => {};
  }

  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  
  if (statusFilter && statusFilter !== 'Tất cả') {
    const statusMap: Record<string, string> = {
      'Chờ duyệt': 'pending',
      'Đã phân công': 'assigned',
      'Đang xử lý': 'processing',
      'Hoàn tất': 'completed',
      'Sự cố': 'incident',
      'Đã tất toán': 'paid',
      'Đã hủy': 'cancelled'
    };
    
    if (statusMap[statusFilter]) {
      constraints.push(where('status', '==', statusMap[statusFilter]));
    }
  }

  const q = query(collection(db, COLLECTION_NAME), ...constraints);
  
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        // Map both old and new field names for backward compatibility
        return {
          id: doc.id,
          orderCode: data.orderCode || '',
          orderType: data.orderType || data.loaiDonHang || 'home',
          customerId: data.customerId || '',
          customerName: data.customerName || data.tenKhachHang || '',
          customerEmail: data.customerEmail || '',
          phoneNumber: data.phoneNumber || '',
          deliveryAddress: data.deliveryAddress || {
            type: 'home',
            recipientName: data.tenKhachHang || '',
            street: data.street || '',
            ward: '',
            district: '',
            city: '',
          },
          items: data.items || [],
          subtotal: data.subtotal || 0,
          discount: data.discount || 0,
          shippingFee: data.shippingFee || 0,
          totalAmount: data.totalAmount || data.tongTien || 0,
          notes: data.notes || data.note || '',
          status: data.status || data.trangThai || 'pending',
          scheduledDate: data.scheduledDate,
          scheduledSlot: data.scheduledSlot,
          technicians: data.technicians || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          updatedBy: data.updatedBy,
          updatedByName: data.updatedByName,
          // Legacy fields
          productName: data.productName || data.tenSanPham || '',
          address: data.address || '',
          ...data, // Spread remaining fields
        } as Order;
      })
      .filter((o) => o.status !== 'deleted');
    
    callback(orders);
  });
};

/**
 * Update order
 */
export const updateOrder = async (
  orderId: string,
  updateData: UpdateOrderDTO,
  updatedBy?: string,
  updatedByName?: string
) => {
  const db = getDb();
  if (!db) throw new Error("Kết nối Firestore thất bại");

  const normalized = normalizeOrderData({
    ...updateData,
    updatedBy,
    updatedByName,
  });

  // Only include fields that are being updated
  const updatePayload: any = {};
  Object.keys(normalized).forEach((key) => {
    if (key in updateData || key === 'updatedAt' || key === 'updatedBy' || key === 'updatedByName') {
      updatePayload[key] = normalized[key as keyof typeof normalized];
    }
  });

  console.log("DEBUG: Cập nhật đơn hàng", orderId, updatePayload);
  return updateDoc(doc(db, COLLECTION_NAME, orderId), updatePayload);
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  updatedBy?: string,
  updatedByName?: string
) => {
  const db = getDb();
  if (!db) throw new Error("Kết nối Firestore thất bại");

  return updateDoc(doc(db, COLLECTION_NAME, orderId), {
    status,
    updatedAt: serverTimestamp(),
    updatedBy: updatedBy || null,
    updatedByName: updatedByName || null,
  });
};

/**
 * Assign technicians to order
 */
export const assignTechnicians = async (
  orderId: string,
  technicians: OrderTechnician[],
  updatedBy?: string,
  updatedByName?: string
) => {
  const db = getDb();
  if (!db) throw new Error("Kết nối Firestore thất bại");

  return updateDoc(doc(db, COLLECTION_NAME, orderId), {
    technicians: technicians.map((tech) => ({
      id: tech.id,
      name: tech.name,
      phone: tech.phone,
      isPrimary: tech.isPrimary || false,
    })),
    status: 'assigned',
    updatedAt: serverTimestamp(),
    updatedBy: updatedBy || null,
    updatedByName: updatedByName || null,
  });
};

/**
 * Delete order (hard delete for pending, soft delete for others)
 */
export const deleteOrder = async (
  orderId: string,
  status: OrderStatus,
  updatedBy?: string,
  updatedByName?: string
) => {
  const db = getDb();
  if (!db) throw new Error("Kết nối Firestore thất bại");

  if (status === 'pending') {
    // Hard delete for pending orders
    return deleteDoc(doc(db, COLLECTION_NAME, orderId));
  }
  
  // Soft delete for other statuses
  return updateDoc(doc(db, COLLECTION_NAME, orderId), {
    status: 'deleted',
    updatedAt: serverTimestamp(),
    updatedBy: updatedBy || null,
    updatedByName: updatedByName || null,
  });
};
