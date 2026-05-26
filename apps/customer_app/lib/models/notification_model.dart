// Notification Model
class AppNotification {
  final String id;
  final String userId;
  final String title;
  final String body;
  final String type; // order_status, assignment, promo, system
  final Map<String, dynamic>? data;
  final bool isRead;
  final DateTime createdAt;
  final DateTime? readAt;

  AppNotification({
    required this.id,
    required this.userId,
    required this.title,
    required this.body,
    required this.type,
    this.data,
    this.isRead = false,
    required this.createdAt,
    this.readAt,
  });

  String get typeDisplayText {
    switch (type) {
      case 'order_status':
        return 'Cập nhật đơn hàng';
      case 'assignment':
        return 'Phân công KTV';
      case 'promo':
        return 'Khuyến mãi';
      case 'system':
        return 'Thông báo hệ thống';
      default:
        return type;
    }
  }

  factory AppNotification.fromMap(Map<String, dynamic> map) {
    return AppNotification(
      id: map['id'] as String? ?? '',
      userId: map['userId'] as String? ?? '',
      title: map['title'] as String? ?? '',
      body: map['body'] as String? ?? '',
      type: map['type'] as String? ?? 'system',
      data: map['data'] as Map<String, dynamic>?,
      isRead: map['isRead'] as bool? ?? false,
      createdAt: (map['createdAt'] as dynamic)?.toDate() ?? DateTime.now(),
      readAt: (map['readAt'] as dynamic)?.toDate(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'title': title,
      'body': body,
      'type': type,
      'data': data,
      'isRead': isRead,
      'createdAt': createdAt,
      'readAt': readAt,
    };
  }
}
