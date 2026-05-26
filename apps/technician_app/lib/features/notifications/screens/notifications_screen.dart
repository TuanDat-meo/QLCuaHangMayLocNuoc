import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:shared/theme/app_colors.dart';
import '../../../controllers/job_controller.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final jobController = context.watch<JobController>();
    final notis = jobController.notifications;

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text('TRUNG TÂM THÔNG BÁO'),
        actions: [
          if (notis.any((n) => n['read'] == false))
            IconButton(
              icon: const Icon(Icons.mark_email_read_outlined, color: AppColors.primary),
              tooltip: 'Đọc tất cả',
              onPressed: () {
                context.read<JobController>().markAllNotificationsAsRead();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Đã đánh dấu tất cả là đã đọc!')),
                );
              },
            ),
        ],
      ),
      body: notis.isEmpty
          ? _buildEmptyState()
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: notis.length,
              itemBuilder: (context, index) {
                final noti = notis[index];
                return _buildNotificationCard(context, noti);
              },
            ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xfff1f5f9), width: 2),
            ),
            child: const Icon(
              Icons.notifications_off_outlined,
              size: 40,
              color: Color(0xff94a3b8),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Hộp thư thông báo trống',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: Color(0xff64748b),
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Bạn sẽ nhận được thông báo khi có lịch phân công mới.',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Color(0xffcbd5e1),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationCard(BuildContext context, Map<String, dynamic> noti) {
    final bool isUnread = noti['read'] == false;
    final DateTime time = noti['time'] as DateTime;
    final timeStr = DateFormat('HH:mm - dd/MM/yyyy').format(time);

    IconData iconData = Icons.notifications;
    Color iconColor = AppColors.primary;
    Color bgColor = AppColors.primary.withOpacity(0.08);

    if (noti['type'] == 'phan_cong') {
      iconData = Icons.assignment_outlined;
      iconColor = const Color(0xff0d9488); // Teal
      bgColor = const Color(0xff0d9488).withOpacity(0.08);
    } else if (noti['type'] == 'bao_tri') {
      iconData = Icons.build_circle_outlined;
      iconColor = const Color(0xffea580c); // Orange
      bgColor = const Color(0xffea580c).withOpacity(0.08);
    } else if (noti['type'] == 'bao_hanh') {
      iconData = Icons.verified_user_outlined;
      iconColor = const Color(0xffef4444); // Red
      bgColor = const Color(0xffef4444).withOpacity(0.08);
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: isUnread ? Colors.white : const Color(0xfff8fafc),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isUnread ? AppColors.primary.withOpacity(0.15) : const Color(0xfff1f5f9),
          width: isUnread ? 1.5 : 1.0,
        ),
        boxShadow: isUnread
            ? [
                BoxShadow(
                  color: AppColors.primary.withOpacity(0.04),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                )
              ]
            : null,
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: () {
            // Đánh dấu đã đọc
            context.read<JobController>().markNotificationAsRead(noti['id']);
            
            // Điều hướng đến chi tiết công việc nếu có tham chiếu ID
            if (noti['refId'] != null && noti['refId'].toString().isNotEmpty) {
              Navigator.pushNamed(context, '/job-detail', arguments: noti['refId']);
            }
          },
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Icon loại thông báo
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: bgColor,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(iconData, color: iconColor, size: 20),
                ),
                const SizedBox(width: 14),

                // Nội dung thông báo
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              noti['title'] ?? '',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: isUnread ? FontWeight.w900 : FontWeight.w700,
                                color: AppColors.onSurface,
                              ),
                            ),
                          ),
                          if (isUnread)
                            Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(
                                color: AppColors.primary,
                                shape: BoxShape.circle,
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        noti['body'] ?? '',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: isUnread ? FontWeight.w600 : FontWeight.w500,
                          color: const Color(0xff475569),
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        timeStr,
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: Color(0xff94a3b8),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
