// Flutter Reset Password Screen - Customer App (Design like Admin Web)
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:customer_app/controllers/auth_controller.dart';

class ResetPasswordScreen extends StatefulWidget {
  final String code;

  const ResetPasswordScreen({
    super.key,
    required this.code,
  });

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _passwordController;
  late final TextEditingController _confirmPasswordController;

  bool _showPassword = false;
  bool _showConfirmPassword = false;
  bool _isSuccess = false;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _passwordController = TextEditingController();
    _confirmPasswordController = TextEditingController();
  }

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleResetPassword() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    final authController = context.read<AuthController>();
    final success = await authController.resetPassword(
      widget.code,
      _passwordController.text,
    );

    if (mounted) {
      setState(() => _isLoading = false);
      if (success) {
        setState(() => _isSuccess = true);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(authController.error ?? 'Reset mật khẩu thất bại'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  InputDecoration _inputDecoration({
    required String hintText,
    required IconData prefixIcon,
    Widget? suffixIcon,
  }) {
    return InputDecoration(
      prefixIcon: Icon(prefixIcon, size: 18, color: const Color(0xffcbd5e1)),
      suffixIcon: suffixIcon,
      hintText: hintText,
      hintStyle: const TextStyle(color: Color(0xffcbd5e1), fontSize: 14),
      filled: true,
      fillColor: const Color(0xfff8fafc),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(20),
        borderSide: const BorderSide(color: Color(0xfff8fafc), width: 2),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(20),
        borderSide: const BorderSide(color: Color(0xfff8fafc), width: 2),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(20),
        borderSide: const BorderSide(color: Color(0xff00459a), width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(20),
        borderSide: const BorderSide(color: Colors.redAccent, width: 2),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
    );
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

    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              Align(
                alignment: Alignment.centerLeft,
                child: TextButton.icon(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.arrow_back, size: 18, color: Color(0xff94a3b8)),
                  label: const Text(
                    'QUAY LẠI ĐĂNG NHẬP',
                    style: TextStyle(
                      color: Color(0xff94a3b8),
                      fontWeight: FontWeight.w900,
                      fontSize: 12,
                      letterSpacing: 1.2,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 30),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(40),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
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
                    children: [
                      Center(
                        child: Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            color: const Color(0xff00459a),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Icon(Icons.lock_reset_rounded, color: Colors.white, size: 32),
                        ),
                      ),
                      const SizedBox(height: 24),
                      const Center(
                        child: Text(
                          'Đặt lại mật khẩu',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            color: Color(0xff0b1c30),
                            letterSpacing: -0.5,
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Center(
                        child: Text(
                          'Tạo mật khẩu mới cho tài khoản của bạn',
                          style: TextStyle(
                            fontSize: 14,
                            color: Color(0xff64748b),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      const SizedBox(height: 32),

                      // New Password
                      _buildLabel('Mật khẩu mới'),
                      TextFormField(
                        controller: _passwordController,
                        obscureText: !_showPassword,
                        style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xff334155)),
                        decoration: _inputDecoration(
                          hintText: '••••••••',
                          prefixIcon: Icons.lock_outline,
                          suffixIcon: IconButton(
                            icon: Icon(
                              _showPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                              size: 18,
                              color: const Color(0xffcbd5e1),
                            ),
                            onPressed: () => setState(() => _showPassword = !_showPassword),
                          ),
                        ),
                        validator: (value) => (value != null && value.length < 8) ? 'Mật khẩu tối thiểu 8 ký tự' : null,
                      ),
                      const SizedBox(height: 16),

                      // Requirements Box
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xfff8fafc),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xfff1f5f9)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Yêu cầu bảo mật:',
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xff0b1c30)),
                            ),
                            const SizedBox(height: 8),
                            _buildRequirement('Tối thiểu 8 ký tự'),
                            _buildRequirement('Bao gồm chữ hoa và chữ thường'),
                            _buildRequirement('Bao gồm ít nhất 1 chữ số'),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Confirm Password
                      _buildLabel('Xác nhận mật khẩu'),
                      TextFormField(
                        controller: _confirmPasswordController,
                        obscureText: !_showConfirmPassword,
                        style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xff334155)),
                        decoration: _inputDecoration(
                          hintText: '••••••••',
                          prefixIcon: Icons.lock_outline,
                          suffixIcon: IconButton(
                            icon: Icon(
                              _showConfirmPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                              size: 18,
                              color: const Color(0xffcbd5e1),
                            ),
                            onPressed: () => setState(() => _showConfirmPassword = !_showConfirmPassword),
                          ),
                        ),
                        validator: (value) => (value != _passwordController.text) ? 'Mật khẩu không khớp' : null,
                      ),
                      const SizedBox(height: 32),

                      // Submit Button
                      SizedBox(
                        width: double.infinity,
                        height: 60,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _handleResetPassword,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xff00459a),
                            foregroundColor: Colors.white,
                            elevation: 8,
                            shadowColor: const Color(0xff00459a).withOpacity(0.3),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          ),
                          child: _isLoading
                              ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3))
                              : const Text(
                                  'CẬP NHẬT MẬT KHẨU',
                                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRequirement(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          const Icon(Icons.check_circle, size: 12, color: Color(0xff10b981)),
          const SizedBox(width: 8),
          Text(text, style: const TextStyle(fontSize: 11, color: Color(0xff64748b), fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget _buildSuccessState() {
    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: const Color(0xffecfdf5),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_circle_outline_rounded, size: 56, color: Color(0xff10b981)),
              ),
              const SizedBox(height: 32),
              const Text(
                'Thành công!',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Color(0xff0b1c30), letterSpacing: -0.5),
              ),
              const SizedBox(height: 16),
              const Text(
                'Mật khẩu của bạn đã được thay đổi.\nBây giờ bạn có thể đăng nhập với mật khẩu mới.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 15, color: Color(0xff64748b), height: 1.5, fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 48),
              SizedBox(
                width: double.infinity,
                height: 60,
                child: ElevatedButton(
                  onPressed: () => Navigator.pushReplacementNamed(context, '/login'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xff00459a),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    elevation: 5,
                  ),
                  child: const Text(
                    'ĐĂNG NHẬP NGAY',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, letterSpacing: 1.2),
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
