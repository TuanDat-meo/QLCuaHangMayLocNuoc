import 'package:flutter/material.dart';
import 'package:shared/services/auth_service.dart';
import 'package:customer_app/models/user_model.dart';
import 'package:customer_app/models/order_model.dart';
import 'package:customer_app/services/firestore_service.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:uuid/uuid.dart';

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
        'name': displayName,
        'phone': phoneNumber,
      });
      await user.updateDisplayName(displayName);
      await loadUserProfile();
      
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

  // Address Management
  Future<bool> addAddress(Address address, bool isDefault) async {
    if (_customerUser == null) return false;
    
    _isLoading = true;
    notifyListeners();

    try {
      final List<Address> updatedAddresses = List.from(_customerUser!.addresses);
      final newAddressWithId = Address(
        id: const Uuid().v4(),
        recipientName: address.recipientName,
        phoneNumber: address.phoneNumber,
        street: address.street,
        ward: address.ward,
        district: address.district,
        city: address.city,
        provinceCode: address.provinceCode,
        districtCode: address.districtCode,
        wardCode: address.wardCode,
        type: address.type,
      );
      
      updatedAddresses.add(newAddressWithId);
      
      Map<String, dynamic> updateData = {
        'addresses': updatedAddresses.map((a) => a.toMap()).toList(),
      };

      if (isDefault || _customerUser!.defaultAddress == null) {
        updateData['defaultAddress'] = newAddressWithId.toMap();
      }

      await FirestoreService.updateUserData(_customerUser!.uid, updateData);
      await loadUserProfile();
      
      _isLoading = false;
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateAddress(Address updatedAddress) async {
    if (_customerUser == null) return false;

    _isLoading = true;
    notifyListeners();

    try {
      final List<Address> updatedAddresses = _customerUser!.addresses.map((a) {
        return a.id == updatedAddress.id ? updatedAddress : a;
      }).toList();

      Map<String, dynamic> updateData = {
        'addresses': updatedAddresses.map((a) => a.toMap()).toList(),
      };

      if (_customerUser!.defaultAddress?.id == updatedAddress.id) {
        updateData['defaultAddress'] = updatedAddress.toMap();
      }

      await FirestoreService.updateUserData(_customerUser!.uid, updateData);
      await loadUserProfile();
      
      _isLoading = false;
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteAddress(String addressId) async {
    if (_customerUser == null) return false;

    try {
      final List<Address> updatedAddresses = _customerUser!.addresses
          .where((a) => a.id != addressId)
          .toList();
      
      Map<String, dynamic> updateData = {
        'addresses': updatedAddresses.map((a) => a.toMap()).toList(),
      };

      // If deleted address was default, pick another one or set null
      if (_customerUser!.defaultAddress?.id == addressId) {
        updateData['defaultAddress'] = updatedAddresses.isNotEmpty 
            ? updatedAddresses.first.toMap() 
            : null;
      }

      await FirestoreService.updateUserData(_customerUser!.uid, updateData);
      await loadUserProfile();
      return true;
    } catch (e) {
      _error = e.toString();
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
