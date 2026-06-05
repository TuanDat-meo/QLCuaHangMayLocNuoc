// lib/features/orders/order_tracking_screen.dart

import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:customer_app/controllers/order_controller.dart';

class OrderTrackingScreen extends StatefulWidget {
  const OrderTrackingScreen({super.key});

  @override
  State<OrderTrackingScreen> createState() => _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends State<OrderTrackingScreen> {
  late String _orderId;
  late String _orderCode;
  bool _isCancelling = false;

  String _formatCurrency(double value) => value
      .toStringAsFixed(0)
      .replaceAllMapped(
          RegExp(r"(\d{1,3})(?=(\d{3})+(?!\d))"), (m) => "${m[1]}.");

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args =
        ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    _orderId = args['orderId'];
    _orderCode = args['orderCode'];
  }

  Future<void> _handleCancelOrder() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xác nhận hủy'),
        content: const Text('Bạn có chắc chắn muốn hủy đơn hàng này không?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('QUAY LẠI'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('HỦY ĐƠN', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      setState(() => _isCancelling = true);
      // Gọi cancelOrder từ OrderController đã được cập nhật
      final success = await context.read<OrderController>().cancelOrder(_orderId);
      if (mounted) {
        setState(() => _isCancelling = false);
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Đã hủy đơn hàng thành công')),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(context.read<OrderController>().error ?? 'Không thể hủy đơn hàng')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xff0b1c30)),
          onPressed: () =>
              Navigator.of(context).popUntil((route) => route.isFirst),
        ),
        title: const Text(
          'Theo dõi đơn hàng',
          style: TextStyle(
            color: Color(0xff0b1c30),
            fontWeight: FontWeight.w900,
            fontSize: 18,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pushNamed(context, '/orders'),
            child: const Text('LỊCH SỬ', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
          ),
        ],
      ),
      body: StreamBuilder<DocumentSnapshot>(
        stream: FirebaseFirestore.instance
            .collection('donHang')
            .doc(_orderId)
            .snapshots(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (!snapshot.hasData || !snapshot.data!.exists) {
            return const Center(child: Text('Không tìm thấy đơn hàng'));
          }

          final data = snapshot.data!.data() as Map<String, dynamic>;
          // Ưu tiên trangThai của Admin Web
          final status = data['trangThai'] ?? data['status'] ?? 'pending';
          final technicians = data['technicians'] as List? ?? [];

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                // Order code + status badge
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  padding: const EdgeInsets.all(20),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Mã đơn hàng',
                              style: TextStyle(
                                  fontSize: 12, color: Color(0xff94a3b8)),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              data['orderCode'] ?? _orderCode,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w900,
                                color: Color(0xff0b1c30),
                              ),
                            ),
                            const SizedBox(height: 4),
                            if (data['ngayTao'] != null || data['createdAt'] != null)
                              Text(
                                'Đặt lúc ${_formatTimestamp(data['ngayTao'] ?? data['createdAt'])}',
                                style: const TextStyle(
                                    fontSize: 11, color: Color(0xff94a3b8)),
                              ),
                          ],
                        ),
                      ),
                      _StatusBadge(status: status),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Tracking steps
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Tiến trình',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: Color(0xff0b1c30),
                        ),
                      ),
                      const SizedBox(height: 20),
                      _TrackingTimeline(status: status, data: data),
                    ],
                  ),
                ),

                // Technician card (show if assigned)
                if (technicians.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  _TechnicianCard(technicians: technicians),
                ],

                const SizedBox(height: 16),

                // Delivery info
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Thông tin lắp đặt',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                          color: Color(0xff0b1c30),
                        ),
                      ),
                      const SizedBox(height: 14),
                      _InfoRow(
                        icon: Icons.person_outline,
                        label: 'Khách hàng',
                        value: data['tenKhachHang'] ?? data['customerName'] ?? '---',
                      ),
                      _InfoRow(
                        icon: Icons.location_on_outlined,
                        label: 'Địa chỉ',
                        value: data['diaChiGiaoHang'] ?? _buildAddressString(data['deliveryAddress'] ?? {}),
                      ),
                      if (data['scheduledDate'] != null)
                        _InfoRow(
                          icon: Icons.calendar_today_outlined,
                          label: 'Ngày hẹn',
                          value: _formatScheduledDate(data['scheduledDate']),
                        ),
                      if (data['scheduledSlotLabel'] != null)
                        _InfoRow(
                          icon: Icons.access_time_outlined,
                          label: 'Khung giờ',
                          value: data['scheduledSlotLabel'],
                        ),
                    ],
                  ),
                ),

                // Products
                const SizedBox(height: 16),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Sản phẩm',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                          color: Color(0xff0b1c30),
                        ),
                      ),
                      const SizedBox(height: 14),
                      if (data['items'] != null)
                        ...(data['items'] as List).map((item) => Padding(
                              padding: const EdgeInsets.only(bottom: 10),
                              child: Row(
                                children: [
                                  Container(
                                    width: 48,
                                    height: 48,
                                    decoration: BoxDecoration(
                                      color: const Color(0xfff1f5f9),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: const Icon(
                                        Icons.water_drop_outlined,
                                        color: Color(0xff3b82f6),
                                        size: 22),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          item['name'] ?? item['productName'] ?? '',
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 13,
                                            color: Color(0xff1e293b),
                                          ),
                                        ),
                                        Text(
                                          'Số lượng: ${item['quantity']}',
                                          style: const TextStyle(
                                              fontSize: 11,
                                              color: Color(0xff94a3b8)),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Text(
                                    '${_formatCurrency((item['price'] as num? ?? 0).toDouble())} đ',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13,
                                      color: Color(0xff00459a),
                                    ),
                                  ),
                                ],
                              ),
                            )),
                      const Divider(height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Tổng thanh toán',
                              style: TextStyle(
                                  fontWeight: FontWeight.w900,
                                  fontSize: 14,
                                  color: Color(0xff0b1c30))),
                          Text(
                            '${_formatCurrency((data['tongTien'] ?? data['totalAmount'] as num? ?? 0).toDouble())} đ',
                            style: const TextStyle(
                              fontWeight: FontWeight.w900,
                              fontSize: 16,
                              color: Color(0xff00459a),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),
                
                // Nút hủy - Chỉ hiện khi đơn chờ duyệt và chưa phân công
                if (status == 'pending' && technicians.isEmpty)
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: _isCancelling ? null : _handleCancelOrder,
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        side: const BorderSide(color: Colors.redAccent),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: _isCancelling 
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.redAccent, strokeWidth: 2))
                        : const Text('HỦY ĐƠN HÀNG', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
                    ),
                  ),

                const SizedBox(height: 40),
              ],
            ),
          );
        },
      ),
    );
  }

  String _formatTimestamp(dynamic ts) {
    if (ts is Timestamp) {
      return DateFormat('HH:mm, d/M/yyyy').format(ts.toDate());
    }
    return '';
  }

  String _formatScheduledDate(dynamic ts) {
    if (ts is Timestamp) {
      return DateFormat('EEEE, d MMMM yyyy', 'vi').format(ts.toDate());
    }
    return '';
  }

  String _buildAddressString(Map<String, dynamic> addr) {
    if (addr.isEmpty) return '---';
    return '${addr['street'] ?? ''}, ${addr['ward'] ?? ''}, ${addr['district'] ?? ''}, ${addr['city'] ?? ''}';
  }
}

