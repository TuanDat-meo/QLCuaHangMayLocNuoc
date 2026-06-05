import 'dart:io';
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:image_picker/image_picker.dart';
import '../core/services/firestore_user_service.dart';
import '../core/services/image_upload_service.dart';
import '../models/auth_models.dart';

enum ProfileUpdateStatus { idle, loading, success, error }

class ProfileController extends ChangeNotifier {
  final FirestoreUserService _firestoreService = FirestoreUserService();
  final ImagePicker _picker = ImagePicker();

  ProfileUpdateStatus _avatarStatus = ProfileUpdateStatus.idle;
  ProfileUpdateStatus _infoStatus = ProfileUpdateStatus.idle;
  ProfileUpdateStatus _passwordStatus = ProfileUpdateStatus.idle;

  String? _error;
  String? _successMessage;

  // Local avatar preview (before upload completes)
  XFile? _pendingAvatarFile;

  ProfileUpdateStatus get avatarStatus => _avatarStatus;
  ProfileUpdateStatus get infoStatus => _infoStatus;
  ProfileUpdateStatus get passwordStatus => _passwordStatus;
  String? get error => _error;
  String? get successMessage => _successMessage;
  XFile? get pendingAvatarFile => _pendingAvatarFile;

  bool get isAvatarLoading => _avatarStatus == ProfileUpdateStatus.loading;
  bool get isInfoLoading => _infoStatus == ProfileUpdateStatus.loading;
  bool get isPasswordLoading => _passwordStatus == ProfileUpdateStatus.loading;

  void clearMessages() {
    _error = null;
    _successMessage = null;
    notifyListeners();
  }

  // ─── Avatar ─────────────────────────────────────────────────────────────────

  /// Mở picker và upload ảnh đại diện lên Cloudinary
  Future<String?> pickAndUploadAvatar({
    required ImageSource source,
    required String uid,
    required Function(AuthUser updatedUser) onSuccess,
  }) async {
    try {
      final XFile? file = await _picker.pickImage(
        source: source,
        imageQuality: 85,
        maxWidth: 512,
        maxHeight: 512,
      );
      if (file == null) return null;

      _pendingAvatarFile = file;
      _avatarStatus = ProfileUpdateStatus.loading;
      _error = null;
      notifyListeners();

      // Upload lên Cloudinary
      final downloadUrl = await ImageUploadService.uploadSingle(
        file: file,
        jobId: uid,
        folder: 'avatars',
      );

      if (downloadUrl == null) {
        throw Exception('Không nhận được liên kết tải ảnh từ Cloudinary');
      }

      // Update Firestore
      await _firestoreService.updateUserProfile(uid, {'avatar': downloadUrl});

      // Update Firebase Auth display photo
      await FirebaseAuth.instance.currentUser?.updatePhotoURL(downloadUrl);

      // Fetch updated profile & notify parent
      final updatedUser = await _firestoreService.getUserProfile(uid);
      if (updatedUser != null) onSuccess(updatedUser);

      _pendingAvatarFile = null;
      _avatarStatus = ProfileUpdateStatus.success;
      _successMessage = 'Cập nhật ảnh đại diện thành công!';
      notifyListeners();
      return downloadUrl;
    } catch (e) {
      _pendingAvatarFile = null;
      _avatarStatus = ProfileUpdateStatus.error;
      _error = 'Không thể cập nhật ảnh: $e';
      notifyListeners();
      return null;
    }
  }

  /// Xóa ảnh đại diện
  Future<void> removeAvatar({
    required String uid,
    required Function(AuthUser updatedUser) onSuccess,
  }) async {
    try {
      _avatarStatus = ProfileUpdateStatus.loading;
      _error = null;
      notifyListeners();

      // Clear Firestore field
      await _firestoreService.updateUserProfile(uid, {'avatar': null});
      await FirebaseAuth.instance.currentUser?.updatePhotoURL(null);

      final updatedUser = await _firestoreService.getUserProfile(uid);
      if (updatedUser != null) onSuccess(updatedUser);

      _avatarStatus = ProfileUpdateStatus.success;
      _successMessage = 'Đã xóa ảnh đại diện.';
      notifyListeners();
    } catch (e) {
      _avatarStatus = ProfileUpdateStatus.error;
      _error = 'Không thể xóa ảnh: $e';
      notifyListeners();
    }
  }

