import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shared/theme/app_colors.dart';
import '../../../controllers/job_controller.dart';

class JobDetailScreen extends StatefulWidget {
  final String jobId;
  const JobDetailScreen({super.key, required this.jobId});

  @override
  State<JobDetailScreen> createState() => _JobDetailScreenState();
}

class _JobDetailScreenState extends State<JobDetailScreen> {
  final NumberFormat _currencyFormat = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');

  // ── Deep link actions ────────────────────────────────────────────
  Future<void> _callPhone(String phone) async {
    final uri = Uri(scheme: 'tel', path: phone);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        await launchUrl(uri);
      }
    } catch (e) {
      if (mounted) {
        _showLaunchError('Không thể mở ứng dụng gọi điện.');
      }
    }
  }

  Future<void> _openZalo(String phone) async {
    // Chuẩn hóa số điện thoại: bỏ dấu + và khoảng trắng
    final cleaned = phone.replaceAll(RegExp(r'[^0-9]'), '');
    final uri = Uri.parse('https://zalo.me/$cleaned');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } catch (e) {
      if (mounted) {
        _showLaunchError('Không thể mở Zalo. Vui lòng kiểm tra ứng dụng Zalo đã được cài đặt.');
      }
    }
  }

  Future<void> _sendSms(String phone) async {
    final uri = Uri(scheme: 'sms', path: phone);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        await launchUrl(uri);
      }
    } catch (e) {
      if (mounted) {
        _showLaunchError('Không thể mở ứng dụng nhắn tin.');
      }
    }
  }

  void _showLaunchError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: Colors.red),
    );
  }

  void _showStatusConfirmation(JobStatus nextStatus, String title, String message) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: Text(
            title,
            style: const TextStyle(fontWeight: FontWeight.w900, color: AppColors.onSurface, fontSize: 18),
          ),
          content: Text(
            message,
            style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xff64748b), height: 1.4),
          ),
          actionsPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text(
                'HỦY BỎ',
                style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xff94a3b8)),
              ),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(context);
                final controller = context.read<JobController>();
                final messenger = ScaffoldMessenger.of(context);
                final success = await controller.updateJobStatus(widget.jobId, nextStatus);
                if (mounted) {
                  if (success) {
                    messenger.showSnackBar(
                      SnackBar(
                        content: Text('Đã cập nhật: ${nextStatus.displayName}'),
                        backgroundColor: nextStatus.color,
                      ),
                    );
                  } else {
                    messenger.showSnackBar(
                      SnackBar(
                        content: Text('Cập nhật thất bại: ${controller.lastError ?? "Lỗi không xác định"}'),
                        backgroundColor: Colors.redAccent,
                        duration: const Duration(seconds: 5),
                      ),
                    );
                  }
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: nextStatus.color,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('XÁC NHẬN'),
            ),
          ],
        );
      },
    );
  }

  void _handlePrimaryAction(JobModel job) {
    switch (job.status) {
      case JobStatus.waiting:
        _showStatusConfirmation(
          JobStatus.onTheWay,
          'Bắt đầu di chuyển?',
          'Xác nhận bạn bắt đầu di chuyển tới địa điểm lắp đặt của khách hàng.',
        );
        break;
      case JobStatus.onTheWay:
        _handleArrivedCheckIn(job);
        break;
      case JobStatus.arrived:
        _showStatusConfirmation(
          JobStatus.installing,
          'Bắt đầu lắp đặt?',
          'Xác nhận bắt đầu quá trình lắp đặt máy lọc nước.',
        );
        break;
      case JobStatus.installing:
        Navigator.pushNamed(context, '/complete-installation', arguments: widget.jobId);
        break;
      case JobStatus.needSupport:
        _showStatusConfirmation(
          JobStatus.installing,
          'Tiếp tục lắp đặt?',
          'Quay lại trạng thái đang lắp đặt sau khi đã xử lý xong trục trặc.',
        );
        break;
      default:
        break;
    }
  }

  Future<void> _handleArrivedCheckIn(JobModel job) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const AlertDialog(
        content: Row(
          children: [
            CircularProgressIndicator(),
            SizedBox(width: 20),
            Expanded(
              child: Text(
                'Đang xác thực tọa độ GPS của bạn...',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
      ),
    );

    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (mounted) Navigator.pop(context);
        _showOverrideDialog(
          job,
          'Dịch vụ vị trí bị tắt',
          'Vui lòng bật GPS trên thiết bị của bạn để tự động xác thực vị trí.',
        );
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          if (mounted) Navigator.pop(context);
          _showOverrideDialog(
            job,
            'Quyền truy cập vị trí bị từ chối',
            'Ứng dụng cần quyền định vị để tự động check-in.',
          );
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        if (mounted) Navigator.pop(context);
        _showOverrideDialog(
          job,
          'Quyền định vị bị chặn vĩnh viễn',
          'Vui lòng cấp quyền vị trí trong Cài đặt thiết bị để sử dụng tính năng này.',
        );
        return;
      }

      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 8),
      );

      if (mounted) Navigator.pop(context);

      final double? custLat = job.customerLatitude;
      final double? custLng = job.customerLongitude;

      if (custLat == null || custLng == null) {
        _showOverrideDialog(
          job,
          'Thiếu tọa độ khách hàng',
          'Đơn hàng này chưa có dữ liệu vị trí GPS của khách hàng. Bạn có muốn xác nhận "Đã đến nơi" thủ công không?',
        );
        return;
      }

      double distanceInMeters = Geolocator.distanceBetween(
        position.latitude,
        position.longitude,
        custLat,
        custLng,
      );

      const double thresholdMeters = 500.0;

      if (distanceInMeters <= thresholdMeters) {
        _performCheckIn(job.id, position.latitude, position.longitude);
      } else {
        _showDistanceWarningDialog(job, position, distanceInMeters);
      }
    } catch (e) {
      if (mounted) Navigator.pop(context);
      _showOverrideDialog(
        job,
        'Lỗi định vị',
        'Không thể lấy tọa độ GPS từ thiết bị: $e. Bạn có muốn bỏ qua xác thực vị trí không?',
      );
    }
  }

  void _performCheckIn(String jobId, double lat, double lng) async {
    final controller = context.read<JobController>();
    final messenger = ScaffoldMessenger.of(context);
    final success = await controller.updateJobStatus(
      jobId,
      JobStatus.arrived,
      ktvLatitude: lat,
      ktvLongitude: lng,
    );
    if (mounted) {
      if (success) {
        messenger.showSnackBar(
          SnackBar(
            content: Text('Check-in thành công! Tọa độ GPS đã được ghi nhận: (${lat.toStringAsFixed(4)}, ${lng.toStringAsFixed(4)})'),
            backgroundColor: JobStatus.arrived.color,
          ),
        );
      } else {
        messenger.showSnackBar(
          SnackBar(
            content: Text('Check-in thất bại: ${controller.lastError ?? "Lỗi không xác định"}'),
            backgroundColor: Colors.redAccent,
            duration: const Duration(seconds: 5),
          ),
        );
      }
    }
  }

  void _showOverrideDialog(JobModel job, String title, String reason) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
        content: Text('$reason\n\nBạn có muốn BỎ QUA kiểm tra GPS để xác nhận "Đã đến nơi" thủ công không?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('HỦY', style: TextStyle(color: Color(0xff94a3b8), fontWeight: FontWeight.bold)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _performCheckIn(job.id, 0.0, 0.0);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xff0d9488),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('XÁC NHẬN THỦ CÔNG'),
          ),
        ],
      ),
    );
  }

  void _showDistanceWarningDialog(JobModel job, Position position, double distanceInMeters) {
    final km = distanceInMeters / 1000.0;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: Colors.orange, size: 28),
            SizedBox(width: 8),
            Text('Cảnh báo khoảng cách', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
          ],
        ),
        content: Text(
          'Khoảng cách từ vị trí hiện tại của bạn đến địa chỉ khách hàng là '
          '${km.toStringAsFixed(2)} km (ngưỡng quy định là 0.5 km).\n\n'
          'Bạn có chắc chắn đã đến đúng địa chỉ và muốn tiếp tục xác nhận không?',
          style: const TextStyle(height: 1.4, fontWeight: FontWeight.w600, color: Color(0xff64748b)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('QUAY LẠI', style: TextStyle(color: Color(0xff94a3b8), fontWeight: FontWeight.bold)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _performCheckIn(job.id, position.latitude, position.longitude);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xff0d9488),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('BỎ QUA & CHECK-IN'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final jobController = context.watch<JobController>();
    final jobIndex = jobController.jobs.indexWhere((j) => j.id == widget.jobId);

    if (jobIndex == -1) {
      return Scaffold(
        appBar: AppBar(title: const Text('Chi tiết công việc')),
        body: const Center(child: Text('Không tìm thấy công việc này.')),
      );
    }

    final job = jobController.jobs[jobIndex];

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: Text(job.id),
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.only(left: 16, right: 16, top: 16, bottom: 120),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildStatusBanner(job),
                const SizedBox(height: 16),
                _buildCustomerCard(job),
                const SizedBox(height: 16),
                _buildProductCard(job),
                const SizedBox(height: 16),
                if (job.adminNotes.isNotEmpty) ...[
                  _buildNotesCard(job),
                  const SizedBox(height: 16),
                ],
                _buildTimelineCard(job),
                if (job.status == JobStatus.needSupport && job.issueReason != null) ...[
                  const SizedBox(height: 16),
                  _buildIssueCard(job),
                ],
              ],
            ),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: _buildBottomStickyArea(job),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBanner(JobModel job) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xfff1f5f9)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: job.status.color.withAlpha(25),
              shape: BoxShape.circle,
            ),
            child: Icon(
              job.status == JobStatus.completed ? Icons.check_circle : Icons.pending_actions,
              color: job.status.color,
              size: 28,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  job.status.displayName.toUpperCase(),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    color: job.status.color,
                    letterSpacing: 1.0,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Hẹn lúc: ${job.appointmentTime}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: AppColors.onSurface,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCustomerCard(JobModel job) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xfff1f5f9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'THÔNG TIN KHÁCH HÀNG',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w900,
              color: Color(0xff94a3b8),
              letterSpacing: 1.0,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            job.customerName,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w900,
              color: AppColors.onSurface,
            ),
          ),
          const SizedBox(height: 12),
          // ── Số điện thoại + nút liên hệ ──
          Row(
            children: [
              const Icon(Icons.phone, size: 16, color: Color(0xff64748b)),
              const SizedBox(width: 8),
              Text(
                job.customerPhone,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Color(0xff475569),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // ── Quick action buttons ──
          Row(
            children: [
              Expanded(
                child: _contactBtn(
                  icon: Icons.call_rounded,
                  label: 'Gọi điện',
                  color: const Color(0xff0284c7),
                  onTap: () => _callPhone(job.customerPhone),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _contactBtn(
                  icon: Icons.chat_bubble_rounded,
                  label: 'Zalo',
                  color: const Color(0xff0068ff),
                  onTap: () => _openZalo(job.customerPhone),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _contactBtn(
                  icon: Icons.sms_rounded,
                  label: 'Nhắn tin',
                  color: const Color(0xff10b981),
                  onTap: () => _sendSms(job.customerPhone),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Padding(
                padding: EdgeInsets.only(top: 2),
                child: Icon(Icons.location_on, size: 16, color: Color(0xff64748b)),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      job.address,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Color(0xff475569),
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 8),
                    InkWell(
                      onTap: () {
                        Navigator.pushNamed(context, '/navigation', arguments: job.id);
                      },
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.directions, color: AppColors.primary, size: 16),
                          SizedBox(width: 4),
                          Text(
                            'Xem bản đồ dẫn đường',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: AppColors.primary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _contactBtn({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Material(
      color: color.withValues(alpha: 0.1),
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 10),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: color, size: 22),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: color,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProductCard(JobModel job) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xfff1f5f9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'THÔNG TIN SẢN PHẨM',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w900,
              color: Color(0xff94a3b8),
              letterSpacing: 1.0,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.primary.withAlpha(20),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.water_drop, color: AppColors.primary, size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      job.productName,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w900,
                        color: AppColors.onSurface,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      job.productSpecs,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Color(0xff94a3b8),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const Divider(height: 24, color: Color(0xfff1f5f9)),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Số tiền cần thu COD:',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: Color(0xff64748b),
                ),
              ),
              Text(
                job.codAmount == 0 ? 'Đã thanh toán trước' : _currencyFormat.format(job.codAmount),
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w900,
                  color: job.codAmount == 0 ? const Color(0xff10b981) : const Color(0xfff59e0b),
                ),
              ),
            ],
          ),
          if (job.status == JobStatus.completed && job.tipAmount > 0) ...[
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Tiền tip từ khách hàng:',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xff64748b)),
                ),
                Text(
                  _currencyFormat.format(job.tipAmount),
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xff10b981)),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildNotesCard(JobModel job) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xfffffbeb),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xfffde68a)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'GHI CHÚ LẮP ĐẶT',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w900,
              color: Color(0xffd97706),
              letterSpacing: 1.0,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            job.adminNotes,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: Color(0xff92400e),
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIssueCard(JobModel job) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xfffef2f2),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xfffee2e2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'BÁO CÁO SỰ CỐ',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w900,
              color: Colors.redAccent,
              letterSpacing: 1.0,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Lý do: ${job.issueReason}',
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w900,
              color: Colors.redAccent,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            job.issueDesc ?? 'Không mô tả chi tiết',
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: Colors.red,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineCard(JobModel job) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xfff1f5f9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'TIẾN ĐỘ CÔNG VIỆC',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w900,
              color: Color(0xff94a3b8),
              letterSpacing: 1.0,
            ),
          ),
          const SizedBox(height: 16),
          if (job.timeline.isEmpty)
            const Text(
              'Chưa có cập nhật tiến độ.',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xffcbd5e1)),
            )
          else
            ...job.timeline.map((step) {
              final isLast = job.timeline.indexOf(step) == job.timeline.length - 1;
              final timeStr = DateFormat('HH:mm dd/MM').format(step['time']);
              
              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Column(
                    children: [
                      Container(
                        width: 12,
                        height: 12,
                        decoration: const BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                      ),
                      if (!isLast)
                        Container(
                          width: 2,
                          height: 35,
                          color: const Color(0xffe2e8f0),
                        ),
                    ],
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                step['title'] ?? '',
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.onSurface,
                                ),
                              ),
                              Text(
                                timeStr,
                                style: const TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xff94a3b8),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            step['desc'] ?? '',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: Color(0xff64748b),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            }),
        ],
      ),
    );
  }

  Widget _buildBottomStickyArea(JobModel job) {
    if (job.status == JobStatus.completed) {
      return Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(color: Color(0x14000000), blurRadius: 20, offset: Offset(0, -4)),
          ],
        ),
        padding: const EdgeInsets.only(left: 16, right: 16, top: 12, bottom: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Nút xem hóa đơn
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: () =>
                    Navigator.pushNamed(context, '/invoice', arguments: job.id),
                icon: const Icon(Icons.receipt_long_outlined),
                label: const Text('XEM HÓA ĐƠN KHÁCH HÀNG'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16)),
                ),
              ),
            ),
            const SizedBox(height: 8),
            // Badge đã hoàn tất
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.verified, color: Color(0xff10b981), size: 16),
                const SizedBox(width: 6),
                Text(
                  'Đã hoàn tất lắp đặt',
                  style: TextStyle(
                    color: Colors.grey.shade500,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    }

    String actionText = '';
    Color buttonColor = AppColors.primary;
    if (job.status == JobStatus.waiting) {
      actionText = 'BẮT ĐẦU DI CHUYỂN';
      buttonColor = const Color(0xff0284c7);
    } else if (job.status == JobStatus.onTheWay) {
      actionText = 'XÁC NHẬN ĐÃ ĐẾN NƠI';
      buttonColor = const Color(0xff0d9488);
    } else if (job.status == JobStatus.arrived) {
      actionText = 'BẮT ĐẦU LẮP ĐẶT';
      buttonColor = const Color(0xffea580c);
    } else if (job.status == JobStatus.installing) {
      actionText = 'HOÀN THÀNH CÔNG VIỆC';
      buttonColor = const Color(0xff10b981);
    } else if (job.status == JobStatus.needSupport) {
      actionText = 'TIẾP TỤC TRIỂN KHAI';
      buttonColor = AppColors.primary;
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(20),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      padding: const EdgeInsets.only(left: 16, right: 16, top: 14, bottom: 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // ── Hàng chính: báo lỗi (trái nhỏ) + nút hành động (phải lớn) ──
          Row(
            children: [
              // Nút báo lỗi (chỉ hiện khi onTheWay, arrived, installing)
              if (job.status == JobStatus.onTheWay ||
                  job.status == JobStatus.arrived ||
                  job.status == JobStatus.installing) ...[
                SizedBox(
                  width: 52,
                  height: 56,
                  child: OutlinedButton(
                    onPressed: () => Navigator.pushNamed(
                        context, '/report-issue', arguments: job.id),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.redAccent, width: 2),
                      foregroundColor: Colors.redAccent,
                      padding: EdgeInsets.zero,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16)),
                    ),
                    child: const Icon(Icons.error_outline, size: 22),
                  ),
                ),
                const SizedBox(width: 10),
              ],
              // Nút hành động chính
              Expanded(
                child: SizedBox(
                  height: 56,
                  child: ElevatedButton(
                    onPressed: () => _handlePrimaryAction(job),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: buttonColor,
                      shadowColor: buttonColor.withAlpha(75),
                      elevation: 8,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16)),
                    ),
                    child: Text(actionText,
                        style: const TextStyle(
                            fontWeight: FontWeight.w800, fontSize: 15)),
                  ),
                ),
              ),
            ],
          ),
          // ── Hàng phụ: Vật tư / Hóa đơn (chỉ khi đang lắp đặt) ──
          if (job.status == JobStatus.installing) ...[
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => Navigator.pushNamed(
                        context, '/parts-request', arguments: job.id),
                    icon: const Icon(Icons.build_outlined, size: 17),
                    label: const Text('Thêm vật tư'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xffea580c),
                      side: const BorderSide(color: Color(0xffea580c)),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      textStyle: const TextStyle(
                          fontWeight: FontWeight.w700, fontSize: 13),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => Navigator.pushNamed(
                        context, '/invoice', arguments: job.id),
                    icon: const Icon(Icons.receipt_long_outlined, size: 17),
                    label: const Text('Xem hóa đơn'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      side: const BorderSide(color: AppColors.primary),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      textStyle: const TextStyle(
                          fontWeight: FontWeight.w700, fontSize: 13),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

