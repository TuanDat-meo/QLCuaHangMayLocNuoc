"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onOrderStatusChanged = exports.onNotificationCreated = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const REGION = "asia-southeast1";
/**
 * Trigger: Tự động gửi Push Notification khi có tài liệu mới trong bộ sưu tập 'thongBao'
 */
exports.onNotificationCreated = functions
    .region(REGION)
    .firestore.document("thongBao/{notificationId}")
    .onCreate(async (snap, context) => {
    const data = snap.data();
    if (!data || !data.userId)
        return null;
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
        const message = {
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
    }
    catch (error) {
        console.error(`[FCM] Error sending notification to ${userId}:`, error);
        return null;
    }
});
/**
 * Trigger: Cập nhật nhật ký hệ thống khi đơn hàng thay đổi
 */
exports.onOrderStatusChanged = functions
    .region(REGION)
    .firestore.document("donHang/{orderId}")
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const orderId = context.params.orderId;
    if (before.trangThai === after.trangThai)
        return null;
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
//# sourceMappingURL=index.js.map