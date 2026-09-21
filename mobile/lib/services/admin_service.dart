import 'dart:io';
import 'package:dio/dio.dart';
import '../core/constants/api_constants.dart';
import '../core/network/dio_client.dart';
import '../models/admin_stats_model.dart';
import '../models/banner_model.dart';
import '../models/category_model.dart';
import '../models/customer_model.dart';
import '../models/order_model.dart';
import '../models/product_model.dart';
import '../models/setting_model.dart';
import '../models/voucher_model.dart';

class AdminService {
  final Dio _dio = DioClient().dio;

  // ==========================================
  // 1. DASHBOARD STATS
  // ==========================================

  Future<AdminOrderStatsModel> getOrderStats() async {
    final response = await _dio.get('${ApiConstants.baseUrl}/admin/orders/stats');
    return AdminOrderStatsModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<CustomerStatsModel> getCustomerStats() async {
    final response = await _dio.get('${ApiConstants.baseUrl}/admin/customers/stats');
    return CustomerStatsModel.fromJson(response.data as Map<String, dynamic>);
  }

  // ==========================================
  // 2. PRODUCTS
  // ==========================================

  Future<ProductPageResponse> getProducts({
    int page = 0,
    int size = 20,
    String sortBy = 'createdAt',
    String sortDir = 'desc',
    int? categoryId,
    String? keyword,
  }) async {
    final Map<String, dynamic> queryParams = {
      'page': page,
      'size': size,
      'sortBy': sortBy,
      'sortDir': sortDir,
    };
    if (categoryId != null && categoryId > 0) queryParams['categoryId'] = categoryId;
    if (keyword != null && keyword.trim().isNotEmpty) queryParams['keyword'] = keyword.trim();

    final response = await _dio.get(
      ApiConstants.products,
      queryParameters: queryParams,
    );
    return ProductPageResponse.fromJson(response.data as Map<String, dynamic>);
  }

  Future<ProductModel> createProduct(Map<String, dynamic> data) async {
    final response = await _dio.post(ApiConstants.products, data: data);
    return ProductModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<ProductModel> updateProduct(int id, Map<String, dynamic> data) async {
    final response = await _dio.put('${ApiConstants.products}/$id', data: data);
    return ProductModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> deleteProduct(int id) async {
    await _dio.delete('${ApiConstants.products}/$id');
  }

  Future<String> uploadProductImage(String filePath) async {
    final file = File(filePath);
    final fileName = file.path.split(Platform.pathSeparator).last;
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath, filename: fileName),
    });

    final response = await _dio.post(
      '${ApiConstants.products}/upload-image',
      data: formData,
    );
    // Read imageUrl from Backend Spring Boot FileUploadResponse
    final String url = response.data['imageUrl']?.toString() ??
        response.data['url']?.toString() ??
        response.data['fileUrl']?.toString() ??
        '';
    return url;
  }

  // ==========================================
  // 3. ORDERS
  // ==========================================

