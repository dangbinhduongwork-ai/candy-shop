import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../models/category_model.dart';
import '../../../providers/admin_provider.dart';
import '../../../widgets/custom_textfield.dart';

class AdminCategoryDialog extends StatefulWidget {
  final CategoryModel? category;

  const AdminCategoryDialog({super.key, this.category});

  @override
  State<AdminCategoryDialog> createState() => _AdminCategoryDialogState();
}

class _AdminCategoryDialogState extends State<AdminCategoryDialog> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _nameController;
  late TextEditingController _descriptionController;
  late TextEditingController _imageUrlController;
  late TextEditingController _orderController;
  late bool _active;

  bool _isSaving = false;
  bool get isEditing => widget.category != null;

  @override
  void initState() {
    super.initState();
    final c = widget.category;
    _nameController = TextEditingController(text: c?.name ?? '');
    _descriptionController = TextEditingController(text: c?.description ?? '');
    _imageUrlController = TextEditingController(text: c?.imageUrl ?? '');
    _orderController = TextEditingController(text: c != null ? c.displayOrder.toString() : '0');
    _active = c?.active ?? true;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _imageUrlController.dispose();
    _orderController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);
    final adminProv = context.read<AdminProvider>();

    try {
      final payload = {
        'name': _nameController.text.trim(),
        'description': _descriptionController.text.trim(),
        'imageUrl': _imageUrlController.text.trim(),
        'displayOrder': int.tryParse(_orderController.text.trim()) ?? 0,
        'active': _active,
      };

      bool success;
      if (isEditing) {
        success = await adminProv.updateCategory(widget.category!.id, payload);
      } else {
        success = await adminProv.createCategory(payload);
      }

      if (mounted) {
        if (success) {
          Navigator.pop(context, true);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(adminProv.categoriesError ?? 'Lỗi: Không thể lưu danh mục'),
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
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      isEditing ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const Divider(),
                const SizedBox(height: 12),

                CustomTextField(
                  controller: _nameController,
                  label: 'Tên danh mục *',
                  hint: 'VD: Kẹo Dẻo & Kẹo Mút',
                  prefixIcon: Icons.label_outline_rounded,
                  validator: (val) {
                    if (val == null || val.trim().isEmpty) return 'Nhập tên danh mục';
                    return null;
                  },
                ),
                const SizedBox(height: 12),

                CustomTextField(
                  controller: _imageUrlController,
                  label: 'URL hình ảnh biểu tượng',
                  hint: 'https://... hoặc /uploads/...',
                  prefixIcon: Icons.image_outlined,
                ),
                const SizedBox(height: 12),

                CustomTextField(
                  controller: _orderController,
                  label: 'Thứ tự hiển thị',
                  hint: '0, 1, 2...',
                  prefixIcon: Icons.sort_rounded,
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 12),

                CustomTextField(
                  controller: _descriptionController,
                  label: 'Mô tả tóm tắt',
                  hint: 'Mô tả các mặt hàng trong danh mục...',
                  prefixIcon: Icons.notes_rounded,
                  maxLines: 2,
                ),
                const SizedBox(height: 12),

                Row(
                  children: [
                    Switch(
                      value: _active,
                      activeColor: AppColors.primary,
                      onChanged: (val) => setState(() => _active = val),
                    ),
                    const SizedBox(width: 8),
                    const Text('Kích hoạt hiển thị cho khách hàng', style: TextStyle(fontSize: 13)),
                  ],
                ),
                const SizedBox(height: 20),

                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    onPressed: _isSaving ? null : _submit,
                    child: _isSaving
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : Text(
                            isEditing ? 'LƯU DANH MỤC' : 'TẠO DANH MỤC',
                            style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
