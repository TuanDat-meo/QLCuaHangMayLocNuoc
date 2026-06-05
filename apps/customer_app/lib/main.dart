import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';
import 'firebase_options.dart';
import 'core/routing/auth_routing.dart';
import 'core/routing/main_router.dart';
import 'controllers/auth_controller.dart';
import 'controllers/product_controller.dart';
import 'controllers/cart_controller.dart';
import 'controllers/order_controller.dart';
import 'controllers/notification_controller.dart';
import 'controllers/favorites_controller.dart';
import 'package:intl/date_symbol_data_local.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Load environment configuration
  await dotenv.load();
  
  // Initialize Firebase with safety check
  try {
    if (Firebase.apps.isEmpty) {
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );
    }
  } catch (e) {
    debugPrint("Firebase initialization error: $e");
  }

  await initializeDateFormatting('vi', null);
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthController()),
        ChangeNotifierProvider(create: (_) => ProductController()),
        ChangeNotifierProvider(create: (_) => CartController()),
        ChangeNotifierProvider(create: (_) => OrderController()),
        ChangeNotifierProvider(create: (_) => NotificationController()),
        ChangeNotifierProxyProvider<AuthController, FavoritesController>(
          create: (context) => FavoritesController(context.read<AuthController>()),
          update: (context, auth, favorites) => FavoritesController(auth),
        ),
      ],
      child: MaterialApp(
        title: 'AquaCare - Customer App',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xff00459a),
            primary: const Color(0xff00459a),
            secondary: const Color(0xff0b1c30),
            surface: const Color(0xfff8fafc),
          ),
          scaffoldBackgroundColor: const Color(0xfff8fafc),
          appBarTheme: const AppBarTheme(
            backgroundColor: Colors.white,
            elevation: 0,
            centerTitle: true,
            iconTheme: IconThemeData(color: Color(0xff0b1c30)),
            titleTextStyle: TextStyle(
              color: Color(0xff0b1c30),
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xff00459a),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              padding: const EdgeInsets.symmetric(vertical: 16),
              textStyle: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
            ),
          ),
        ),
        home: const AuthGate(),
        onGenerateRoute: (settings) {
          final mainRoute = mainRouteGenerator(settings);
          if (mainRoute != null) return mainRoute;
          return authRouteGenerator(settings);
        },
      ),
    );
  }
}
