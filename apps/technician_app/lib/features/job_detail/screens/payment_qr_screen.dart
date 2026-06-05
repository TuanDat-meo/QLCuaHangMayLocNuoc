import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:shared/theme/app_colors.dart';
import '../../../controllers/job_controller.dart';

/// Màn hình QR Thanh toán — hiển thị QR VietQR với TK cửa hàng cố định.
/// Argument (route): Map {'jobId': String, 'amount': double, 'desc': String}
class PaymentQRScreen extends StatefulWidget {
  final String jobId;
  final double amount;
  final String desc;

  const PaymentQRScreen({
    super.key,
    required this.jobId,
    required this.amount,
    required this.desc,
  });

  @override
  State<PaymentQRScreen> createState() => _PaymentQRScreenState();
}

class _PaymentQRScreenState extends State<PaymentQRScreen> {
  // Thông tin TK cửa hàng mặc định (override bởi Firestore nếu có)
  String _bankId = '970415'; // MB Bank mặc định
  String _bankName = 'VietinBank';
  String _accountNo = '108879659693';
  String _accountName = 'CỬA HÀNG MÁY LỌC NƯỚC';
  bool _loading = true;
  bool _confirmed = false;
  bool _confirming = false;

  final _currFmt = NumberFormat.currency(
    locale: 'vi_VN',
    symbol: 'đ',
    decimalDigits: 0,
  );

  @override
  void initState() {
    super.initState();
    _loadBankInfo();
  }

