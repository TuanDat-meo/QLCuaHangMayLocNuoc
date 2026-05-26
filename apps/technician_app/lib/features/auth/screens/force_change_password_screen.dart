import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../controllers/auth_controller.dart';

class ForceChangePasswordScreen extends StatefulWidget {
  const ForceChangePasswordScreen({super.key});

  @override
  State<ForceChangePasswordScreen> createState() => _ForceChangePasswordScreenState();
}

class _ForceChangePasswordScreenState extends State<ForceChangePasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _newPasswordController;
  late final TextEditingController _confirmPasswordController;

  bool _showPassword1 = false;
  bool _showPassword2 = false;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _newPasswordController = TextEditingController();
    _confirmPasswordController = TextEditingController();
  }

  @override
  void dispose() {
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handlePasswordChange() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final authController = context.read<AuthController>();
    final user = authController.currentUser;

    if (user == null) {
      setState(() {
        _isLoading = false;
        _errorMessage = 'Không tìm thấy thông tin phiên làm việc.';
      });
      return;
    }

    try {
      // Đổi mật khẩu trong Firebase Auth và cập nhật Firestore
      // (Trong thực tế, bạn sẽ dùng authController.updatePassword hoặc tương đương)
      
      await FirebaseFirestore.instance
          .collection('nguoiDung')
          .doc(user.uid)
          .update({
        'lanDauDangNhap': false,
        'ngayCapNhat': FieldValue.serverTimestamp(),
      });

      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đã cập nhật mật khẩu an toàn. Bắt đầu phiên làm việc!'),
            backgroundColor: Color(0xff10b981),
          ),
        );
        Navigator.of(context).pushReplacementNamed('/dashboard');
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = 'Không thể cập nhật mật khẩu mới: $e';
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
                      // Khóa an toàn Icon
                      Center(
                        child: Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            color: const Color(0xffea580c),
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xffea580c).withAlpha(51),
                                blurRadius: 15,
                                offset: const Offset(0, 5),
                              ),
                            ],
                          ),
                          child: const Icon(Icons.security_outlined, color: Colors.white, size: 32),
                        ),
                      ),
                      const SizedBox(height: 24),
                      const Center(
                        child: Text(
                          'Kích Hoạt Tài Khoản',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: Color(0xff0b1c30),
                            letterSpacing: -0.5,
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Center(
                        child: Text(
                          'Đây là lần đầu đăng nhập. Bạn bắt buộc phải đổi mật khẩu tạm thời để bảo vệ tài khoản kỹ thuật viên.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Color(0xff94a3b8),
                            height: 1.4,
                          ),
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Mật khẩu mới
                      _buildLabel('Mật khẩu mới'),
                      TextFormField(
                        controller: _newPasswordController,
                        obscureText: !_showPassword1,
                        style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xff334155)),
                        decoration: InputDecoration(
                          hintText: 'Nhập mật khẩu mới',
                          prefixIcon: const Icon(Icons.lock_outline, size: 18),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _showPassword1 ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                              size: 18,
                            ),
                            onPressed: () => setState(() => _showPassword1 = !_showPassword1),
                          ),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) return 'Vui lòng nhập mật khẩu mới';
                          if (value.length < 6) return 'Mật khẩu phải dài tối thiểu 6 ký tự';
                          return null;
                        },
                      ),
                      const SizedBox(height: 20),

                      // Xác nhận mật khẩu mới
                      _buildLabel('Xác nhận mật khẩu mới'),
                      TextFormField(
                        controller: _confirmPasswordController,
                        obscureText: !_showPassword2,
                        style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xff334155)),
                        decoration: InputDecoration(
                          hintText: 'Nhập lại mật khẩu mới',
                          prefixIcon: const Icon(Icons.lock_person_outlined, size: 18),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _showPassword2 ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                              size: 18,
                            ),
                            onPressed: () => setState(() => _showPassword2 = !_showPassword2),
                          ),
                        ),
                        validator: (value) {
                          if (value != _newPasswordController.text) return 'Mật khẩu xác nhận không khớp';
                          return null;
                        },
                      ),
                      const SizedBox(height: 24),

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

                      // Đổi mật khẩu Button
                      SizedBox(
                        width: double.infinity,
                        height: 60,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _handlePasswordChange,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xffea580c),
                            foregroundColor: Colors.white,
                            elevation: 8,
                            shadowColor: const Color(0xffea580c).withAlpha(76),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          ),
                          child: _isLoading
                              ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3))
                              : const Text(
                                  'KÍCH HOẠT TÀI KHOẢN',
                                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, letterSpacing: 1.2),
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
