import { Timestamp } from 'firebase/firestore';

export interface Device {
  id: string;
  did: string;
  order_id: string;
  customer_id: string;
  customer_name?: string;
  customer_phone?: string;
  product_id: string;
  product_name?: string;
  serial_number: string;
  qr_code?: string;
  install_date: Timestamp | Date;
  warranty_until: Timestamp | Date;
  status: 'installing' | 'active' | 'warranty_ended' | 'maintenance_due' | 'deactivated';
  location?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
  created_at: Timestamp | Date;
  updated_at: Timestamp | Date;
}

export interface DeviceHistory {
  id: string;
  event: 'installed' | 'maintained' | 'repaired' | 'status_changed';
  description: string;
  performed_by: string; // technician_id
  performed_by_name?: string;
  performed_at: Timestamp | Date;
}
