// Flutter Auth Routing Handler
// Integrate this into your main.dart for navigation

import 'package:flutter/material.dart' as flutter_material;
import 'package:shared/services/auth_service.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/signup_screen.dart';
import '../../features/auth/screens/forgot_password_screen.dart';
import '../../features/auth/screens/reset_password_screen.dart';
import '../../features/home/screens/home_screen.dart';

/// AuthGate widget to handle auth state and routing
class AuthGate extends flutter_material.StatelessWidget {
  const AuthGate({super.key});

  @override
  flutter_material.Widget build(flutter_material.BuildContext context) {
    return flutter_material.StreamBuilder<AuthUser?>(
      stream: AuthService().currentUserStream,
      builder: (context, snapshot) {
        // Loading state
        if (snapshot.connectionState == flutter_material.ConnectionState.waiting) {
          return flutter_material.Scaffold(
            body: flutter_material.Center(
              child: flutter_material.Column(
                mainAxisAlignment: flutter_material.MainAxisAlignment.center,
                children: [
                  flutter_material.CircularProgressIndicator(
                    valueColor: flutter_material.AlwaysStoppedAnimation<flutter_material.Color>(
                      flutter_material.Colors.indigo.shade600,
                    ),
                  ),
                  const flutter_material.SizedBox(height: 16),
                  const flutter_material.Text('Đang tải...'),
                ],
              ),
            ),
          );
        }

        // User is logged in
        if (snapshot.hasData && snapshot.data != null) {
          return const HomeScreen();
        }

        // User is not logged in - show login screen
        return const LoginScreen();
      },
    );
  }
}

/// Route generator for auth screens
flutter_material.Route<dynamic>? authRouteGenerator(flutter_material.RouteSettings settings) {
  switch (settings.name) {
    case '/login':
      return flutter_material.MaterialPageRoute(builder: (_) => const LoginScreen());
    case '/signup':
      return flutter_material.MaterialPageRoute(builder: (_) => const SignupScreen());
    case '/forgot-password':
      return flutter_material.MaterialPageRoute(builder: (_) => const ForgotPasswordScreen());
    case '/reset-password':
      // Extract code from arguments
      final args = settings.arguments as Map<String, dynamic>?;
      final code = args?['code'] as String? ?? '';
      return flutter_material.MaterialPageRoute(
        builder: (_) => ResetPasswordScreen(code: code),
      );
    case '/dashboard':
      // TODO: Implement your dashboard screen
      return flutter_material.MaterialPageRoute(
        builder: (_) => const flutter_material.Scaffold(
          body: flutter_material.Center(child: flutter_material.Text('Dashboard')),
        ),
      );
    default:
      return null;
  }
}
