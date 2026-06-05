import 'dart:convert';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/material.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;

// ─── Background handler (PHẢI là top-level function) ─────────────────────────
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Firebase đã khởi tạo sẵn bởi flutter ─ không cần init lại
  debugPrint('📬 [BG] Nhận thông báo nền: ${message.messageId}');
  // Trên Android, FCM tự hiện system notification khi app ở background/terminated
  // nên không cần làm gì thêm ở đây.
}

// ─── NotificationService ─────────────────────────────────────────────────────
class NotificationService {
  NotificationService._();
  static final NotificationService instance = NotificationService._();

  final _fcm = FirebaseMessaging.instance;
  final _localNotifications = FlutterLocalNotificationsPlugin();

  /// Android notification channel (High Importance)
  static const _androidChannel = AndroidNotificationChannel(
    'aquacare_high_importance_channel',
    'AquaCare Thông báo',
    description: 'Kênh thông báo chính của ứng dụng AquaCare',
    importance: Importance.max,
    playSound: true,
    enableVibration: true,
  );

  String? _fcmToken;
  String? get fcmToken => _fcmToken;

  // Callback để điều hướng khi tap vào thông báo
  Function(String? payload)? onNotificationTap;

  // ─── Khởi tạo ──────────────────────────────────────────────────────────────
  Future<void> init() async {
    // Khởi tạo timezone database
    tz.initializeTimeZones();

    // 1. Đăng ký background handler
    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

    // 2. Xin quyền thông báo
    final settings = await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );

    debugPrint(
        '🔔 Trạng thái quyền thông báo: ${settings.authorizationStatus}');

    if (settings.authorizationStatus == AuthorizationStatus.denied) {
      debugPrint('❌ Người dùng từ chối quyền thông báo');
      return;
    }

    // 3. Khởi tạo flutter_local_notifications
    await _initLocalNotifications();

    // 4. Lấy FCM Token
    await _fetchToken();

    // 5. Lắng nghe thay đổi token
    _fcm.onTokenRefresh.listen((newToken) {
      _fcmToken = newToken;
      debugPrint('🔄 FCM Token mới: $newToken');
      // TODO: Gửi token mới lên Firestore nếu cần
    });

    // 6. Lắng nghe 3 trạng thái nhận thông báo
    _setupMessageHandlers();

