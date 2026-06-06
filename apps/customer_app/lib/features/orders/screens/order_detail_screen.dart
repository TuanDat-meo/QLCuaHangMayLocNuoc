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
                if (status == 'completed' || status == 'paid')
                  _buildInvoiceSection(context, data),
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

  Widget _buildInvoiceSection(BuildContext context, Map<String, dynamic> orderData) {
    return FutureBuilder<QuerySnapshot>(
      future: FirebaseFirestore.instance
          .collection('invoices')
          .where('orderId', isEqualTo: _orderId)
          .limit(1)
          .get(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const SizedBox.shrink();
        }

        Map<String, dynamic> invoiceData;
        if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
          // Fallback: Generate invoice data dynamically from orderData
          final double amount = (orderData['tongTien'] ?? orderData['totalAmount'] ?? 0.0).toDouble();
          invoiceData = {
            'invoiceNumber': 'E-INV-${_orderId.length > 8 ? _orderId.substring(0, 8).toUpperCase() : _orderId.toUpperCase()}',
            'amount': amount,
            'customerName': orderData['tenKhachHang'] ?? orderData['customerName'] ?? 'Khách hàng',
            'customerPhone': orderData['phoneNumber'] ?? '',
            'issuedAt': orderData['ngayTao'] ?? orderData['createdAt'] ?? Timestamp.now(),
            'paymentMethod': orderData['paymentMethod'] ?? 'COD',
            'items': orderData['items'] ?? [],
          };
        } else {
          final invoiceDoc = snapshot.data!.docs.first;
          invoiceData = invoiceDoc.data() as Map<String, dynamic>;
        }

        return Column(
          children: [
            const SizedBox(height: 20),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xffe2e8f0)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.02),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xffe0f2fe),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.receipt_long_rounded,
                          color: Color(0xff0284c7),
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Hóa đơn điện tử',
                              style: TextStyle(
                                fontWeight: FontWeight.w900,
                                color: Color(0xff0b1c30),
                                fontSize: 15,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Số: ${invoiceData['invoiceNumber'] ?? ''}',
                              style: const TextStyle(
                                color: Color(0xff64748b),
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Divider(color: Color(0xfff1f5f9), height: 1),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Tổng thanh toán:',
                        style: TextStyle(
                          color: Color(0xff64748b),
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        '₫${NumberFormat("#,###", "vi_VN").format(invoiceData['amount'] ?? 0)}',
                        style: const TextStyle(
                          color: Color(0xff00459a),
                          fontWeight: FontWeight.w900,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () => _showInvoiceDetails(context, invoiceData),
                      icon: const Icon(Icons.visibility_outlined, size: 18),
                      label: const Text(
                        'XEM HÓA ĐƠN CHI TIẾT',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                          fontSize: 12,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xff00459a),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        elevation: 0,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }

  void _showInvoiceDetails(BuildContext context, Map<String, dynamic> invoice) {
    final issuedAtRaw = invoice['issuedAt'];
    DateTime issuedDate = DateTime.now();
    if (issuedAtRaw is Timestamp) {
      issuedDate = issuedAtRaw.toDate();
    } else if (issuedAtRaw is String) {
      issuedDate = DateTime.tryParse(issuedAtRaw) ?? DateTime.now();
    }

    final items = invoice['items'] as List? ?? [];
    final formattedDate = DateFormat('dd/MM/yyyy HH:mm').format(issuedDate);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          margin: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(28),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.15),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: const Color(0xffcbd5e1),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'AquaCare',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w900,
                              color: Color(0xff00459a),
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                          Text(
                            'HÓA ĐƠN ĐIỆN TỬ',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              color: Color(0xff94a3b8),
                              letterSpacing: 1.0,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xffdcfce7),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'ĐÃ THANH TOÁN',
                          style: TextStyle(
                            color: Color(0xff15803d),
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  CustomPaint(
                    size: const Size(double.infinity, 1),
                    painter: DashedLinePainter(),
                  ),
                  const SizedBox(height: 20),
                  _buildInvoiceInfoRow('Số hóa đơn:', invoice['invoiceNumber'] ?? ''),
                  _buildInvoiceInfoRow('Ngày phát hành:', formattedDate),
                  _buildInvoiceInfoRow('Khách hàng:', invoice['customerName'] ?? ''),
                  _buildInvoiceInfoRow('Số điện thoại:', invoice['customerPhone'] ?? ''),
                  _buildInvoiceInfoRow('Phương thức:', invoice['paymentMethod'] ?? 'COD'),
                  const SizedBox(height: 20),
                  CustomPaint(
                    size: const Size(double.infinity, 1),
                    painter: DashedLinePainter(),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'CHI TIẾT HẠNG MỤC',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w900,
                      color: Color(0xff94a3b8),
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ...items.map((item) {
                    final name = item['name'] ?? item['productName'] ?? '';
                    final qty = item['quantity'] ?? 1;
                    final price = (item['price'] as num?)?.toDouble() ?? 0.0;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  name,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xff0b1c30),
                                    fontSize: 13,
                                  ),
                                ),
                                Text(
                                  'Số lượng: $qty',
                                  style: const TextStyle(
                                    color: Color(0xff64748b),
                                    fontSize: 11,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            '₫${NumberFormat("#,###", "vi_VN").format(price * qty)}',
                            style: const TextStyle(
                              fontWeight: FontWeight.w900,
                              color: Color(0xff0b1c30),
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                  const SizedBox(height: 16),
                  CustomPaint(
                    size: const Size(double.infinity, 1),
                    painter: DashedLinePainter(),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'TỔNG CỘNG:',
                        style: TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 12,
                          color: Color(0xff0b1c30),
                        ),
                      ),
                      Text(
                        '₫${NumberFormat("#,###", "vi_VN").format(invoice['amount'] ?? 0)}',
                        style: const TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 22,
                          color: Color(0xff00459a),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Chữ ký điện tử',
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                              color: Color(0xff94a3b8),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              border: Border.all(
                                color: const Color(0xffcbd5e1),
                                style: BorderStyle.solid,
                              ),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'DIGITAL SIGNED',
                              style: TextStyle(
                                fontSize: 8,
                                fontWeight: FontWeight.w800,
                                color: Color(0xff94a3b8),
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                        ],
                      ),
                      ElevatedButton(
                        onPressed: () => Navigator.pop(context),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xfff1f5f9),
                          foregroundColor: const Color(0xff475569),
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 24,
                            vertical: 12,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text(
                          'ĐÓNG',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildInvoiceInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: Color(0xff64748b),
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              color: Color(0xff0b1c30),
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}

class DashedLinePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    double dashWidth = 5, dashSpace = 3, startX = 0;
    final paint = Paint()
      ..color = const Color(0xffe2e8f0)
      ..strokeWidth = 1;
    while (startX < size.width) {
      canvas.drawLine(Offset(startX, 0), Offset(startX + dashWidth, 0), paint);
      startX += dashWidth + dashSpace;
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
