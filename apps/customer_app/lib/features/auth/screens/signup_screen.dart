// Flutter Signup Screen - Customer App (Design like Admin Web)
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:customer_app/controllers/auth_controller.dart';

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

  bool _showPassword = false;
  bool _showConfirmPassword = false;
  bool _isAgreed = false;
  bool _isLoading = false;

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
    if (!_isAgreed) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng xác nhận thông tin là chính xác')),
      );
      return;
    }

    setState(() => _isLoading = true);

    final authController = context.read<AuthController>();
    final success = await authController.signup(
      _emailController.text.trim(),
      _passwordController.text,
      _displayNameController.text,
      _phoneController.text,
    );

    if (mounted) {
      setState(() => _isLoading = false);
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đăng ký thành công! Vui lòng chờ Admin kích hoạt tài khoản.'),
            duration: Duration(seconds: 5),
          ),
        );
        Navigator.of(context).pushReplacementNamed('/login');
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(authController.error ?? 'Đăng ký thất bại'),
            backgroundColor: Colors.red,
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
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: Color(0xfff8fafc), width: 2),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: Color(0xfff8fafc), width: 2),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: Color(0xff00459a), width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: Colors.redAccent, width: 2),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: Colors.redAccent, width: 2),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 6),
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
    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              // Back Button
              Align(
                alignment: Alignment.centerLeft,
                child: TextButton.icon(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.arrow_back, size: 18, color: Color(0xff94a3b8)),
                  label: const Text(
                    'Quay lại Đăng nhập',
                    style: TextStyle(
                      color: Color(0xff94a3b8),
                      fontWeight: FontWeight.w900,
                      fontSize: 13,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              // Main Card
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(40),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 20,
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
                      const Center(
                        child: Text(
                          'Đăng ký tài khoản',
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
                          'Tài khoản sẽ được Admin phê duyệt',
                          style: TextStyle(
                            fontSize: 13,
                            color: Color(0xff64748b),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Email
                      _buildLabel('Email cá nhân'),
                      TextFormField(
                        controller: _emailController,
                        style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xff334155)),
                        decoration: _inputDecoration(
                          hintText: 'example@gmail.com',
                          prefixIcon: Icons.mail_outline,
                        ),
                        validator: (value) => (value == null || !value.contains('@')) ? 'Email không hợp lệ' : null,
                      ),
                      const SizedBox(height: 20),

                      // Họ tên
                      _buildLabel('Họ và tên'),
                      TextFormField(
                        controller: _displayNameController,
                        style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xff334155)),
                        decoration: _inputDecoration(
                          hintText: 'Nguyễn Văn A',
                          prefixIcon: Icons.person_outline,
                        ),
                        validator: (value) => (value == null || value.isEmpty) ? 'Vui lòng nhập họ tên' : null,
                      ),
                      const SizedBox(height: 20),

                      // Số điện thoại
                      _buildLabel('Số điện thoại'),
                      TextFormField(
                        controller: _phoneController,
                        keyboardType: TextInputType.phone,
                        style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xff334155)),
                        decoration: _inputDecoration(
                          hintText: '098xxx',
                          prefixIcon: Icons.phone_outlined,
                        ),
                        validator: (value) => (value == null || value.isEmpty) ? 'Vui lòng nhập số điện thoại' : null,
                      ),
                      const SizedBox(height: 20),

                      // Mật khẩu
                      _buildLabel('Mật khẩu'),
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
                        validator: (value) => (value != null && value.length < 6) ? 'Mật khẩu tối thiểu 6 ký tự' : null,
                      ),
                      const SizedBox(height: 20),

                      // Xác nhận mật khẩu
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
                      const SizedBox(height: 24),

                      // Checkbox điều khoản
                      GestureDetector(
                        onTap: () => setState(() => _isAgreed = !_isAgreed),
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xfff0f7ff),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xffe0f2fe)),
                          ),
                          child: Row(
                            children: [
                              SizedBox(
                                width: 24,
                                height: 24,
                                child: Checkbox(
                                  value: _isAgreed,
                                  onChanged: (val) => setState(() => _isAgreed = val ?? false),
                                  activeColor: const Color(0xff00459a),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                                ),
                              ),
                              const SizedBox(width: 12),
                              const Expanded(
                                child: Text(
                                  'Tôi xác nhận các thông tin trên là chính xác.',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xff334155),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Submit Button
                      SizedBox(
                        width: double.infinity,
                        height: 60,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _handleSignup,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xff00459a),
                            foregroundColor: Colors.white,
                            elevation: 10,
                            shadowColor: const Color(0xff00459a).withOpacity(0.3),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(24),
                            ),
                          ),
                          child: _isLoading
                              ? const SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3),
                                )
                              : const Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.check_circle_outline, size: 20),
                                    SizedBox(width: 10),
                                    Text(
                                      'GỬI YÊU CẦU ĐĂNG KÝ',
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w900,
                                        letterSpacing: 1.2,
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
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
