import 'package:flutter/foundation.dart';
import '../models/banner_model.dart';
import '../models/category_model.dart';
import '../models/product_model.dart';
import '../services/category_service.dart';
import '../services/product_service.dart';
import '../services/setting_service.dart';

class ProductProvider extends ChangeNotifier {
  final ProductService _productService = ProductService();
  final CategoryService _categoryService = CategoryService();
  final SettingService _settingService = SettingService();

  List<CategoryModel> _categories = [];
  List<BannerModel> _banners = [];
  List<ProductModel> _products = [];
  List<ProductModel> _featuredProducts = [];

  bool _isLoading = false;
  bool _isLoadingMore = false;
  String? _errorMessage;

  int _currentPage = 0;
  bool _hasMore = true;

  int? _selectedCategoryId;
  String _searchKeyword = '';
  String _sortBy = 'createdAt';
  String _sortDir = 'desc';

  // Getters
  List<CategoryModel> get categories => _categories;
  List<BannerModel> get banners => _banners;
  List<ProductModel> get products => _products;
  List<ProductModel> get featuredProducts => _featuredProducts;
  bool get isLoading => _isLoading;
  bool get isLoadingMore => _isLoadingMore;
  bool get hasMore => _hasMore;
  String? get errorMessage => _errorMessage;
  int? get selectedCategoryId => _selectedCategoryId;
  String get searchKeyword => _searchKeyword;

  /// Loads categories, banners, and initial batch of products
  Future<void> loadInitialData() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final results = await Future.wait([
        _categoryService.getCategories(),
        _settingService.getActiveBanners(),
        _productService.getProducts(page: 0, size: 10, sortBy: 'price', sortDir: 'desc'),
        _productService.getProducts(page: 0, size: 10, sortBy: 'createdAt', sortDir: 'desc'),
      ]);

      _categories = results[0] as List<CategoryModel>;
      _banners = results[1] as List<BannerModel>;
      _featuredProducts = (results[2] as ProductPageResponse).content;
      
      final mainPage = results[3] as ProductPageResponse;
      _products = mainPage.content;
      _currentPage = 0;
      _hasMore = !mainPage.last;

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = 'Không thể tải dữ liệu cửa hàng: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Filters products by category
  Future<void> selectCategory(int? categoryId) async {
    if (_selectedCategoryId == categoryId) return;
    _selectedCategoryId = categoryId;
    await refreshProducts();
  }

  /// Searches products by keyword
  Future<void> search(String keyword) async {
    _searchKeyword = keyword.trim();
    await refreshProducts();
  }

  /// Sets sorting
  Future<void> setSort(String sortBy, String sortDir) async {
    _sortBy = sortBy;
    _sortDir = sortDir;
    await refreshProducts();
  }

  /// Reloads products with current filters
  Future<void> refreshProducts() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final pageRes = await _productService.getProducts(
        page: 0,
        size: 12,
        sortBy: _sortBy,
        sortDir: _sortDir,
        categoryId: _selectedCategoryId,
        keyword: _searchKeyword.isNotEmpty ? _searchKeyword : null,
      );

      _products = pageRes.content;
      _currentPage = 0;
      _hasMore = !pageRes.last;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = 'Lỗi khi tải sản phẩm: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Loads next page for infinite scrolling
  Future<void> loadMoreProducts() async {
    if (_isLoadingMore || !_hasMore) return;

    _isLoadingMore = true;
    notifyListeners();

    try {
      final nextPage = _currentPage + 1;
      final pageRes = await _productService.getProducts(
        page: nextPage,
        size: 12,
        sortBy: _sortBy,
        sortDir: _sortDir,
        categoryId: _selectedCategoryId,
        keyword: _searchKeyword.isNotEmpty ? _searchKeyword : null,
      );

      _products.addAll(pageRes.content);
      _currentPage = nextPage;
      _hasMore = !pageRes.last;
      _isLoadingMore = false;
      notifyListeners();
    } catch (e) {
      _isLoadingMore = false;
      notifyListeners();
    }
  }
}
