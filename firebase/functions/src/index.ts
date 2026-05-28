/**
 * AquaCareSystem - Firebase Cloud Functions
 * 
 * Xử lý business logic, tự động hóa thông báo và quản lý kho
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const REGION = "asia-southeast1";

/**
 * Helper: Gửi thông báo FCM
 */
async function sendNotification(userId: string, title: string, body: string, data?: any) {
  try {
    const userDoc = await admin.firestore().collection("nguoiDung").doc(userId).get();
    const token = userDoc.data()?.fcmToken;
    if (token) {
      await admin.messaging().send({
        notification: { title, body },
        token: token,
        data: data || { userId },
      });
    }
  } catch (error) {
    console.error(`[FCM] Error sending to ${userId}:`, error);
  }
}

/**
 * T1.01 & T1.03: Xử lý thay đổi trạng thái đơn hàng & Quản lý kho
 */
export const onOrderStatusChanged = functions
  .region(REGION)
  .firestore.document("donHang/{orderId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const orderId = context.params.orderId;

    if (before.trangThai === after.trangThai) return null;

    const newStatus = after.trangThai;
    const oldStatus = before.trangThai;
    const orderCode = orderId.slice(-6).toUpperCase();
    const db = admin.firestore();

    // 1. Ghi nhật ký dashboard
    await db.collection("nhatKyHoatDong").add({
      moTa: `Đơn hàng #${orderCode}: ${oldStatus} ➔ ${newStatus}`,
      loai: newStatus === "completed" ? "success" : (newStatus === "cancelled" ? "error" : "info"),
      ngayTao: admin.firestore.FieldValue.serverTimestamp(),
      orderId: orderId
    });

    // 2. Logic Trừ/Hoàn tồn kho (T1.03)
    // Giả định đơn hàng có field 'product_id' và 'soLuong'
    if (after.product_id && after.soLuong) {
      const productRef = db.collection("sanPham").doc(after.product_id);

      if (newStatus === "confirmed" && oldStatus === "pending") {
        // Duyệt đơn -> Trừ kho
        await productRef.update({
          soLuongTon: admin.firestore.FieldValue.increment(-after.soLuong)
        });
      } else if (newStatus === "cancelled" && (oldStatus === "confirmed" || oldStatus === "assigned")) {
        // Hủy đơn sau khi đã duyệt -> Hoàn kho
        await productRef.update({
          soLuongTon: admin.firestore.FieldValue.increment(after.soLuong)
        });
      }
    }

    // 3. Thông báo cho khách hàng
    if (after.customer_id) {
      await sendNotification(after.customer_id, `Cập nhật đơn hàng #${orderCode}`, `Đơn hàng của bạn đã chuyển sang trạng thái: ${newStatus.toUpperCase()}`);
    }

    return null;
  });

/**
 * Trigger khi có đơn hàng mới (Tự động ghi log)
 */
export const onOrderCreated = functions
  .region(REGION)
  .firestore.document("donHang/{orderId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const orderCode = context.params.orderId.slice(-6).toUpperCase();
    await admin.firestore().collection("nhatKyHoatDong").add({
      moTa: `Có đơn hàng mới #${orderCode} từ ${data.tenKhachHang || "Khách hàng"}`,
      loai: "info",
      ngayTao: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

// Admin User Management functions... (giữ nguyên adminUpdateUser, adminCreateUser, adminDeleteUser)
