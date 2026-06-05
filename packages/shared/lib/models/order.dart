/// Order model for customer orders
/// Maps to Firestore orders collection
library order_model;

import 'package:cloud_firestore/cloud_firestore.dart';

// ─────────────────────────────────────────────────────────────────────────────
// Order Status Constants
// ─────────────────────────────────────────────────────────────────────────────
abstract class OrderStatus {
  static const String pending = 'pending';
  static const String assigned = 'assigned';
  static const String processing = 'processing';
  static const String completed = 'completed';
  static const String incident = 'incident';
  static const String paid = 'paid';
  static const String cancelled = 'cancelled';
  static const String deleted = 'deleted';
}

// ─────────────────────────────────────────────────────────────────────────────
// Order Type Constants
// ─────────────────────────────────────────────────────────────────────────────
abstract class OrderType {
  static const String home = 'home';
  static const String installation = 'installation';
  static const String maintenance = 'maintenance';
  static const String repair = 'repair';
}

// ─────────────────────────────────────────────────────────────────────────────
// Order Item Model
// ─────────────────────────────────────────────────────────────────────────────
class OrderItem {
  final String id;
  final String productId;
  final String productName;
  final String? imageUrl;
  final double price;
  final int quantity;
  final double subtotal;
  final int? warrantyPeriod; // Tháng

  OrderItem({
    required this.id,
    required this.productId,
    required this.productName,
    this.imageUrl,
    required this.price,
    required this.quantity,
    required this.subtotal,
    this.warrantyPeriod,
  });

