import 'package:flutter/material.dart';
import 'package:customer_app/features/products/screens/products_screen.dart';

class FavoritesScreen extends StatelessWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      appBar: AppBar(
        title: const Text('Sản phẩm yêu thích'),
        backgroundColor: Colors.white,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.favorite_border_rounded, size: 80, color: Colors.grey.shade300),
            const SizedBox(height: 16),
            const Text('Danh sách yêu thích trống', style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('TIẾP TỤC MUA SẮM'),
            ),
          ],
        ),
      ),
    );
  }
}
