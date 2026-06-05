// ignore_for_file: avoid_print

import 'package:shared/models/order.dart';
import 'package:customer_app/services/order_service.dart';
import 'package:customer_app/utils/order_helper.dart';
import 'package:customer_app/utils/order_validator.dart';

/// Example: How to use the complete Order Data Structure
/// This example demonstrates all the main operations

void main() async {
  print('=== Order System Examples ===\n');

  // Example 1: Create a new order
  await exampleCreateOrder();

  // Example 2: Validate order data
  exampleValidateOrder();

  // Example 3: Stream orders
  // exampleStreamOrders();

  // Example 4: Update order status
  // await exampleUpdateOrderStatus();

  // Example 5: Batch operations
  // await exampleBatchOperations();
}

/// Example 1: Create a new order with all fields
Future<void> exampleCreateOrder() async {
  print('--- Example 1: Create Order ---\n');

  try {
    // Step 1: Create order item
    final item = OrderHelper.createOrderItem(
      productId: 'An3eCI5Vv92xMIDtu2qt',
      productName: 'Máy lọc nước UV Kangaroo',
      price: 3500000,
      quantity: 1,
      imageUrl: 'https://via.placeholder.com/400',
      warrantyPeriod: 12,
    );
    print('✓ Order item created: ${item.productName}');

    // Step 2: Create delivery address
    final address = OrderHelper.createDeliveryAddress(
      type: 'home',
      recipientName: 'Nhà riêng',
      street: '123 Đường Lê Lợi',
      ward: 'Phường Bến Thành',
      district: 'Quận 1',
      city: 'TP. HCM',
      wardCode: 26842,
      districtCode: 769,
      provinceCode: 79,
      latitude: 10.7769,
      longitude: 106.7009,
    );
    print('✓ Delivery address created: ${address.fullAddress}');

    // Step 3: Create order
    final order = OrderHelper.createOrder(
      customerId: 'huyy5725-id',
      customerName: 'Huy Nguyễn',
      customerEmail: 'huyy5725@gmail.com',
      phoneNumber: '0912 345 678',
      deliveryAddress: address,
      items: [item],
      orderType: OrderType.home,
      notes: 'Giao hàng vào buổi sáng',
      scheduledDate: DateTime.now().add(const Duration(days: 1)),
      technicians: [],
    );
    print('✓ Order created: ${order.orderCode}');
    print('  - Customer: ${order.customerName}');
    print('  - Total: ${order.totalAmount.toStringAsFixed(0)} VND');
    print('  - Status: ${order.status}\n');

    // Step 4: Validate order before saving
    final errors = OrderValidator.validateCompleteOrder(order);
    if (errors.isNotEmpty) {
      print('✗ Validation errors:');
      errors.forEach((key, value) => print('  - $key: $value'));
      return;
    }
    print('✓ Order validation passed\n');

    // Step 5: Save to Firebase (uncomment to use)
    // final orderId = await OrderService.createOrder(order);
    // print('✓ Order saved to Firebase: $orderId\n');
  } catch (e) {
    print('✗ Error: $e\n');
  }
}

/// Example 2: Validate order data
void exampleValidateOrder() {
  print('--- Example 2: Validate Order ---\n');

  // Create test order
  final address = OrderHelper.createDeliveryAddress(
    street: '123 Đường Lê Lợi',
    ward: 'Phường Bến Thành',
    district: 'Quận 1',
    city: 'TP. HCM',
  );

  final item = OrderHelper.createOrderItem(
    productId: 'product-1',
    productName: 'Product A',
    price: 1000000,
    quantity: 2,
  );

  final order = OrderHelper.createOrder(
    customerId: 'customer-1',
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    phoneNumber: '0912345678',
    deliveryAddress: address,
    items: [item],
  );

  // Validate
  final errors = OrderValidator.validateCompleteOrder(order);

  if (errors.isEmpty) {
    print('✓ Order is valid!\n');
  } else {
    print('✗ Validation errors found:\n');
    errors.forEach((field, message) {
      print('  $field: $message');
    });
    print('');
  }

  // Individual validators
  print('--- Individual Validations ---');
  print('Email valid: ${OrderValidator.validateEmail('test@example.com')}');
  print('Phone valid: ${OrderValidator.validatePhoneNumber('0912345678')}');
  print('Address valid: ${OrderValidator.validateDeliveryAddress(address)}');
  print('Items valid: ${OrderValidator.validateOrderItems([item])}');
  print('Totals valid: ${OrderValidator.validateOrderTotals(order)}\n');
}