  Future<void> _loadBankInfo() async {
    try {
      final doc = await FirebaseFirestore.instance
          .collection('caiDat')
          .doc('thanhToan')
          .get();
      if (doc.exists && mounted) {
        final data = doc.data()!;
        setState(() {
          _bankId = data['bankId'] ?? _bankId;
          _bankName = data['bankName'] ?? _bankName;
          _accountNo = data['soTaiKhoan'] ?? _accountNo;
          _accountName = data['tenTaiKhoan'] ?? _accountName;
        });
      }
    } catch (_) {
      // Dùng giá trị mặc định nếu không lấy được
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  /// Tạo URL QR VietQR với số tiền và mô tả động
  String get _qrUrl {
    final encodedDesc = Uri.encodeComponent(widget.desc);
    final encodedName = Uri.encodeComponent(_accountName);
    final amountInt = widget.amount.toInt();
    return 'https://img.vietqr.io/image/$_bankId-$_accountNo-compact2.png'
        '?amount=$amountInt'
        '&addInfo=$encodedDesc'
        '&accountName=$encodedName';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xfff0f4ff),
      appBar: AppBar(
        title: const Text(
          'QR Thanh toán',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800),
        ),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        iconTheme: const IconThemeData(color: Colors.white),
        elevation: 0,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  _buildAmountHeader(),
                  const SizedBox(height: 20),
                  _buildQRCard(),
                  const SizedBox(height: 20),
                  _buildBankInfoCard(),
                  const SizedBox(height: 20),
                  _buildConfirmButton(),
                  const SizedBox(height: 16),
                  _buildInstructions(),
                  const SizedBox(height: 24),
                ],
              ),
            ),
    );
  }

  Widget _buildAmountHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary,
            AppColors.primary.withValues(alpha: 0.75),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.35),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          const Text(
            'TỔNG TIỀN THANH TOÁN',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 11,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _currFmt.format(widget.amount),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 36,
              fontWeight: FontWeight.w900,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Đơn #${widget.jobId}',
            style: const TextStyle(
              color: Colors.white60,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQRCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // Header VietQR brand
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xff0052cc).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  'VietQR',
                  style: TextStyle(
                    color: Color(0xff0052cc),
                    fontWeight: FontWeight.w900,
                    fontSize: 14,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                '• Quét để thanh toán ngay',
                style: TextStyle(
                  fontSize: 12,
                  color: Color(0xff64748b),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // QR Image
          Container(
            decoration: BoxDecoration(
              border: Border.all(color: const Color(0xffe2e8f0), width: 2),
              borderRadius: BorderRadius.circular(16),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: Image.network(
                _qrUrl,
                width: 260,
                height: 260,
                fit: BoxFit.contain,
                loadingBuilder: (_, child, progress) {
                  if (progress == null) return child;
                  return const SizedBox(
                    width: 260,
                    height: 260,
                    child: Center(child: CircularProgressIndicator()),
                  );
                },
                errorBuilder: (_, __, ___) => SizedBox(
                  width: 260,
                  height: 260,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
                      Icon(Icons.qr_code_2, size: 80, color: Color(0xffcbd5e1)),
                      SizedBox(height: 12),
                      Text(
                        'Không tải được QR\nKiểm tra kết nối mạng',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Color(0xff94a3b8),
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          const SizedBox(height: 16),
          const Text(
            'Khách hàng mở app ngân hàng → Quét QR',
            style: TextStyle(
              fontSize: 13,
              color: Color(0xff64748b),
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBankInfoCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xffe2e8f0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'THÔNG TIN TÀI KHOẢN CỬA HÀNG',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w900,
              color: Color(0xff94a3b8),
              letterSpacing: 1,
            ),
          ),
          const SizedBox(height: 14),
          _infoRow(Icons.account_balance_outlined, 'Ngân hàng', _bankName),
          const Divider(height: 20, color: Color(0xfff1f5f9)),
          _infoRow(Icons.badge_outlined, 'Chủ tài khoản', _accountName),
          const Divider(height: 20, color: Color(0xfff1f5f9)),
          Row(
            children: [
              const Icon(
                Icons.credit_card_outlined,
                size: 18,
                color: Color(0xff64748b),
              ),
              const SizedBox(width: 10),
              const Expanded(
                child: Text(
                  'Số tài khoản',
                  style: TextStyle(
                    fontSize: 13,
                    color: Color(0xff64748b),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              Text(
                _accountNo,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w900,
                  color: AppColors.onSurface,
                  letterSpacing: 1,
                ),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () {
                  Clipboard.setData(ClipboardData(text: _accountNo));
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('✅ Đã sao chép số tài khoản'),
                      behavior: SnackBarBehavior.floating,
                      backgroundColor: Color(0xff10b981),
                      duration: Duration(seconds: 2),
                    ),
                  );
                },
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.copy_rounded,
                    size: 16,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
          const Divider(height: 20, color: Color(0xfff1f5f9)),
          _infoRow(Icons.description_outlined, 'Nội dung CK', widget.desc),
        ],
      ),
    );
  }

  Widget _infoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 18, color: const Color(0xff64748b)),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              color: Color(0xff64748b),
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w800,
              color: AppColors.onSurface,
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _handleConfirmPayment() async {
    setState(() => _confirming = true);
    
    final jobController = context.read<JobController>();
    final ok = await jobController.confirmPayment(
      jobId: widget.jobId,
      method: 'QR',
      amount: widget.amount,
    );

    if (mounted) {
      setState(() {
        _confirming = false;
        if (ok) {
          _confirmed = true;
        }
      });

      if (ok) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              '✅ Đã xác nhận thanh toán thành công qua QR đơn #${widget.jobId}',
            ),
            behavior: SnackBarBehavior.floating,
            backgroundColor: const Color(0xff10b981),
          ),
        );
        // Quay về màn hình chính ngay sau 1.5 giây
        Future.delayed(const Duration(milliseconds: 1500), () {
          if (mounted) {
            Navigator.of(context).popUntil((route) => route.isFirst);
          }
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('❌ Có lỗi xảy ra khi xác nhận thanh toán'),
            behavior: SnackBarBehavior.floating,
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Widget _buildConfirmButton() {
    if (_confirmed) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: const Color(0xffd1fae5),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xff10b981)),
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.check_circle, color: Color(0xff10b981), size: 22),
            SizedBox(width: 8),
            Text(
              'Đã xác nhận thanh toán!',
              style: TextStyle(
                color: Color(0xff10b981),
                fontWeight: FontWeight.w900,
                fontSize: 15,
              ),
            ),
          ],
        ),
      );
    }

    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton.icon(
        onPressed: _confirming ? null : _handleConfirmPayment,
        icon: _confirming
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
              )
            : const Icon(Icons.check_circle_outline, size: 20),
        label: Text(
          _confirming ? 'ĐANG GHI NHẬN...' : 'KHÁCH ĐÃ THANH TOÁN',
          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xff10b981),
          foregroundColor: Colors.white,
          elevation: 8,
          shadowColor: const Color(0xff10b981).withValues(alpha: 0.4),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
    );
  }

  Widget _buildInstructions() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xfffff7ed),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xfffed7aa)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Row(
            children: [
              Icon(Icons.info_outline, size: 16, color: Color(0xffea580c)),
              SizedBox(width: 6),
              Text(
                'Hướng dẫn thanh toán',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  color: Color(0xffea580c),
                ),
              ),
            ],
          ),
          SizedBox(height: 10),
          _Step(
            no: '1',
            text: 'Khách mở app ngân hàng / ví điện tử (MoMo, ZaloPay...)',
          ),
          SizedBox(height: 6),
          _Step(no: '2', text: 'Chọn "Quét QR" và hướng camera vào mã trên'),
          SizedBox(height: 6),
          _Step(
            no: '3',
            text: 'Kiểm tra số tiền và nội dung, nhấn xác nhận chuyển khoản',
          ),
          SizedBox(height: 6),
          _Step(
            no: '4',
            text: 'Sau khi nhận được tiền, bấm "Khách đã thanh toán"',
          ),
        ],
      ),
    );
  }
}

class _Step extends StatelessWidget {
  final String no;
  final String text;
  const _Step({required this.no, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 20,
          height: 20,
          decoration: const BoxDecoration(
            color: Color(0xffea580c),
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              no,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 11,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 12,
              color: Color(0xff92400e),
              fontWeight: FontWeight.w600,
              height: 1.4,
            ),
          ),
        ),
      ],
    );
  }
}
