class VoucherModel {
  final int id;
  final String code;
  final String name;
  final String? description;
  final String discountType; // PERCENTAGE, FIXED_AMOUNT
  final double discountValue;
  final double minOrderAmount;
  final double? maxDiscountAmount;
  final String? startDate;
  final String? endDate;
  final String? status;
  final bool isExpired;
  final bool isAvailable;

  VoucherModel({
    required this.id,
    required this.code,
    required this.name,
    this.description,
    required this.discountType,
    required this.discountValue,
    this.minOrderAmount = 0.0,
    this.maxDiscountAmount,
    this.startDate,
    this.endDate,
    this.status,
    this.isExpired = false,
    this.isAvailable = true,
  });

  factory VoucherModel.fromJson(Map<String, dynamic> json) {
    return VoucherModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      code: json['code']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString(),
      discountType: json['discountType']?.toString() ?? 'PERCENTAGE',
      discountValue: json['discountValue'] is num
          ? (json['discountValue'] as num).toDouble()
          : double.tryParse(json['discountValue']?.toString() ?? '0') ?? 0.0,
      minOrderAmount: json['minOrderAmount'] is num
          ? (json['minOrderAmount'] as num).toDouble()
          : double.tryParse(json['minOrderAmount']?.toString() ?? '0') ?? 0.0,
      maxDiscountAmount: json['maxDiscountAmount'] is num
          ? (json['maxDiscountAmount'] as num).toDouble()
          : (json['maxDiscountAmount'] != null
              ? double.tryParse(json['maxDiscountAmount'].toString())
              : null),
      startDate: json['startDate']?.toString(),
      endDate: json['endDate']?.toString(),
      status: json['status']?.toString(),
      isExpired: json['isExpired'] is bool ? json['isExpired'] : false,
      isAvailable: json['isAvailable'] is bool ? json['isAvailable'] : true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'name': name,
      'description': description,
      'discountType': discountType,
      'discountValue': discountValue,
      'minOrderAmount': minOrderAmount,
      'maxDiscountAmount': maxDiscountAmount,
      'startDate': startDate,
      'endDate': endDate,
      'status': status,
      'isExpired': isExpired,
      'isAvailable': isAvailable,
    };
  }
}

class ApplyVoucherResult {
  final bool valid;
  final String? code;
  final String? discountType;
  final double discountValue;
  final double discountAmount;
  final double originalAmount;
  final double finalAmount;
  final String? message;

  ApplyVoucherResult({
    required this.valid,
    this.code,
    this.discountType,
    this.discountValue = 0.0,
    this.discountAmount = 0.0,
    this.originalAmount = 0.0,
    this.finalAmount = 0.0,
    this.message,
  });

  factory ApplyVoucherResult.fromJson(Map<String, dynamic> json) {
    return ApplyVoucherResult(
      valid: json['valid'] is bool ? json['valid'] : false,
      code: json['code']?.toString(),
      discountType: json['discountType']?.toString(),
      discountValue: json['discountValue'] is num
          ? (json['discountValue'] as num).toDouble()
          : double.tryParse(json['discountValue']?.toString() ?? '0') ?? 0.0,
      discountAmount: json['discountAmount'] is num
          ? (json['discountAmount'] as num).toDouble()
          : double.tryParse(json['discountAmount']?.toString() ?? '0') ?? 0.0,
      originalAmount: json['originalAmount'] is num
          ? (json['originalAmount'] as num).toDouble()
          : double.tryParse(json['originalAmount']?.toString() ?? '0') ?? 0.0,
      finalAmount: json['finalAmount'] is num
          ? (json['finalAmount'] as num).toDouble()
          : double.tryParse(json['finalAmount']?.toString() ?? '0') ?? 0.0,
      message: json['message']?.toString(),
    );
  }
}
