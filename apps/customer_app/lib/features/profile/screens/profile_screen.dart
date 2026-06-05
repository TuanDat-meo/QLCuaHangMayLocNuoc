import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:customer_app/controllers/auth_controller.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<AuthController>().loadUserProfile());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text('Tài khoản',
            style: TextStyle(
                color: Color(0xff0b1c30),
                fontWeight: FontWeight.w900,
                fontSize: 18)),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined, color: Color(0xff64748b)),
            onPressed: () => Navigator.pushNamed(context, '/edit-profile'),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Consumer<AuthController>(
        builder: (context, auth, _) {
          final user = auth.currentUser;
          final customer = auth.customerUser;

          if (auth.isLoading && customer == null) {
            return const Center(child: CircularProgressIndicator());
          }

          return RefreshIndicator(
            onRefresh: () => auth.loadUserProfile(),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  // Profile Header Card
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(30),
                      boxShadow: [
                        BoxShadow(
                            color: Colors.black.withOpacity(0.02),
                            blurRadius: 20,
                            offset: const Offset(0, 10))
                      ],
                    ),
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 50,
                          backgroundColor: const Color(0xffeff6ff),
                          backgroundImage: (user?.avatar != null)
                              ? NetworkImage(user!.avatar!)
                              : null,
                          child: (user?.avatar == null)
                              ? const Icon(Icons.person,
                                  size: 50, color: Color(0xff00459a))
                              : null,
                        ),
                        const SizedBox(height: 16),
                        Text(customer?.name ?? user?.displayName ?? 'Khách hàng',
                            style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w900,
                                color: Color(0xff0b1c30))),
                        const SizedBox(height: 4),
                        Text(customer?.email ?? user?.email ?? '',
                            style: const TextStyle(
                                color: Color(0xff94a3b8),
                                fontWeight: FontWeight.w500)),
                        const SizedBox(height: 24),
                        // Stats Row
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildStatItem('Đơn hàng', '${customer?.orderCount ?? 0}'),
                            Container(
                                width: 1, height: 30, color: const Color(0xfff1f5f9)),
                            _buildStatItem('Đánh giá',
                                customer?.averageRating?.toStringAsFixed(1) ?? '5.0'),
                            Container(
                                width: 1, height: 30, color: const Color(0xfff1f5f9)),
                            _buildStatItem('Hạng', 'Bạc'),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  // Menu List
                  _buildMenuSection([
                    _MenuItem(Icons.receipt_long_outlined, 'Lịch sử đơn hàng',
                        () => Navigator.pushNamed(context, '/orders')),
                    _MenuItem(Icons.location_on_outlined, 'Địa chỉ nhận hàng', 
                        () => Navigator.pushNamed(context, '/addresses')),
                    _MenuItem(Icons.favorite_border_rounded, 'Sản phẩm yêu thích', 
                        () => Navigator.pushNamed(context, '/favorites')),
                  ]),
                  const SizedBox(height: 16),
                  _buildMenuSection([
                    _MenuItem(Icons.help_outline_rounded, 'Trung tâm hỗ trợ', 
                        () => Navigator.pushNamed(context, '/support')),
                    _MenuItem(Icons.info_outline_rounded, 'Về Aquacare', () {}),
                  ]),
                  const SizedBox(height: 24),
                  // Logout Button
                  SizedBox(
                    width: double.infinity,
                    child: TextButton(
                      onPressed: () async {
                        await auth.logout();
                        if (context.mounted) {
                          Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
                        }
                      },
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20)),
                        backgroundColor: Colors.red.withOpacity(0.05),
                      ),
                      child: const Text('ĐĂNG XUẤT',
                          style: TextStyle(
                              color: Colors.redAccent,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 1.5,
                              fontSize: 12)),
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Column(
      children: [
        Text(value,
            style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w900,
                color: Color(0xff00459a))),
        const SizedBox(height: 4),
        Text(label,
            style: const TextStyle(
                fontSize: 11,
                color: Color(0xff94a3b8),
                fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildMenuSection(List<_MenuItem> items) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xfff1f5f9)),
      ),
      child: Column(
        children: items.map((item) {
          bool isLast = items.indexOf(item) == items.length - 1;
          return Column(
            children: [
              ListTile(
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                      color: const Color(0xfff8fafc),
                      borderRadius: BorderRadius.circular(10)),
                  child: Icon(item.icon, color: const Color(0xff00459a), size: 20),
                ),
                title: Text(item.title,
                    style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Color(0xff1e293b))),
                trailing: const Icon(Icons.chevron_right_rounded,
                    color: Color(0xffcbd5e1)),
                onTap: item.onTap,
              ),
              if (!isLast)
                const Divider(
                    height: 1, indent: 60, endIndent: 20, color: Color(0xfff8fafc)),
            ],
          );
        }).toList(),
      ),
    );
  }
}

class _MenuItem {
  final IconData icon;
  final String title;
  final VoidCallback onTap;
  _MenuItem(this.icon, this.title, this.onTap);
}
