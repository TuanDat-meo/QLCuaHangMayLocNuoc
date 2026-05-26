import 'package:flutter/material.dart';

class CartItem {
  final String id;
  final String productId;
  final String productName;
  final double price;
  int quantity;
  final String? imageUrl;

  CartItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.price,
    required this.quantity,
    this.imageUrl,
  });
}

class CartController extends ChangeNotifier {
  final List<CartItem> _items = [];

  List<CartItem> get items => _items;

  double get subtotal => _items.fold(0, (sum, item) => sum + (item.price * item.quantity));
  
  // Logic giảm giá: Giảm 2.500.000đ cho đơn hàng trên 10 triệu
  double get discount => subtotal > 10000000 ? 2500000 : 0;
  
  // Phí lắp đặt (Miễn phí theo thiết kế)
  double get shippingFee => 0; 

  double get total => subtotal - discount + shippingFee;

  void addToCart({
    required String productId,
    required String productName,
    required double price,
    required int quantity,
    String? imageUrl,
  }) {
    final existingIndex = _items.indexWhere((item) => item.productId == productId);

    if (existingIndex >= 0) {
      _items[existingIndex].quantity += quantity;
    } else {
      _items.add(CartItem(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        productId: productId,
        productName: productName,
        price: price,
        quantity: quantity,
        imageUrl: imageUrl,
      ));
    }
    notifyListeners();
  }

  void removeFromCart(String itemId) {
    _items.removeWhere((item) => item.id == itemId);
    notifyListeners();
  }

  void updateQuantity(String itemId, int quantity) {
    final index = _items.indexWhere((item) => item.id == itemId);
    if (index >= 0) {
      if (quantity <= 0) {
        removeFromCart(itemId);
      } else {
        _items[index].quantity = quantity;
        notifyListeners();
      }
    }
  }

  void clearCart() {
    _items.clear();
    notifyListeners();
  }
}
