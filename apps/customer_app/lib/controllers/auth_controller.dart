import 'package:flutter/material.dart';
import 'package:shared/services/auth_service.dart';
import 'package:customer_app/models/user_model.dart';
import 'package:customer_app/services/firestore_service.dart';
import 'package:firebase_auth/firebase_auth.dart';

class AuthController extends ChangeNotifier {
  final AuthService _authService = AuthService();

  bool _isLoading = false;
  String? _error;
  AuthUser? _currentUser;
  CustomerUser? _customerUser;

  bool get isLoading => _isLoading;
  String? get error => _error;
  AuthUser? get currentUser => _currentUser;
  CustomerUser? get customerUser => _customerUser;

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final user = await _authService.loginWithEmail(
        email: email,
        password: password,
      );
      _currentUser = user;
      await loadUserProfile();
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

  Future<void> loadUserProfile() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    
    try {
      final data = await FirestoreService.getUserData(user.uid);
      if (data != null) {
        _customerUser = CustomerUser.fromMap(data);
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error loading customer profile: $e');
    }
  }

  Future<bool> updateProfile({required String displayName, required String phoneNumber}) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return false;

    _isLoading = true;
    notifyListeners();

    try {
      await FirestoreService.updateUserData(user.uid, {
        'displayName': displayName,
        'phoneNumber': phoneNumber,
      });
      await user.updateDisplayName(displayName);
      await loadUserProfile();
      
      // Update local AuthUser if needed
      if (_currentUser != null) {
        _currentUser = AuthUser(
          uid: _currentUser!.uid,
          email: _currentUser!.email,
          displayName: displayName,
          phoneNumber: phoneNumber,
          role: _currentUser!.role,
          createdAt: _currentUser!.createdAt,
          updatedAt: DateTime.now(),
          isVerified: _currentUser!.isVerified,
          status: _currentUser!.status,
          avatar: _currentUser!.avatar,
        );
      }
      
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> signup(String email, String password, String displayName, String phoneNumber) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _authService.signupWithEmail(
        email: email,
        password: password,
        displayName: displayName,
        phoneNumber: phoneNumber,
        role: UserRoles.customer,
        source: 'customer_app',
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

  Future<bool> resetPassword(String code, String newPassword) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _authService.resetPassword(code, newPassword);
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

  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      await _authService.logout();
      _currentUser = null;
      _customerUser = null;
      _error = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
