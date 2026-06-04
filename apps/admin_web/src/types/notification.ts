import { UserRole } from './auth';

export type NotificationType = 'order' | 'maintenance' | 'promotion' | 'system' | 'inventory';

export interface AppNotification {
  nid: string;
  user_id?: string;
  title: string;
  message: string;
  type: NotificationType;
  related_id?: string;
  is_read: boolean;
  created_at: any; // Firebase Timestamp
  recipient_role?: UserRole[];
}
