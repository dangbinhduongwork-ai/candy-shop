import 'package:dio/dio.dart';
import '../core/constants/api_constants.dart';
import '../core/network/dio_client.dart';
import '../models/product_model.dart';

class ProductService {
  final Dio _dio = DioClient().dio;

  /// Fetches paginated products with optional filters
  Future<ProductPageResponse> getProducts({
    int page = 0,
    int size = 12,
    String sortBy = 'createdAt',
    String sortDir = 'desc',
    int? categoryId,
    String? keyword,
    double? minPrice,
    double? maxPrice,
  }) async {
    final Map<String, dynamic> queryParams = {
      'page': page,
      'size': size,
      'sortBy': sortBy,
      'sortDir': sortDir,
    };

    if (categoryId != null && categoryId > 0) {
      queryParams['categoryId'] = categoryId;
    }
    if (keyword != null && keyword.trim().isNotEmpty) {
      queryParams['keyword'] = keyword.trim();
    }
    if (minPrice != null) {
      queryParams['minPrice'] = minPrice;
    }
    if (maxPrice != null) {
      queryParams['maxPrice'] = maxPrice;
    }

    final response = await _dio.get(
      ApiConstants.products,
      queryParameters: queryParams,
    );

    return ProductPageResponse.fromJson(response.data as Map<String, dynamic>);
  }

  /// Gets product details by ID
  Future<ProductModel> getProductById(int id) async {
    final response = await _dio.get('${ApiConstants.products}/$id');
    return ProductModel.fromJson(response.data as Map<String, dynamic>);
  }
}
