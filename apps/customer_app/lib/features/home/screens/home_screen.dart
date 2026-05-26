import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:customer_app/controllers/auth_controller.dart';
import 'package:customer_app/controllers/cart_controller.dart';
import 'package:customer_app/controllers/product_controller.dart';
import 'package:customer_app/features/products/screens/products_screen.dart';
import 'package:customer_app/features/cart/screens/cart_checkout_screen.dart';
import 'package:customer_app/features/profile/screens/profile_screen.dart';
import 'package:customer_app/models/product_model.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    const _HomeDashboard(),
    const ProductsScreen(),
    const CartScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        height: 85,
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 20,
              offset: const Offset(0, -5),
            )
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildNavItem(0, Icons.home_outlined, 'Trang chủ'),
            _buildSpecialNavItem(1, Icons.water_drop_outlined, 'Sản phẩm'),
            _buildCartNavItem(2, Icons.shopping_basket_outlined, 'Giỏ hàng'),
            _buildNavItem(3, Icons.person_outline, 'Tài khoản'),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    bool isSelected = _selectedIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedIndex = index),
      child: Container(
        color: Colors.transparent,
        padding: const EdgeInsets.symmetric(horizontal: 10),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon,
                color: isSelected ? const Color(0xff00459a) : const Color(0xff94a3b8),
                size: 24),
            const SizedBox(height: 4),
            Text(label,
                style: TextStyle(
                    color: isSelected ? const Color(0xff00459a) : const Color(0xff94a3b8),
                    fontSize: 10,
                    fontWeight: isSelected ? FontWeight.w900 : FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildCartNavItem(int index, IconData icon, String label) {
    bool isSelected = _selectedIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedIndex = index),
      child: Container(
        color: Colors.transparent,
        padding: const EdgeInsets.symmetric(horizontal: 10),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Icon(icon,
                    color: isSelected ? const Color(0xff00459a) : const Color(0xff94a3b8),
                    size: 24),
                Consumer<CartController>(
                  builder: (context, cart, _) => cart.items.isEmpty
                      ? const SizedBox()
                      : Positioned(
                          top: -4,
                          right: -4,
                          child: Container(
                            padding: const EdgeInsets.all(2),
                            decoration: BoxDecoration(
                                color: Colors.redAccent,
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 1.5)),
                            constraints: const BoxConstraints(
                                minWidth: 14, minHeight: 14),
                            child: Text(
                              '${cart.items.length}',
                              style: const TextStyle(
                                  color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(label,
                style: TextStyle(
                    color: isSelected ? const Color(0xff00459a) : const Color(0xff94a3b8),
                    fontSize: 10,
                    fontWeight: isSelected ? FontWeight.w900 : FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildSpecialNavItem(int index, IconData icon, String label) {
    bool isSelected = _selectedIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedIndex = index),
      child: Container(
        color: Colors.transparent,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xff7dd3fc).withOpacity(0.8) : Colors.transparent,
                shape: BoxShape.circle,
              ),
              child: Icon(icon,
                  color: isSelected ? Colors.white : const Color(0xff94a3b8),
                  size: 26),
            ),
            const SizedBox(height: 2),
            Text(label,
                style: TextStyle(
                    color: isSelected ? const Color(0xff00459a) : const Color(0xff94a3b8),
                    fontSize: 10,
                    fontWeight: isSelected ? FontWeight.w900 : FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}

class _HomeDashboard extends StatelessWidget {
  const _HomeDashboard();

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final productController = context.watch<ProductController>();

    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 100,
            floating: true,
            backgroundColor: Colors.white,
            elevation: 0,
            flexibleSpace: FlexibleSpaceBar(
              titlePadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              title: Row(
                children: [
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Xin chào,', 
                          style: TextStyle(color: Color(0xff94a3b8), fontSize: 10, fontWeight: FontWeight.bold)),
                      Text('${auth.currentUser?.displayName ?? 'Khách hàng'} 👋',
                          style: const TextStyle(color: Color(0xff0b1c30), fontSize: 14, fontWeight: FontWeight.w900)),
                    ],
                  ),
                ],
              ),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.notifications_none_rounded, color: Color(0xff00459a)),
                onPressed: () => Navigator.pushNamed(context, '/notifications'),
              ),
              const SizedBox(width: 8),
            ],
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Promo Banner
                  Container(
                    width: double.infinity,
                    height: 160,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xff00459a), Color(0xff0062db)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xff00459a).withOpacity(0.3),
                          blurRadius: 15,
                          offset: const Offset(0, 8),
                        )
                      ],
                    ),
                    child: Stack(
                      children: [
                        Positioned(
                          right: -20,
                          bottom: -20,
                          child: Icon(Icons.water_drop, size: 150, color: Colors.white.withOpacity(0.1)),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Text('Ưu đãi tháng 5', 
                                  style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold, fontSize: 12)),
                              const SizedBox(height: 4),
                              const Text('MIỄN PHÍ LẮP ĐẶT\nCHO MÁY LỌC RO',
                                  style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900, height: 1.2)),
                              const SizedBox(height: 12),
                              ElevatedButton(
                                onPressed: () {},
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.white,
                                  foregroundColor: const Color(0xff00459a),
                                  padding: const EdgeInsets.symmetric(horizontal: 16),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                                child: const Text('XEM NGAY', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900)),
                              )
                            ],
                          ),
                        )
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Categories
                  const Text('Danh mục nhanh', 
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xff0b1c30))),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildCategoryIcon(context, Icons.opacity, 'Lọc RO', Colors.blue),
                      _buildCategoryIcon(context, Icons.waves, 'Máy Nano', Colors.cyan),
                      _buildCategoryIcon(context, Icons.bolt, 'Ion Kiềm', Colors.amber),
                      _buildCategoryIcon(context, Icons.settings_suggest, 'Linh kiện', Colors.teal),
                    ],
                  ),

                  const SizedBox(height: 32),

                  // Featured Products
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Sản phẩm gợi ý', 
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xff0b1c30))),
                      TextButton(
                        onPressed: () {},
                        child: const Text('Xem thêm', style: TextStyle(color: Color(0xff00459a), fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  
                  if (productController.isLoading)
                    const Center(child: CircularProgressIndicator())
                  else if (productController.products.isEmpty)
                    const Center(child: Text('Không có sản phẩm nào'))
                  else
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 0.8,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                      ),
                      itemCount: productController.products.length > 4 ? 4 : productController.products.length,
                      itemBuilder: (context, index) => _FeaturedProductCard(product: productController.products[index]),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryIcon(BuildContext context, IconData icon, String label, Color color) {
    return GestureDetector(
      onTap: () {
        // Switch to Products tab and filter
        // This logic would need access to HomeScreen's state to change index
      },
      child: Column(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: color),
          ),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xff64748b))),
        ],
      ),
    );
  }
}

class _FeaturedProductCard extends StatelessWidget {
  final Product product;
  const _FeaturedProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.pushNamed(context, '/product-detail', arguments: product),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xfff1f5f9)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: const Color(0xfff8fafc),
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                  image: product.imageUrls.isNotEmpty 
                      ? DecorationImage(image: NetworkImage(product.imageUrls.first), fit: BoxFit.cover)
                      : null,
                ),
                child: product.imageUrls.isEmpty 
                    ? const Center(child: Icon(Icons.image, color: Color(0xffcbd5e1)))
                    : null,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.name, 
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xff1e293b))),
                  const SizedBox(height: 4),
                  Text('₫${product.price.toStringAsFixed(0).replaceAllMapped(RegExp(r"(\d{1,3})(?=(\d{3})+(?!\d))"), (m) => "${m[1]}.")}', 
                      style: const TextStyle(color: Color(0xff00459a), fontWeight: FontWeight.w900, fontSize: 14)),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}
