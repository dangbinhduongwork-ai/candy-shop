import 'order_model.dart';

class CustomerSummaryModel {
  final int id;
  final String fullName;
  final String email;
  final String? phone;
  final String? address;
  final String? avatarUrl;
  final String status; // ACTIVE, LOCKED
  final String? createdAt;
  final int totalOrders;
  final double totalSpent;

  CustomerSummaryModel({
    required this.id,
    required this.fullName,
    required this.email,
    this.phone,
    this.address,
    this.avatarUrl,
    required this.status,
    this.createdAt,
    required this.totalOrders,
    required this.totalSpent,
  });

  bool get isLocked => status == 'LOCKED';
  bool get isActive => status == 'ACTIVE';

  factory CustomerSummaryModel.fromJson(Map<String, dynamic> json) {
    return CustomerSummaryModel(
      id: int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      fullName: json['fullName']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      phone: json['phone']?.toString(),
      address: json['address']?.toString(),
      avatarUrl: json['avatarUrl']?.toString(),
      status: json['status']?.toString() ?? 'ACTIVE',
      createdAt: json['createdAt']?.toString(),
      totalOrders: int.tryParse(json['totalOrders']?.toString() ?? '0') ?? 0,
      totalSpent: double.tryParse(json['totalSpent']?.toString() ?? '0') ?? 0.0,
    );
  }
}

class CustomerDetailModel {
  final int id;
  final String fullName;
  final String email;
  final String? phone;
  final String? address;
  final String? avatarUrl;
  final String status;
  final String? createdAt;
  final int totalOrders;
  final double totalSpent;
  final List<OrderModel> recentOrders;

  CustomerDetailModel({
    required this.id,
    required this.fullName,
    required this.email,
    this.phone,
    this.address,
    this.avatarUrl,
    required this.status,
    this.createdAt,
    required this.totalOrders,
    required this.totalSpent,
    required this.recentOrders,
  });

  bool get isLocked => status == 'LOCKED';

  factory CustomerDetailModel.fromJson(Map<String, dynamic> json) {
    final orders = <OrderModel>[];
    if (json['recentOrders'] is List) {
      for (final item in json['recentOrders']) {
        orders.add(OrderModel.fromJson(item as Map<String, dynamic>));
      }
    }

    return CustomerDetailModel(
      id: int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      fullName: json['fullName']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      phone: json['phone']?.toString(),
      address: json['address']?.toString(),
      avatarUrl: json['avatarUrl']?.toString(),
      status: json['status']?.toString() ?? 'ACTIVE',
      createdAt: json['createdAt']?.toString(),
      totalOrders: int.tryParse(json['totalOrders']?.toString() ?? '0') ?? 0,
      totalSpent: double.tryParse(json['totalSpent']?.toString() ?? '0') ?? 0.0,
      recentOrders: orders,
    );
  }
}
