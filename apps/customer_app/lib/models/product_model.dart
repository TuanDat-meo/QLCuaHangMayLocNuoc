// Product Model
class Product {
  final String id;
  final String name;
  final String description;
  final double price;
  final String category;
  final List<String> imageUrls;
  final ProductSpecs specs;
  final String status;
  final int stock;
  final List<ProductReview>? reviews;
  final double? averageRating;
  final int reviewCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.category,
    required this.imageUrls,
    required this.specs,
    required this.status,
    required this.stock,
    this.reviews,
    this.averageRating = 0.0,
    this.reviewCount = 0,
    required this.createdAt,
    required this.updatedAt,
  });

  bool get isAvailable => (status.toLowerCase() == 'active') && stock > 0;
  bool get isOutOfStock => stock <= 0;

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'price': price,
      'category': category,
      'imageUrls': imageUrls,
      'specs': specs.toMap(),
      'status': status,
      'stock': stock,
      'averageRating': averageRating,
      'reviewCount': reviewCount,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }

  factory Product.fromMap(Map<String, dynamic> map) {
    // Hỗ trợ cả tiếng Việt (từ Admin) và tiếng Anh (từ seed cũ/Flutter)
    return Product(
      id: map['id'] as String? ?? '',
      name: map['tenSanPham'] as String? ?? map['name'] as String? ?? '',
      description: map['moTa'] as String? ?? map['description'] as String? ?? '',
      price: (map['giaBan'] as num?)?.toDouble() ?? (map['price'] as num?)?.toDouble() ?? 0.0,
      category: map['danhMuc'] as String? ?? map['category'] as String? ?? '',
      imageUrls: map['imageUrl'] != null 
          ? [map['imageUrl'] as String] 
          : List<String>.from(map['imageUrls'] as List? ?? []),
      specs: ProductSpecs.fromMap(map['thongSoKyThuat'] as Map<String, dynamic>? ?? map['specs'] as Map<String, dynamic>? ?? {}),
      status: map['trangThai'] as String? ?? map['status'] as String? ?? 'Active',
      stock: map['tonKho'] as int? ?? map['soLuongTon'] as int? ?? map['stock'] as int? ?? 0,
      averageRating: (map['averageRating'] as num?)?.toDouble() ?? 0.0,
      reviewCount: map['reviewCount'] as int? ?? 0,
      createdAt: (map['createdAt'] as dynamic)?.toDate() ?? (map['ngayTao'] as dynamic)?.toDate() ?? DateTime.now(),
      updatedAt: (map['updatedAt'] as dynamic)?.toDate() ?? (map['ngayCapNhat'] as dynamic)?.toDate() ?? DateTime.now(),
    );
  }
}

class ProductSpecs {
  final String? model;
  final int? capacity;
  final int? warrantyYears;
  final Map<String, dynamic>? dimensions;
  final double? weight;
  final String? power;

  ProductSpecs({
    this.model,
    this.capacity,
    this.warrantyYears,
    this.dimensions,
    this.weight,
    this.power,
  });

  Map<String, dynamic> toMap() {
    return {
      'model': model,
      'capacity': capacity,
      'warrantyYears': warrantyYears,
      'dimensions': dimensions,
      'weight': weight,
      'power': power,
    };
  }

  factory ProductSpecs.fromMap(Map<String, dynamic> map) {
    return ProductSpecs(
      model: map['model'] as String?,
      capacity: map['capacity'] as int?,
      warrantyYears: map['warrantyYears'] as int?,
      dimensions: map['dimensions'] as Map<String, dynamic>?,
      weight: (map['weight'] as num?)?.toDouble(),
      power: map['power'] as String?,
    );
  }
}

class ProductReview {
  final String id;
  final String userId;
  final String userName;
  final String userAvatar;
  final double rating;
  final String comment;
  final DateTime createdAt;

  ProductReview({
    required this.id,
    required this.userId,
    required this.userName,
    required this.userAvatar,
    required this.rating,
    required this.comment,
    required this.createdAt,
  });

  factory ProductReview.fromMap(Map<String, dynamic> map) {
    return ProductReview(
      id: map['id'] as String? ?? '',
      userId: map['userId'] as String? ?? '',
      userName: map['userName'] as String? ?? '',
      userAvatar: map['userAvatar'] as String? ?? '',
      rating: (map['rating'] as num?)?.toDouble() ?? 0.0,
      comment: map['comment'] as String? ?? '',
      createdAt: (map['createdAt'] as dynamic)?.toDate() ?? DateTime.now(),
    );
  }
}
