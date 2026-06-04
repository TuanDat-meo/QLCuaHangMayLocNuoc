// admin_web/lib/features/orders/admin_order_management_screen.dart
// Màn hình Admin: Quản lý đơn hàng, kiểm tra trùng lịch, phân công kỹ thuật viên

import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:intl/intl.dart';

class AdminOrderManagementScreen extends StatefulWidget {
  const AdminOrderManagementScreen({super.key});

  @override
  State<AdminOrderManagementScreen> createState() =>
      _AdminOrderManagementScreenState();
}

class _AdminOrderManagementScreenState
    extends State<AdminOrderManagementScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _selectedStatus = 'pending';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _tabController.addListener(() {
      final statuses = ['pending', 'confirmed', 'in_progress', 'completed'];
      setState(() => _selectedStatus = statuses[_tabController.index]);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: const Color(0xff00459a),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.water_drop, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 12),
            const Text(
              'Quản lý đơn hàng',
              style: TextStyle(
                color: Color(0xff0b1c30),
                fontWeight: FontWeight.w900,
                fontSize: 18,
              ),
            ),
          ],
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xff00459a),
          unselectedLabelColor: const Color(0xff94a3b8),
          indicatorColor: const Color(0xff00459a),
          indicatorWeight: 2.5,
          tabs: const [
            Tab(text: 'Chờ duyệt'),
            Tab(text: 'Đã xác nhận'),
            Tab(text: 'Đang làm'),
            Tab(text: 'Hoàn thành'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [
          _OrderList(status: 'pending'),
          _OrderList(status: 'confirmed'),
          _OrderList(status: 'in_progress'),
          _OrderList(status: 'completed'),
        ],
      ),
    );
  }
}

// ── Order list per tab ──────────────────────────────────────────────────────

class _OrderList extends StatelessWidget {
  final String status;
  const _OrderList({required this.status});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance
          .collection('orders')
          .where('status', isEqualTo: status)
          .orderBy('createdAt', descending: true)
          .snapshots(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
          return Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.inbox_outlined,
                    size: 48, color: Colors.grey.shade300),
                const SizedBox(height: 12),
                const Text('Không có đơn hàng',
                    style: TextStyle(color: Color(0xff94a3b8))),
              ],
            ),
          );
        }

        final docs = snapshot.data!.docs;
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: docs.length,
          itemBuilder: (context, index) {
            final data = docs[index].data() as Map<String, dynamic>;
            return _AdminOrderCard(
              orderId: docs[index].id,
              data: data,
            );
          },
        );
      },
    );
  }
}

// ── Admin order card ────────────────────────────────────────────────────────

class _AdminOrderCard extends StatelessWidget {
  final String orderId;
  final Map<String, dynamic> data;

  const _AdminOrderCard({required this.orderId, required this.data});

  String _formatCurrency(double value) => value
      .toStringAsFixed(0)
      .replaceAllMapped(
          RegExp(r"(\d{1,3})(?=(\d{3})+(?!\d))"), (m) => "${m[1]}.");

  String _formatDate(dynamic ts) {
    if (ts is Timestamp) {
      return DateFormat('HH:mm - dd/MM/yyyy').format(ts.toDate());
    }
    return '';
  }

  String _formatScheduledDate(dynamic ts) {
    if (ts is Timestamp) {
      return DateFormat('EEEE, d/M/yyyy', 'vi').format(ts.toDate());
    }
    return '';
  }

