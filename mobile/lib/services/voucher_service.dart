import 'package:dio/dio.dart';
import '../core/constants/api_constants.dart';
import '../core/network/dio_client.dart';
import '../models/voucher_model.dart';

class VoucherService {
  final Dio _dio = DioClient().dio;

  /// Gets list of available vouchers for customers
  Future<List<VoucherModel>> getAvailableVouchers() async {
    final response = await _dio.get(ApiConstants.availableVouchers);
    final list = response.data as List<dynamic>? ?? [];
    return list.map((e) => VoucherModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  /// Validates and applies a voucher to current cart
  Future<ApplyVoucherResult> applyVoucher(String code) async {
    final response = await _dio.post(
      ApiConstants.applyVoucher,
      data: {'code': code.trim()},
    );
    return ApplyVoucherResult.fromJson(response.data as Map<String, dynamic>);
  }
}
