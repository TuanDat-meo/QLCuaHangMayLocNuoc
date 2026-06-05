// lib/features/cart/order_confirmation_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:customer_app/controllers/cart_controller.dart';
import 'package:customer_app/controllers/order_controller.dart';
import 'package:customer_app/models/order_model.dart';

class OrderConfirmationScreen extends StatefulWidget {
  const OrderConfirmationScreen({super.key});

  @override
  State<OrderConfirmationScreen> createState() =>
      _OrderConfirmationScreenState();
}

class _OrderConfirmationScreenState extends State<OrderConfirmationScreen> {
  bool _isPlacingOrder = false;

  String _formatCurrency(double value) => value
      .toStringAsFixed(0)
      .replaceAllMapped(
          RegExp(r"(\d{1,3})(?=(\d{3})+(?!\d))"), (m) => "${m[1]}.");

  Future<void> _handlePlaceOrder(
    CartController cart,
    Address address,
    DateTime scheduledDate,
    ScheduleSlot scheduledSlot,
  ) async {
    setState(() => _isPlacingOrder = true);

    final orderController = context.read<OrderController>();

    final items = cart.items
        .map((item) => OrderItem(
              id: item.id,
              productId: item.productId,
              productName: item.productName,
              price: item.price,
              quantity: item.quantity,
              subtotal: item.price * item.quantity,
              imageUrl: item.imageUrl,
            ))
        .toList();

    final success = await orderController.createOrder(
      items: items,
      deliveryAddress: address,
      scheduledDate: scheduledDate,
      scheduledSlot: scheduledSlot,
      subtotal: cart.subtotal,
      discount: cart.discount,
      shippingFee: cart.shippingFee,
      totalAmount: cart.total,
    );

    if (!mounted) return;

    setState(() => _isPlacingOrder = false);

    if (success) {
      cart.clearCart();
      final order = orderController.currentOrder!;
      Navigator.of(context).pushNamedAndRemoveUntil(
        '/order-tracking',
        (route) => route.isFirst,
        arguments: {'orderId': order.id, 'orderCode': order.orderCode},
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(orderController.error ?? 'Đặt hàng thất bại'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final args =
        ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    final Address address = args['address'];
    final DateTime scheduledDate = args['scheduledDate'];
    final ScheduleSlot scheduledSlot = args['scheduledSlot'];

    final dateLabel = DateFormat('d MMMM', 'vi').format(scheduledDate);
    final dayLabel = DateFormat('EEEE', 'vi').format(scheduledDate);

    return Consumer<CartController>(
      builder: (context, cart, _) {
        return Scaffold(
          backgroundColor: const Color(0xfff8fafc),
          appBar: AppBar(
            backgroundColor: Colors.white,
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back, color: Color(0xff0b1c30)),
              onPressed: () => Navigator.pop(context),
            ),
            title: const Text(
              'Xác nhận đơn hàng',
              style: TextStyle(
                color: Color(0xff0b1c30),
                fontWeight: FontWeight.w900,
                fontSize: 18,
              ),
            ),
          ),
          body: Column(
            children: [
              // Info banner
              Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xffeff6ff),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xffbfdbfe)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline,
                        color: Color(0xff3b82f6), size: 18),
                    const SizedBox(width: 10),
                    Expanded(
                      child: RichText(
                        text: const TextSpan(
                          style: TextStyle(
                              fontSize: 12, color: Color(0xff1e40af)),
                          children: [
                            TextSpan(
                                text: 'Admin sẽ liên hệ lại với bạn\n',
                                style: TextStyle(fontWeight: FontWeight.bold)),
                            TextSpan(
                                text:
                                    'Sau khi đặt hàng, nhân viên AquaPure sẽ liên hệ trong 2 giờ để xác nhận và sắp xếp kỹ thuật viên đến lắp đặt.'),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  child: Column(
                    children: [
                      // ── Địa chỉ lắp đặt ──────────────────────────────
                      _InfoSection(
                        title: 'Địa chỉ lắp đặt',
                        actionLabel: 'Thay đổi',
                        onAction: () => Navigator.pop(context),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              address.recipientName,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                                color: Color(0xff1e293b),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              address.phoneNumber,
                              style: const TextStyle(
                                  fontSize: 13, color: Color(0xff64748b)),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              address.fullAddress,
                              style: const TextStyle(
                                  fontSize: 13, color: Color(0xff374151)),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 12),

                      // ── Thời gian mong muốn ───────────────────────────
                      _InfoSection(
                        title: 'Thời gian mong muốn',
                        actionLabel: 'Thay đổi',
                        onAction: () => Navigator.pop(context),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 14, vertical: 10),
                              decoration: BoxDecoration(
                                color: const Color(0xff00459a),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Column(
                                children: [
                                  Text(
                                    'THÁNG ${scheduledDate.month}',
                                    style: const TextStyle(
                                        color: Colors.white70,
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold),
                                  ),
                                  Text(
                                    '${scheduledDate.day}',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 28,
                                      fontWeight: FontWeight.w900,
                                      height: 1.1,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 16),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  dayLabel,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                    color: Color(0xff1e293b),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: const Color(0xffeff6ff),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    'Sáng (${scheduledSlot.label})',
                                    style: const TextStyle(
                                      color: Color(0xff3b82f6),
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 12),

                      // ── Thông tin sản phẩm ────────────────────────────
                      _InfoSection(
                        title: 'Thông tin sản phẩm',
                        child: Column(
                          children: [
                            ...cart.items.map((item) => Padding(
                                  padding: const EdgeInsets.only(bottom: 12),
                                  child: Row(
                                    children: [
                                      Container(
                                        width: 56,
                                        height: 56,
                                        decoration: BoxDecoration(
                                          color: const Color(0xfff1f5f9),
                                          borderRadius:
                                              BorderRadius.circular(10),
                                          image: item.imageUrl != null
                                              ? DecorationImage(
                                                  image: NetworkImage(
                                                      item.imageUrl!),
                                                  fit: BoxFit.cover)
                                              : null,
                                        ),
                                        child: item.imageUrl == null
                                            ? const Icon(
                                                Icons.water_drop_outlined,
                                                color: Color(0xff3b82f6),
                                                size: 24)
                                            : null,
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              item.productName,
                                              style: const TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 13,
                                                color: Color(0xff1e293b),
                                              ),
                                            ),
                                            Text(
                                              'Máy lọc nước. Lọc thô, lọc tinh, lọc RO.',
                                              style: const TextStyle(
                                                  fontSize: 11,
                                                  color: Color(0xff94a3b8)),
                                            ),
                                            Text(
                                              'Số lượng: ${item.quantity}',
                                              style: const TextStyle(
                                                  fontSize: 11,
                                                  color: Color(0xff64748b)),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Text(
                                        '${_formatCurrency(item.price)} đ',
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13,
                                          color: Color(0xff00459a),
                                        ),
                                      ),
                                    ],
                                  ),
                                )),
                          ],
                        ),
                      ),

                      const SizedBox(height: 12),

                      // ── Tổng quan đơn hàng ────────────────────────────
                      _InfoSection(
                        title: 'Tổng quan đơn hàng',
                        child: Column(
                          children: [
                            _SummaryRow(
                              label: 'Tạm tính',
                              value: '${_formatCurrency(cart.subtotal)} đ',
                            ),
                            _SummaryRow(
                              label: 'Phí lắp đặt',
                              value: 'Miễn phí',
                              valueColor: const Color(0xff22c55e),
                            ),
                            _SummaryRow(
                              label: 'Phí vận chuyển',
                              value: 'Miễn phí',
                              valueColor: const Color(0xff22c55e),
                            ),
                            if (cart.discount > 0)
                              _SummaryRow(
                                label: 'Giảm giá',
                                value:
                                    '- ${_formatCurrency(cart.discount)} đ',
                                valueColor: Colors.redAccent,
                              ),
                            const Padding(
                              padding: EdgeInsets.symmetric(vertical: 10),
                              child: Divider(height: 1),
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Tổng thanh toán',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w900,
                                    fontSize: 15,
                                    color: Color(0xff0b1c30),
                                  ),
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text(
                                      '${_formatCurrency(cart.total)} đ',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w900,
                                        fontSize: 18,
                                        color: Color(0xff00459a),
                                      ),
                                    ),
                                    const Text(
                                      '(Thanh toán khi hoàn tất lắp đặt - COD)',
                                      style: TextStyle(
                                          fontSize: 10,
                                          color: Color(0xff94a3b8)),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Terms note
                      const Text(
                        'Bằng cách đặt hàng, bạn đồng ý với Điều khoản dịch vụ của AquaPure.',
                        textAlign: TextAlign.center,
                        style:
                            TextStyle(fontSize: 11, color: Color(0xff94a3b8)),
                      ),

                      const SizedBox(height: 16),
                    ],
                  ),
                ),
              ),

              // Bottom CTA
              Container(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius:
                      BorderRadius.vertical(top: Radius.circular(30)),
                  boxShadow: [
                    BoxShadow(
                        color: Color(0x0f000000),
                        blurRadius: 20,
                        offset: Offset(0, -4))
                  ],
                ),
                child: SafeArea(
                  child: SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isPlacingOrder
                          ? null
                          : () => _handlePlaceOrder(
                              cart, address, scheduledDate, scheduledSlot),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xff00459a),
                        padding: const EdgeInsets.symmetric(vertical: 18),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16)),
                      ),
                      child: _isPlacingOrder
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                  color: Colors.white, strokeWidth: 2),
                            )
                          : const Text(
                              'Xác nhận đặt hàng →',
                              style: TextStyle(
                                  fontSize: 15, fontWeight: FontWeight.w900),
                            ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _InfoSection extends StatelessWidget {
  final String title;
  final String? actionLabel;
  final VoidCallback? onAction;
  final Widget child;

  const _InfoSection({
    required this.title,
    this.actionLabel,
    this.onAction,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w900,
                  color: Color(0xff0b1c30),
                ),
              ),
              if (actionLabel != null)
                GestureDetector(
                  onTap: onAction,
                  child: Text(
                    actionLabel!,
                    style: const TextStyle(
                      fontSize: 13,
                      color: Color(0xff3b82f6),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;

  const _SummaryRow(
      {required this.label, required this.value, this.valueColor});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(
                  color: Color(0xff64748b), fontSize: 13)),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 13,
              color: valueColor ?? const Color(0xff1e293b),
            ),
          ),
        ],
      ),
    );
  }
}
