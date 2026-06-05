import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:customer_app/models/product_model.dart';
import 'package:customer_app/controllers/product_controller.dart';
import 'package:customer_app/controllers/cart_controller.dart';

class ProductsScreen extends StatefulWidget {
  const ProductsScreen({super.key});

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  String _selectedCategory = 'Tất cả';
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<ProductController>().loadProducts());
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final productController = context.watch<ProductController>();

    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.menu, color: Color(0xff00459a)),
          onPressed: () {},
        ),
        title: const Text(
          'Sản phẩm',
          style: TextStyle(color: Color(0xff0b1c30), fontWeight: FontWeight.w900, fontSize: 18),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.shopping_basket_outlined, color: Color(0xff00459a)),
            onPressed: () => Navigator.pushNamed(context, '/cart'),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xfff1f5f9),
                borderRadius: BorderRadius.circular(12),
              ),
              child: TextField(
                controller: _searchController,
                onChanged: (value) => context.read<ProductController>().searchProducts(value),
                decoration: InputDecoration(
                  hintText: 'Tìm kiếm sản phẩm...',
                  hintStyle: const TextStyle(color: Color(0xff94a3b8), fontSize: 14),
                  prefixIcon: const Icon(Icons.search, color: Color(0xff94a3b8), size: 20),
                  suffixIcon: _searchController.text.isNotEmpty 
                    ? IconButton(icon: const Icon(Icons.clear, size: 18), onPressed: () {
                        _searchController.clear();
                        context.read<ProductController>().searchProducts('');
                      })
                    : null,
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
          ),
          // Categories
          SizedBox(
            height: 38,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: ['Tất cả', 'Máy lọc RO', 'Máy Nano', 'Máy lọc nước ion']
                  .map((cat) => _buildCategoryChip(cat))
                  .toList(),
            ),
          ),
          const SizedBox(height: 16),
          // Product Grid
          Expanded(
            child: productController.isLoading
              ? const Center(child: CircularProgressIndicator())
              : productController.products.isEmpty
                ? const Center(child: Text('Không tìm thấy sản phẩm phù hợp'))
                : GridView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.64,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                    ),
                    itemCount: productController.products.length,
                    itemBuilder: (context, index) => _ProductCard(product: productController.products[index]),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(String label) {
    bool isSelected = _selectedCategory == label;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: GestureDetector(
        onTap: () {
          setState(() => _selectedCategory = label);
          context.read<ProductController>().filterByCategory(label);
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xff00459a) : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: isSelected ? const Color(0xff00459a) : const Color(0xffe2e8f0)),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? Colors.white : const Color(0xff64748b),
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ),
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final Product product;
  const _ProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    final String imageUrl = product.imageUrls.isNotEmpty 
        ? product.imageUrls.first 
        : 'https://via.placeholder.com/150';

    return GestureDetector(
      onTap: () => Navigator.pushNamed(context, '/product-detail', arguments: product),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                    child: Image.network(
                      imageUrl,
                      width: double.infinity,
                      height: double.infinity,
                      fit: BoxFit.cover,
                      loadingBuilder: (context, child, loadingProgress) {
                        if (loadingProgress == null) return child;
                        return Container(
                          color: const Color(0xfff1f5f9),
                          child: const Center(
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                        );
                      },
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: const Color(0xfff1f5f9),
                          width: double.infinity,
                          height: double.infinity,
                          child: const Icon(Icons.broken_image, color: Colors.grey),
                        );
                      },
                    ),
                  ),
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: product.isAvailable ? const Color(0xffccfbf1) : const Color(0xfff1f5f9),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        product.isAvailable ? 'Còn hàng' : 'Hết hàng',
                        style: TextStyle(
                          color: product.isAvailable ? const Color(0xff0d9488) : const Color(0xff64748b),
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
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
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xff1e293b)),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '₫${product.price.toStringAsFixed(0).replaceAllMapped(RegExp(r"(\d{1,3})(?=(\d{3})+(?!\d))"), (m) => "${m[1]}.")}',
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xff00459a)),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: product.isAvailable ? () {
                        context.read<CartController>().addToCart(
                          productId: product.id,
                          productName: product.name,
                          price: product.price,
                          quantity: 1,
                          imageUrl: product.imageUrls.isNotEmpty ? product.imageUrls.first : null,
                        );
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Đã thêm vào giỏ'), duration: Duration(milliseconds: 500))
                        );
                      } : null,
                      icon: Icon(Icons.add_shopping_cart, size: 14, color: product.isAvailable ? const Color(0xff00459a) : Colors.grey),
                      label: Text(
                        product.isAvailable ? 'Thêm vào giỏ' : 'Tạm hết hàng',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: product.isAvailable ? const Color(0xff00459a) : Colors.grey),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: product.isAvailable ? const Color(0xffe2e8f0) : Colors.transparent),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        backgroundColor: product.isAvailable ? Colors.transparent : const Color(0xfff1f5f9),
                      ),
                    ),
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
