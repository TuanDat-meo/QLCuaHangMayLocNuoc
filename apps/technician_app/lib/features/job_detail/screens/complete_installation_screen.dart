import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:convert';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:shared/theme/app_colors.dart';
import '../../../controllers/job_controller.dart';
import '../../../core/services/image_upload_service.dart';
import '../../../core/utils/invoice_pdf_helper.dart';
import '../../../core/widgets/signature_pad.dart';

/// Formatter tự động thêm dấu chấm ngàn khi người dùng gõ số
class _ThousandsSeparatorFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
      TextEditingValue oldValue, TextEditingValue newValue) {
    final digits = newValue.text.replaceAll('.', '');
    if (digits.isEmpty) return newValue.copyWith(text: '');
    final n = int.tryParse(digits);
    if (n == null) return oldValue;
    final formatted = NumberFormat('#,###', 'vi_VN')
        .format(n)
        .replaceAll(',', '.');
    return newValue.copyWith(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}

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
  Uint8List? _customerSignatureBytes;
  final _currFmt = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ', decimalDigits: 0);

  final List<XFile> _pickedFiles = [];   // ảnh đã chọn, chưa upload
  final List<String> _uploadedUrls = [];  // URL sau khi upload Storage
  bool _isSubmitting = false;
  bool _isUploading = false;

  @override
  void initState() {
    super.initState();
    _notesController = TextEditingController();
    _tipController = TextEditingController(text: '0');
    
    // Tìm đơn hàng để lấy số tiền
    final jobController = context.read<JobController>();
    final job = jobController.jobs.firstWhere((j) => j.id == widget.jobId);
    // Tổng cộng = COD + vật tư phát sinh
    final tongVatTu = job.vatTuPhatSinh.fold<double>(
        0, (s, item) => s + ((item['thanhTien'] as num?)?.toDouble() ?? 0));
    final tongCong = job.codAmount + tongVatTu;
    final initAmount = NumberFormat('#,###', 'vi_VN')
        .format(tongCong.toInt())
        .replaceAll(',', '.');
    _collectedAmountController = TextEditingController(text: initAmount);
  }

  @override
  void dispose() {
    _collectedAmountController.dispose();
    _tipController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  // Hiển thị bottom sheet chọn nguồn ảnh
  void _showPickerOptions() {
    final total = _pickedFiles.length + _uploadedUrls.length;
    if (total >= 5) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Tối đa 5 ảnh!')),
      );
      return;
    }
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 8),
            Container(width: 40, height: 4,
              decoration: BoxDecoration(color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 16),
            if (!kIsWeb)
              ListTile(
                leading: const Icon(Icons.camera_alt, color: AppColors.primary),
                title: const Text('Chụp ảnh bằng camera',
                    style: TextStyle(fontWeight: FontWeight.w700)),
                onTap: () {
                  Navigator.pop(context);
                  _pickImage(ImageSource.camera);
                },
              ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined,
                  color: AppColors.primary),
              title: const Text('Chọn từ thư viện',
                  style: TextStyle(fontWeight: FontWeight.w700)),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.gallery);
              },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Future<void> _pickImage(ImageSource source) async {
    final files = await ImageUploadService.pickImages(
      source: source,
      maxImages: 5 - _pickedFiles.length - _uploadedUrls.length,
    );
    if (files.isNotEmpty) setState(() => _pickedFiles.addAll(files));
  }

  void _removePickedFile(int index) =>
      setState(() => _pickedFiles.removeAt(index));

  void _removeUploadedUrl(int index) =>
      setState(() => _uploadedUrls.removeAt(index));

  void _handleSubmit() {
    if (!_formKey.currentState!.validate()) return;
    if (_pickedFiles.isEmpty && _uploadedUrls.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng chụp ít nhất 1 ảnh nghiệm thu!'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }
    if (_customerSignatureBytes == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng yêu cầu khách hàng ký xác nhận nghiệm thu!'),
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
                setState(() { _isSubmitting = true; _isUploading = _pickedFiles.isNotEmpty; });

                // Upload ảnh mới lên Firebase Storage
                List<String> newUrls = [];
                if (_pickedFiles.isNotEmpty) {
                  newUrls = await ImageUploadService.uploadImages(
                    files: _pickedFiles,
                    jobId: widget.jobId,
                    folder: 'after',
                  );
                }
                if (mounted) setState(() => _isUploading = false);

                final allPhotos = [..._uploadedUrls, ...newUrls];
                final controller = context.read<JobController>();
                final cod = double.tryParse(
                    _collectedAmountController.text.replaceAll('.', '')) ?? 0.0;
                final tip = double.tryParse(
                    _tipController.text.replaceAll('.', '')) ?? 0.0;
                final base64Signature = _customerSignatureBytes != null
                    ? base64Encode(_customerSignatureBytes!)
                    : null;

                final success = await controller.completeJob(
                  jobId: widget.jobId,
                  codCollected: cod,
                  tipAmount: tip,
                  photos: allPhotos,
                  notes: _notesController.text,
                  customerSignature: base64Signature,
                );
                if (mounted) {
                  setState(() => _isSubmitting = false);
                  if (success) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Nộp báo cáo hoàn thành lắp đặt thành công!'),
                        backgroundColor: Color(0xff10b981),
                      ),
                    );
                    showDialog(
                      context: context,
                      barrierDismissible: false,
                      builder: (context) {
                        return AlertDialog(
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                          title: Row(
                            children: const [
                              Icon(Icons.check_circle, color: Color(0xff10b981), size: 30),
                              SizedBox(width: 10),
                              Text('Hoàn Thành!', style: TextStyle(fontWeight: FontWeight.w900)),
                            ],
                          ),
                          content: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Báo cáo nghiệm thu đã được gửi thành công về hệ thống AquaCare.',
                                style: TextStyle(fontWeight: FontWeight.w600, color: Color(0xff64748b), height: 1.4),
                              ),
                              const SizedBox(height: 16),
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: const Color(0xfff8fafc),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: const Color(0xffe2e8f0)),
                                ),
                                child: Column(
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        const Text('Mã đơn hàng:', style: TextStyle(color: Color(0xff64748b), fontWeight: FontWeight.bold, fontSize: 13)),
                                        Text(widget.jobId, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                      ],
                                    ),
                                    const SizedBox(height: 6),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        const Text('Tổng thanh toán:', style: TextStyle(color: Color(0xff64748b), fontWeight: FontWeight.bold, fontSize: 13)),
                                        Text(
                                          _currFmt.format(cod + tip),
                                          style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary, fontSize: 13),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          actionsAlignment: MainAxisAlignment.center,
                          actions: [
                            Padding(
                              padding: const EdgeInsets.only(bottom: 8.0, left: 8.0, right: 8.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  ElevatedButton.icon(
                                    onPressed: () async {
                                      // Hiện loading indicator trong lúc tải font và tạo PDF
                                      showDialog(
                                        context: context,
                                        barrierDismissible: false,
                                        builder: (ctx) => const Center(
                                          child: CircularProgressIndicator(color: AppColors.primary),
                                        ),
                                      );
                                      
                                      try {
                                        final jobModel = controller.jobs.firstWhere((j) => j.id == widget.jobId);
                                        await InvoicePdfHelper.generateAndShareInvoice(
                                          jobModel,
                                          collectedAmount: cod,
                                          tipAmount: tip,
                                        );
                                      } catch (e) {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          SnackBar(content: Text('Lỗi xuất hóa đơn: $e'), backgroundColor: Colors.red),
                                        );
                                      } finally {
                                        // Đóng loading indicator
                                        Navigator.pop(context);
                                      }
                                    },
                                    icon: const Icon(Icons.share, color: Colors.white),
                                    label: const Text('XUẤT HÓA ĐƠN & GỬI ZALO', style: TextStyle(fontWeight: FontWeight.bold)),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xff0068ff), // Zalo blue color
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(vertical: 14),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                      elevation: 0,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  OutlinedButton.icon(
                                    onPressed: () {
                                      Navigator.of(context).popUntil((route) => route.isFirst);
                                    },
                                    icon: const Icon(Icons.home, color: Color(0xff64748b)),
                                    label: const Text('QUAY VỀ TRANG CHỦ', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xff64748b))),
                                    style: OutlinedButton.styleFrom(
                                      padding: const EdgeInsets.symmetric(vertical: 14),
                                      side: const BorderSide(color: Color(0xffcbd5e1)),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                      elevation: 0,
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
                  const SizedBox(height: 20),

                  // 4. Customer Signature
                  _buildSignatureSection(),
                ],
              ),
            ),
          ),

          // Bottom buttons: xem hóa đơn + hoàn thành
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 16, offset: const Offset(0, -4)),
                ],
              ),
              padding: const EdgeInsets.only(left: 16, right: 16, top: 12, bottom: 24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Nút xem hóa đơn
                  SizedBox(
                    width: double.infinity,
                    height: 46,
                    child: OutlinedButton.icon(
                      onPressed: () => Navigator.pushNamed(
                        context, '/invoice', arguments: widget.jobId),
                      icon: const Icon(Icons.receipt_long_outlined, size: 18),
                      label: const Text('XEM HÓA ĐƠN KHÁCH HÀNG'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.primary,
                        side: const BorderSide(color: AppColors.primary),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14)),
                        textStyle: const TextStyle(
                            fontWeight: FontWeight.w800, fontSize: 13),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Nút hoàn thành
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: _isSubmitting ? null : _handleSubmit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xff10b981),
                        shadowColor: const Color(0xff10b981).withValues(alpha: 0.3),
                        elevation: 8,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16)),
                      ),
                      child: _isSubmitting
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text('HOÀN THÀNH LẮP ĐẶT',
                              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                    ),
                  ),
                ],
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
          
          // Upload progress
          if (_isUploading)
            const Padding(
              padding: EdgeInsets.only(bottom: 12),
              child: LinearProgressIndicator(color: AppColors.primary),
            ),

          // Grid ảnh: uploaded URLs + local picked files + nút thêm
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1,
            ),
            itemCount: () {
              final total = _uploadedUrls.length + _pickedFiles.length;
              return total < 5 ? total + 1 : 5;
            }(),
            itemBuilder: (context, index) {
              final totalPhotos = _uploadedUrls.length + _pickedFiles.length;

              // Nút thêm ảnh
              if (index == totalPhotos && totalPhotos < 5) {
                return InkWell(
                  onTap: _showPickerOptions,
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    decoration: BoxDecoration(
                      color: const Color(0xfff8fafc),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.primary.withValues(alpha: 0.4), width: 1.5),
                    ),
                    child: const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.add_a_photo_outlined, color: AppColors.primary, size: 28),
                          SizedBox(height: 6),
                          Text('Chụp ảnh',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: AppColors.primary)),
                        ],
                      ),
                    ),
                  ),
                );
              }

              // Ảnh đã upload lên Storage (URL)
              if (index < _uploadedUrls.length) {
                return _buildPhotoTile(
                  child: Image.network(_uploadedUrls[index], fit: BoxFit.cover),
                  onRemove: () => _removeUploadedUrl(index),
                  uploaded: true,
                );
              }

              // Ảnh local chưa upload
              final fileIndex = index - _uploadedUrls.length;
              final file = _pickedFiles[fileIndex];
              return _buildPhotoTile(
                child: FutureBuilder<Uint8List>(
                  future: file.readAsBytes(),
                  builder: (_, snap) {
                    if (snap.connectionState == ConnectionState.waiting) {
                      return const Center(child: CircularProgressIndicator());
                    }
                    if (snap.hasData && snap.data != null) {
                      return Image.memory(snap.data!, fit: BoxFit.cover);
                    }
                    return const Center(child: Icon(Icons.broken_image, color: Colors.grey));
                  },
                ),
                onRemove: () => _removePickedFile(fileIndex),
                uploaded: false,
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentFieldsCard(JobModel job) {
    final tongVatTu = job.vatTuPhatSinh.fold<double>(
      0, (s, item) => s + ((item['thanhTien'] as num?)?.toDouble() ?? 0));
    final tongCong = job.codAmount + tongVatTu;

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

          // COD gốc
          _payRow(
            label: 'Phí dịch vụ (COD):',
            value: job.codAmount == 0
                ? 'Đã thanh toán trước'
                : _currFmt.format(job.codAmount),
            valueColor: job.codAmount == 0
                ? const Color(0xff10b981)
                : const Color(0xffea580c),
          ),

          // Vật tư phát sinh (nếu có)
          if (tongVatTu > 0) ...[
            const SizedBox(height: 8),
            _payRow(
              label: 'Vật tư phát sinh (${job.vatTuPhatSinh.length} mục):',
              value: _currFmt.format(tongVatTu),
              valueColor: const Color(0xff7c3aed),
            ),
          ],

          // Tổng cộng
          const Divider(height: 20, color: Color(0xffe2e8f0)),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'TỔNG CỘNG PHẢI THU:',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w900,
                  color: AppColors.onSurface,
                ),
              ),
              Text(
                _currFmt.format(tongCong),
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: Color(0xff0052cc),
                ),
              ),
            ],
          ),

          const Divider(height: 28, color: Color(0xfff1f5f9)),

          // Ô nhập số tiền thực thu COD
          const Text(
            'TỔNG TIỀN THỰC THU (VND)',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xff64748b), letterSpacing: 0.5),
          ),
          const SizedBox(height: 6),
          TextFormField(
            controller: _collectedAmountController,
            keyboardType: TextInputType.number,
            inputFormatters: [_ThousandsSeparatorFormatter()],
            onTap: () => _collectedAmountController.selection = TextSelection(
              baseOffset: 0,
              extentOffset: _collectedAmountController.text.length,
            ),
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            decoration: const InputDecoration(
              hintText: 'Nhập số tiền thực tế đã thu',
              prefixIcon: Icon(Icons.payments_outlined),
              suffixText: 'đ',
              suffixStyle: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xff64748b)),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) return 'Vui lòng điền số tiền thực tế';
              if (double.tryParse(value.replaceAll('.', '')) == null) return 'Số tiền không hợp lệ';
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
            inputFormatters: [_ThousandsSeparatorFormatter()],
            onTap: () => _tipController.selection = TextSelection(
              baseOffset: 0,
              extentOffset: _tipController.text.length,
            ),
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xff10b981)),
            decoration: const InputDecoration(
              hintText: 'Nhập số tiền tip nhận thêm từ khách hàng',
              prefixIcon: Icon(Icons.favorite_outline, color: Color(0xff10b981)),
              suffixText: 'đ',
              suffixStyle: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xff10b981)),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) return 'Điền 0 nếu không có';
              if (double.tryParse(value.replaceAll('.', '')) == null) return 'Số tiền không hợp lệ';
              return null;
            },
          ),
        ],
      ),
    );
  }

  Widget _payRow({required String label, required String value, required Color valueColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Flexible(
          child: Text(label,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xff64748b))),
        ),
        const SizedBox(width: 8),
        Text(value,
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: valueColor)),
      ],
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
            enableSuggestions: false,
            autocorrect: false,
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

  Widget _buildPhotoTile({
    required Widget child,
    required VoidCallback onRemove,
    required bool uploaded,
  }) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: Stack(
        fit: StackFit.expand,
        children: [
          child,
          if (!uploaded)
            Positioned(
              bottom: 0, left: 0, right: 0,
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 2),
                color: Colors.orange.withValues(alpha: 0.85),
                child: const Text('Chưa lưu',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white, fontSize: 9,
                    fontWeight: FontWeight.w800)),
              ),
            ),
          Positioned(
            right: 4, top: 4,
            child: GestureDetector(
              onTap: onRemove,
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: const BoxDecoration(
                  color: Colors.redAccent, shape: BoxShape.circle),
                child: const Icon(Icons.close, color: Colors.white, size: 14),
              ),
            ),
          ),
        ],
      ),
    );
  }



  Widget _buildSignatureSection() {
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              Text(
                'XÁC NHẬN CHỮ KÝ KHÁCH HÀNG',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xff94a3b8), letterSpacing: 1.0),
              ),
              Text(
                'Bắt buộc',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.error),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (_customerSignatureBytes == null)
            InkWell(
              onTap: () {
                showDialog(
                  context: context,
                  builder: (context) => SignaturePad(
                    onConfirm: (bytes) {
                      setState(() {
                        _customerSignatureBytes = bytes;
                      });
                    },
                  ),
                );
              },
              borderRadius: BorderRadius.circular(16),
              child: Container(
                height: 100,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: const Color(0xfff8fafc),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.primary.withValues(alpha: 0.3), width: 1.5),
                ),
                child: const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.draw_rounded, color: AppColors.primary, size: 30),
                      SizedBox(height: 8),
                      Text(
                        'Chạm để ký xác nhận nghiệm thu',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primary),
                      ),
                    ],
                  ),
                ),
              ),
            )
          else
            Column(
              children: [
                Container(
                  height: 120,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: const Color(0xfff8fafc),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xffe2e8f0)),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Center(
                      child: Image.memory(
                        _customerSignatureBytes!,
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                TextButton.icon(
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (context) => SignaturePad(
                        onConfirm: (bytes) {
                          setState(() {
                            _customerSignatureBytes = bytes;
                          });
                        },
                      ),
                    );
                  },
                  icon: const Icon(Icons.refresh, size: 16, color: AppColors.primary),
                  label: const Text(
                    'Ký lại',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.primary),
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }
}
