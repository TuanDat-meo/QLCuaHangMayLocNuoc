/// Order model for customer orders
/// Maps to Firestore orders collection
library order_model;

class Order {
  final String id;
  final String customerId;
  final String machineId;
  final String status; // "pending", "confirmed", "in_progress", "completed", "cancelled"
  final String description;
  final double totalAmount;
  final DateTime createdAt;
  final DateTime? completedAt;
  final Map<String, dynamic>? metadata;

  Order({
    required this.id,
    required this.customerId,
    required this.machineId,
    required this.status,
    required this.description,
    required this.totalAmount,
    required this.createdAt,
    this.completedAt,
    this.metadata,
  });

  /// Convert Firestore document to Order model
  factory Order.fromMap(Map<String, dynamic> data, String id) {
    return Order(
      id: id,
      customerId: data['customerId'] ?? '',
      machineId: data['machineId'] ?? '',
      status: data['status'] ?? 'pending',
      description: data['description'] ?? '',
      totalAmount: (data['totalAmount'] as num?)?.toDouble() ?? 0.0,
      createdAt: (data['createdAt'] as dynamic)?.toDate() ?? DateTime.now(),
      completedAt: (data['completedAt'] as dynamic)?.toDate(),
      metadata: data['metadata'],
    );
  }

  /// Convert Order model to Firestore document
  Map<String, dynamic> toMap() {
    return {
      'customerId': customerId,
      'machineId': machineId,
      'status': status,
      'description': description,
      'totalAmount': totalAmount,
      'createdAt': createdAt,
      'completedAt': completedAt,
      'metadata': metadata,
    };
  }

  /// Create a copy with modified fields
  Order copyWith({
    String? status,
    DateTime? completedAt,
  }) {
    return Order(
      id: id,
      customerId: customerId,
      machineId: machineId,
      status: status ?? this.status,
      description: description,
      totalAmount: totalAmount,
      createdAt: createdAt,
      completedAt: completedAt ?? this.completedAt,
      metadata: metadata,
    );
  }
}
