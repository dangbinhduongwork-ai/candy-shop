import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/image_helper.dart';
import '../../../models/banner_model.dart';
import '../../../providers/admin_provider.dart';
import '../../../widgets/empty_state.dart';
import '../../../widgets/loading_widget.dart';
import 'admin_banner_form_screen.dart';

class AdminBannersScreen extends StatefulWidget {
  const AdminBannersScreen({super.key});

  @override
  State<AdminBannersScreen> createState() => _AdminBannersScreenState();
}

class _AdminBannersScreenState extends State<AdminBannersScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AdminProvider>().loadBanners();
    });
  }

  void _confirmDelete(BuildContext context, BannerModel banner, AdminProvider adminProv) {
    final messenger = ScaffoldMessenger.of(context);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Xác nhận xóa Banner?'),
        content: const Text('Bạn có chắc chắn muốn xóa vĩnh viễn banner quảng cáo này không?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () async {
              Navigator.pop(ctx);
              final success = await adminProv.deleteBanner(banner.id);
              if (!mounted) return;
              messenger.showSnackBar(
                SnackBar(
                  content: Text(success ? 'Đã xóa banner thành công!' : 'Lỗi: Không thể xóa banner'),
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
        title: const Text('Banner Quảng Cáo'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => adminProv.loadBanners(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text('Thêm Banner', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        onPressed: () async {
          final changed = await Navigator.push<bool>(
            context,
            MaterialPageRoute(builder: (_) => const AdminBannerFormScreen()),
          );
          if (changed == true) adminProv.loadBanners();
        },
      ),
      body: adminProv.isLoadingBanners
          ? const LoadingWidget(message: 'Đang tải danh sách banner...')
          : adminProv.banners.isEmpty
              ? EmptyStateWidget(
                  title: 'Chưa có banner nào',
                  subtitle: 'Tạo banner quảng cáo để làm nổi bật trang chủ.',
                  icon: Icons.photo_library_outlined,
                  buttonText: 'Tải lại',
                  onButtonPressed: () => adminProv.loadBanners(),
                )
              : RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: () async => adminProv.loadBanners(),
                  child: ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
                    itemCount: adminProv.banners.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 16),
                    itemBuilder: (context, index) {
                      final banner = adminProv.banners[index];
                      return Card(
                        clipBehavior: Clip.antiAlias,
                        elevation: isDark ? 0 : 2,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                          side: BorderSide(
                            color: isDark ? AppColors.borderDark : AppColors.borderLight,
                            width: 0.8,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Banner Image Preview
                            AspectRatio(
                              aspectRatio: 2.2,
                              child: ImageHelper.buildCachedImage(
                                imageUrl: banner.imageUrl,
                                fit: BoxFit.cover,
                              ),
                            ),

                            // Footer info & actions
                            Padding(
                              padding: const EdgeInsets.all(12),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          banner.title != null && banner.title!.isNotEmpty
                                              ? banner.title!
                                              : 'Banner #${banner.id} (Không tiêu đề)',
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          'Thứ tự: ${banner.displayOrder} • ${banner.targetUrl ?? "Không có link đích"}',
                                          style: const TextStyle(fontSize: 11, color: AppColors.textSecondaryLight),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ],
                                    ),
                                  ),
                                  Switch(
                                    value: banner.active,
                                    activeColor: AppColors.primary,
                                    onChanged: (val) {
                                      adminProv.toggleBannerStatus(banner.id, val);
                                    },
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.edit_rounded, color: Colors.blueAccent, size: 20),
                                    onPressed: () async {
                                      final changed = await Navigator.push<bool>(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) => AdminBannerFormScreen(banner: banner),
                                        ),
                                      );
                                      if (changed == true) adminProv.loadBanners();
                                    },
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent, size: 20),
                                    onPressed: () => _confirmDelete(context, banner, adminProv),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
