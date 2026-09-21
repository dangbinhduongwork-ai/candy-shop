import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../models/voucher_model.dart';
import '../../../providers/admin_provider.dart';
import '../../../widgets/empty_state.dart';
import '../../../widgets/loading_widget.dart';
import 'admin_voucher_form_screen.dart';

class AdminVouchersScreen extends StatefulWidget {
  const AdminVouchersScreen({super.key});

  @override
  State<AdminVouchersScreen> createState() => _AdminVouchersScreenState();
}

class _AdminVouchersScreenState extends State<AdminVouchersScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadVouchers();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _loadVouchers() {
    context.read<AdminProvider>().loadVouchers(search: _searchController.text.trim());
  }

  void _confirmDelete(BuildContext context, VoucherModel voucher, AdminProvider adminProv) {
    final messenger = ScaffoldMessenger.of(context);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Xác nhận xóa Voucher?'),
        content: Text('Bạn có chắc chắn muốn xóa mã giảm giá "${voucher.code}" không?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () async {
              Navigator.pop(ctx);
              final success = await adminProv.deleteVoucher(voucher.id);
              if (!mounted) return;
              messenger.showSnackBar(
                SnackBar(
                  content: Text(success ? 'Đã xóa voucher thành công!' : 'Lỗi: Không thể xóa voucher'),
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
        title: const Text('Quản Lý Mã Giảm Giá'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _loadVouchers,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text('Tạo Voucher', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        onPressed: () async {
          final changed = await Navigator.push<bool>(
            context,
            MaterialPageRoute(builder: (_) => const AdminVoucherFormScreen()),
          );
          if (changed == true) _loadVouchers();
        },
      ),
      body: Column(
        children: [
          // Search box
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Tìm kiếm mã voucher...',
                prefixIcon: const Icon(Icons.search_rounded),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded),
                        onPressed: () {
                          _searchController.clear();
                          _loadVouchers();
                        },
                      )
                    : null,
                contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
              ),
              onSubmitted: (_) => _loadVouchers(),
            ),
          ),

          // Voucher list
          Expanded(
            child: adminProv.isLoadingVouchers
                ? const LoadingWidget(message: 'Đang tải mã giảm giá...')
                : adminProv.vouchers.isEmpty
                    ? EmptyStateWidget(
                        title: 'Chưa có voucher nào',
                        subtitle: 'Tạo mã voucher để kích cầu mua sắm bánh kẹo.',
                        icon: Icons.confirmation_number_outlined,
                        buttonText: 'Tải lại',
                        onButtonPressed: _loadVouchers,
                      )
                    : RefreshIndicator(
                        color: AppColors.primary,
                        onRefresh: () async => _loadVouchers(),
                        child: ListView.separated(
                          padding: const EdgeInsets.fromLTRB(16, 8, 16, 80),
                          itemCount: adminProv.vouchers.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final voucher = adminProv.vouchers[index];
                            return _buildVoucherCard(context, voucher, adminProv, isDark);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildVoucherCard(BuildContext context, VoucherModel voucher, AdminProvider adminProv, bool isDark) {
    final isPercent = voucher.discountType == 'PERCENTAGE';
    final discountStr = isPercent
        ? '-${voucher.discountValue.toInt()}%'
        : '-${CurrencyFormatter.format(voucher.discountValue)}';

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
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            // Left discount badge
            Container(
              width: 70,
              height: 70,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: isPercent
                      ? const [Color(0xFF8B5CF6), Color(0xFF6D28D9)]
                      : const [Color(0xFF10B981), Color(0xFF047857)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Center(
                child: Text(
                  discountStr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
            const SizedBox(width: 14),

            // Middle info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          voucher.code,
                          style: const TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                            letterSpacing: 1,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    voucher.name,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Đơn tối thiểu: ${CurrencyFormatter.format(voucher.minOrderAmount)}',
                    style: const TextStyle(fontSize: 11, color: AppColors.textSecondaryLight),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Đã dùng: ${voucher.usageCount} / ${voucher.maxUsageCount} lượt',
                    style: const TextStyle(fontSize: 11, color: AppColors.accentMint, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),

            // Actions
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: const Icon(Icons.edit_rounded, color: Colors.blueAccent, size: 20),
                  onPressed: () async {
                    final changed = await Navigator.push<bool>(
                      context,
                      MaterialPageRoute(
                        builder: (_) => AdminVoucherFormScreen(voucher: voucher),
                      ),
                    );
                    if (changed == true) _loadVouchers();
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent, size: 20),
                  onPressed: () => _confirmDelete(context, voucher, adminProv),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
