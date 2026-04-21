import 'package:flutter/material.dart';
import 'package:shared/services/auth_service.dart';
import '../core/services/firestore_user_service.dart';

class AuthController extends ChangeNotifier {
  final AuthService _authService = AuthService();
  final FirestoreUserService _firestoreService = FirestoreUserService();

  bool _isLoading = false;
  String? _error;
  AuthUser? _currentUser;

  bool get isLoading => _isLoading;
  String? get error => _error;
  AuthUser? get currentUser => _currentUser;

  /// Login with email and password
  /// Also loads user profile from Firestore
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final user = await _authService.loginWithEmail(
        email: email,
        password: password,
      );
      
      // Load full profile from Firestore
      final profile = await _firestoreService.getUserProfile(user.uid);
      _currentUser = profile ?? user;
      
      _isLoading = false;
      notifyListeners();
      return true;
    } on AuthException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'Lỗi đăng nhập: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Signup new technician (role is always 'technician')
  /// Saves user data to Firestore automatically via AuthService
  Future<bool> signup(
    String email,
    String password,
    String displayName,
    String phoneNumber,
  ) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final user = await _authService.signupWithEmail(
        email: email,
        password: password,
        displayName: displayName,
        phoneNumber: phoneNumber,
        role: 'technician', // Always technician for this app
      );
      
      // User data is already saved to Firestore by AuthService.signupWithEmail()
      _currentUser = user;
      _isLoading = false;
      notifyListeners();
      return true;
    } on AuthException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'Lỗi đăng ký: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Send password reset email
  Future<bool> sendPasswordReset(String email) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _authService.sendPasswordReset(email);
      _isLoading = false;
      notifyListeners();
      return true;
    } on AuthException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Reset password with code
  Future<bool> resetPassword(String code, String newPassword) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _authService.confirmPasswordReset(
        code: code,
        newPassword: newPassword,
      );
      _isLoading = false;
      notifyListeners();
      return true;
    } on AuthException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Logout
  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      await _authService.logout();
      _currentUser = null;
      _error = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  /// Update user profile in Firestore
  Future<bool> updateProfile(Map<String, dynamic> updates) async {
    if (_currentUser == null) {
      _error = 'Không có người dùng đang đăng nhập';
      return false;
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _firestoreService.updateUserProfile(_currentUser!.uid, updates);
      
      // Reload user profile
      final updatedProfile = await _firestoreService.getUserProfile(_currentUser!.uid);
      if (updatedProfile != null) {
        _currentUser = updatedProfile;
      }
      
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Lỗi cập nhật hồ sơ: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Update technician specialization
  Future<bool> updateSpecialization(List<String> specializations) async {
    if (_currentUser == null) {
      _error = 'Không có người dùng đang đăng nhập';
      return false;
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _firestoreService.updateSpecialization(
        _currentUser!.uid,
        specializations,
      );
      
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Lỗi cập nhật chuyên môn: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Update availability status
  Future<bool> updateAvailability(bool isAvailable) async {
    if (_currentUser == null) {
      _error = 'Không có người dùng đang đăng nhập';
      return false;
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _firestoreService.updateAvailabilityStatus(
        _currentUser!.uid,
        isAvailable,
      );
      
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Lỗi cập nhật trạng thái: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
}

