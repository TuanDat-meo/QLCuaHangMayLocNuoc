// lib/models/order_model.dart

class Address {
  final String id;
  final String recipientName;
  final String phoneNumber;
  final String street;
  final String ward;
  final String district;
  final String city;
  final int? provinceCode;
  final int? districtCode;
  final int? wardCode;
  final String type; // 'home' | 'company'

  Address({
    required this.id,
    required this.recipientName,
    required this.phoneNumber,
    required this.street,
    required this.ward,
    required this.district,
    required this.city,
    this.provinceCode,
    this.districtCode,
    this.wardCode,
    this.type = 'home',
  });

  String get fullAddress => '$street, $ward, $district, $city';

  Map<String, dynamic> toMap() => {
        'id': id,
        'recipientName': recipientName,
        'phoneNumber': phoneNumber,
        'street': street,
        'ward': ward,
        'district': district,
        'city': city,
        'provinceCode': provinceCode,
        'districtCode': districtCode,
        'wardCode': wardCode,
        'kind': type,
      };

  factory Address.fromMap(Map<String, dynamic> map) => Address(
        id: map['id'] ?? '',
        recipientName: map['recipientName'] ?? '',
        phoneNumber: map['phoneNumber'] ?? '',
        street: map['street'] ?? '',
        ward: map['ward'] ?? '',
        district: map['district'] ?? '',
        city: map['city'] ?? '',
        provinceCode: map['provinceCode'],
        districtCode: map['districtCode'],
        wardCode: map['wardCode'],
        type: map['kind'] ?? map['type'] ?? 'home',
      );
}

class OrderItem {
  final String id;
  final String productId;
  final String productName;
  final double price;
  final int quantity;
  final double subtotal;
  final String? imageUrl;

  OrderItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.price,
    required this.quantity,
    required this.subtotal,
    this.imageUrl,
  });

  Map<String, dynamic> toMap() => {
        'id': id,
        'productId': productId,
        'productName': productName,
        'price': price,
        'quantity': quantity,
        'subtotal': subtotal,
        'imageUrl': imageUrl,
      };

  factory OrderItem.fromMap(Map<String, dynamic> map) => OrderItem(
        id: map['id'] ?? '',
        productId: map['productId'] ?? '',
        productName: map['productName'] ?? '',
        price: (map['price'] as num?)?.toDouble() ?? 0.0,
        quantity: (map['quantity'] as num?)?.toInt() ?? 0,
        subtotal: (map['subtotal'] as num?)?.toDouble() ?? 0.0,
        imageUrl: map['imageUrl'],
      );
}

class ScheduleSlot {
  final String id;
  final String label; // e.g. '08:00 - 10:00'
  final int startHour;
  final int endHour;

  const ScheduleSlot({
    required this.id,
    required this.label,
    required this.startHour,
    required this.endHour,
  });
}

class OrderTrackingStep {
  final String title;
  final String subtitle;
  final bool isCompleted;
  final bool isActive;
  final DateTime? timestamp;

  const OrderTrackingStep({
    required this.title,
    required this.subtitle,
    this.isCompleted = false,
    this.isActive = false,
    this.timestamp,
  });
}

class Order {
  final String id;
  final String orderCode;
  final List<OrderItem> items;
  final Address deliveryAddress;
  final DateTime scheduledDate;
  final ScheduleSlot scheduledSlot;
  final String? notes;
  final double subtotal;
  final double discount;
  final double shippingFee;
  final double totalAmount;
  final String status; // 'pending' | 'confirmed' | 'in_progress' | 'completed'
  final String? technicianId;
  final String? technicianName;
  final String? technicianPhone;
  final DateTime createdAt;

  Order({
    required this.id,
    required this.orderCode,
    required this.items,
    required this.deliveryAddress,
    required this.scheduledDate,
    required this.scheduledSlot,
    this.notes,
    required this.subtotal,
    required this.discount,
    required this.shippingFee,
    required this.totalAmount,
    required this.status,
    this.technicianId,
    this.technicianName,
    this.technicianPhone,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() => {
        'id': id,
        'orderCode': orderCode,
        'items': items.map((e) => e.toMap()).toList(),
        'deliveryAddress': deliveryAddress.toMap(),
        'scheduledDate': scheduledDate.toIso8601String(),
        'scheduledSlotId': scheduledSlot.id,
        'scheduledSlotLabel': scheduledSlot.label,
        'notes': notes,
        'subtotal': subtotal,
        'discount': discount,
        'Shipping fee': shippingFee,
        'status': status,
        'technicianId': technicianId,
        'technicianName': technicianName,
        'technicianPhone': technicianPhone,
        'createdAt': createdAt.toIso8601String(),
      };
}
