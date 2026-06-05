import 'package:flutter/material.dart';
import 'package:customer_app/models/product_model.dart';
import 'package:customer_app/services/firestore_service.dart';

class ProductController extends ChangeNotifier {
  List<Product> _products = [];
  List<Product> _filteredProducts = [];
  bool _isLoading = false;
  String? _error;

  List<Product> get products =>
      _filteredProducts.isNotEmpty ? _filteredProducts : _products;

  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadProducts() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // FirestoreService.getProducts() trả về List<Map<String, dynamic>>
      // mỗi map phải có key 'id' hoặc truyền id riêng
      final data = await FirestoreService.getProducts();
      _products = data
          .map((map) => Product.fromMap(map, id: map['id'] ?? ''))
          .toList();
      _filteredProducts = [];
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  void searchProducts(String query) {
    if (query.isEmpty) {
      _filteredProducts = [];
    } else {
      _filteredProducts = _products
          .where((p) =>
              p.name.toLowerCase().contains(query.toLowerCase()) ||
              p.description.toLowerCase().contains(query.toLowerCase()))
          .toList();
    }
    notifyListeners();
  }

  void filterByCategory(String category) {
    if (category == 'Tất cả') {
      _filteredProducts = [];
    } else {
      _filteredProducts =
          _products.where((p) => p.category == category).toList();
    }
    notifyListeners();
  }

  void sortProducts(String sortBy) {
    final listToSort =
        _filteredProducts.isNotEmpty ? _filteredProducts : _products;

    switch (sortBy) {
      case 'price_low':
        listToSort.sort((a, b) => a.price.compareTo(b.price));
        break;
      case 'price_high':
        listToSort.sort((a, b) => b.price.compareTo(a.price));
        break;
      case 'popular':
        listToSort.sort(
            (a, b) => (b.averageRating ?? 0).compareTo(a.averageRating ?? 0));
        break;
      default:
        listToSort.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    }
    notifyListeners();
  }
}