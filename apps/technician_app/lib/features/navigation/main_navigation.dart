import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:shared/theme/app_colors.dart';
import '../../controllers/auth_controller.dart';
import '../../controllers/job_controller.dart';
import '../home/screens/job_dashboard_screen.dart';
import '../calendar/screens/calendar_screen.dart';
import '../notifications/screens/notifications_screen.dart';
import '../profile/screens/profile_settings_screen.dart';

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const JobDashboardScreen(),
    const CalendarScreen(),
    const NotificationsScreen(),
    const ProfileSettingsScreen(),
  ];

  @override
  void initState() {
    super.initState();
    _checkFirstLogin();
  }

  void _checkFirstLogin() {
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final authController = context.read<AuthController>();
      final user = authController.currentUser;
      if (user != null) {
        try {
          final doc = await FirebaseFirestore.instance
              .collection('nguoiDung')
              .doc(user.uid)
              .get();
          
          if (doc.exists && doc.data()?['lanDauDangNhap'] == true && mounted) {
            Navigator.of(context).pushReplacementNamed('/force-change-password');
          }
        } catch (e) {
          print('First login check error: $e');
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    // Lấy số lượng thông báo chưa đọc từ JobController
    final jobController = context.watch<JobController>();
    final unreadNotis = jobController.notifications.where((n) => n['read'] == false).length;

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.white,
          selectedItemColor: AppColors.primary,
          unselectedItemColor: const Color(0xff94a3b8),
          selectedLabelStyle: const TextStyle(
            fontWeight: FontWeight.w800,
            fontSize: 11,
            fontFamily: 'Inter',
          ),
          unselectedLabelStyle: const TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 11,
            fontFamily: 'Inter',
          ),
          elevation: 0,
          items: [
            const BottomNavigationBarItem(
              icon: Icon(Icons.assignment_outlined, size: 22),
              activeIcon: Icon(Icons.assignment, size: 24),
              label: 'Nhiệm vụ',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.calendar_month_outlined, size: 22),
              activeIcon: Icon(Icons.calendar_month, size: 24),
              label: 'Lịch làm',
            ),
            BottomNavigationBarItem(
              icon: Stack(
                children: [
                  const Icon(Icons.notifications_outlined, size: 22),
                  if (unreadNotis > 0)
                    Positioned(
                      right: 0,
                      top: 0,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: AppColors.error,
                          shape: BoxShape.circle,
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 16,
                          minHeight: 16,
                        ),
                        child: Text(
                          unreadNotis.toString(),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                ],
              ),
              activeIcon: Stack(
                children: [
                  const Icon(Icons.notifications, size: 24),
                  if (unreadNotis > 0)
                    Positioned(
                      right: 0,
                      top: 0,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: AppColors.error,
                          shape: BoxShape.circle,
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 16,
                          minHeight: 16,
                        ),
                        child: Text(
                          unreadNotis.toString(),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                ],
              ),
              label: 'Thông báo',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.person_outline, size: 22),
              activeIcon: Icon(Icons.person, size: 24),
              label: 'Hồ sơ',
            ),
          ],
        ),
      ),
    );
  }
}
