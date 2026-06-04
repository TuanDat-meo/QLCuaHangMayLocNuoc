// Flutter Auth Service
// Shared between customer_app and technician_app - Numeric Role Version

import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'dart:developer' as dev;

// Numeric Role Definitions
// 1: Admin, 2: Manager, 3: Staff, 4: Technician, 5: Customer, 0: Pending
class UserRoles {
  static const int admin = 1;
  static const int manager = 2;
  static const int staff = 3;
  static const int technician = 4;
  static const int customer = 5;
  static const int pending = 0;
}

class AuthUser {
  final String uid;
  final String email;
  final String displayName;
  final String phoneNumber;
  final int role;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? avatar;
  final bool isVerified;
  final String status;
  final String? source;
  final String? address;
  final List<String>? specializations;

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
    required this.status,
    this.source,
    this.address,
    this.specializations,
  });

  AuthUser copyWith({
    String? uid,
    String? email,
    String? displayName,
    String? phoneNumber,
    int? role,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? avatar,
    bool? isVerified,
    String? status,
    String? source,
    String? address,
    List<String>? specializations,
  }) {
    return AuthUser(
      uid: uid ?? this.uid,
      email: email ?? this.email,
      displayName: displayName ?? this.displayName,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      role: role ?? this.role,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      avatar: avatar ?? this.avatar,
      isVerified: isVerified ?? this.isVerified,
      status: status ?? this.status,
      source: source ?? this.source,
      address: address ?? this.address,
      specializations: specializations ?? this.specializations,
    );
  }

  factory AuthUser.fromFirestore(DocumentSnapshot doc, User firebaseUser) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    String status = data['status'] ?? 'pending';
    bool verified = (status == 'active');

    return AuthUser(
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? data['email'] ?? '',
      displayName: data['displayName'] ?? firebaseUser.displayName ?? '',
      phoneNumber: data['phoneNumber'] ?? firebaseUser.phoneNumber ?? '',
      role: data['role'] ?? UserRoles.pending,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ??
          DateTime.parse(firebaseUser.metadata.creationTime.toString()),
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      avatar: data['avatar'] ?? firebaseUser.photoURL,
      isVerified: verified,
      status: status,
      source: data['source'],
      address: data['address'],
      specializations: data['specializations'] != null
          ? List<String>.from(data['specializations'])
          : null,
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

  Stream<AuthUser?> get currentUserStream {
    return _auth.authStateChanges().asyncMap((firebaseUser) async {
      if (firebaseUser == null) return null;
      try {
        final userDoc = await _firestore.collection('nguoiDung').doc(firebaseUser.uid).get();
        return userDoc.exists ? AuthUser.fromFirestore(userDoc, firebaseUser) : null;
      } catch (e) {
        return null;
      }
    });
  }

  Future<AuthUser?> getCurrentUser({bool fromServer = false}) async {
    try {
      final firebaseUser = _auth.currentUser;
      if (firebaseUser == null) return null;
      final userDoc = await _firestore
          .collection('nguoiDung')
          .doc(firebaseUser.uid)
          .get(fromServer ? const GetOptions(source: Source.server) : null);
      return userDoc.exists ? AuthUser.fromFirestore(userDoc, firebaseUser) : null;
    } catch (e) {
      return null;
    }
  }

  Future<AuthUser> loginWithEmail({required String email, required String password}) async {
    try {
      await _auth.signInWithEmailAndPassword(email: email, password: password);
      final authUser = await getCurrentUser(fromServer: true);
      if (authUser == null) {
        await _auth.signOut();
        throw AuthException('Tài khoản chưa có dữ liệu trên hệ thống.');
      }
      if (authUser.status != 'active') {
        await _auth.signOut();
        throw AuthException('Tài khoản của bạn đang chờ quản trị viên phê duyệt.');
      }
      return authUser;
    } on FirebaseAuthException catch (e) {
      String message = 'Email hoặc mật khẩu không chính xác.';
      if (e.code == 'user-not-found') message = 'Email này chưa được đăng ký.';
      throw AuthException(message, code: e.code);
    } catch (e) {
      if (e is AuthException) rethrow;
      throw AuthException('Đăng nhập thất bại.');
    }
  }

  Future<void> logout() async {
    await _auth.signOut();
  }

  Future<void> sendPasswordReset(String email) async {
    try {
      final userQuery = await _firestore
          .collection('nguoiDung')
          .where('email', isEqualTo: email)
          .limit(1)
          .get();

      if (userQuery.docs.isEmpty) {
        throw AuthException('Email không tồn tại trong hệ thống.');
      }

      await _auth.sendPasswordResetEmail(email: email);
    } on FirebaseAuthException catch (e) {
      throw AuthException('Không thể gửi mail reset mật khẩu.', code: e.code);
    } catch (e) {
      if (e is AuthException) rethrow;
      throw AuthException('Lỗi hệ thống khi gửi email.');
    }
  }

  Future<void> resetPassword(String code, String newPassword) async {
    try {
      await _auth.confirmPasswordReset(code: code, newPassword: newPassword);
    } on FirebaseAuthException catch (e) {
      String message = 'Mã xác nhận không hợp lệ hoặc đã hết hạn.';
      if (e.code == 'weak-password') message = 'Mật khẩu quá yếu.';
      throw AuthException(message, code: e.code);
    } catch (e) {
      throw AuthException('Không thể đặt lại mật khẩu.');
    }
  }

  Future<AuthUser> signupWithEmail({
    required String email,
    required String password,
    required String displayName,
    required String phoneNumber,
    required int role,
    required String source,
  }) async {
    try {
      final userCredential = await _auth.createUserWithEmailAndPassword(email: email, password: password);
      await userCredential.user!.updateDisplayName(displayName);
      
      final String initialStatus = (source == 'customer_app') ? 'active' : 'pending';
      
      await _firestore.collection('nguoiDung').doc(userCredential.user!.uid).set({
        'uid': userCredential.user!.uid,
        'email': email,
        'displayName': displayName,
        'phoneNumber': phoneNumber,
        'role': role,
        'status': initialStatus,
        'source': source,
        'createdAt': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
      });
      
      if (initialStatus == 'pending') {
        await _auth.signOut();
        throw AuthException('Đăng ký thành công! Vui lòng chờ quản trị viên kích hoạt tài khoản.');
      }
      
      final authUser = await getCurrentUser(fromServer: true);
      return authUser ?? (throw AuthException('Lỗi đồng bộ dữ liệu sau đăng ký.'));
    } on FirebaseAuthException catch (e) {
      throw AuthException(e.code == 'email-already-in-use' ? 'Email đã được sử dụng.' : 'Đăng ký thất bại.', code: e.code);
    } catch (e) {
      if (e is AuthException) rethrow;
      throw AuthException('Lỗi trong quá trình đăng ký.');
    }
  }
}
