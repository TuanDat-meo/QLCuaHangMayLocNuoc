import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class Environment {
  // Firebase Configuration
  static String get firebaseApiKey => dotenv.get('FIREBASE_API_KEY', fallback: '');
  static String get firebaseProjectId => dotenv.get('FIREBASE_PROJECT_ID', fallback: '');
  static String get firebaseAuthDomain => dotenv.get('FIREBASE_AUTH_DOMAIN', fallback: '');
  static String get firebaseStorageBucket => dotenv.get('FIREBASE_STORAGE_BUCKET', fallback: '');
  static String get firebaseMessagingSenderId => dotenv.get('FIREBASE_MESSAGING_SENDER_ID', fallback: '');

  // App Configuration
  static String get appEnvironment => dotenv.get('APP_ENVIRONMENT', fallback: 'development');
  
  static String get apiBaseUrl {
    final url = dotenv.get('API_BASE_URL', fallback: 'http://localhost:5000');
    // Tự động chuyển đổi localhost hoặc 127.0.0.1 sang IP cổng máy ảo Android (10.0.2.2)
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      if (url.contains('localhost')) {
        return url.replaceAll('localhost', '10.0.2.2');
      } else if (url.contains('127.0.0.1')) {
        return url.replaceAll('127.0.0.1', '10.0.2.2');
      }
    }
    return url;
  }

  static String get logLevel => dotenv.get('LOG_LEVEL', fallback: 'debug');

  // Feature Flags
  static bool get enableAnalytics => dotenv.get('ENABLE_ANALYTICS', fallback: 'false') == 'true';
  static bool get enableCrashReporting => dotenv.get('ENABLE_CRASH_REPORTING', fallback: 'false') == 'true';

  // Google Maps
  static String get googleMapsApiKey => dotenv.get('GOOGLE_MAPS_API_KEY', fallback: '');

  // Getters
  static bool get isProduction => appEnvironment == 'production';
  static bool get isDevelopment => appEnvironment == 'development';
}
