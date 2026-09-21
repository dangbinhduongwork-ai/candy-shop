class CategoryModel {
  final int id;
  final String name;
  final String? description;
  final String? imageUrl;
  final int displayOrder;
  final bool active;
  final int productCount;

  CategoryModel({
    required this.id,
    required this.name,
    this.description,
    this.imageUrl,
    this.displayOrder = 0,
    this.active = true,
    this.productCount = 0,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString(),
      imageUrl: json['imageUrl']?.toString(),
      displayOrder: json['displayOrder'] is int
          ? json['displayOrder']
          : int.tryParse(json['displayOrder']?.toString() ?? '0') ?? 0,
      active: json['active'] is bool ? json['active'] : true,
      productCount: json['productCount'] is int
          ? json['productCount']
          : int.tryParse(json['productCount']?.toString() ?? '0') ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'imageUrl': imageUrl,
      'displayOrder': displayOrder,
      'active': active,
      'productCount': productCount,
    };
  }
}
