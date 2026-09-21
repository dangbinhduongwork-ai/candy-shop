import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../providers/admin_provider.dart';
import '../../../widgets/custom_button.dart';
import '../../../widgets/custom_textfield.dart';
import '../../../widgets/loading_widget.dart';

class AdminSettingsScreen extends StatefulWidget {
  const AdminSettingsScreen({super.key});

  @override
  State<AdminSettingsScreen> createState() => _AdminSettingsScreenState();
}

class _AdminSettingsScreenState extends State<AdminSettingsScreen> {
  // Shipping
  late TextEditingController _shippingFeeController;
  late TextEditingController _freeThresholdController;

  // General
  late TextEditingController _shopNameController;
  late TextEditingController _shopTitleController;
  late TextEditingController _shopSloganController;
  late TextEditingController _announcementController;
  late TextEditingController _hotlineController;
  late TextEditingController _addressController;
  late TextEditingController _emailController;

  bool _isSavingShipping = false;
  bool _isSavingGeneral = false;

  @override
  void initState() {
    super.initState();
    _shippingFeeController = TextEditingController();
    _freeThresholdController = TextEditingController();
    _shopNameController = TextEditingController();
    _shopTitleController = TextEditingController();
    _shopSloganController = TextEditingController();
    _announcementController = TextEditingController();
    _hotlineController = TextEditingController();
    _addressController = TextEditingController();
    _emailController = TextEditingController();

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final adminProv = context.read<AdminProvider>();
      await adminProv.loadSettings();
      _populateFields(adminProv);
    });
  }

  void _populateFields(AdminProvider adminProv) {
    if (adminProv.shippingSetting != null) {
      _shippingFeeController.text = adminProv.shippingSetting!.defaultShippingFee.toInt().toString();
      _freeThresholdController.text = adminProv.shippingSetting!.freeShippingThreshold.toInt().toString();
    }
    if (adminProv.generalSetting != null) {
      final g = adminProv.generalSetting!;
      _shopNameController.text = g.shopName;
      _shopTitleController.text = g.shopTitle ?? '';
      _shopSloganController.text = g.shopSlogan ?? '';
      _announcementController.text = g.headerAnnouncement ?? '';
      _hotlineController.text = g.headerHotline ?? '';
      _addressController.text = g.footerAddress ?? '';
      _emailController.text = g.footerEmail ?? '';
    }
  }

  @override
  void dispose() {
    _shippingFeeController.dispose();
    _freeThresholdController.dispose();
    _shopNameController.dispose();
    _shopTitleController.dispose();
    _shopSloganController.dispose();
    _announcementController.dispose();
    _hotlineController.dispose();
    _addressController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _saveShipping() async {
    final fee = double.tryParse(_shippingFeeController.text.trim()) ?? 30000.0;
    final threshold = double.tryParse(_freeThresholdController.text.trim()) ?? 300000.0;

    setState(() => _isSavingShipping = true);
    final adminProv = context.read<AdminProvider>();

    try {
      final success = await adminProv.updateShippingSetting(fee, threshold);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(success ? 'Cập nhật phí vận chuyển thành công!' : 'Lỗi: Không thể lưu cài đặt'),
            backgroundColor: success ? AppColors.accentMint : Colors.redAccent,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSavingShipping = false);
    }
  }

  Future<void> _saveGeneral() async {
    final payload = {
      'shopName': _shopNameController.text.trim(),
      'shopTitle': _shopTitleController.text.trim(),
      'shopSlogan': _shopSloganController.text.trim(),
      'headerAnnouncement': _announcementController.text.trim(),
      'headerHotline': _hotlineController.text.trim(),
      'footerAddress': _addressController.text.trim(),
      'footerEmail': _emailController.text.trim(),
    };

    setState(() => _isSavingGeneral = true);
    final adminProv = context.read<AdminProvider>();

    try {
      final success = await adminProv.updateGeneralSetting(payload);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(success ? 'Cập nhật thông tin cửa hàng thành công!' : 'Lỗi: Không thể lưu thông tin'),
            backgroundColor: success ? AppColors.accentMint : Colors.redAccent,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSavingGeneral = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final adminProv = context.watch<AdminProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Cài Đặt Cửa Hàng'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () async {
              await adminProv.loadSettings();
              _populateFields(adminProv);
            },
          ),
        ],
      ),
      body: adminProv.isLoadingSettings && adminProv.shippingSetting == null
          ? const LoadingWidget(message: 'Đang tải thông tin cấu hình shop...')
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Shipping Section
                  _buildSectionHeader('Chính sách giao hàng & Phí ship', Icons.local_shipping_rounded),
                  const SizedBox(height: 10),
                  Card(
                    elevation: isDark ? 0 : 1.5,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                      side: BorderSide(color: isDark ? AppColors.borderDark : AppColors.borderLight, width: 0.8),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          CustomTextField(
                            controller: _shippingFeeController,
                            label: 'Phí vận chuyển tiêu chuẩn (VNĐ)',
                            hint: 'VD: 30000',
                            prefixIcon: Icons.attach_money_rounded,
                            keyboardType: TextInputType.number,
                          ),
                          const SizedBox(height: 12),
                          CustomTextField(
                            controller: _freeThresholdController,
                            label: 'Ngưỡng đạt tiêu chuẩn Freeship 0đ (VNĐ)',
                            hint: 'VD: 300000',
                            prefixIcon: Icons.card_giftcard_rounded,
                            keyboardType: TextInputType.number,
                          ),
                          const SizedBox(height: 16),
                          CustomButton(
                            text: 'LƯU CẤU HÌNH PHÍ SHIP',
                            isLoading: _isSavingShipping,
                            onPressed: _saveShipping,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // General Branding Section
                  _buildSectionHeader('Thông tin cửa hàng & Hotline', Icons.storefront_rounded),
                  const SizedBox(height: 10),
                  Card(
                    elevation: isDark ? 0 : 1.5,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                      side: BorderSide(color: isDark ? AppColors.borderDark : AppColors.borderLight, width: 0.8),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          CustomTextField(
                            controller: _shopNameController,
                            label: 'Tên thương hiệu cửa hàng',
                            hint: 'Nguyen Huong Store',
                            prefixIcon: Icons.store_rounded,
                          ),
                          const SizedBox(height: 12),
                          CustomTextField(
                            controller: _shopTitleController,
                            label: 'Tiêu đề phụ',
                            hint: 'Bánh Kẹo & Nhu Yếu Phẩm',
                            prefixIcon: Icons.subtitles_rounded,
                          ),
                          const SizedBox(height: 12),
                          CustomTextField(
                            controller: _shopSloganController,
                            label: 'Slogan tiệm',
                            hint: 'Ngọt ngào từng khoảnh khắc',
                            prefixIcon: Icons.favorite_outline_rounded,
                          ),
                          const SizedBox(height: 12),
                          CustomTextField(
                            controller: _announcementController,
                            label: 'Thông báo trên thanh thông báo (Header Banner)',
                            hint: '🍬 Miễn phí vận chuyển cho đơn hàng từ 300k!',
                            prefixIcon: Icons.campaign_rounded,
                          ),
                          const SizedBox(height: 12),
                          CustomTextField(
                            controller: _hotlineController,
                            label: 'Hotline hỗ trợ',
                            hint: '1900 1234 hoặc 0987 654 321',
                            prefixIcon: Icons.phone_in_talk_rounded,
                            keyboardType: TextInputType.phone,
                          ),
                          const SizedBox(height: 12),
                          CustomTextField(
                            controller: _addressController,
                            label: 'Địa chỉ tiệm bánh kẹo',
                            hint: 'Số 123 Đường Bánh Kẹo, Quận 1, TP.HCM',
                            prefixIcon: Icons.location_on_rounded,
                          ),
                          const SizedBox(height: 12),
                          CustomTextField(
                            controller: _emailController,
                            label: 'Email hỗ trợ',
                            hint: 'support@candyshop.com',
                            prefixIcon: Icons.email_rounded,
                            keyboardType: TextInputType.emailAddress,
                          ),
                          const SizedBox(height: 20),
                          CustomButton(
                            text: 'LƯU THÔNG TIN CỬA HÀNG',
                            isLoading: _isSavingGeneral,
                            onPressed: _saveGeneral,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: AppColors.primary, size: 20),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
      ],
    );
  }
}
