import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

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

  Map<String, dynamic> toMap() => {
    'id': id,
    'productId': productId,
    'productName': productName,
    'price': price,
    'quantity': quantity,
    'imageUrl': imageUrl,
  };

  factory CartItem.fromMap(Map<String, dynamic> map) => CartItem(
    id: map['id'],
    productId: map['productId'],
    productName: map['productName'],
    price: map['price'].toDouble(),
    quantity: map['quantity'],
    imageUrl: map['imageUrl'],
  );
}

class CartController extends ChangeNotifier {
  List<CartItem> _items = [];

  CartController() {
    _loadCartFromStorage();
  }

  List<CartItem> get items => _items;

  double get subtotal => _items.fold(0, (sum, item) => sum + (item.price * item.quantity));
  double get discount => subtotal > 10000000 ? 2500000 : 0;
  double get shippingFee => 0; 
  double get total => subtotal - discount + shippingFee;

  Future<void> _saveCartToStorage() async {
    final prefs = await SharedPreferences.getInstance();
    final String encodedData = json.encode(_items.map((item) => item.toMap()).toList());
    await prefs.setString('customer_cart', encodedData);
  }

  Future<void> _loadCartFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    final String? cartData = prefs.getString('customer_cart');
    if (cartData != null) {
      final List<dynamic> decodedData = json.decode(cartData);
      _items = decodedData.map((item) => CartItem.fromMap(item)).toList();
      notifyListeners();
    }
  }

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
    _saveCartToStorage();
    notifyListeners();
  }

  void removeFromCart(String itemId) {
    _items.removeWhere((item) => item.id == itemId);
    _saveCartToStorage();
    notifyListeners();
  }

  void updateQuantity(String itemId, int quantity) {
    final index = _items.indexWhere((item) => item.id == itemId);
    if (index >= 0) {
      if (quantity <= 0) {
        removeFromCart(itemId);
      } else {
        _items[index].quantity = quantity;
        _saveCartToStorage();
        notifyListeners();
      }
    }
  }

  void clearCart() {
    _items.clear();
    _saveCartToStorage();
    notifyListeners();
  }
}