  Future<List<OrderModel>> getOrders({
    String? status,
    String? search,
    int page = 0,
    int size = 20,
  }) async {
    final Map<String, dynamic> queryParams = {
      'page': page,
      'size': size,
    };
    if (status != null && status.isNotEmpty && status != 'ALL') {
      queryParams['status'] = status;
    }
    if (search != null && search.trim().isNotEmpty) {
      queryParams['search'] = search.trim();
    }

    final response = await _dio.get(
      '${ApiConstants.baseUrl}/admin/orders',
      queryParameters: queryParams,
    );

    final List<dynamic> content = response.data['content'] ?? [];
    return content.map((e) => OrderModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<OrderModel> getOrderById(int id) async {
    final response = await _dio.get('${ApiConstants.baseUrl}/admin/orders/$id');
    return OrderModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<OrderModel> updateOrderStatus(int id, String status) async {
    final response = await _dio.put(
      '${ApiConstants.baseUrl}/admin/orders/$id/status',
      data: {'status': status},
    );
    return OrderModel.fromJson(response.data as Map<String, dynamic>);
  }

  // ==========================================
  // 4. CATEGORIES
  // ==========================================

  Future<List<CategoryModel>> getCategories() async {
    final response = await _dio.get(
      ApiConstants.categories,
      queryParameters: {'includeInactive': true},
    );
    final List<dynamic> list = response.data ?? [];
    return list.map((e) => CategoryModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<CategoryModel> createCategory(Map<String, dynamic> data) async {
    final response = await _dio.post(ApiConstants.categories, data: data);
    return CategoryModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<CategoryModel> updateCategory(int id, Map<String, dynamic> data) async {
    final response = await _dio.put('${ApiConstants.categories}/$id', data: data);
    return CategoryModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<CategoryModel> toggleCategoryStatus(int id, bool active) async {
    final response = await _dio.put(
      '${ApiConstants.categories}/$id/status',
      data: {'active': active},
    );
    return CategoryModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> deleteCategory(int id) async {
    await _dio.delete('${ApiConstants.categories}/$id');
  }

  // ==========================================
  // 5. VOUCHERS
  // ==========================================

  Future<List<VoucherModel>> getVouchers({
    int page = 0,
    int size = 50,
    String? search,
    String? status,
  }) async {
    final Map<String, dynamic> queryParams = {
      'page': page,
      'size': size,
    };
    if (search != null && search.trim().isNotEmpty) queryParams['search'] = search.trim();
    if (status != null && status.isNotEmpty && status != 'ALL') queryParams['status'] = status;

    final response = await _dio.get(
      '${ApiConstants.baseUrl}/admin/vouchers',
      queryParameters: queryParams,
    );
    final List<dynamic> content = response.data['content'] ?? [];
    return content.map((e) => VoucherModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<VoucherModel> getVoucherById(int id) async {
    final response = await _dio.get('${ApiConstants.baseUrl}/admin/vouchers/$id');
    return VoucherModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<VoucherModel> createVoucher(Map<String, dynamic> data) async {
    final response = await _dio.post(
      '${ApiConstants.baseUrl}/admin/vouchers',
      data: data,
    );
    return VoucherModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<VoucherModel> updateVoucher(int id, Map<String, dynamic> data) async {
    final response = await _dio.put(
      '${ApiConstants.baseUrl}/admin/vouchers/$id',
      data: data,
    );
    return VoucherModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> deleteVoucher(int id) async {
    await _dio.delete('${ApiConstants.baseUrl}/admin/vouchers/$id');
  }

  // ==========================================
  // 6. BANNERS
  // ==========================================

  Future<List<BannerModel>> getBanners() async {
    final response = await _dio.get('${ApiConstants.baseUrl}/admin/banners');
    final List<dynamic> list = response.data ?? [];
    return list.map((e) => BannerModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<BannerModel> createBanner({
    required String filePath,
    String? title,
    String? targetUrl,
    int displayOrder = 0,
    bool active = true,
  }) async {
    final file = File(filePath);
    final fileName = file.path.split(Platform.pathSeparator).last;
    final formData = FormData.fromMap({
      'image': await MultipartFile.fromFile(filePath, filename: fileName),
      if (title != null) 'title': title,
      if (targetUrl != null) 'targetUrl': targetUrl,
      'displayOrder': displayOrder,
      'active': active,
    });

    final response = await _dio.post(
      '${ApiConstants.baseUrl}/admin/banners',
      data: formData,
    );
    return BannerModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<BannerModel> updateBanner(
    int id, {
    String? filePath,
    String? title,
    String? targetUrl,
    int? displayOrder,
    bool? active,
  }) async {
    final Map<String, dynamic> map = {
      if (title != null) 'title': title,
      if (targetUrl != null) 'targetUrl': targetUrl,
      if (displayOrder != null) 'displayOrder': displayOrder,
      if (active != null) 'active': active,
    };
    if (filePath != null && filePath.isNotEmpty) {
      final file = File(filePath);
      final fileName = file.path.split(Platform.pathSeparator).last;
      map['image'] = await MultipartFile.fromFile(filePath, filename: fileName);
    }
    final formData = FormData.fromMap(map);

    final response = await _dio.put(
      '${ApiConstants.baseUrl}/admin/banners/$id',
      data: formData,
    );
    return BannerModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<BannerModel> toggleBannerStatus(int id, bool active) async {
    final response = await _dio.put(
      '${ApiConstants.baseUrl}/admin/banners/$id/status',
      queryParameters: {'active': active},
    );
    return BannerModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> deleteBanner(int id) async {
    await _dio.delete('${ApiConstants.baseUrl}/admin/banners/$id');
  }

  // ==========================================
  // 7. CUSTOMERS
  // ==========================================

  Future<List<CustomerSummaryModel>> getCustomers({
    String? search,
    String? status,
    int page = 0,
    int size = 30,
  }) async {
    final Map<String, dynamic> queryParams = {
      'page': page,
      'size': size,
    };
    if (search != null && search.trim().isNotEmpty) queryParams['search'] = search.trim();
    if (status != null && status.isNotEmpty && status != 'ALL') queryParams['status'] = status;

    final response = await _dio.get(
      '${ApiConstants.baseUrl}/admin/customers',
      queryParameters: queryParams,
    );
    final List<dynamic> content = response.data['content'] ?? [];
    return content.map((e) => CustomerSummaryModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<CustomerDetailModel> getCustomerById(int id) async {
    final response = await _dio.get('${ApiConstants.baseUrl}/admin/customers/$id');
    return CustomerDetailModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<CustomerSummaryModel> updateCustomerStatus(int id, String status) async {
    final response = await _dio.put(
      '${ApiConstants.baseUrl}/admin/customers/$id/status',
      data: {'status': status},
    );
    return CustomerSummaryModel.fromJson(response.data as Map<String, dynamic>);
  }

  // ==========================================
  // 8. SHOP SETTINGS
  // ==========================================

  Future<ShippingSettingModel> getShippingSetting() async {
    final response = await _dio.get('${ApiConstants.baseUrl}/admin/settings/shipping');
    return ShippingSettingModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<ShippingSettingModel> updateShippingSetting(Map<String, dynamic> data) async {
    final response = await _dio.put('${ApiConstants.baseUrl}/admin/settings/shipping', data: data);
    return ShippingSettingModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<ShopGeneralSettingModel> getGeneralSetting() async {
    final response = await _dio.get('${ApiConstants.baseUrl}/admin/settings/general');
    return ShopGeneralSettingModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<ShopGeneralSettingModel> updateGeneralSetting(Map<String, dynamic> data) async {
    final response = await _dio.put('${ApiConstants.baseUrl}/admin/settings/general', data: data);
    return ShopGeneralSettingModel.fromJson(response.data as Map<String, dynamic>);
  }
}
