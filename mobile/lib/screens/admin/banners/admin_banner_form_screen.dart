import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/image_helper.dart';
import '../../../models/banner_model.dart';
import '../../../providers/admin_provider.dart';
import '../../../widgets/custom_button.dart';
import '../../../widgets/custom_textfield.dart';

class AdminBannerFormScreen extends StatefulWidget {
  final BannerModel? banner;

  const AdminBannerFormScreen({super.key, this.banner});

  @override
  State<AdminBannerFormScreen> createState() => _AdminBannerFormScreenState();
}

class _AdminBannerFormScreenState extends State<AdminBannerFormScreen> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _titleController;
  late TextEditingController _targetUrlController;
  late TextEditingController _orderController;
  late bool _active;

  XFile? _pickedImage;
  bool _isSaving = false;

  bool get isEditing => widget.banner != null;

  @override
  void initState() {
    super.initState();
    final b = widget.banner;
    _titleController = TextEditingController(text: b?.title ?? '');
    _targetUrlController = TextEditingController(text: b?.targetUrl ?? '');
    _orderController = TextEditingController(text: b != null ? b.displayOrder.toString() : '0');
    _active = b?.active ?? true;
  }

  @override
  void dispose() {
    _titleController.dispose();
    _targetUrlController.dispose();
    _orderController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 1920,
      imageQuality: 85,
    );
    if (picked != null) {
      setState(() => _pickedImage = picked);
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (!isEditing && _pickedImage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn hình ảnh cho banner quảng cáo')),
      );
      return;
    }

    setState(() => _isSaving = true);
    final adminProv = context.read<AdminProvider>();

    try {
      bool success;
      if (isEditing) {
        success = await adminProv.updateBanner(
          widget.banner!.id,
          filePath: _pickedImage?.path,
          title: _titleController.text.trim(),
          targetUrl: _targetUrlController.text.trim(),
          displayOrder: int.tryParse(_orderController.text.trim()) ?? 0,
          active: _active,
        );
      } else {
        success = await adminProv.createBanner(
          filePath: _pickedImage!.path,
          title: _titleController.text.trim(),
          targetUrl: _targetUrlController.text.trim(),
          displayOrder: int.tryParse(_orderController.text.trim()) ?? 0,
          active: _active,
        );
      }

      if (mounted) {
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(isEditing ? 'Cập nhật banner thành công!' : 'Tạo banner mới thành công!'),
              backgroundColor: AppColors.accentMint,
            ),
          );
          Navigator.pop(context, true);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(adminProv.bannersError ?? 'Lỗi: Không thể lưu banner'),
              backgroundColor: Colors.redAccent,
            ),
          );
        }
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(isEditing ? 'Chỉnh Sửa Banner' : 'Tạo Banner Mới'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Banner Preview Box
              AspectRatio(
                aspectRatio: 2.2,
                child: Container(
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.surfaceDark : Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isDark ? AppColors.borderDark : AppColors.borderLight,
                      width: 1.5,
                    ),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: _pickedImage != null
                      ? Image.file(File(_pickedImage!.path), fit: BoxFit.cover)
                      : (widget.banner != null && widget.banner!.imageUrl.isNotEmpty)
                          ? ImageHelper.buildCachedImage(
                              imageUrl: widget.banner!.imageUrl,
                              fit: BoxFit.cover,
                            )
                          : const Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.add_photo_alternate_rounded, size: 48, color: Colors.grey),
                                  SizedBox(height: 6),
                                  Text('Bấm nút bên dưới để tải ảnh banner', style: TextStyle(color: Colors.grey, fontSize: 12)),
                                ],
                              ),
                            ),
                ),
              ),
              const SizedBox(height: 12),

              Center(
                child: OutlinedButton.icon(
                  icon: const Icon(Icons.photo_library_rounded),
                  label: Text(_pickedImage != null || isEditing ? 'Thay đổi hình ảnh banner' : 'Chọn hình ảnh banner *'),
                  onPressed: _pickImage,
                ),
              ),
              const SizedBox(height: 16),

              // Title
              CustomTextField(
                controller: _titleController,
                label: 'Tiêu đề banner',
                hint: 'VD: Lễ Hội Bánh Kẹo Mùa Hè - Giảm tới 50%',
                prefixIcon: Icons.title_rounded,
              ),
              const SizedBox(height: 14),

              // Target URL
              CustomTextField(
                controller: _targetUrlController,
                label: 'Đường dẫn liên kết (Link đích khi bấm)',
                hint: 'VD: /category/1 hoặc https://...',
                prefixIcon: Icons.link_rounded,
              ),
              const SizedBox(height: 14),

              // Display Order
              CustomTextField(
                controller: _orderController,
                label: 'Thứ tự ưu tiên hiển thị',
                hint: '0, 1, 2...',
                prefixIcon: Icons.sort_rounded,
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 14),

              // Active Switch
              Row(
                children: [
                  Switch(
                    value: _active,
                    activeColor: AppColors.primary,
                    onChanged: (val) => setState(() => _active = val),
                  ),
                  const SizedBox(width: 8),
                  const Text('Kích hoạt hiển thị trên trang chủ', style: TextStyle(fontSize: 14)),
                ],
              ),
              const SizedBox(height: 28),

              CustomButton(
                text: isEditing ? 'LƯU BANNER' : 'TẠO BANNER MỚI',
                isLoading: _isSaving,
                icon: Icons.save_rounded,
                onPressed: _submit,
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
