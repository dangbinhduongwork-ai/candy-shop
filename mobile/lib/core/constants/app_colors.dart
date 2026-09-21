import 'package:flutter/material.dart';

class AppColors {
  // Primary Palette - Candy Pink & Coral Rose
  static const Color primary = Color(0xFFFF5376);
  static const Color primaryLight = Color(0xFFFF85A1);
  static const Color primaryDark = Color(0xFFD81B60);

  // Secondary Palette - Sweet Coral Peach
  static const Color secondary = Color(0xFFFF8E53);
  static const Color secondaryLight = Color(0xFFFFAE80);

  // Accent & Soft Tones
  static const Color accentMint = Color(0xFF00C9A7);
  static const Color accentPurple = Color(0xFF845EC2);
  static const Color accentYellow = Color(0xFFFFC75F);

  // Backgrounds & Surfaces (Light)
  static const Color backgroundLight = Color(0xFFFBF9FC);
  static const Color cardLight = Colors.white;
  static const Color surfaceLight = Color(0xFFF3EDF7);

  // Backgrounds & Surfaces (Dark)
  static const Color backgroundDark = Color(0xFF141218);
  static const Color cardDark = Color(0xFF211F26);
  static const Color surfaceDark = Color(0xFF2B2930);

  // Text Colors
  static const Color textPrimaryLight = Color(0xFF1D1B20);
  static const Color textSecondaryLight = Color(0xFF79747E);
  static const Color textPrimaryDark = Color(0xFFE6E1E5);
  static const Color textSecondaryDark = Color(0xFFCAC4D0);

  // Status & Order States
  static const Color statusPending = Color(0xFFFF9800);
  static const Color statusConfirmed = Color(0xFF2196F3);
  static const Color statusDelivered = Color(0xFF4CAF50);
  static const Color statusCancelled = Color(0xFFF44336);

  // Utility
  static const Color borderLight = Color(0xFFEAE3ED);
  static const Color borderDark = Color(0xFF3B3842);
  static const Color starYellow = Color(0xFFFFB300);

  // Gradients
  static const LinearGradient candyGradient = LinearGradient(
    colors: [Color(0xFFFF5376), Color(0xFFFF8E53)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient mintGradient = LinearGradient(
    colors: [Color(0xFF00C9A7), Color(0xFF4D8076)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
