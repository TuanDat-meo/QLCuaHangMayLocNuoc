import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

/// Smart submit button cho màn hình Auth.
///
/// Tính năng:
/// - Disabled (xám) khi [isEnabled] = false
/// - Enabled (primary/secondary) khi [isEnabled] = true
/// - Loading state với spinner
/// - Smooth animation transition
class AuthSubmitButton extends StatelessWidget {
  final String label;
  final bool isEnabled;
  final bool isLoading;
  final VoidCallback? onPressed;
  final Color? activeColor;

  const AuthSubmitButton({
    super.key,
    required this.label,
    required this.isEnabled,
    this.isLoading = false,
    this.onPressed,
    this.activeColor,
  });

  @override
  Widget build(BuildContext context) {
    final bool canPress = isEnabled && !isLoading;
    final Color buttonColor = canPress
        ? (activeColor ?? AppColors.primary)
        : AppColors.outlineVariant;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeInOut,
      width: double.infinity,
      height: 52,
      child: ElevatedButton(
        onPressed: canPress ? onPressed : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: buttonColor,
          disabledBackgroundColor: buttonColor,
          foregroundColor: AppColors.onPrimary,
          disabledForegroundColor: AppColors.onPrimary.withOpacity(0.7),
          elevation: canPress ? 2 : 0,
          shadowColor: AppColors.primary.withOpacity(0.3),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: isLoading
            ? const SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  valueColor:
                      AlwaysStoppedAnimation<Color>(AppColors.onPrimary),
                ),
              )
            : Text(
                label,
                style: AppTextStyles.bodyMd.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppColors.onPrimary,
                ),
              ),
      ),
    );
  }
}
