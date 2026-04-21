// ──────────────────────────────────────────────────────────────
// DEPRECATED: Use firestore_collections.dart instead
// VaiTro, TrangThaiDonHang, etc. in firestore_collections.dart
// ──────────────────────────────────────────────────────────────

/// @deprecated Use VaiTro from firestore_collections.dart
class UserRole {
  static const String admin = 'admin';
  static const String technician = 'technician';
  static const String customer = 'customer';

  static bool isValidRole(String? role) {
    return role == admin || role == technician || role == customer;
  }
}

/// @deprecated Use TrangThaiDonHang from firestore_collections.dart
class OrderStatus {
  static const String pending = 'pending';
  static const String confirmed = 'confirmed';
  static const String inProgress = 'in_progress';
  static const String completed = 'completed';
  static const String cancelled = 'cancelled';

  static bool isValidStatus(String? status) {
    return status == pending ||
        status == confirmed ||
        status == inProgress ||
        status == completed ||
        status == cancelled;
  }
}

/// @deprecated Use Col from firestore_collections.dart
class FirestoreCollections {
  static const String users = 'users';
  static const String orders = 'orders';
  static const String machines = 'machines';
  static const String technicians = 'technicians';
  static const String auditLogs = 'audit_logs';
}

// ──────────────────────────────────────────────────────────────
// RECOMMENDED: Import from firestore_collections.dart
// ──────────────────────────────────────────────────────────────
// import 'package:shared/constants/firestore_collections.dart';
//
// // Use these instead:
// VaiTro.khachHang        // 'customer'
// TrangThaiDonHang.hoanThanh  // 'hoan_thanh'
// Col.donHang            // 'donHang'
// FDonHang.trangThai     // 'trangThai'
