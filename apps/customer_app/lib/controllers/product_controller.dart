import 'package:flutter/material.dart';
import 'package:customer_app/models/product_model.dart';
import 'package:customer_app/services/firestore_service.dart';

class ProductController extends ChangeNotifier {
  List<Product> _products = [];
  List<Product> _filteredProducts = [];
  bool _isLoading = false;
  String? _error;

  List<Product> get products => _filteredProducts.isEmpty && _products.isNotEmpty 
      ? _products 
      : (_filteredProducts.isEmpty ? [] : _filteredProducts);
      
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadProducts() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await FirestoreService.getProducts();
      _products = data.map((map) => Product.fromMap(map)).toList();
      _filteredProducts = [];
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> searchProducts(String query) async {
    if (query.isEmpty) {
      _filteredProducts = [];
    } else {
      _filteredProducts = _products
          .where((p) => p.name.toLowerCase().contains(query.toLowerCase()) || 
                       p.description.toLowerCase().contains(query.toLowerCase()))
          .toList();
    }
    notifyListeners();
  }

  Future<void> filterByCategory(String category) async {
    if (category == 'Tất cả') {
      _filteredProducts = [];
    } else {
      _filteredProducts = _products.where((p) => p.category == category).toList();
    }
    notifyListeners();
  }

  void sortProducts(String sortBy) {
    final listToSort = _filteredProducts.isEmpty ? _products : _filteredProducts;
    
    switch (sortBy) {
      case 'price_low':
        listToSort.sort((a, b) => a.price.compareTo(b.price));
        break;
      case 'price_high':
        listToSort.sort((a, b) => b.price.compareTo(a.price));
        break;
      case 'popular':
        listToSort.sort((a, b) => (b.averageRating ?? 0).compareTo(a.averageRating ?? 0));
        break;
      default:
        listToSort.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    }
    notifyListeners();
  }
}
