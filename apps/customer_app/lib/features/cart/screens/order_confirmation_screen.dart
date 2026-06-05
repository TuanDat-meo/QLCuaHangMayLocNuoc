import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:customer_app/controllers/cart_controller.dart';
import 'package:customer_app/controllers/order_controller.dart';
import 'package:customer_app/models/order_model.dart';

class OrderConfirmationScreen extends StatefulWidget {
  const OrderConfirmationScreen({super.key});

  @override
  State<OrderConfirmationScreen> createState() => _OrderConfirmationScreenState();
}

class _OrderConfirmationScreenState extends State<OrderConfirmationScreen> {
  bool _isProcessing = false;

  Future<void> _handlePlaceOrder(BuildContext context, Map<String, dynamic> args) async {
    final cart = context.read<CartController>();
    final orderController = context.read<OrderController>();

    setState(() => _isProcessing = true);

    // Chuyển đổi CartItem sang OrderItem của model
    final List<OrderItem> orderItems = cart.items.map((item) => OrderItem(
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
      imageUrl: item.imageUrl,
    )).toList();

    final success = await orderController.createOrder(
      items: orderItems,
      deliveryAddress: args['address'] as Address,
      scheduledDate: args['scheduledDate'] as DateTime,
      scheduledSlot: args['scheduledSlot'] as ScheduleSlot,
      subtotal: cart.subtotal,
      discount: cart.discount,
      shippingFee: cart.shippingFee,
      totalAmount: cart.total,
      notes: 'Đơn hàng từ App Khách hàng',
    );

    if (mounted) {
      setState(() => _isProcessing = false);
      if (success) {
        cart.clearCart(); // Xóa giỏ hàng sau khi đặt thành công
        _showSuccessDialog(context);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(orderController.error ?? 'Đặt hàng thất bại')),
        );
      }
    }
  }

  void _showSuccessDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Icon(Icons.check_circle, color: Colors.green, size: 60),
        content: const Text(
          'Đơn hàng của bạn đã được gửi tới hệ thống Chờ duyệt.',
          textAlign: TextAlign.center,
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          Center(
            child: ElevatedButton(
              onPressed: () {
                Navigator.pushNamedAndRemoveUntil(context, '/', (route) => false);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xff00459a),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('QUAY VỀ TRANG CHỦ', style: TextStyle(color: Colors.white)),
            ),
          ),
          const SizedBox(height: 10),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    final address = args['address'] as Address;
    final date = args['scheduledDate'] as DateTime;
    final slot = args['scheduledSlot'] as ScheduleSlot;
    final cart = context.watch<CartController>();

    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      appBar: AppBar(
        title: const Text('Xác nhận đặt hàng', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildInfoCard(
                    'THÔNG TIN GIAO HÀNG',
                    [
                      _buildInfoRow(Icons.person, 'Người nhận', address.recipientName),
                      _buildInfoRow(Icons.phone, 'Số điện thoại', address.phoneNumber),
                      _buildInfoRow(Icons.location_on, 'Địa chỉ', address.fullAddress),
                    ],
                  ),
                  const SizedBox(height: 20),
                  _buildInfoCard(
                    'LỊCH HẸN LẮP ĐẶT',
                    [
                      _buildInfoRow(Icons.calendar_today, 'Ngày hẹn', '${date.day}/${date.month}/${date.year}'),
                      _buildInfoRow(Icons.access_time, 'Khung giờ', slot.label),
                    ],
                  ),
                  const SizedBox(height: 20),
                  _buildInfoCard(
                    'CHI TIẾT ĐƠN HÀNG',
                    cart.items.map((item) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Row(
                        children: [
                          Container(
                            width: 50,
                            height: 50,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(8),
                              color: Colors.grey[100],
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: item.imageUrl != null
                                  ? Image.network(
                                      item.imageUrl!,
                                      fit: BoxFit.cover,
                                      loadingBuilder: (context, child, loadingProgress) {
                                        if (loadingProgress == null) return child;
                                        return const Center(child: CircularProgressIndicator(strokeWidth: 2));
                                      },
                                      errorBuilder: (context, error, stackTrace) => const Icon(Icons.image_not_supported, size: 20, color: Colors.grey),
                                    )
                                  : const Icon(Icons.image_outlined, size: 20, color: Colors.grey),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.productName,
                                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                Text(
                                  'Số lượng: ${item.quantity}',
                                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '${(item.price * item.quantity).toInt()}đ',
                            style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xff00459a)),
                          ),
                        ],
                      ),
                    )).toList(),
                  ),
                ],
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Colors.white,
              boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10)],
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('TỔNG THANH TOÁN', style: TextStyle(fontWeight: FontWeight.bold)),
                    Text('${cart.total.toInt()}đ', style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 18)),
                  ],
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _isProcessing ? null : () => _handlePlaceOrder(context, args),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xff00459a),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: _isProcessing 
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('XÁC NHẬN ĐẶT HÀNG', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard(String title, List<Widget> children) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: Colors.black.withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.blueGrey)),
          const Divider(),
          ...children,
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: Colors.blue),
          const SizedBox(width: 8),
          Text('$label: ', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
          Expanded(child: Text(value, style: const TextStyle(fontSize: 13))),
        ],
      ),
    );
  }
}
