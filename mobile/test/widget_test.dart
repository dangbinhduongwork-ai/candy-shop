import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:candy_shop_mobile/core/utils/currency_formatter.dart';
import 'package:candy_shop_mobile/widgets/custom_button.dart';

void main() {
  group('Candy Shop Mobile Unit & Widget Tests', () {
    test('CurrencyFormatter formats Vietnamese Dong correctly', () {
      expect(CurrencyFormatter.format(50000), contains('50.000'));
      expect(CurrencyFormatter.format(1200000), contains('1.200.000'));
      expect(CurrencyFormatter.formatCompact(150000), contains('150k'));
    });

    testWidgets('CustomButton renders text and triggers callback', (WidgetTester tester) async {
      bool tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CustomButton(
              text: 'Thêm vào giỏ',
              onPressed: () {
                tapped = true;
              },
            ),
          ),
        ),
      );

      expect(find.text('Thêm vào giỏ'), findsOneWidget);

      await tester.tap(find.text('Thêm vào giỏ'));
      await tester.pump();

      expect(tapped, isTrue);
    });

    testWidgets('CustomButton shows loading indicator when isLoading is true', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CustomButton(
              text: 'Đang xử lý',
              isLoading: true,
              onPressed: () {},
            ),
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });
  });
}
