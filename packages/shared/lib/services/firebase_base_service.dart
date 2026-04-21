/// Base Firebase Service
/// Shared Firebase operations across all apps

import 'package:cloud_firestore/cloud_firestore.dart' hide Order;
import 'package:firebase_auth/firebase_auth.dart' as fb_auth;
import 'package:shared/models/user.dart';
import 'package:shared/models/order.dart';
import 'package:shared/constants/app_constants.dart';

abstract class FirebaseBaseService {
  final fb_auth.FirebaseAuth _auth = fb_auth.FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Getters
  fb_auth.User? get currentUser => _auth.currentUser;
  String? get currentUid => _auth.currentUser?.uid;

  /// Sign in with email & password
  Future<fb_auth.UserCredential> signIn({
    required String email,
    required String password,
  }) async {
    try {
      return await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
    } on fb_auth.FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    }
  }

  /// Sign out
  Future<void> signOut() async {
    await _auth.signOut();
  }

  /// Get user profile by UID
  Future<User?> getUserProfile(String uid) async {
    try {
      final doc = await _firestore
          .collection(FirestoreCollections.users)
          .doc(uid)
          .get();

      if (doc.exists) {
        return User.fromMap(doc.data()!, uid);
      }
      return null;
    } catch (e) {
      // TODO: Implement proper logging
      return null;
    }
  }

  /// Update user profile
  Future<void> updateUserProfile({
    required String uid,
    required Map<String, dynamic> data,
  }) async {
    try {
      data['updatedAt'] = FieldValue.serverTimestamp();
      await _firestore
          .collection(FirestoreCollections.users)
          .doc(uid)
          .update(data);
    } catch (e) {
      // TODO: Implement proper logging
      rethrow;
    }
  }

  /// Get orders by customer ID
  Future<List<Order>> getOrdersByCustomer(String customerId) async {
    try {
      final snapshot = await _firestore
          .collection(FirestoreCollections.orders)
          .where('customerId', isEqualTo: customerId)
          .orderBy('createdAt', descending: true)
          .get();

      return snapshot.docs
          .map((doc) => Order.fromMap(doc.data(), doc.id))
          .toList();
    } catch (e) {
      // TODO: Implement proper logging
      return [];
    }
  }

  /// Stream of orders by customer ID (real-time updates)
  Stream<List<Order>> streamOrdersByCustomer(String customerId) {
    return _firestore
        .collection(FirestoreCollections.orders)
        .where('customerId', isEqualTo: customerId)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => Order.fromMap(doc.data(), doc.id))
            .toList());
  }

  /// Update order status
  Future<void> updateOrderStatus(String orderId, String newStatus) async {
    try {
      await _firestore
          .collection(FirestoreCollections.orders)
          .doc(orderId)
          .update({
        'status': newStatus,
        'updatedAt': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      // TODO: Implement proper logging
      rethrow;
    }
  }

  /// Handle Firebase Auth exceptions
  String _handleAuthException(fb_auth.FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
        return 'Email không tồn tại';
      case 'wrong-password':
        return 'Mật khẩu không đúng';
      case 'invalid-email':
        return 'Email không hợp lệ';
      default:
        return 'Lỗi: ${e.message}';
    }
  }

  // Protected getter for Firestore instance
  FirebaseFirestore get firestore => _firestore;
}
