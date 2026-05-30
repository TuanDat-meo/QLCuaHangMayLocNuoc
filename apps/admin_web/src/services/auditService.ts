import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, limit, onSnapshot } from 'firebase/firestore';
import { getDb, getAuthInstance } from './authService';

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: any;
  timestamp: any;
}

/**
 * Ghi lại nhật ký hoạt động của người dùng (Audit logs & Activity Logs)
 * @param action Hành động thực hiện (Ví dụ: "Tạo mới", "Cập nhật", "Xóa")
 * @param resourceType Loại tài nguyên (Ví dụ: "Đơn hàng", "Sản phẩm")
 * @param resourceId ID của tài nguyên
 * @param details Thông tin chi tiết (nên kèm customerName để hiển thị đẹp trên feed)
 * @param type Loại thông báo cho Dashboard ('info' | 'success' | 'warning' | 'error')
 */
export const logActivity = async (
  action: string,
  resourceType: string,
  resourceId: string,
  details: any = {},
  type: 'info' | 'success' | 'warning' | 'error' = 'info'
) => {
  try {
    const db = getDb();
    const auth = getAuthInstance();
    const user = auth.currentUser;

    if (!user) return;

    const userName = user.displayName || 'Quản trị viên';

    // 1. Ghi vào audit_logs (Lưu chi tiết kỹ thuật cho Admin)
    await addDoc(collection(db, 'audit_logs'), {
      userId: user.uid,
      userEmail: user.email || '',
      userName: userName,
      action,
      resourceType,
      resourceId,
      details,
      timestamp: serverTimestamp(),
    });

    // 2. Ghi vào nhatKyHoatDong (Để hiển thị trên bảng tin Dashboard)
    // Tạo mô tả thân thiện
    let description = details.customerName
      ? `${userName} đã ${action.toLowerCase()} cho khách hàng ${details.customerName}`
      : `${userName} đã thực hiện: ${action} (${resourceType})`;

    await addDoc(collection(db, 'nhatKyHoatDong'), {
      moTa: description,
      ngayTao: serverTimestamp(),
      loai: type,
      nguoiThucHien: userName,
      userId: user.uid,
      resourceId: resourceId
    });

  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

/**
 * Lấy danh sách nhật ký hoạt động (Real-time) từ audit_logs
 */
export const subscribeToAuditLogs = (callback: (logs: AuditLog[]) => void) => {
  const db = getDb();
  const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(100));

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AuditLog));
    callback(logs);
  });
};
