import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:customer_app/models/product_model.dart';
import 'package:customer_app/controllers/cart_controller.dart';

class ProductDetailScreen extends StatelessWidget {
  final Product product;

  const ProductDetailScreen({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          // Header with Image
          SliverAppBar(
            expandedHeight: 350,
            pinned: true,
            backgroundColor: Colors.white,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back, color: Color(0xff0b1c30)),
              onPressed: () => Navigator.pop(context),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: BoxDecoration(
                  image: DecorationImage(
                    image: NetworkImage(product.imageUrls.isNotEmpty ? product.imageUrls.first : 'https://via.placeholder.com/400'),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ),
          ),
          
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category & Status
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(color: const Color(0xffeff6ff), borderRadius: BorderRadius.circular(8)),
                        child: Text(product.category.toUpperCase(), style: const TextStyle(color: Color(0xff3b82f6), fontSize: 10, fontWeight: FontWeight.bold)),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: product.isAvailable ? const Color(0xffccfbf1) : const Color(0xfff1f5f9),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          product.isAvailable ? 'SẴN HÀNG' : 'HẾT HÀNG',
                          style: TextStyle(
                            color: product.isAvailable ? const Color(0xff0d9488) : const Color(0xff64748b),
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  
                  // Product Name
                  Text(
                    product.name,
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xff0b1c30), letterSpacing: -0.5),
                  ),
                  const SizedBox(height: 12),
                  
                  // Price
                  Text(
                    '₫${product.price.toStringAsFixed(0).replaceAllMapped(RegExp(r"(\d{1,3})(?=(\d{3})+(?!\d))"), (m) => "${m[1]}.")}',
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xff00459a)),
                  ),
                  const SizedBox(height: 24),
                  const Divider(color: Color(0xfff1f5f9)),
                  const SizedBox(height: 24),
                  
                  // Description
                  const Text('Mô tả sản phẩm', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xff0b1c30))),
                  const SizedBox(height: 12),
                  Text(
                    product.description,
                    style: const TextStyle(fontSize: 14, color: Color(0xff64748b), height: 1.6),
                  ),
                  const SizedBox(height: 32),
                  
                  // Specifications
                  const Text('Thông số kỹ thuật', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xff0b1c30))),
                  const SizedBox(height: 16),
                  _buildSpecRow('Thương hiệu', 'Aquacare'),
                  _buildSpecRow('Model', product.specs.model ?? 'N/A'),
                  _buildSpecRow('Công suất', '${product.specs.capacity ?? 'N/A'} L/h'),
                  _buildSpecRow('Bảo hành', '${product.specs.warrantyYears ?? 2} năm'),
                  const SizedBox(height: 100), // Space for bottom button
                ],
              ),
            ),
          ),
        ],
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, -5))],
        ),
        child: Row(
          children: [
            Container(
              height: 56,
              width: 56,
              decoration: BoxDecoration(color: const Color(0xfff1f5f9), borderRadius: BorderRadius.circular(16)),
              child: const Icon(Icons.favorite_border, color: Color(0xff00459a)),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: SizedBox(
                height: 56,
                child: ElevatedButton(
                  onPressed: product.isAvailable ? () {
                    context.read<CartController>().addToCart(
                      productId: product.id,
                      productName: product.name,
                      price: product.price,
                      quantity: 1,
                      imageUrl: product.imageUrls.isNotEmpty ? product.imageUrls.first : null,
                    );
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Đã thêm vào giỏ hàng')));
                  } : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xff00459a),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('THÊM VÀO GIỎ', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSpecRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 14, color: Color(0xff94a3b8), fontWeight: FontWeight.w500)),
          Text(value, style: const TextStyle(fontSize: 14, color: Color(0xff0b1c30), fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
