import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:shared/theme/app_colors.dart';
import '../../../controllers/job_controller.dart';

class InvoiceScreen extends StatelessWidget {
  final String jobId;
  const InvoiceScreen({super.key, required this.jobId});

  static final _currFmt = NumberFormat.currency(
    locale: 'vi_VN', symbol: 'đ', decimalDigits: 0);

  String _fmt(double v) => v == 0 ? '0đ' : _currFmt.format(v);

  @override
  Widget build(BuildContext context) {
    final ctrl = context.watch<JobController>();
    final idx = ctrl.jobs.indexWhere((j) => j.id == jobId);
    if (idx == -1) {
      return const Scaffold(
        body: Center(child: Text('Không tìm thấy đơn hàng')),
      );
    }
    final job = ctrl.jobs[idx];

    final vatTuList = job.vatTuPhatSinh;
    final tongVatTu = vatTuList.fold<double>(
      0,
      (s, item) => s + ((item['thanhTien'] as num?)?.toDouble() ?? 0),
    );
    final tongCong = job.codAmount + tongVatTu;

    return Scaffold(
      backgroundColor: const Color(0xfff0f4ff),
      appBar: AppBar(
        title: const Text(
          'Hóa đơn dịch vụ',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800),
        ),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        iconTheme: const IconThemeData(color: Colors.white),
        actionsIconTheme: const IconThemeData(color: Colors.white),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('📄 Tính năng xuất PDF đang phát triển'),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
            tooltip: 'Chia sẻ hóa đơn',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _InvoiceHeader(jobId: jobId, job: job),
            const SizedBox(height: 16),
            _SectionCard(
              title: 'THÔNG TIN KHÁCH HÀNG',
              icon: Icons.person_outline,
              child: Column(
                children: [
                  _InfoRow(label: 'Khách hàng', value: job.customerName),
                  _InfoRow(label: 'Số điện thoại', value: job.customerPhone),
                  _InfoRow(
                    label: 'Địa chỉ',
                    value: job.address,
                    isMultiLine: true,
                  ),
                  _InfoRow(label: 'Giờ hẹn', value: job.appointmentTime),
                ],
              ),
            ),
            const SizedBox(height: 12),
            _SectionCard(
              title: 'DỊCH VỤ LẮP ĐẶT',
              icon: Icons.handyman_outlined,
              child: Column(
                children: [
                  _InfoRow(label: 'Sản phẩm', value: job.productName),
                  if (job.productSpecs.isNotEmpty)
                    _InfoRow(
                      label: 'Thông số',
                      value: job.productSpecs,
                      isMultiLine: true,
                    ),
                  const Divider(height: 20, color: Color(0xffe2e8f0)),
                  _PriceRow(
                    label: 'Phí dịch vụ (COD)',
                    value: job.codAmount,
                    formatFn: _fmt,
                    isBold: false,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            if (vatTuList.isNotEmpty) ...[
              _SectionCard(
                title: 'VẬT TƯ PHÁT SINH',
                icon: Icons.build_outlined,
                iconColor: const Color(0xffea580c),
                child: Column(
                  children: [
                    const Padding(
                      padding: EdgeInsets.only(bottom: 8),
                      child: Row(
                        children: [
                          Expanded(
                            flex: 4,
                            child: Text(
                              'Tên vật tư',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: Color(0xff94a3b8),
                                letterSpacing: 0.3,
                              ),
                            ),
                          ),
                          SizedBox(
                            width: 40,
                            child: Text(
                              'SL',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: Color(0xff94a3b8),
                              ),
                            ),
                          ),
                          SizedBox(
                            width: 80,
                            child: Text(
                              'Đơn giá',
                              textAlign: TextAlign.right,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: Color(0xff94a3b8),
                              ),
                            ),
                          ),
                          SizedBox(
                            width: 80,
                            child: Text(
                              'T. Tiền',
                              textAlign: TextAlign.right,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: Color(0xff94a3b8),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Divider(height: 1, color: Color(0xffe2e8f0)),
                    const SizedBox(height: 8),
                    ...vatTuList.map((item) {
                      final sl = (item['soLuong'] as num?)?.toInt() ?? 1;
                      final dg = (item['donGia'] as num?)?.toDouble() ?? 0;
                      final tt =
                          (item['thanhTien'] as num?)?.toDouble() ?? sl * dg;
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 5),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              flex: 4,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item['tenVatTu'] ?? '',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 13,
                                    ),
                                  ),
                                  if ((item['ghiChu'] as String?)?.isNotEmpty ==
                                      true)
                                    Text(
                                      item['ghiChu'] as String,
                                      style: const TextStyle(
                                        fontSize: 11,
                                        color: Color(0xff94a3b8),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                            SizedBox(
                              width: 40,
                              child: Text(
                                '$sl',
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                            SizedBox(
                              width: 80,
                              child: Text(
                                dg > 0 ? _fmt(dg) : '-',
                                textAlign: TextAlign.right,
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: Color(0xff64748b),
                                ),
                              ),
                            ),
                            SizedBox(
                              width: 80,
                              child: Text(
                                tt > 0 ? _fmt(tt) : '-',
                                textAlign: TextAlign.right,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 13,
                                  color: Color(0xff10b981),
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    }),
                    const Divider(height: 20, color: Color(0xffe2e8f0)),
                    _PriceRow(
                      label: 'Tổng vật tư phát sinh',
                      value: tongVatTu,
                      formatFn: _fmt,
                      color: const Color(0xffea580c),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
            ],
            // Tổng thanh toán
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xff0052cc), Color(0xff0284c7)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  _PriceRowLight(
                    label: 'Phí dịch vụ',
                    value: _fmt(job.codAmount),
                  ),
                  if (tongVatTu > 0)
                    _PriceRowLight(
                      label: 'Vật tư phát sinh',
                      value: _fmt(tongVatTu),
                    ),
                  const SizedBox(height: 8),
                  const Divider(color: Colors.white24, height: 1),
                  const SizedBox(height: 14),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'TỔNG CỘNG',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          fontSize: 14,
                          letterSpacing: 0.5,
                        ),
                      ),
                      Text(
                        _fmt(tongCong),
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          fontSize: 24,
                        ),
                      ),
                    ],
                  ),
                  if (job.tipAmount > 0) ...[
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          '(+) Tiền tip từ khách',
                          style: TextStyle(color: Colors.white70, fontSize: 12),
                        ),
                        Text(
                          _fmt(job.tipAmount),
                          style: const TextStyle(
                            color: Color(0xff86efac),
                            fontWeight: FontWeight.w800,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 16),
            _ActionRow(
              jobId: jobId,
              job: job,
              fmt: _fmt,
              tongVatTu: tongVatTu,
              tongCong: tongCong,
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

// ── Sub-widgets ───────────────────────────────────────────────────────────────

class _InvoiceHeader extends StatelessWidget {
  final String jobId;
  final JobModel job;
  const _InvoiceHeader({required this.jobId, required this.job});

  String _formatDate(DateTime dt) =>
      '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 8),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.receipt_long,
              color: AppColors.primary,
              size: 26,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'HÓA ĐƠN DỊCH VỤ',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: Color(0xff94a3b8),
                    letterSpacing: 1,
                  ),
                ),
                Text(
                  '#$jobId',
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 18,
                    color: AppColors.onSurface,
                  ),
                ),
                Text(
                  _formatDate(DateTime.now()),
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xff64748b),
                  ),
                ),
              ],
            ),
          ),
          _StatusChip(status: job.status),
        ],
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final JobStatus status;
  const _StatusChip({required this.status});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: status.color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: status.color.withValues(alpha: 0.4)),
      ),
      child: Text(
        status.displayName,
        style: TextStyle(
          color: status.color,
          fontWeight: FontWeight.w800,
          fontSize: 11,
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color? iconColor;
  final Widget child;
  const _SectionCard({
    required this.title,
    required this.icon,
    this.iconColor,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 6),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: iconColor ?? AppColors.primary),
              const SizedBox(width: 6),
              Text(
                title,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w900,
                  color: iconColor ?? AppColors.primary,
                  letterSpacing: 1,
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

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isMultiLine;
  const _InfoRow({
    required this.label,
    required this.value,
    this.isMultiLine = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: isMultiLine
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    color: Color(0xff94a3b8),
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  value,
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                  ),
                ),
              ],
            )
          : Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    color: Color(0xff94a3b8),
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Flexible(
                  child: Text(
                    value,
                    textAlign: TextAlign.right,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}

class _PriceRow extends StatelessWidget {
  final String label;
  final double value;
  final String Function(double) formatFn;
  final Color color;
  final bool isBold;
  const _PriceRow({
    required this.label,
    required this.value,
    required this.formatFn,
    this.color = const Color(0xff10b981),
    this.isBold = true,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontWeight: isBold ? FontWeight.w800 : FontWeight.w600,
            fontSize: 13,
            color: isBold ? AppColors.onSurface : const Color(0xff64748b),
          ),
        ),
        Text(
          formatFn(value),
          style: TextStyle(
            fontWeight: FontWeight.w900,
            fontSize: isBold ? 16 : 14,
            color: color,
          ),
        ),
      ],
    );
  }
}

