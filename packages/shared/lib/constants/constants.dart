// Firestore Collections Names
class FirestoreCollections {
  static const String users = 'users';
  static const String products = 'products';
  static const String categories = 'categories';
  static const String orders = 'orders';
  static const String assignments = 'assignments';
  static const String devices = 'devices';
  static const String maintenance = 'maintenance';
  static const String warranties = 'warranties';
  static const String inventory = 'inventory';
  static const String notifications = 'notifications';
  static const String preOrders = 'pre_orders';
  static const String auditLog = 'audit_log';
}

// Order Status Enum
enum OrderStatus {
  pending,
  confirmed,
  assigned,
  inProgress,
  completed,
  cancelled,
}

extension OrderStatusExtension on OrderStatus {
  String get value {
    switch (this) {
      case OrderStatus.pending:
        return 'pending';
      case OrderStatus.confirmed:
        return 'confirmed';
      case OrderStatus.assigned:
        return 'assigned';
      case OrderStatus.inProgress:
        return 'in_progress';
      case OrderStatus.completed:
        return 'completed';
      case OrderStatus.cancelled:
        return 'cancelled';
    }
  }

  String get label {
    switch (this) {
      case OrderStatus.pending:
        return 'Chờ xử lý';
      case OrderStatus.confirmed:
        return 'Đã xác nhận';
      case OrderStatus.assigned:
        return 'Đã phân công';
      case OrderStatus.inProgress:
        return 'Đang thực hiện';
      case OrderStatus.completed:
        return 'Hoàn thành';
      case OrderStatus.cancelled:
        return 'Bị hủy';
    }
  }
}

// User Roles
enum UserRole {
  customer,
  technician,
  admin,
}

extension UserRoleExtension on UserRole {
  String get value {
    switch (this) {
      case UserRole.customer:
        return 'customer';
      case UserRole.technician:
        return 'technician';
      case UserRole.admin:
        return 'admin';
    }
  }
}
