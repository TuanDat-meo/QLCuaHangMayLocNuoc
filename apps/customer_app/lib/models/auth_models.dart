/// Auth models for customer app
class LoginRequest {
  final String email;
  final String password;

  LoginRequest({
    required this.email,
    required this.password,
  });
}

class SignupRequest {
  final String email;
  final String password;
  final String displayName;
  final String phoneNumber;
  final String role;

  SignupRequest({
    required this.email,
    required this.password,
    required this.displayName,
    required this.phoneNumber,
    this.role = 'customer', // Default role for customer app
  });
}

class AuthResponse {
  final bool success;
  final String message;
  final String? userId;

  AuthResponse({
    required this.success,
    required this.message,
    this.userId,
  });
}
