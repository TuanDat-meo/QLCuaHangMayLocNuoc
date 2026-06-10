import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:customer_app/models/order_model.dart';
import 'package:customer_app/controllers/order_controller.dart';
import 'package:intl/intl.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final List<String> _tabs = ['Tất cả', 'Đang chờ', 'Đang xử lý', 'Kết thúc'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
    Future.microtask(() => context.read<OrderController>().fetchMyOrders());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Đơn hàng của tôi',
          style: TextStyle(
            color: Color(0xff0b1c30),
            fontWeight: FontWeight.w900,
            fontSize: 18,
          ),
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xff00459a),
          unselectedLabelColor: const Color(0xff94a3b8),
          indicatorColor: const Color(0xff00459a),
          indicatorWeight: 3,
          labelStyle: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
          tabs: _tabs.map((tab) => Tab(text: tab)).toList(),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOrderList('all'),
          _buildOrderList('pending_assigned'),
          _buildOrderList('active'),
          _buildOrderList('finished'),
        ],
      ),
    );
  }

  Widget _buildOrderList(String group) {
    return Consumer<OrderController>(
      builder: (context, controller, _) {
        List<Order> filteredOrders;

        switch (group) {
          case 'pending_assigned':
            filteredOrders = controller.orders
                .where((o) => ['pending', 'assigned'].contains(o.status))
                .toList();
            break;
          case 'active':
            filteredOrders = controller.orders
                .where(
                  (o) =>
                      ['in_progress', 'processing', 'issue'].contains(o.status),
                )
                .toList();
            break;
          case 'finished':
            filteredOrders = controller.orders
                .where(
                  (o) =>
                      ['completed', 'settled', 'cancelled'].contains(o.status),
                )
                .toList();
            break;
          default:
            filteredOrders = controller.orders;
        }

        if (controller.isLoading) {
          return const Center(child: CircularProgressIndicator());
        }

        if (filteredOrders.isEmpty) {
          return RefreshIndicator(
            onRefresh: () => controller.fetchMyOrders(),
            child: ListView(
              children: [
                SizedBox(height: MediaQuery.of(context).size.height * 0.2),
                Center(
                  child: Column(
                    children: [
                      Icon(
                        Icons.receipt_long_outlined,
                        size: 64,
                        color: const Color(0xffcbd5e1),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Chưa có đơn hàng nào trong mục này',
                        style: TextStyle(color: Color(0xff64748b)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () => controller.fetchMyOrders(),
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: filteredOrders.length,
            itemBuilder: (context, index) =>
                _OrderCard(order: filteredOrders[index]),
          ),
        );
      },
    );
  }
}

class _OrderCard extends StatelessWidget {
  final Order order;
  const _OrderCard({required this.order});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xfff1f5f9)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                order.orderCode.isNotEmpty
                    ? order.orderCode
                    : 'Đơn #${order.id.substring(0, 6).toUpperCase()}',
                style: const TextStyle(
                  fontWeight: FontWeight.w900,
                  color: Color(0xff0b1c30),
                  fontSize: 14,
                ),
              ),
              _buildStatusBadge(order.status),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(color: Color(0xfff8fafc)),
          const SizedBox(height: 12),
          Row(
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: const Color(0xfff8fafc),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.water_drop, color: Color(0xff00459a)),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${order.items.length} sản phẩm',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      order.deliveryAddress.fullAddress,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xff64748b),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      DateFormat('dd/MM/yyyy HH:mm').format(order.createdAt),
                      style: const TextStyle(
                        fontSize: 10,
                        color: Color(0xff94a3b8),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '₫${NumberFormat("#,###", "vi_VN").format(order.totalAmount)}',
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w900,
                  color: Color(0xff00459a),
                ),
              ),
              OutlinedButton(
                onPressed: () {
                  Navigator.pushNamed(
                    context,
                    '/order-detail',
                    arguments: order,
                  );
                },
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xffe2e8f0)),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                child: const Text(
                  'Chi tiết',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: Color(0xff64748b),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    String text;

    switch (status) {
      case 'pending':
        color = Colors.orange;
        text = 'Chờ duyệt';
        break;
      case 'assigned':
        color = Colors.blue;
        text = 'Đã phân công';
        break;
      case 'processing':
      case 'in_progress':
        color = Colors.lightBlue;
        text = 'Đang xử lý';
        break;
      case 'completed':
      case 'hoan_thanh':
      case 'HOAN_THANH':
        color = Colors.green;
        text = 'Hoàn tất';
        break;
      case 'issue':
        color = Colors.red;
        text = 'Sự cố';
        break;
      case 'settled':
        color = Colors.teal;
        text = 'Tất toán';
        break;
      case 'cancelled':
        color = Colors.grey;
        text = 'Đã hủy';
        break;
      default:
        color = Colors.grey;
        text = 'Không xác định';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        text.toUpperCase(),
        style: TextStyle(
          color: color,
          fontSize: 9,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
