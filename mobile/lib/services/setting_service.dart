import 'package:dio/dio.dart';
import '../core/constants/api_constants.dart';
import '../core/network/dio_client.dart';
import '../models/banner_model.dart';
import '../models/setting_model.dart';

class SettingService {
  final Dio _dio = DioClient().dio;

  /// Gets active banners for promotional slider
  Future<List<BannerModel>> getActiveBanners() async {
    final response = await _dio.get(ApiConstants.banners);
    final list = response.data as List<dynamic>? ?? [];
    return list.map((e) => BannerModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  /// Gets general shop branding and settings
  Future<ShopGeneralSettingModel> getGeneralSetting() async {
    try {
      final response = await _dio.get(ApiConstants.generalSettings);
      return ShopGeneralSettingModel.fromJson(response.data as Map<String, dynamic>);
    } catch (_) {
      return ShopGeneralSettingModel.defaultSetting();
    }
  }

  /// Gets shipping configuration (shipping fee & free ship threshold)
  Future<ShippingSettingModel> getShippingSetting() async {
    try {
      final response = await _dio.get(ApiConstants.shippingSettings);
      return ShippingSettingModel.fromJson(response.data as Map<String, dynamic>);
    } catch (_) {
      return ShippingSettingModel.defaultSetting();
    }
  }
}
