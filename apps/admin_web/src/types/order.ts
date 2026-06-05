import { Timestamp } from 'firebase/firestore';

export type OrderStatus = 'pending' | 'approved' | 'assigned' | 'processing' | 'completed' | 'incident' | 'paid' | 'cancelled' | 'deleted';

export type OrderType = 'installation' | 'maintenance' | 'repair';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  thoiGianBaoHanh?: number; // Thời gian bảo hành của sản phẩm (tháng)
}

export interface OrderTechnician {
  id: string;
  name: string;
  phone?: string;
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
  technicians?: OrderTechnician[]; // Danh sách kỹ thuật viên
  technicianId?: string;   // Giữ lại để tương thích ngược nếu cần
  technicianName?: string; // Giữ lại để tương thích ngược nếu cần
  scheduledDate?: any;     // Lịch hẹn đến nhà khách hàng (Lịch làm việc)
  createdAt: any;
  updatedAt: any;
  createdBy?: string;
  createdByName?: string;
  updatedBy?: string;
  updatedByName?: string;
  note?: string;
  nextMaintenanceDate?: any;
}
