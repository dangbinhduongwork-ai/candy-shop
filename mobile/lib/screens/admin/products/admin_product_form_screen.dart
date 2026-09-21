import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/image_helper.dart';
import '../../../models/product_model.dart';
import '../../../providers/admin_provider.dart';
import '../../../widgets/custom_button.dart';
import '../../../widgets/custom_textfield.dart';

class AdminProductFormScreen extends StatefulWidget {
  final ProductModel? product;

  const AdminProductFormScreen({super.key, this.product});

  @override
  State<AdminProductFormScreen> createState() => _AdminProductFormScreenState();
}

class _AdminProductFormScreenState extends State<AdminProductFormScreen> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _nameController;
  late TextEditingController _descriptionController;
  late TextEditingController _priceController;
  late TextEditingController _stockController;
  late TextEditingController _imageUrlController;

  int? _selectedCategoryId;
  XFile? _pickedImage;
  bool _isSaving = false;

  bool get isEditing => widget.product != null;

  @override
  void initState() {
    super.initState();
    final p = widget.product;
    _nameController = TextEditingController(text: p?.name ?? '');
    _descriptionController = TextEditingController(text: p?.description ?? '');
    _priceController = TextEditingController(text: p != null ? p.price.toInt().toString() : '');
    _stockController = TextEditingController(text: p != null ? p.stockQuantity.toString() : '50');
    _imageUrlController = TextEditingController(text: p?.imageUrl ?? '');
    _selectedCategoryId = p?.category?.id;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final adminProv = context.read<AdminProvider>();
      if (adminProv.categories.isEmpty) {
        adminProv.loadCategories();
      }
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _stockController.dispose();
    _imageUrlController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 1200,
      imageQuality: 85,
    );
    if (picked != null) {
      setState(() {
        _pickedImage = picked;
      });
    }
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedCategoryId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn danh mục cho sản phẩm')),
      );
      return;
    }

    setState(() => _isSaving = true);
    final adminProv = context.read<AdminProvider>();

    try {
      String finalImageUrl = _imageUrlController.text.trim();

      // If a local image file was picked from gallery, upload it first
      if (_pickedImage != null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Row(
                children: [
                  SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  ),
                  SizedBox(width: 12),
                  Text('Đang tải ảnh sản phẩm lên máy chủ...'),
                ],
              ),
              duration: Duration(seconds: 5),
            ),
          );
        }
        final uploadedUrl = await adminProv.uploadImage(_pickedImage!.path);
        if (uploadedUrl != null && uploadedUrl.isNotEmpty) {
          finalImageUrl = uploadedUrl;
        } else {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Không thể tải ảnh lên máy chủ, vui lòng thử lại'),
                backgroundColor: Colors.redAccent,
              ),
            );
          }
          return;
        }
      }

      final payload = {
        'name': _nameController.text.trim(),
        'description': _descriptionController.text.trim(),
        'price': double.tryParse(_priceController.text.trim()) ?? 0.0,
        'stockQuantity': int.tryParse(_stockController.text.trim()) ?? 0,
        'categoryId': _selectedCategoryId,
        'imageUrl': finalImageUrl,
      };

      bool success;
      if (isEditing) {
        success = await adminProv.updateProduct(widget.product!.id, payload);
      } else {
        success = await adminProv.createProduct(payload);
      }

      if (mounted) {
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(isEditing ? 'Cập nhật sản phẩm thành công!' : 'Tạo mới sản phẩm thành công!'),
              backgroundColor: AppColors.accentMint,
            ),
          );
          Navigator.pop(context, true);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(adminProv.productsError ?? 'Lỗi: Không thể lưu sản phẩm'),
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
    final adminProv = context.watch<AdminProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(isEditing ? 'Chỉnh Sửa Bánh Kẹo' : 'Thêm Bánh Kẹo Mới'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Image Picker Box
              Center(
                child: Column(
                  children: [
                    Container(
                      width: 150,
                      height: 150,
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
                          : _imageUrlController.text.isNotEmpty
                              ? ImageHelper.buildCachedImage(
                                  imageUrl: _imageUrlController.text.trim(),
                                  fit: BoxFit.cover,
                                )
                              : const Center(
                                  child: Icon(Icons.add_photo_alternate_rounded, size: 48, color: Colors.grey),
                                ),
                    ),
                    const SizedBox(height: 10),
                    OutlinedButton.icon(
                      icon: const Icon(Icons.photo_library_rounded, size: 18),
                      label: const Text('Chọn ảnh từ máy'),
                      onPressed: _pickImage,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Image URL Alternative
              CustomTextField(
                controller: _imageUrlController,
                label: 'Hoặc dán URL hình ảnh',
                hint: 'https://example.com/image.jpg hoặc /uploads/...',
                prefixIcon: Icons.link_rounded,
                onChanged: (_) => setState(() {}),
              ),
              const SizedBox(height: 16),

              // Product Name
              CustomTextField(
                controller: _nameController,
                label: 'Tên món bánh kẹo',
                hint: 'VD: Kẹo Dẻo Trái Cây Haribo',
                prefixIcon: Icons.fastfood_rounded,
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return 'Vui lòng nhập tên sản phẩm';
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Category Dropdown
              const Text('Danh mục bánh kẹo *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              const SizedBox(height: 6),
              DropdownButtonFormField<int>(
                value: _selectedCategoryId,
                decoration: const InputDecoration(
                  prefixIcon: Icon(Icons.category_rounded),
                  contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                ),
                hint: const Text('Chọn danh mục bánh kẹo'),
                items: adminProv.categories.map((c) {
                  return DropdownMenuItem<int>(
                    value: c.id,
                    child: Text(c.name),
                  );
                }).toList(),
                onChanged: (val) => setState(() => _selectedCategoryId = val),
                validator: (val) => val == null ? 'Vui lòng chọn danh mục' : null,
              ),
              const SizedBox(height: 16),

              // Price & Stock in Row
              Row(
                children: [
                  Expanded(
                    child: CustomTextField(
                      controller: _priceController,
                      label: 'Giá bán (VNĐ) *',
                      hint: 'VD: 35000',
                      prefixIcon: Icons.attach_money_rounded,
                      keyboardType: TextInputType.number,
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) return 'Nhập giá';
                        final num = double.tryParse(val.trim());
                        if (num == null || num <= 0) return 'Giá > 0';
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: CustomTextField(
                      controller: _stockController,
                      label: 'Tồn kho *',
                      hint: 'VD: 100',
                      prefixIcon: Icons.inventory_rounded,
                      keyboardType: TextInputType.number,
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) return 'Nhập kho';
                        final num = int.tryParse(val.trim());
                        if (num == null || num < 0) return 'Kho >= 0';
                        return null;
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Description
              CustomTextField(
                controller: _descriptionController,
                label: 'Mô tả chi tiết',
                hint: 'Mô tả nguyên liệu, hương vị, trọng lượng...',
                prefixIcon: Icons.description_rounded,
                maxLines: 4,
              ),
              const SizedBox(height: 28),

              // Save Button
              CustomButton(
                text: isEditing ? 'LƯU THAY ĐỔI' : 'TẠO MỚI SẢN PHẨM',
                isLoading: _isSaving,
                icon: Icons.save_rounded,
                onPressed: _submitForm,
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
