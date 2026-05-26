import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:logger/logger.dart';

final logger = Logger();

class FirestoreService {
  static final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // ============ CATEGORIES ============
  static Future<List<Map<String, dynamic>>> getCategories() async {
    try {
      QuerySnapshot snapshot = await _firestore.collection('categories').get();
      return snapshot.docs.map((doc) => doc.data() as Map<String, dynamic>).toList();
    } catch (e) {
      logger.e('Error fetching categories: $e');
      rethrow;
    }
  }

  // ============ PRODUCTS ============
  static Future<List<Map<String, dynamic>>> getProducts() async {
    try {
      QuerySnapshot snapshot = await _firestore
          .collection('sanPham')
          .where('trangThai', isEqualTo: 'active')
          .get();
      return snapshot.docs.map((doc) => doc.data() as Map<String, dynamic>).toList();
    } catch (e) {
      logger.e('Error fetching products: $e');
      rethrow;
    }
  }

  static Future<Map<String, dynamic>?> getProductById(String productId) async {
    try {
      DocumentSnapshot doc = await _firestore.collection('sanPham').doc(productId).get();
      return doc.data() as Map<String, dynamic>?;
    } catch (e) {
      logger.e('Error fetching product: $e');
      rethrow;
    }
  }

  // ============ USERS ============
  static Future<Map<String, dynamic>?> getUserData(String uid) async {
    try {
      DocumentSnapshot doc = await _firestore.collection('nguoiDung').doc(uid).get();
      return doc.data() as Map<String, dynamic>?;
    } catch (e) {
      logger.e('Error fetching user data: $e');
      rethrow;
    }
  }

  static Future<void> updateUserData(String uid, Map<String, dynamic> data) async {
    try {
      await _firestore.collection('nguoiDung').doc(uid).update({
        ...data,
        'updated_at': FieldValue.serverTimestamp(),
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
      return snapshot.docs.map((doc) => doc.data() as Map<String, dynamic>).toList();
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

  // ============ STREAM (Real-time) ============
  static Stream<List<Map<String, dynamic>>> watchUserOrders(String userId) {
    return _firestore
        .collection('donHang')
        .where('khachHangId', isEqualTo: userId)
        .orderBy('created_at', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs.map((doc) => doc.data()).cast<Map<String, dynamic>>().toList());
  }

  static Stream<Map<String, dynamic>?> watchProductById(String productId) {
    return _firestore
        .collection('sanPham')
        .doc(productId)
        .snapshots()
        .map((doc) => doc.data());
  }
}
