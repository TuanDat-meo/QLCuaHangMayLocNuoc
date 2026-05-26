import 'package:flutter/material.dart';
import 'package:customer_app/models/order_model.dart';
import 'package:customer_app/services/firestore_service.dart';
import 'package:firebase_auth/firebase_auth.dart';

class OrderController extends ChangeNotifier {
  List<Order> _orders = [];
  List<Order> _filteredOrders = [];
  bool _isLoading = false;
  String? _error;

  List<Order> get orders => _filteredOrders.isEmpty && _orders.isNotEmpty ? _orders : (_filteredOrders.isEmpty ? [] : _filteredOrders);
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadOrders() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await FirestoreService.getUserOrders(user.uid);
      _orders = data.map((map) => Order.fromMap(map)).toList();
      _filteredOrders = [];
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  void filterOrders(String status) {
    if (status == 'Tất cả' || status.isEmpty) {
      _filteredOrders = [];
    } else {
      // Mapping display status to internal status if needed
      _filteredOrders = _orders.where((o) => o.status == status).toList();
    }
    notifyListeners();
  }

  Future<bool> createOrder({
    required List<OrderItem> items,
    required Address deliveryAddress,
    String? notes,
    required double subtotal,
    required double shippingFee,
    required double totalAmount,
  }) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return false;

    _isLoading = true;
    notifyListeners();

    try {
      final orderData = {
        'khachHangId': user.uid,
        'khachHangTen': user.displayName ?? 'Khách hàng',
        'khachHangSdt': '', // Should come from user profile
        'diaChiGiaoHang': deliveryAddress.toMap(),
        'items': items.map((e) => e.toMap()).toList(),
        'subtotal': subtotal,
        'shippingFee': shippingFee,
        'totalAmount': totalAmount,
        'trangThai': 'pending',
        'ghiChu': notes,
      };

      await FirestoreService.createOrder(orderData);
      await loadOrders();
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

  Future<void> cancelOrder(String orderId) async {
    // TODO: Implement cancel order in FirestoreService and call it here
  }
}
