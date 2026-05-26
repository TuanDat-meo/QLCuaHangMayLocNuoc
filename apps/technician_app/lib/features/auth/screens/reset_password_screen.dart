import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared/theme/app_colors.dart';
import 'package:shared/theme/app_text_styles.dart';
import 'package:shared/utils/form_validator.dart';
import '../../../controllers/auth_controller.dart';

class ResetPasswordScreen extends StatefulWidget {
  final String code;
  const ResetPasswordScreen({super.key, required this.code});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _passwordController;
  late final TextEditingController _confirmPasswordController;

  bool _showPassword1 = false;
  bool _showPassword2 = false;
  bool _isSuccess = false;
  bool _isInvalidCode = false;

  @override
  void initState() {
    super.initState();
    _passwordController = TextEditingController();
    _confirmPasswordController = TextEditingController();
    if (widget.code.isEmpty) {
      _isInvalidCode = true;
    }
  }

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleResetPassword() async {
    if (!_formKey.currentState!.validate()) return;

    final authController = context.read<AuthController>();
    final success = await authController.resetPassword(
      widget.code,
      _passwordController.text,
    );

    if (mounted) {
      if (success) {
        setState(() => _isSuccess = true);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(authController.error ?? 'Đổi mật khẩu thất bại. Vui lòng thử lại.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        text.toUpperCase(),
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w900,
          color: Color(0xff64748b),
          letterSpacing: 1.0,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isSuccess) return _buildSuccessState();
    if (_isInvalidCode) return _buildInvalidCodeState();

    final authController = context.watch<AuthController>();
    final isLoading = authController.isLoading;

    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: AppColors.onSurface, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(40),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.08),
                      blurRadius: 30,
                      offset: const Offset(0, 10),
                    ),
                  ],
                  border: Border.all(color: const Color(0xfff1f5f9)),
                ),
                padding: const EdgeInsets.all(32),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Lock key icon
                      Center(
                        child: Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primary.withOpacity(0.2),
                                blurRadius: 15,
                                offset: const Offset(0, 5),
                              ),
                            ],
                          ),
                          child: const Icon(Icons.lock_reset_outlined, color: Colors.white, size: 32),
                        ),
                      ),
                      const SizedBox(height: 24),
                      const Center(
                        child: Text(
                          'Đặt lại mật khẩu',
                          style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: AppColors.onSurface, letterSpacing: -0.5),
                        ),
                      ),
                      const SizedBox(height: 6),
                      const Center(
                        child: Text(
                          'Nhập mật khẩu mới của bạn bên dưới.',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xff94a3b8)),
                        ),
                      ),
                      const SizedBox(height: 32),

                      // New Password Field
                      _buildLabel('Mật khẩu mới'),
                      TextFormField(
                        controller: _passwordController,
                        obscureText: !_showPassword1,
                        style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xff334155)),
                        decoration: InputDecoration(
                          hintText: 'Nhập mật khẩu mới',
                          prefixIcon: const Icon(Icons.lock_outline, size: 18),
                          suffixIcon: IconButton(
                            icon: Icon(_showPassword1 ? Icons.visibility_off_outlined : Icons.visibility_outlined, size: 18),
                            onPressed: () => setState(() => _showPassword1 = !_showPassword1),
                          ),
                        ),
                        validator: (value) => FormValidator.validatePassword(value),
                      ),
                      const SizedBox(height: 20),

                      // Confirm Password Field
                      _buildLabel('Xác nhận mật khẩu'),
                      TextFormField(
                        controller: _confirmPasswordController,
                        obscureText: !_showPassword2,
                        style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xff334155)),
                        decoration: InputDecoration(
                          hintText: 'Nhập lại mật khẩu mới',
                          prefixIcon: const Icon(Icons.lock_person_outlined, size: 18),
                          suffixIcon: IconButton(
                            icon: Icon(_showPassword2 ? Icons.visibility_off_outlined : Icons.visibility_outlined, size: 18),
                            onPressed: () => setState(() => _showPassword2 = !_showPassword2),
                          ),
                        ),
                        validator: (value) => FormValidator.validateConfirmPassword(_passwordController.text, value ?? ''),
                      ),
                      const SizedBox(height: 24),

                      // Requirements info box
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xfff8fafc),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xfff1f5f9)),
                        ),
                        child: const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Quy định bảo mật mật khẩu:',
                              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 11, color: AppColors.onSurface),
                            ),
                            SizedBox(height: 4),
                            Text('• Tối thiểu 8 ký tự', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xff64748b))),
                            Text('• Phải chứa chữ số, ký tự đặc biệt', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xff64748b))),
                            Text('• Nên kết hợp chữ HOA và chữ thường', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xff64748b))),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Submit Button
                      SizedBox(
                        width: double.infinity,
                        height: 60,
                        child: ElevatedButton(
                          onPressed: isLoading ? null : _handleResetPassword,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                            elevation: 8,
                            shadowColor: AppColors.primary.withOpacity(0.3),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          ),
                          child: isLoading
                              ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3))
                              : const Text('CẬP NHẬT MẬT KHẨU'),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSuccessState() {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: const BoxDecoration(
                  color: Color(0xffd1fae5),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_circle, size: 64, color: Color(0xff10b981)),
              ),
              const SizedBox(height: 32),
              const Text(
                'Mật Khẩu Đã Thay Đổi',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: AppColors.onSurface),
              ),
              const SizedBox(height: 12),
              const Text(
                'Đặt lại mật khẩu thành công. Hãy dùng mật khẩu mới này để đăng nhập vào ứng dụng kỹ thuật viên.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Color(0xff64748b), fontSize: 13, height: 1.5, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () => Navigator.of(context).pushReplacementNamed('/login'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.onSurface,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('QUAY LẠI ĐĂNG NHẬP', style: TextStyle(color: Colors.white)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInvalidCodeState() {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: const BoxDecoration(
                  color: Color(0xfffef2f2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.error_outline, size: 64, color: AppColors.error),
              ),
              const SizedBox(height: 32),
              const Text(
                'Mã xác nhận hết hạn',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: AppColors.onSurface),
              ),
              const SizedBox(height: 12),
              const Text(
                'Đường dẫn khôi phục mật khẩu không hợp lệ hoặc đã hết thời gian sử dụng. Vui lòng gửi yêu cầu đặt lại mật khẩu mới.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Color(0xff64748b), fontSize: 13, height: 1.5, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () => Navigator.of(context).pushReplacementNamed('/forgot-password'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.onSurface,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('GỬI YÊU CẦU MỚI', style: TextStyle(color: Colors.white)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
