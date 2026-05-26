import 'package:flutter/material.dart';
import 'package:shared/services/auth_service.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/signup_screen.dart';
import '../../features/auth/screens/forgot_password_screen.dart';
import '../../features/auth/screens/reset_password_screen.dart';
import '../../features/auth/screens/force_change_password_screen.dart';
import '../../features/navigation/main_navigation.dart';
import '../../features/job_detail/screens/job_detail_screen.dart';
import '../../features/job_detail/screens/complete_installation_screen.dart';
import '../../features/job_detail/screens/report_issue_screen.dart';
import '../../features/job_detail/screens/navigation_view_screen.dart';

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<AuthUser?>(
      stream: AuthService().currentUserStream,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        // Nếu đã đăng nhập và đã được duyệt
        if (snapshot.hasData && snapshot.data != null && snapshot.data!.isVerified) {
          return const MainNavigation();
        }

        // Nếu chưa đăng nhập hoặc chưa được duyệt
        return const LoginScreen();
      },
    );
  }
}

Route<dynamic>? authRouteGenerator(RouteSettings settings) {
  switch (settings.name) {
    case '/login':
      return MaterialPageRoute(builder: (_) => const LoginScreen());
    case '/signup':
      return MaterialPageRoute(builder: (_) => const SignupScreen());
    case '/forgot-password':
      return MaterialPageRoute(builder: (_) => const ForgotPasswordScreen());
    case '/reset-password':
      final args = settings.arguments as Map<String, dynamic>?;
      final code = args?['code'] as String? ?? '';
      return MaterialPageRoute(
        builder: (_) => ResetPasswordScreen(code: code),
      );
    case '/force-change-password':
      return MaterialPageRoute(builder: (_) => const ForceChangePasswordScreen());
    case '/dashboard':
      return MaterialPageRoute(builder: (_) => const MainNavigation());
    case '/job-detail':
      final jobId = settings.arguments as String? ?? '';
      return MaterialPageRoute(builder: (_) => JobDetailScreen(jobId: jobId));
    case '/complete-installation':
      final jobId = settings.arguments as String? ?? '';
      return MaterialPageRoute(builder: (_) => CompleteInstallationScreen(jobId: jobId));
    case '/report-issue':
      final jobId = settings.arguments as String? ?? '';
      return MaterialPageRoute(builder: (_) => ReportIssueScreen(jobId: jobId));
    case '/navigation':
      final jobId = settings.arguments as String? ?? '';
      return MaterialPageRoute(builder: (_) => NavigationViewScreen(jobId: jobId));
    default:
      return MaterialPageRoute(
        builder: (_) => const Scaffold(
          body: Center(child: Text('Đường dẫn không tồn tại')),
        ),
      );
  }
}
