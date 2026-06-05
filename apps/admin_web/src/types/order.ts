import { Timestamp } from 'firebase/firestore';

// ─────────────────────────────────────────────────────────────────────────────
// Order Status & Type Constants
// ─────────────────────────────────────────────────────────────────────────────
export type OrderStatus = 'pending' | 'assigned' | 'processing' | 'completed' | 'incident' | 'paid' | 'cancelled' | 'deleted';

export type OrderType = 'home' | 'installation' | 'maintenance' | 'repair';

// ─────────────────────────────────────────────────────────────────────────────
// Delivery Address Interface
// ─────────────────────────────────────────────────────────────────────────────
export interface DeliveryAddress {
  type: string; // 'home', 'office', etc.
  recipientName: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  wardCode?: number;
  districtCode?: number;
  provinceCode?: number;
  latitude?: number;
  longitude?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Order Item Interface
// ─────────────────────────────────────────────────────────────────────────────
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  subtotal: number;
  warrantyPeriod?: number; // Tháng bảo hành
}

// ─────────────────────────────────────────────────────────────────────────────
// Technician Interface
// ─────────────────────────────────────────────────────────────────────────────
export interface OrderTechnician {
  id: string;
  name: string;
  phone: string;
  isPrimary?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Scheduled Slot Interface
// ─────────────────────────────────────────────────────────────────────────────
export interface ScheduledSlot {
  slotId: string;
  label: string; // '10:00 - 12:00'
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Order Interface
// ─────────────────────────────────────────────────────────────────────────────
export interface Order {
  id: string;
  orderCode: string;
  orderType: OrderType;

  // Customer Information
  customerId: string;
  customerName: string;
  customerEmail: string;
  phoneNumber: string;

  // Delivery Information
  deliveryAddress: DeliveryAddress;

  // Order Items
  items: OrderItem[];

  // Financial Information
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;

  // Notes & Status
  notes?: string;
  status: OrderStatus;

  // Scheduling
  scheduledDate?: any;
  scheduledSlot?: ScheduledSlot;

  // Technicians
  technicians?: OrderTechnician[];

  // Audit Information
  createdAt: any;
  updatedAt: any;
  updatedBy?: string;
  updatedByName?: string;

  // Legacy fields (backward compatibility)
  productName?: string; // Tên gộp hiển thị nhanh
  address?: string;
  street?: string;
  provinceCode?: number;
  districtCode?: number;
  wardCode?: number;
  latitude?: number;
  longitude?: number;
  technicianId?: string;
  technicianName?: string;
  nextMaintenanceDate?: any;
}

// ─────────────────────────────────────────────────────────────────────────────
// Order Creation DTO
// ─────────────────────────────────────────────────────────────────────────────
export interface CreateOrderDTO {
  orderType: OrderType;
  customerId: string;
  customerName: string;
  customerEmail: string;
  phoneNumber: string;
  deliveryAddress: DeliveryAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;
  notes?: string;
  scheduledDate: Date | string;
  scheduledSlot?: ScheduledSlot;
  technicians?: OrderTechnician[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Order Update DTO
// ─────────────────────────────────────────────────────────────────────────────
export interface UpdateOrderDTO {
  status?: OrderStatus;
  notes?: string;
  technicians?: OrderTechnician[];
  deliveryAddress?: DeliveryAddress;
  scheduledDate?: Date | string;
  scheduledSlot?: ScheduledSlot;
  updatedBy?: string;
  updatedByName?: string;
}
