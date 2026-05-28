import { Timestamp } from 'firebase/firestore';

export type OrderStatus = 'pending' | 'assigned' | 'processing' | 'completed' | 'cancelled';
export type OrderType = 'installation' | 'maintenance' | 'repair';

export interface Order {
  id: string;
  customerName: string;
  phoneNumber: string;
  address: string; // Chuỗi đầy đủ để hiển thị nhanh
  provinceCode?: number;
  districtCode?: number;
  wardCode?: number;
  street?: string;
  latitude?: number;
  longitude?: number;
  productName: string;
  totalAmount: number;
  status: OrderStatus;
  orderType: OrderType;
  technicianId?: string;
  technicianName?: string;
  note?: string;
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  nextMaintenanceDate?: Date | Timestamp;
}
