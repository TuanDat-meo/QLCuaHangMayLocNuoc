// Flutter Login Screen - Customer App (Design like Admin Web)
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:customer_app/controllers/auth_controller.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _emailController;
  late final TextEditingController _passwordController;

  bool _showPassword = false;
  bool _isLoading = false;
  String? _generalError;

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController();
    _passwordController = TextEditingController();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _clearError() {
    if (_generalError != null) {
      setState(() => _generalError = null);
    }
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _generalError = null;
    });

    final authController = context.read<AuthController>();
    final success = await authController.login(
      _emailController.text.trim(),
      _passwordController.text,
    );

    if (mounted) {
      setState(() => _isLoading = false);
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đăng nhập thành công!')),
        );
        Navigator.of(context).pushReplacementNamed('/');
      } else {
        setState(() {
          _generalError = authController.error ?? 'Email hoặc mật khẩu không chính xác';
        });
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
      focusedErrorBorder: OutlineInputBorder(
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
    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
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
                      // Logo
                      Center(
                        child: Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            color: const Color(0xff00459a),
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xff00459a).withOpacity(0.2),
                                blurRadius: 15,
                                offset: const Offset(0, 5),
                              ),
                            ],
                          ),
                          child: const Icon(Icons.water_drop_rounded, color: Colors.white, size: 32),
                        ),
                      ),
                      const SizedBox(height: 24),
                      const Center(
                        child: Text(
                          'Aquacare Customer',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            color: Color(0xff0b1c30),
                            letterSpacing: -0.5,
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Center(
                        child: Text(
                          'CUSTOMER PORTAL',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w900,
                            color: Color(0xff94a3b8),
                            letterSpacing: 2.0,
                          ),
                        ),
                      ),
                      const SizedBox(height: 40),

                      // Email
                      _buildLabel('Tài khoản Email'),
                      TextFormField(
                        controller: _emailController,
                        onChanged: (_) => _clearError(),
                        style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xff334155)),
                        decoration: _inputDecoration(
                          hintText: 'customer@aquacare.com',
                          prefixIcon: Icons.mail_outline,
                        ),
                        validator: (value) => (value == null || value.isEmpty) ? 'Vui lòng nhập email' : null,
                      ),
                      const SizedBox(height: 20),

                      // Password
                      _buildLabel('Mật khẩu'),
                      TextFormField(
                        controller: _passwordController,
                        obscureText: !_showPassword,
                        onChanged: (_) => _clearError(),
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
                        validator: (value) => (value == null || value.isEmpty) ? 'Vui lòng nhập mật khẩu' : null,
                      ),

                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed: () => Navigator.pushNamed(context, '/forgot-password'),
                          child: const Text(
                            'Quên mật khẩu?',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w900,
                              color: Color(0xff00459a),
                            ),
                          ),
                        ),
                      ),

                      if (_generalError != null) ...[
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xfffef2f2),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xfffee2e2)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.error_outline, color: Colors.redAccent, size: 20),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  _generalError!,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.redAccent,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),
                      ],

                      const SizedBox(height: 8),

                      // Login Button
                      SizedBox(
                        width: double.infinity,
                        height: 60,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _handleLogin,
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
                                  'ĐĂNG NHẬP NGAY',
                                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                                ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Signup Button
                      SizedBox(
                        width: double.infinity,
                        height: 60,
                        child: OutlinedButton(
                          onPressed: () => Navigator.pushNamed(context, '/signup'),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: Color(0xfff1f5f9), width: 2),
                            backgroundColor: const Color(0xfff8fafc),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          ),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.person_add_outlined, size: 18, color: Color(0xff00459a)),
                              SizedBox(width: 10),
                              Text(
                                'TẠO TÀI KHOẢN MỚI',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w900,
                                  color: Color(0xff00459a),
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
            ),
          ),
        ),
      ),
    );
  }
}