  @override
  Widget build(BuildContext context) {
    final status = data['status'] as String? ?? 'pending';
    final isPending = status == 'pending';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: isPending
            ? Border.all(color: const Color(0xfffbbf24), width: 1.5)
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 18, 20, 0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      data['orderCode'] ?? '',
                      style: const TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 14,
                        color: Color(0xff0b1c30),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      _formatDate(data['createdAt']),
                      style: const TextStyle(
                          fontSize: 11, color: Color(0xff94a3b8)),
                    ),
                  ],
                ),
                Text(
                  '${_formatCurrency((data['totalAmount'] as num? ?? 0).toDouble())} đ',
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 15,
                    color: Color(0xff00459a),
                  ),
                ),
              ],
            ),
          ),

          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Divider(height: 1),
          ),

          // Info
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _MiniRow(
                  icon: Icons.person_outline,
                  text: data['customerName'] ?? 'Khách hàng',
                ),
                const SizedBox(height: 6),
                if (data['deliveryAddress'] != null)
                  _MiniRow(
                    icon: Icons.location_on_outlined,
                    text: _buildAddress(data['deliveryAddress']),
                  ),
                const SizedBox(height: 6),
                if (data['scheduledDate'] != null)
                  _MiniRow(
                    icon: Icons.calendar_today_outlined,
                    text:
                        '${_formatScheduledDate(data['scheduledDate'])} — ${data['scheduledSlotLabel'] ?? ''}',
                    highlight: true,
                  ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Actions
          if (isPending)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () =>
                          _showRejectDialog(context),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Colors.redAccent),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                        padding:
                            const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: const Text('Từ chối',
                          style: TextStyle(
                              color: Colors.redAccent,
                              fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: () =>
                          _showAssignTechnicianDialog(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xff00459a),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                        padding:
                            const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: const Text(
                        'Duyệt & Phân công',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ),
            ),

          if (status == 'confirmed')
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () =>
                      _updateOrderStatus(context, 'in_progress'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xff22c55e),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: const Text(
                    'Bắt đầu lắp đặt',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ),

          if (status == 'in_progress')
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () =>
                      _updateOrderStatus(context, 'completed'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xff16a34a),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: const Text(
                    '✓ Đánh dấu hoàn thành',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  String _buildAddress(Map<String, dynamic> addr) =>
      '${addr['street'] ?? ''}, ${addr['district'] ?? ''}, ${addr['city'] ?? ''}';

  // ── Kiểm tra trùng lịch ────────────────────────────────────────────────

  Future<bool> _checkScheduleConflict(
      String technicianId,
      DateTime scheduledDate,
      String slotId,
      String excludeOrderId) async {
    final snap = await FirebaseFirestore.instance
        .collection('orders')
        .where('technicianId', isEqualTo: technicianId)
        .where('scheduledSlotId', isEqualTo: slotId)
        .where('status', whereIn: ['confirmed', 'in_progress'])
        .get();

    for (final doc in snap.docs) {
      if (doc.id == excludeOrderId) continue;
      final docDate = (doc['scheduledDate'] as Timestamp).toDate();
      if (docDate.year == scheduledDate.year &&
          docDate.month == scheduledDate.month &&
          docDate.day == scheduledDate.day) {
        return true; // Trùng lịch!
      }
    }
    return false;
  }

  void _showAssignTechnicianDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => _AssignTechnicianDialog(
        orderId: orderId,
        data: data,
        checkConflict: _checkScheduleConflict,
      ),
    );
  }

  void _showRejectDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Từ chối đơn hàng'),
        content: const Text(
            'Bạn có chắc muốn từ chối đơn hàng này? Khách hàng sẽ được thông báo.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Huỷ')),
          ElevatedButton(
            onPressed: () async {
              await FirebaseFirestore.instance
                  .collection('orders')
                  .doc(orderId)
                  .update({'status': 'rejected'});
              if (ctx.mounted) Navigator.pop(ctx);
            },
            style: ElevatedButton.styleFrom(
                backgroundColor: Colors.redAccent),
            child: const Text('Từ chối'),
          ),
        ],
      ),
    );
  }

  Future<void> _updateOrderStatus(BuildContext context, String newStatus) async {
    final updateData = <String, dynamic>{
      'status': newStatus,
      'updatedAt': FieldValue.serverTimestamp(),
    };

    if (newStatus == 'in_progress') {
      updateData['inProgressAt'] = FieldValue.serverTimestamp();
    } else if (newStatus == 'completed') {
      updateData['completedAt'] = FieldValue.serverTimestamp();
    }

    await FirebaseFirestore.instance
        .collection('orders')
        .doc(orderId)
        .update(updateData);

    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(newStatus == 'completed'
              ? 'Đơn hàng đã hoàn thành!'
              : 'Đã cập nhật trạng thái'),
          backgroundColor: const Color(0xff22c55e),
        ),
      );
    }
  }
}

// ── Assign Technician Dialog ────────────────────────────────────────────────

class _AssignTechnicianDialog extends StatefulWidget {
  final String orderId;
  final Map<String, dynamic> data;
  final Future<bool> Function(String, DateTime, String, String) checkConflict;

  const _AssignTechnicianDialog({
    required this.orderId,
    required this.data,
    required this.checkConflict,
  });

  @override
  State<_AssignTechnicianDialog> createState() =>
      _AssignTechnicianDialogState();
}

class _AssignTechnicianDialogState extends State<_AssignTechnicianDialog> {
  // Mock technicians list
  final List<Map<String, String>> _technicians = [
    {'id': 'tech_001', 'name': 'Nguyễn Văn An', 'phone': '0912 111 222'},
    {'id': 'tech_002', 'name': 'Trần Minh Tuấn', 'phone': '0923 333 444'},
    {'id': 'tech_003', 'name': 'Lê Hoàng Nam', 'phone': '0934 555 666'},
    {'id': 'tech_004', 'name': 'Phạm Thanh Hùng', 'phone': '0945 777 888'},
  ];

