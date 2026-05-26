/// Technician App Firebase Service
/// Extends base service with technician-specific operations
library;

import 'package:shared/models/order.dart';
import 'package:shared/constants/app_constants.dart';
import 'firebase_base_service.dart';

class TechnicianFirebaseService extends FirebaseBaseService {
  static final TechnicianFirebaseService _instance =
      TechnicianFirebaseService._internal();

  factory TechnicianFirebaseService() {
    return _instance;
  }

  TechnicianFirebaseService._internal();

  /// Get all in-progress orders
  Future<List<Order>> getInProgressOrders() async {
    try {
      final snapshot = await firestore
          .collection(FirestoreCollections.orders)
          .where('status', isEqualTo: OrderStatus.inProgress)
          .orderBy('createdAt', descending: true)
          .get();

      return snapshot.docs
          .map((doc) => Order.fromMap(doc.data(), doc.id))
          .toList();
    } catch (e) {
      // TODO: Implement proper logging
      return [];
    }
  }

  /// Get assigned tasks for technician
  Future<List<Order>> getAssignedTasks(String technicianId) async {
    try {
      final snapshot = await firestore
          .collection(FirestoreCollections.orders)
          .where('assignedTechnician', isEqualTo: technicianId)
          .where('status', whereIn: [
            OrderStatus.confirmed,
            OrderStatus.inProgress,
          ])
          .orderBy('createdAt', descending: true)
          .get();

      return snapshot.docs
          .map((doc) => Order.fromMap(doc.data(), doc.id))
          .toList();
    } catch (e) {
      // TODO: Implement proper logging
      return [];
    }
  }

  /// Stream of assigned tasks (real-time)
  Stream<List<Order>> streamAssignedTasks(String technicianId) {
    return firestore
        .collection(FirestoreCollections.orders)
        .where('assignedTechnician', isEqualTo: technicianId)
        .where('status', whereIn: [
          OrderStatus.confirmed,
          OrderStatus.inProgress,
        ])
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => Order.fromMap(doc.data(), doc.id))
            .toList());
  }
}
