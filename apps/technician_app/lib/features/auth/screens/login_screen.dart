import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared/theme/app_colors.dart';
import 'package:shared/theme/app_text_styles.dart';
import 'package:shared/utils/form_validator.dart';
import '../../../controllers/auth_controller.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _emailController;
  late final TextEditingController _passwordController;

  bool _rememberMe = false;
  bool _showPassword = false;
  String? _generalError;
  
  // Các thông số đếm ngược khóa tài khoản
  int _failedAttempts = 0;
  int _lockoutSeconds = 0;
  Timer? _lockoutTimer;

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
    _lockoutTimer?.cancel();
    super.dispose();
  }

  void _startLockoutTimer() {
    _lockoutTimer?.cancel();
    setState(() {
      _lockoutSeconds = 60; // Khóa 60 giây để thử nghiệm thực tế nhanh chóng
    });
    _lockoutTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_lockoutSeconds > 0) {
        setState(() {
          _lockoutSeconds--;
        });
      } else {
        setState(() {
          _failedAttempts = 0;
        });
        _lockoutTimer?.cancel();
      }
    });
  }

  void _clearError() {
    if (_generalError != null) {
      setState(() => _generalError = null);
    }
  }

  Future<void> _handleLogin() async {
    if (_lockoutSeconds > 0) return;
    if (!_formKey.currentState!.validate()) return;

    _clearError();
    final authController = context.read<AuthController>();
    
    final success = await authController.login(
      _emailController.text.trim(),
      _passwordController.text,
    );

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đăng nhập thành công!')),
        );
        Navigator.of(context).pushReplacementNamed('/dashboard');
      } else {
        setState(() {
          _failedAttempts++;
          _generalError = authController.error ?? 'Email hoặc mật khẩu không chính xác';
          if (_failedAttempts >= 5) {
            _generalError = 'Tài khoản của bạn đã bị khóa tạm thời do nhập sai quá 5 lần.';
            _startLockoutTimer();
          }
        });
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
                          child: const Icon(Icons.engineering_rounded, color: Colors.white, size: 32),
                        ),
                      ),
                      const SizedBox(height: 24),
                      const Center(
                        child: Text(
                          'AquaCare Tech',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            color: AppColors.onSurface,
                            letterSpacing: -0.5,
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Center(
                        child: Text(
                          'KỸ THUẬT VIÊN PORTAL',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w900,
                            color: Color(0xff94a3b8),
                            letterSpacing: 2.0,
                          ),
                        ),
                      ),
                      const SizedBox(height: 40),

                      // Email Field
                      _buildLabel('Tài khoản Email'),
                      TextFormField(
                        controller: _emailController,
                        onChanged: (_) => _clearError(),
                        style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xff334155)),
                        decoration: const InputDecoration(
                          hintText: 'tech@aquacare.com',
                          prefixIcon: Icon(Icons.mail_outline, size: 18),
                        ),
                        validator: (value) => FormValidator.validateEmail(value),
                      ),
                      const SizedBox(height: 20),

                      // Password Field
                      _buildLabel('Mật khẩu'),
                      TextFormField(
                        controller: _passwordController,
                        obscureText: !_showPassword,
                        onChanged: (_) => _clearError(),
                        style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xff334155)),
                        decoration: InputDecoration(
                          hintText: '••••••••',
                          prefixIcon: const Icon(Icons.lock_outline, size: 18),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _showPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                              size: 18,
                            ),
                            onPressed: () => setState(() => _showPassword = !_showPassword),
                          ),
                        ),
                        validator: (value) => (value == null || value.isEmpty) ? 'Vui lòng nhập mật khẩu' : null,
                      ),

                      // Remember Me & Forgot Password row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              SizedBox(
                                width: 24,
                                height: 24,
                                child: Checkbox(
                                  value: _rememberMe,
                                  activeColor: AppColors.primary,
                                  onChanged: (value) {
                                    setState(() => _rememberMe = value ?? false);
                                  },
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Text(
                                'Nhớ tài khoản',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xff64748b),
                                ),
                              ),
                            ],
                          ),
                          TextButton(
                            onPressed: () => Navigator.pushNamed(context, '/forgot-password'),
                            child: const Text(
                              'Quên mật khẩu?',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w900,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Khóa tài khoản Banner (Đếm ngược)
                      if (_lockoutSeconds > 0) ...[
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xfffff7ed),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xffffedd5)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.timer_outlined, color: Colors.orangeAccent, size: 22),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  'Đăng nhập tạm thời bị khóa. Thử lại sau $_lockoutSeconds giây.',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.orangeAccent,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),
                      ],

                      // General Error display
                      if (_generalError != null && _lockoutSeconds == 0) ...[
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

                      // Login Button
                      SizedBox(
                        width: double.infinity,
                        height: 60,
                        child: ElevatedButton(
                          onPressed: (isLoading || _lockoutSeconds > 0) ? null : _handleLogin,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                            elevation: 8,
                            shadowColor: AppColors.primary.withOpacity(0.3),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          ),
                          child: isLoading
                              ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3))
                              : const Text(
                                  'ĐĂNG NHẬP NGAY',
                                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                                ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Signup Link (đăng ký KTV mới)
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
                              Icon(Icons.person_add_outlined, size: 18, color: AppColors.primary),
                              SizedBox(width: 10),
                              Text(
                                'ĐĂNG KÝ KỸ THUẬT VIÊN',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.primary,
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