/// Example 3: Stream orders in real-time
void exampleStreamOrders() {
  print('--- Example 3: Stream Orders ---\n');

  const customerId = 'customer-123';

  // Subscribe to real-time updates
  final subscription = OrderService.streamCustomerOrders(customerId).listen(
    (orders) {
      print('✓ Orders updated: ${orders.length} orders');
      for (final order in orders) {
        print('  - ${order.orderCode}: ${order.status}');
      }
    },
    onError: (error) {
      print('✗ Error: $error');
    },
  );

  // Note: In a real app, cancel the subscription when done
  // subscription.cancel();
}

/// Example 4: Update order status
Future<void> exampleUpdateOrderStatus() async {
  print('--- Example 4: Update Order Status ---\n');

  try {
    const orderId = 'order-123';

    // Update to assigned status
    await OrderService.updateOrderStatus(
      orderId,
      OrderStatus.assigned,
      updatedBy: 'user-123',
      updatedByName: 'Admin User',
    );
    print('✓ Order status updated to: ${OrderStatus.assigned}');

    // Fetch updated order
    final order = await OrderService.getOrderById(orderId);
    if (order != null) {
      print('✓ Order retrieved: ${order.orderCode}');
      print('  - Status: ${order.status}');
      print('  - Updated At: ${order.updatedAt}');
      print('  - Updated By: ${order.updatedByName}\n');
    }
  } catch (e) {
    print('✗ Error: $e\n');
  }
}

/// Example 5: Batch operations
Future<void> exampleBatchOperations() async {
  print('--- Example 5: Batch Operations ---\n');

  try {
    // Create multiple orders
    final orders = <Order>[];

    for (int i = 1; i <= 3; i++) {
      final address = OrderHelper.createDeliveryAddress(
        street: '123 Đường $i',
        ward: 'Phường Test',
        district: 'Quận 1',
        city: 'TP. HCM',
      );

      final item = OrderHelper.createOrderItem(
        productId: 'product-$i',
        productName: 'Product $i',
        price: (1000000 * i).toDouble(),
        quantity: 1,
      );

      final order = OrderHelper.createOrder(
        customerId: 'customer-$i',
        customerName: 'Customer $i',
        customerEmail: 'customer$i@example.com',
        phoneNumber: '091234567$i',
        deliveryAddress: address,
        items: [item],
      );

      orders.add(order);
    }

    print('✓ Created ${orders.length} orders to batch save');

    // Batch create (uncomment to use)
    // final ids = await OrderService.createOrdersBatch(orders);
    // print('✓ Batch operation completed: ${ids.length} orders saved');
    // for (final id in ids) {
    //   print('  - Order saved: $id');
    // }
    print('');
  } catch (e) {
    print('✗ Error: $e\n');
  }
}

/// Example 6: Order helper utilities
void exampleOrderHelpers() {
  print('--- Example 6: Order Helper Utilities ---\n');

  // Generate order code
  final orderCode = OrderService.generateOrderCode();
  print('Generated order code: $orderCode');

  // Get status display names
  print('\nStatus display names:');
  for (final status in [
    OrderStatus.pending,
    OrderStatus.assigned,
    OrderStatus.processing,
    OrderStatus.completed,
  ]) {
    final displayName = OrderHelper.getStatusDisplayName(status);
    print('  $status → $displayName');
  }

  // Format order for display
  final address = OrderHelper.createDeliveryAddress(
    street: '123 Test Street',
    ward: 'Test Ward',
    district: 'Test District',
    city: 'Test City',
  );

  final item = OrderHelper.createOrderItem(
    productId: 'prod-1',
    productName: 'Test Product',
    price: 1000000,
    quantity: 1,
  );

  final order = OrderHelper.createOrder(
    customerId: 'cust-1',
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    phoneNumber: '0912345678',
    deliveryAddress: address,
    items: [item],
  );

  print('\nFormatted order:\n${OrderHelper.formatOrderForDisplay(order)}');
}
