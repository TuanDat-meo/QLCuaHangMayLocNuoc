import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:logger/logger.dart';

final logger = Logger();

class FirestoreService {
  static final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // ============ PRODUCTS ============
  static Future<List<Map<String, dynamic>>> getProducts() async {
    try {
      QuerySnapshot snapshot = await _firestore
          .collection('sanPham')
          .where('trangThai', isEqualTo: 'active')
          .get();
      return snapshot.docs.map((doc) {
        final data = doc.data() as Map<String, dynamic>;
        data['id'] = doc.id;
        return data;
      }).toList();
    } catch (e) {
      logger.e('Error fetching products: $e');
      rethrow;
    }
  }

  // ============ USERS ============
  static Future<Map<String, dynamic>?> getUserData(String uid) async {
    try {
      DocumentSnapshot doc = await _firestore.collection('nguoiDung').doc(uid).get();
      if (!doc.exists) return null;
      final data = doc.data() as Map<String, dynamic>;
      data['uid'] = doc.id;
      return data;
    } catch (e) {
      logger.e('Error fetching user data: $e');
      rethrow;
    }
  }

  static Future<void> updateUserData(String uid, Map<String, dynamic> data) async {
    try {
      await _firestore.collection('nguoiDung').doc(uid).update({
        ...data,
        'updatedAt': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      logger.e('Error updating user data: $e');
      rethrow;
    }
  }

  // ============ ORDERS ============
  static Future<List<Map<String, dynamic>>> getUserOrders(String userId) async {
    try {
      QuerySnapshot snapshot = await _firestore
          .collection('donHang')
          .where('khachHangId', isEqualTo: userId)
          .orderBy('created_at', descending: true)
          .get();
      return snapshot.docs.map((doc) {
        final data = doc.data() as Map<String, dynamic>;
        data['id'] = doc.id;
        return data;
      }).toList();
    } catch (e) {
      logger.e('Error fetching user orders: $e');
      rethrow;
    }
  }

  static Future<void> createOrder(Map<String, dynamic> orderData) async {
    try {
      await _firestore.collection('donHang').add({
        ...orderData,
        'created_at': FieldValue.serverTimestamp(),
        'updated_at': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      logger.e('Error creating order: $e');
      rethrow;
    }
  }

  // ============ NOTIFICATIONS ============
  static Future<List<Map<String, dynamic>>> getNotifications(String userId) async {
    try {
      QuerySnapshot snapshot = await _firestore
          .collection('thongBao')
          .where('userId', isEqualTo: userId)
          .orderBy('createdAt', descending: true)
          .get();
      return snapshot.docs.map((doc) {
        final data = doc.data() as Map<String, dynamic>;
        data['id'] = doc.id;
        return data;
      }).toList();
    } catch (e) {
      logger.e('Error fetching notifications: $e');
      rethrow;
    }
  }

  static Future<void> markNotificationRead(String notificationId) async {
    await _firestore.collection('thongBao').doc(notificationId).update({
      'isRead': true,
      'readAt': FieldValue.serverTimestamp(),
    });
  }

  static Future<void> deleteNotification(String notificationId) async {
    await _firestore.collection('thongBao').doc(notificationId).delete();
  }
}