  factory OrderItem.fromMap(Map<String, dynamic> data) {
    return OrderItem(
      id: data['id'] as String? ?? '',
      productId: data['productId'] as String? ?? '',
      productName: data['productName'] as String? ?? '',
      imageUrl: data['imageUrl'] as String?,
      price: (data['price'] as num?)?.toDouble() ?? 0.0,
      quantity: data['quantity'] as int? ?? 1,
      subtotal: (data['subtotal'] as num?)?.toDouble() ?? 0.0,
      warrantyPeriod: data['warrantyPeriod'] as int?,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'productId': productId,
      'productName': productName,
      'imageUrl': imageUrl,
      'price': price,
      'quantity': quantity,
      'subtotal': subtotal,
      'warrantyPeriod': warrantyPeriod,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Delivery Address Model
// ─────────────────────────────────────────────────────────────────────────────
class DeliveryAddress {
  final String type; // 'home', 'office', etc.
  final String recipientName;
  final String street;
  final String ward;
  final String district;
  final String city;
  final int? wardCode;
  final int? districtCode;
  final int? provinceCode;
  final double? latitude;
  final double? longitude;

  DeliveryAddress({
    required this.type,
    required this.recipientName,
    required this.street,
    required this.ward,
    required this.district,
    required this.city,
    this.wardCode,
    this.districtCode,
    this.provinceCode,
    this.latitude,
    this.longitude,
  });

  factory DeliveryAddress.fromMap(Map<String, dynamic> data) {
    return DeliveryAddress(
      type: data['type'] as String? ?? 'home',
      recipientName: data['recipientName'] as String? ?? '',
      street: data['street'] as String? ?? '',
      ward: data['ward'] as String? ?? '',
      district: data['district'] as String? ?? '',
      city: data['city'] as String? ?? '',
      wardCode: data['wardCode'] as int?,
      districtCode: data['districtCode'] as int?,
      provinceCode: data['provinceCode'] as int?,
      latitude: (data['latitude'] as num?)?.toDouble(),
      longitude: (data['longitude'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'type': type,
      'recipientName': recipientName,
      'street': street,
      'ward': ward,
      'district': district,
      'city': city,
      'wardCode': wardCode,
      'districtCode': districtCode,
      'provinceCode': provinceCode,
      'latitude': latitude,
      'longitude': longitude,
    };
  }

  String get fullAddress =>
      '$street, $ward, $district, $city';
}

// ─────────────────────────────────────────────────────────────────────────────
// Technician Model
// ─────────────────────────────────────────────────────────────────────────────
class Technician {
  final String id;
  final String name;
  final String phone;
  final bool isPrimary;

  Technician({
    required this.id,
    required this.name,
    required this.phone,
    this.isPrimary = false,
  });

  factory Technician.fromMap(Map<String, dynamic> data) {
    return Technician(
      id: data['id'] as String? ?? '',
      name: data['name'] as String? ?? '',
      phone: data['phone'] as String? ?? '',
      isPrimary: data['isPrimary'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'phone': phone,
      'isPrimary': isPrimary,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Scheduled Slot Model
// ─────────────────────────────────────────────────────────────────────────────
class ScheduledSlot {
  final String slotId;
  final String label; // '10:00 - 12:00'

  ScheduledSlot({
    required this.slotId,
    required this.label,
  });

  factory ScheduledSlot.fromMap(Map<String, dynamic> data) {
    return ScheduledSlot(
      slotId: data['slotId'] as String? ?? '',
      label: data['label'] as String? ?? '',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'slotId': slotId,
      'label': label,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Order Model
// ─────────────────────────────────────────────────────────────────────────────
class Order {
  final String id;
  final String orderCode;
  final String orderType; // home, installation, maintenance, repair
  
  // Customer Information
  final String customerId;
  final String customerName;
  final String customerEmail;
  final String phoneNumber;

  // Delivery Information
  final DeliveryAddress deliveryAddress;

  // Order Items
  final List<OrderItem> items;

  // Financial Information
  final double subtotal;
  final double discount;
  final double shippingFee;
  final double totalAmount;

  // Notes & Status
  final String notes;
  final String status; // pending, assigned, processing, completed, cancelled, etc.

  // Scheduling
  final DateTime scheduledDate;
  final ScheduledSlot? scheduledSlot;

  // Technicians
  final List<Technician> technicians;

  // Audit Information
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? updatedBy;
  final String? updatedByName;

  Order({
    required this.id,
    required this.orderCode,
    required this.orderType,
    required this.customerId,
    required this.customerName,
    required this.customerEmail,
    required this.phoneNumber,
    required this.deliveryAddress,
    required this.items,
    required this.subtotal,
    required this.discount,
    required this.shippingFee,
    required this.totalAmount,
    required this.notes,
    required this.status,
    required this.scheduledDate,
    this.scheduledSlot,
    this.technicians = const [],
    required this.createdAt,
    required this.updatedAt,
    this.updatedBy,
    this.updatedByName,
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Computed getters
  // ──────────────────────────────────────────────────────────────────────────
  int get itemCount => items.length;
  
  int get totalQuantity => items.fold(0, (sum, item) => sum + item.quantity);

  Technician? get primaryTechnician {
    try {
      return technicians.firstWhere((t) => t.isPrimary);
    } catch (e) {
      return technicians.isNotEmpty ? technicians.first : null;
    }
  }

  bool get isPending => status == OrderStatus.pending;
  bool get isCompleted => status == OrderStatus.completed;
  bool get isCancelled => status == OrderStatus.cancelled;

  // ──────────────────────────────────────────────────────────────────────────
  // Factory: fromMap (Firestore -> Dart)
  // ──────────────────────────────────────────────────────────────────────────
  factory Order.fromMap(Map<String, dynamic> data, String id) {
    return Order(
      id: id,
      orderCode: data['orderCode'] as String? ?? id,
      orderType: data['orderType'] as String? ?? OrderType.home,
      customerId: data['customerId'] as String? ?? '',
      customerName: data['customerName'] as String? ?? 
                    data['tenKhachHang'] as String? ?? '',
      customerEmail: data['customerEmail'] as String? ?? '',
      phoneNumber: data['phoneNumber'] as String? ?? '',
      deliveryAddress: DeliveryAddress.fromMap(
        (data['deliveryAddress'] as Map<String, dynamic>?) ?? {}
      ),
      items: (data['items'] as List?)
              ?.map((item) => OrderItem.fromMap(item as Map<String, dynamic>))
              .toList() ?? [],
      subtotal: (data['subtotal'] as num?)?.toDouble() ?? 0.0,
      discount: (data['discount'] as num?)?.toDouble() ?? 0.0,
      shippingFee: (data['shippingFee'] as num?)?.toDouble() ?? 0.0,
      totalAmount: (data['totalAmount'] as num?)?.toDouble() ?? 
                   (data['tongTien'] as num?)?.toDouble() ?? 0.0,
      notes: data['notes'] as String? ?? '',
      status: data['status'] as String? ?? 
              data['trangThai'] as String? ?? OrderStatus.pending,
      scheduledDate: _parseDate(data['scheduledDate']) ?? DateTime.now(),
      scheduledSlot: data['scheduledSlot'] != null
          ? ScheduledSlot.fromMap(data['scheduledSlot'] as Map<String, dynamic>)
          : null,
      technicians: (data['technicians'] as List?)
              ?.map((tech) => Technician.fromMap(tech as Map<String, dynamic>))
              .toList() ?? [],
      createdAt: _parseDate(data['createdAt']) ?? DateTime.now(),
      updatedAt: _parseDate(data['updatedAt']) ?? DateTime.now(),
      updatedBy: data['updatedBy'] as String?,
      updatedByName: data['updatedByName'] as String?,
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Method: toMap (Dart -> Firestore)
  // ──────────────────────────────────────────────────────────────────────────
  Map<String, dynamic> toMap() {
    return {
      'orderCode': orderCode,
      'orderType': orderType,
      'customerId': customerId,
      'customerName': customerName,
      'customerEmail': customerEmail,
      'phoneNumber': phoneNumber,
      'deliveryAddress': deliveryAddress.toMap(),
      'items': items.map((item) => item.toMap()).toList(),
      'subtotal': subtotal,
      'discount': discount,
      'shippingFee': shippingFee,
      'totalAmount': totalAmount,
      'notes': notes,
      'status': status,
      'scheduledDate': scheduledDate,
      'scheduledSlot': scheduledSlot?.toMap(),
      'technicians': technicians.map((tech) => tech.toMap()).toList(),
      'createdAt': createdAt,
      'updatedAt': updatedAt,
      'updatedBy': updatedBy,
      'updatedByName': updatedByName,
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Method: copyWith
  // ──────────────────────────────────────────────────────────────────────────
  Order copyWith({
    String? status,
    DateTime? updatedAt,
    String? updatedBy,
    String? updatedByName,
    List<Technician>? technicians,
    String? notes,
    DeliveryAddress? deliveryAddress,
  }) {
    return Order(
      id: id,
      orderCode: orderCode,
      orderType: orderType,
      customerId: customerId,
      customerName: customerName,
      customerEmail: customerEmail,
      phoneNumber: phoneNumber,
      deliveryAddress: deliveryAddress ?? this.deliveryAddress,
      items: items,
      subtotal: subtotal,
      discount: discount,
      shippingFee: shippingFee,
      totalAmount: totalAmount,
      notes: notes ?? this.notes,
      status: status ?? this.status,
      scheduledDate: scheduledDate,
      scheduledSlot: scheduledSlot,
      technicians: technicians ?? this.technicians,
      createdAt: createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      updatedBy: updatedBy ?? this.updatedBy,
      updatedByName: updatedByName ?? this.updatedByName,
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Helper: Parse date from multiple formats
  // ──────────────────────────────────────────────────────────────────────────
  static DateTime? _parseDate(dynamic value) {
    if (value == null) return null;
    if (value is DateTime) return value;
    if (value is Timestamp) return value.toDate();
    if (value is String) {
      try {
        return DateTime.parse(value);
      } catch (_) {}
    }
    if (value is Map && (value['_seconds'] != null || value['seconds'] != null)) {
      final seconds = value['_seconds'] ?? value['seconds'] ?? 0;
      return DateTime.fromMillisecondsSinceEpoch(seconds * 1000);
    }
    return null;
  }
}
