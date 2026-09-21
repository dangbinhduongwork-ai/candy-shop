# 🍭 Candy Shop & Nhu Yếu Phẩm - Mobile Client (Flutter)

Ứng dụng di động mua sắm bánh kẹo và nhu yếu phẩm dành cho nền tảng Android và iOS, được phát triển bằng **Flutter 3.x**, kết nối trực tiếp vào hệ thống **Spring Boot 3.3.5 REST API Backend** của dự án.

---

## 📱 Điểm nổi bật & Tính năng chính

1. **Giao diện Candy Shop ngọt ngào & Hiện đại (Material 3)**:
   - Tông màu Hồng kẹo (Candy Rose `#FF5376`) kết hợp Cam San hô (Peach `#FF8E53`) và Xanh Bạc hà.
   - Hỗ trợ đầy đủ **Sáng / Tối (Light & Dark Mode)** lưu trạng thái cục bộ.
   - Hiển thị tiền tệ Việt Nam đồng (`VNĐ`) chuẩn xác với `intl`.
2. **Xác thực & Bảo mật (Stateless JWT)**:
   - Đăng nhập & Đăng ký tài khoản mới với xử lý mã bảo vệ CAPTCHA tự động (`test-token`).
   - Tự động lưu Token và Profile vào `SharedPreferences`.
   - Interceptor tự động gắn `Authorization: Bearer <token>` vào tất cả các request.
   - Tự động bắt lỗi 401 khi token hết hạn và đưa về màn hình đăng nhập an toàn.
   - Nút bấm tự động điền nhanh tài khoản kiểm thử (Admin & User).
3. **Khám phá Bánh kẹo & Tìm kiếm**:
   - Slide banner quảng cáo tự động cuộn (Banner Carousel) mượt mà.
   - Lọc theo Danh mục sản phẩm (Kẹo dẻo, Bánh quy, Socola, v.v.).
   - Thanh tìm kiếm sản phẩm theo từ khóa trực tiếp.
   - Phân trang & Cuộn tải thêm (Infinite scroll).
   - Đánh dấu sản phẩm hết hàng thông minh.
4. **Chi tiết sản phẩm**:
   - Ảnh sản phẩm chất lượng cao với bộ đệm `cached_network_image`.
   - Bộ chọn số lượng có kiểm tra giới hạn tồn kho.
   - Thêm nhanh vào giỏ hàng với thông báo SnackBar nổi.
5. **Giỏ hàng & Đặt hàng (Checkout)**:
   - Đồng bộ giỏ hàng theo thời gian thực với Backend (`/api/cart/*`).
   - Badge hiển thị số lượng món trên thanh điều hướng dưới cùng.
   - Tăng/giảm số lượng món, vuốt để xóa (Swipe to delete), xóa toàn bộ giỏ.
   - Tự động điền thông tin người nhận từ Profile.
   - Áp dụng mã giảm giá (Voucher) và tính phí vận chuyển theo cài đặt từ server.
   - Phương thức thanh toán khi nhận hàng (COD).
6. **Quản lý đơn hàng**:
   - Xem lịch sử đơn hàng theo trạng thái: Chờ xử lý (`PENDING`), Đã duyệt (`CONFIRMED`), Hoàn tất (`DELIVERED`), Đã hủy (`CANCELLED`).
   - Xem chi tiết từng món đã đặt, phí ship, mã giảm giá, địa chỉ giao hàng.
   - Hỗ trợ hủy đơn hàng khi đơn còn ở trạng thái `PENDING` (hệ thống tự động hoàn lại số lượng tồn kho).

---

## 🛠️ Cấu trúc thư mục (`mobile/`)

