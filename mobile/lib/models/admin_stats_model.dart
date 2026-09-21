class AdminOrderStatsModel {
  final int totalOrders;
  final double totalRevenue;
  final Map<String, int> countByStatus;
  final int lowStockCount;

  AdminOrderStatsModel({
    required this.totalOrders,
    required this.totalRevenue,
    required this.countByStatus,
    required this.lowStockCount,
  });

  factory AdminOrderStatsModel.fromJson(Map<String, dynamic> json) {
    final statusMap = <String, int>{};
    if (json['countByStatus'] is Map) {
      (json['countByStatus'] as Map).forEach((key, value) {
        statusMap[key.toString()] = int.tryParse(value.toString()) ?? 0;
      });
    }

    return AdminOrderStatsModel(
      totalOrders: int.tryParse(json['totalOrders']?.toString() ?? '0') ?? 0,
      totalRevenue: double.tryParse(json['totalRevenue']?.toString() ?? '0') ?? 0.0,
      countByStatus: statusMap,
      lowStockCount: int.tryParse(json['lowStockCount']?.toString() ?? '0') ?? 0,
    );
  }

  int get pendingOrders => countByStatus['PENDING'] ?? 0;
  int get confirmedOrders => countByStatus['CONFIRMED'] ?? 0;
  int get shippingOrders => countByStatus['SHIPPING'] ?? 0;
  int get completedOrders => countByStatus['COMPLETED'] ?? 0;
  int get cancelledOrders => countByStatus['CANCELLED'] ?? 0;
}

class TopSpenderModel {
  final int id;
  final String fullName;
  final String email;
  final String? phone;
  final String? avatarUrl;
  final int orderCount;
  final double totalSpent;

  TopSpenderModel({
    required this.id,
    required this.fullName,
    required this.email,
    this.phone,
    this.avatarUrl,
    required this.orderCount,
    required this.totalSpent,
  });

  factory TopSpenderModel.fromJson(Map<String, dynamic> json) {
    return TopSpenderModel(
      id: int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      fullName: json['fullName']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      phone: json['phone']?.toString(),
      avatarUrl: json['avatarUrl']?.toString(),
      orderCount: int.tryParse(json['orderCount']?.toString() ?? '0') ?? 0,
      totalSpent: double.tryParse(json['totalSpent']?.toString() ?? '0') ?? 0.0,
    );
  }
}

class CustomerStatsModel {
  final int totalCustomers;
  final int newCustomersThisMonth;
  final int activeCustomers;
  final int lockedCustomers;
  final List<TopSpenderModel> topSpenders;

  CustomerStatsModel({
    required this.totalCustomers,
    required this.newCustomersThisMonth,
    required this.activeCustomers,
    required this.lockedCustomers,
    required this.topSpenders,
  });

  factory CustomerStatsModel.fromJson(Map<String, dynamic> json) {
    final spenders = <TopSpenderModel>[];
    if (json['topSpenders'] is List) {
      for (final item in json['topSpenders']) {
        spenders.add(TopSpenderModel.fromJson(item as Map<String, dynamic>));
      }
    }

    return CustomerStatsModel(
      totalCustomers: int.tryParse(json['totalCustomers']?.toString() ?? '0') ?? 0,
      newCustomersThisMonth: int.tryParse(json['newCustomersThisMonth']?.toString() ?? '0') ?? 0,
      activeCustomers: int.tryParse(json['activeCustomers']?.toString() ?? '0') ?? 0,
      lockedCustomers: int.tryParse(json['lockedCustomers']?.toString() ?? '0') ?? 0,
      topSpenders: spenders,
    );
  }
}
