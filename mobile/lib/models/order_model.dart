class OrderItemModel {
  final int id;
  final int productId;
  final String productName;
  final String? productImageUrl;
  final String? categoryName;
  final int quantity;
  final double priceAtOrder;
  final double subtotal;

  OrderItemModel({
    required this.id,
    required this.productId,
    required this.productName,
    this.productImageUrl,
    this.categoryName,
    required this.quantity,
    required this.priceAtOrder,
    required this.subtotal,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      productId: json['productId'] is int
          ? json['productId']
          : int.tryParse(json['productId']?.toString() ?? '0') ?? 0,
      productName: json['productName']?.toString() ?? '',
      productImageUrl: json['productImageUrl']?.toString(),
      categoryName: json['categoryName']?.toString(),
      quantity: json['quantity'] is int
          ? json['quantity']
          : int.tryParse(json['quantity']?.toString() ?? '1') ?? 1,
      priceAtOrder: json['priceAtOrder'] is num
          ? (json['priceAtOrder'] as num).toDouble()
          : double.tryParse(json['priceAtOrder']?.toString() ?? '0') ?? 0.0,
      subtotal: json['subtotal'] is num
          ? (json['subtotal'] as num).toDouble()
          : double.tryParse(json['subtotal']?.toString() ?? '0') ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'productId': productId,
      'productName': productName,
      'productImageUrl': productImageUrl,
      'categoryName': categoryName,
      'quantity': quantity,
      'priceAtOrder': priceAtOrder,
      'subtotal': subtotal,
    };
  }
}

class OrderModel {
  final int id;
  final String orderCode;
  final int? userId;
  final String? userEmail;
  final String receiverName;
  final String receiverPhone;
  final String shippingAddress;
  final String? note;
  final double totalAmount;
  final String paymentMethod;
  final String status;
  final String? voucherCode;
  final double discountAmount;
  final double shippingFee;
  final List<OrderItemModel> items;
  final String? createdAt;
  final String? updatedAt;

  OrderModel({
    required this.id,
    required this.orderCode,
    this.userId,
    this.userEmail,
    required this.receiverName,
    required this.receiverPhone,
    required this.shippingAddress,
    this.note,
    required this.totalAmount,
    this.paymentMethod = 'COD',
    required this.status,
    this.voucherCode,
    this.discountAmount = 0.0,
    this.shippingFee = 0.0,
    required this.items,
    this.createdAt,
    this.updatedAt,
  });

  bool get canCancel => status == 'PENDING';

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'] as List<dynamic>? ?? [];
    final itemsList = rawItems.map((e) => OrderItemModel.fromJson(e as Map<String, dynamic>)).toList();

    return OrderModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      orderCode: json['orderCode']?.toString() ?? '',
      userId: json['userId'] is int ? json['userId'] : int.tryParse(json['userId']?.toString() ?? '0'),
      userEmail: json['userEmail']?.toString(),
      receiverName: json['receiverName']?.toString() ?? '',
      receiverPhone: json['receiverPhone']?.toString() ?? '',
      shippingAddress: json['shippingAddress']?.toString() ?? '',
      note: json['note']?.toString(),
      totalAmount: json['totalAmount'] is num
          ? (json['totalAmount'] as num).toDouble()
          : double.tryParse(json['totalAmount']?.toString() ?? '0') ?? 0.0,
      paymentMethod: json['paymentMethod']?.toString() ?? 'COD',
      status: json['status']?.toString() ?? 'PENDING',
      voucherCode: json['voucherCode']?.toString(),
      discountAmount: json['discountAmount'] is num
          ? (json['discountAmount'] as num).toDouble()
          : double.tryParse(json['discountAmount']?.toString() ?? '0') ?? 0.0,
      shippingFee: json['shippingFee'] is num
          ? (json['shippingFee'] as num).toDouble()
          : double.tryParse(json['shippingFee']?.toString() ?? '0') ?? 0.0,
      items: itemsList,
      createdAt: json['createdAt']?.toString(),
      updatedAt: json['updatedAt']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'orderCode': orderCode,
      'userId': userId,
      'userEmail': userEmail,
      'receiverName': receiverName,
      'receiverPhone': receiverPhone,
      'shippingAddress': shippingAddress,
      'note': note,
      'totalAmount': totalAmount,
      'paymentMethod': paymentMethod,
      'status': status,
      'voucherCode': voucherCode,
      'discountAmount': discountAmount,
      'shippingFee': shippingFee,
      'items': items.map((e) => e.toJson()).toList(),
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }
}

class OrderPageResponse {
  final List<OrderModel> content;
  final int pageNo;
  final int pageSize;
  final int totalElements;
  final int totalPages;
  final bool last;

  OrderPageResponse({
    required this.content,
    required this.pageNo,
    required this.pageSize,
    required this.totalElements,
    required this.totalPages,
    required this.last,
  });

  factory OrderPageResponse.fromJson(Map<String, dynamic> json) {
    final list = (json['content'] as List<dynamic>?)
            ?.map((e) => OrderModel.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];

    return OrderPageResponse(
      content: list,
      pageNo: json['pageNo'] is int ? json['pageNo'] : int.tryParse(json['pageNo']?.toString() ?? '0') ?? 0,
      pageSize: json['pageSize'] is int ? json['pageSize'] : int.tryParse(json['pageSize']?.toString() ?? '10') ?? 10,
      totalElements: json['totalElements'] is int
          ? json['totalElements']
          : int.tryParse(json['totalElements']?.toString() ?? '0') ?? 0,
      totalPages: json['totalPages'] is int
          ? json['totalPages']
          : int.tryParse(json['totalPages']?.toString() ?? '0') ?? 0,
      last: json['last'] is bool ? json['last'] : true,
    );
  }
}
