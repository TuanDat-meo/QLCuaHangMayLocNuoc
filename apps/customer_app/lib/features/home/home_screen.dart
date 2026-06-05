import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:customer_app/controllers/cart_controller.dart';
import 'package:customer_app/features/products/screens/products_screen.dart';
import 'package:customer_app/features/cart/screens/checkout_screen.dart';
import 'package:customer_app/features/profile/screens/profile_screen.dart';
import 'package:customer_app/features/home/home_dashboard.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  String? _categoryFilter;

  void _onTabChange(int index) {
    setState(() => _selectedIndex = index);
  }

  void _onCategoryFilter(String category) {
    setState(() => _categoryFilter = category);
  }

  List<Widget> get _screens => [
    HomeDashboard(
      onTabChange: _onTabChange,
      onCategoryFilter: _onCategoryFilter,
    ),
    const ProductsScreen(),
    const CheckoutScreen(),
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
    final isSelected = _selectedIndex == index;
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
    final isSelected = _selectedIndex == index;
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
                            constraints:
                                const BoxConstraints(minWidth: 14, minHeight: 14),
                            child: Text(
                              '${cart.items.length}',
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 8,
                                  fontWeight: FontWeight.bold),
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
    final isSelected = _selectedIndex == index;
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
                color: isSelected
                    ? const Color(0xff7dd3fc).withOpacity(0.8)
                    : Colors.transparent,
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