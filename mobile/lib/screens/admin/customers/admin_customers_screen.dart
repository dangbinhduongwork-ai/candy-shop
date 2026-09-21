import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../models/customer_model.dart';
import '../../../providers/admin_provider.dart';
import '../../../widgets/empty_state.dart';
import '../../../widgets/loading_widget.dart';

class AdminCustomersScreen extends StatefulWidget {
  const AdminCustomersScreen({super.key});

  @override
  State<AdminCustomersScreen> createState() => _AdminCustomersScreenState();
}

class _AdminCustomersScreenState extends State<AdminCustomersScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedStatus = 'ALL';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadCustomers();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _loadCustomers() {
    context.read<AdminProvider>().loadCustomers(
          search: _searchController.text.trim(),
          status: _selectedStatus,
        );
  }

  void _toggleLock(BuildContext context, CustomerSummaryModel customer, AdminProvider adminProv) {
    final willLock = customer.status == 'ACTIVE';
    final actionText = willLock ? 'Khóa tài khoản' : 'Mở khóa tài khoản';
    final messenger = ScaffoldMessenger.of(context);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('$actionText?'),
        content: Text('Bạn có chắc chắn muốn $actionText của khách hàng "${customer.fullName}" (${customer.email}) không?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: willLock ? Colors.redAccent : AppColors.accentMint,
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              final success = await adminProv.toggleCustomerStatus(customer.id, customer.status);
              if (!mounted) return;
              messenger.showSnackBar(
                SnackBar(
                  content: Text(success ? 'Đã $actionText thành công!' : 'Lỗi: Không thể thay đổi trạng thái'),
                  backgroundColor: success ? (willLock ? Colors.orange : AppColors.accentMint) : Colors.redAccent,
                ),
              );
            },
            child: Text(actionText, style: const TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showCustomerDetail(BuildContext context, CustomerSummaryModel customer) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 26,
                  backgroundColor: AppColors.primary.withOpacity(0.15),
                  child: Text(
                    customer.fullName.isNotEmpty ? customer.fullName[0].toUpperCase() : 'U',
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.primaryDark),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(customer.fullName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      const SizedBox(height: 2),
                      Text(customer.email, style: const TextStyle(fontSize: 13, color: AppColors.textSecondaryLight)),
                    ],
                  ),
                ),
              ],
            ),
            const Divider(height: 24),
            _buildDetailRow('Số điện thoại:', customer.phone ?? 'Chưa cập nhật'),
            const SizedBox(height: 8),
            _buildDetailRow('Địa chỉ:', customer.address ?? 'Chưa cập nhật'),
            const SizedBox(height: 8),
            _buildDetailRow('Tổng số đơn đặt:', '${customer.totalOrders} đơn'),
            const SizedBox(height: 8),
            _buildDetailRow('Tổng chi tiêu:', CurrencyFormatter.format(customer.totalSpent)),
            const SizedBox(height: 8),
            _buildDetailRow('Trạng thái tài khoản:', customer.isLocked ? 'Đang bị khóa' : 'Hoạt động bình thường'),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Đóng', style: TextStyle(color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      children: [
        SizedBox(
          width: 130,
          child: Text(label, style: const TextStyle(fontSize: 13, color: AppColors.textSecondaryLight)),
        ),
        Expanded(
          child: Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final adminProv = context.watch<AdminProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Quản Lý Khách Hàng'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _loadCustomers,
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter & Search
          Container(
            padding: const EdgeInsets.all(12),
            color: isDark ? AppColors.surfaceDark : Colors.white,
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Tìm theo tên, email hoặc số điện thoại...',
                    prefixIcon: const Icon(Icons.search_rounded),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear_rounded),
                            onPressed: () {
                              _searchController.clear();
                              _loadCustomers();
                            },
                          )
                        : null,
                    contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                  ),
                  onSubmitted: (_) => _loadCustomers(),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    FilterChip(
                      selected: _selectedStatus == 'ALL',
                      label: const Text('Tất cả'),
                      onSelected: (_) {
                        setState(() => _selectedStatus = 'ALL');
                        _loadCustomers();
                      },
                    ),
                    const SizedBox(width: 8),
                    FilterChip(
                      selected: _selectedStatus == 'ACTIVE',
                      label: const Text('Đang hoạt động'),
                      onSelected: (_) {
                        setState(() => _selectedStatus = 'ACTIVE');
                        _loadCustomers();
                      },
                    ),
                    const SizedBox(width: 8),
                    FilterChip(
                      selected: _selectedStatus == 'LOCKED',
                      label: const Text('Đã khóa'),
                      onSelected: (_) {
                        setState(() => _selectedStatus = 'LOCKED');
                        _loadCustomers();
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Customers List
          Expanded(
            child: adminProv.isLoadingCustomers
                ? const LoadingWidget(message: 'Đang tải danh sách khách hàng...')
                : adminProv.customers.isEmpty
                    ? EmptyStateWidget(
                        title: 'Không tìm thấy khách hàng',
                        subtitle: 'Không có tài khoản nào khớp với bộ lọc tìm kiếm.',
                        icon: Icons.people_outline_rounded,
                        buttonText: 'Tải lại',
                        onButtonPressed: _loadCustomers,
                      )
                    : RefreshIndicator(
                        color: AppColors.primary,
                        onRefresh: () async => _loadCustomers(),
                        child: ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: adminProv.customers.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 10),
                          itemBuilder: (context, index) {
                            final customer = adminProv.customers[index];
                            return _buildCustomerCard(context, customer, adminProv, isDark);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildCustomerCard(
    BuildContext context,
    CustomerSummaryModel customer,
    AdminProvider adminProv,
    bool isDark,
  ) {
    final isLocked = customer.isLocked;

    return Card(
      elevation: isDark ? 0 : 1.5,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: isLocked ? Colors.redAccent.withOpacity(0.4) : (isDark ? AppColors.borderDark : AppColors.borderLight),
          width: 0.8,
        ),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => _showCustomerDetail(context, customer),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              CircleAvatar(
                radius: 22,
                backgroundColor: isLocked
                    ? Colors.redAccent.withOpacity(0.15)
                    : AppColors.primary.withOpacity(0.15),
                child: Text(
                  customer.fullName.isNotEmpty ? customer.fullName[0].toUpperCase() : 'U',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: isLocked ? Colors.redAccent : AppColors.primaryDark,
                  ),
                ),
              ),
              const SizedBox(width: 12),

              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            customer.fullName,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: isLocked ? Colors.redAccent.withOpacity(0.12) : Colors.green.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            isLocked ? 'Đã khóa' : 'Hoạt động',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: isLocked ? Colors.redAccent : Colors.green,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      customer.email,
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${customer.totalOrders} đơn • Chi tiêu: ${CurrencyFormatter.format(customer.totalSpent)}',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primary),
                    ),
                  ],
                ),
              ),

              IconButton(
                icon: Icon(
                  isLocked ? Icons.lock_open_rounded : Icons.lock_outline_rounded,
                  color: isLocked ? Colors.green : Colors.redAccent,
                ),
                tooltip: isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản',
                onPressed: () => _toggleLock(context, customer, adminProv),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
