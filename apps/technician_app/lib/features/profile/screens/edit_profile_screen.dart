import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared/theme/app_colors.dart';
import '../../../controllers/auth_controller.dart';
import '../../../controllers/profile_controller.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _addressController;
  bool _hasChanges = false;

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthController>().currentUser;
    _nameController = TextEditingController(text: user?.displayName ?? '');
    _phoneController = TextEditingController(text: user?.phoneNumber ?? '');
    _addressController = TextEditingController(text: user?.address ?? '');

    _nameController.addListener(_markChanged);
    _phoneController.addListener(_markChanged);
    _addressController.addListener(_markChanged);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  void _markChanged() {
    if (!_hasChanges) setState(() => _hasChanges = true);
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    FocusScope.of(context).unfocus();

    final authController = context.read<AuthController>();
    final profileController = context.read<ProfileController>();
    final uid = authController.currentUser?.uid;
    if (uid == null) return;

    final success = await profileController.updatePersonalInfo(
      uid: uid,
      displayName: _nameController.text.trim(),
      phoneNumber: _phoneController.text.trim(),
      address: _addressController.text.trim(),
      onSuccess: (updatedUser) {
        authController.updateCurrentUser(updatedUser);
      },
    );

    if (!mounted) return;
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.check_circle, color: Colors.white),
              SizedBox(width: 10),
              Text('Cập nhật thành công!', style: TextStyle(fontWeight: FontWeight.bold)),
            ],
          ),
          backgroundColor: const Color(0xff10b981),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
      Navigator.pop(context);
    } else {
      final errorMsg = profileController.error ?? 'Lỗi không xác định';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(errorMsg, style: const TextStyle(fontWeight: FontWeight.bold)),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<ProfileController>().isInfoLoading;

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: const Text('CHỈNH SỬA THÔNG TIN'),
        backgroundColor: Colors.white,
        actions: [
          if (_hasChanges && !isLoading)
            TextButton(
              onPressed: _save,
              child: const Text(
                'LƯU',
                style: TextStyle(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w900,
                  fontSize: 14,
                ),
              ),
            ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            _buildSectionLabel('THÔNG TIN CÁ NHÂN'),
            const SizedBox(height: 12),

            // Họ và tên
            _buildFormField(
              controller: _nameController,
              label: 'Họ và tên',
              icon: Icons.person_outline,
              hint: 'Nhập họ và tên đầy đủ',
              validator: (v) {
                if (v == null || v.trim().isEmpty) return 'Vui lòng nhập họ và tên';
                if (v.trim().length < 2) return 'Tên phải có ít nhất 2 ký tự';
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Số điện thoại
            _buildFormField(
              controller: _phoneController,
              label: 'Số điện thoại',
              icon: Icons.phone_outlined,
              hint: 'Ví dụ: 0901234567',
              keyboardType: TextInputType.phone,
              validator: (v) {
                if (v == null || v.trim().isEmpty) return 'Vui lòng nhập số điện thoại';
                final phoneRegex = RegExp(r'^(0|\+84)[3|5|7|8|9][0-9]{8}$');
                if (!phoneRegex.hasMatch(v.trim())) return 'Số điện thoại không hợp lệ';
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Địa chỉ
            _buildFormField(
              controller: _addressController,
              label: 'Địa chỉ',
              icon: Icons.location_on_outlined,
              hint: 'Địa chỉ thường trú hoặc làm việc',
              maxLines: 2,
            ),
            const SizedBox(height: 32),

            // Thông tin không chỉnh sửa được
            _buildSectionLabel('THÔNG TIN TÀI KHOẢN'),
            const SizedBox(height: 12),
            _buildReadOnlyField(
              label: 'Email đăng nhập',
              value: context.watch<AuthController>().currentUser?.email ?? '—',
              icon: Icons.email_outlined,
              note: 'Không thể thay đổi email đăng nhập',
            ),
            const SizedBox(height: 40),

            // Nút lưu chính
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: (isLoading || !_hasChanges) ? null : _save,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  disabledBackgroundColor: const Color(0xffe2e8f0),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                ),
                child: isLoading
                    ? const SizedBox(
                        height: 22,
                        width: 22,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                      )
                    : const Text(
                        'LƯU THAY ĐỔI',
                        style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.0),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionLabel(String label) {
    return Text(
      label,
      style: const TextStyle(
        fontSize: 10,
        fontWeight: FontWeight.w900,
        color: Color(0xff94a3b8),
        letterSpacing: 1.2,
      ),
    );
  }

  Widget _buildFormField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    String? hint,
    TextInputType? keyboardType,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xfff1f5f9), width: 2),
      ),
      child: TextFormField(
        controller: controller,
        keyboardType: keyboardType,
        maxLines: maxLines,
        validator: validator,
        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          prefixIcon: Icon(icon, color: AppColors.primary, size: 20),
          border: InputBorder.none,
          enabledBorder: InputBorder.none,
          focusedBorder: InputBorder.none,
          errorBorder: InputBorder.none,
          focusedErrorBorder: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
        ),
      ),
    );
  }

  Widget _buildReadOnlyField({
    required String label,
    required String value,
    required IconData icon,
    String? note,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xfff8fafc),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xfff1f5f9), width: 2),
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xffcbd5e1), size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xff94a3b8))),
                const SizedBox(height: 2),
                Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xff94a3b8))),
                if (note != null) ...[
                  const SizedBox(height: 4),
                  Text(note, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Color(0xffcbd5e1))),
                ],
              ],
            ),
          ),
          const Icon(Icons.lock_outline, size: 14, color: Color(0xffcbd5e1)),
        ],
      ),
    );
  }
}
