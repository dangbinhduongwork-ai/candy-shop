import 'package:flutter_test/flutter_test.dart';
import 'package:candy_shop_mobile/models/user_model.dart';
import 'package:candy_shop_mobile/models/admin_stats_model.dart';
import 'package:candy_shop_mobile/models/order_model.dart';

void main() {
  group('Admin Suite Unit Tests', () {
    test('UserModel isAdmin checks role correctly', () {
      final adminUser = UserModel(
        id: 1,
        fullName: 'Administrator',
        email: 'admin@candyshop.com',
        role: 'ROLE_ADMIN',
      );
      expect(adminUser.isAdmin, isTrue);

      final adminUserLegacy = UserModel(
        id: 2,
        fullName: 'Admin 2',
        email: 'admin2@candyshop.com',
        role: 'ADMIN',
      );
      expect(adminUserLegacy.isAdmin, isTrue);

      final customerUser = UserModel(
        id: 3,
        fullName: 'Customer Test',
        email: 'customer@candyshop.com',
        role: 'ROLE_USER',
      );
      expect(customerUser.isAdmin, isFalse);
    });

    test('AdminOrderStatsModel parses JSON correctly', () {
      final json = {
        'totalRevenue': 15000000.0,
        'totalOrders': 120,
        'countByStatus': {
          'PENDING': 8,
          'CONFIRMED': 5,
          'SHIPPING': 4,
          'COMPLETED': 98,
          'CANCELLED': 5,
        },
        'lowStockCount': 3,
      };

      final stats = AdminOrderStatsModel.fromJson(json);
      expect(stats.totalRevenue, 15000000.0);
      expect(stats.pendingOrders, 8);
      expect(stats.lowStockCount, 3);
      expect(stats.completedOrders, 98);
    });

    test('OrderModel backward compatibility getters work properly', () {
      final order = OrderModel(
        id: 101,
        orderCode: 'ORD-101',
        receiverName: 'Nguyen Van A',
        receiverPhone: '0901234567',
        shippingAddress: '123 Le Loi, Q1, HCM',
        paymentMethod: 'COD',
        status: 'PENDING',
        totalAmount: 150000.0,
        shippingFee: 15000.0,
        discountAmount: 10000.0,
        items: [
          OrderItemModel(
            id: 1,
            productId: 10,
            productName: 'Kẹo Dẻo Trái Cây',
            priceAtOrder: 50000.0,
            quantity: 2,
            subtotal: 100000.0,
          ),
        ],
      );

      expect(order.recipientName, 'Nguyen Van A');
      expect(order.phone, '0901234567');
      expect(order.finalAmount, 150000.0);
      expect(order.subtotal, 100000.0);
      expect(order.items.first.unitPrice, 50000.0);
    });
  });
}
