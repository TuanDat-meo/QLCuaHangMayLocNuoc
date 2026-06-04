import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:provider/provider.dart';
import 'package:shared/theme/app_colors.dart';
import 'package:shared/theme/app_text_styles.dart';
import 'firebase_options.dart';
import 'core/routing/auth_routing.dart';
import 'controllers/auth_controller.dart';
import 'controllers/job_controller.dart';
import 'controllers/profile_controller.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Khởi tạo locale tiếng Việt cho intl/DateFormat
  await initializeDateFormatting('vi_VN', null);

  // Load environment configuration
  await dotenv.load();

  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  print('✅ Firebase initialized - connecting to production (aquacaresystem0608)');

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthController()),
        ChangeNotifierProvider(create: (_) => JobController()),
        ChangeNotifierProvider(create: (_) => ProfileController()),
      ],
      child: MaterialApp(
        title: 'AquaCare - Technician App',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          fontFamily: 'Inter',
          colorScheme: ColorScheme.fromSeed(
            seedColor: AppColors.primary,
            primary: AppColors.primary,
            secondary: AppColors.secondary,
            surface: AppColors.surface,
          ),
          scaffoldBackgroundColor: AppColors.surface,
          appBarTheme: const AppBarTheme(
            backgroundColor: Colors.white,
            elevation: 0,
            centerTitle: true,
            iconTheme: IconThemeData(color: AppColors.onSurface),
            titleTextStyle: TextStyle(
              color: AppColors.onSurface,
              fontFamily: 'Inter',
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              padding: const EdgeInsets.symmetric(vertical: 16),
              textStyle: const TextStyle(
                fontFamily: 'Inter',
                fontWeight: FontWeight.w900, 
                fontSize: 14,
                letterSpacing: 1.2,
              ),
            ),
          ),
          inputDecorationTheme: InputDecorationTheme(
            filled: true,
            fillColor: const Color(0xfff8fafc),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
            hintStyle: const TextStyle(color: Color(0xffcbd5e1), fontSize: 14, fontFamily: 'Inter'),
            labelStyle: const TextStyle(color: Color(0xff64748b), fontSize: 14, fontFamily: 'Inter'),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(20),
              borderSide: const BorderSide(color: Color(0xfff1f5f9), width: 2),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(20),
              borderSide: const BorderSide(color: Color(0xfff1f5f9), width: 2),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(20),
              borderSide: const BorderSide(color: AppColors.primary, width: 2),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(20),
              borderSide: const BorderSide(color: AppColors.error, width: 2),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(20),
              borderSide: const BorderSide(color: AppColors.error, width: 2),
            ),
          ),
        ),
        home: const AuthGate(),
        onGenerateRoute: authRouteGenerator,
      ),
    );
  }
}
