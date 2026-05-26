import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared/theme/app_colors.dart';
import 'package:shared/utils/form_validator.dart';
import '../../../controllers/auth_controller.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _emailController;
  late final TextEditingController _otpController;
  late final TextEditingController _newPasswordController;
  late final TextEditingController _confirmPasswordController;

  int _currentStep = 0; // 0: Nhập email, 1: Xác thực OTP, 2: Tạo mật khẩu mới, 3: Thành công
  bool _isLoading = false;
  String? _errorMessage;
  bool _showPassword1 = false;
  bool _showPassword2 = false;

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController();
    _otpController = TextEditingController();
    _newPasswordController = TextEditingController();
    _confirmPasswordController = TextEditingController();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _otpController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleSendEmail() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final authController = context.read<AuthController>();
    final success = await authController.sendPasswordReset(_emailController.text.trim());

    if (mounted) {
      setState(() => _isLoading = false);
      if (success) {
        setState(() {
          _currentStep = 1; // Sang bước OTP
        });
      } else {
        setState(() {
          _errorMessage = authController.error ?? 'Gửi yêu cầu thất bại. Vui lòng thử lại.';
        });
      }
    }
  }

  Future<void> _handleVerifyOTP() async {
    if (_otpController.text.length != 6) {
      setState(() {
        _errorMessage = 'Mã OTP bao gồm 6 chữ số';
      });
      return;
    }
    
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    
    await Future.delayed(const Duration(seconds: 1)); // Simulating API verification
    
    if (mounted) {
      setState(() {
        _isLoading = false;
        _currentStep = 2; // Sang bước mật khẩu mới
      });
    }
  }

  Future<void> _handleResetPassword() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    // Simulating password reset confirmation
    await Future.delayed(const Duration(seconds: 1.5));

    if (mounted) {
      setState(() {
        _isLoading = false;
        _currentStep = 3; // Sang bước Thành công
      });
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
    if (_currentStep == 3) return _buildSuccessState();

    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: AppColors.onSurface, size: 20),
          onPressed: () {
            if (_currentStep > 0) {
              setState(() {
                _currentStep--;
                _errorMessage = null;
              });
            } else {
              Navigator.pop(context);
            }
          },
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
                      color: Colors.black.withAlpha(20),
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
                      // Tiến trình bước
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(3, (index) {
                          final isActive = index <= _currentStep;
                          return Row(
                            children: [
                              Container(
                                width: 24,
                                height: 24,
                                decoration: BoxDecoration(
                                  color: isActive ? AppColors.primary : const Color(0xffe2e8f0),
                                  shape: BoxShape.circle,
                                ),
                                child: Center(
                                  child: Text(
                                    (index + 1).toString(),
                                    style: TextStyle(
                                      color: isActive ? Colors.white : const Color(0xff64748b),
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                              if (index < 2)
                                Container(
                                  width: 40,
                                  height: 2,
                                  color: index < _currentStep ? AppColors.primary : const Color(0xffe2e8f0),
                                ),
                            ],
                          );
                        }),
                      ),
                      const SizedBox(height: 32),

                      // Tiêu đề động
                      _buildStepTitle(),
                      const SizedBox(height: 32),

                      // Trường nhập liệu động
                      if (_currentStep == 0) _buildEmailStep(),
                      if (_currentStep == 1) _buildOTPStep(),
                      if (_currentStep == 2) _buildPasswordStep(),

                      const SizedBox(height: 24),

                      // Thông báo lỗi
                      if (_errorMessage != null) ...[
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
                                  _errorMessage!,
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

                      // Nút hành động động
                      _buildStepActionButton(),
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

  Widget _buildStepTitle() {
    String title = '';
    String sub = '';
    if (_currentStep == 0) {
      title = 'Quên mật khẩu';
      sub = 'Nhập email của bạn để nhận mã OTP khôi phục.';
    } else if (_currentStep == 1) {
      title = 'Xác minh OTP';
      sub = 'Mã OTP 6 chữ số đã được gửi tới email ${_emailController.text}';
    } else if (_currentStep == 2) {
      title = 'Đặt mật khẩu mới';
      sub = 'Tạo mật khẩu mới và bảo mật tài khoản kỹ thuật viên.';
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: AppColors.onSurface, letterSpacing: -0.5),
        ),
        const SizedBox(height: 6),
        Text(
          sub,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xff94a3b8), height: 1.4),
        ),
      ],
    );
  }

  Widget _buildEmailStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildLabel('Email tài khoản'),
        TextFormField(
          controller: _emailController,
          onChanged: (_) => setState(() => _errorMessage = null),
          style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xff334155)),
          decoration: const InputDecoration(
            hintText: 'tech@aquacare.com',
            prefixIcon: Icon(Icons.mail_outline, size: 18),
          ),
          validator: (value) => FormValidator.validateEmail(value),
        ),
      ],
    );
  }

  Widget _buildOTPStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildLabel('Mã xác thực OTP (6 chữ số)'),
        TextFormField(
          controller: _otpController,
          keyboardType: TextInputType.number,
          maxLength: 6,
          textAlign: TextAlign.center,
          onChanged: (_) => setState(() => _errorMessage = null),
          style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xff334155), fontSize: 20, letterSpacing: 8),
          decoration: const InputDecoration(
            hintText: '••••••',
            prefixIcon: Icon(Icons.password, size: 18),
            counterText: '',
          ),
        ),
        const SizedBox(height: 12),
        Align(
          alignment: Alignment.centerRight,
          child: TextButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Đã gửi lại mã OTP khôi phục!')),
              );
            },
            child: const Text(
              'GỬI LẠI MÃ',
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 11, color: AppColors.primary),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPasswordStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildLabel('Mật khẩu mới'),
        TextFormField(
          controller: _newPasswordController,
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
          validator: (value) => (value == null || value.length < 6) ? 'Mật khẩu phải dài tối thiểu 6 ký tự' : null,
        ),
        const SizedBox(height: 16),
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
          validator: (value) => (value != _newPasswordController.text) ? 'Mật khẩu xác nhận không trùng khớp' : null,
        ),
      ],
    );
  }

  Widget _buildStepActionButton() {
    VoidCallback? action;
    String text = '';
    if (_currentStep == 0) {
      action = _handleSendEmail;
      text = 'GỬI MÃ KHÔI PHỤC';
    } else if (_currentStep == 1) {
      action = _handleVerifyOTP;
      text = 'XÁC MINH MÃ';
    } else if (_currentStep == 2) {
      action = _handleResetPassword;
      text = 'ĐẶT LẠI MẬT KHẨU';
    }

    return SizedBox(
      width: double.infinity,
      height: 60,
      child: ElevatedButton(
        onPressed: _isLoading ? null : action,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 8,
          shadowColor: AppColors.primary.withAlpha(77),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        ),
        child: _isLoading
            ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3))
            : Text(text),
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
                'Đặt lại mật khẩu thành công. Hãy sử dụng mật khẩu mới này để đăng nhập vào ứng dụng kỹ thuật viên.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Color(0xff64748b), fontSize: 13, height: 1.5, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () => Navigator.of(context).popAndPushNamed('/login'),
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
}
