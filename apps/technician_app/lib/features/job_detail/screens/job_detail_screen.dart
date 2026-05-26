import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
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
                final success = await controller.updateJobStatus(widget.jobId, nextStatus);
                if (mounted && success) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Đã cập nhật: ${nextStatus.displayName}'),
                      backgroundColor: nextStatus.color,
                    ),
                  );
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

  void _handlePrimaryAction(JobStatus currentStatus) {
    switch (currentStatus) {
      case JobStatus.waiting:
        _showStatusConfirmation(
          JobStatus.onTheWay,
          'Bắt đầu di chuyển?',
          'Xác nhận bạn bắt đầu di chuyển tới địa điểm lắp đặt của khách hàng.',
        );
        break;
      case JobStatus.onTheWay:
        _showStatusConfirmation(
          JobStatus.arrived,
          'Đã đến nơi?',
          'Xác nhận bạn đã có mặt tại địa điểm lắp đặt của khách hàng.',
        );
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
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
              InkWell(
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Đang kết nối cuộc gọi tới: ${job.customerPhone}'),
                      backgroundColor: AppColors.primary,
                    ),
                  );
                },
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withAlpha(25),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.call, color: AppColors.primary, size: 20),
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
        color: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        child: SizedBox(
          width: double.infinity,
          height: 60,
          child: ElevatedButton(
            onPressed: null,
            style: ElevatedButton.styleFrom(
              disabledBackgroundColor: const Color(0xffe2e8f0),
              disabledForegroundColor: const Color(0xff94a3b8),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.verified),
                SizedBox(width: 8),
                Text('ĐÃ HOÀN TẤT LẮP ĐẶT'),
              ],
            ),
          ),
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
      padding: const EdgeInsets.only(left: 16, right: 16, top: 16, bottom: 24),
      child: Row(
        children: [
          if (job.status == JobStatus.installing || job.status == JobStatus.onTheWay || job.status == JobStatus.arrived) ...[
            SizedBox(
              height: 60,
              width: 60,
              child: OutlinedButton(
                onPressed: () {
                  Navigator.pushNamed(context, '/report-issue', arguments: job.id);
                },
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.redAccent, width: 2),
                  foregroundColor: Colors.redAccent,
                  padding: EdgeInsets.zero,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                ),
                child: const Icon(Icons.error_outline, size: 24),
              ),
            ),
            const SizedBox(width: 12),
          ],
          Expanded(
            child: SizedBox(
              height: 60,
              child: ElevatedButton(
                onPressed: () => _handlePrimaryAction(job.status),
                style: ElevatedButton.styleFrom(
                  backgroundColor: buttonColor,
                  shadowColor: buttonColor.withAlpha(75),
                  elevation: 8,
                ),
                child: Text(actionText),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
