import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

/// Widget TextFormField chuẩn hóa cho toàn bộ màn hình Auth.
///
/// Tính năng:
/// - Real-time validation khi người dùng thay đổi giá trị
/// - Hiển thị lỗi bên dưới border ngay lập tức
/// - Icon prefix, toggle show/hide password
/// - Border đỏ khi có lỗi, xanh khi focus
class AuthTextField extends StatefulWidget {
  final TextEditingController controller;
  final String label;
  final String hintText;
  final IconData prefixIcon;
  final bool isPassword;
  final TextInputType keyboardType;
  final String? Function(String?) validator;
  final ValueChanged<String>? onChanged;
  final TextInputAction textInputAction;
  final FocusNode? focusNode;
  final FocusNode? nextFocusNode;

  const AuthTextField({
    super.key,
    required this.controller,
    required this.label,
    required this.hintText,
    required this.prefixIcon,
    required this.validator,
    this.isPassword = false,
    this.keyboardType = TextInputType.text,
    this.onChanged,
    this.textInputAction = TextInputAction.next,
    this.focusNode,
    this.nextFocusNode,
  });

  @override
  State<AuthTextField> createState() => _AuthTextFieldState();
}

class _AuthTextFieldState extends State<AuthTextField> {
  bool _obscureText = true;
  String? _errorText;
  bool _touched = false;

  void _validate(String value) {
    final error = widget.validator(value.isEmpty ? null : value);
    setState(() => _errorText = error);
  }

  @override
  Widget build(BuildContext context) {
    final hasError = _touched && _errorText != null && _errorText!.isNotEmpty;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Label
        Text(
          widget.label,
          style: AppTextStyles.labelSm.copyWith(
            fontWeight: FontWeight.w600,
            color: AppColors.onSurface,
          ),
        ),
        const SizedBox(height: 6),

        // Input field
        TextFormField(
          controller: widget.controller,
          focusNode: widget.focusNode,
          obscureText: widget.isPassword && _obscureText,
          keyboardType: widget.keyboardType,
          textInputAction: widget.textInputAction,
          style: AppTextStyles.bodyMd,
          onChanged: (value) {
            if (_touched) _validate(value);
            widget.onChanged?.call(value);
          },
          onTap: () {
            if (!_touched) setState(() => _touched = true);
          },
          onEditingComplete: () {
            setState(() => _touched = true);
            _validate(widget.controller.text);
            if (widget.nextFocusNode != null) {
              FocusScope.of(context).requestFocus(widget.nextFocusNode);
            } else {
              FocusScope.of(context).unfocus();
            }
          },
          onFieldSubmitted: (_) {
            setState(() => _touched = true);
            _validate(widget.controller.text);
          },
          decoration: InputDecoration(
            hintText: widget.hintText,
            hintStyle: AppTextStyles.bodyMd.copyWith(
              color: AppColors.outline,
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 14,
            ),
            prefixIcon: Icon(
              widget.prefixIcon,
              size: 20,
              color: hasError ? AppColors.error : AppColors.outline,
            ),
            suffixIcon: widget.isPassword
                ? IconButton(
                    icon: Icon(
                      _obscureText
                          ? Icons.visibility_outlined
                          : Icons.visibility_off_outlined,
                      size: 20,
                      color: AppColors.outline,
                    ),
                    onPressed: () {
                      setState(() => _obscureText = !_obscureText);
                    },
                  )
                : null,
            filled: true,
            fillColor: AppColors.surfaceContainerLowest,
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: hasError ? AppColors.error : AppColors.outlineVariant,
                width: 1.5,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: hasError ? AppColors.error : AppColors.primary,
                width: 2,
              ),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.error, width: 1.5),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.error, width: 2),
            ),
            // Ẩn error message mặc định của TextFormField (chúng ta tự render)
            errorStyle: const TextStyle(height: 0, fontSize: 0),
          ),
        ),

        // Custom error message bên dưới border
        if (hasError)
          Padding(
            padding: const EdgeInsets.only(top: 4, left: 4),
            child: Row(
              children: [
                const Icon(
                  Icons.error_outline,
                  size: 12,
                  color: AppColors.error,
                ),
                const SizedBox(width: 4),
                Text(
                  _errorText!,
                  style: AppTextStyles.errorText,
                ),
              ],
            ),
          ),
      ],
    );
  }

  /// Gọi từ bên ngoài để trigger validate (ví dụ khi submit)
  String? validateAndReturn() {
    setState(() => _touched = true);
    _validate(widget.controller.text);
    return _errorText;
  }
}
