import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const REGION = "asia-southeast1";

/**
 * Trigger: Tự động gửi Push Notification khi có tài liệu mới trong bộ sưu tập 'thongBao'
 */
export const onNotificationCreated = functions
  .region(REGION)
  .firestore.document("thongBao/{notificationId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    if (!data || !data.userId) return null;

    const { userId, title, body, type, data: extraData } = data;

    try {
      // 1. Lấy token của người dùng
      const userDoc = await admin.firestore().collection("nguoiDung").doc(userId).get();
      const fcmToken = userDoc.data()?.fcmToken;

      if (!fcmToken) {
        console.log(`[FCM] No token found for user: ${userId}`);
        return null;
      }

      // 2. Cấu hình nội dung thông báo
      const message: admin.messaging.Message = {
        token: fcmToken,
        notification: {
          title: title || "Thông báo từ AquaCare",
          body: body || "Bạn có cập nhật mới",
        },
        data: {
          type: type || "system",
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          ...(extraData || {}),
        },
        android: {
          priority: "high",
          notification: {
            channelId: "high_importance_channel",
            sound: "default",
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
            },
          },
        },
      };

      // 3. Gửi thông báo
      const response = await admin.messaging().send(message);
      console.log(`[FCM] Successfully sent message to ${userId}:`, response);

      return response;
    } catch (error) {
      console.error(`[FCM] Error sending notification to ${userId}:`, error);
      return null;
    }
  });

/**
 * Trigger: Cập nhật nhật ký hệ thống khi đơn hàng thay đổi
 */
export const onOrderStatusChanged = functions
  .region(REGION)
  .firestore.document("donHang/{orderId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const orderId = context.params.orderId;

    if (before.trangThai === after.trangThai) return null;

    const orderCode = after.orderCode || orderId.slice(-6).toUpperCase();

    // Ghi log vào dashboard (để Admin theo dõi)
    await admin.firestore().collection("nhatKyHoatDong").add({
      moTa: `Đơn hàng ${orderCode}: ${before.trangThai} ➔ ${after.trangThai}`,
      loai: after.trangThai === "completed" ? "success" : "info",
      ngayTao: admin.firestore.FieldValue.serverTimestamp(),
      orderId: orderId
    });

    return null;
  });
