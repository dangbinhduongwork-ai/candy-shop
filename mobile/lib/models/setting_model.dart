class ShippingSettingModel {
  final double defaultShippingFee;
  final double freeShippingThreshold;

  ShippingSettingModel({
    required this.defaultShippingFee,
    required this.freeShippingThreshold,
  });

  factory ShippingSettingModel.defaultSetting() {
    return ShippingSettingModel(
      defaultShippingFee: 30000.0,
      freeShippingThreshold: 300000.0,
    );
  }

  factory ShippingSettingModel.fromJson(Map<String, dynamic> json) {
    return ShippingSettingModel(
      defaultShippingFee: json['defaultShippingFee'] is num
          ? (json['defaultShippingFee'] as num).toDouble()
          : double.tryParse(json['defaultShippingFee']?.toString() ?? '30000') ?? 30000.0,
      freeShippingThreshold: json['freeShippingThreshold'] is num
          ? (json['freeShippingThreshold'] as num).toDouble()
          : double.tryParse(json['freeShippingThreshold']?.toString() ?? '300000') ?? 300000.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'defaultShippingFee': defaultShippingFee,
      'freeShippingThreshold': freeShippingThreshold,
    };
  }

  /// Calculates actual shipping fee based on subtotal
  double calculateShippingFee(double subtotal) {
    if (subtotal >= freeShippingThreshold) {
      return 0.0;
    }
    return defaultShippingFee;
  }
}

class ShopGeneralSettingModel {
  final String shopName;
  final String? shopTitle;
  final String? shopSlogan;
  final String? headerAnnouncement;
  final String? headerHotline;
  final String? footerAddress;
  final String? footerEmail;
  final String? footerHotline;
  final String? footerWorkingHours;

  ShopGeneralSettingModel({
    required this.shopName,
    this.shopTitle,
    this.shopSlogan,
    this.headerAnnouncement,
    this.headerHotline,
    this.footerAddress,
    this.footerEmail,
    this.footerHotline,
    this.footerWorkingHours,
  });

  factory ShopGeneralSettingModel.defaultSetting() {
    return ShopGeneralSettingModel(
      shopName: 'Nguyen Huong Store',
      shopTitle: 'Bánh Kẹo & Nhu Yếu Phẩm',
      shopSlogan: 'Ngọt ngào từng khoảnh khắc',
      headerAnnouncement: '🍬 Chào mừng đến với Nguyen Huong Store!',
      headerHotline: '1900 1234',
      footerHotline: '1900 1234',
      footerWorkingHours: '8:00 - 22:00 hàng ngày',
    );
  }

  factory ShopGeneralSettingModel.fromJson(Map<String, dynamic> json) {
    return ShopGeneralSettingModel(
      shopName: json['shopName']?.toString() ?? 'Nguyen Huong Store',
      shopTitle: json['shopTitle']?.toString(),
      shopSlogan: json['shopSlogan']?.toString(),
      headerAnnouncement: json['headerAnnouncement']?.toString(),
      headerHotline: json['headerHotline']?.toString(),
      footerAddress: json['footerAddress']?.toString(),
      footerEmail: json['footerEmail']?.toString(),
      footerHotline: json['footerHotline']?.toString(),
      footerWorkingHours: json['footerWorkingHours']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'shopName': shopName,
      'shopTitle': shopTitle,
      'shopSlogan': shopSlogan,
      'headerAnnouncement': headerAnnouncement,
      'headerHotline': headerHotline,
      'footerAddress': footerAddress,
      'footerEmail': footerEmail,
      'footerHotline': footerHotline,
      'footerWorkingHours': footerWorkingHours,
    };
  }
}
