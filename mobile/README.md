# 🛍️ Nguyen Huong Store - Mobile Client (Flutter)

[![Flutter Version](https://img.shields.io/badge/Flutter-3.x-02569B?logo=flutter)](https://flutter.dev)
[![Dart Version](https://img.shields.io/badge/Dart-3.x-0175C2?logo=dart)](https://dart.dev)
[![Version](https://img.shields.io/badge/Version-v1.2.0%20(Production%20Ready)-2ea44f)](pubspec.yaml)
[![License](https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-orange)](#)

Ứng dụng di động mua sắm và quản trị cửa hàng bán lẻ bánh kẹo & nhu yếu phẩm **Nguyen Huong Store**, được phát triển bằng **Flutter 3.x**, kết nối trực tiếp song song với hệ thống **Spring Boot 3.3.5 REST API Backend** của dự án.

---

## 📱 Điểm nổi bật & Tính năng chính

### 1. Trải nghiệm Khách hàng (Customer Experience):
- **Giao diện Hiện đại (Material 3)**: Gam màu Hồng kẹo kết hợp Cam San hô và Bạc hà; hỗ trợ chuyển đổi mượt mà giữa chế độ Sáng / Tối (**Light & Dark Mode**).
- **Xác thực an toàn (Stateless JWT)**: Đăng ký & Đăng nhập chuẩn Production, tự động đính kèm `Bearer Token` qua Dio Interceptor, lưu phiên với `SharedPreferences`.
- **Khám phá sản phẩm**:
  - Banner quảng cáo tự động cuộn (Banner Carousel).
  - Lọc theo danh mục sản phẩm (Kẹo dẻo, Bánh quy, Socola, Nhu yếu phẩm,...).
  - Tìm kiếm sản phẩm theo từ khóa trực tiếp.
  - Phân trang cuộn vô tận (Infinite Scroll) & cảnh báo hết hàng thông minh.
- **Giỏ hàng & Thanh toán (Checkout)**:
  - Đồng bộ giỏ hàng theo thời gian thực với server (`/api/cart/*`).
  - Tăng/giảm số lượng, vuốt để xóa món, dọn sạch giỏ.
  - Áp dụng mã khuyến mãi (Voucher) và tính phí vận chuyển / Freeship theo chính sách cửa hàng.
  - Đặt hàng thanh toán khi nhận hàng (COD).
- **Lịch sử đơn hàng**:
  - Theo dõi trạng thái: Chờ xử lý (`PENDING`), Đã xác nhận (`CONFIRMED`), Đang giao (`SHIPPING`), Hoàn thành (`COMPLETED`), Đã hủy (`CANCELLED`).
  - Hỗ trợ hủy đơn tức thì khi đơn ở trạng thái `PENDING` (hệ thống tự động hoàn lại tồn kho).
- **Trang cá nhân (Profile)**:
  - Cập nhật thông tin cá nhân (họ tên, số điện thoại, địa chỉ nhận hàng).
  - Đồng bộ động **Hotline CSKH** và **Giờ mở cửa** trực tiếp từ Cài đặt Cửa hàng của Admin.
  - Đổi API Server Host nhanh chóng ngay trên giao diện mà không cần build lại app.

### 2. Bộ Quản trị viên Toàn diện (Admin Management Suite):
Chỉ hiển thị thẻ lối tắt Quản trị màu tím hoàng gia khi tài khoản đăng nhập có quyền `ROLE_ADMIN`:
- 📊 **KPI Dashboard**: Doanh thu toàn sàn, số đơn chờ duyệt kèm badge cảnh báo, cảnh báo sản phẩm sắp hết hàng (`<= 5`), tổng số khách hàng.
- 📦 **Quản lý Sản phẩm**: Tìm kiếm, lọc theo danh mục, thêm/sửa/xóa sản phẩm, hỗ trợ chọn ảnh từ thư viện thiết bị và upload tự động lên Cloudinary.
- 📑 **Quản lý Đơn hàng**: Lọc theo 6 tab trạng thái, xem chi tiết từng món và thực hiện quy trình duyệt đơn (`PENDING` ➔ `CONFIRMED` ➔ `SHIPPING` ➔ `COMPLETED`).
- 🏷️ **Quản lý Danh mục**: Thêm/sửa danh mục với dialog popup và công tắc kích hoạt trực tiếp.
- 🎟️ **Quản lý Voucher**: Quản lý mã giảm giá (theo % hoặc số tiền cố định), hạn mức đơn tối thiểu, giới hạn lượt dùng và bộ chọn ngày hiệu lực.
- 🖼️ **Quản lý Banner**: Thêm/sửa banner quảng cáo với khung hình chuẩn tỉ lệ 2.2:1, chọn ảnh từ thư viện, điều hướng link URL và công tắc bật/tắt hiển thị.
- 👥 **Quản lý Khách hàng**: Bảng xếp hạng Top 5 khách chi tiêu nhiều nhất, xem hồ sơ, khóa / mở khóa tài khoản người dùng an toàn.
- ⚙️ **Cài đặt Hệ thống**: Cấu hình phí vận chuyển mặc định, ngưỡng đơn hàng Miễn phí vận chuyển (Freeship), hotline CSKH, email, địa chỉ và thông báo đầu trang.

---

## 🛠️ Cấu trúc thư mục (`mobile/`)

```text
mobile/
├── android/                                   # Dự án Android Native (Gradle Kotlin DSL)
│   ├── app/src/main/AndroidManifest.xml       # Khai báo quyền Internet & App Label
│   └── app/build.gradle.kts
├── ios/                                       # Dự án iOS Native
│   └── Runner/Info.plist                      # Cấu hình CFBundleDisplayName & HTTP
├── lib/
│   ├── core/
│   │   ├── constants/
│   │   │   ├── api_constants.dart             # Cấu hình IP/Base URL động
│   │   │   ├── app_colors.dart                # Palette màu thương hiệu Nguyen Huong Store
│   │   │   └── app_themes.dart                # Theme Material 3 Light/Dark
│   │   ├── network/
│   │   │   ├── auth_interceptor.dart          # Tự động gắn Bearer Token & bắt lỗi 401
│   │   │   ├── dio_client.dart                # Dio Client Singleton & Logger
│   │   │   └── error_handler.dart             # Biên dịch mã lỗi server sang tiếng Việt
│   │   └── utils/
│   │       ├── currency_formatter.dart        # Định dạng tiền tệ VNĐ chuẩn xác
│   │       └── image_helper.dart              # Xử lý URL ảnh Cloudinary & fallback
│   ├── models/                                # 10 Data Models (User, Order, Stats,...)
│   ├── services/                              # 8 API Services (Auth, Product, Admin,...)
│   ├── providers/                             # 6 State Providers (Provider Pattern)
│   ├── widgets/                               # UI Widgets tái sử dụng (Button, TextField, Card,...)
│   ├── screens/
│   │   ├── splash/splash_screen.dart          # Màn hình Splash nhận diện thương hiệu
│   │   ├── auth/                              # Đăng nhập & Đăng ký
│   │   ├── main_wrapper.dart                  # Bottom Navigation 4 tab chính
│   │   ├── home/                              # Trang chủ & Banner Carousel
│   │   ├── category/                          # Xem sản phẩm theo danh mục & sắp xếp
│   │   ├── product/                           # Chi tiết sản phẩm & thêm giỏ hàng
│   │   ├── cart/                              # Giỏ hàng & quản lý số lượng
│   │   ├── checkout/                          # Đặt hàng, áp voucher & tính phí ship
│   │   ├── orders/                            # Lịch sử đơn hàng & hủy đơn
│   │   ├── profile/                           # Hồ sơ cá nhân & cấu hình API host
│   │   └── admin/                             # 7 phân hệ Quản trị viên (Admin Suite)
│   │       ├── admin_dashboard_screen.dart
│   │       ├── products/                      # Admin danh sách & form sản phẩm
│   │       ├── orders/                        # Admin danh sách & chi tiết duyệt đơn
│   │       ├── categories/                    # Admin danh mục popup
│   │       ├── vouchers/                      # Admin mã giảm giá
│   │       ├── banners/                       # Admin banner quảng cáo
│   │       ├── customers/                     # Admin quản lý khách hàng
│   │       └── settings/                      # Admin cài đặt cửa hàng & phí ship
│   └── main.dart                              # Điểm nhập khởi chạy ứng dụng Flutter
├── test/
│   ├── widget_test.dart                       # Unit test định dạng tiền & widget test
│   └── admin_test.dart                        # Unit test Role Guard & Admin models
├── pubspec.yaml                               # Khai báo thư viện & version 1.2.0+3
└── README.md
```

---

## 🌐 Cấu hình kết nối API Máy chủ

File cấu hình: [`lib/core/constants/api_constants.dart`](lib/core/constants/api_constants.dart)

| Môi trường | Địa chỉ URL mặc định | Ghi chú |
| :--- | :--- | :--- |
| **Android Emulator** | `http://10.0.2.2:8080/api` | Tự động nhận diện khi chạy trên máy ảo Android |
| **iOS Simulator** | `http://localhost:8080/api` | Dành cho máy ảo iOS trên macOS |
| **Điện thoại thật (USB / Wi-Fi LAN)** | `http://<IP_MAY_TINH>:8080/api` | Vào tab **Cá nhân** -> Bấm icon 🌐 ở góc trên bên phải để đổi IP tức thì |

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### 1. Khởi động Backend (Spring Boot):
Đảm bảo máy chủ Backend đang chạy tại cổng `8080`:
```bash
cd backend
.\mvnw.cmd spring-boot:run
```

### 2. Cài đặt thư viện Flutter:
```bash
cd mobile
flutter pub get
```

### 3. Khởi chạy ứng dụng:
- **Trên điện thoại Android đã cắm cáp USB**:
  ```bash
  flutter run
  ```
- **Trên trình duyệt Chrome (Web Preview)**:
  ```bash
  flutter run -d chrome
  ```

### 4. Đóng gói file APK Release:
```bash
cd mobile
flutter build apk --release
```
File APK xuất xưởng tại: `mobile/build/app/outputs/flutter-apk/app-release.apk`.

### 5. Cài đặt trực tiếp file APK vào điện thoại:
```bash
flutter install -d <device-id>
```

---

## 🧪 Kiểm thử Tự động (Testing)

Dự án được trang bị bộ kiểm thử tự động toàn diện:
```bash
cd mobile
flutter test
```
*Kết quả:* Vượt qua 100% 6/6 bài kiểm thử (Currency formatting, Widget interaction, Loading state, Role Guard Admin, Admin Stats parsing, Order Model compatibility).

Kiểm tra chất lượng mã nguồn:
```bash
flutter analyze
```
*Kết quả:* `No issues found!` (0 lỗi, 0 cảnh báo).

---

## 👥 Tài khoản Mặc định Hệ thống

| Vai trò | Email | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@candyshop.com` | `admin123` | Mở khóa toàn bộ 7 phân hệ Quản trị viên |
| **Khách hàng (Customer)** | `user@candyshop.com` | `user123` | Mua sắm, đặt hàng, quản lý hồ sơ cá nhân |