  // ─── Personal Info ───────────────────────────────────────────────────────────

  /// Cập nhật thông tin cá nhân (displayName, phoneNumber, address)
  Future<bool> updatePersonalInfo({
    required String uid,
    required String displayName,
    required String phoneNumber,
    String? address,
    required Function(AuthUser updatedUser) onSuccess,
  }) async {
    _infoStatus = ProfileUpdateStatus.loading;
    _error = null;
    notifyListeners();

    try {
      final updateData = <String, dynamic>{
        'displayName': displayName,
        'phoneNumber': phoneNumber,
        if (address != null) 'address': address,
      };

      await _firestoreService.updateUserProfile(uid, updateData);

      // Also update Firebase Auth displayName
      await FirebaseAuth.instance.currentUser?.updateDisplayName(displayName);

      final updatedUser = await _firestoreService.getUserProfile(uid);
      if (updatedUser != null) onSuccess(updatedUser);

      _infoStatus = ProfileUpdateStatus.success;
      _successMessage = 'Cập nhật thông tin thành công!';
      notifyListeners();
      return true;
    } catch (e) {
      _infoStatus = ProfileUpdateStatus.error;
      _error = 'Cập nhật thất bại: $e';
      notifyListeners();
      return false;
    }
  }

  // ─── Specializations ─────────────────────────────────────────────────────────

  /// Cập nhật danh sách chuyên môn
  Future<bool> updateSpecializations({
    required String uid,
    required List<String> specializations,
    required Function(AuthUser updatedUser) onSuccess,
  }) async {
    _infoStatus = ProfileUpdateStatus.loading;
    _error = null;
    notifyListeners();

    try {
      await _firestoreService.updateSpecialization(uid, specializations);

      final updatedUser = await _firestoreService.getUserProfile(uid);
      if (updatedUser != null) onSuccess(updatedUser);

      _infoStatus = ProfileUpdateStatus.success;
      _successMessage = 'Cập nhật chuyên môn thành công!';
      notifyListeners();
      return true;
    } catch (e) {
      _infoStatus = ProfileUpdateStatus.error;
      _error = 'Cập nhật chuyên môn thất bại: $e';
      notifyListeners();
      return false;
    }
  }

  // ─── Password ────────────────────────────────────────────────────────────────

  /// Đổi mật khẩu: xác thực mật khẩu cũ trước, sau đó cập nhật
  Future<bool> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    _passwordStatus = ProfileUpdateStatus.loading;
    _error = null;
    notifyListeners();

    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user == null || user.email == null) throw Exception('Chưa đăng nhập');

      // Re-authenticate
      final credential = EmailAuthProvider.credential(
        email: user.email!,
        password: currentPassword,
      );
      await user.reauthenticateWithCredential(credential);

      // Update password
      await user.updatePassword(newPassword);

      _passwordStatus = ProfileUpdateStatus.success;
      _successMessage = 'Đổi mật khẩu thành công!';
      notifyListeners();
      return true;
    } on FirebaseAuthException catch (e) {
      _passwordStatus = ProfileUpdateStatus.error;
      _error = _mapAuthError(e.code);
      notifyListeners();
      return false;
    } catch (e) {
      _passwordStatus = ProfileUpdateStatus.error;
      _error = 'Lỗi đổi mật khẩu: $e';
      notifyListeners();
      return false;
    }
  }

  String _mapAuthError(String code) {
    switch (code) {
      case 'wrong-password':
        return 'Mật khẩu hiện tại không đúng';
      case 'weak-password':
        return 'Mật khẩu mới quá yếu (tối thiểu 6 ký tự)';
      case 'requires-recent-login':
        return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng xuất và đăng nhập lại';
      case 'too-many-requests':
        return 'Quá nhiều lần thử. Vui lòng thử lại sau';
      default:
        return 'Lỗi xác thực: $code';
    }
  }
}