// ── Status Badge ────────────────────────────────────────────────────────────

class _StatusBadge extends StatelessWidget {
  final String status;

  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    final config = _statusConfig(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: config['bg'] as Color,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        config['label'] as String,
        style: TextStyle(
          color: config['color'] as Color,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Map<String, dynamic> _statusConfig(String status) {
    switch (status) {
      case 'pending':
        return {
          'label': 'Chờ duyệt',
          'bg': const Color(0xfffff7ed),
          'color': const Color(0xfff97316),
        };
      case 'approved':
      case 'assigned':
        return {
          'label': 'Đã xác nhận',
          'bg': const Color(0xffeff6ff),
          'color': const Color(0xff3b82f6),
        };
      case 'processing':
      case 'in_progress':
        return {
          'label': 'Đang thực hiện',
          'bg': const Color(0xfff0fdf4),
          'color': const Color(0xff22c55e),
        };
      case 'completed':
      case 'paid':
        return {
          'label': 'Hoàn tất',
          'bg': const Color(0xfff0fdf4),
          'color': const Color(0xff16a34a),
        };
      case 'cancelled':
        return {
          'label': 'Đã hủy',
          'bg': const Color(0xfffee2e2),
          'color': const Color(0xffef4444),
        };
      case 'incident':
        return {
          'label': 'Sự cố',
          'bg': const Color(0xfffef2f2),
          'color': const Color(0xffb91c1c),
        };
      default:
        return {
          'label': status,
          'bg': const Color(0xfff1f5f9),
          'color': const Color(0xff64748b),
        };
    }
  }
}

// ── Tracking Timeline ───────────────────────────────────────────────────────

class _TrackingTimeline extends StatelessWidget {
  final String status;
  final Map<String, dynamic> data;

  const _TrackingTimeline({required this.status, required this.data});

  @override
  Widget build(BuildContext context) {
    if (status == 'cancelled') {
       return Container(
         padding: const EdgeInsets.all(16),
         decoration: BoxDecoration(
           color: Colors.red.withOpacity(0.05),
           borderRadius: BorderRadius.circular(12),
         ),
         child: const Row(
           children: [
             Icon(Icons.cancel_outlined, color: Colors.redAccent),
             SizedBox(width: 12),
             Expanded(child: Text('Đơn hàng đã được hủy', style: TextStyle(color: Colors.redAccent, fontSize: 13, fontWeight: FontWeight.bold))),
           ],
         ),
       );
    }
    final steps = _buildSteps(status, data);
    return Column(
      children: steps.asMap().entries.map((entry) {
        final index = entry.key;
        final step = entry.value;
        final isLast = index == steps.length - 1;
        return _TimelineStep(step: step, isLast: isLast);
      }).toList(),
    );
  }

  List<_StepData> _buildSteps(String status, Map<String, dynamic> data) {
    int currentIndex = 0;
    if (['approved', 'assigned'].contains(status)) currentIndex = 1;
    if (['processing', 'incident'].contains(status)) currentIndex = 2;
    if (['completed', 'paid'].contains(status)) currentIndex = 3;

    return [
      _StepData(
        title: 'Chờ duyệt',
        subtitle: 'Đơn hàng đã được tiếp nhận.',
        isCompleted: currentIndex >= 1,
        isActive: currentIndex == 0,
        timestamp: _formatTs(data['ngayTao'] ?? data['createdAt']),
      ),
      _StepData(
        title: 'Đã xác nhận',
        subtitle: 'Đã lên lịch và chuẩn bị thiết bị.',
        isCompleted: currentIndex >= 2,
        isActive: currentIndex == 1,
        timestamp: currentIndex >= 1 ? 'Vừa xong' : null,
      ),
      _StepData(
        title: 'Đang lắp đặt',
        subtitle: 'Kỹ thuật viên đang xử lý tại chỗ.',
        isCompleted: currentIndex >= 3,
        isActive: currentIndex == 2,
      ),
      _StepData(
        title: 'Hoàn thành',
        subtitle: 'Kích hoạt bảo hành & Thiết bị.',
        isCompleted: currentIndex >= 3,
        isActive: false,
      ),
    ];
  }

  String? _formatTs(dynamic ts) {
    if (ts == null) return null;
    if (ts is Timestamp) {
      return DateFormat('HH:mm, d/M').format(ts.toDate());
    }
    return null;
  }
}

class _StepData {
  final String title;
  final String subtitle;
  final bool isCompleted;
  final bool isActive;
  final String? timestamp;

  _StepData({
    required this.title,
    required this.subtitle,
    required this.isCompleted,
    required this.isActive,
    this.timestamp,
  });
}

class _TimelineStep extends StatelessWidget {
  final _StepData step;
  final bool isLast;

  const _TimelineStep({required this.step, required this.isLast});

  @override
  Widget build(BuildContext context) {
    final Color dotColor = step.isCompleted
        ? const Color(0xff22c55e)
        : step.isActive
            ? const Color(0xff00459a)
            : const Color(0xffe2e8f0);

    final Color lineColor = step.isCompleted
        ? const Color(0xff22c55e)
        : const Color(0xffe2e8f0);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 32,
          child: Column(
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: dotColor,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: step.isActive ? const Color(0xff00459a) : Colors.transparent,
                    width: 2,
                  ),
                ),
                child: step.isCompleted
                    ? const Icon(Icons.check, color: Colors.white, size: 14)
                    : null,
              ),
              if (!isLast)
                Container(
                  width: 2,
                  height: 52,
                  color: lineColor,
                ),
            ],
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Padding(
            padding: EdgeInsets.only(bottom: isLast ? 0 : 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      step.title,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                        color: step.isActive || step.isCompleted ? const Color(0xff0b1c30) : const Color(0xff94a3b8),
                      ),
                    ),
                    if (step.timestamp != null)
                      Text(
                        step.timestamp!,
                        style: const TextStyle(fontSize: 11, color: Color(0xff94a3b8)),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  step.subtitle,
                  style: TextStyle(
                    fontSize: 12,
                    color: step.isActive || step.isCompleted ? const Color(0xff64748b) : const Color(0xffb0bec5),
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _TechnicianCard extends StatelessWidget {
  final List technicians;

  const _TechnicianCard({required this.technicians});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xffbfdbfe)),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.engineering_outlined, color: Color(0xff3b82f6), size: 18),
              SizedBox(width: 8),
              Text(
                'Kỹ thuật viên phụ trách',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xff0b1c30)),
              ),
            ],
          ),
          const SizedBox(height: 14),
          ...technicians.map((tech) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              children: [
                Container(
                  width: 44, height: 44,
                  decoration: const BoxDecoration(color: Color(0xffeff6ff), shape: BoxShape.circle),
                  child: const Icon(Icons.person_outline, color: Color(0xff3b82f6), size: 24),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(tech['name'] ?? 'Kỹ thuật viên', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      const Text('AquaCare Professional Staff', style: TextStyle(fontSize: 11, color: Color(0xff64748b))),
                    ],
                  ),
                ),
              ],
            ),
          )).toList(),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: const Color(0xff94a3b8)),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 11, color: Color(0xff94a3b8))),
              const SizedBox(height: 2),
              Text(value, style: const TextStyle(fontSize: 13, color: Color(0xff374151), fontWeight: FontWeight.w600)),
            ],
          ),
        ],
      ),
    );
  }
}
