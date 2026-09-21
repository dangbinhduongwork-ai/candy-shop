import 'category_model.dart';

class ProductModel {
  final int id;
  final String name;
  final String? description;
  final double price;
  final int stockQuantity;
  final CategoryModel? category;
  final String? imageUrl;
  final double averageRating;
  final int reviewCount;
  final String? createdAt;
  final String? updatedAt;

  ProductModel({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    required this.stockQuantity,
    this.category,
    this.imageUrl,
    this.averageRating = 0.0,
    this.reviewCount = 0,
    this.createdAt,
    this.updatedAt,
  });

  bool get inStock => stockQuantity > 0;

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString(),
      price: json['price'] is num
          ? (json['price'] as num).toDouble()
          : double.tryParse(json['price']?.toString() ?? '0') ?? 0.0,
      stockQuantity: json['stockQuantity'] is int
          ? json['stockQuantity']
          : int.tryParse(json['stockQuantity']?.toString() ?? '0') ?? 0,
      category: json['category'] != null && json['category'] is Map<String, dynamic>
          ? CategoryModel.fromJson(json['category'] as Map<String, dynamic>)
          : null,
      imageUrl: json['imageUrl']?.toString(),
      averageRating: json['averageRating'] is num
          ? (json['averageRating'] as num).toDouble()
          : double.tryParse(json['averageRating']?.toString() ?? '0') ?? 0.0,
      reviewCount: json['reviewCount'] is int
          ? json['reviewCount']
          : int.tryParse(json['reviewCount']?.toString() ?? '0') ?? 0,
      createdAt: json['createdAt']?.toString(),
      updatedAt: json['updatedAt']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'price': price,
      'stockQuantity': stockQuantity,
      'category': category?.toJson(),
      'imageUrl': imageUrl,
      'averageRating': averageRating,
      'reviewCount': reviewCount,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }
}

class ProductPageResponse {
  final List<ProductModel> content;
  final int pageNo;
  final int pageSize;
  final int totalElements;
  final int totalPages;
  final bool last;

  ProductPageResponse({
    required this.content,
    required this.pageNo,
    required this.pageSize,
    required this.totalElements,
    required this.totalPages,
    required this.last,
  });

  factory ProductPageResponse.fromJson(Map<String, dynamic> json) {
    final list = (json['content'] as List<dynamic>?)
            ?.map((e) => ProductModel.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];

    return ProductPageResponse(
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
