import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:customer_app/controllers/cart_controller.dart';
import 'package:customer_app/controllers/order_controller.dart';
import 'package:customer_app/models/order_model.dart';

// --- MÀN HÌNH GIỎ HÀNG ---
class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xff0b1c30)),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Giỏ hàng',
            style: TextStyle(
                color: Color(0xff0b1c30),
                fontWeight: FontWeight.w900,
                fontSize: 18)),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
            onPressed: () => context.read<CartController>().clearCart(),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Consumer<CartController>(
        builder: (context, cart, _) {
          if (cart.items.isEmpty) {
            return const Center(child: Text('Giỏ hàng của bạn đang trống'));
          }
          return Column(
            children: [
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: cart.items.length,
                  itemBuilder: (context, index) {
                    final item = cart.items[index];
                    return _CartItemCard(item: item);
                  },
                ),
              ),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.vertical(top: Radius.circular(30))),
                child: SafeArea(
                  child: ElevatedButton(
                    onPressed: () => Navigator.pushNamed(context, '/checkout'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xff00459a),
                      padding: const EdgeInsets.symmetric(vertical: 18),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Tiến hành thanh toán', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
                        SizedBox(width: 8),
                        Icon(Icons.arrow_forward, size: 18),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _CartItemCard extends StatelessWidget {
  final CartItem item;
  const _CartItemCard({required this.item});

  @override
  Widget build(BuildContext context) {
    final cart = context.read<CartController>();
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xfff1f5f9)),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 90, height: 90,
                decoration: BoxDecoration(
                  color: const Color(0xfff8fafc),
                  borderRadius: BorderRadius.circular(12),
                  image: item.imageUrl != null ? DecorationImage(image: NetworkImage(item.imageUrl!), fit: BoxFit.cover) : null,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: const Color(0xffeff6ff), borderRadius: BorderRadius.circular(6)),
                      child: const Text('MÁY LỌC NƯỚC', style: TextStyle(color: Color(0xff3b82f6), fontSize: 9, fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(height: 8),
                    Text(item.productName, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xff1e293b))),
                    const SizedBox(height: 4),
                    const Text('Hệ thống lọc nước cao cấp chuẩn quốc tế.', style: TextStyle(fontSize: 11, color: Color(0xff64748b), height: 1.4)),
                  ],
                ),
              ),
              IconButton(icon: const Icon(Icons.close, size: 18, color: Color(0xff94a3b8)), onPressed: () => cart.removeFromCart(item.id)),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('₫${item.price.toStringAsFixed(0).replaceAllMapped(RegExp(r"(\d{1,3})(?=(\d{3})+(?!\d))"), (m) => "${m[1]}.")}', 
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xff00459a))),
              Container(
                decoration: BoxDecoration(color: const Color(0xfff1f5f9), borderRadius: BorderRadius.circular(10)),
                child: Row(
                  children: [
                    IconButton(icon: const Icon(Icons.remove, size: 16), onPressed: () => cart.updateQuantity(item.id, item.quantity - 1)),
                    Text('${item.quantity}', style: const TextStyle(fontWeight: FontWeight.bold)),
                    IconButton(icon: const Icon(Icons.add, size: 16), onPressed: () => cart.updateQuantity(item.id, item.quantity + 1)),
                  ],
                ),
              )
            ],
          )
        ],
      ),
    );
  }
}

// --- MÀN HÌNH THANH TOÁN ---
class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final TextEditingController _notesController = TextEditingController();
  
  // Dummy address for completing the flow
  final Address _dummyAddress = Address(
    id: '1',
    street: '123 Đường ABC',
    ward: 'Phường 1',
    district: 'Quận 1',
    city: 'Hồ Chí Minh',
  );

  Future<void> _handlePlaceOrder() async {
    final cart = context.read<CartController>();
    final orderController = context.read<OrderController>();

    final items = cart.items.map((item) => OrderItem(
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
      imageUrl: item.imageUrl,
    )).toList();

    final success = await orderController.createOrder(
      items: items,
      deliveryAddress: _dummyAddress,
      notes: _notesController.text,
      subtotal: cart.subtotal,
      shippingFee: cart.shippingFee,
      totalAmount: cart.total,
    );

    if (mounted) {
      if (success) {
        cart.clearCart();
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Đặt hàng thành công!')));
        Navigator.of(context).pushNamedAndRemoveUntil('/orders', (route) => route.isFirst);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(orderController.error ?? 'Đặt hàng thất bại')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      appBar: AppBar(backgroundColor: Colors.white, elevation: 0, title: const Text('Tóm tắt đơn hàng')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Container(
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(30), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20)]),
              padding: const EdgeInsets.all(24),
              child: Consumer<CartController>(
                builder: (context, cart, _) => Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Chi tiết đơn hàng', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
                    const SizedBox(height: 24),
                    _buildSummaryRow('Tạm tính', '₫${cart.subtotal.toStringAsFixed(0)}'),
                    _buildSummaryRow('Giảm giá', '- ₫${cart.discount.toStringAsFixed(0)}', valueColor: Colors.redAccent),
                    _buildSummaryRow('Phí lắp đặt', 'Miễn phí', valueColor: Colors.green),
                    const Divider(height: 32),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Tổng cộng', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
                        Text('₫${cart.total.toStringAsFixed(0)}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xff00459a))),
                      ],
                    ),
                    const SizedBox(height: 32),
                    const Text('Ghi chú', style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _notesController,
                      decoration: InputDecoration(hintText: 'Yêu cầu đặc biệt (nếu có)...', filled: true, fillColor: const Color(0xfff8fafc), border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none)),
                    ),
                    const SizedBox(height: 32),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _handlePlaceOrder,
                        style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 20)),
                        child: const Text('ĐẶT HÀNG NGAY'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.w500)),
          Text(value, style: TextStyle(fontWeight: FontWeight.bold, color: valueColor)),
        ],
      ),
    );
  }
}