  String? _selectedTechId;
  bool _isChecking = false;
  bool? _hasConflict;
  bool _isAssigning = false;

  Future<void> _checkAndAssign() async {
    if (_selectedTechId == null) return;
    setState(() {
      _isChecking = true;
      _hasConflict = null;
    });

    final scheduledDate =
        (widget.data['scheduledDate'] as Timestamp).toDate();
    final slotId = widget.data['scheduledSlotId'] as String? ?? '';

    final conflict = await widget.checkConflict(
        _selectedTechId!, scheduledDate, slotId, widget.orderId);

    setState(() {
      _isChecking = false;
      _hasConflict = conflict;
    });

    if (!conflict) {
      await _assign();
    }
  }

  Future<void> _assign() async {
    setState(() => _isAssigning = true);

    final tech = _technicians.firstWhere((t) => t['id'] == _selectedTechId);

    await FirebaseFirestore.instance
        .collection('orders')
        .doc(widget.orderId)
        .update({
      'status': 'confirmed',
      'technicianId': tech['id'],
      'technicianName': tech['name'],
      'technicianPhone': tech['phone'],
      'confirmedAt': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
    });

    if (mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Đã phân công ${tech['name']} cho đơn hàng!'),
          backgroundColor: const Color(0xff22c55e),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text(
        'Phân công kỹ thuật viên',
        style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
      ),
      content: SizedBox(
        width: 340,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Scheduled info
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xffeff6ff),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  const Icon(Icons.calendar_today_outlined,
                      color: Color(0xff3b82f6), size: 16),
                  const SizedBox(width: 8),
                  Text(
                    '${_formatDate(widget.data['scheduledDate'])} — ${widget.data['scheduledSlotLabel'] ?? ''}',
                    style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xff1e40af),
                        fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),
            const Text('Chọn kỹ thuật viên:',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 10),

            // Technician list
            ..._technicians.map((tech) => RadioListTile<String>(
                  value: tech['id']!,
                  groupValue: _selectedTechId,
                  onChanged: (val) => setState(() {
                    _selectedTechId = val;
                    _hasConflict = null;
                  }),
                  title: Text(tech['name']!,
                      style: const TextStyle(
                          fontWeight: FontWeight.w600, fontSize: 13)),
                  subtitle: Text(tech['phone']!,
                      style: const TextStyle(fontSize: 11)),
                  contentPadding: EdgeInsets.zero,
                  dense: true,
                  activeColor: const Color(0xff00459a),
                )),

            // Conflict warning
            if (_hasConflict == true) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xfffef2f2),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xfffecaca)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.warning_amber_rounded,
                        color: Colors.redAccent, size: 18),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Kỹ thuật viên này đã có lịch vào khung giờ đó! Vui lòng chọn người khác.',
                        style: TextStyle(
                            fontSize: 12, color: Colors.redAccent),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            if (_hasConflict == false) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xfff0fdf4),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.check_circle_outline,
                        color: Color(0xff22c55e), size: 18),
                    SizedBox(width: 8),
                    Text(
                      'Lịch trống — Đang phân công...',
                      style: TextStyle(
                          fontSize: 12, color: Color(0xff16a34a)),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Huỷ'),
        ),
        ElevatedButton(
          onPressed: _selectedTechId == null || _isChecking || _isAssigning
              ? null
              : _checkAndAssign,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xff00459a),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          child: _isChecking
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                      color: Colors.white, strokeWidth: 2),
                )
              : const Text('Xác nhận phân công'),
        ),
      ],
    );
  }

  String _formatDate(dynamic ts) {
    if (ts is Timestamp) {
      return DateFormat('d/M/yyyy').format(ts.toDate());
    }
    return '';
  }
}

// ── Mini row widget ─────────────────────────────────────────────────────────

class _MiniRow extends StatelessWidget {
  final IconData icon;
  final String text;
  final bool highlight;

  const _MiniRow({
    required this.icon,
    required this.text,
    this.highlight = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon,
            size: 14,
            color: highlight
                ? const Color(0xff3b82f6)
                : const Color(0xff94a3b8)),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              fontSize: 12,
              color: highlight
                  ? const Color(0xff1e40af)
                  : const Color(0xff374151),
              fontWeight:
                  highlight ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
        ),
      ],
    );
  }
}
