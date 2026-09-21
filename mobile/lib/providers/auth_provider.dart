import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/network/auth_interceptor.dart';
import '../core/network/error_handler.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();

  UserModel? _currentUser;
  String? _token;
  bool _isLoading = false;
  String? _errorMessage;

  UserModel? get currentUser => _currentUser;
  String? get token => _token;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _token != null && _token!.isNotEmpty;
  bool get isAdmin => currentUser?.isAdmin ?? false;

  AuthProvider() {
    // Register global 401 callback from Dio AuthInterceptor
    AuthInterceptor.onUnauthorized = () {
      logout(silent: true);
    };
  }

  /// Restores session on app startup
  Future<bool> initAuth() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString('token');
      final userJson = prefs.getString('user');

      if (_token != null && _token!.isNotEmpty) {
        if (userJson != null) {
          try {
            _currentUser = UserModel.fromJson(jsonDecode(userJson) as Map<String, dynamic>);
          } catch (_) {}
        }
        // Refresh user info from server in background
        try {
          final serverUser = await _authService.getCurrentUser();
          _currentUser = serverUser;
          await prefs.setString('user', jsonEncode(serverUser.toJson()));
        } catch (_) {
          // If server returns error, keep local or ignore if offline
        }
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (_) {}

    _isLoading = false;
    notifyListeners();
    return false;
  }

  /// Authenticates user
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final authResponse = await _authService.login(email: email, password: password);
      _token = authResponse.token;
      _currentUser = authResponse.user;

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', _token!);
      await prefs.setString('user', jsonEncode(_currentUser!.toJson()));

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = ErrorHandler.getErrorMessage(e);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Registers user
  Future<bool> register({
    required String fullName,
    required String email,
    required String password,
    String? phone,
    String? address,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final authResponse = await _authService.register(
        fullName: fullName,
        email: email,
        password: password,
        phone: phone,
        address: address,
      );
      _token = authResponse.token;
      _currentUser = authResponse.user;

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', _token!);
      await prefs.setString('user', jsonEncode(_currentUser!.toJson()));

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = ErrorHandler.getErrorMessage(e);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Updates user profile
  Future<bool> updateProfile({
    required String fullName,
    String? phone,
    String? address,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final updated = await _authService.updateProfile(
        fullName: fullName,
        phone: phone,
        address: address,
      );
      _currentUser = updated;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user', jsonEncode(_currentUser!.toJson()));

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = ErrorHandler.getErrorMessage(e);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Logs out user
  Future<void> logout({bool silent = false}) async {
    _token = null;
    _currentUser = null;
    _errorMessage = null;

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');

    if (!silent) {
      notifyListeners();
    }
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
