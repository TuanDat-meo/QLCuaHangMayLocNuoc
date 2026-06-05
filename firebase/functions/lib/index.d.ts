import * as functions from "firebase-functions";
/**
 * Trigger: Tự động gửi Push Notification khi có tài liệu mới trong bộ sưu tập 'thongBao'
 */
export declare const onNotificationCreated: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
/**
 * Trigger: Cập nhật nhật ký hệ thống khi đơn hàng thay đổi
 */
export declare const onOrderStatusChanged: functions.CloudFunction<functions.Change<functions.firestore.QueryDocumentSnapshot>>;
//# sourceMappingURL=index.d.ts.map