import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared/theme/app_colors.dart';
import 'package:shared/theme/app_text_styles.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shared/services/auth_service.dart';
import '../../../controllers/auth_controller.dart';
import '../../../controllers/profile_controller.dart';
import 'edit_profile_screen.dart';

class ProfileSettingsScreen extends StatefulWidget {
  const ProfileSettingsScreen({super.key});

  @override
  State<ProfileSettingsScreen> createState() => _ProfileSettingsScreenState();
}

class _ProfileSettingsScreenState extends State<ProfileSettingsScreen> {
  bool _pushNotify = true;
  bool _smsNotify = false;
  bool _isChangingPassword = false;

  final List<Map<String, String>> _loginHistory = [
    {'device': 'iPhone 15 Pro Max • iOS 17.4', 'time': 'Hôm nay - 08:12', 'ip': '14.232.12.85 (Hà Nội)'},
    {'device': 'Samsung Galaxy S24 Ultra • Android 14', 'time': '25/05/2026 - 13:45', 'ip': '113.190.45.122 (Hà Nội)'},
    {'device': 'iPad Pro • iPadOS 17.2', 'time': '20/05/2026 - 09:10', 'ip': '27.72.90.15 (Hà Nội)'},
  ];

  Future<void> _updateAvatar(ImageSource source) async {
    final authController = context.read<AuthController>();
    final profileController = context.read<ProfileController>();
    final uid = authController.currentUser?.uid;
    if (uid == null) return;

    await profileController.pickAndUploadAvatar(
      source: source,
      uid: uid,
      onSuccess: (updatedUser) {
        authController.updateCurrentUser(updatedUser);
      },
    );

    if (!mounted) return;
    if (profileController.error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(profileController.error!),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Cập nhật ảnh đại diện thành công!'),
          backgroundColor: Color(0xff10b981),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  Future<void> _removeAvatar() async {
    final authController = context.read<AuthController>();
    final profileController = context.read<ProfileController>();
    final uid = authController.currentUser?.uid;
    if (uid == null) return;

    await profileController.removeAvatar(
      uid: uid,
      onSuccess: (updatedUser) {
        authController.updateCurrentUser(updatedUser);
      },
    );

    if (!mounted) return;
    if (profileController.error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(profileController.error!),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Đã gỡ ảnh đại diện thành công!'),
          backgroundColor: Color(0xff10b981),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  void _handleAvatarUpdate() {
    final hasAvatar = context.read<AuthController>().currentUser?.avatar != null;
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Cập nhật ảnh đại diện',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.onSurface),
              ),
              const SizedBox(height: 20),
              ListTile(
                leading: const Icon(Icons.camera_alt_outlined, color: AppColors.primary),
                title: const Text('Chụp ảnh mới', style: TextStyle(fontWeight: FontWeight.bold)),
                onTap: () {
                  Navigator.pop(context);
                  _updateAvatar(ImageSource.camera);
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_library_outlined, color: AppColors.primary),
                title: const Text('Chọn từ thư viện', style: TextStyle(fontWeight: FontWeight.bold)),
                onTap: () {
                  Navigator.pop(context);
                  _updateAvatar(ImageSource.gallery);
                },
              ),
              if (hasAvatar)
                ListTile(
                  leading: const Icon(Icons.delete_outline, color: AppColors.error),
                  title: const Text('Gỡ ảnh đại diện', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.error)),
                  onTap: () {
                    Navigator.pop(context);
                    _removeAvatar();
                  },
                ),
            ],
          ),
        );
      },
    );
  }

  void _showChangePasswordDialog() {
    final oldPasswordController = TextEditingController();
    final newPasswordController = TextEditingController();
    final confirmPasswordController = TextEditingController();
    final formKey = GlobalKey<FormState>();
    bool isSubmitting = false;
    String? localError;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              title: const Text('ĐỔI MẬT KHẨU', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
              content: Form(
                key: formKey,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (localError != null) ...[
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: AppColors.error.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            localError!,
                            style: const TextStyle(color: AppColors.error, fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(height: 12),
                      ],
                      TextFormField(
                        controller: oldPasswordController,
                        obscureText: true,
                        enabled: !isSubmitting,
                        decoration: const InputDecoration(
                          labelText: 'Mật khẩu cũ',
                          prefixIcon: Icon(Icons.lock_outline),
                        ),
                        validator: (value) => (value == null || value.isEmpty) ? 'Nhập mật khẩu cũ' : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: newPasswordController,
                        obscureText: true,
                        enabled: !isSubmitting,
                        decoration: const InputDecoration(
                          labelText: 'Mật khẩu mới',
                          prefixIcon: Icon(Icons.lock_reset),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) return 'Nhập mật khẩu mới';
                          if (value.length < 6) return 'Mật khẩu tối thiểu 6 ký tự';
                          return null;
                        },
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: confirmPasswordController,
                        obscureText: true,
                        enabled: !isSubmitting,
                        decoration: const InputDecoration(
                          labelText: 'Xác nhận mật khẩu mới',
                          prefixIcon: Icon(Icons.lock_person_outlined),
                        ),
                        validator: (value) {
                          if (value != newPasswordController.text) return 'Mật khẩu xác nhận không khớp';
                          return null;
                        },
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: isSubmitting ? null : () => Navigator.pop(context),
                  child: const Text('HỦY BỎ', style: TextStyle(color: Color(0xff94a3b8), fontWeight: FontWeight.bold)),
                ),
                ElevatedButton(
                  onPressed: isSubmitting
                      ? null
                      : () async {
                          if (!formKey.currentState!.validate()) return;
                          
                          setDialogState(() {
                            isSubmitting = true;
                            localError = null;
                          });

                          final profileController = context.read<ProfileController>();
                          final success = await profileController.changePassword(
                            currentPassword: oldPasswordController.text,
                            newPassword: newPasswordController.text,
                          );

                          if (!mounted) return;

                          if (success) {
                            Navigator.pop(context);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Đổi mật khẩu thành công!'),
                                backgroundColor: Color(0xff10b981),
                                behavior: SnackBarBehavior.floating,
                              ),
                            );
                          } else {
                            setDialogState(() {
                              isSubmitting = false;
                              localError = profileController.error ?? 'Đổi mật khẩu thất bại';
                            });
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: isSubmitting
                      ? const SizedBox(
                          height: 16,
                          width: 16,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text('XÁC NHẬN'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _showLogoutConfirmation() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: const Text('Đăng xuất?', style: TextStyle(fontWeight: FontWeight.w900)),
          content: const Text(
            'Bạn có chắc chắn muốn đăng xuất khỏi phiên làm việc hiện tại không?',
            style: TextStyle(fontWeight: FontWeight.w600, color: Color(0xff64748b), height: 1.4),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('HỦY BỎ', style: TextStyle(color: Color(0xff94a3b8), fontWeight: FontWeight.bold)),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                context.read<AuthController>().logout();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.error,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('ĐĂNG XUẤT'),
            ),
          ],
        );
      },
    );
  }

  void _showLogoutAllConfirmation() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: const Text('Đăng xuất mọi thiết bị?', style: TextStyle(fontWeight: FontWeight.w900)),
          content: const Text(
            'Thao tác này sẽ hủy tất cả các phiên đăng nhập khác của bạn trên các trình duyệt và thiết bị di động khác.',
            style: TextStyle(fontWeight: FontWeight.w600, color: Color(0xff64748b), height: 1.4),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('HỦY BỎ', style: TextStyle(color: Color(0xff94a3b8), fontWeight: FontWeight.bold)),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Đã hủy liên kết tất cả các thiết bị khác!'), backgroundColor: Color(0xff10b981)),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.error,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('HỦY TOÀN BỘ'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final authController = context.watch<AuthController>();
    final user = authController.currentUser;

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text('TÀI KHOẢN & BẢO MẬT'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // 1. Profile header card
            _buildProfileHeaderCard(user),
            const SizedBox(height: 16),

            // 2. Chuyên môn nghề nghiệp
            _buildSpecializationsCard(user),
            const SizedBox(height: 16),

            // 3. Cài đặt bảo mật & Đăng nhập
            _buildSecurityGroup(),
            const SizedBox(height: 16),

            // 4. Lịch sử thiết bị truy cập
            _buildLoginHistoryCard(),
            const SizedBox(height: 16),

            // 5. Thiết lập thông báo
            _buildNotificationSettings(),
            const SizedBox(height: 24),

            // Nút đăng xuất
            SizedBox(
              width: double.infinity,
              height: 56,
              child: OutlinedButton.icon(
                onPressed: _showLogoutConfirmation,
                icon: const Icon(Icons.logout, color: AppColors.error),
                label: const Text(
                  'ĐĂNG XUẤT TÀI KHOẢN',
                  style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w900, letterSpacing: 0.5),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xfffee2e2), width: 2),
                  backgroundColor: const Color(0xfffff5f5),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Phiên bản v1.2.5 (AquaCare KTV Build #1042)',
              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey.shade400, letterSpacing: 0.5),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  void _showEditSpecializationsDialog(AuthUser user) {
    final List<String> allCommonSpecs = [
      'Lắp đặt màng RO',
      'Sửa chữa điện máy',
      'Vệ sinh định kỳ',
      'Kiểm thử nguồn nước',
      'Lắp đặt máy mới',
      'Thay thế lõi lọc định kỳ',
      'Khắc phục rò rỉ nước',
    ];

    List<String> selectedSpecs = List.from(user.specializations ?? []);

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              title: const Text('CHỌN CHUYÊN MÔN', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: allCommonSpecs.map((spec) {
                    final isSelected = selectedSpecs.contains(spec);
                    return CheckboxListTile(
                      title: Text(spec, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                      value: isSelected,
                      activeColor: AppColors.primary,
                      onChanged: (checked) {
                        setDialogState(() {
                          if (checked == true) {
                            selectedSpecs.add(spec);
                          } else {
                            selectedSpecs.remove(spec);
                          }
                        });
                      },
                    );
                  }).toList(),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('HỦY BỎ', style: TextStyle(color: Color(0xff94a3b8), fontWeight: FontWeight.bold)),
                ),
                ElevatedButton(
                  onPressed: () async {
                    final authController = context.read<AuthController>();
                    final profileController = context.read<ProfileController>();
                    
                    Navigator.pop(context);

                    final success = await profileController.updateSpecializations(
                      uid: user.uid,
                      specializations: selectedSpecs,
                      onSuccess: (updatedUser) {
                        authController.updateCurrentUser(updatedUser);
                      },
                    );

                    if (!mounted) return;
                    if (success) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Cập nhật chuyên môn thành công!'),
                          backgroundColor: Color(0xff10b981),
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(profileController.error ?? 'Lỗi không xác định'),
                          backgroundColor: AppColors.error,
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('XÁC NHẬN'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Widget _buildProfileHeaderCard(dynamic user) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xfff1f5f9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Stack(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: AppColors.primary.withOpacity(0.1),
                    backgroundImage: user?.avatar != null ? NetworkImage(user!.avatar!) : null,
                    child: user?.avatar == null
                        ? const Icon(Icons.person, color: AppColors.primary, size: 40)
                        : null,
                  ),
                  Positioned(
                    right: 0,
                    bottom: 0,
                    child: InkWell(
                      onTap: _handleAvatarUpdate,
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: const BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.camera_alt, color: Colors.white, size: 14),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 20),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user?.displayName ?? 'Kỹ thuật viên',
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.onSurface),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      user?.email ?? 'tech@aquacare.com',
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xff64748b)),
                    ),
                    Text(
                      user?.phoneNumber ?? 'Chưa cập nhật SĐT',
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xff64748b)),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const EditProfileScreen()),
                  );
                },
                icon: const Icon(Icons.edit_outlined, color: AppColors.primary),
              ),
            ],
          ),
          if (user?.address != null && user!.address!.isNotEmpty) ...[
            const Divider(height: 24, color: Color(0xfff1f5f9)),
            Row(
              children: [
                const Icon(Icons.location_on_outlined, color: Color(0xff64748b), size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    user.address!,
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xff64748b)),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSpecializationsCard(dynamic user) {
    final List<String> specs = (user?.specializations as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [];

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xfff1f5f9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'CHUYÊN MÔN NGHỀ NGHIỆP',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xff94a3b8), letterSpacing: 1.0),
              ),
              if (user != null)
                IconButton(
                  onPressed: () => _showEditSpecializationsDialog(user),
                  icon: const Icon(Icons.edit_outlined, color: AppColors.primary, size: 18),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
            ],
          ),
          const SizedBox(height: 12),
          specs.isEmpty
              ? const Text(
                  'Chưa cập nhật chuyên môn nghề nghiệp',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xff94a3b8), fontStyle: FontStyle.italic),
                )
              : Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: specs.map((s) {
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        s,
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.primary),
                      ),
                    );
                  }).toList(),
                ),
        ],
      ),
    );
  }

  Widget _buildSecurityGroup() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xfff1f5f9)),
      ),
      child: Column(
        children: [
          ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
            leading: const Icon(Icons.key, color: AppColors.primary),
            title: const Text('Thay đổi mật khẩu', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            trailing: const Icon(Icons.chevron_right),
            onTap: _showChangePasswordDialog,
          ),
          const Divider(height: 1, color: Color(0xfff1f5f9)),
          ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
            leading: const Icon(Icons.phonelink_erase, color: AppColors.error),
            title: const Text('Đăng xuất các thiết bị khác', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.error)),
            trailing: const Icon(Icons.chevron_right, color: AppColors.error),
            onTap: _showLogoutAllConfirmation,
          ),
        ],
      ),
    );
  }

  Widget _buildLoginHistoryCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xfff1f5f9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'LỊCH SỬ ĐĂNG NHẬP (3 PHIÊN GẦN NHẤT)',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xff94a3b8), letterSpacing: 1.0),
          ),
          const SizedBox(height: 12),
          ..._loginHistory.map((item) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                children: [
                  const Icon(Icons.phonelink_setup, color: Color(0xff64748b), size: 18),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item['device']!,
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.onSurface),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${item['time']} • IP: ${item['ip']}',
                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xff94a3b8)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildNotificationSettings() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xfff1f5f9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'CẤU HÌNH THÔNG BÁO',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xff94a3b8), letterSpacing: 1.0),
          ),
          const SizedBox(height: 8),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('Thông báo đẩy (App)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            subtitle: const Text('Báo lịch phân công, thay đổi lịch hẹn nhanh', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xff94a3b8))),
            value: _pushNotify,
            activeColor: AppColors.primary,
            onChanged: (value) => setState(() => _pushNotify = value),
          ),
          const Divider(height: 1, color: Color(0xfff1f5f9)),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('Thông báo SMS khẩn cấp', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            subtitle: const Text('Tự động gửi tin nhắn SMS khi được điều chuyển ca lắp khẩn', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xff94a3b8))),
            value: _smsNotify,
            activeColor: AppColors.primary,
            onChanged: (value) => setState(() => _smsNotify = value),
          ),
        ],
      ),
    );
  }
}
