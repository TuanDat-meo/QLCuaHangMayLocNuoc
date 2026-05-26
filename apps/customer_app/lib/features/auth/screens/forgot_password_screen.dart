// Flutter Forgot Password Screen - Customer App (Design like Admin Web)
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:customer_app/controllers/auth_controller.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _emailController;
  bool _isSuccess = false;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController();
  }

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _handleForgotPassword() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    final authController = context.read<AuthController>();
    final success = await authController.sendPasswordReset(_emailController.text.trim());

    if (mounted) {
      setState(() => _isLoading = false);
      if (success) {
        setState(() => _isSuccess = true);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(authController.error ?? 'Gửi email thất bại'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  InputDecoration _inputDecoration({
    required String hintText,
    required IconData prefixIcon,
  }) {
    return InputDecoration(
      prefixIcon: Icon(prefixIcon, size: 18, color: const Color(0xffcbd5e1)),
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
                    'TRỞ VỀ',
                    style: TextStyle(
                      color: Color(0xff94a3b8),
                      fontWeight: FontWeight.w900,
                      fontSize: 12,
                      letterSpacing: 1.2,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 40),
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
                    children: [
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: const Color(0xff00459a).withOpacity(0.05),
                          borderRadius: BorderRadius.circular(28),
                        ),
                        child: const Icon(Icons.key_rounded, color: Color(0xff00459a), size: 36),
                      ),
                      const SizedBox(height: 24),
                      const Text(
                        'Quên mật khẩu?',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          color: Color(0xff0b1c30),
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Đừng lo lắng, hãy nhập email của bạn để lấy lại quyền truy cập',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 14,
                          color: Color(0xff64748b),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 32),
                      Align(
                        alignment: Alignment.centerLeft,
                        child: Padding(
                          padding: const EdgeInsets.only(left: 4, bottom: 8),
                          child: Text(
                            'EMAIL CỦA BẠN',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              color: const Color(0xff64748b).withOpacity(0.7),
                              letterSpacing: 1.5,
                            ),
                          ),
                        ),
                      ),
                      TextFormField(
                        controller: _emailController,
                        style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xff334155)),
                        decoration: _inputDecoration(
                          hintText: 'example@gmail.com',
                          prefixIcon: Icons.mail_outline,
                        ),
                        validator: (value) => (value == null || !value.contains('@')) ? 'Email không hợp lệ' : null,
                      ),
                      const SizedBox(height: 32),
                      SizedBox(
                        width: double.infinity,
                        height: 60,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _handleForgotPassword,
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
                                  'GỬI MÃ XÁC THỰC',
                                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, letterSpacing: 1.5),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 32),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xfff0f7ff),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xffe0f2fe)),
                ),
                child: const Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.info_outline, color: Color(0xff38bdf8), size: 18),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Mã khôi phục sẽ có hiệu lực trong 5 phút. Vui lòng kiểm tra kỹ hòm thư của bạn.',
                        style: TextStyle(
                          fontSize: 12,
                          color: Color(0xff0369a1),
                          fontWeight: FontWeight.bold,
                          fontStyle: FontStyle.italic,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
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
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xff10b981).withOpacity(0.1),
                      blurRadius: 30,
                    ),
                  ],
                ),
                child: const Icon(Icons.check_circle_outline_rounded, size: 56, color: Color(0xff10b981)),
              ),
              const SizedBox(height: 32),
              const Text(
                'Kiểm tra Email',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Color(0xff0b1c30), letterSpacing: -0.5),
              ),
              const SizedBox(height: 16),
              RichText(
                textAlign: TextAlign.center,
                text: TextSpan(
                  style: const TextStyle(fontSize: 15, color: Color(0xff64748b), height: 1.5, fontWeight: FontWeight.w500),
                  children: [
                    const TextSpan(text: 'Chúng tôi đã gửi link đặt lại mật khẩu tới\n'),
                    TextSpan(
                      text: _emailController.text,
                      style: const TextStyle(color: Color(0xff00459a), fontWeight: FontWeight.w900),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 48),
              SizedBox(
                width: double.infinity,
                height: 60,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xff0b1c30),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    elevation: 5,
                  ),
                  child: const Text(
                    'QUAY LẠI ĐĂNG NHẬP',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              TextButton(
                onPressed: () => setState(() => _isSuccess = false),
                child: const Text(
                  'Không nhận được email? Thử lại',
                  style: TextStyle(color: Color(0xff00459a), fontWeight: FontWeight.w900, fontSize: 13),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
