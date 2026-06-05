import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared/theme/app_colors.dart';
import 'package:shared/theme/app_text_styles.dart';
import 'package:shared/utils/form_validator.dart';
import '../../../controllers/auth_controller.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _formKey = GlobalKey<FormState>();

  late final TextEditingController _emailController;
  late final TextEditingController _passwordController;
  late final TextEditingController _confirmPasswordController;
  late final TextEditingController _displayNameController;
  late final TextEditingController _phoneController;

  bool _acceptTerms = false;
  bool _showPassword1 = false;
  bool _showPassword2 = false;

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController();
    _passwordController = TextEditingController();
    _confirmPasswordController = TextEditingController();
    _displayNameController = TextEditingController();
    _phoneController = TextEditingController();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _displayNameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _handleSignup() async {
    if (!_formKey.currentState!.validate()) return;

    if (!_acceptTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng đồng ý với điều khoản dịch vụ'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    final authController = context.read<AuthController>();
    final success = await authController.signup(
      _emailController.text.trim(),
      _passwordController.text,
      _displayNameController.text,
      _phoneController.text,
    );

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Đăng ký thành công! Vui lòng chờ Quản trị viên phê duyệt tài khoản của bạn.',
            ),
            duration: Duration(seconds: 5),
            backgroundColor: Color(0xff10b981),
          ),
        );
        Navigator.of(context).pushReplacementNamed('/login');
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(authController.error ?? 'Đăng ký thất bại'),
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
    final authController = context.watch<AuthController>();
    final isLoading = authController.isLoading;

    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back_ios_new,
            color: AppColors.onSurface,
            size: 20,
          ),
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
                      // Logo / Icon
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
                          child: const Icon(
                            Icons.person_add_rounded,
                            color: Colors.white,
                            size: 32,
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      const Center(
                        child: Text(
                          'Đăng ký tài khoản',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: AppColors.onSurface,
                            letterSpacing: -0.5,
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Center(
                        child: Text(
                          'KỸ THUẬT VIÊN MỚI',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w900,
                            color: Color(0xff94a3b8),
                            letterSpacing: 2.0,
                          ),
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Họ tên
                      _buildLabel('Họ và tên'),
                      TextFormField(
                        controller: _displayNameController,
                        enableSuggestions: false,
                        autocorrect: false,
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          color: Color(0xff334155),
                        ),
                        decoration: const InputDecoration(
                          hintText: 'Nhập họ và tên của bạn',
                          prefixIcon: Icon(Icons.person_outline, size: 18),
                        ),
                        validator: (value) =>
                            FormValidator.validateDisplayName(value),
                      ),
                      const SizedBox(height: 16),

                      // Email
                      _buildLabel('Email công việc'),
                      TextFormField(
                        controller: _emailController,
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          color: Color(0xff334155),
                        ),
                        decoration: const InputDecoration(
                          hintText: 'your@email.com',
                          prefixIcon: Icon(Icons.mail_outline, size: 18),
                        ),
                        validator: (value) =>
                            FormValidator.validateEmail(value),
                      ),
                      const SizedBox(height: 16),

                      // Số điện thoại
                      _buildLabel('Số điện thoại'),
                      TextFormField(
                        controller: _phoneController,
                        keyboardType: TextInputType.phone,
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          color: Color(0xff334155),
                        ),
                        decoration: const InputDecoration(
                          hintText: '0xxxxxxxxx',
                          prefixIcon: Icon(Icons.phone_outlined, size: 18),
                        ),
                        validator: (value) =>
                            FormValidator.validatePhoneNumber(value),
                      ),
                      const SizedBox(height: 16),

                      // Mật khẩu
                      _buildLabel('Mật khẩu'),
                      TextFormField(
                        controller: _passwordController,
                        obscureText: !_showPassword1,
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          color: Color(0xff334155),
                        ),
                        decoration: InputDecoration(
                          hintText: 'Tạo mật khẩu bảo mật',
                          prefixIcon: const Icon(Icons.lock_outline, size: 18),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _showPassword1
                                  ? Icons.visibility_off_outlined
                                  : Icons.visibility_outlined,
                              size: 18,
                            ),
                            onPressed: () => setState(
                              () => _showPassword1 = !_showPassword1,
                            ),
                          ),
                        ),
                        validator: (value) =>
                            FormValidator.validatePassword(value),
                      ),
                      const SizedBox(height: 16),

                      // Xác nhận mật khẩu
                      _buildLabel('Xác nhận mật khẩu'),
                      TextFormField(
                        controller: _confirmPasswordController,
                        obscureText: !_showPassword2,
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          color: Color(0xff334155),
                        ),
                        decoration: InputDecoration(
                          hintText: 'Nhập lại mật khẩu',
                          prefixIcon: const Icon(
                            Icons.lock_person_outlined,
                            size: 18,
                          ),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _showPassword2
                                  ? Icons.visibility_off_outlined
                                  : Icons.visibility_outlined,
                              size: 18,
                            ),
                            onPressed: () => setState(
                              () => _showPassword2 = !_showPassword2,
                            ),
                          ),
                        ),
                        validator: (value) =>
                            FormValidator.validateConfirmPassword(
                              _passwordController.text,
                              value ?? '',
                            ),
                      ),
                      const SizedBox(height: 16),

                      // Info box về quá trình duyệt
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xffeff6ff),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xffdbeafe)),
                        ),
                        child: const Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(
                              Icons.info_outline,
                              color: Color(0xff2563eb),
                              size: 20,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                'Tài khoản kỹ thuật viên sau khi tạo sẽ ở trạng thái chờ duyệt. Quản trị viên hệ thống sẽ kiểm tra hồ sơ và kích hoạt tài khoản của bạn.',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xff1d4ed8),
                                  height: 1.4,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Checkbox đồng ý điều khoản
                      CheckboxListTile(
                        value: _acceptTerms,
                        onChanged: (value) {
                          setState(() => _acceptTerms = value ?? false);
                        },
                        title: const Text(
                          'Đồng ý với các điều khoản hoạt động thực địa của AquaCare.',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Color(0xff64748b),
                          ),
                        ),
                        controlAffinity: ListTileControlAffinity.leading,
                        contentPadding: EdgeInsets.zero,
                        activeColor: AppColors.primary,
                      ),
                      const SizedBox(height: 20),

                      // Đăng ký Button
                      SizedBox(
                        width: double.infinity,
                        height: 60,
                        child: ElevatedButton(
                          onPressed: isLoading ? null : _handleSignup,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                            elevation: 8,
                            shadowColor: AppColors.primary.withOpacity(0.3),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                          ),
                          child: isLoading
                              ? const SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: CircularProgressIndicator(
                                    color: Colors.white,
                                    strokeWidth: 3,
                                  ),
                                )
                              : const Text('ĐĂNG KÝ NGAY'),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Quay lại đăng nhập
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text(
                            'Đã có tài khoản? ',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Color(0xff64748b),
                            ),
                          ),
                          TextButton(
                            onPressed: () {
                              Navigator.of(
                                context,
                              ).pushReplacementNamed('/login');
                            },
                            child: const Text(
                              'Đăng nhập',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w900,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                        ],
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
}
