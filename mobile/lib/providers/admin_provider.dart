import 'package:flutter/material.dart';
import '../core/network/error_handler.dart';
import '../models/admin_stats_model.dart';
import '../models/banner_model.dart';
import '../models/category_model.dart';
import '../models/customer_model.dart';
import '../models/order_model.dart';
import '../models/product_model.dart';
import '../models/setting_model.dart';
import '../models/voucher_model.dart';
import '../services/admin_service.dart';

class AdminProvider extends ChangeNotifier {
  final AdminService _adminService = AdminService();

  // 1. DASHBOARD
  AdminOrderStatsModel? _orderStats;
  CustomerStatsModel? _customerStats;
  bool _isLoadingStats = false;
  String? _statsError;

  AdminOrderStatsModel? get orderStats => _orderStats;
  CustomerStatsModel? get customerStats => _customerStats;
  bool get isLoadingStats => _isLoadingStats;
  String? get statsError => _statsError;

  Future<void> loadDashboardStats() async {
    _isLoadingStats = true;
    _statsError = null;
    notifyListeners();

    try {
      final results = await Future.wait([
        _adminService.getOrderStats(),
        _adminService.getCustomerStats(),
      ]);
      _orderStats = results[0] as AdminOrderStatsModel;
      _customerStats = results[1] as CustomerStatsModel;
    } catch (e) {
      _statsError = ErrorHandler.getErrorMessage(e);
    } finally {
      _isLoadingStats = false;
      notifyListeners();
    }
  }

  // 2. PRODUCTS
  List<ProductModel> _products = [];
  bool _isLoadingProducts = false;
  String? _productsError;

  List<ProductModel> get products => _products;
  bool get isLoadingProducts => _isLoadingProducts;
  String? get productsError => _productsError;

  Future<void> loadProducts({String? keyword, int? categoryId}) async {
    _isLoadingProducts = true;
    _productsError = null;
    notifyListeners();

    try {
      final res = await _adminService.getProducts(
        page: 0,
        size: 100,
        keyword: keyword,
        categoryId: categoryId,
      );
      _products = res.content;
    } catch (e) {
      _productsError = ErrorHandler.getErrorMessage(e);
    } finally {
      _isLoadingProducts = false;
      notifyListeners();
    }
  }

