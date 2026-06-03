import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared/theme/app_colors.dart';
import '../../../controllers/job_controller.dart';

class ReportIssueScreen extends StatefulWidget {
  final String jobId;
  const ReportIssueScreen({super.key, required this.jobId});

  @override
  State<ReportIssueScreen> createState() => _ReportIssueScreenState();
}

class _ReportIssueScreenState extends State<ReportIssueScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _descriptionController;

  String? _selectedReason;
  final List<String> _issuePhotos = [];
  bool _isSubmitting = false;
  bool _showSuccessState = false;

  final List<String> _reasons = [
    'Khách hàng yêu cầu dời lịch hẹn',
    'Không liên lạc được với khách hàng',
    'Sản phẩm bị trầy xước/hỏng hóc do vận chuyển',
    'Thiếu linh kiện/phụ kiện lắp đặt kèm theo',
    'Áp lực nước yếu, cần lắp thêm bơm tăng áp',
    'Lý do kỹ thuật phát sinh khác',
  ];

  @override
  void initState() {
    super.initState();
    _descriptionController = TextEditingController();
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  void _simulateTakePhoto() {
    if (_issuePhotos.length >= 3) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Tối đa 3 ảnh minh chứng sự cố!')),
      );
      return;
    }

    setState(() {
      final index = _issuePhotos.length + 1;
      _issuePhotos.add(
        'https://dummyimage.com/600x400/ef4444/fff.png&text=Anh+Su+Co+$index',
      );
    });
  }

  void _removePhoto(int index) {
    setState(() {
      _issuePhotos.removeAt(index);
    });
  }

  void _handleSubmit() async {
    if (_selectedReason == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn lý do sự cố!'), backgroundColor: AppColors.error),
      );
      return;
    }
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);
    
    final controller = context.read<JobController>();
    final success = await controller.reportIssue(
      jobId: widget.jobId,
      reason: _selectedReason!,
      description: _descriptionController.text,
    );

    if (mounted) {
      setState(() => _isSubmitting = false);
      if (success) {
        setState(() {
          _showSuccessState = true;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_showSuccessState) {
      return _buildSuccessWidget();
    }

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text('BÁO CÁO SỰ CỐ'),
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.only(left: 16, right: 16, top: 16, bottom: 120),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Dropdown Chọn lý do sự cố
                  _buildReasonSelectorCard(),
                  const SizedBox(height: 20),

                  // 2. Chi tiết sự cố textarea
                  _buildDetailsCard(),
                  const SizedBox(height: 20),

                  // 3. Đính kèm ảnh chụp
                  _buildPhotosCard(),
                ],
              ),
            ),
          ),

          // Sticky bottom submit button
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              color: Colors.white,
              padding: const EdgeInsets.all(16),
              child: SizedBox(
                width: double.infinity,
                height: 60,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _handleSubmit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.error,
                    shadowColor: AppColors.error.withOpacity(0.3),
                    elevation: 8,
                  ),
                  child: _isSubmitting
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('NỘP BÁO CÁO SỰ CỐ'),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReasonSelectorCard() {
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
            'LÝ DO XẢY RA SỰ CỐ',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xff94a3b8), letterSpacing: 1.0),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            value: _selectedReason,
            hint: const Text(
              'Chọn lý do phù hợp nhất',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xff94a3b8)),
            ),
            isExpanded: true,
            style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.onSurface, fontSize: 13),
            decoration: const InputDecoration(
              contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 18),
              prefixIcon: Icon(Icons.warning_amber_rounded, color: AppColors.error),
            ),
            items: _reasons.map((String reason) {
              return DropdownMenuItem<String>(
                value: reason,
                child: Text(reason),
              );
            }).toList(),
            onChanged: (value) {
              setState(() {
                _selectedReason = value;
              });
            },
          ),
        ],
      ),
    );
  }

  Widget _buildDetailsCard() {
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
            'MÔ TẢ CHI TIẾT SỰ CỐ',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xff94a3b8), letterSpacing: 1.0),
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _descriptionController,
            maxLines: 4,
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, height: 1.4),
            decoration: const InputDecoration(
              hintText: 'Cung cấp thêm chi tiết thực địa để điều phối viên có thể hỗ trợ nhanh nhất...',
            ),
            validator: (value) {
              if (value == null || value.isEmpty) return 'Vui lòng cung cấp mô tả sự cố';
              if (value.length < 10) return 'Mô tả quá ngắn, tối thiểu 10 ký tự';
              return null;
            },
          ),
        ],
      ),
    );
  }

  Widget _buildPhotosCard() {
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
            'HÌNH ẢNH MINH CHỨNG (TỐI ĐA 3 ẢNH)',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xff94a3b8), letterSpacing: 1.0),
          ),
          const SizedBox(height: 16),
          
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1,
            ),
            itemCount: _issuePhotos.length < 3 ? _issuePhotos.length + 1 : 3,
            itemBuilder: (context, index) {
              if (index == _issuePhotos.length && _issuePhotos.length < 3) {
                return InkWell(
                  onTap: _simulateTakePhoto,
                  child: Container(
                    decoration: BoxDecoration(
                      color: const Color(0xfff8fafc),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xfff1f5f9), width: 1.5),
                    ),
                    child: const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.add_a_photo, color: AppColors.error, size: 28),
                          SizedBox(height: 6),
                          Text(
                            'Chụp ảnh',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: AppColors.error),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }

              return Stack(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      image: DecorationImage(
                        image: NetworkImage(_issuePhotos[index]),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  Positioned(
                    right: 4,
                    top: 4,
                    child: GestureDetector(
                      onTap: () => _removePhoto(index),
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: AppColors.error,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.close, color: Colors.white, size: 14),
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSuccessWidget() {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(28),
                decoration: const BoxDecoration(
                  color: Color(0xfffef2f2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.report_problem,
                  color: AppColors.error,
                  size: 64,
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'Báo Cáo Sự Cố Thành Công',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: AppColors.onSurface,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Báo cáo của bạn đã được gửi tới hệ thống. Điều phối viên sẽ liên lạc lại để xử lý hoặc sắp xếp lại lịch hẹn mới.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Color(0xff64748b),
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).popUntil((route) => route.isFirst);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.onSurface,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text(
                    'QUAY VỀ TRANG CHỦ',
                    style: TextStyle(color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
