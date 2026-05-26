import 'package:flutter/material.dart';
import 'app_colors.dart';

/// Typography scale chung cho AquaCareSystem
/// Đồng bộ với admin_web Tailwind fontSize tokens
abstract class AppTextStyles {
  static const String _fontFamily = 'Inter';

  // ── Headings ──────────────────────────────────────────────
  static const TextStyle h1 = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 30,
    fontWeight: FontWeight.w700,
    height: 38 / 30,
    letterSpacing: -0.6,
    color: AppColors.onSurface,
  );

  static const TextStyle h2 = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 24,
    fontWeight: FontWeight.w600,
    height: 32 / 24,
    letterSpacing: -0.24,
    color: AppColors.onSurface,
  );

  static const TextStyle h3 = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 20,
    fontWeight: FontWeight.w600,
    height: 28 / 20,
    color: AppColors.onSurface,
  );

  // ── Body ──────────────────────────────────────────────────
  static const TextStyle bodyLg = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 16,
    fontWeight: FontWeight.w400,
    height: 24 / 16,
    color: AppColors.onSurface,
  );

  static const TextStyle bodyMd = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 14,
    fontWeight: FontWeight.w400,
    height: 20 / 14,
    color: AppColors.onSurface,
  );

  // ── Label ─────────────────────────────────────────────────
  static const TextStyle labelSm = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 12,
    fontWeight: FontWeight.w500,
    height: 16 / 12,
    letterSpacing: 0.24,
    color: AppColors.onSurface,
  );

  // ── Helpers ───────────────────────────────────────────────
  static TextStyle bodyMdVariant = const TextStyle(
    fontFamily: _fontFamily,
    fontSize: 14,
    fontWeight: FontWeight.w400,
    height: 20 / 14,
    color: AppColors.onSurfaceVariant,
  );

  static TextStyle labelSmVariant = const TextStyle(
    fontFamily: _fontFamily,
    fontSize: 12,
    fontWeight: FontWeight.w500,
    height: 16 / 12,
    letterSpacing: 0.24,
    color: AppColors.onSurfaceVariant,
  );

  static TextStyle errorText = const TextStyle(
    fontFamily: _fontFamily,
    fontSize: 12,
    fontWeight: FontWeight.w400,
    height: 16 / 12,
    color: AppColors.error,
  );
}
