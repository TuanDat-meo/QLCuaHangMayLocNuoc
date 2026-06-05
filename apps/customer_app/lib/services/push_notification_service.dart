import 'dart:io';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import '../main.dart';

// Hàm xử lý thông báo khi app ở dưới nền hoặc bị đóng (phải để ở ngoài class)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint("Xử lý thông báo nền: ${message.messageId}");
}

class PushNotificationService {
  static final FirebaseMessaging _fcm = FirebaseMessaging.instance;

  static Future<void> initialize() async {
    // 1. Đăng ký background handler
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // 2. Yêu cầu quyền thông báo
    NotificationSettings settings = await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      debugPrint('Quyền thông báo: Đã được cấp');
    }

    // 3. Cấu hình hiển thị thông báo khi App đang mở (Foreground) cho Android
    await _fcm.setForegroundNotificationPresentationOptions(
      alert: true, 
      badge: true,
      sound: true,
    );

    // 4. Lấy Token và lưu
    await saveTokenToFirestore();

    // 5. Lắng nghe tin nhắn khi App đang mở
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint('Nhận thông báo Foreground: ${message.notification?.title}');
      // Note: Trên Android, thông báo sẽ tự hiện nếu bạn cấu hình Channel ID đúng
    });

    // 6. Xử lý khi nhấn vào thông báo mở App từ Background
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('Người dùng nhấn vào thông báo: ${message.data}');
      if (message.data['orderId'] != null) {
        navigatorKey.currentState?.pushNamed('/order-detail', arguments: message.data['orderId']);
      }
    });
    
    // 7. Kiểm tra nếu App được mở từ trạng thái bị đóng hoàn toàn (Terminated)
    RemoteMessage? initialMessage = await _fcm.getInitialMessage();
    if (initialMessage != null) {
      debugPrint('App được mở từ thông báo (Terminated): ${initialMessage.data}');
      if (initialMessage.data['orderId'] != null) {
        // Đợi một chút để UI render xong trước khi push
        Future.delayed(const Duration(milliseconds: 500), () {
          navigatorKey.currentState?.pushNamed('/order-detail', arguments: initialMessage.data['orderId']);
        });
      }
    }
  }

  static Future<void> saveTokenToFirestore([String? token]) async {
    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) return;

      String? fcmToken = token ?? await _fcm.getToken();

      if (fcmToken != null) {
        await FirebaseFirestore.instance
            .collection('nguoiDung')
            .doc(user.uid)
            .update({
          'fcmToken': fcmToken,
          'platform': Platform.isAndroid ? 'android' : 'ios',
          'lastTokenUpdate': FieldValue.serverTimestamp(),
        });
      }
    } catch (e) {
      debugPrint('Lỗi cập nhật FCM Token: $e');
    }
  }
}
