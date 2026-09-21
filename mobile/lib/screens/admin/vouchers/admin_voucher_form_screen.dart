import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../models/voucher_model.dart';
import '../../../providers/admin_provider.dart';
import '../../../widgets/custom_button.dart';
import '../../../widgets/custom_textfield.dart';

class AdminVoucherFormScreen extends StatefulWidget {
  final VoucherModel? voucher;

  const AdminVoucherFormScreen({super.key, this.voucher});

  @override
  State<AdminVoucherFormScreen> createState() => _AdminVoucherFormScreenState();
}

class _AdminVoucherFormScreenState extends State<AdminVoucherFormScreen> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _codeController;
  late TextEditingController _nameController;
  late TextEditingController _descController;
  late TextEditingController _valueController;
  late TextEditingController _minOrderController;
  late TextEditingController _maxDiscountController;
  late TextEditingController _maxUsageController;
  late TextEditingController _maxPerUserController;

  String _discountType = 'PERCENTAGE';
  String _status = 'ACTIVE';
  DateTime _startDate = DateTime.now();
  DateTime _endDate = DateTime.now().add(const Duration(days: 30));
  bool _isSaving = false;

  bool get isEditing => widget.voucher != null;

  @override
  void initState() {
    super.initState();
    final v = widget.voucher;
    _codeController = TextEditingController(text: v?.code ?? '');
    _nameController = TextEditingController(text: v?.name ?? '');
    _descController = TextEditingController(text: v?.description ?? '');
    _valueController = TextEditingController(text: v != null ? v.discountValue.toInt().toString() : '10');
    _minOrderController = TextEditingController(text: v != null ? v.minOrderAmount.toInt().toString() : '0');
    _maxDiscountController = TextEditingController(text: v?.maxDiscountAmount != null ? v!.maxDiscountAmount!.toInt().toString() : '');
    _maxUsageController = TextEditingController(text: v != null ? v.maxUsageCount.toString() : '100');
    _maxPerUserController = TextEditingController(text: v != null ? v.maxUsagePerUser.toString() : '1');

    if (v != null) {
      _discountType = v.discountType;
      if (v.status != null) _status = v.status!;
      if (v.startDate != null) {
        try {
          _startDate = DateTime.parse(v.startDate!);
        } catch (_) {}
      }
      if (v.endDate != null) {
        try {
          _endDate = DateTime.parse(v.endDate!);
        } catch (_) {}
      }
    }
  }

  @override
  void dispose() {
    _codeController.dispose();
    _nameController.dispose();
    _descController.dispose();
    _valueController.dispose();
    _minOrderController.dispose();
    _maxDiscountController.dispose();
    _maxUsageController.dispose();
    _maxPerUserController.dispose();
    super.dispose();
  }

  Future<void> _pickDate({required bool isStart}) async {
    final initial = isStart ? _startDate : _endDate;
    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(2023),
      lastDate: DateTime(2035),
    );
    if (picked != null) {
      setState(() {
        if (isStart) {
          _startDate = picked;
          if (_endDate.isBefore(_startDate)) {
            _endDate = _startDate.add(const Duration(days: 7));
          }
        } else {
          _endDate = picked;
        }
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);
    final adminProv = context.read<AdminProvider>();

    try {
      final double? maxDisc = _maxDiscountController.text.trim().isNotEmpty
          ? double.tryParse(_maxDiscountController.text.trim())
          : null;

      final payload = {
        'code': _codeController.text.trim().toUpperCase(),
        'name': _nameController.text.trim(),
        'description': _descController.text.trim(),
        'discountType': _discountType,
        'discountValue': double.tryParse(_valueController.text.trim()) ?? 0.0,
        'minOrderAmount': double.tryParse(_minOrderController.text.trim()) ?? 0.0,
        if (maxDisc != null) 'maxDiscountAmount': maxDisc,
        'maxUsageCount': int.tryParse(_maxUsageController.text.trim()) ?? 100,
        'maxUsagePerUser': int.tryParse(_maxPerUserController.text.trim()) ?? 1,
        'startDate': _startDate.toIso8601String(),
        'endDate': _endDate.toIso8601String(),
        'status': _status,
      };

      bool success;
      if (isEditing) {
        success = await adminProv.updateVoucher(widget.voucher!.id, payload);
      } else {
        success = await adminProv.createVoucher(payload);
      }

      if (mounted) {
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(isEditing ? 'Cập nhật voucher thành công!' : 'Tạo mới voucher thành công!'),
              backgroundColor: AppColors.accentMint,
            ),
          );
          Navigator.pop(context, true);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(adminProv.vouchersError ?? 'Lỗi: Không thể lưu mã voucher'),
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
    final dateFormat = DateFormat('dd/MM/yyyy');

    return Scaffold(
      appBar: AppBar(
        title: Text(isEditing ? 'Chỉnh Sửa Voucher' : 'Tạo Mã Giảm Giá Mới'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Code & Name
              CustomTextField(
                controller: _codeController,
                label: 'Mã voucher (In hoa, không dấu) *',
                hint: 'VD: CANDY20K, FREESHIP...',
                prefixIcon: Icons.confirmation_number_rounded,
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return 'Vui lòng nhập mã code';
                  return null;
                },
              ),
              const SizedBox(height: 14),

              CustomTextField(
                controller: _nameController,
                label: 'Tên chương trình khuyến mãi *',
                hint: 'VD: Giảm 20% cho đơn bánh kẹo cuối tuần',
                prefixIcon: Icons.title_rounded,
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return 'Vui lòng nhập tên voucher';
                  return null;
                },
              ),
              const SizedBox(height: 14),

              // Discount Type Dropdown & Value
              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _discountType,
                      decoration: const InputDecoration(
                        labelText: 'Loại giảm giá',
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'PERCENTAGE', child: Text('Phần trăm (%)')),
                        DropdownMenuItem(value: 'FIXED_AMOUNT', child: Text('Số tiền (VNĐ)')),
                      ],
                      onChanged: (val) => setState(() => _discountType = val!),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: CustomTextField(
                      controller: _valueController,
                      label: _discountType == 'PERCENTAGE' ? 'Mức giảm (%) *' : 'Số tiền giảm (VNĐ) *',
                      hint: _discountType == 'PERCENTAGE' ? 'VD: 15' : 'VD: 30000',
                      keyboardType: TextInputType.number,
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) return 'Nhập giá trị';
                        final num = double.tryParse(val.trim());
                        if (num == null || num <= 0) return '> 0';
                        if (_discountType == 'PERCENTAGE' && num > 100) return '<= 100%';
                        return null;
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Min Order & Max Discount
              Row(
                children: [
                  Expanded(
                    child: CustomTextField(
                      controller: _minOrderController,
                      label: 'Đơn hàng tối thiểu (VNĐ)',
                      hint: 'VD: 100000',
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: CustomTextField(
                      controller: _maxDiscountController,
                      label: 'Giảm tối đa (VNĐ)',
                      hint: 'VD: 50000 (cho %)',
                      keyboardType: TextInputType.number,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Usage limits
              Row(
                children: [
                  Expanded(
                    child: CustomTextField(
                      controller: _maxUsageController,
                      label: 'Tổng lượt dùng tối đa',
                      hint: 'VD: 100',
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: CustomTextField(
                      controller: _maxPerUserController,
                      label: 'Lượt dùng / khách',
                      hint: 'VD: 1',
                      keyboardType: TextInputType.number,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Start & End Date pickers
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.calendar_today_rounded, size: 16),
                      label: Text('Bắt đầu: ${dateFormat.format(_startDate)}', style: const TextStyle(fontSize: 12)),
                      onPressed: () => _pickDate(isStart: true),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.event_rounded, size: 16),
                      label: Text('Hết hạn: ${dateFormat.format(_endDate)}', style: const TextStyle(fontSize: 12)),
                      onPressed: () => _pickDate(isStart: false),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Description
              CustomTextField(
                controller: _descController,
                label: 'Mô tả điều kiện áp dụng',
                hint: 'VD: Áp dụng cho toàn bộ giỏ hàng bánh kẹo nhập khẩu...',
                maxLines: 2,
              ),
              const SizedBox(height: 28),

              CustomButton(
                text: isEditing ? 'LƯU VOUCHER' : 'PHÁT HÀNH VOUCHER',
                isLoading: _isSaving,
                icon: Icons.card_giftcard_rounded,
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
