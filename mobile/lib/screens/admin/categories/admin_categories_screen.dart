import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/image_helper.dart';
import '../../../models/category_model.dart';
import '../../../providers/admin_provider.dart';
import '../../../widgets/empty_state.dart';
import '../../../widgets/loading_widget.dart';
import 'admin_category_dialog.dart';

class AdminCategoriesScreen extends StatefulWidget {
  const AdminCategoriesScreen({super.key});

  @override
  State<AdminCategoriesScreen> createState() => _AdminCategoriesScreenState();
}

class _AdminCategoriesScreenState extends State<AdminCategoriesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AdminProvider>().loadCategories();
    });
  }

  void _showCategoryDialog([CategoryModel? category]) async {
    final changed = await showDialog<bool>(
      context: context,
      builder: (_) => AdminCategoryDialog(category: category),
    );
    if (changed == true && mounted) {
      context.read<AdminProvider>().loadCategories();
    }
  }

  void _confirmDelete(BuildContext context, CategoryModel category, AdminProvider adminProv) {
    final messenger = ScaffoldMessenger.of(context);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Xác nhận xóa danh mục?'),
        content: Text('Bạn có chắc chắn muốn xóa danh mục "${category.name}" không? Nếu có sản phẩm liên kết, backend sẽ từ chối để đảm bảo an toàn dữ liệu.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () async {
              Navigator.pop(ctx);
              final success = await adminProv.deleteCategory(category.id);
              if (!mounted) return;
              messenger.showSnackBar(
                SnackBar(
                  content: Text(success ? 'Đã xóa danh mục thành công!' : (adminProv.categoriesError ?? 'Không thể xóa danh mục')),
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

  @override
  Widget build(BuildContext context) {
    final adminProv = context.watch<AdminProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Quản Lý Danh Mục'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => adminProv.loadCategories(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text('Thêm Danh Mục', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        onPressed: () => _showCategoryDialog(),
      ),
      body: adminProv.isLoadingCategories
          ? const LoadingWidget(message: 'Đang tải danh mục bánh kẹo...')
          : adminProv.categories.isEmpty
              ? EmptyStateWidget(
                  title: 'Chưa có danh mục nào',
                  subtitle: 'Bấm nút "Thêm Danh Mục" để tạo nhóm bánh kẹo đầu tiên.',
                  icon: Icons.category_outlined,
                  buttonText: 'Tải lại',
                  onButtonPressed: () => adminProv.loadCategories(),
                )
              : RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: () async => adminProv.loadCategories(),
                  child: ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
                    itemCount: adminProv.categories.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final cat = adminProv.categories[index];
                      return Card(
                        elevation: isDark ? 0 : 1.5,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                          side: BorderSide(
                            color: isDark ? AppColors.borderDark : AppColors.borderLight,
                            width: 0.8,
                          ),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          child: Row(
                            children: [
                              // Icon / Image
                              ClipRRect(
                                borderRadius: BorderRadius.circular(10),
                                child: SizedBox(
                                  width: 50,
                                  height: 50,
                                  child: cat.imageUrl != null && cat.imageUrl!.isNotEmpty
                                      ? ImageHelper.buildCachedImage(imageUrl: cat.imageUrl!, fit: BoxFit.cover)
                                      : Container(
                                          color: AppColors.primaryLight.withOpacity(0.2),
                                          child: const Icon(Icons.category_rounded, color: AppColors.primary),
                                        ),
                                ),
                              ),
                              const SizedBox(width: 14),

                              // Info
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            cat.name,
                                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                          ),
                                        ),
                                        Text(
                                          '#${cat.displayOrder}',
                                          style: const TextStyle(fontSize: 11, color: Colors.grey),
                                        ),
                                      ],
                                    ),
                                    if (cat.description != null && cat.description!.isNotEmpty) ...[
                                      const SizedBox(height: 2),
                                      Text(
                                        cat.description!,
                                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: cat.active ? Colors.green.withOpacity(0.12) : Colors.grey.withOpacity(0.2),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Text(
                                            cat.active ? 'Đang hiển thị' : 'Đang ẩn',
                                            style: TextStyle(
                                              fontSize: 10,
                                              fontWeight: FontWeight.bold,
                                              color: cat.active ? Colors.green : Colors.grey,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),

                              // Active switch & actions
                              Switch(
                                value: cat.active,
                                activeColor: AppColors.primary,
                                onChanged: (val) {
                                  adminProv.toggleCategoryStatus(cat.id, val);
                                },
                              ),
                              IconButton(
                                icon: const Icon(Icons.edit_rounded, color: Colors.blueAccent, size: 20),
                                onPressed: () => _showCategoryDialog(cat),
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent, size: 20),
                                onPressed: () => _confirmDelete(context, cat, adminProv),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
