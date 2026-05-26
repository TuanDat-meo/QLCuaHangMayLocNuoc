/// Auth models for technician app
/// Re-export AuthUser from shared package for use across the app
library;

import 'package:shared/services/auth_service.dart';
export 'package:shared/services/auth_service.dart'
    show AuthUser, AuthException, UserRoles;

class LoginRequest {
  final String email;
  final String password;

  LoginRequest({
    required this.email,
    required this.password,
  });

  Map<String, dynamic> toJson() => {
        'email': email,
        'password': password,
      };
}

class SignupRequest {
  final String email;
  final String password;
  final String displayName;
  final String phoneNumber;
  final int role;

  SignupRequest({
    required this.email,
    required this.password,
    required this.displayName,
    required this.phoneNumber,
    this.role = UserRoles.technician, // Default role for technician app
  });

  Map<String, dynamic> toJson() => {
        'email': email,
        'password': password,
        'displayName': displayName,
        'phoneNumber': phoneNumber,
        'role': role,
      };
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

  factory AuthResponse.fromJson(Map<String, dynamic> json) => AuthResponse(
        success: json['success'] ?? false,
        message: json['message'] ?? '',
        userId: json['userId'],
      );

  Map<String, dynamic> toJson() => {
        'success': success,
        'message': message,
        'userId': userId,
      };
}
