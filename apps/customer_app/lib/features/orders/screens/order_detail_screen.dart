import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart' hide Order;
import 'package:provider/provider.dart';
import 'package:customer_app/models/order_model.dart';
import 'package:customer_app/controllers/order_controller.dart';
import 'package:intl/intl.dart';

class OrderDetailScreen extends StatefulWidget {
  final dynamic orderData;
  const OrderDetailScreen({super.key, required this.orderData});

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  late String _orderId;
  bool _isCancelling = false;

  @override
  void initState() {
    super.initState();
    if (widget.orderData is Order) {
      _orderId = (widget.orderData as Order).id;
    } else {
      _orderId = widget.orderData as String;
    }
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
    return StreamBuilder<DocumentSnapshot>(
      stream: FirebaseFirestore.instance.collection('donHang').doc(_orderId).snapshots(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(body: Center(child: CircularProgressIndicator()));
        }
        if (!snapshot.hasData || !snapshot.data!.exists) {
          return const Scaffold(body: Center(child: Text('Không tìm thấy thông tin đơn hàng')));
        }

        final data = snapshot.data!.data() as Map<String, dynamic>;
        // Ưu tiên lấy trangThai từ Admin Web, fallback về status của App
        final status = data['trangThai'] ?? data['status'] ?? 'pending';
        final createdAt = (data['ngayTao'] ?? data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now();
        final technicians = data['technicians'] as List? ?? [];

        return Scaffold(
          backgroundColor: const Color(0xfff8fafc),
          appBar: AppBar(
            backgroundColor: Colors.white,
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back, color: Color(0xff0b1c30)),
              onPressed: () => Navigator.pop(context),
            ),
            title: Text('Đơn #${_orderId.substring(0, 8).toUpperCase()}',
                style: const TextStyle(color: Color(0xff0b1c30), fontWeight: FontWeight.w900, fontSize: 18)),
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                _buildSectionCard(
                  child: Column(
                    children: [
                      _buildStatusStep('Đã đặt đơn', 'Ngày ${DateFormat('dd/MM/yyyy').format(createdAt)}', true, status == 'pending'),
                      _buildStatusStep('Đã xác nhận', 'Đã phân công nhân sự', ['assigned', 'approved', 'processing', 'completed', 'paid', 'incident'].contains(status), ['assigned', 'approved'].contains(status)),
                      _buildStatusStep('Đang thực hiện', 'Kỹ thuật viên đang xử lý', ['processing', 'completed', 'paid', 'incident'].contains(status), status == 'processing' || status == 'incident'),
                      _buildStatusStep('Hoàn tất', 'Dịch vụ đã hoàn thành', ['completed', 'paid'].contains(status), status == 'completed', isLast: true),
                    ],
                  ),
                ),
                if (status == 'cancelled') ...[
                  const SizedBox(height: 16),
                  _buildAlertBanner(Icons.cancel_outlined, 'Đơn hàng này đã bị hủy', Colors.red),
                ],
                if (status == 'incident') ...[
                  const SizedBox(height: 16),
                  _buildAlertBanner(Icons.warning_amber_rounded, 'Đơn hàng đang gặp sự cố kỹ thuật', Colors.orange),
                ],
                const SizedBox(height: 20),
                _buildSectionCard(
                  title: 'Sản phẩm & Dịch vụ',
                  child: Column(
                    children: (data['items'] as List? ?? []).map((item) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Row(
                          children: [
                            Container(
                              width: 50, height: 50,
                              decoration: BoxDecoration(
                                color: const Color(0xfff1f5f9),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(Icons.water_drop, color: Color(0xff00459a)),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(item['name'] ?? item['productName'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                  Text('Số lượng: ${item['quantity']}', style: const TextStyle(fontSize: 11, color: Color(0xff64748b))),
                                ],
                              ),
                            ),
                            Text('₫${NumberFormat("#,###", "vi_VN").format(item['price'] ?? 0)}',
                                style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xff00459a))),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: 20),
                _buildSectionCard(
                  title: 'Địa chỉ lắp đặt',
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.location_on, color: Color(0xff00459a), size: 20),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(data['tenKhachHang'] ?? data['customerName'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
                            const SizedBox(height: 2),
                            Text(data['phoneNumber'] ?? '', style: const TextStyle(color: Color(0xff64748b), fontSize: 13)),
                            const SizedBox(height: 4),
                            Text(data['diaChiGiaoHang'] ?? '', style: const TextStyle(color: Color(0xff64748b), fontSize: 12)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                // Nút hủy chỉ hiện khi đơn mới tạo (pending) và chưa có thợ
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
          ),
        );
      },
    );
  }

  Widget _buildAlertBanner(IconData icon, String message, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      width: double.infinity,
      decoration: BoxDecoration(
        color: color.withOpacity(0.05),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color),
          const SizedBox(width: 12),
          Text(message, style: TextStyle(color: color, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildSectionCard({String? title, required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: const Color(0xfff1f5f9))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (title != null) ...[Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xff0b1c30))), const SizedBox(height: 16)],
          child,
        ],
      ),
    );
  }

  Widget _buildStatusStep(String title, String subtitle, bool isDone, bool isActive, {bool isLast = false}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 20, height: 20,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isDone ? const Color(0xff10b981) : (isActive ? const Color(0xff00459a) : Colors.white),
                border: Border.all(color: isDone ? const Color(0xff10b981) : (isActive ? const Color(0xff00459a) : const Color(0xffcbd5e1)), width: 2),
              ),
              child: isDone ? const Icon(Icons.check, size: 12, color: Colors.white) : null,
            ),
            if (!isLast) Container(width: 2, height: 30, color: isDone ? const Color(0xff10b981) : const Color(0xfff1f5f9)),
          ],
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: TextStyle(fontWeight: FontWeight.bold, color: isActive || isDone ? const Color(0xff0b1c30) : const Color(0xff94a3b8), fontSize: 14)),
              Text(subtitle, style: const TextStyle(fontSize: 11, color: Color(0xff94a3b8))),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPriceRow(String label, double value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Color(0xff64748b), fontSize: 13)),
          Text('₫${NumberFormat("#,###", "vi_VN").format(value)}',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        ],
      ),
    );
  }
}
