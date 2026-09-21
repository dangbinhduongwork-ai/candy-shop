import 'package:flutter/foundation.dart';
import '../core/network/error_handler.dart';
import '../models/cart_model.dart';
import '../services/cart_service.dart';

class CartProvider extends ChangeNotifier {
  final CartService _cartService = CartService();

  CartModel _cart = CartModel.empty();
  bool _isLoading = false;
  String? _errorMessage;

  CartModel get cart => _cart;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  int get itemCount => _cart.totalItems;
  double get totalAmount => _cart.totalAmount;
  bool get isEmpty => _cart.items.isEmpty;

  /// Loads cart from backend
  Future<void> loadCart() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _cart = await _cartService.getCart();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      // Don't show disruptive error if user is unauthenticated or has no cart yet
      notifyListeners();
    }
  }

  /// Adds a product to cart
  Future<bool> addToCart({required int productId, int quantity = 1}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _cart = await _cartService.addToCart(productId: productId, quantity: quantity);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = ErrorHandler.getErrorMessage(e);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Updates quantity of an item
  Future<bool> updateQuantity({required int itemId, required int quantity}) async {
    if (quantity <= 0) {
      return removeItem(itemId);
    }

    try {
      _cart = await _cartService.updateItemQuantity(itemId: itemId, quantity: quantity);
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = ErrorHandler.getErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  /// Removes an item from cart
  Future<bool> removeItem(int itemId) async {
    try {
      _cart = await _cartService.removeItem(itemId);
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = ErrorHandler.getErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  /// Clears cart
  Future<bool> clearCart() async {
    try {
      _cart = await _cartService.clearCart();
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = ErrorHandler.getErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  /// Resets state on logout
  void reset() {
    _cart = CartModel.empty();
    _errorMessage = null;
    notifyListeners();
  }
}
