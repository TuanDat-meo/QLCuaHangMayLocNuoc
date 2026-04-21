// Flutter Form Validation Utilities

class ValidationError {
  final String field;
  final String message;

  ValidationError({required this.field, required this.message});
}

class ValidationRules {
  static const String emailRequired = 'Email là bắt buộc';
  static const String emailInvalid = 'Email không hợp lệ';

  static const String passwordRequired = 'Mật khẩu là bắt buộc';
  static const String passwordTooShort = 'Mật khẩu phải có ít nhất 8 ký tự';
  static const String passwordWeak =
      'Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt';

  static const String confirmPasswordRequired = 'Xác nhận mật khẩu là bắt buộc';
  static const String confirmPasswordMismatch = 'Mật khẩu không khớp';

  static const String displayNameRequired = 'Họ tên là bắt buộc';
  static const String displayNameTooShort = 'Họ tên phải có ít nhất 2 ký tự';
  static const String displayNameTooLong =
      'Họ tên không được vượt quá 50 ký tự';

  static const String phoneNumberRequired = 'Số điện thoại là bắt buộc';
  static const String phoneNumberInvalid = 'Số điện thoại không hợp lệ (Việt Nam)';

  static const String roleRequired = 'Vị trí là bắt buộc';
}

class FormValidator {
  static const String _emailRegex =
      r'^[^\s@]+@[^\s@]+\.[^\s@]+$';
  static const String _phoneRegex =
      r'^(\+84|0)[0-9]{9,10}$'; // Vietnam phone
  static const String _passwordRegex =
      r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]';

  static const int _passwordMinLength = 8;
  static const int _displayNameMinLength = 2;
  static const int _displayNameMaxLength = 50;

  /// Validate email
  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return ValidationRules.emailRequired;
    }
    final regex = RegExp(_emailRegex);
    if (!regex.hasMatch(value)) {
      return ValidationRules.emailInvalid;
    }
    return null;
  }

  /// Validate password
  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return ValidationRules.passwordRequired;
    }
    if (value.length < _passwordMinLength) {
      return ValidationRules.passwordTooShort;
    }
    final regex = RegExp(_passwordRegex);
    if (!regex.hasMatch(value)) {
      return ValidationRules.passwordWeak;
    }
    return null;
  }

  /// Validate confirm password
  static String? validateConfirmPassword(String? value, String password) {
    if (value == null || value.isEmpty) {
      return ValidationRules.confirmPasswordRequired;
    }
    if (value != password) {
      return ValidationRules.confirmPasswordMismatch;
    }
    return null;
  }

  /// Validate display name
  static String? validateDisplayName(String? value) {
    if (value == null || value.isEmpty) {
      return ValidationRules.displayNameRequired;
    }
    if (value.length < _displayNameMinLength) {
      return ValidationRules.displayNameTooShort;
    }
    if (value.length > _displayNameMaxLength) {
      return ValidationRules.displayNameTooLong;
    }
    return null;
  }

  /// Validate phone number (Vietnam format)
  static String? validatePhoneNumber(String? value) {
    if (value == null || value.isEmpty) {
      return ValidationRules.phoneNumberRequired;
    }
    final regex = RegExp(_phoneRegex);
    if (!regex.hasMatch(value)) {
      return ValidationRules.phoneNumberInvalid;
    }
    return null;
  }

  /// Validate role
  static String? validateRole(String? value) {
    if (value == null || value.isEmpty) {
      return ValidationRules.roleRequired;
    }
    if (!['customer', 'technician', 'admin'].contains(value)) {
      return 'Vị trí không hợp lệ';
    }
    return null;
  }

  /// Validate login form
  static List<ValidationError> validateLoginForm({
    required String email,
    required String password,
  }) {
    final errors = <ValidationError>[];

    final emailError = validateEmail(email);
    if (emailError != null) {
      errors.add(ValidationError(field: 'email', message: emailError));
    }

    final passwordError = validatePassword(password);
    if (passwordError != null) {
      errors.add(ValidationError(field: 'password', message: passwordError));
    }

    return errors;
  }

  /// Validate signup form
  static List<ValidationError> validateSignupForm({
    required String email,
    required String password,
    required String confirmPassword,
    required String displayName,
    required String phoneNumber,
    required String role,
  }) {
    final errors = <ValidationError>[];

    final emailError = validateEmail(email);
    if (emailError != null) {
      errors.add(ValidationError(field: 'email', message: emailError));
    }

    final passwordError = validatePassword(password);
    if (passwordError != null) {
      errors.add(ValidationError(field: 'password', message: passwordError));
    }

    final confirmPasswordError = validateConfirmPassword(confirmPassword, password);
    if (confirmPasswordError != null) {
      errors.add(
        ValidationError(field: 'confirmPassword', message: confirmPasswordError),
      );
    }

    final displayNameError = validateDisplayName(displayName);
    if (displayNameError != null) {
      errors.add(
        ValidationError(field: 'displayName', message: displayNameError),
      );
    }

    final phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError != null) {
      errors.add(ValidationError(field: 'phoneNumber', message: phoneError));
    }

    final roleError = validateRole(role);
    if (roleError != null) {
      errors.add(ValidationError(field: 'role', message: roleError));
    }

    return errors;
  }

  /// Validate reset password form
  static List<ValidationError> validateResetPasswordForm({
    required String newPassword,
    required String confirmPassword,
  }) {
    final errors = <ValidationError>[];

    final passwordError = validatePassword(newPassword);
    if (passwordError != null) {
      errors.add(
        ValidationError(field: 'newPassword', message: passwordError),
      );
    }

    final confirmPasswordError =
        validateConfirmPassword(confirmPassword, newPassword);
    if (confirmPasswordError != null) {
      errors.add(
        ValidationError(
          field: 'confirmPassword',
          message: confirmPasswordError,
        ),
      );
    }

    return errors;
  }
}
