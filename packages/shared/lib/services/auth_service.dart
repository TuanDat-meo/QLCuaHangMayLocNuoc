// Flutter Auth Service
// Shared between customer_app and technician_app

import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

enum UserRole { customer, technician, admin }

class AuthUser {
  final String uid;
  final String email;
  final String displayName;
  final String phoneNumber;
  final UserRole role;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? avatar;
  final bool isVerified;

  AuthUser({
    required this.uid,
    required this.email,
    required this.displayName,
    required this.phoneNumber,
    required this.role,
    required this.createdAt,
    required this.updatedAt,
    this.avatar,
    required this.isVerified,
  });

  factory AuthUser.fromFirestore(DocumentSnapshot doc, User firebaseUser) {
    final data = doc.data() as Map<String, dynamic>;
    return AuthUser(
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? '',
      displayName: firebaseUser.displayName ?? data['displayName'] ?? '',
      phoneNumber: firebaseUser.phoneNumber ?? data['phoneNumber'] ?? '',
      role: _parseRole(data['role'] ?? 'customer'),
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ??
          DateTime.parse(firebaseUser.metadata.creationTime.toString()),
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      avatar: firebaseUser.photoURL ?? data['avatar'],
      isVerified: firebaseUser.emailVerified,
    );
  }

  static UserRole _parseRole(String role) {
    return UserRole.values.firstWhere(
      (e) => e.toString().split('.').last == role,
      orElse: () => UserRole.customer,
    );
  }
}

class AuthException implements Exception {
  final String message;
  final String? code;

  AuthException(this.message, {this.code});

  @override
  String toString() => message;
}

class AuthService {
  static final AuthService _instance = AuthService._internal();
  final _auth = FirebaseAuth.instance;
  final _firestore = FirebaseFirestore.instance;

  factory AuthService() {
    return _instance;
  }

  AuthService._internal();

  /// Get current user stream
  Stream<AuthUser?> get currentUserStream {
    return _auth.authStateChanges().asyncMap((firebaseUser) async {
      if (firebaseUser == null) return null;

      try {
        final userDoc = await _firestore
            .collection('nguoiDung')
            .doc(firebaseUser.uid)
            .get();

        if (userDoc.exists) {
          return AuthUser.fromFirestore(userDoc, firebaseUser);
        } else {
          return null;
        }
      } catch (e) {
        return null;
      }
    });
  }

  /// Get current user (one-time)
  Future<AuthUser?> getCurrentUser() async {
    try {
      final firebaseUser = _auth.currentUser;
      if (firebaseUser == null) return null;

      final userDoc = await _firestore
          .collection('nguoiDung')
          .doc(firebaseUser.uid)
          .get();

      if (userDoc.exists) {
        return AuthUser.fromFirestore(userDoc, firebaseUser);
      }
      return null;
    } catch (e) {
      throw AuthException('Lỗi lấy thông tin người dùng: $e');
    }
  }

  /// Login with email and password
  Future<AuthUser> loginWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      final authUser = await getCurrentUser();
      if (authUser == null) {
        throw AuthException('Không thể lấy thông tin người dùng');
      }

      // Log login history
      await _logLoginHistory(authUser.uid, email, 'success');

