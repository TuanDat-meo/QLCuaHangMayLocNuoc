import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:customer_app/controllers/auth_controller.dart';
import 'package:customer_app/controllers/product_controller.dart';
import 'package:customer_app/controllers/favorites_controller.dart';
import 'package:customer_app/models/product_model.dart';
import 'package:customer_app/features/products/screens/product_detail_screen.dart';

class FavoritesScreen extends StatelessWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      appBar: AppBar(
        title: const Text('Sản phẩm yêu thích'),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Consumer2<AuthController, ProductController>(
        builder: (context, auth, productController, _) {
          final favoriteIds = auth.customerUser?.favoriteProductIds ?? [];
          
          if (favoriteIds.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(32),
                    decoration: BoxDecoration(
                      color: const Color(0xfffff1f2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.favorite_border_rounded, size: 64, color: Colors.redAccent),
                  ),
                  const SizedBox(height: 24),
                  const Text('Danh sách yêu thích trống', 
                    style: TextStyle(color: Color(0xff64748b), fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 8),
                  const Text('Hãy thêm sản phẩm bạn thích vào đây nhé!', 
                    style: TextStyle(color: Color(0xff94a3b8), fontSize: 14)),
                  const SizedBox(height: 32),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('TIẾP TỤC MUA SẮM'),
                  ),
                ],
              ),
            );
          }

          final favoriteProducts = productController.products
              .where((p) => favoriteIds.contains(p.id))
              .toList();

          return ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: favoriteProducts.length,
            itemBuilder: (context, index) {
              final product = favoriteProducts[index];
              return _FavoriteProductCard(product: product);
            },
          );
        },
      ),
    );
  }
}

class _FavoriteProductCard extends StatelessWidget {
  final Product product;

  const _FavoriteProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    final String? imageUrl = product.imageUrls.isNotEmpty ? product.imageUrls.first : null;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(12),
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: imageUrl != null 
            ? Image.network(
                imageUrl,
                width: 70,
                height: 70,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => _buildPlaceholder(),
              )
            : _buildPlaceholder(),
        ),
        title: Text(
          product.name,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Text(
          '₫${product.price.toStringAsFixed(0).replaceAllMapped(RegExp(r"(\d{1,3})(?=(\d{3})+(?!\d))"), (m) => "${m[1]}.")}',
          style: const TextStyle(color: Color(0xff00459a), fontWeight: FontWeight.w900, fontSize: 14),
        ),
        trailing: Consumer<FavoritesController>(
          builder: (context, favorites, _) {
            return IconButton(
              icon: const Icon(Icons.favorite, color: Colors.redAccent),
              onPressed: () => favorites.toggleFavorite(product.id),
            );
          },
        ),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ProductDetailScreen(product: product),
            ),
          );
        },
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      width: 70,
      height: 70,
      color: const Color(0xfff1f5f9),
      child: const Icon(Icons.water_drop_outlined, color: Color(0xff00459a)),
    );
  }
}
