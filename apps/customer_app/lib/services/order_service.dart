import 'package:cloud_firestore/cloud_firestore.dart' hide Order;
import 'package:logger/logger.dart';
import 'package:shared/models/order.dart';

final logger = Logger();

/// Order Service for managing customer orders
class OrderService {
  static final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  static const String _collectionName = 'donHang';

  // ──────────────────────────────────────────────────────────────────────────
  // CREATE Operations
  // ──────────────────────────────────────────────────────────────────────────

  /// Create a new order
  static Future<String> createOrder(Order order) async {
    try {
      final Map<String, dynamic> orderData = order.toMap();
      
      // Add server timestamp
      orderData['createdAt'] = FieldValue.serverTimestamp();
      orderData['updatedAt'] = FieldValue.serverTimestamp();

      logger.i('Creating order: ${order.orderCode}');
      
      final docRef = await _firestore.collection(_collectionName).add(orderData);
      
      logger.i('Order created with ID: ${docRef.id}');
      return docRef.id;
    } catch (e) {
      logger.e('Error creating order: $e');
      rethrow;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // READ Operations
  // ──────────────────────────────────────────────────────────────────────────

  /// Get order by ID
  static Future<Order?> getOrderById(String orderId) async {
    try {
      final doc = await _firestore.collection(_collectionName).doc(orderId).get();
      
      if (!doc.exists) {
        logger.w('Order not found: $orderId');
        return null;
      }

      return Order.fromMap(doc.data() as Map<String, dynamic>, doc.id);
    } catch (e) {
      logger.e('Error fetching order: $e');
      rethrow;
    }
  }

  /// Get all orders for a customer
  static Future<List<Order>> getCustomerOrders(String customerId) async {
    try {
      final snapshot = await _firestore
          .collection(_collectionName)
          .where('customerId', isEqualTo: customerId)
          .orderBy('createdAt', descending: true)
          .get();

      logger.i('Found ${snapshot.docs.length} orders for customer: $customerId');
      
      return snapshot.docs
          .map((doc) => Order.fromMap(doc.data(), doc.id))
          .toList();
    } catch (e) {
      logger.e('Error fetching customer orders: $e');
      rethrow;
    }
  }

  /// Get orders by status
  static Future<List<Order>> getOrdersByStatus(String customerId, String status) async {
    try {
      final snapshot = await _firestore
          .collection(_collectionName)
          .where('customerId', isEqualTo: customerId)
          .where('status', isEqualTo: status)
          .orderBy('createdAt', descending: true)
          .get();

      return snapshot.docs
          .map((doc) => Order.fromMap(doc.data(), doc.id))
          .toList();
    } catch (e) {
      logger.e('Error fetching orders by status: $e');
      rethrow;
    }
  }

  /// Stream all orders for a customer (real-time)
  static Stream<List<Order>> streamCustomerOrders(String customerId) {
    return _firestore
        .collection(_collectionName)
        .where('customerId', isEqualTo: customerId)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) {
          return snapshot.docs
              .map((doc) => Order.fromMap(doc.data(), doc.id))
              .toList();
        })
        .handleError((error) {
          logger.e('Error streaming orders: $error');
          return [];
        });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // UPDATE Operations
  // ──────────────────────────────────────────────────────────────────────────

  /// Update order status
  static Future<void> updateOrderStatus(
    String orderId,
    String status, {
    String? updatedBy,
    String? updatedByName,
  }) async {
    try {
      await _firestore.collection(_collectionName).doc(orderId).update({
        'status': status,
        'updatedAt': FieldValue.serverTimestamp(),
        if (updatedBy != null) 'updatedBy': updatedBy,
        if (updatedByName != null) 'updatedByName': updatedByName,
      });

      logger.i('Order status updated: $orderId -> $status');
    } catch (e) {
      logger.e('Error updating order status: $e');
      rethrow;
    }
  }

  /// Update order
  static Future<void> updateOrder(
    String orderId,
    Order order,
  ) async {
    try {
      final Map<String, dynamic> orderData = order.toMap();
      orderData['updatedAt'] = FieldValue.serverTimestamp();

      await _firestore.collection(_collectionName).doc(orderId).update(orderData);

      logger.i('Order updated: $orderId');
    } catch (e) {
      logger.e('Error updating order: $e');
      rethrow;
    }
  }

  /// Update technicians for an order
  static Future<void> updateTechnicians(
    String orderId,
    List<Technician> technicians, {
    String? updatedBy,
    String? updatedByName,
  }) async {
    try {
      await _firestore.collection(_collectionName).doc(orderId).update({
        'technicians': technicians.map((t) => t.toMap()).toList(),
        'status': OrderStatus.assigned,
        'updatedAt': FieldValue.serverTimestamp(),
        if (updatedBy != null) 'updatedBy': updatedBy,
        if (updatedByName != null) 'updatedByName': updatedByName,
      });

      logger.i('Technicians assigned to order: $orderId');
    } catch (e) {
      logger.e('Error updating technicians: $e');
      rethrow;
    }
  }

  /// Update delivery address
  static Future<void> updateDeliveryAddress(
    String orderId,
    DeliveryAddress address, {
    String? updatedBy,
    String? updatedByName,
  }) async {
    try {
      await _firestore.collection(_collectionName).doc(orderId).update({
        'deliveryAddress': address.toMap(),
        'updatedAt': FieldValue.serverTimestamp(),
        if (updatedBy != null) 'updatedBy': updatedBy,
        if (updatedByName != null) 'updatedByName': updatedByName,
      });

      logger.i('Delivery address updated: $orderId');
    } catch (e) {
      logger.e('Error updating delivery address: $e');
      rethrow;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // DELETE Operations
  // ──────────────────────────────────────────────────────────────────────────

  /// Delete order (hard delete for pending, soft delete for others)
  static Future<void> deleteOrder(String orderId, String status) async {
    try {
      if (status == OrderStatus.pending) {
        // Hard delete for pending orders
        await _firestore.collection(_collectionName).doc(orderId).delete();
        logger.i('Order hard deleted: $orderId');
      } else {
        // Soft delete for other statuses
        await _firestore.collection(_collectionName).doc(orderId).update({
          'status': OrderStatus.deleted,
          'updatedAt': FieldValue.serverTimestamp(),
        });
        logger.i('Order soft deleted: $orderId');
      }
    } catch (e) {
      logger.e('Error deleting order: $e');
      rethrow;
    }
  }

  /// Cancel order
  static Future<void> cancelOrder(
    String orderId, {
    String? reason,
    String? updatedBy,
    String? updatedByName,
  }) async {
    try {
      await _firestore.collection(_collectionName).doc(orderId).update({
        'status': OrderStatus.cancelled,
        'notes': reason ?? '',
        'updatedAt': FieldValue.serverTimestamp(),
        if (updatedBy != null) 'updatedBy': updatedBy,
        if (updatedByName != null) 'updatedByName': updatedByName,
      });

      logger.i('Order cancelled: $orderId');
    } catch (e) {
      logger.e('Error cancelling order: $e');
      rethrow;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // BATCH Operations
  // ──────────────────────────────────────────────────────────────────────────

  /// Create multiple orders in a batch
  static Future<List<String>> createOrdersBatch(List<Order> orders) async {
    try {
      final batch = _firestore.batch();
      final ids = <String>[];

      for (final order in orders) {
        final docRef = _firestore.collection(_collectionName).doc();
        final orderData = order.toMap();
        orderData['createdAt'] = FieldValue.serverTimestamp();
        orderData['updatedAt'] = FieldValue.serverTimestamp();

        batch.set(docRef, orderData);
        ids.add(docRef.id);
      }

      await batch.commit();
      logger.i('Batch created ${orders.length} orders');
      return ids;
    } catch (e) {
      logger.e('Error creating batch orders: $e');
      rethrow;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // UTILITY Methods
  // ──────────────────────────────────────────────────────────────────────────

  /// Generate unique order code
  static String generateOrderCode() {
    final now = DateTime.now();
    final year = now.year;
    final random = (DateTime.now().millisecondsSinceEpoch % 100000).toString().padLeft(5, '0');
    return 'ORD-$year-$random';
  }

  /// Validate order data before creation
  static bool validateOrder(Order order) {
    if (order.customerId.isEmpty) {
      logger.w('Invalid order: empty customerId');
      return false;
    }
    if (order.items.isEmpty) {
      logger.w('Invalid order: no items');
      return false;
    }
    if (order.totalAmount <= 0) {
      logger.w('Invalid order: invalid total amount');
      return false;
    }
    return true;
  }
}
