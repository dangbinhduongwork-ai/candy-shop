import 'package:dio/dio.dart';
import '../core/constants/api_constants.dart';
import '../core/network/dio_client.dart';
import '../models/user_model.dart';

class AuthService {
  final Dio _dio = DioClient().dio;

  /// Logs in using email, password, and test captcha token
  Future<AuthResponseModel> login({
    required String email,
    required String password,
    String captchaToken = ApiConstants.defaultCaptchaToken,
  }) async {
    final response = await _dio.post(
      ApiConstants.login,
      data: {
        'email': email.trim(),
        'password': password,
        'captchaToken': captchaToken,
      },
    );

    return AuthResponseModel.fromJson(response.data as Map<String, dynamic>);
  }

  /// Registers a new user account
  Future<AuthResponseModel> register({
    required String fullName,
    required String email,
    required String password,
    String? phone,
    String? address,
    String captchaToken = ApiConstants.defaultCaptchaToken,
  }) async {
    final response = await _dio.post(
      ApiConstants.register,
      data: {
        'fullName': fullName.trim(),
        'email': email.trim(),
        'password': password,
        'phone': phone?.trim(),
        'address': address?.trim(),
        'captchaToken': captchaToken,
      },
    );

    return AuthResponseModel.fromJson(response.data as Map<String, dynamic>);
  }

  /// Gets current authenticated user profile
  Future<UserModel> getCurrentUser() async {
    final response = await _dio.get(ApiConstants.currentUser);
    return UserModel.fromJson(response.data as Map<String, dynamic>);
  }

  /// Updates profile info
  Future<UserModel> updateProfile({
    required String fullName,
    String? phone,
    String? address,
  }) async {
    final response = await _dio.put(
      ApiConstants.updateProfile,
      data: {
        'fullName': fullName.trim(),
        'phone': phone?.trim(),
        'address': address?.trim(),
      },
    );
    return UserModel.fromJson(response.data as Map<String, dynamic>);
  }

  /// Changes password
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    await _dio.put(
      ApiConstants.changePassword,
      data: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      },
    );
  }
}
