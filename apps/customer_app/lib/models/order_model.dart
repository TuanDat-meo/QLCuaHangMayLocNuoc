// Order & OrderItem Models
class Order {
  final String id;
  final String customerId;
  final String customerName;
  final String customerPhone;
  final Address deliveryAddress;
  final List<OrderItem> items;
  final double subtotal;
  final double shippingFee;
  final double tax;
  final double totalAmount;
  final String status; // pending, approved, assigned, in_progress, completed, cancelled
  final String? notes;
  final String? assignedTechnicianId;
  final DateTime createdAt;
  final DateTime? estimatedDeliveryDate;
  final DateTime? completedAt;

  Order({
    required this.id,
    required this.customerId,
    required this.customerName,
    required this.customerPhone,
    required this.deliveryAddress,
    required this.items,
    required this.subtotal,
    required this.shippingFee,
    required this.tax,
    required this.totalAmount,
    required this.status,
    this.notes,
    this.assignedTechnicianId,
    required this.createdAt,
    this.estimatedDeliveryDate,
    this.completedAt,
  });

  bool get isPending => status == 'pending';
  bool get isApproved => status == 'approved';
  bool get isAssigned => status == 'assigned';
  bool get isInProgress => status == 'in_progress';
  bool get isCompleted => status == 'completed';
  bool get isCancelled => status == 'cancelled';
  bool get isActive => !isCancelled && !isCompleted;

  String get statusDisplayText {
    switch (status) {
      case 'pending':
        return 'Chờ duyệt';
      case 'approved':
        return 'Đã duyệt';
      case 'assigned':
        return 'Đã phân công';
      case 'in_progress':
        return 'Đang thực hiện';
      case 'completed':
        return 'Hoàn tất';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'customerId': customerId,
      'customerName': customerName,
      'customerPhone': customerPhone,
      'deliveryAddress': deliveryAddress.toMap(),
      'items': items.map((e) => e.toMap()).toList(),
      'subtotal': subtotal,
      'shippingFee': shippingFee,
      'tax': tax,
      'totalAmount': totalAmount,
      'status': status,
      'notes': notes,
      'assignedTechnicianId': assignedTechnicianId,
      'createdAt': createdAt,
      'estimatedDeliveryDate': estimatedDeliveryDate,
      'completedAt': completedAt,
    };
  }

  factory Order.fromMap(Map<String, dynamic> map) {
    return Order(
      id: map['id'] as String? ?? '',
      customerId: map['customerId'] as String? ?? '',
      customerName: map['customerName'] as String? ?? '',
      customerPhone: map['customerPhone'] as String? ?? '',
      deliveryAddress: Address.fromMap(map['deliveryAddress'] as Map<String, dynamic>? ?? {}),
      items: List<OrderItem>.from(
        (map['items'] as List?)?.map((x) => OrderItem.fromMap(x)) ?? [],
      ),
      subtotal: (map['subtotal'] as num?)?.toDouble() ?? 0.0,
      shippingFee: (map['shippingFee'] as num?)?.toDouble() ?? 0.0,
      tax: (map['tax'] as num?)?.toDouble() ?? 0.0,
      totalAmount: (map['totalAmount'] as num?)?.toDouble() ?? 0.0,
      status: map['status'] as String? ?? 'pending',
      notes: map['notes'] as String?,
      assignedTechnicianId: map['assignedTechnicianId'] as String?,
      createdAt: (map['createdAt'] as dynamic)?.toDate() ?? DateTime.now(),
      estimatedDeliveryDate: (map['estimatedDeliveryDate'] as dynamic)?.toDate(),
      completedAt: (map['completedAt'] as dynamic)?.toDate(),
    );
  }
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

  factory OrderItem.fromMap(Map<String, dynamic> map) {
    return OrderItem(
      id: map['id'] as String? ?? '',
      productId: map['productId'] as String? ?? '',
      productName: map['productName'] as String? ?? '',
      price: (map['price'] as num?)?.toDouble() ?? 0.0,
      quantity: map['quantity'] as int? ?? 1,
      subtotal: (map['subtotal'] as num?)?.toDouble() ?? 0.0,
      imageUrl: map['imageUrl'] as String?,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'productId': productId,
      'productName': productName,
      'price': price,
      'quantity': quantity,
      'subtotal': subtotal,
      'imageUrl': imageUrl,
    };
  }
}

class Address {
  final String id;
  final String street;
  final String ward;
  final String district;
  final String city;
  final double? latitude;
  final double? longitude;
  final String? notes;
  final bool isDefault;

  Address({
    required this.id,
    required this.street,
    required this.ward,
    required this.district,
    required this.city,
    this.latitude,
    this.longitude,
    this.notes,
    this.isDefault = false,
  });

  String get fullAddress => '$street, $ward, $district, $city';

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'street': street,
      'ward': ward,
      'district': district,
      'city': city,
      'latitude': latitude,
      'longitude': longitude,
      'notes': notes,
      'isDefault': isDefault,
    };
  }

  factory Address.fromMap(Map<String, dynamic> map) {
    return Address(
      id: map['id'] as String? ?? '',
      street: map['street'] as String? ?? '',
      ward: map['ward'] as String? ?? '',
      district: map['district'] as String? ?? '',
      city: map['city'] as String? ?? '',
      latitude: (map['latitude'] as num?)?.toDouble(),
      longitude: (map['longitude'] as num?)?.toDouble(),
      notes: map['notes'] as String?,
      isDefault: map['isDefault'] as bool? ?? false,
    );
  }
}
