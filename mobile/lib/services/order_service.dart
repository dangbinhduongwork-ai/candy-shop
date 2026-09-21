import 'package:dio/dio.dart';
import '../core/constants/api_constants.dart';
import '../core/network/dio_client.dart';
import '../models/order_model.dart';

class OrderService {
  final Dio _dio = DioClient().dio;

  /// Creates a new order from current cart
  Future<OrderModel> createOrder({
    required String receiverName,
    required String receiverPhone,
    required String shippingAddress,
    String? note,
    String paymentMethod = 'COD',
    String? voucherCode,
  }) async {
    final response = await _dio.post(
      ApiConstants.orders,
      data: {
        'receiverName': receiverName.trim(),
        'receiverPhone': receiverPhone.trim(),
        'shippingAddress': shippingAddress.trim(),
        'note': note?.trim(),
        'paymentMethod': paymentMethod,
        'voucherCode': voucherCode?.trim(),
      },
    );

    return OrderModel.fromJson(response.data as Map<String, dynamic>);
  }

  /// Gets paginated order history for current user
  Future<OrderPageResponse> getUserOrders({int page = 0, int size = 10}) async {
    final response = await _dio.get(
      ApiConstants.orders,
      queryParameters: {
        'page': page,
        'size': size,
      },
    );

    return OrderPageResponse.fromJson(response.data as Map<String, dynamic>);
  }

  /// Gets details of an order by ID
  Future<OrderModel> getOrderById(int id) async {
    final response = await _dio.get('${ApiConstants.orders}/$id');
    return OrderModel.fromJson(response.data as Map<String, dynamic>);
  }

  /// Cancels an order (PENDING only)
  Future<OrderModel> cancelOrder(int id) async {
    final response = await _dio.put('${ApiConstants.orders}/$id/cancel');
    return OrderModel.fromJson(response.data as Map<String, dynamic>);
  }
}
