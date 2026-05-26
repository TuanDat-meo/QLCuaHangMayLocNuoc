import 'package:flutter/material.dart';
import 'package:customer_app/models/notification_model.dart';
import 'package:customer_app/services/firestore_service.dart';
import 'package:firebase_auth/firebase_auth.dart';

class NotificationController extends ChangeNotifier {
  List<AppNotification> _notifications = [];
  bool _isLoading = false;
  String? _error;

  List<AppNotification> get notifications => _notifications;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasUnread => _notifications.any((n) => !n.isRead);
  int get unreadCount => _notifications.where((n) => !n.isRead).length;

  Future<void> loadNotifications() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await FirestoreService.getNotifications(user.uid);
      _notifications = data.map((map) => AppNotification.fromMap(map)).toList();
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> markAsRead(String notificationId) async {
    try {
      await FirestoreService.markNotificationRead(notificationId);
      final index = _notifications.indexWhere((n) => n.id == notificationId);
      if (index >= 0) {
        final notification = _notifications[index];
        _notifications[index] = AppNotification(
          id: notification.id,
          userId: notification.userId,
          title: notification.title,
          body: notification.body,
          type: notification.type,
          data: notification.data,
          isRead: true,
          createdAt: notification.createdAt,
          readAt: DateTime.now(),
        );
        notifyListeners();
      }
    } catch (e) {
      _error = e.toString();
    }
  }

  Future<void> deleteNotification(String notificationId) async {
    try {
      await FirestoreService.deleteNotification(notificationId);
      _notifications.removeWhere((n) => n.id == notificationId);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
    }
  }

  Future<void> markAllAsRead() async {
    for (var n in _notifications.where((n) => !n.isRead)) {
      await markAsRead(n.id);
    }
  }

  Future<void> deleteAll() async {
    for (var n in _notifications) {
      await deleteNotification(n.id);
    }
  }
}
