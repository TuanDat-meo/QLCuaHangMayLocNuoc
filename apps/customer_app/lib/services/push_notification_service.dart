import 'dart:io';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

class PushNotificationService {
  static final FirebaseMessaging _fcm = FirebaseMessaging.instance;

  static Future<void> initialize() async {
    // 1. Yêu cầu quyền thông báo (iOS/Android 13+)
    NotificationSettings settings = await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      debugPrint('User granted permission');
    }

    // 2. Lấy FCM Token và lưu vào Firestore
    await _saveTokenToFirestore();

    // 3. Lắng nghe token thay đổi
    _fcm.onTokenRefresh.listen((newToken) {
      _saveTokenToFirestore(newToken);
    });

    // 4. Xử lý khi app đang mở (Foreground)
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint('Nhận thông báo khi app đang mở: ${message.notification?.title}');
      // Bạn có thể dùng flutter_local_notifications để hiển thị popup ở đây
    });

    // 5. Xử lý khi người dùng nhấn vào thông báo để mở app
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('Người dùng nhấn vào thông báo: ${message.data}');
    });
  }

  static Future<void> _saveTokenToFirestore([String? token]) async {
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
          'lastUpdatedToken': FieldValue.serverTimestamp(),
          'platform': Platform.isAndroid ? 'android' : 'ios',
        });
        debugPrint('FCM Token đã được cập nhật: $fcmToken');
      }
    } catch (e) {
      debugPrint('Lỗi lưu Token: $e');
    }
  }
}
