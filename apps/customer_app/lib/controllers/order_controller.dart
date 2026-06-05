// lib/controllers/order_controller.dart

import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart' hide Order;
import 'package:firebase_auth/firebase_auth.dart';
import 'package:customer_app/models/order_model.dart';

class OrderController extends ChangeNotifier {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  bool _isLoading = false;
  String? _error;
  Order? _currentOrder;
  List<Order> _orders = [];

  bool get isLoading => _isLoading;
  String? get error => _error;
  Order? get currentOrder => _currentOrder;
  List<Order> get orders => _orders;

  Future<bool> createOrder({
    required List<OrderItem> items,
    required Address deliveryAddress,
    required DateTime scheduledDate,
    required ScheduleSlot scheduledSlot,
    String? notes,
    required double subtotal,
    required double discount,
    required double shippingFee,
    required double totalAmount,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final user = _auth.currentUser;
      if (user == null) throw Exception('Chưa đăng nhập');

      final orderCode =
          'ORD-${DateTime.now().year}-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';

      final orderRef = _firestore.collection('donHang').doc(); // ✅ đổi

      final orderData = {
        'id': orderRef.id,
        'orderCode': orderCode,
        'customerId': user.uid,
        'customerName': user.displayName ?? '',
        'customerEmail': user.email ?? '',
        'items': items.map((e) => e.toMap()).toList(),
        'deliveryAddress': deliveryAddress.toMap(),
        'scheduledDate': Timestamp.fromDate(scheduledDate),
        'scheduledSlotId': scheduledSlot.id,
        'scheduledSlotLabel': scheduledSlot.label,
        'notes': notes ?? '',
        'subtotal': subtotal,
        'discount': discount,
        'shippingFee': shippingFee,
        'totalAmount': totalAmount,
        'status': 'pending',
        'technicianId': null,
        'technicianName': null,
        'technicianPhone': null,
        'createdAt': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
      };

      await orderRef.set(orderData);

      _currentOrder = Order(
        id: orderRef.id,
        orderCode: orderCode,
        items: items,
        deliveryAddress: deliveryAddress,
        scheduledDate: scheduledDate,
        scheduledSlot: scheduledSlot,
        notes: notes,
        subtotal: subtotal,
        discount: discount,
        shippingFee: shippingFee,
        totalAmount: totalAmount,
        status: 'pending',
        createdAt: DateTime.now(),
      );

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

  Stream<Map<String, dynamic>?> watchOrder(String orderId) {
    return _firestore
        .collection('donHang') // ✅ đổi
        .doc(orderId)
        .snapshots()
        .map((snap) => snap.data());
  }

Future<void> fetchMyOrders() async {
  _isLoading = true;
  notifyListeners();

  try {
    final user = _auth.currentUser;
    if (user == null) return;

    final snap = await _firestore
        .collection('donHang')
        .where('customerId', isEqualTo: user.uid)
        .orderBy('createdAt', descending: true)
        .get();

    _orders = snap.docs.map((doc) {
      final d = doc.data();
      return Order(
        id: doc.id,
        orderCode: d['orderCode'] ?? '',
        items: (d['items'] as List? ?? [])
            .map((e) => OrderItem(
                  id: e['id'] ?? '',
                  productId: e['productId'] ?? '',
                  productName: e['productName'] ?? '',
                  price: (e['price'] as num).toDouble(),
                  quantity: e['quantity'] as int,
                  subtotal: (e['subtotal'] as num).toDouble(),
                  imageUrl: e['imageUrl'],
                ))
            .toList(),
        deliveryAddress: Address.fromMap(d['deliveryAddress']),
        scheduledDate: (d['scheduledDate'] as Timestamp).toDate(),
        scheduledSlot: ScheduleSlot(
          id: d['scheduledSlotId'] ?? '',
          label: d['scheduledSlotLabel'] ?? '',
          startHour: 0,
          endHour: 0,
        ),
        notes: d['notes'],
        subtotal: (d['subtotal'] as num).toDouble(),
        discount: (d['discount'] as num).toDouble(),
        shippingFee: (d['shippingFee'] as num).toDouble(),
        totalAmount: (d['totalAmount'] as num).toDouble(),
        status: d['status'] ?? 'pending',
        technicianId: d['technicianId'],
        technicianName: d['technicianName'],
        technicianPhone: d['technicianPhone'],
        createdAt: (d['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      );
    }).toList();

    _isLoading = false;
    notifyListeners();
  } catch (e) {
    _error = e.toString();
    _isLoading = false;
    notifyListeners();
  }
}

  void setCurrentOrder(Order order) {
    _currentOrder = order;
    notifyListeners();
  }
}