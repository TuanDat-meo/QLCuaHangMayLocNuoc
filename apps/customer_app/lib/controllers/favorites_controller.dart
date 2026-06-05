import 'package:flutter/material.dart';
import 'package:customer_app/models/product_model.dart';
import 'package:customer_app/services/firestore_service.dart';
import 'package:customer_app/controllers/auth_controller.dart';

class FavoritesController extends ChangeNotifier {
  final AuthController _authController;
  bool _isLoading = false;

  FavoritesController(this._authController);

  bool get isLoading => _isLoading;

  bool isFavorite(String productId) {
    return _authController.customerUser?.favoriteProductIds.contains(productId) ?? false;
  }

  Future<void> toggleFavorite(String productId) async {
    final user = _authController.customerUser;
    if (user == null) return;

    List<String> updatedFavorites = List.from(user.favoriteProductIds);
    if (updatedFavorites.contains(productId)) {
      updatedFavorites.remove(productId);
    } else {
      updatedFavorites.add(productId);
    }

    try {
      await FirestoreService.updateUserData(user.uid, {
        'favoriteProductIds': updatedFavorites,
      });
      // Refresh user profile to update local state
      await _authController.loadUserProfile();
      notifyListeners();
    } catch (e) {
      debugPrint('Error toggling favorite: $e');
    }
  }
}