class _PriceRowLight extends StatelessWidget {
  final String label;
  final String value;
  const _PriceRowLight({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(color: Colors.white70, fontSize: 13),
          ),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w700,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionRow extends StatelessWidget {
  final String jobId;
  final JobModel job;
  final String Function(double) fmt;
  final double tongVatTu;
  final double tongCong;

  const _ActionRow({
    required this.jobId,
    required this.job,
    required this.fmt,
    required this.tongVatTu,
    required this.tongCong,
  });

  String _buildInvoiceText() {
    final sb = StringBuffer();
    sb.writeln('===== HÓA ĐƠN DỊCH VỤ =====');
    sb.writeln('Mã đơn: #$jobId');
    sb.writeln('Khách hàng: ${job.customerName}');
    sb.writeln('SĐT: ${job.customerPhone}');
    sb.writeln('Địa chỉ: ${job.address}');
    sb.writeln('Sản phẩm: ${job.productName}');
    sb.writeln('----------------------------');
    sb.writeln('Phí dịch vụ: ${fmt(job.codAmount)}');
    if (job.vatTuPhatSinh.isNotEmpty) {
      sb.writeln('--- Vật tư phát sinh ---');
      for (final item in job.vatTuPhatSinh) {
        final sl = (item['soLuong'] as num?)?.toInt() ?? 1;
        final tt = (item['thanhTien'] as num?)?.toDouble() ?? 0;
        sb.writeln('  ${item['tenVatTu']} x$sl = ${fmt(tt)}');
      }
      sb.writeln('Tổng vật tư: ${fmt(tongVatTu)}');
    }
    sb.writeln('============================');
    sb.writeln('TỔNG CỘNG: ${fmt(tongCong)}');
    if (job.tipAmount > 0) sb.writeln('(+) Tip: ${fmt(job.tipAmount)}');
    sb.writeln('Cảm ơn quý khách!');
    return sb.toString();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // ── Nút QR Thanh toán (nổi bật) ──
        SizedBox(
          width: double.infinity,
          height: 52,
          child: ElevatedButton.icon(
            onPressed: () {
              final desc = 'DH${jobId} ${job.customerName}';
              Navigator.pushNamed(
                context,
                '/payment-qr',
                arguments: {
                  'jobId': jobId,
                  'amount': tongCong,
                  'desc': desc,
                },
              );
            },
            icon: const Icon(Icons.qr_code_2_rounded, size: 22),
            label: const Text(
              'QR THANH TOÁN',
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xff0052cc),
              foregroundColor: Colors.white,
              elevation: 8,
              shadowColor: const Color(0xff0052cc).withValues(alpha: 0.4),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16)),
            ),
          ),
        ),
        const SizedBox(height: 10),
        // ── Sao chép + Chia sẻ ──
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () {
                  Clipboard.setData(ClipboardData(text: _buildInvoiceText()));
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('📋 Đã sao chép hóa đơn vào clipboard'),
                      behavior: SnackBarBehavior.floating,
                      backgroundColor: Color(0xff10b981),
                    ),
                  );
                },
                icon: const Icon(Icons.copy_outlined, size: 18),
                label: const Text('SAO CHÉP'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.primary,
                  side: const BorderSide(color: AppColors.primary),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('📤 Tính năng chia sẻ đang phát triển'),
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                },
                icon: const Icon(Icons.share_outlined, size: 18),
                label: const Text('CHIA SẺ'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xff10b981),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