```text
mobile/
├── android/
│   ├── app/src/main/AndroidManifest.xml (Internet permission & cleartext traffic)
│   └── app/build.gradle
├── ios/
│   └── Runner/Info.plist (NSAppTransportSecurity HTTP enabled)
├── lib/
│   ├── core/
│   │   ├── constants/
│   │   │   ├── api_constants.dart (Base URLs, endpoints, timeouts)
│   │   │   ├── app_colors.dart    (Bảng màu Candy Shop)
│   │   │   └── app_themes.dart    (Material 3 Light & Dark Theme)
│   │   ├── network/
│   │   │   ├── auth_interceptor.dart (Tự động gắn Bearer token & xử lý 401)
│   │   │   ├── dio_client.dart       (Dio singleton & Logging)
│   │   │   └── error_handler.dart    (Chuyển đổi lỗi server sang tiếng Việt)
│   │   └── utils/
│   │       ├── currency_formatter.dart (Định dạng tiền tệ VNĐ)
│   │       └── image_helper.dart       (Xử lý URL ảnh tương đối / tuyệt đối)
│   ├── models/
│   │   ├── user_model.dart
│   │   ├── category_model.dart
│   │   ├── product_model.dart
│   │   ├── cart_model.dart
│   │   ├── order_model.dart
│   │   ├── voucher_model.dart
│   │   ├── banner_model.dart
│   │   └── setting_model.dart
│   ├── services/
│   │   ├── auth_service.dart
│   │   ├── product_service.dart
│   │   ├── category_service.dart
│   │   ├── cart_service.dart
│   │   ├── order_service.dart
│   │   ├── voucher_service.dart
│   │   └── setting_service.dart
│   ├── providers/
│   │   ├── auth_provider.dart    (Trạng thái đăng nhập & hồ sơ)
│   │   ├── product_provider.dart (Danh mục, banner, sản phẩm, tìm kiếm)
│   │   ├── cart_provider.dart    (Giỏ hàng & badge số lượng)
│   │   ├── order_provider.dart   (Đặt hàng, voucher & lịch sử đơn hàng)
│   │   └── theme_provider.dart   (Chuyển đổi Light/Dark mode)
│   ├── widgets/
│   │   ├── custom_button.dart
│   │   ├── custom_textfield.dart
│   │   ├── product_card.dart
│   │   ├── loading_widget.dart
│   │   └── empty_state.dart
│   ├── screens/
│   │   ├── splash/splash_screen.dart
│   │   ├── auth/ (login_screen.dart, register_screen.dart)
│   │   ├── main_wrapper.dart (Thanh Bottom Navigation 4 tab)
│   │   ├── home/ (home_screen.dart, banner_carousel.dart)
│   │   ├── category/ (category_products_screen.dart)
│   │   ├── product/ (product_detail_screen.dart)
│   │   ├── cart/ (cart_screen.dart)
│   │   ├── checkout/ (checkout_screen.dart)
│   │   ├── orders/ (order_history_screen.dart, order_detail_screen.dart)
│   │   └── profile/ (profile_screen.dart)
│   └── main.dart
├── pubspec.yaml
└── README.md
```

---

## 🌐 Cấu hình kết nối API Máy chủ

File cấu hình tại: [`lib/core/constants/api_constants.dart`](file:///c:/Users/Admin/.gemini/antigravity/scratch/candy-shop/mobile/lib/core/constants/api_constants.dart)

### 1. Android Emulator:
- Mặc định ứng dụng tự động nhận diện và sử dụng:
  ```text
  http://10.0.2.2:8080/api
  ```
  *(10.0.2.2 là địa chỉ loopback của máy chủ phát triển khi chạy trong Android Emulator).*

### 2. iOS Simulator:
- Mặc định sử dụng:
  ```text
  http://localhost:8080/api
  ```

### 3. Thiết bị thật (Physical Device qua Wi-Fi / LAN):
- Cách 1: Đổi trực tiếp trên giao diện ứng dụng: Vào màn hình **Cá nhân** -> Chọn icon **Cấu hình API Host** ở góc trên bên phải -> Nhập IP máy tính (Ví dụ: `http://192.168.1.15:8080/api`).
- Cách 2: Sửa trực tiếp trong code:
  ```dart
  static const String lanDeviceBaseUrl = 'http://<IP_MAY_TINH_CUA_BAN>:8080/api';
  static const bool useLanDevice = true;
  ```

---

## 🚀 Hướng dẫn Chạy ứng dụng

### 1. Khởi động Spring Boot Backend:
Đảm bảo máy chủ Backend đang chạy ở cổng `8080`:
```bash
cd backend
mvn spring-boot:run
```

### 2. Cài đặt thư viện Flutter:
Tại thư mục gốc của mobile:
```bash
cd mobile
flutter pub get
```

### 3. Chạy ứng dụng:
- Trên Android Emulator hoặc máy thật đã kết nối:
  ```bash
  flutter run
  ```
- Hoặc mở thư mục `mobile/` bằng Android Studio hoặc VS Code và nhấn **F5** (Run Without Debugging).

---

## 🔑 Tài khoản kiểm thử nhanh (Demo Accounts)

| Vai trò | Email | Mật khẩu |
| :--- | :--- | :--- |
| **Khách hàng (Customer)** | `user@candyshop.com` | `User@123` |
| **Quản trị viên (Admin)** | `admin@candyshop.com` | `Admin@123` |

*(Tại màn hình Đăng nhập của ứng dụng đã có sẵn 2 nút chip "Tài khoản User" và "Tài khoản Admin" để bấm điền tự động).*
