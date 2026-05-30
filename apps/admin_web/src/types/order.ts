import { Timestamp } from 'firebase/firestore';

export type OrderStatus = 'pending' | 'assigned' | 'processing' | 'completed' | 'incident' | 'paid' | 'cancelled' | 'deleted';

export type OrderType = 'installation' | 'maintenance' | 'repair';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  street?: string;
  provinceCode?: number;
  districtCode?: number;
  wardCode?: number;
  latitude?: number;
  longitude?: number;
  productName: string; // Tên gộp hiển thị nhanh
  items: OrderItem[];  // Danh sách chi tiết sản phẩm
  totalAmount: number;
  status: OrderStatus;
  orderType: OrderType;
  technicianId?: string;
  technicianName?: string;
  createdAt: any;
  updatedAt: any;
  createdBy?: string;
  createdByName?: string;
  updatedBy?: string;
  updatedByName?: string;
  note?: string;
  nextMaintenanceDate?: any;
}
