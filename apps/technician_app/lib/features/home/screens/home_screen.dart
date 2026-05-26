import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:technician_app/controllers/auth_controller.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authController = context.watch<AuthController>();
    final user = authController.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text('AquaCare - Kỹ thuật viên'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => authController.logout(),
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.engineering, size: 80, color: Colors.orange),
            const SizedBox(height: 24),
            Text(
              'Xin chào, ${user?.displayName ?? 'Kỹ thuật viên'}!',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text('Email: ${user?.email ?? ''}'),
            const SizedBox(height: 32),
            const Text('Hệ thống đang được cập nhật các tính năng quản lý công việc.'),
          ],
        ),
      ),
    );
  }
}
