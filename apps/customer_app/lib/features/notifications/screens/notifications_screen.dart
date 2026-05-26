// Notifications Screen
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:customer_app/models/notification_model.dart';
import 'package:customer_app/controllers/notification_controller.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => context.read<NotificationController>().loadNotifications(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Thông báo'),
        actions: [
          Consumer<NotificationController>(
            builder: (context, notificationController, _) => 
              notificationController.hasUnread
                  ? PopupMenuButton(
                      itemBuilder: (_) => [
                        const PopupMenuItem(
                          value: 'mark_read',
                          child: Text('Đánh dấu tất cả đã đọc'),
                        ),
                        const PopupMenuItem(
                          value: 'delete_all',
                          child: Text('Xóa tất cả'),
                        ),
                      ],
                      onSelected: (value) {
                        if (value == 'mark_read') {
                          context.read<NotificationController>().markAllAsRead();
                        } else if (value == 'delete_all') {
                          context.read<NotificationController>().deleteAll();
                        }
                      },
                    )
                  : const SizedBox.shrink(),
          ),
        ],
      ),
      body: Consumer<NotificationController>(
        builder: (context, notificationController, _) {
          if (notificationController.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (notificationController.notifications.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.notifications_none_outlined, size: 64, color: Colors.grey),
                  const SizedBox(height: 16),
                  const Text('Không có thông báo nào'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Quay lại'),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => notificationController.loadNotifications(),
            child: ListView.builder(
              padding: const EdgeInsets.all(8),
              itemCount: notificationController.notifications.length,
              itemBuilder: (context, index) {
                final notification = notificationController.notifications[index];
                return NotificationCard(
                  notification: notification,
                  onTap: () {
                    _handleNotificationTap(notification);
                  },
                  onDismiss: () {
                    context.read<NotificationController>().deleteNotification(notification.id);
                  },
                );
              },
            ),
          );
        },
      ),
    );
  }

  void _handleNotificationTap(AppNotification notification) {
    context.read<NotificationController>().markAsRead(notification.id);

    switch (notification.type) {
      case 'order_status':
        if (notification.data?['orderId'] != null) {
          Navigator.pushNamed(context, '/order-detail', arguments: notification.data?['orderId']);
        }
        break;
      case 'assignment':
        if (notification.data?['orderId'] != null) {
          Navigator.pushNamed(context, '/order-detail', arguments: notification.data?['orderId']);
        }
        break;
      case 'promo':
        Navigator.pushNamed(context, '/products');
        break;
      default:
        break;
    }
  }
}

class NotificationCard extends StatelessWidget {
  final AppNotification notification;
  final VoidCallback onTap;
  final VoidCallback onDismiss;

  const NotificationCard({
    super.key,
    required this.notification,
    required this.onTap,
    required this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    return Dismissible(
      key: Key(notification.id),
      direction: DismissDirection.endToStart,
      onDismissed: (_) => onDismiss(),
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 16),
        color: Colors.red,
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      child: Card(
        margin: const EdgeInsets.symmetric(vertical: 4),
        color: notification.isRead ? Colors.white : Colors.indigo.withOpacity(0.05),
        child: ListTile(
          onTap: onTap,
          leading: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: _getNotificationColor(notification.type),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              _getNotificationIcon(notification.type),
              color: Colors.white,
            ),
          ),
          title: Text(
            notification.title,
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: notification.isRead ? FontWeight.normal : FontWeight.bold,
                ),
          ),
          subtitle: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 4),
              Text(
                notification.body,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 4),
              Text(
                _formatTime(notification.createdAt),
                style: Theme.of(context).textTheme.labelSmall?.copyWith(color: Colors.grey),
              ),
            ],
          ),
          trailing: notification.isRead
              ? null
              : Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Colors.indigo,
                    shape: BoxShape.circle,
                  ),
                ),
          isThreeLine: true,
        ),
      ),
    );
  }

  Color _getNotificationColor(String type) {
    switch (type) {
      case 'order_status':
        return Colors.orange;
      case 'assignment':
        return Colors.blue;
      case 'promo':
        return Colors.green;
      case 'system':
        return Colors.indigo;
      default:
        return Colors.grey;
    }
  }

  IconData _getNotificationIcon(String type) {
    switch (type) {
      case 'order_status':
        return Icons.local_shipping_outlined;
      case 'assignment':
        return Icons.person_outline;
      case 'promo':
        return Icons.local_offer_outlined;
      case 'system':
        return Icons.notifications_outlined;
      default:
        return Icons.notifications_outlined;
    }
  }

  String _formatTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inMinutes < 1) {
      return 'Vừa xong';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes} phút trước';
    } else if (difference.inHours < 24) {
      return '${difference.inHours} giờ trước';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} ngày trước';
    } else {
      return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
    }
  }
}