      return authUser;
    } on FirebaseAuthException catch (e) {
      await _logLoginHistory('unknown', email, 'failed');

      String message;
      switch (e.code) {
        case 'user-not-found':
          message = 'Email không tồn tại trong hệ thống';
          break;
        case 'wrong-password':
          message = 'Mật khẩu không chính xác';
          break;
        case 'too-many-requests':
          message = 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau.';
          break;
        case 'user-disabled':
          message = 'Tài khoản này đã bị vô hiệu hóa';
          break;
        default:
          message = 'Đăng nhập thất bại: ${e.message}';
      }
      throw AuthException(message, code: e.code);
    }
  }

  /// Signup with email and password
  Future<AuthUser> signupWithEmail({
    required String email,
    required String password,
    required String displayName,
    required String phoneNumber,
    required String role,
  }) async {
    try {
      final userCredential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      // Update profile
      await userCredential.user!.updateDisplayName(displayName);

      // Save to Firestore
      await _firestore.collection('nguoiDung').doc(userCredential.user!.uid).set({
        'uid': userCredential.user!.uid,
        'email': email,
        'displayName': displayName,
        'phoneNumber': phoneNumber,
        'role': role,
        'avatar': null,
        'isVerified': false,
        'createdAt': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
      });

      // Log signup history
      await _logSignupHistory(userCredential.user!.uid, email, role);

      return await getCurrentUser() ??
          (throw AuthException('Không thể lấy thông tin người dùng'));
    } on FirebaseAuthException catch (e) {
      String message;
      switch (e.code) {
        case 'email-already-in-use':
          message = 'Email này đã được đăng ký';
          break;
        case 'weak-password':
          message = 'Mật khẩu quá yếu';
          break;
        case 'invalid-email':
          message = 'Email không hợp lệ';
          break;
        default:
          message = 'Đăng ký thất bại: ${e.message}';
      }
      throw AuthException(message, code: e.code);
    }
  }

  /// Send password reset email
  Future<void> sendPasswordReset(String email) async {
    try {
      await _auth.sendPasswordResetEmail(email: email);
    } on FirebaseAuthException catch (e) {
      String message;
      switch (e.code) {
        case 'user-not-found':
          message = 'Email không tồn tại trong hệ thống';
          break;
        default:
          message = 'Không thể gửi email reset: ${e.message}';
      }
      throw AuthException(message, code: e.code);
    }
  }

  /// Confirm password reset
  Future<void> confirmPasswordReset({
    required String code,
    required String newPassword,
  }) async {
    try {
      await _auth.confirmPasswordReset(code: code, newPassword: newPassword);
      await _logPasswordResetHistory('unknown', 'success');
    } on FirebaseAuthException catch (e) {
      await _logPasswordResetHistory('unknown', 'failed');
      String message;
      switch (e.code) {
        case 'invalid-action-code':
          message = 'Mã reset không hợp lệ hoặc đã hết hạn';
          break;
        case 'weak-password':
          message = 'Mật khẩu quá yếu';
          break;
        default:
          message = 'Reset mật khẩu thất bại: ${e.message}';
      }
      throw AuthException(message, code: e.code);
    }
  }

  /// Logout
  Future<void> logout() async {
    try {
      await _auth.signOut();
    } catch (e) {
      throw AuthException('Đăng xuất thất bại: $e');
    }
  }

  /// Log login history
  Future<void> _logLoginHistory(
    String userId,
    String email,
    String status,
  ) async {
    try {
      await _firestore.collection('loginHistory').add({
        'userId': userId,
        'email': email,
        'status': status,
        'timestamp': FieldValue.serverTimestamp(),
        'userAgent': 'Flutter Mobile App',
      });
    } catch (e) {
      // Silently fail - don't affect login process
    }
  }

  /// Log signup history
  Future<void> _logSignupHistory(
    String userId,
    String email,
    String role,
  ) async {
    try {
      await _firestore.collection('signupHistory').add({
        'userId': userId,
        'email': email,
        'role': role,
        'timestamp': FieldValue.serverTimestamp(),
        'userAgent': 'Flutter Mobile App',
      });
    } catch (e) {
      // Silently fail
    }
  }

  /// Log password reset history
  Future<void> _logPasswordResetHistory(
    String email,
    String status,
  ) async {
    try {
      await _firestore.collection('passwordResetHistory').add({
        'email': email,
        'status': status,
        'timestamp': FieldValue.serverTimestamp(),
        'userAgent': 'Flutter Mobile App',
        'method': 'email',
      });
    } catch (e) {
      // Silently fail
    }
  }
}
