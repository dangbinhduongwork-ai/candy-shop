import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/utils/image_helper.dart';
import '../../../models/order_model.dart';
import '../../../providers/admin_provider.dart';
import '../../../widgets/custom_button.dart';

class AdminOrderDetailScreen extends StatefulWidget {
  final OrderModel order;

  const AdminOrderDetailScreen({super.key, required this.order});

  @override
  State<AdminOrderDetailScreen> createState() => _AdminOrderDetailScreenState();
}

class _AdminOrderDetailScreenState extends State<AdminOrderDetailScreen> {
  late OrderModel _currentOrder;
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    _currentOrder = widget.order;
  }

  Future<void> _updateStatus(String newStatus, String statusLabel) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Xác nhận: $statusLabel?'),
        content: Text('Bạn có chắc chắn muốn chuyển đơn hàng #${_currentOrder.id} sang trạng thái "$statusLabel" không?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Hủy')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: newStatus == 'CANCELLED' ? Colors.redAccent : AppColors.primary,
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Xác nhận', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm != true) return;
    if (!mounted) return;

    setState(() => _isProcessing = true);
    final adminProv = context.read<AdminProvider>();
    final messenger = ScaffoldMessenger.of(context);

    try {
      final success = await adminProv.updateOrderStatus(_currentOrder.id, newStatus);
      if (!mounted) return;
      if (success) {
        setState(() {
          _currentOrder = adminProv.orders.firstWhere(
            (o) => o.id == _currentOrder.id,
            orElse: () => _currentOrder.copyWith(status: newStatus),
          );
        });
        messenger.showSnackBar(
          SnackBar(
            content: Text('Đã cập nhật đơn hàng thành "$statusLabel"!'),
            backgroundColor: AppColors.accentMint,
          ),
        );
      } else {
        messenger.showSnackBar(
          SnackBar(
            content: Text(adminProv.ordersError ?? 'Lỗi: Không thể cập nhật trạng thái'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Color statusColor;
    String statusText;
    switch (_currentOrder.status) {
      case 'PENDING':
        statusColor = const Color(0xFFF59E0B);
        statusText = 'Chờ duyệt';
        break;
      case 'CONFIRMED':
        statusColor = const Color(0xFF3B82F6);
        statusText = 'Đã duyệt';
        break;
      case 'SHIPPING':
        statusColor = const Color(0xFF8B5CF6);
        statusText = 'Đang giao hàng';
        break;
      case 'COMPLETED':
        statusColor = const Color(0xFF10B981);
        statusText = 'Đã hoàn tất';
        break;
      case 'CANCELLED':
        statusColor = Colors.redAccent;
        statusText = 'Đã hủy';
        break;
      default:
        statusColor = Colors.grey;
        statusText = _currentOrder.status;
    }

    return WillPopScope(
      onWillPop: () async {
        Navigator.pop(context, true);
        return false;
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text('Chi Tiết Đơn #${_currentOrder.id}'),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Status Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: statusColor.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.info_outline_rounded, color: statusColor, size: 28),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            statusText,
                            style: TextStyle(
                              color: statusColor,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Ngày đặt: ${_currentOrder.createdAt ?? "N/A"}',
                            style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Customer Info Card
              _buildSectionCard(
                title: 'Thông tin người nhận',
                icon: Icons.person_rounded,
                isDark: isDark,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildInfoRow('Họ và tên:', _currentOrder.recipientName),
                    const SizedBox(height: 6),
                    _buildInfoRow('Số điện thoại:', _currentOrder.phone),
                    const SizedBox(height: 6),
                    _buildInfoRow('Địa chỉ giao hàng:', _currentOrder.shippingAddress),
                    if (_currentOrder.note != null && _currentOrder.note!.isNotEmpty) ...[
                      const SizedBox(height: 6),
                      _buildInfoRow('Ghi chú của khách:', _currentOrder.note!),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Items Card
              _buildSectionCard(
                title: 'Danh sách bánh kẹo (${_currentOrder.items.length})',
                icon: Icons.shopping_basket_rounded,
                isDark: isDark,
                child: Column(
                  children: _currentOrder.items.map((item) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: SizedBox(
                              width: 50,
                              height: 50,
                              child: ImageHelper.buildCachedImage(
                                imageUrl: item.imageUrl,
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.productName,
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'Số lượng: x${item.quantity}',
                                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            CurrencyFormatter.format(item.subtotal),
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 16),

              // Financial Breakdown Card
              _buildSectionCard(
                title: 'Thanh toán & Hóa đơn',
                icon: Icons.receipt_rounded,
                isDark: isDark,
                child: Column(
                  children: [
                    _buildSummaryRow('Tạm tính:', CurrencyFormatter.format(_currentOrder.subtotal)),
                    if (_currentOrder.discountAmount > 0) ...[
                      const SizedBox(height: 6),
                      _buildSummaryRow(
                        'Giảm giá (${_currentOrder.voucherCode ?? "Voucher"}):',
                        '-${CurrencyFormatter.format(_currentOrder.discountAmount)}',
                        valueColor: Colors.redAccent,
                      ),
                    ],
                    const SizedBox(height: 6),
                    _buildSummaryRow('Phí vận chuyển:', CurrencyFormatter.format(_currentOrder.shippingFee)),
                    const Divider(height: 16),
                    _buildSummaryRow(
                      'TỔNG CỘNG:',
                      CurrencyFormatter.format(_currentOrder.finalAmount),
                      isBold: true,
                      valueColor: AppColors.primary,
                      fontSize: 16,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Workflow Action Buttons
              _buildWorkflowActions(),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildWorkflowActions() {
    if (_isProcessing) {
      return const Center(child: CircularProgressIndicator(color: AppColors.primary));
    }

    if (_currentOrder.status == 'PENDING') {
      return Column(
        children: [
          CustomButton(
            text: 'XÁC NHẬN ĐƠN HÀNG',
            icon: Icons.check_circle_outline_rounded,
            onPressed: () => _updateStatus('CONFIRMED', 'Đã xác nhận'),
          ),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.redAccent,
              side: const BorderSide(color: Colors.redAccent),
              minimumSize: const Size(double.infinity, 48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            icon: const Icon(Icons.cancel_outlined),
            label: const Text('Hủy đơn hàng này'),
            onPressed: () => _updateStatus('CANCELLED', 'Đã hủy đơn'),
          ),
        ],
      );
    }

    if (_currentOrder.status == 'CONFIRMED') {
      return Column(
        children: [
          CustomButton(
            text: 'BẮT ĐẦU GIAO HÀNG',
            icon: Icons.local_shipping_rounded,
            onPressed: () => _updateStatus('SHIPPING', 'Đang giao hàng'),
          ),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.redAccent,
              side: const BorderSide(color: Colors.redAccent),
              minimumSize: const Size(double.infinity, 48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            icon: const Icon(Icons.cancel_outlined),
            label: const Text('Hủy đơn hàng'),
            onPressed: () => _updateStatus('CANCELLED', 'Đã hủy đơn'),
          ),
        ],
      );
    }

    if (_currentOrder.status == 'SHIPPING') {
      return CustomButton(
        text: 'HOÀN TẤT ĐƠN HÀNG',
        icon: Icons.verified_rounded,
        onPressed: () => _updateStatus('COMPLETED', 'Đã hoàn tất'),
      );
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.grey.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Center(
        child: Text(
          _currentOrder.status == 'COMPLETED'
              ? 'Đơn hàng đã hoàn tất thành công!'
              : 'Đơn hàng này đã bị hủy.',
          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.grey),
        ),
      ),
    );
  }

  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required bool isDark,
    required Widget child,
  }) {
    return Card(
      elevation: isDark ? 0 : 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: isDark ? AppColors.borderDark : AppColors.borderLight, width: 0.8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 18, color: AppColors.primary),
                const SizedBox(width: 8),
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              ],
            ),
            const Divider(height: 20),
            child,
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 120,
          child: Text(label, style: const TextStyle(fontSize: 13, color: AppColors.textSecondaryLight)),
        ),
        Expanded(
          child: Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
        ),
      ],
    );
  }

  Widget _buildSummaryRow(
    String label,
    String value, {
    bool isBold = false,
    Color? valueColor,
    double fontSize = 13,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: fontSize,
            fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
            color: isBold ? null : AppColors.textSecondaryLight,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: fontSize,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
            color: valueColor,
          ),
        ),
      ],
    );
  }
}
