import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:customer_app/controllers/cart_controller.dart';
import 'package:customer_app/controllers/product_controller.dart';
import 'package:customer_app/models/product_model.dart';

class FeaturedProductsWidget extends StatelessWidget {
  final VoidCallback? onViewAll;

  const FeaturedProductsWidget({super.key, this.onViewAll});

  @override
  Widget build(BuildContext context) {
    final productController = context.watch<ProductController>();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // --- Sản phẩm nổi bật (horizontal scroll) ---
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 4,
                    height: 20,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xff00459a), Color(0xff0062db)],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(width: 10),
                  const Text(
                    'Sản phẩm nổi bật',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: Color(0xff0b1c30),
                    ),
                  ),
                ],
              ),
              GestureDetector(
                onTap: onViewAll,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xffe0f2fe),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'Xem thêm →',
                    style: TextStyle(
                      color: Color(0xff00459a),
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        if (productController.isLoading)
          _buildLoadingShimmer()
        else if (productController.products.isEmpty)
          _buildEmptyState()
        else
          SizedBox(
            height: 230,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              physics: const BouncingScrollPhysics(),
              itemCount: productController.products.length > 6
                  ? 6
                  : productController.products.length,
              itemBuilder: (context, index) => _FeaturedProductCard(
                product: productController.products[index],
              ),
            ),
          ),

        const SizedBox(height: 24),

        // --- Bán chạy nhất (grid) ---
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            children: [
              Container(
                width: 4,
                height: 20,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xffd97706), Color(0xfff59e0b)],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(width: 10),
              const Text(
                'Bán chạy nhất',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: Color(0xff0b1c30),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xfffef3c7),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Text(
                  '🔥 HOT',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: Color(0xffd97706),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        if (!productController.isLoading && productController.products.isNotEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.78,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: productController.products.length > 4
                  ? 4
                  : productController.products.length,
              itemBuilder: (context, index) => _GridProductCard(
                product: productController.products[index],
                rank: index + 1,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildLoadingShimmer() {
    return SizedBox(
      height: 230,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: 4,
        itemBuilder: (context, index) => Container(
          width: 160,
          margin: const EdgeInsets.only(right: 12),
          decoration: BoxDecoration(
            color: const Color(0xffe2e8f0),
            borderRadius: BorderRadius.circular(20),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          children: [
            Icon(Icons.inventory_2_outlined, size: 48, color: Colors.grey.shade300),
            const SizedBox(height: 12),
            const Text('Chưa có sản phẩm nào',
                style: TextStyle(color: Color(0xff94a3b8))),
          ],
        ),
      ),
    );
  }
}

// ── Horizontal card ──────────────────────────────────────────────────────────

class _FeaturedProductCard extends StatelessWidget {
  final Product product;
  const _FeaturedProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.pushNamed(context, '/product-detail', arguments: product),
      child: Container(
        width: 160,
        margin: const EdgeInsets.only(right: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              flex: 3,
              child: Stack(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      color: const Color(0xfff0f9ff),
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                      image: product.imageUrls.isNotEmpty
                          ? DecorationImage(
                              image: NetworkImage(product.imageUrls.first),
                              fit: BoxFit.cover,
                            )
                          : null,
                    ),
                    child: product.imageUrls.isEmpty
                        ? const Center(
                            child: Icon(Icons.water_drop_outlined,
                                size: 40, color: Color(0xffbae6fd)),
                          )
                        : null,
                  ),
                  if (product.category.isNotEmpty)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xff00459a).withValues(alpha: 0.85),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          product.category,
                          style: const TextStyle(
                              color: Colors.white, fontSize: 8, fontWeight: FontWeight.w700),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      product.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 12,
                          color: Color(0xff1e293b),
                          height: 1.3),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          _formatPrice(product.price),
                          style: const TextStyle(
                              color: Color(0xff00459a),
                              fontWeight: FontWeight.w900,
                              fontSize: 13),
                        ),
                        _AddToCartButton(product: product),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Grid card ─────────────────────────────────────────────────────────────────

class _GridProductCard extends StatelessWidget {
  final Product product;
  final int rank;
  const _GridProductCard({required this.product, required this.rank});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.pushNamed(context, '/product-detail', arguments: product),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xffe2e8f0)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      color: const Color(0xfff8fafc),
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                      image: product.imageUrls.isNotEmpty
                          ? DecorationImage(
                              image: NetworkImage(product.imageUrls.first),
                              fit: BoxFit.cover,
                            )
                          : null,
                    ),
                    child: product.imageUrls.isEmpty
                        ? const Center(
                            child: Icon(Icons.image, color: Color(0xffcbd5e1), size: 40))
                        : null,
                  ),
                  // Rank badge
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: rank == 1
                            ? const Color(0xfff59e0b)
                            : rank == 2
                                ? const Color(0xff94a3b8)
                                : rank == 3
                                    ? const Color(0xffcd7c3e)
                                    : const Color(0xffcbd5e1),
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text(
                          '#$rank',
                          style: const TextStyle(
                              color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900),
                        ),
                      ),
                    ),
                  ),
                  // Sắp hết badge
                  if ((product.tonKho ?? 0) <= product.nguongCanhBao)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xffef4444),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text(
  'Sắp hết',
  style: TextStyle(
    color: Colors.white, 
    fontSize: 8, 
    fontWeight: FontWeight.w700
  ),
),
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        fontWeight: FontWeight.w700, fontSize: 13, color: Color(0xff1e293b)),
                  ),
                  if (product.category.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(
                      product.category,
                      style: const TextStyle(
                          fontSize: 10, color: Color(0xff94a3b8), fontWeight: FontWeight.w500),
                    ),
                  ],
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _formatPrice(product.price),
                              style: const TextStyle(
                                  color: Color(0xff00459a),
                                  fontWeight: FontWeight.w900,
                                  fontSize: 14),
                            ),
                            if ((product.tonKho ?? 0) > 0)
                              Text(
                                'Tồn kho: ${product.tonKho}',
                                style: const TextStyle(
                                    fontSize: 9,
                                    color: Color(0xff64748b),
                                    fontWeight: FontWeight.w500),
                              ),
                          ],
                        ),
                      ),
                      _AddToCartButton(product: product),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Add to cart button ────────────────────────────────────────────────────────

class _AddToCartButton extends StatelessWidget {
  final Product product;
  const _AddToCartButton({required this.product});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        context.read<CartController>().addToCart(
              productId: product.id,
              productName: product.name,
              price: product.price,
              quantity: 1,
              imageUrl: product.imageUrls.isNotEmpty ? product.imageUrls.first : null,
            );
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Đã thêm vào giỏ hàng'),
            duration: const Duration(seconds: 1),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            backgroundColor: const Color(0xff00459a),
          ),
        );
      },
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xff00459a), Color(0xff0062db)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(10),
          boxShadow: [
            BoxShadow(
              color: const Color(0xff00459a).withValues(alpha: 0.3),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: const Icon(Icons.add, color: Colors.white, size: 18),
      ),
    );
  }
}

// ── Helper ────────────────────────────────────────────────────────────────────

String _formatPrice(double price) {
  final formatted = price.toStringAsFixed(0).replaceAllMapped(
    RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
    (m) => '${m[1]}.',
  );
  return '₫$formatted';
}