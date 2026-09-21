import 'package:intl/intl.dart';

class CurrencyFormatter {
  static final NumberFormat _vndFormat = NumberFormat.currency(
    locale: 'vi_VN',
    symbol: '₫',
    decimalDigits: 0,
  );

  /// Format num (int, double, or num) into VND string like "45.000 ₫"
  static String format(dynamic amount) {
    if (amount == null) return '0 ₫';
    final numericValue = (amount is num) ? amount : (num.tryParse(amount.toString()) ?? 0);
    return _vndFormat.format(numericValue);
  }

  /// Short format for badges or large numbers e.g. 150k
  static String formatCompact(dynamic amount) {
    if (amount == null) return '0';
    final numericValue = (amount is num) ? amount : (num.tryParse(amount.toString()) ?? 0);
    if (numericValue >= 1000000) {
      return '${(numericValue / 1000000).toStringAsFixed(1)}tr ₫';
    }
    if (numericValue >= 1000) {
      return '${(numericValue / 1000).toStringAsFixed(0)}k ₫';
    }
    return format(numericValue);
  }
}
