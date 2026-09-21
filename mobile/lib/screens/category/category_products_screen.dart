import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../models/category_model.dart';
import '../../models/product_model.dart';
import '../../services/product_service.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/product_card.dart';
import '../product/product_detail_screen.dart';

class CategoryProductsScreen extends StatefulWidget {
  final CategoryModel category;

  const CategoryProductsScreen({super.key, required this.category});

  @override
  State<CategoryProductsScreen> createState() => _CategoryProductsScreenState();
}

class _CategoryProductsScreenState extends State<CategoryProductsScreen> {
  final ProductService _productService = ProductService();

  List<ProductModel> _products = [];
  bool _isLoading = true;
  String _sortBy = 'createdAt';
  String _sortDir = 'desc';

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    setState(() => _isLoading = true);
    try {
      final res = await _productService.getProducts(
        categoryId: widget.category.id,
        sortBy: _sortBy,
        sortDir: _sortDir,
        size: 30,
      );
      setState(() {
        _products = res.content;
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.category.name),
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.sort_rounded),
            tooltip: 'Sắp xếp',
            onSelected: (val) {
              if (val == 'newest') {
                _sortBy = 'createdAt';
                _sortDir = 'desc';
              } else if (val == 'price_asc') {
                _sortBy = 'price';
                _sortDir = 'asc';
              } else if (val == 'price_desc') {
                _sortBy = 'price';
                _sortDir = 'desc';
              } else if (val == 'rating') {
                _sortBy = 'averageRating';
                _sortDir = 'desc';
              }
              _loadProducts();
            },
            itemBuilder: (context) => [
              const PopupMenuItem(value: 'newest', child: Text('Mới nhất')),
              const PopupMenuItem(value: 'price_asc', child: Text('Giá thấp đến cao')),
              const PopupMenuItem(value: 'price_desc', child: Text('Giá cao đến thấp')),
              const PopupMenuItem(value: 'rating', child: Text('Đánh giá cao nhất')),
            ],
          ),
        ],
      ),
      body: _isLoading
          ? const LoadingWidget(message: 'Đang tải sản phẩm...')
          : _products.isEmpty
              ? const EmptyStateWidget(
                  icon: Icons.inventory_2_outlined,
                  title: 'Chưa có sản phẩm',
                  subtitle: 'Danh mục này hiện chưa có sản phẩm nào được bày bán.',
                )
              : RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: _loadProducts,
                  child: GridView.builder(
                    padding: const EdgeInsets.all(16),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.63,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                    ),
                    itemCount: _products.length,
                    itemBuilder: (context, index) {
                      final product = _products[index];
                      return ProductCard(
                        product: product,
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => ProductDetailScreen(productId: product.id),
                            ),
                          );
                        },
                      );
                    },
                  ),
                ),
    );
  }
}
