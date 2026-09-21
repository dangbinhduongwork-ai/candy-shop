import 'package:dio/dio.dart';
import '../core/constants/api_constants.dart';
import '../core/network/dio_client.dart';
import '../models/cart_model.dart';

class CartService {
  final Dio _dio = DioClient().dio;

  /// Gets current user's shopping cart
  Future<CartModel> getCart() async {
    final response = await _dio.get(ApiConstants.cart);
    return CartModel.fromJson(response.data as Map<String, dynamic>);
  }

  /// Adds an item to the shopping cart
  Future<CartModel> addToCart({required int productId, int quantity = 1}) async {
    final response = await _dio.post(
      ApiConstants.cartItems,
      data: {
        'productId': productId,
        'quantity': quantity,
      },
    );
    return CartModel.fromJson(response.data as Map<String, dynamic>);
  }

  /// Updates quantity of an item in the cart
  Future<CartModel> updateItemQuantity({required int itemId, required int quantity}) async {
    final response = await _dio.put(
      '${ApiConstants.cartItems}/$itemId',
      data: {
        'quantity': quantity,
      },
    );
    return CartModel.fromJson(response.data as Map<String, dynamic>);
  }

  /// Removes an item from the cart
  Future<CartModel> removeItem(int itemId) async {
    final response = await _dio.delete('${ApiConstants.cartItems}/$itemId');
    return CartModel.fromJson(response.data as Map<String, dynamic>);
  }

  /// Clears the entire cart
  Future<CartModel> clearCart() async {
    final response = await _dio.delete(ApiConstants.cart);
    return CartModel.fromJson(response.data as Map<String, dynamic>);
  }
}