  Future<bool> createProduct(Map<String, dynamic> data) async {
    try {
      final newProd = await _adminService.createProduct(data);
      _products.insert(0, newProd);
      notifyListeners();
      loadProducts();
      return true;
    } catch (e) {
      _productsError = ErrorHandler.getErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateProduct(int id, Map<String, dynamic> data) async {
    try {
      final updated = await _adminService.updateProduct(id, data);
      final idx = _products.indexWhere((p) => p.id == id);
      if (idx != -1) {
        _products[idx] = updated;
        notifyListeners();
      }
      loadProducts();
      return true;
    } catch (e) {
      _productsError = ErrorHandler.getErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteProduct(int id) async {
    try {
      await _adminService.deleteProduct(id);
      _products.removeWhere((p) => p.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _productsError = ErrorHandler.getErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  Future<String?> uploadImage(String filePath) async {
    try {
      return await _adminService.uploadProductImage(filePath);
    } catch (e) {
      _productsError = ErrorHandler.getErrorMessage(e);
      notifyListeners();
      return null;
    }
  }

  // 3. ORDERS
  List<OrderModel> _orders = [];
  bool _isLoadingOrders = false;
  String? _ordersError;
  String _selectedOrderStatus = 'ALL';

  List<OrderModel> get orders => _orders;
  bool get isLoadingOrders => _isLoadingOrders;
  String? get ordersError => _ordersError;
  String get selectedOrderStatus => _selectedOrderStatus;

  Future<void> loadOrders({String? status, String? search}) async {
    _isLoadingOrders = true;
    _ordersError = null;
    if (status != null) _selectedOrderStatus = status;
    notifyListeners();

    try {
      _orders = await _adminService.getOrders(
        status: _selectedOrderStatus,
        search: search,
        size: 50,
      );
    } catch (e) {
      _ordersError = ErrorHandler.getErrorMessage(e);
    } finally {
      _isLoadingOrders = false;
      notifyListeners();
    }
  }

  Future<bool> updateOrderStatus(int id, String newStatus) async {
    try {
      final updated = await _adminService.updateOrderStatus(id, newStatus);
      final idx = _orders.indexWhere((o) => o.id == id);
      if (idx != -1) {
        _orders[idx] = updated;
        notifyListeners();
      }
      // Refresh stats in background
      loadDashboardStats();
      return true;
    } catch (e) {
      _ordersError = ErrorHandler.getErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  // 4. CATEGORIES
  List<CategoryModel> _categories = [];
  bool _isLoadingCategories = false;
  String? _categoriesError;

  List<CategoryModel> get categories => _categories;
  bool get isLoadingCategories => _isLoadingCategories;
  String? get categoriesError => _categoriesError;

  Future<void> loadCategories() async {
    _isLoadingCategories = true;
    _categoriesError = null;
    notifyListeners();

    try {
      _categories = await _adminService.getCategories();
    } catch (e) {
      _categoriesError = ErrorHandler.getErrorMessage(e);
    } finally {
      _isLoadingCategories = false;
      notifyListeners();
    }
  }

  Future<bool> createCategory(Map<String, dynamic> data) async {
    try {
      final created = await _adminService.createCategory(data);
      _categories.add(created);
      notifyListeners();
      return true;
    } catch (e) {
      _categoriesError = ErrorHandler.getErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateCategory(int id, Map<String, dynamic> data) async {
    try {
      final updated = await _adminService.updateCategory(id, data);
      final idx = _categories.indexWhere((c) => c.id == id);
      if (idx != -1) {
        _categories[idx] = updated;
        notifyListeners();
      }
      return true;
    } catch (e) {
      _categoriesError = ErrorHandler.getErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  Future<bool> toggleCategoryStatus(int id, bool active) async {
    try {
      final updated = await _adminService.toggleCategoryStatus(id, active);
      final idx = _categories.indexWhere((c) => c.id == id);
      if (idx != -1) {
        _categories[idx] = updated;
        notifyListeners();
      }
      return true;
    } catch (e) {
      _categoriesError = ErrorHandler.getErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteCategory(int id) async {
    try {
      await _adminService.deleteCategory(id);
      _categories.removeWhere((c) => c.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _categoriesError = ErrorHandler.getErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  // 5. VOUCHERS
  List<VoucherModel> _vouchers = [];
  bool _isLoadingVouchers = false;
  String? _vouchersError;

  List<VoucherModel> get vouchers => _vouchers;
  bool get isLoadingVouchers => _isLoadingVouchers;
  String? get vouchersError => _vouchersError;

  Future<void> loadVouchers({String? search, String? status}) async {
    _isLoadingVouchers = true;
    _vouchersError = null;
    notifyListeners();

    try {
      _vouchers = await _adminService.getVouchers(search: search, status: status);
    } catch (e) {
      _vouchersError = ErrorHandler.getErrorMessage(e);
    } finally {
      _isLoadingVouchers = false;
      notifyListeners();
    }
  }

  Future<bool> createVoucher(Map<String, dynamic> data) async {
    try {
      final created = await _adminService.createVoucher(data);
      _vouchers.insert(0, created);
      notifyListeners();
      return true;
    } catch (e) {
      _vouchersError = ErrorHandler.getErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateVoucher(int id, Map<String, dynamic> data) async {
    try {
      final updated = await _adminService.updateVoucher(id, data);
      final idx = _vouchers.indexWhere((v) => v.id == id);
      if (idx != -1) {
        _vouchers[idx] = updated;
        notifyListeners();
      }
      return true;
    } catch (e) {
      _vouchersError = ErrorHandler.getErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteVoucher(int id) async {
    try {
      await _adminService.deleteVoucher(id);
      _vouchers.removeWhere((v) => v.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _vouchersError = ErrorHandler.getErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  // 6. BANNERS
  List<BannerModel> _banners = [];
  bool _isLoadingBanners = false;
  String? _bannersError;

  List<BannerModel> get banners => _banners;
  bool get isLoadingBanners => _isLoadingBanners;
  String? get bannersError => _bannersError;

  Future<void> loadBanners() async {
    _isLoadingBanners = true;
    _bannersError = null;
    notifyListeners();

    try {
      _banners = await _adminService.getBanners();
    } catch (e) {
      _bannersError = ErrorHandler.getErrorMessage(e);
    } finally {
      _isLoadingBanners = false;
      notifyListeners();
    }
  }

  Future<bool> createBanner({
    required String filePath,
    String? title,
    String? targetUrl,
    int displayOrder = 0,
    bool active = true,
  }) async {
    try {
      final created = await _adminService.createBanner(
        filePath: filePath,
        title: title,
        targetUrl: targetUrl,
        displayOrder: displayOrder,
        active: active,
      );
      _banners.add(created);
      notifyListeners();
      return true;
    } catch (e) {
      _bannersError = ErrorHandler.getErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateBanner(
    int id, {
    String? filePath,
    String? title,
    String? targetUrl,
    int? displayOrder,
    bool? active,
  }) async {
    try {
      final updated = await _adminService.updateBanner(
        id,
        filePath: filePath,
        title: title,
        targetUrl: targetUrl,
        displayOrder: displayOrder,
        active: active,
      );
      final idx = _banners.indexWhere((b) => b.id == id);
      if (idx != -1) {
        _banners[idx] = updated;
        notifyListeners();
      }
      return true;
    } catch (e) {
      _bannersError = ErrorHandler.getErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  Future<bool> toggleBannerStatus(int id, bool active) async {
    try {
      final updated = await _adminService.toggleBannerStatus(id, active);
      final idx = _banners.indexWhere((b) => b.id == id);
      if (idx != -1) {
        _banners[idx] = updated;
        notifyListeners();
      }
      return true;
    } catch (e) {
      _bannersError = ErrorHandler.getErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteBanner(int id) async {
    try {
      await _adminService.deleteBanner(id);
      _banners.removeWhere((b) => b.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _bannersError = ErrorHandler.getErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  // 7. CUSTOMERS
  List<CustomerSummaryModel> _customers = [];
  bool _isLoadingCustomers = false;
  String? _customersError;

  List<CustomerSummaryModel> get customers => _customers;
  bool get isLoadingCustomers => _isLoadingCustomers;
  String? get customersError => _customersError;

  Future<void> loadCustomers({String? search, String? status}) async {
    _isLoadingCustomers = true;
    _customersError = null;
    notifyListeners();

    try {
      _customers = await _adminService.getCustomers(search: search, status: status);
    } catch (e) {
      _customersError = ErrorHandler.getErrorMessage(e);
    } finally {
      _isLoadingCustomers = false;
      notifyListeners();
    }
  }

  Future<bool> toggleCustomerStatus(int id, String currentStatus) async {
    final newStatus = currentStatus == 'LOCKED' ? 'ACTIVE' : 'LOCKED';
    try {
      final updated = await _adminService.updateCustomerStatus(id, newStatus);
      final idx = _customers.indexWhere((c) => c.id == id);
      if (idx != -1) {
        _customers[idx] = updated;
        notifyListeners();
      }
      return true;
    } catch (e) {
      _customersError = ErrorHandler.getErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  // 8. SETTINGS
  ShippingSettingModel? _shippingSetting;
  ShopGeneralSettingModel? _generalSetting;
  bool _isLoadingSettings = false;
  String? _settingsError;

  ShippingSettingModel? get shippingSetting => _shippingSetting;
  ShopGeneralSettingModel? get generalSetting => _generalSetting;
  bool get isLoadingSettings => _isLoadingSettings;
  String? get settingsError => _settingsError;

  Future<void> loadSettings() async {
    _isLoadingSettings = true;
    _settingsError = null;
    notifyListeners();

    try {
      final results = await Future.wait([
        _adminService.getShippingSetting(),
        _adminService.getGeneralSetting(),
      ]);
      _shippingSetting = results[0] as ShippingSettingModel;
      _generalSetting = results[1] as ShopGeneralSettingModel;
    } catch (e) {
      _settingsError = ErrorHandler.getErrorMessage(e);
    } finally {
      _isLoadingSettings = false;
      notifyListeners();
    }
  }

  Future<bool> updateShippingSetting(double defaultFee, double freeThreshold) async {
    try {
      final updated = await _adminService.updateShippingSetting({
        'defaultShippingFee': defaultFee,
        'freeShippingThreshold': freeThreshold,
      });
      _shippingSetting = updated;
      notifyListeners();
      return true;
    } catch (e) {
      _settingsError = ErrorHandler.getErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateGeneralSetting(Map<String, dynamic> data) async {
    try {
      final updated = await _adminService.updateGeneralSetting(data);
      _generalSetting = updated;
      notifyListeners();
      return true;
    } catch (e) {
      _settingsError = ErrorHandler.getErrorMessage(e);
      notifyListeners();
      return false;
    }
  }
}
