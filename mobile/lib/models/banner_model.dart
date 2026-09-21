class BannerModel {
  final int id;
  final String imageUrl;
  final String? title;
  final String? targetUrl;
  final int displayOrder;
  final bool active;

  BannerModel({
    required this.id,
    required this.imageUrl,
    this.title,
    this.targetUrl,
    this.displayOrder = 0,
    this.active = true,
  });

  factory BannerModel.fromJson(Map<String, dynamic> json) {
    return BannerModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      imageUrl: json['imageUrl']?.toString() ?? '',
      title: json['title']?.toString(),
      targetUrl: json['targetUrl']?.toString(),
      displayOrder: json['displayOrder'] is int
          ? json['displayOrder']
          : int.tryParse(json['displayOrder']?.toString() ?? '0') ?? 0,
      active: json['active'] is bool ? json['active'] : true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'imageUrl': imageUrl,
      'title': title,
      'targetUrl': targetUrl,
      'displayOrder': displayOrder,
      'active': active,
    };
  }
}
