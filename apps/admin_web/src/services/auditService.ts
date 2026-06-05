import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, limit, onSnapshot } from 'firebase/firestore';
import { getDb, getAuthInstance } from './authService';

/**
 * Ghi lại nhật ký hoạt động của người dùng
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

    const userName = user.displayName || user.email || 'Quản trị viên';

    // 1. Ghi vào audit_logs
    await addDoc(collection(db, 'audit_logs'), {
      userId: user.uid,
      userEmail: user.email || '',
      userName: userName,
      action,
      resourceType,
      resourceId,
      details: details || {},
      timestamp: serverTimestamp(),
    });

    // 2. Ghi vào nhatKyHoatDong
    const customerName = details?.customerName || details?.client || '';
    let description = customerName
      ? `${userName} đã ${action.toLowerCase()} cho khách hàng ${customerName}`
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

export const subscribeToAuditLogs = (callback: (logs: any[]) => void) => {
  const db = getDb();
  const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(100));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
};
