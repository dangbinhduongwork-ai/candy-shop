import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/currency_formatter.dart';
import '../../providers/auth_provider.dart';
import '../../providers/cart_provider.dart';
import '../../providers/order_provider.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_textfield.dart';
import '../orders/order_detail_screen.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _noteController = TextEditingController();
  final _voucherController = TextEditingController();

  bool _isApplyingVoucher = false;

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthProvider>().currentUser;
    if (user != null) {
      _nameController.text = user.fullName;
      _phoneController.text = user.phone ?? '';
      _addressController.text = user.address ?? '';
    }

    // Load available vouchers & shipping settings
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrderProvider>().loadCheckoutMetadata();
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _noteController.dispose();
    _voucherController.dispose();
    super.dispose();
  }

  Future<void> _handleApplyVoucher() async {
    final code = _voucherController.text.trim();
    if (code.isEmpty) return;

    setState(() => _isApplyingVoucher = true);
    final orderProv = context.read<OrderProvider>();
    final success = await orderProv.applyVoucher(code);

    if (!mounted) return;
    setState(() => _isApplyingVoucher = false);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          success
              ? 'Áp dụng mã giảm giá "$code" thành công!'
              : (orderProv.errorMessage ?? 'Mã giảm giá không hợp lệ'),
        ),
        backgroundColor: success ? AppColors.accentMint : Colors.redAccent,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  Future<void> _handlePlaceOrder() async {
    if (!_formKey.currentState!.validate()) return;

    final orderProv = context.read<OrderProvider>();
    final cartProv = context.read<CartProvider>();

    final createdOrder = await orderProv.placeOrder(
      receiverName: _nameController.text.trim(),
      receiverPhone: _phoneController.text.trim(),
      shippingAddress: _addressController.text.trim(),
      note: _noteController.text.trim().isNotEmpty ? _noteController.text.trim() : null,
      paymentMethod: 'COD',
    );

    if (!mounted) return;

    if (createdOrder != null) {
      // Reload empty cart
      await cartProv.loadCart();

      if (!mounted) return;

      // Show success dialog
      await showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(Icons.check_circle_rounded, color: AppColors.accentMint, size: 28),
              SizedBox(width: 8),
              Text('Đặt hàng thành công!'),
            ],
          ),
          content: Text(
            'Mã đơn hàng của bạn là: ${createdOrder.orderCode}.\nCảm ơn bạn đã lựa chọn Nguyen Huong Store!',
          ),
          actions: [
            CustomButton(
              text: 'Xem chi tiết đơn',
              height: 42,
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(
                    builder: (_) => OrderDetailScreen(orderId: createdOrder.id),
                  ),
                );
              },
            ),
          ],
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(orderProv.errorMessage ?? 'Không thể tạo đơn hàng. Vui lòng thử lại.'),
          backgroundColor: Colors.redAccent,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final orderProv = context.watch<OrderProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final subtotal = cart.totalAmount;
    final shippingFee = orderProv.shippingSetting.calculateShippingFee(subtotal);
    final discount = orderProv.appliedVoucher?.discountAmount ?? 0.0;
    final finalTotal = (subtotal + shippingFee - discount).clamp(0.0, double.infinity);

    return Scaffold(
      appBar: AppBar(title: const Text('Xác nhận & Đặt hàng')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Delivery info card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.location_on_rounded, color: AppColors.primary, size: 20),
                          SizedBox(width: 8),
                          Text(
                            'Thông tin nhận hàng',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      CustomTextField(
                        controller: _nameController,
                        label: 'Họ tên người nhận *',
                        hint: 'Nguyễn Văn A',
                        prefixIcon: Icons.person_outline,
                        validator: (v) => (v == null || v.trim().isEmpty) ? 'Vui lòng nhập tên người nhận' : null,
                      ),
                      const SizedBox(height: 12),
                      CustomTextField(
                        controller: _phoneController,
                        label: 'Số điện thoại *',
                        hint: '0912345678',
                        prefixIcon: Icons.phone_outlined,
                        keyboardType: TextInputType.phone,
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) return 'Vui lòng nhập số điện thoại';
                          if (!RegExp(r'^(0[3-9][0-9]{8}|84[3-9][0-9]{8})$').hasMatch(v.trim())) {
                            return 'Số điện thoại không đúng định dạng VN (VD: 0912345678)';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 12),
                      CustomTextField(
                        controller: _addressController,
                        label: 'Địa chỉ giao hàng *',
                        hint: 'Số nhà, ngõ/đường, phường, quận/huyện',
                        prefixIcon: Icons.home_outlined,
                        maxLines: 2,
                        validator: (v) => (v == null || v.trim().isEmpty) ? 'Vui lòng nhập địa chỉ giao hàng' : null,
                      ),
                      const SizedBox(height: 12),
                      CustomTextField(
                        controller: _noteController,
                        label: 'Ghi chú đơn hàng (Tùy chọn)',
                        hint: 'Giao giờ hành chính, gọi trước khi đến...',
                        prefixIcon: Icons.notes_outlined,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Voucher Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.confirmation_number_outlined, color: AppColors.secondary, size: 20),
                          SizedBox(width: 8),
                          Text(
                            'Mã ưu đãi / Voucher',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _voucherController,
                              textCapitalization: TextCapitalization.characters,
                              decoration: const InputDecoration(
                                hintText: 'Nhập mã giảm giá...',
                                contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          CustomButton(
                            text: 'Áp dụng',
                            width: 95,
                            height: 46,
                            isLoading: _isApplyingVoucher,
                            onPressed: _handleApplyVoucher,
                          ),
                        ],
                      ),
                      if (orderProv.appliedVoucher != null) ...[
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: AppColors.accentMint.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Đã áp dụng mã: ${orderProv.appliedVoucher!.code}',
                                style: const TextStyle(
                                  color: AppColors.accentMint,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.close, size: 18, color: Colors.redAccent),
                                onPressed: orderProv.removeVoucher,
                              ),
                            ],
                          ),
                        ),
                      ],
                      if (orderProv.availableVouchers.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        const Text(
                          'Mã giảm giá khả dụng:',
                          style: TextStyle(fontSize: 12, color: AppColors.textSecondaryLight),
                        ),
                        const SizedBox(height: 6),
                        Wrap(
                          spacing: 8,
                          children: orderProv.availableVouchers.map((v) {
                            return ActionChip(
                              label: Text('${v.code} (${v.name})', style: const TextStyle(fontSize: 11)),
                              onPressed: () {
                                _voucherController.text = v.code;
                                _handleApplyVoucher();
                              },
                            );
                          }).toList(),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Payment Method Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.payment_rounded, color: AppColors.primary, size: 20),
                          SizedBox(width: 8),
                          Text(
                            'Phương thức thanh toán',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.primary, width: 1.5),
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.local_shipping_outlined, color: AppColors.primary),
                            SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Thanh toán khi nhận hàng (COD)',
                                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                  ),
                                  Text(
                                    'Nhận hàng và thanh toán tiền mặt trực tiếp cho bưu tá',
                                    style: TextStyle(fontSize: 12, color: AppColors.textSecondaryLight),
                                  ),
                                ],
                              ),
                            ),
                            Icon(Icons.check_circle, color: AppColors.primary),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Price Breakdown Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Chi tiết thanh toán',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Tổng tiền hàng:', style: TextStyle(color: AppColors.textSecondaryLight)),
                          Text(CurrencyFormatter.format(subtotal)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Phí vận chuyển:', style: TextStyle(color: AppColors.textSecondaryLight)),
                          Text(
                            shippingFee == 0 ? 'Miễn phí' : CurrencyFormatter.format(shippingFee),
                            style: TextStyle(
                              color: shippingFee == 0 ? AppColors.accentMint : null,
                              fontWeight: shippingFee == 0 ? FontWeight.bold : null,
                            ),
                          ),
                        ],
                      ),
                      if (discount > 0) ...[
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Giảm giá voucher:', style: TextStyle(color: AppColors.accentMint)),
                            Text(
                              '- ${CurrencyFormatter.format(discount)}',
                              style: const TextStyle(color: AppColors.accentMint, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ],
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 8),
                        child: Divider(),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Tổng thanh toán:',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          Text(
                            CurrencyFormatter.format(finalTotal),
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Place Order Button
              CustomButton(
                text: 'Đặt hàng ngay • ${CurrencyFormatter.format(finalTotal)}',
                isLoading: orderProv.isPlacingOrder,
                onPressed: _handlePlaceOrder,
              ),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }
}
