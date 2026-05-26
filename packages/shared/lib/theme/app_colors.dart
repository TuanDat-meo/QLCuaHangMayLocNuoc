import 'package:flutter/material.dart';

/// Design system màu sắc chung cho toàn bộ AquaCareSystem
/// Đồng bộ với admin_web Tailwind tokens
abstract class AppColors {
  // ── Primary (Water Blue) ──────────────────────────────────
  static const Color primary = Color(0xFF00459A);
  static const Color onPrimary = Color(0xFFFFFFFF);
  static const Color primaryContainer = Color(0xFF005CC8);
  static const Color primaryFixed = Color(0xFFD8E2FF);
  static const Color primaryFixedDim = Color(0xFFAEC6FF);

  // ── Secondary (Clean Teal) ────────────────────────────────
  static const Color secondary = Color(0xFF00677D);
  static const Color onSecondary = Color(0xFFFFFFFF);
  static const Color secondaryContainer = Color(0xFF50D9FE);
  static const Color secondaryFixed = Color(0xFFB3EBFF);

  // ── Error ─────────────────────────────────────────────────
  static const Color error = Color(0xFFBA1A1A);
  static const Color onError = Color(0xFFFFFFFF);
  static const Color errorContainer = Color(0xFFFFDAD6);

  // ── Surface ───────────────────────────────────────────────
  static const Color surface = Color(0xFFF8F9FF);
  static const Color surfaceContainerLowest = Color(0xFFFFFFFF);
  static const Color surfaceContainer = Color(0xFFE5EEFF);
  static const Color surfaceContainerHigh = Color(0xFFDCE9FF);

  // ── On Surface ───────────────────────────────────────────
  static const Color onSurface = Color(0xFF0B1C30);
  static const Color onSurfaceVariant = Color(0xFF424753);

  // ── Outline ───────────────────────────────────────────────
  static const Color outline = Color(0xFF727785);
  static const Color outlineVariant = Color(0xFFC2C6D5);

  // ── Success ───────────────────────────────────────────────
  static const Color success = Color(0xFF10B981);
  static const Color successContainer = Color(0xFFD1FAE5);
}
