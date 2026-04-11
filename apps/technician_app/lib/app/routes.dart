import 'package:go_router/go_router.dart';
import '../views/auth/login_screen.dart';
import '../views/job/job_list_screen.dart';

final appRouter = GoRouter(
  initialLocation: '/login',
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/jobs',
      builder: (context, state) => const JobListScreen(),
    ),
  ],
);
