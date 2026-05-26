import 'package:flutter/material.dart';

/// Technician App Color Palette
/// Matches Customer App design system for consistency
class AppColors {
  // Primary Colors
  static const Color primaryBlue = Color(0xff00459a);      // #00459A
  static const Color darkNavy = Color(0xff0b1c30);          // #0B1C30
  static const Color lightGray = Color(0xfff8fafc);         // #F8FAFC

  // Status Colors
  static const Color statusWaiting = Color(0xffFFA500);    // Orange
  static const Color statusOnWay = Color(0xff00459a);      // Blue
  static const Color statusArrived = Color(0xff3B82F6);    // Light Blue
  static const Color statusInstalling = Color(0xff7C3AED); // Purple
  static const Color statusCompleted = Color(0xff10B981);  // Green
  static const Color statusNeedSupport = Color(0xffEF4444); // Red

  // Text & Neutral
  static const Color textPrimary = Color(0xff0b1c30);      // Dark Navy
  static const Color textSecondary = Color(0xff64748b);    // Gray
  static const Color borderColor = Color(0xffe2e8f0);      // Light border
  static const Color errorColor = Color(0xffEF4444);       // Red
  static const Color warningColor = Color(0xffFFA500);     // Orange
  static const Color successColor = Color(0xff10B981);     // Green

  // Background
  static const Color surfaceBackground = Color(0xfff8fafc);
  static const Color cardBackground = Colors.white;
  static const Color disabledBackground = Color(0xfff1f5f9);

  // Shadow
  static const Color shadowColor = Color(0x0a000000);
}

/// Text Styles
class AppTypography {
  // Heading Styles
  static const TextStyle heading1 = TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.w900,
    color: AppColors.darkNavy,
    letterSpacing: -0.5,
    height: 1.2,
  );

  static const TextStyle heading2 = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.w900,
    color: AppColors.darkNavy,
    height: 1.3,
  );

  static const TextStyle heading3 = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w900,
    color: AppColors.darkNavy,
    height: 1.4,
  );

  static const TextStyle heading4 = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w700,
    color: AppColors.darkNavy,
    height: 1.4,
  );

  // Body Styles
  static const TextStyle bodyLarge = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
    height: 1.5,
  );

  static const TextStyle bodyMedium = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
    height: 1.5,
  );

  static const TextStyle bodySmall = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AppColors.textSecondary,
    height: 1.5,
  );

  // Caption Styles
  static const TextStyle caption = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w400,
    color: AppColors.textSecondary,
    height: 1.4,
  );

  // Button Text
  static const TextStyle buttonLarge = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w900,
    color: Colors.white,
    height: 1.3,
  );

  static const TextStyle buttonMedium = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w700,
    color: Colors.white,
    height: 1.3,
  );

  static const TextStyle buttonSmall = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w700,
    color: Colors.white,
    height: 1.3,
  );
}

/// Spacing System (8px base grid)
class AppSpacing {
  static const double spacing2 = 2;
  static const double spacing4 = 4;
  static const double spacing6 = 6;
  static const double spacing8 = 8;
  static const double spacing12 = 12;
  static const double spacing16 = 16;
  static const double spacing20 = 20;
  static const double spacing24 = 24;
  static const double spacing32 = 32;
  static const double spacing40 = 40;
  static const double spacing48 = 48;
  static const double spacing56 = 56;
  static const double spacing64 = 64;
}

/// Border Radius
class AppRadius {
  static const double small = 8;     // Small elements
  static const double medium = 12;   // Inputs, buttons
  static const double large = 16;    // Cards, large components
  static const double xl = 24;       // Extra large components
  static const double full = 999;    // Circular (use for chips, avatars)
}

/// App Theme Configuration
class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primaryBlue,
        primary: AppColors.primaryBlue,
        secondary: AppColors.darkNavy,
        surface: AppColors.lightGray,
        error: AppColors.errorColor,
      ),
      scaffoldBackgroundColor: AppColors.lightGray,
      cardColor: AppColors.cardBackground,
      
      // AppBar Theme
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: AppColors.darkNavy),
        titleTextStyle: AppTypography.heading3,
      ),

      // Elevated Button Theme
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primaryBlue,
          foregroundColor: Colors.white,
          disabledBackgroundColor: AppColors.disabledBackground,
          disabledForegroundColor: AppColors.textSecondary,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.large),
          ),
          padding: const EdgeInsets.symmetric(
            vertical: AppSpacing.spacing16,
            horizontal: AppSpacing.spacing24,
          ),
          textStyle: AppTypography.buttonLarge,
          elevation: 2,
          shadowColor: AppColors.primaryBlue.withAlpha(77), // 0.3 * 255
        ),
      ),

      // Outlined Button Theme
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primaryBlue,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.large),
          ),
          padding: const EdgeInsets.symmetric(
            vertical: AppSpacing.spacing16,
            horizontal: AppSpacing.spacing24,
          ),
          textStyle: AppTypography.buttonLarge.copyWith(
            color: AppColors.primaryBlue,
          ),
          side: const BorderSide(
            color: AppColors.primaryBlue,
            width: 2,
          ),
        ),
      ),

      // Input Decoration Theme
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(
          vertical: AppSpacing.spacing12,
          horizontal: AppSpacing.spacing16,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.medium),
          borderSide: const BorderSide(color: AppColors.borderColor),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.medium),
          borderSide: const BorderSide(color: AppColors.borderColor),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.medium),
          borderSide: const BorderSide(
            color: AppColors.primaryBlue,
            width: 2,
          ),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.medium),
          borderSide: const BorderSide(color: AppColors.errorColor),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.medium),
          borderSide: const BorderSide(
            color: AppColors.errorColor,
            width: 2,
          ),
        ),
        hintStyle: AppTypography.bodyMedium.copyWith(
          color: AppColors.textSecondary,
        ),
        labelStyle: AppTypography.bodyMedium.copyWith(
          color: AppColors.darkNavy,
        ),
        errorStyle: AppTypography.bodySmall.copyWith(
          color: AppColors.errorColor,
        ),
        prefixIconColor: AppColors.textSecondary,
        suffixIconColor: AppColors.textSecondary,
      ),

      // Bottom Navigation Bar Theme
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: AppColors.primaryBlue,
        unselectedItemColor: AppColors.textSecondary,
        selectedLabelStyle: AppTypography.caption.copyWith(
          color: AppColors.primaryBlue,
          fontWeight: FontWeight.w700,
        ),
        unselectedLabelStyle: AppTypography.caption.copyWith(
          color: AppColors.textSecondary,
        ),
        elevation: 8,
        type: BottomNavigationBarType.fixed,
      ),

      // Dialog Theme - FIXED: Use DialogThemeData
      dialogTheme: DialogThemeData(
        backgroundColor: Colors.white,
        elevation: 8,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.large),
        ),
        titleTextStyle: AppTypography.heading3,
        contentTextStyle: AppTypography.bodyMedium,
      ),

      // Chip Theme
      chipTheme: ChipThemeData(
        backgroundColor: Colors.white,
        labelStyle: AppTypography.bodySmall,
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.spacing12,
          vertical: AppSpacing.spacing8,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.small),
        ),
        side: const BorderSide(color: AppColors.borderColor),
      ),

      // Progress Indicator Theme
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: AppColors.primaryBlue,
        linearMinHeight: 4,
      ),

      // Divider Theme
      dividerTheme: const DividerThemeData(
        color: AppColors.borderColor,
        thickness: 1,
        space: 1,
      ),
    );
  }
}
