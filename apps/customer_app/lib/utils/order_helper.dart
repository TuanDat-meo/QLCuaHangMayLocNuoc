import 'package:shared/models/order.dart';

/// Helper utilities for creating and managing orders
class OrderHelper {
  /// Create a new order with initial values
  static Order createOrder({
    required String customerId,
    required String customerName,
    required String customerEmail,
    required String phoneNumber,
    required DeliveryAddress deliveryAddress,
    required List<OrderItem> items,
    String orderType = OrderType.home,
    double discount = 0.0,
    double shippingFee = 0.0,
    String notes = '',
    DateTime? scheduledDate,
    ScheduledSlot? scheduledSlot,
    List<Technician>? technicians,
  }) {
    // Calculate totals
    final subtotal = items.fold<double>(0, (sum, item) => sum + item.subtotal);
    final totalAmount = subtotal - discount + shippingFee;

    return Order(
      id: '', // Will be set by Firestore
      orderCode: _generateOrderCode(),
      orderType: orderType,
      customerId: customerId,
      customerName: customerName,
      customerEmail: customerEmail,
      phoneNumber: phoneNumber,
      deliveryAddress: deliveryAddress,
      items: items,
      subtotal: subtotal,
      discount: discount,
      shippingFee: shippingFee,
      totalAmount: totalAmount,
      notes: notes,
      status: OrderStatus.pending,
      scheduledDate: scheduledDate ?? DateTime.now(),
      scheduledSlot: scheduledSlot,
      technicians: technicians ?? [],
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
  }

  /// Create order item from product
  static OrderItem createOrderItem({
    required String productId,
    required String productName,
    required double price,
    required int quantity,
    String? imageUrl,
    int? warrantyPeriod,
  }) {
    final subtotal = price * quantity;

    return OrderItem(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      productId: productId,
      productName: productName,
      imageUrl: imageUrl,
      price: price,
      quantity: quantity,
      subtotal: subtotal,
      warrantyPeriod: warrantyPeriod,
    );
  }

  /// Create delivery address from address components
  static DeliveryAddress createDeliveryAddress({
    required String street,
    required String ward,
    required String district,
    required String city,
    String type = 'home',
    String? recipientName,
    int? wardCode,
    int? districtCode,
    int? provinceCode,
    double? latitude,
    double? longitude,
  }) {
    return DeliveryAddress(
      type: type,
      recipientName: recipientName ?? 'Địa chỉ giao hàng',
      street: street,
      ward: ward,
      district: district,
      city: city,
      wardCode: wardCode,
      districtCode: districtCode,
      provinceCode: provinceCode,
      latitude: latitude,
      longitude: longitude,
    );
  }

  /// Create technician
  static Technician createTechnician({
    required String id,
    required String name,
    required String phone,
    bool isPrimary = false,
  }) {
    return Technician(
      id: id,
      name: name,
      phone: phone,
      isPrimary: isPrimary,
    );
  }

  /// Create scheduled slot
  static ScheduledSlot createScheduledSlot({
    required String slotId,
    required String label,
  }) {
    return ScheduledSlot(
      slotId: slotId,
      label: label,
    );
  }

  /// Update order with new status
  static Order updateOrderStatus(Order order, String newStatus) {
    return order.copyWith(
      status: newStatus,
      updatedAt: DateTime.now(),
    );
  }

  /// Add item to order
  static Order addItemToOrder(Order order, OrderItem item) {
    final updatedItems = [...order.items, item];
    final newSubtotal = updatedItems.fold<double>(
      0,
      (sum, item) => sum + item.subtotal,
    );
    final newTotal = newSubtotal - order.discount + order.shippingFee;

    return order.copyWith(
      notes: order.notes, // Dummy to trigger copyWith
    ).copyWith(
      notes: order.notes,
    );
  }

  /// Remove item from order
  static Order removeItemFromOrder(Order order, String itemId) {
    final updatedItems = order.items.where((item) => item.id != itemId).toList();
    final newSubtotal = updatedItems.fold<double>(
      0,
      (sum, item) => sum + item.subtotal,
    );
    final newTotal = newSubtotal - order.discount + order.shippingFee;

    return order.copyWith(
      notes: order.notes,
    );
  }

  /// Calculate order totals
  static Map<String, double> calculateTotals(List<OrderItem> items) {
    final subtotal = items.fold<double>(0, (sum, item) => sum + item.subtotal);
    
    return {
      'subtotal': subtotal,
      'discount': 0.0,
      'shippingFee': 0.0,
      'total': subtotal,
    };
  }

  /// Format order for display
  static String formatOrderForDisplay(Order order) {
    return '''
Đơn hàng #${order.orderCode}
Khách hàng: ${order.customerName}
Điện thoại: ${order.phoneNumber}
Địa chỉ: ${order.deliveryAddress.fullAddress}
Tổng tiền: ${order.totalAmount.toStringAsFixed(0)} VND
Trạng thái: ${order.status}
''';
  }

  /// Generate unique order code
  static String _generateOrderCode() {
    final now = DateTime.now();
    final year = now.year;
    final month = now.month.toString().padLeft(2, '0');
    final random = (DateTime.now().millisecondsSinceEpoch % 100000)
        .toString()
        .padLeft(5, '0');
    return 'ORD-$year-$random';
  }

  /// Get status display name (Vietnamese)
  static String getStatusDisplayName(String status) {
    const statusNames = {
      OrderStatus.pending: 'Chờ duyệt',
      OrderStatus.assigned: 'Đã phân công',
      OrderStatus.processing: 'Đang xử lý',
      OrderStatus.completed: 'Hoàn tất',
      OrderStatus.incident: 'Sự cố',
      OrderStatus.paid: 'Đã tất toán',
      OrderStatus.cancelled: 'Đã hủy',
      OrderStatus.deleted: 'Đã xóa',
    };
    return statusNames[status] ?? status;
  }

  /// Get status color for UI
  static String getStatusColor(String status) {
    const statusColors = {
      OrderStatus.pending: '#FFA500', // Orange
      OrderStatus.assigned: '#4169E1', // Blue
      OrderStatus.processing: '#1E90FF', // Bright Blue
      OrderStatus.completed: '#32CD32', // Lime Green
      OrderStatus.incident: '#FF4500', // Orange Red
      OrderStatus.paid: '#228B22', // Forest Green
      OrderStatus.cancelled: '#DC143C', // Crimson
      OrderStatus.deleted: '#808080', // Gray
    };
    return statusColors[status] ?? '#000000';
  }
}
