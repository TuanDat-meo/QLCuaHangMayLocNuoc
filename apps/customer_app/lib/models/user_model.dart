import 'order_model.dart';

// Extended User Model
class CustomerUser {
  final String uid;
  final String email;
  final String name;
  final String phone;
  final String? avatarUrl;
  final Address? defaultAddress;
  final List<Address> addresses;
  final String status; // active, inactive, banned
  final int orderCount;
  final double totalSpent;
  final double? averageRating;
  final DateTime createdAt;
  final DateTime updatedAt;

  CustomerUser({
    required this.uid,
    required this.email,
    required this.name,
    required this.phone,
    this.avatarUrl,
    this.defaultAddress,
    this.addresses = const [],
    this.status = 'active',
    this.orderCount = 0,
    this.totalSpent = 0.0,
    this.averageRating,
    required this.createdAt,
    required this.updatedAt,
  });

  bool get isActive => status == 'active';

  factory CustomerUser.fromMap(Map<String, dynamic> map) {
    return CustomerUser(
      uid: map['uid'] as String? ?? '',
      email: map['email'] as String? ?? '',
      name: map['name'] as String? ?? '',
      phone: map['phone'] as String? ?? '',
      avatarUrl: map['avatarUrl'] as String?,
      defaultAddress: map['defaultAddress'] != null 
        ? Address.fromMap(map['defaultAddress'] as Map<String, dynamic>) 
        : null,
      addresses: List<Address>.from(
        (map['addresses'] as List?)?.map((x) => Address.fromMap(x)) ?? [],
      ),
      status: map['status'] as String? ?? 'active',
      orderCount: map['orderCount'] as int? ?? 0,
      totalSpent: (map['totalSpent'] as num?)?.toDouble() ?? 0.0,
      averageRating: (map['averageRating'] as num?)?.toDouble(),
      createdAt: (map['createdAt'] as dynamic)?.toDate() ?? DateTime.now(),
      updatedAt: (map['updatedAt'] as dynamic)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'email': email,
      'name': name,
      'phone': phone,
      'avatarUrl': avatarUrl,
      'defaultAddress': defaultAddress?.toMap(),
      'addresses': addresses.map((a) => a.toMap()).toList(),
      'status': status,
      'orderCount': orderCount,
      'totalSpent': totalSpent,
      'averageRating': averageRating,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }
}