    debugPrint('✅ NotificationService khởi tạo thành công');
  }

  // ─── Khởi tạo local notifications ─────────────────────────────────────────
  Future<void> _initLocalNotifications() async {
    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    const darwinInit = DarwinInitializationSettings(
      requestAlertPermission: false, // Đã xin ở FCM
      requestBadgePermission: false,
      requestSoundPermission: false,
    );

    await _localNotifications.initialize(
      const InitializationSettings(
        android: androidInit,
        iOS: darwinInit,
      ),
      onDidReceiveNotificationResponse: (details) {
        onNotificationTap?.call(details.payload);
      },
    );

    // Tạo channel trên Android
    final androidPlugin = _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>();
    await androidPlugin?.createNotificationChannel(_androidChannel);

    debugPrint('🔔 Local notifications channel đã tạo: ${_androidChannel.id}');
  }

  // ─── Lấy FCM Token ─────────────────────────────────────────────────────────
  Future<void> _fetchToken() async {
    try {
      _fcmToken = await _fcm.getToken();
      debugPrint('📱 FCM Token: $_fcmToken');
    } catch (e) {
      debugPrint('❌ Lỗi lấy FCM token: $e');
    }
  }

  // ─── Xử lý 3 trạng thái thông báo ─────────────────────────────────────────
  void _setupMessageHandlers() {
    // Trạng thái 1: App đang mở (Foreground) → Hiện local notification
    FirebaseMessaging.onMessage.listen((message) {
      debugPrint('📩 [FG] Nhận thông báo foreground: ${message.notification?.title}');
      _showLocalNotification(message);
    });

    // Trạng thái 2: App đang nền, người dùng TAP vào notification
    FirebaseMessaging.onMessageOpenedApp.listen((message) {
      debugPrint('👆 [BG→FG] Mở từ thông báo nền: ${message.notification?.title}');
      _handleNotificationTap(message.data);
    });

    // Trạng thái 3: App bị tắt hoàn toàn, người dùng TAP vào notification
    _fcm.getInitialMessage().then((message) {
      if (message != null) {
        debugPrint('🚀 [TERMINATED] Mở từ thông báo khi app bị đóng: ${message.notification?.title}');
        // Delay nhỏ để app kịp khởi tạo route trước khi navigate
        Future.delayed(const Duration(milliseconds: 500), () {
          _handleNotificationTap(message.data);
        });
      }
    });
  }

  // ─── Hiện popup local notification (Foreground) ────────────────────────────
  Future<void> _showLocalNotification(RemoteMessage message) async {
    final notification = message.notification;
    if (notification == null) return;

    final androidDetails = AndroidNotificationDetails(
      _androidChannel.id,
      _androidChannel.name,
      channelDescription: _androidChannel.description,
      importance: Importance.max,
      priority: Priority.high,
      icon: '@mipmap/ic_launcher',
      color: const Color(0xff0ea5e9),
      showWhen: true,
      styleInformation: BigTextStyleInformation(
        notification.body ?? '',
        contentTitle: notification.title,
      ),
    );

    await _localNotifications.show(
      notification.hashCode,
      notification.title,
      notification.body,
      NotificationDetails(android: androidDetails),
      payload: jsonEncode(message.data),
    );
  }

  // ─── Xử lý tap thông báo → điều hướng ─────────────────────────────────────
  void _handleNotificationTap(Map<String, dynamic> data) {
    final jobId = data['jobId'] as String?;
    final type = data['type'] as String?;

    debugPrint('🔗 Tap thông báo: type=$type, jobId=$jobId');
    onNotificationTap?.call(jobId);
  }



  /// Hiển thị thông báo cục bộ lập tức (Foreground/Realtime)
  Future<void> showLocalNotificationDirect({
    required int id,
    required String title,
    required String body,
    Map<String, dynamic>? payloadData,
  }) async {
    final androidDetails = AndroidNotificationDetails(
      _androidChannel.id,
      _androidChannel.name,
      channelDescription: _androidChannel.description,
      importance: Importance.max,
      priority: Priority.high,
      icon: '@mipmap/ic_launcher',
      color: const Color(0xff0ea5e9),
      showWhen: true,
      styleInformation: BigTextStyleInformation(
        body,
        contentTitle: title,
      ),
    );

    await _localNotifications.show(
      id,
      title,
      body,
      NotificationDetails(android: androidDetails),
      payload: payloadData != null ? jsonEncode(payloadData) : null,
    );
  }

  /// Lên lịch thông báo tại một thời điểm nhất định trong tương lai
  Future<void> scheduleNotification({
    required int id,
    required String title,
    required String body,
    required DateTime scheduledDateTime,
  }) async {
    try {
      final now = DateTime.now();
      if (scheduledDateTime.isBefore(now)) {
        debugPrint('⚠️ Không thể lên lịch thông báo trong quá khứ: $scheduledDateTime');
        return;
      }

      final vietnam = tz.getLocation('Asia/Ho_Chi_Minh');
      final tzDateTime = tz.TZDateTime.from(scheduledDateTime, vietnam);

      final androidDetails = AndroidNotificationDetails(
        _androidChannel.id,
        _androidChannel.name,
        channelDescription: _androidChannel.description,
        importance: Importance.max,
        priority: Priority.high,
        icon: '@mipmap/ic_launcher',
        color: const Color(0xff0ea5e9),
        showWhen: true,
        styleInformation: BigTextStyleInformation(
          body,
          contentTitle: title,
        ),
      );

      await _localNotifications.zonedSchedule(
        id,
        title,
        body,
        tzDateTime,
        NotificationDetails(android: androidDetails),
        androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
        uiLocalNotificationDateInterpretation:
            UILocalNotificationDateInterpretation.absoluteTime,
      );
      debugPrint('📅 [Lên lịch] Thông báo ID=$id lúc: $tzDateTime');
    } catch (e) {
      debugPrint('❌ Lỗi lên lịch thông báo: $e');
    }
  }

  /// Hủy một thông báo đã lên lịch
  Future<void> cancelNotification(int id) async {
    try {
      await _localNotifications.cancel(id);
      debugPrint('🗑️ [Hủy lịch] Đã hủy thông báo ID=$id');
    } catch (e) {
      debugPrint('❌ Lỗi hủy thông báo ID=$id: $e');
    }
  }
}
