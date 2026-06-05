import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { getDb } from './authService';
import { Device, DeviceHistory } from '../types/device';
import { Order } from '../types/order';

const COLLECTION_NAME = 'devices';

export const getDevices = async (): Promise<Device[]> => {
  const db = getDb();
  const q = query(collection(db, COLLECTION_NAME), orderBy('created_at', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Device));
};

export const getDeviceById = async (id: string): Promise<Device | null> => {
  const db = getDb();
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Device;
  }
  return null;
};

export const createDevice = async (device: Omit<Device, 'id' | 'did'>) => {
  const db = getDb();
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...device,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  });

  await updateDoc(docRef, { did: docRef.id });

  await addDeviceHistory(docRef.id, {
    event: 'installed',
    description: 'Thiết bị được kích hoạt trên hệ thống từ đơn hàng',
    performed_by: 'system',
    performed_at: new Date()
  });

  return docRef.id;
};

/**
 * Tự động tạo thiết bị từ đơn hàng khi hoàn tất lắp đặt
 */
export const createDevicesFromOrder = async (order: Order) => {
  const db = getDb();

  // Kiểm tra xem đơn hàng đã được tạo thiết bị chưa để tránh trùng lặp
  const q = query(collection(db, COLLECTION_NAME), where('order_id', '==', order.id));
  const existing = await getDocs(q);
  if (!existing.empty) return;

  // Lấy các sản phẩm trong đơn hàng
  const installTasks = (order.items || []).map(async (item) => {
    for (let i = 0; i < item.quantity; i++) {
      // Sử dụng thời gian bảo hành từ sản phẩm, nếu không có mặc định 12 tháng
      const warrantyMonths = Number(item.thoiGianBaoHanh) || 12;
      const installDate = new Date();
      const warrantyUntil = new Date();
      warrantyUntil.setMonth(installDate.getMonth() + warrantyMonths);

      const deviceData: Omit<Device, 'id' | 'did'> = {
        order_id: order.id,
        customer_id: order.phoneNumber,
        customer_name: order.customerName,
        customer_phone: order.phoneNumber,
        product_id: item.id,
        product_name: item.name,
        serial_number: `SN-${order.id.slice(-4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        install_date: installDate,
        warranty_until: warrantyUntil,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
        notes: `Tự động kích hoạt bảo hành ${warrantyMonths} tháng từ đơn hàng #${order.id.slice(-6)}`
      };

      await createDevice(deviceData);
    }
  });

  await Promise.all(installTasks);
};

export const updateDevice = async (id: string, data: Partial<Device>) => {
  const db = getDb();
  const deviceRef = doc(db, COLLECTION_NAME, id);
  return await updateDoc(deviceRef, {
    ...data,
    updated_at: serverTimestamp()
  });
};

export const addDeviceHistory = async (deviceId: string, history: Omit<DeviceHistory, 'id'>) => {
  const db = getDb();
  const historyRef = collection(db, COLLECTION_NAME, deviceId, 'history');
  return await addDoc(historyRef, {
    ...history,
    performed_at: history.performed_at instanceof Date ? Timestamp.fromDate(history.performed_at) : history.performed_at
  });
};

export const getDeviceHistory = async (deviceId: string): Promise<DeviceHistory[]> => {
  const db = getDb();
  const q = query(collection(db, COLLECTION_NAME, deviceId, 'history'), orderBy('performed_at', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as DeviceHistory));
};

export const deleteDevice = async (id: string) => {
  const db = getDb();
  const deviceRef = doc(db, COLLECTION_NAME, id);
  return await deleteDoc(deviceRef);
};
