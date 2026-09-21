import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

/// Centralized API Constants and Network Endpoints
class ApiConstants {
  // Production Cloud Render Backend
  static const String productionBaseUrl = 'https://candy-shop-urf3.onrender.com/api';

  // Android Emulator connects to host machine via 10.0.2.2
  static const String androidEmulatorBaseUrl = 'http://10.0.2.2:8080/api';
  
  // iOS Simulator connects to host machine via localhost / 127.0.0.1
  static const String iosSimulatorBaseUrl = 'http://localhost:8080/api';
  
  // Real Device over LAN Wi-Fi (Your computer's local IP)
  static const String lanDeviceBaseUrl = 'http://192.168.1.8:8080/api';

  // Real Device over USB with adb reverse
  static const String usbDeviceBaseUrl = 'http://localhost:8080/api';

  /// Toggle this to true if you are testing on local development backend
  static const bool useLocalBackend = false;

  /// Custom manual override if needed
  static String? customBaseUrl;

  /// Gets the currently active API base URL
  static String get baseUrl {
    if (customBaseUrl != null && customBaseUrl!.isNotEmpty) {
      return customBaseUrl!;
    }
    if (!useLocalBackend) {
      return productionBaseUrl;
    }
    if (kIsWeb) {
      return 'http://localhost:8080/api';
    }
    if (Platform.isAndroid) {
      return androidEmulatorBaseUrl;
    }
    return iosSimulatorBaseUrl;
  }

  /// Host root URL without '/api' (used for resolving relative image uploads like /uploads/xyz.png)
  static String get hostUrl {
    final current = baseUrl;
    if (current.endsWith('/api')) {
      return current.substring(0, current.length - 4);
    }
    return current;
  }

  // Network Timeouts
  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 15);

  // Default Captcha token accepted by backend RecaptchaServiceImpl
  static const String defaultCaptchaToken = 'test-token';

  // === ENDPOINTS ===
  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String forgotPassword = '/auth/forgot-password';
  static const String currentUser = '/users/me';
  static const String updateProfile = '/users/me';
  static const String changePassword = '/users/me/password';

  // Categories & Products
  static const String categories = '/categories';
  static const String products = '/products';

  // Banners & Settings
  static const String banners = '/banners';
  static const String generalSettings = '/settings/general';
  static const String shippingSettings = '/settings/shipping';

  // Cart
  static const String cart = '/cart';
  static const String cartItems = '/cart/items';

  // Vouchers
  static const String availableVouchers = '/vouchers/available';
  static const String applyVoucher = '/vouchers/apply';

  // Orders
  static const String orders = '/orders';
}
