import 'package:dio/dio.dart';
import '../core/constants/api_constants.dart';
import '../core/network/dio_client.dart';
import '../models/category_model.dart';

class CategoryService {
  final Dio _dio = DioClient().dio;

  /// Gets all active categories
  Future<List<CategoryModel>> getCategories({bool includeInactive = false}) async {
    final response = await _dio.get(
      ApiConstants.categories,
      queryParameters: {'includeInactive': includeInactive},
    );

    final list = response.data as List<dynamic>? ?? [];
    return list.map((e) => CategoryModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  /// Gets category by ID
  Future<CategoryModel> getCategoryById(int id) async {
    final response = await _dio.get('${ApiConstants.categories}/$id');
    return CategoryModel.fromJson(response.data as Map<String, dynamic>);
  }
}
