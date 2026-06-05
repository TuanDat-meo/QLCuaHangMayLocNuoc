import 'dart:async';
import 'package:flutter/material.dart';
import 'package:customer_app/models/notification_model.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class NotificationController extends ChangeNotifier {
  List<AppNotification> _notifications = [];
  bool _isLoading = false;
  String? _error;
  StreamSubscription? _notificationSubscription;

  List<AppNotification> get notifications => _notifications;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasUnread => _notifications.any((n) => !n.isRead);
  int get unreadCount => _notifications.where((n) => !n.isRead).length;

  NotificationController() {
    _startListening();
  }

  // Lắng nghe thay đổi Real-time từ Firestore (Thay thế cho Cloud Functions)
  void _startListening() {
    _notificationSubscription?.cancel();
    
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    _notificationSubscription = FirebaseFirestore.instance
        .collection('thongBao')
        .where('userId', isEqualTo: user.uid)
        .snapshots()
        .listen((snapshot) {
      _notifications = snapshot.docs.map((doc) {
        final data = doc.data();
        data['id'] = doc.id;
        return AppNotification.fromMap(data);
      }).toList();
      
      _notifications.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      
      notifyListeners();
      
      // Ở đây bạn có thể gọi hàm hiện thông báo Popup cục bộ
      debugPrint('Đã cập nhật thông báo mới: ${_notifications.length}');
    }, onError: (e) {
      _error = e.toString();
      notifyListeners();
    });
  }

  // Làm mới khi chuyển tài khoản
  void refresh() {
    _startListening();
  }

  @override
  void dispose() {
    _notificationSubscription?.cancel();
    super.dispose();
  }

  Future<void> markAsRead(String notificationId) async {
    try {
      await FirebaseFirestore.instance
          .collection('thongBao')
          .doc(notificationId)
          .update({
        'isRead': true,
        'readAt': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      _error = e.toString();
    }
  }

  Future<void> markAllAsRead() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    final batch = FirebaseFirestore.instance.batch();
    final unreadItems = _notifications.where((n) => !n.isRead);
    
    for (var n in unreadItems) {
      batch.update(FirebaseFirestore.instance.collection('thongBao').doc(n.id), {
        'isRead': true,
        'readAt': FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();
  }

  Future<void> deleteNotification(String notificationId) async {
    try {
      await FirebaseFirestore.instance.collection('thongBao').doc(notificationId).delete();
    } catch (e) {
      _error = e.toString();
    }
  }

  Future<void> loadNotifications() async {
    refresh();
  }

  Future<void> deleteAll() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    final batch = FirebaseFirestore.instance.batch();
    for (var n in _notifications) {
      batch.delete(FirebaseFirestore.instance.collection('thongBao').doc(n.id));
    }
    await batch.commit();
  }
}
