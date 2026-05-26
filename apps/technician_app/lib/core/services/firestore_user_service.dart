/// Firestore User Service for Technician App
/// Handles user profile operations (read, update, delete)
library;
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:shared/services/auth_service.dart';

class FirestoreUserService {
  static final FirestoreUserService _instance =
      FirestoreUserService._internal();
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  factory FirestoreUserService() {
    return _instance;
  }

  FirestoreUserService._internal();

  /// Get user profile from Firestore
  Future<AuthUser?> getUserProfile(String uid) async {
    try {
      final userDoc = await _firestore.collection('nguoiDung').doc(uid).get();

      if (userDoc.exists) {
        final data = userDoc.data() as Map<String, dynamic>;
        return _authUserFromFirestore(uid, data);
      }
      return null;
    } catch (e) {
      throw Exception('Lỗi lấy hồ sơ người dùng: $e');
    }
  }

  /// Update user profile in Firestore
  Future<void> updateUserProfile(String uid, Map<String, dynamic> data) async {
    try {
      data['updatedAt'] = FieldValue.serverTimestamp();

      await _firestore
          .collection('nguoiDung')
          .doc(uid)
          .update(data);
    } catch (e) {
      throw Exception('Lỗi cập nhật hồ sơ: $e');
    }
  }

  /// Update technician specialization
  Future<void> updateSpecialization(String uid, List<String> specializations) async {
    try {
      await updateUserProfile(uid, {
        'specializations': specializations,
      });
    } catch (e) {
      throw Exception('Lỗi cập nhật chuyên môn: $e');
    }
  }

  /// Update technician availability status
  Future<void> updateAvailabilityStatus(String uid, bool isAvailable) async {
    try {
      await updateUserProfile(uid, {
        'isAvailable': isAvailable,
        'lastStatusUpdate': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      throw Exception('Lỗi cập nhật trạng thái: $e');
    }
  }

  /// Get all technicians (for admin/customer reference)
  Future<List<AuthUser>> getAllTechnicians() async {
    try {
      final querySnapshot = await _firestore
          .collection('nguoiDung')
          .where('role', isEqualTo: UserRoles.technician)
          .get();

      return querySnapshot.docs.map((doc) {
        final data = doc.data();
        return _authUserFromFirestore(doc.id, data);
      }).toList();
    } catch (e) {
      throw Exception('Lỗi lấy danh sách kỹ thuật viên: $e');
    }
  }

  /// Delete user data
  Future<void> deleteUserData(String uid) async {
    try {
      await _firestore.collection('nguoiDung').doc(uid).delete();
    } catch (e) {
      throw Exception('Lỗi xóa dữ liệu: $e');
    }
  }

  /// Helper method to construct AuthUser from Firestore document
  AuthUser _authUserFromFirestore(String uid, Map<String, dynamic> data) {
    return AuthUser(
      uid: uid,
      email: data['email'] ?? '',
      displayName: data['displayName'] ?? '',
      phoneNumber: data['phoneNumber'] ?? '',
      role: data['role'] ?? UserRoles.technician,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      avatar: data['avatar'],
      isVerified: data['status'] == 'active',
      status: data['status'] ?? 'pending',
    );
  }
}
