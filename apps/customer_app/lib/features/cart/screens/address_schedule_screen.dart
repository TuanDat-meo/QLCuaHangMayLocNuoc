// lib/features/cart/address_schedule_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:customer_app/controllers/auth_controller.dart';
import 'package:customer_app/models/order_model.dart';

class AddressScheduleScreen extends StatefulWidget {
  const AddressScheduleScreen({super.key});

  @override
  State<AddressScheduleScreen> createState() => _AddressScheduleScreenState();
}

class _AddressScheduleScreenState extends State<AddressScheduleScreen> {
  String? _selectedAddressId;
  final TextEditingController _searchController = TextEditingController();

  // ── Schedule data ────────────────────────────────────────────────────────
  late DateTime _selectedDate;
  String _selectedSlotId = 'slot2';

  final List<ScheduleSlot> _timeSlots = const [
    ScheduleSlot(id: 'slot1', label: '08:00 - 10:00', startHour: 8, endHour: 10),
    ScheduleSlot(id: 'slot2', label: '10:00 - 12:00', startHour: 10, endHour: 12),
    ScheduleSlot(id: 'slot3', label: '13:00 - 15:00', startHour: 13, endHour: 15),
  ];

  @override
  void initState() {
    super.initState();
    // Bắt đầu từ ngày mai (Bao gồm cả Chủ Nhật theo yêu cầu)
    _selectedDate = DateTime.now().add(const Duration(days: 1));
    
    // Set initial selected address from AuthController if possible
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = context.read<AuthController>();
      if (auth.customerUser?.defaultAddress != null) {
        setState(() {
          _selectedAddressId = auth.customerUser!.defaultAddress!.id;
          _searchController.text = auth.customerUser!.defaultAddress!.fullAddress;
        });
      } else if (auth.customerUser?.addresses.isNotEmpty ?? false) {
        setState(() {
          _selectedAddressId = auth.customerUser!.addresses.first.id;
          _searchController.text = auth.customerUser!.addresses.first.fullAddress;
        });
      }
    });
  }

  // Tạo danh sách 14 ngày tới (Bao gồm Chủ Nhật)
  List<DateTime> get _availableDates {
    final dates = <DateTime>[];
    var date = DateTime.now().add(const Duration(days: 1));
    while (dates.length < 14) {
      dates.add(date);
      date = date.add(const Duration(days: 1));
    }
    return dates;
  }

  String _dayLabel(DateTime date) {
    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    return days[date.weekday - 1];
  }

  String _monthLabel(DateTime date) => 'Tháng ${date.month}';

  void _goToConfirmation(List<Address> addresses) {
    if (_selectedAddressId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn địa chỉ lắp đặt')),
      );
      return;
    }

    final selectedAddress =
        addresses.firstWhere((a) => a.id == _selectedAddressId);
    final selectedSlot =
        _timeSlots.firstWhere((s) => s.id == _selectedSlotId);

    Navigator.pushNamed(
      context,
      '/order-confirmation',
      arguments: {
        'address': selectedAddress,
        'scheduledDate': _selectedDate,
        'scheduledSlot': selectedSlot,
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final availableDates = _availableDates;

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
          'Chọn địa chỉ & Giờ hẹn',
          style: TextStyle(
            color: Color(0xff0b1c30),
            fontWeight: FontWeight.w900,
            fontSize: 18,
          ),
        ),
      ),
      body: Consumer<AuthController>(
        builder: (context, auth, _) {
          final addresses = auth.customerUser?.addresses ?? [];

          return Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // ── Địa chỉ lắp đặt ──────────────────────────────────
                      _SectionCard(
                        icon: Icons.location_on_outlined,
                        iconColor: const Color(0xff3b82f6),
                        title: 'Địa chỉ lắp đặt',
                        child: Column(
                          children: [
                            Container(
                              decoration: BoxDecoration(
                                color: const Color(0xfff8fafc),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: const Color(0xffe2e8f0)),
                              ),
                              child: Row(
                                children: [
                                  const Padding(
                                    padding: EdgeInsets.only(left: 12),
                                    child: Icon(Icons.search,
                                        color: Color(0xff94a3b8), size: 20),
                                  ),
                                  Expanded(
                                    child: TextField(
                                      controller: _searchController,
                                      readOnly: true,
                                      decoration: const InputDecoration(
                                        hintText: 'Chọn địa chỉ bên dưới...',
                                        border: InputBorder.none,
                                        contentPadding: EdgeInsets.symmetric(
                                            horizontal: 12, vertical: 12),
                                        hintStyle: TextStyle(
                                            color: Color(0xffb0bec5), fontSize: 13),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 12),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                height: 130,
                                color: const Color(0xffe8f4fd),
                                child: Stack(
                                  children: [
                                    CustomPaint(
                                      size: const Size(double.infinity, 130),
                                      painter: _MapGridPainter(),
                                    ),
                                    Center(
                                      child: Column(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          const Icon(Icons.location_pin,
                                              color: Color(0xffef4444), size: 36),
                                          Padding(
                                            padding: const EdgeInsets.symmetric(horizontal: 16),
                                            child: Text(
                                              _searchController.text.isEmpty 
                                                ? 'Chưa chọn địa chỉ' 
                                                : _searchController.text,
                                              textAlign: TextAlign.center,
                                              style: const TextStyle(
                                                fontSize: 11,
                                                color: Color(0xff374151),
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(height: 16),
                            const Align(
                              alignment: Alignment.centerLeft,
                              child: Text(
                                'Địa chỉ đã lưu',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xff374151),
                                ),
                              ),
                            ),
                            const SizedBox(height: 10),
                            if (addresses.isEmpty)
                              const Padding(
                                padding: EdgeInsets.symmetric(vertical: 10),
                                child: Text('Bạn chưa có địa chỉ nào được lưu.', 
                                  style: TextStyle(fontSize: 12, color: Colors.grey)),
                              ),
                            ...addresses.map((address) => _AddressCard(
                                  address: address,
                                  isSelected: _selectedAddressId == address.id,
                                  onTap: () => setState(() {
                                      _selectedAddressId = address.id;
                                      _searchController.text = address.fullAddress;
                                  }),
                                )),
                            const SizedBox(height: 8),
                            InkWell(
                              borderRadius: BorderRadius.circular(12),
                              onTap: () => Navigator.pushNamed(context, '/add-address'),
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    vertical: 14, horizontal: 16),
                                decoration: BoxDecoration(
                                  border: Border.all(
                                    color: const Color(0xff3b82f6),
                                    style: BorderStyle.solid,
                                  ),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.add,
                                        color: Color(0xff3b82f6), size: 18),
                                    SizedBox(width: 8),
                                    Text(
                                      'Thêm địa chỉ mới',
                                      style: TextStyle(
                                        color: Color(0xff3b82f6),
                                        fontWeight: FontWeight.bold,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      // ── Thời gian hẹn ─────────────────────────────────────
                      _SectionCard(
                        icon: Icons.calendar_month_outlined,
                        iconColor: const Color(0xff3b82f6),
                        title: 'Thời gian hẹn',
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  _monthLabel(_selectedDate),
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                    color: Color(0xff374151),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            SizedBox(
                              height: 72,
                              child: ListView.builder(
                                scrollDirection: Axis.horizontal,
                                itemCount: availableDates.length,
                                itemBuilder: (context, index) {
                                  final date = availableDates[index];
                                  final isSelected = date.day == _selectedDate.day &&
                                      date.month == _selectedDate.month;
                                  return GestureDetector(
                                    onTap: () =>
                                        setState(() => _selectedDate = date),
                                    child: Container(
                                      width: 46,
                                      margin: const EdgeInsets.only(right: 8),
                                      decoration: BoxDecoration(
                                        color: isSelected
                                            ? const Color(0xff00459a)
                                            : Colors.transparent,
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Text(
                                            _dayLabel(date),
                                            style: TextStyle(
                                              fontSize: 11,
                                              color: isSelected
                                                  ? Colors.white70
                                                  : const Color(0xff94a3b8),
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            '${date.day}',
                                            style: TextStyle(
                                              fontSize: 18,
                                              fontWeight: FontWeight.bold,
                                              color: isSelected
                                                  ? Colors.white
                                                  : const Color(0xff374151),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                            const SizedBox(height: 20),
                            const Text(
                              'Giờ khả dụng',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Color(0xff374151),
                              ),
                            ),
                            const SizedBox(height: 10),
                            GridView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              gridDelegate:
                                  const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                childAspectRatio: 3.5,
                                crossAxisSpacing: 10,
                                mainAxisSpacing: 10,
                              ),
                              itemCount: _timeSlots.length,
                              itemBuilder: (context, index) {
                                final slot = _timeSlots[index];
                                final isSelected = _selectedSlotId == slot.id;
                                return GestureDetector(
                                  onTap: () =>
                                      setState(() => _selectedSlotId = slot.id),
                                  child: Container(
                                    decoration: BoxDecoration(
                                      color: isSelected
                                          ? const Color(0xff00459a)
                                          : const Color(0xfff1f5f9),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    alignment: Alignment.center,
                                    child: Text(
                                      slot.label,
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                        color: isSelected
                                            ? Colors.white
                                            : const Color(0xff64748b),
                                      ),
                                    ),
                                  ),
                                );
                              },
                            ),
                            const SizedBox(height: 16),
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: const Color(0xfffff7ed),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Row(
                                children: [
                                  Icon(Icons.info_outline,
                                      color: Color(0xfff97316), size: 16),
                                  SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      'Ghi chú cho kỹ thuật viên',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Color(0xff92400e),
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 10),
                            TextField(
                              maxLines: 2,
                              decoration: InputDecoration(
                                hintText:
                                    'Ví dụ: Điện trước khi đến trước 30 phút...',
                                filled: true,
                                fillColor: const Color(0xfff8fafc),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: BorderSide.none,
                                ),
                                hintStyle: const TextStyle(
                                    fontSize: 12, color: Color(0xffb0bec5)),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
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
                      onPressed: () => _goToConfirmation(addresses),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xff00459a),
                        padding: const EdgeInsets.symmetric(vertical: 18),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16)),
                      ),
                      child: const Text(
                        'Tiếp tục',
                        style:
                            TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
                      ),
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

class _SectionCard extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final Widget child;

  const _SectionCard({
    required this.icon,
    required this.iconColor,
    required this.title,
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
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: iconColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: iconColor, size: 18),
              ),
              const SizedBox(width: 12),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                  color: Color(0xff0b1c30),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }
}

class _AddressCard extends StatelessWidget {
  final Address address;
  final bool isSelected;
  final VoidCallback onTap;

  const _AddressCard({
    required this.address,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xffeff6ff)
              : const Color(0xfff8fafc),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? const Color(0xff3b82f6)
                : const Color(0xffe2e8f0),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              address.type == 'home'
                  ? Icons.home_outlined
                  : Icons.business_outlined,
              color: isSelected
                  ? const Color(0xff3b82f6)
                  : const Color(0xff94a3b8),
              size: 22,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    address.recipientName,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                      color: Color(0xff1e293b),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    address.fullAddress,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xff64748b),
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_circle,
                  color: Color(0xff3b82f6), size: 20),
          ],
        ),
      ),
    );
  }
}

class _MapGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xffb8d9f5)
      ..strokeWidth = 1;

    for (var i = 0; i < 6; i++) {
      final y = (size.height / 5) * i;
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
    for (var i = 0; i < 10; i++) {
      final x = (size.width / 9) * i;
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
  }

  @override
  bool shouldRepaint(_) => false;
}
