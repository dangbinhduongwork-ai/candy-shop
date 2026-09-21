import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/utils/image_helper.dart';
import '../../../models/product_model.dart';
import '../../../providers/admin_provider.dart';
import '../../../widgets/empty_state.dart';
import '../../../widgets/loading_widget.dart';
import 'admin_product_form_screen.dart';

class AdminProductsScreen extends StatefulWidget {
  const AdminProductsScreen({super.key});

  @override
  State<AdminProductsScreen> createState() => _AdminProductsScreenState();
}

class _AdminProductsScreenState extends State<AdminProductsScreen> {
  final TextEditingController _searchController = TextEditingController();
  int? _selectedCategoryId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final adminProv = context.read<AdminProvider>();
      adminProv.loadProducts();
      adminProv.loadCategories();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onSearch() {
    context.read<AdminProvider>().loadProducts(
          keyword: _searchController.text.trim(),
          categoryId: _selectedCategoryId,
        );
  }

  @override
  Widget build(BuildContext context) {
    final adminProv = context.watch<AdminProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Quản Lý Sản Phẩm'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _onSearch,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text('Thêm Bánh Kẹo', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        onPressed: () async {
          final changed = await Navigator.push<bool>(
            context,
            MaterialPageRoute(builder: (_) => const AdminProductFormScreen()),
          );
          if (changed == true) _onSearch();
        },
      ),
      body: Column(
        children: [
          // Search & Filter Box
          Container(
            padding: const EdgeInsets.all(12),
            color: isDark ? AppColors.surfaceDark : Colors.white,
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Tìm kiếm tên sản phẩm...',
                    prefixIcon: const Icon(Icons.search_rounded),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear_rounded),
                            onPressed: () {
                              _searchController.clear();
                              _onSearch();
                            },
                          )
                        : null,
                    contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                  ),
                  onSubmitted: (_) => _onSearch(),
                ),
                const SizedBox(height: 8),
                // Category Filter chips
                SizedBox(
                  height: 36,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      FilterChip(
                        selected: _selectedCategoryId == null,
                        label: const Text('Tất cả'),
                        onSelected: (_) {
                          setState(() => _selectedCategoryId = null);
                          _onSearch();
                        },
                      ),
                      const SizedBox(width: 8),
                      ...adminProv.categories.map((c) => Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: FilterChip(
                              selected: _selectedCategoryId == c.id,
                              label: Text(c.name),
                              onSelected: (_) {
                                setState(() => _selectedCategoryId = c.id);
                                _onSearch();
                              },
                            ),
                          )),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Product List
          Expanded(
            child: adminProv.isLoadingProducts
                ? const LoadingWidget(message: 'Đang tải danh sách sản phẩm...')
                : adminProv.products.isEmpty
                    ? EmptyStateWidget(
                        title: 'Không tìm thấy sản phẩm',
                        subtitle: 'Không có sản phẩm nào khớp với tìm kiếm hoặc bộ lọc.',
                        icon: Icons.inventory_2_outlined,
                        buttonText: 'Tải lại',
                        onButtonPressed: _onSearch,
                      )
                    : RefreshIndicator(
                        color: AppColors.primary,
                        onRefresh: () async => _onSearch(),
                        child: ListView.separated(
                          padding: const EdgeInsets.fromLTRB(16, 12, 16, 80),
                          itemCount: adminProv.products.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 10),
                          itemBuilder: (context, index) {
                            final product = adminProv.products[index];
                            return _buildProductCard(context, product, adminProv, isDark);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductCard(BuildContext context, ProductModel product, AdminProvider adminProv, bool isDark) {
    final isLowStock = product.stockQuantity <= 5;

    return Card(
      elevation: isDark ? 0 : 1.5,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: isLowStock ? Colors.redAccent.withOpacity(0.5) : (isDark ? AppColors.borderDark : AppColors.borderLight),
          width: isLowStock ? 1.5 : 0.8,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Thumbnail
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: SizedBox(
                width: 70,
                height: 70,
                child: ImageHelper.buildCachedImage(
                  imageUrl: product.imageUrl,
                  fit: BoxFit.cover,
                ),
              ),
            ),
            const SizedBox(width: 12),

            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    CurrencyFormatter.format(product.price),
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: isLowStock ? Colors.redAccent.withOpacity(0.12) : AppColors.accentMint.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          'Kho: ${product.stockQuantity} món',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: isLowStock ? Colors.redAccent : AppColors.accentMint,
                          ),
                        ),
                      ),
                      if (product.category != null) ...[
                        const SizedBox(width: 6),
                        Text(
                          product.category!.name,
                          style: const TextStyle(fontSize: 11, color: AppColors.textSecondaryLight),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),

            // Actions (Edit, Delete)
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: const Icon(Icons.edit_rounded, color: Colors.blueAccent, size: 20),
                  tooltip: 'Chỉnh sửa',
                  onPressed: () async {
                    final changed = await Navigator.push<bool>(
                      context,
                      MaterialPageRoute(
                        builder: (_) => AdminProductFormScreen(product: product),
                      ),
                    );
                    if (changed == true) _onSearch();
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent, size: 20),
                  tooltip: 'Xóa sản phẩm',
                  onPressed: () => _confirmDeleteProduct(context, product, adminProv),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _confirmDeleteProduct(BuildContext context, ProductModel product, AdminProvider adminProv) {
    final messenger = ScaffoldMessenger.of(context);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Xác nhận xóa sản phẩm?'),
        content: Text('Bạn có chắc chắn muốn xóa vĩnh viễn món bánh kẹo "${product.name}" không? Thao tác này không thể hoàn tác.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () async {
              Navigator.pop(ctx);
              final success = await adminProv.deleteProduct(product.id);
              if (!mounted) return;
              messenger.showSnackBar(
                SnackBar(
                  content: Text(success ? 'Đã xóa "${product.name}" thành công!' : 'Lỗi: Không thể xóa sản phẩm'),
                  backgroundColor: success ? AppColors.accentMint : Colors.redAccent,
                ),
              );
            },
            child: const Text('Xóa ngay', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
