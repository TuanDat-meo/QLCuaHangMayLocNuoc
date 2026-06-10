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
  List<Order> _orders = [];

  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Order> get orders => _orders;

  /// Tạo đơn hàng mới - Đồng bộ hoàn toàn với admin_web
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

      final orderRef = _firestore.collection('donHang').doc();
      
      // Tên sản phẩm hiển thị chung
      String tenSanPhamChung = items.map((e) => e.quantity > 1 ? '${e.productName} (x${e.quantity})' : e.productName).join(', ');
      String orderCode = 'ORD-${DateTime.now().year}-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';

      // Map dữ liệu theo cấu trúc TIẾNG VIỆT của admin_web
      final orderData = {
        'id': orderRef.id,
        'orderCode': orderCode,
        'customerId': user.uid,
        'tenKhachHang': user.displayName ?? user.email?.split('@')[0] ?? 'Khách hàng',
        'phoneNumber': deliveryAddress.phoneNumber,
        'diaChiGiaoHang': deliveryAddress.fullAddress,
        'street': deliveryAddress.street,
        // Đồng bộ mã vùng để Web Admin có thể lọc
        'provinceCode': deliveryAddress.provinceCode,
        'districtCode': deliveryAddress.districtCode,
        'wardCode': deliveryAddress.wardCode,
        'tenSanPham': tenSanPhamChung,
        'items': items.map((e) => {
          'id': e.productId,
          'name': e.productName,
          'price': e.price,
          'quantity': e.quantity,
          'imageUrl': e.imageUrl,
          'thoiGianBaoHanh': 12,
        }).toList(),
        'tongTien': totalAmount,
        'trangThai': 'pending',
        'status': 'pending',
        'loaiDonHang': 'installation',
        'note': notes ?? '',
        'ngayTao': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
        'scheduledDate': Timestamp.fromDate(scheduledDate),
        'scheduledSlotLabel': scheduledSlot.label,
        'technicians': [],
        'ngayBaoTriTiepTheo': Timestamp.fromDate(DateTime.now().add(const Duration(days: 180))),
      };

      // 1. Lưu đơn hàng
      await orderRef.set(orderData);

      // 2. Tạo thông báo "Đặt hàng thành công" cho người dùng
      await _firestore.collection('thongBao').add({
        'userId': user.uid,
        'title': 'Đặt hàng thành công!',
        'body': 'Đơn hàng $orderCode của bạn đã được gửi và đang chờ hệ thống xác nhận.',
        'type': 'order_status',
        'data': {
          'orderId': orderRef.id,
          'orderCode': orderCode,
          'status': 'pending',
        },
        'isRead': false,
        'createdAt': FieldValue.serverTimestamp(),
      });

      // 3. Tải lại danh sách đơn hàng ngay lập tức để cập nhật UI lịch sử
      await fetchMyOrders();

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

  Future<void> fetchMyOrders() async {
    _isLoading = true;
    notifyListeners();
    try {
      final user = _auth.currentUser;
      if (user == null) return;

      final snap = await _firestore
          .collection('donHang')
          .where('customerId', isEqualTo: user.uid)
          .get();

      _orders = snap.docs.map((doc) {
        final d = doc.data();
        final itemsList = (d['items'] as List? ?? [])
              .map((e) => OrderItem(
                id: e['id'] ?? '',
                productId: e['id'] ?? '',
                productName: e['name'] ?? '',
                price: (e['price'] as num?)?.toDouble() ?? 0.0,
                quantity: e['quantity'] ?? 1,
                subtotal: ((e['price'] as num? ?? 0) * (e['quantity'] as num? ?? 1)).toDouble(),
                imageUrl: e['imageUrl'],
              )).toList();
              
        final double calculatedTotal = itemsList.fold(0.0, (sum, item) => sum + item.subtotal);

        final double discount = (d['discount'] as num?)?.toDouble() ?? 0.0;
        final double shippingFee = (d['Shipping fee'] ?? d['shippingFee'] as num? ?? 0).toDouble();
        final double finalTotal = calculatedTotal - discount + shippingFee;

        return Order(
          id: doc.id,
          orderCode: d['orderCode'] ?? doc.id.substring(0, 8).toUpperCase(),
          items: itemsList,
          deliveryAddress: Address.fromMap({
            ...(d['deliveryAddress'] as Map<String, dynamic>? ?? {}),
            'recipientName': d['tenKhachHang'] ?? d['customerName'],
            'phoneNumber': d['phoneNumber'],
            'street': d['street'],
            'provinceCode': d['provinceCode'],
            'districtCode': d['districtCode'],
            'wardCode': d['wardCode'],
          }),
          scheduledDate: (d['scheduledDate'] as Timestamp?)?.toDate() ?? DateTime.now(),
          scheduledSlot: ScheduleSlot(
            id: '',
            label: d['scheduledSlotLabel'] ?? '',
            startHour: 0,
            endHour: 0,
          ),
          notes: d['note'] ?? d['notes'],
          subtotal: calculatedTotal,
          discount: discount,
          shippingFee: shippingFee,
          totalAmount: finalTotal,
          status: d['trangThai'] ?? d['status'] ?? 'pending',
          createdAt: (d['ngayTao'] ?? d['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
        );
      }).toList();
      
      _orders.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      
      _isLoading = false;
      notifyListeners();
    } catch (e, stackTrace) {
      debugPrint('Error fetching orders: $e');
      debugPrint(stackTrace.toString());
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> cancelOrder(String orderId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      await _firestore.collection('donHang').doc(orderId).update({
        'trangThai': 'cancelled',
        'status': 'cancelled',
        'updatedAt': FieldValue.serverTimestamp(),
      });

      // Tạo thông báo hủy đơn
      final user = _auth.currentUser;
      if (user != null) {
        await _firestore.collection('thongBao').add({
          'userId': user.uid,
          'title': 'Đã hủy đơn hàng',
          'body': 'Đơn hàng của bạn đã được hủy thành công theo yêu cầu.',
          'type': 'order_status',
          'data': {'orderId': orderId, 'status': 'cancelled'},
          'isRead': false,
          'createdAt': FieldValue.serverTimestamp(),
        });
      }

      await fetchMyOrders();
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
}
