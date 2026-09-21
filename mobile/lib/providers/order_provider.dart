import 'package:flutter/foundation.dart';
import '../core/network/error_handler.dart';
import '../models/order_model.dart';
import '../models/setting_model.dart';
import '../models/voucher_model.dart';
import '../services/order_service.dart';
import '../services/setting_service.dart';
import '../services/voucher_service.dart';

class OrderProvider extends ChangeNotifier {
  final OrderService _orderService = OrderService();
  final VoucherService _voucherService = VoucherService();
  final SettingService _settingService = SettingService();

  List<OrderModel> _orders = [];
  List<VoucherModel> _availableVouchers = [];
  ShippingSettingModel _shippingSetting = ShippingSettingModel.defaultSetting();

  ApplyVoucherResult? _appliedVoucher;
  bool _isLoading = false;
  bool _isPlacingOrder = false;
  String? _errorMessage;

  List<OrderModel> get orders => _orders;
  List<VoucherModel> get availableVouchers => _availableVouchers;
  ShippingSettingModel get shippingSetting => _shippingSetting;
  ApplyVoucherResult? get appliedVoucher => _appliedVoucher;
  bool get isLoading => _isLoading;
  bool get isPlacingOrder => _isPlacingOrder;
  String? get errorMessage => _errorMessage;

  /// Loads order history
  Future<void> loadOrders() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final pageRes = await _orderService.getUserOrders(page: 0, size: 30);
      _orders = pageRes.content;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = ErrorHandler.getErrorMessage(e);
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Loads available vouchers and shipping setting
  Future<void> loadCheckoutMetadata() async {
    try {
      final results = await Future.wait([
        _voucherService.getAvailableVouchers(),
        _settingService.getShippingSetting(),
      ]);
      _availableVouchers = results[0] as List<VoucherModel>;
      _shippingSetting = results[1] as ShippingSettingModel;
      notifyListeners();
    } catch (_) {}
  }

  /// Applies a voucher
  Future<bool> applyVoucher(String code) async {
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _voucherService.applyVoucher(code);
      if (result.valid) {
        _appliedVoucher = result;
        notifyListeners();
        return true;
      } else {
        _errorMessage = result.message ?? 'Mã giảm giá không hợp lệ';
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = ErrorHandler.getErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  /// Removes applied voucher
  void removeVoucher() {
    _appliedVoucher = null;
    notifyListeners();
  }

  /// Places order
  Future<OrderModel?> placeOrder({
    required String receiverName,
    required String receiverPhone,
    required String shippingAddress,
    String? note,
    String paymentMethod = 'COD',
  }) async {
    _isPlacingOrder = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final order = await _orderService.createOrder(
        receiverName: receiverName,
        receiverPhone: receiverPhone,
        shippingAddress: shippingAddress,
        note: note,
        paymentMethod: paymentMethod,
        voucherCode: _appliedVoucher?.code,
      );

      _orders.insert(0, order);
      _appliedVoucher = null;
      _isPlacingOrder = false;
      notifyListeners();
      return order;
    } catch (e) {
      _errorMessage = ErrorHandler.getErrorMessage(e);
      _isPlacingOrder = false;
      notifyListeners();
      return null;
    }
  }

  /// Cancels an order
  Future<bool> cancelOrder(int orderId) async {
    try {
      final cancelled = await _orderService.cancelOrder(orderId);
      final index = _orders.indexWhere((o) => o.id == orderId);
      if (index != -1) {
        _orders[index] = cancelled;
        notifyListeners();
      }
      return true;
    } catch (e) {
      _errorMessage = ErrorHandler.getErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  void reset() {
    _orders = [];
    _appliedVoucher = null;
    _errorMessage = null;
    notifyListeners();
  }
}
