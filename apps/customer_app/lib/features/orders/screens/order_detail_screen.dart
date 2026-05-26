import 'package:flutter/material.dart';
import 'package:customer_app/models/order_model.dart';
import 'package:customer_app/services/firestore_service.dart';

class OrderDetailScreen extends StatefulWidget {
  final dynamic orderData; // Can be Order object or String ID
  const OrderDetailScreen({super.key, required this.orderData});

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  Order? _order;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.orderData is Order) {
      _order = widget.orderData;
    } else if (widget.orderData is String) {
      _loadOrderById(widget.orderData);
    }
  }

  Future<void> _loadOrderById(String id) async {
    setState(() => _isLoading = true);
    try {
      // Logic to fetch single order from Firestore
      // For now, we reuse the getUserOrders and filter (could be optimized with a getOrderById)
      final orders = await FirestoreService.getUserOrders(''); // Should pass userId
      // This is a placeholder for direct fetch
    } catch (e) {
      debugPrint(e.toString());
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_order == null) return const Scaffold(body: Center(child: Text('Không tìm thấy thông tin đơn hàng')));

    final order = _order!;

    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xff0b1c30)),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Đơn #${order.id.substring(0, 8).toUpperCase()}',
            style: const TextStyle(color: Color(0xff0b1c30), fontWeight: FontWeight.w900, fontSize: 18)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            _buildSectionCard(
              child: Column(
                children: [
                  _buildStatusStep('Đã đặt đơn', 'Ngày ${order.createdAt.day}/${order.createdAt.month}', true, true),
                  _buildStatusStep('Đang xử lý', 'Hệ thống đang kiểm tra đơn hàng', order.status != 'pending', order.status == 'pending'),
                  _buildStatusStep('Đang giao hàng', 'Kỹ thuật viên đang di chuyển', order.status == 'completed', order.status == 'in_progress'),
                  _buildStatusStep('Hoàn tất', 'Lắp đặt thành công', order.status == 'completed', false, isLast: true),
                ],
              ),
            ),
            const SizedBox(height: 20),
            _buildSectionCard(
              title: 'Sản phẩm',
              child: Column(
                children: order.items.map((item) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Row(
                    children: [
                      Container(
                        width: 50, height: 50,
                        decoration: BoxDecoration(
                          color: const Color(0xfff1f5f9),
                          borderRadius: BorderRadius.circular(10),
                          image: item.imageUrl != null ? DecorationImage(image: NetworkImage(item.imageUrl!), fit: BoxFit.cover) : null,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item.productName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            Text('Số lượng: ${item.quantity}', style: const TextStyle(fontSize: 11, color: Color(0xff64748b))),
                          ],
                        ),
                      ),
                      Text('₫${item.subtotal.toStringAsFixed(0).replaceAllMapped(RegExp(r"(\d{1,3})(?=(\d{3})+(?!\d))"), (m) => "${m[1]}.")}',
                          style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xff00459a))),
                    ],
                  ),
                )).toList(),
              ),
            ),
            const SizedBox(height: 20),
            _buildSectionCard(
              title: 'Địa chỉ nhận hàng',
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.location_on, color: Color(0xff00459a), size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(order.customerName, style: const TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 2),
                        Text(order.customerPhone, style: const TextStyle(color: Color(0xff64748b), fontSize: 13)),
                        const SizedBox(height: 4),
                        Text(order.deliveryAddress.fullAddress, style: const TextStyle(color: Color(0xff64748b), fontSize: 12)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            _buildSectionCard(
              title: 'Chi tiết thanh toán',
              child: Column(
                children: [
                  _buildPriceRow('Tạm tính', order.subtotal),
                  _buildPriceRow('Phí giao hàng', order.shippingFee),
                  const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Divider(height: 1, color: Color(0xfff1f5f9))),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Tổng cộng', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                      Text('₫${order.totalAmount.toStringAsFixed(0).replaceAllMapped(RegExp(r"(\d{1,3})(?=(\d{3})+(?!\d))"), (m) => "${m[1]}.")}',
                          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Color(0xff00459a))),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
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
          Text('₫${value.toStringAsFixed(0).replaceAllMapped(RegExp(r"(\d{1,3})(?=(\d{3})+(?!\d))"), (m) => "${m[1]}.")}',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        ],
      ),
    );
  }
}
