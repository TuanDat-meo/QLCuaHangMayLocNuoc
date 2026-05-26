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
  static String get apiBaseUrl => dotenv.get('API_BASE_URL', fallback: 'http://localhost:5000');
  static String get logLevel => dotenv.get('LOG_LEVEL', fallback: 'debug');

  // Feature Flags
  static bool get enableAnalytics => dotenv.get('ENABLE_ANALYTICS', fallback: 'false') == 'true';
  static bool get enableCrashReporting => dotenv.get('ENABLE_CRASH_REPORTING', fallback: 'false') == 'true';

  // Getters
  static bool get isProduction => appEnvironment == 'production';
  static bool get isDevelopment => appEnvironment == 'development';
}
