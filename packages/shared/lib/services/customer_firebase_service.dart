/// Customer App Firebase Service
/// Extends base service with customer-specific operations

import 'package:cloud_firestore/cloud_firestore.dart' hide Order;
import 'package:firebase_auth/firebase_auth.dart' as fb_auth;
import 'package:shared/constants/app_constants.dart';
import 'firebase_base_service.dart';

class CustomerFirebaseService extends FirebaseBaseService {
  static final CustomerFirebaseService _instance =
      CustomerFirebaseService._internal();

  factory CustomerFirebaseService() {
    return _instance;
  }

  CustomerFirebaseService._internal();

  /// Sign up with email & password (Customer-specific)
  Future<fb_auth.UserCredential> signUp({
    required String email,
    required String password,
    required String displayName,
  }) async {
    try {
      final userCredential = await fb_auth.FirebaseAuth.instance
          .createUserWithEmailAndPassword(
            email: email,
            password: password,
          );

      // Update profile
      await userCredential.user?.updateDisplayName(displayName);

      // Create user profile in Firestore
      await firestore
          .collection(FirestoreCollections.users)
          .doc(userCredential.user!.uid)
          .set({
        'email': email,
        'displayName': displayName,
        'phoneNumber': '',
        'role': UserRole.customer,
        'profileImageUrl': '',
        'createdAt': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
        'isActive': true,
      });

      return userCredential;
    } on fb_auth.FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    }
  }

  /// Create new order
  Future<String> createOrder({
    required String customerId,
    required String machineId,
    required String description,
    required double totalAmount,
  }) async {
    try {
      final docRef = await firestore
          .collection(FirestoreCollections.orders)
          .add({
        'customerId': customerId,
        'machineId': machineId,
        'status': OrderStatus.pending,
        'description': description,
        'totalAmount': totalAmount,
        'createdAt': FieldValue.serverTimestamp(),
        'metadata': {},
      });

      return docRef.id;
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
      case 'email-already-in-use':
        return 'Email đã được sử dụng';
      case 'weak-password':
        return 'Mật khẩu quá yếu';
      case 'invalid-email':
        return 'Email không hợp lệ';
      default:
        return 'Lỗi: ${e.message}';
    }
  }
}
