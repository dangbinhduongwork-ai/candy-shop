import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/currency_formatter.dart';
import '../../providers/admin_provider.dart';
import '../../widgets/loading_widget.dart';
import 'banners/admin_banners_screen.dart';
import 'categories/admin_categories_screen.dart';
import 'customers/admin_customers_screen.dart';
import 'orders/admin_orders_screen.dart';
import 'products/admin_products_screen.dart';
import 'settings/admin_settings_screen.dart';
import 'vouchers/admin_vouchers_screen.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AdminProvider>().loadDashboardStats();
    });
  }

  @override
  Widget build(BuildContext context) {
    final adminProv = context.watch<AdminProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Trung Tâm Quản Trị'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Làm mới thống kê',
            onPressed: () => adminProv.loadDashboardStats(),
          ),
        ],
      ),
      body: adminProv.isLoadingStats && adminProv.orderStats == null
          ? const LoadingWidget(message: 'Đang tải số liệu quản trị...')
          : RefreshIndicator(
              color: AppColors.primary,
              onRefresh: () => adminProv.loadDashboardStats(),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Royal Banner Card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF8B5CF6), Color(0xFFEC4899), Color(0xFFF59E0B)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF8B5CF6).withOpacity(0.3),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.admin_panel_settings_rounded, size: 36, color: Colors.white),
                          ),
                          const SizedBox(width: 14),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Cổng Quản Trị Cửa Hàng',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                SizedBox(height: 4),
                                Text(
                                  'Theo dõi doanh thu, xử lý đơn hàng & quản trị toàn bộ hệ thống Nguyen Huong Store',
                                  style: TextStyle(color: Colors.white70, fontSize: 12),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Section Title: KPI
                    const Text(
                      'Thống kê hiệu quả kinh doanh',
                      style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),

                    // 4 KPI Cards Grid
                    _buildKpiGrid(adminProv),
                    const SizedBox(height: 24),

                    // Section Title: Modules
                    const Text(
                      'Menu Quản Trị Hệ Thống',
                      style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),

                    // Modules Grid
                    _buildModulesGrid(context, isDark),
                    const SizedBox(height: 30),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildKpiGrid(AdminProvider adminProv) {
    final orderStats = adminProv.orderStats;
    final custStats = adminProv.customerStats;

    final revenueText = orderStats != null
        ? CurrencyFormatter.format(orderStats.totalRevenue)
        : '0 ₫';
    final pendingOrders = orderStats?.pendingOrders ?? 0;
    final totalOrders = orderStats?.totalOrders ?? 0;
    final totalCustomers = custStats?.totalCustomers ?? 0;
    final lowStock = orderStats?.lowStockCount ?? 0;

    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: 1.35,
      children: [
        _buildKpiCard(
          title: 'Tổng doanh thu',
          value: revenueText,
          icon: Icons.monetization_on_rounded,
          gradient: const [Color(0xFF10B981), Color(0xFF059669)],
          subtitle: 'Từ đơn hoàn tất',
        ),
        _buildKpiCard(
          title: 'Đơn chờ duyệt',
          value: '$pendingOrders đơn',
          icon: Icons.pending_actions_rounded,
          gradient: const [Color(0xFFF59E0B), Color(0xFFD97706)],
          subtitle: 'Tổng $totalOrders đơn',
          badgeText: pendingOrders > 0 ? 'Mới' : null,
        ),
        _buildKpiCard(
          title: 'Cảnh báo tồn kho',
          value: '$lowStock món',
          icon: Icons.warning_amber_rounded,
          gradient: lowStock > 0
              ? const [Color(0xFFEF4444), Color(0xFFDC2626)]
              : const [Color(0xFF3B82F6), Color(0xFF2563EB)],
          subtitle: lowStock > 0 ? 'Sắp hết hàng' : 'Kho an toàn',
        ),
        _buildKpiCard(
          title: 'Tổng khách hàng',
          value: '$totalCustomers người',
          icon: Icons.people_alt_rounded,
          gradient: const [Color(0xFF8B5CF6), Color(0xFF7C3AED)],
          subtitle: 'Đã kích hoạt',
        ),
      ],
    );
  }

  Widget _buildKpiCard({
    required String title,
    required String value,
    required IconData icon,
    required List<Color> gradient,
    required String subtitle,
    String? badgeText,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: gradient,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: gradient.first.withOpacity(0.25),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600),
              ),
              if (badgeText != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    badgeText,
                    style: TextStyle(
                      color: gradient.first,
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                )
              else
                Icon(icon, color: Colors.white70, size: 18),
            ],
          ),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Text(
            subtitle,
            style: const TextStyle(color: Colors.white60, fontSize: 10),
          ),
        ],
      ),
    );
  }

  Widget _buildModulesGrid(BuildContext context, bool isDark) {
    final modules = [
      _ModuleItem(
        title: 'Quản lý Sản phẩm',
        subtitle: 'Kho bánh kẹo, giá, hình ảnh',
        icon: Icons.inventory_2_rounded,
        color: const Color(0xFFFF5376),
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const AdminProductsScreen()),
        ),
      ),
      _ModuleItem(
        title: 'Quản lý Đơn hàng',
        subtitle: 'Duyệt đơn, giao hàng, hoàn tất',
        icon: Icons.local_shipping_rounded,
        color: const Color(0xFFF59E0B),
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const AdminOrdersScreen()),
        ),
      ),
      _ModuleItem(
        title: 'Quản lý Danh mục',
        subtitle: 'Nhóm sản phẩm & bật/tắt hiển thị',
        icon: Icons.category_rounded,
        color: const Color(0xFF10B981),
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const AdminCategoriesScreen()),
        ),
      ),
      _ModuleItem(
        title: 'Mã Giảm Giá (Voucher)',
        subtitle: 'Khuyến mãi % hoặc tiền mặt',
        icon: Icons.confirmation_number_rounded,
        color: const Color(0xFF8B5CF6),
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const AdminVouchersScreen()),
        ),
      ),
      _ModuleItem(
        title: 'Banner Quảng Cáo',
        subtitle: 'Quản lý slide carousel trang chủ',
        icon: Icons.photo_library_rounded,
        color: const Color(0xFF06B6D4),
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const AdminBannersScreen()),
        ),
      ),
      _ModuleItem(
        title: 'Quản lý Khách Hàng',
        subtitle: 'Lịch sử mua, chi tiêu, khóa/mở',
        icon: Icons.people_rounded,
        color: const Color(0xFFEC4899),
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const AdminCustomersScreen()),
        ),
      ),
      _ModuleItem(
        title: 'Cài Đặt Cửa Hàng',
        subtitle: 'Phí vận chuyển, freeship & hotline',
        icon: Icons.storefront_rounded,
        color: const Color(0xFF64748B),
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const AdminSettingsScreen()),
        ),
      ),
    ];

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: modules.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final item = modules[index];
        return Card(
          elevation: isDark ? 0 : 1.5,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(
              color: isDark ? AppColors.borderDark : AppColors.borderLight,
              width: 0.8,
            ),
          ),
          child: ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            leading: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: item.color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(item.icon, color: item.color, size: 24),
            ),
            title: Text(
              item.title,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
            ),
            subtitle: Text(
              item.subtitle,
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight),
            ),
            trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 16, color: Colors.grey),
            onTap: item.onTap,
          ),
        );
      },
    );
  }
}

class _ModuleItem {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  _ModuleItem({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.onTap,
  });
}
