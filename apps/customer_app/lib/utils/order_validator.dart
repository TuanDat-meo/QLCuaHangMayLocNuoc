import 'package:shared/models/order.dart';

/// Order validation utilities
class OrderValidator {
  /// Validate order code format
  static bool validateOrderCode(String code) {
    // Format: ORD-YYYY-XXXXX
    final regex = RegExp(r'^ORD-\d{4}-\d{5,6}$');
    return regex.hasMatch(code);
  }

  /// Validate customer email
  static bool validateEmail(String email) {
    final regex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    );
    return regex.hasMatch(email);
  }

  /// Validate phone number (Vietnamese format)
  static bool validatePhoneNumber(String phone) {
    // Remove spaces and special characters
    final cleaned = phone.replaceAll(RegExp(r'[^\d]'), '');
    // Check if it's a valid Vietnamese phone number (10 digits starting with 0)
    final regex = RegExp(r'^0\d{9}$');
    return regex.hasMatch(cleaned);
  }

  /// Validate delivery address
  static bool validateDeliveryAddress(DeliveryAddress address) {
    if (address.street.isEmpty || address.street.trim().isEmpty) {
      return false;
    }
    if (address.ward.isEmpty || address.ward.trim().isEmpty) {
      return false;
    }
    if (address.district.isEmpty || address.district.trim().isEmpty) {
      return false;
    }
    if (address.city.isEmpty || address.city.trim().isEmpty) {
      return false;
    }
    return true;
  }

  /// Validate order items
  static bool validateOrderItems(List<OrderItem> items) {
    if (items.isEmpty) return false;
    
    for (final item in items) {
      if (item.productId.isEmpty || item.productName.isEmpty) return false;
      if (item.price <= 0 || item.quantity <= 0) return false;
      if ((item.price * item.quantity - item.subtotal).abs() > 0.01) return false;
    }
    
    return true;
  }

  /// Validate order totals
  static bool validateOrderTotals(Order order) {
    double calculatedSubtotal = 0;
    for (final item in order.items) {
      calculatedSubtotal += item.subtotal;
    }

    // Allow small floating point differences
    if ((calculatedSubtotal - order.subtotal).abs() > 0.01) {
      return false;
    }

    final calculatedTotal = 
        order.subtotal - order.discount + order.shippingFee;
    
    if ((calculatedTotal - order.totalAmount).abs() > 0.01) {
      return false;
    }

    return true;
  }

  /// Validate complete order
  static Map<String, String> validateCompleteOrder(Order order) {
    final errors = <String, String>{};

    // Customer information
    if (order.customerId.isEmpty) {
      errors['customerId'] = 'Customer ID is required';
    }
    if (order.customerName.isEmpty) {
      errors['customerName'] = 'Customer name is required';
    }
    if (order.customerEmail.isNotEmpty && !validateEmail(order.customerEmail)) {
      errors['customerEmail'] = 'Invalid email format';
    }
    if (!validatePhoneNumber(order.phoneNumber)) {
      errors['phoneNumber'] = 'Invalid phone number format';
    }

    // Delivery address
    if (!validateDeliveryAddress(order.deliveryAddress)) {
      errors['deliveryAddress'] = 'Invalid delivery address';
    }

    // Order items
    if (!validateOrderItems(order.items)) {
      errors['items'] = 'Invalid order items';
    }

    // Order totals
    if (!validateOrderTotals(order)) {
      errors['totals'] = 'Order totals do not match';
    }

    // Status
    const validStatuses = [
      OrderStatus.pending,
      OrderStatus.assigned,
      OrderStatus.processing,
      OrderStatus.completed,
      OrderStatus.incident,
      OrderStatus.paid,
      OrderStatus.cancelled,
    ];
    if (!validStatuses.contains(order.status)) {
      errors['status'] = 'Invalid order status';
    }

    return errors;
  }

  /// Get error message for validation
  static String? getValidationErrorMessage(Map<String, String> errors) {
    if (errors.isEmpty) return null;
    return errors.values.first;
  }
}
