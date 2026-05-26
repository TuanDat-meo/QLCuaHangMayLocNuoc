import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared/theme/app_colors.dart';
import '../../../controllers/job_controller.dart';

class CompleteInstallationScreen extends StatefulWidget {
  final String jobId;
  const CompleteInstallationScreen({super.key, required this.jobId});

  @override
  State<CompleteInstallationScreen> createState() => _CompleteInstallationScreenState();
}

class _CompleteInstallationScreenState extends State<CompleteInstallationScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _collectedAmountController;
  late final TextEditingController _tipController;
  late final TextEditingController _notesController;

  final List<String> _uploadedPhotos = [];
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _notesController = TextEditingController();
    _tipController = TextEditingController(text: '0');
    
    // Tìm đơn hàng để lấy số tiền COD ban đầu
    final jobController = context.read<JobController>();
    final job = jobController.jobs.firstWhere((j) => j.id == widget.jobId);
    _collectedAmountController = TextEditingController(text: job.codAmount.toInt().toString());
  }

  @override
  void dispose() {
    _collectedAmountController.dispose();
    _tipController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _requestCameraPermission() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: const Row(
            children: [
              Icon(Icons.camera_alt, color: AppColors.primary),
              SizedBox(width: 10),
              Text(
                'Quyền truy cập Camera',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ],
          ),
          content: const Text(
            'AquaCare cần quyền truy cập máy ảnh để chụp ảnh biên bản nghiệm thu và mác máy lắp đặt thực tế.',
            style: TextStyle(height: 1.4),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('TỪ CHỐI', style: TextStyle(color: Color(0xff94a3b8), fontWeight: FontWeight.bold)),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _simulateTakePhoto();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('MỞ CAMERA'),
            ),
          ],
        );
      },
    );
  }

  void _simulateTakePhoto() {
    if (_uploadedPhotos.length >= 5) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Chỉ được tải lên tối đa 5 hình ảnh!')),
      );
      return;
    }

    setState(() {
      final index = _uploadedPhotos.length + 1;
      _uploadedPhotos.add(
        'https://dummyimage.com/600x400/00459a/fff.png&text=Anh+Nghiem+Thu+$index',
      );
    });
  }

  void _removePhoto(int index) {
    setState(() {
      _uploadedPhotos.removeAt(index);
    });
  }

  void _handleSubmit() {
    if (!_formKey.currentState!.validate()) return;
    if (_uploadedPhotos.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng chụp ít nhất 1 ảnh nghiệm thu thực tế!'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: const Text('Xác nhận hoàn thành?', style: TextStyle(fontWeight: FontWeight.w900)),
          content: const Text(
            'Bạn có chắc chắn muốn nộp báo cáo hoàn thành lắp đặt này không? Dữ liệu sẽ được gửi về tổng đài.',
            style: TextStyle(fontWeight: FontWeight.w600, color: Color(0xff64748b), height: 1.4),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('KIỂM TRA LẠI', style: TextStyle(color: Color(0xff94a3b8), fontWeight: FontWeight.bold)),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(context);
                setState(() => _isSubmitting = true);
                
                final controller = context.read<JobController>();
                final cod = double.tryParse(_collectedAmountController.text) ?? 0.0;
                final tip = double.tryParse(_tipController.text) ?? 0.0;
                
                final success = await controller.completeJob(
                  jobId: widget.jobId,
                  codCollected: cod,
                  tipAmount: tip,
                  photos: _uploadedPhotos,
                  notes: _notesController.text,
                );

                if (mounted) {
                  setState(() => _isSubmitting = false);
                  if (success) {
                    // Hiển thị màn hình thông báo thành công hoặc quay về dashboard
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Nộp báo cáo hoàn thành lắp đặt thành công!'),
                        backgroundColor: Color(0xff10b981),
                      ),
                    );
                    Navigator.of(context).popUntil((route) => route.isFirst);
                  }
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xff10b981),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('HOÀN TẤT VÀ GỬI'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final jobController = context.watch<JobController>();
    final job = jobController.jobs.firstWhere((j) => j.id == widget.jobId);

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text('BÁO CÁO NGHIỆM THU'),
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
                  // 1. Upload ảnh nghiệm thu
                  _buildUploadPhotoSection(),
                  const SizedBox(height: 20),

                  // 2. COD & Tip Details Card
                  _buildPaymentFieldsCard(job),
                  const SizedBox(height: 20),

                  // 3. Notes textarea
                  _buildNotesTextarea(),
                ],
              ),
            ),
          ),

          // Nút gửi báo cáo (Sticky bottom)
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
                    backgroundColor: const Color(0xff10b981),
                    shadowColor: const Color(0xff10b981).withOpacity(0.3),
                    elevation: 8,
                  ),
                  child: _isSubmitting
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('HOÀN THÀNH LẮP ĐẶT'),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUploadPhotoSection() {
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
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'ẢNH CHỤP NGHIỆM THU',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xff94a3b8), letterSpacing: 1.0),
              ),
              Text(
                'Tối đa 5 ảnh (Bắt buộc)',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.error),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          // Image upload grid
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1,
            ),
            itemCount: _uploadedPhotos.length < 5 ? _uploadedPhotos.length + 1 : 5,
            itemBuilder: (context, index) {
              if (index == _uploadedPhotos.length && _uploadedPhotos.length < 5) {
                return InkWell(
                  onTap: _requestCameraPermission,
                  child: Container(
                    decoration: BoxDecoration(
                      color: const Color(0xfff8fafc),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xffcbd5e1), width: 1.5, style: BorderStyle.none), // custom dashed borders can be simulated
                    ),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.add_a_photo_outlined, color: AppColors.primary.withOpacity(0.8), size: 28),
                          const SizedBox(height: 6),
                          const Text(
                            'Chụp ảnh',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: AppColors.primary),
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
                        image: NetworkImage(_uploadedPhotos[index]),
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
                          color: Colors.redAccent,
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

  Widget _buildPaymentFieldsCard(JobModel job) {
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
            'THÔNG TIN THANH TOÁN',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xff94a3b8), letterSpacing: 1.0),
          ),
          const SizedBox(height: 16),
          
          // COD hiển thị số tiền yêu cầu
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Số tiền COD phải thu:',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xff64748b)),
              ),
              Text(
                job.codAmount == 0 ? 'Đã thanh toán trước' : '${job.codAmount.toInt()}đ',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                  color: job.codAmount == 0 ? const Color(0xff10b981) : const Color(0xffea580c),
                ),
              ),
            ],
          ),
          const Divider(height: 32, color: Color(0xfff1f5f9)),

          // Ô nhập số tiền thực thu COD
          const Text(
            'SỐ TIỀN THỰC THU COD (VND)',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xff64748b), letterSpacing: 0.5),
          ),
          const SizedBox(height: 6),
          TextFormField(
            controller: _collectedAmountController,
            keyboardType: TextInputType.number,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            decoration: const InputDecoration(
              hintText: 'Nhập số tiền COD thực tế đã thu',
              prefixIcon: Icon(Icons.payments_outlined),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) return 'Vui lòng điền số tiền thực tế';
              if (double.tryParse(value) == null) return 'Số tiền không hợp lệ';
              return null;
            },
          ),
          const SizedBox(height: 20),

          // Ô nhập tiền tip
          const Text(
            'TIỀN TIP NHẬN THÊM (VND) - NẾU CÓ',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xff64748b), letterSpacing: 0.5),
          ),
          const SizedBox(height: 6),
          TextFormField(
            controller: _tipController,
            keyboardType: TextInputType.number,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xff10b981)),
            decoration: const InputDecoration(
              hintText: 'Nhập số tiền tip nhận thêm từ khách hàng',
              prefixIcon: Icon(Icons.favorite_outline, color: Color(0xff10b981)),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) return 'Điền 0 nếu không có';
              if (double.tryParse(value) == null) return 'Số tiền không hợp lệ';
              return null;
            },
          ),
        ],
      ),
    );
  }

  Widget _buildNotesTextarea() {
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
            'BÁO CÁO KỸ THUẬT LẮP ĐẶT',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xff94a3b8), letterSpacing: 1.0),
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _notesController,
            maxLines: 4,
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, height: 1.4),
            decoration: const InputDecoration(
              hintText: 'Ghi chú kỹ thuật (VD: Chỉ số TDS nước cấp: 150ppm, sau lọc: 12ppm. Áp lực nước cấp bình thường. Không rò rỉ...)',
            ),
          ),
        ],
      ),
    );
  }
}
