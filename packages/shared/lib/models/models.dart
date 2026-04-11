// Shared Models for Flutter apps

// User Model
class UserModel {
  final String uid;
  final String name;
  final String phone;
  final String email;
  final String role; // "customer", "technician", "admin"
  final String? avatarUrl;
  final DateTime createdAt;

  UserModel({
    required this.uid,
    required this.name,
    required this.phone,
    required this.email,
    required this.role,
    this.avatarUrl,
    required this.createdAt,
  });

  // From Firestore
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      uid: json['uid'] as String,
      name: json['name'] as String,
      phone: json['phone'] as String,
      email: json['email'] as String,
      role: json['role'] as String? ?? 'customer',
      avatarUrl: json['avatar_url'] as String?,
      createdAt: (json['created_at'] as dynamic)?.toDate() ?? DateTime.now(),
    );
  }

  // To Firestore
  Map<String, dynamic> toJson() {
    return {
      'uid': uid,
      'name': name,
      'phone': phone,
      'email': email,
      'role': role,
      'avatar_url': avatarUrl,
      'created_at': createdAt,
    };
  }
}

// Product Model
class ProductModel {
  final String pid;
  final String name;
  final String description;
  final double price;
  final String category;
  final List<String> imageUrls;
  final Map<String, dynamic> specs;
  final int stock;
  final DateTime createdAt;

  ProductModel({
    required this.pid,
    required this.name,
    required this.description,
    required this.price,
    required this.category,
    required this.imageUrls,
    required this.specs,
    required this.stock,
    required this.createdAt,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      pid: json['pid'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      price: (json['price'] as num).toDouble(),
      category: json['category'] as String,
      imageUrls: List<String>.from(json['image_urls'] as List? ?? []),
      specs: json['specs'] as Map<String, dynamic>? ?? {},
      stock: json['stock'] as int? ?? 0,
      createdAt: (json['created_at'] as dynamic)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'pid': pid,
      'name': name,
      'description': description,
      'price': price,
      'category': category,
      'image_urls': imageUrls,
      'specs': specs,
      'stock': stock,
      'created_at': createdAt,
    };
  }
}

// Order Model
class OrderModel {
  final String oid;
  final String customerId;
  final String productId;
  final int quantity;
  final double totalPrice;
  final String status; // pending, confirmed, assigned, in_progress, completed
  final String? deliveryAddress;
  final DateTime createdAt;
  final DateTime? updatedAt;

  OrderModel({
    required this.oid,
    required this.customerId,
    required this.productId,
    required this.quantity,
    required this.totalPrice,
    required this.status,
    this.deliveryAddress,
    required this.createdAt,
    this.updatedAt,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      oid: json['oid'] as String,
      customerId: json['customer_id'] as String,
      productId: json['product_id'] as String,
      quantity: json['quantity'] as int,
      totalPrice: (json['total_price'] as num).toDouble(),
      status: json['status'] as String,
      deliveryAddress: json['delivery_address'] as String?,
      createdAt: (json['created_at'] as dynamic)?.toDate() ?? DateTime.now(),
      updatedAt: (json['updated_at'] as dynamic)?.toDate(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'oid': oid,
      'customer_id': customerId,
      'product_id': productId,
      'quantity': quantity,
      'total_price': totalPrice,
      'status': status,
      'delivery_address': deliveryAddress,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }
}

// Device Model
class DeviceModel {
  final String did;
  final String orderId;
  final String customerId;
  final String serialNumber;
  final String qrCode;
  final DateTime installDate;
  final DateTime warrantyUntil;
  final String status; // installing, active, warranty_ended

  DeviceModel({
    required this.did,
    required this.orderId,
    required this.customerId,
    required this.serialNumber,
    required this.qrCode,
    required this.installDate,
    required this.warrantyUntil,
    required this.status,
  });

  factory DeviceModel.fromJson(Map<String, dynamic> json) {
    return DeviceModel(
      did: json['did'] as String,
      orderId: json['order_id'] as String,
      customerId: json['customer_id'] as String,
      serialNumber: json['serial_number'] as String,
      qrCode: json['qr_code'] as String,
      installDate: (json['install_date'] as dynamic).toDate(),
      warrantyUntil: (json['warranty_until'] as dynamic).toDate(),
      status: json['status'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'did': did,
      'order_id': orderId,
      'customer_id': customerId,
      'serial_number': serialNumber,
      'qr_code': qrCode,
      'install_date': installDate,
      'warranty_until': warrantyUntil,
      'status': status,
    };
  }
}
