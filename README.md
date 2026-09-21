# 🍬 Nguyen Huong Grocery Store (E-Commerce Platform)

Dự án nền tảng thương mại điện tử chuyên nghiệp dành cho cửa hàng bán lẻ thực phẩm thiết yếu, bánh kẹo cao cấp và đặc sản tuyển chọn **Nguyen Huong Store**. Hệ thống được xây dựng theo kiến trúc đa nền tảng hiện đại gồm:
- **Backend:** Spring Boot 3.3.5 + Spring Security 6 + Stateless JWT + H2/MySQL.
- **Web Frontend:** React 19 + Vite + Vanilla CSS Design System.
- **Mobile Client:** Flutter 3.x cho Android & iOS (Phiên bản **v1.2.0 Production Ready**).

---

## 📑 Mục lục
1. [Công nghệ sử dụng (Tech Stack)](#-công-nghệ-sử-dụng-tech-stack)
2. [Cấu trúc dự án (Folder Structure)](#-cấu-trúc-dự-án-folder-structure)
3. [Tài khoản kiểm thử (Demo Accounts)](#-tài-khoản-kiểm-thử-demo-accounts)
4. [Hướng dẫn cài đặt và khởi chạy (How to Run)](#-hướng-dẫn-cài-đặt-và-khởi-chạy-how-to-run)
5. [Tính năng và Hướng dẫn sử dụng](#-tính-năng-và-hướng-dẫn-sử-dụng)
6. [Tài liệu API (RESTful Endpoints)](#-tài-liệu-api-restful-endpoints)
7. [Cẩm nang dành cho Developer (Developer Guide & Quick Edits)](#-cẩm-nang-dành-cho-developer-developer-guide--quick-edits)
8. [Cấu hình nâng cao & Cơ sở dữ liệu](#-cấu-hình-nâng-cao--cơ-sở-dữ-liệu)

---

## 🛠 Công nghệ sử dụng (Tech Stack)

### Backend (`/backend`)
- **Ngôn ngữ & Framework:** Java 17, Spring Boot 3.3.5
- **Bảo mật (Security):** Spring Security 6, JSON Web Token (JJWT 0.12.6 - Stateless Authentication), BCrypt Password Hashing
- **Cơ sở dữ liệu (Database):**
  - Mặc định môi trường dev: **H2 In-Memory Database** (Tự động khởi tạo cấu trúc và nạp dữ liệu mẫu mỗi khi khởi động)
  - Sẵn sàng môi trường Production: **MySQL** (kèm file cấu hình `application-mysql.properties`)
- **ORM & Data Access:** Spring Data JPA, Hibernate ORM
- **Upload File:** Lưu trữ và quản lý ảnh tại thư mục `uploads/` trên server backend, phục vụ qua endpoint tĩnh `/uploads/**`
- **Build Tool:** Maven (sử dụng Maven Wrapper `mvnw.cmd` / `./mvnw`)

### Frontend Web (`/frontend`)
- **Framework & Build Tool:** React 19, Vite (tốc độ khởi động HMR cực nhanh)
- **Routing:** React Router v7
- **HTTP Client:** Axios (Interceptors tự động đính kèm JWT Bearer token và xử lý điều hướng khi hết hạn token)
- **Styling:** Vanilla CSS thuần chất lượng cao đặt tại `index.css`, tối ưu hóa hiệu năng, thiết kế Responsive đa thiết bị, hỗ trợ Dark Mode & biến CSS (`--primary`, `--footer-bg`, `--bg`, v.v.)
- **Icons & Effects:** SVG vector tùy biến, hiệu ứng rơi động theo mùa (Canvas / CSS animation)

### Mobile Client (`/mobile`) - v1.2.0 (Production Ready)
- **Framework:** Flutter 3.x, Dart 3.x (Hỗ trợ Android, iOS & Web Preview)
- **Quản lý trạng thái (State Management):** Provider Pattern
- **HTTP Client:** Dio (kèm Auth Interceptor tự động gắn Bearer Token và xử lý lỗi mạng tiếng Việt)
- **Giao diện & Trải nghiệm:** Material 3, Dark & Light Mode, Caching ảnh mạng (`cached_network_image`), định dạng tiền tệ `intl`
- **Bộ Quản trị viên (Admin Suite):** 7 phân hệ quản lý độc lập (Sản phẩm, Đơn hàng, Danh mục, Voucher, Banner, Khách hàng, Cài đặt)
- **File APK cài đặt:** `mobile/build/app/outputs/flutter-apk/app-release.apk`
- 📖 **Tài liệu chi tiết:** Xem tại [mobile/README.md](mobile/README.md)

---

## 📁 Cấu trúc dự án (Folder Structure)

```text
candy-shop/
├── backend/                                   # Source code Backend (Spring Boot 3)
│   ├── src/main/java/com/candyshop/
│   │   ├── config/                            # Cấu hình Security (JWT), Web MVC Resource, Khởi tạo dữ liệu mẫu (DataInitializer.java)
│   │   ├── controller/                        # REST API Endpoints đón nhận request từ Frontend
│   │   ├── dto/                               # Data Transfer Objects (Request/Response payload)
│   │   ├── entity/                            # Các Model ánh xạ JPA/Hibernate xuống Database
│   │   ├── exception/                         # Bộ xử lý ngoại lệ toàn cục (GlobalExceptionHandler)
│   │   ├── repository/                        # Spring Data JPA Repositories
│   │   ├── security/                          # JWT Token Provider, Authentication Filter, UserDetailsService
│   │   └── service/                           # Business Logic & Service Implementations
│   ├── src/main/resources/
│   │   ├── application.properties             # Cấu hình H2 Database, JWT Secret, File Uploads, Server Port (8080)
│   │   └── application-mysql.properties       # Cấu hình kết nối MySQL cho Production
│   ├── uploads/                               # Thư mục lưu trữ hình ảnh tải lên từ client (Avatar, Banner, Sản phẩm)
│   ├── pom.xml                                # Khai báo thư viện và plugin Maven
│   └── mvnw.cmd / mvnw                        # Maven Wrapper để chạy dự án không cần cài đặt Maven trước
│
├── frontend/                                  # Source code Frontend (React 19 + Vite)
│   ├── src/
│   │   ├── api/                               # Các file call API tới backend (axiosClient.js, authService.js, productService.js,...)
│   │   ├── components/                        # UI Components tái sử dụng (Navbar, Footer, ProtectedRoute, ReCaptchaWidget, ShopBackground,...)
│   │   ├── context/                           # React Contexts (AuthContext, CartContext, ThemeContext, ShopSettingsContext)
│   │   ├── pages/                             # Các màn hình chính (HomePage, ProductDetailPage, CartPage, CheckoutPage, OrderHistoryPage, ProfilePage,...)
│   │   │   └── (Admin Pages)                  # AdminProductsPage, AdminCategoriesPage, AdminOrdersPage, AdminBannersPage, AdminVouchersPage, AdminCustomersPage, AdminSettingsPage
│   │   ├── App.jsx                            # Khai báo các Routes điều hướng toàn ứng dụng
│   │   ├── index.css                          # File CSS chứa toàn bộ Design System, Tokens, Components và Dark Mode overrides
│   │   └── main.jsx                           # Điểm nhập khởi chạy React DOM
│   ├── index.html                             # Template HTML gốc của ứng dụng
│   ├── package.json                           # Khai báo dependencies npm
│   └── vite.config.js                         # Cấu hình môi trường Vite dev server & build
│
├── mobile/                                    # Source code Mobile Client (Flutter 3.x - v1.2.0)
│   ├── android/                               # Native Android (Gradle Kotlin DSL)
│   ├── ios/                                   # Native iOS
│   ├── lib/
│   │   ├── core/                              # Mạng, màu sắc, theme Material 3, interceptor
│   │   ├── models/                            # User, Product, Order, Admin stats,...
│   │   ├── services/                          # API Service layer (Auth, Product, Admin,...)
│   │   ├── providers/                         # Quản lý trạng thái (Provider pattern)
│   │   └── screens/                           # Màn hình Storefront & 7 phân hệ Admin Suite
│   ├── build/app/outputs/flutter-apk/         # Gói cài đặt APK Release chính thức
│   ├── pubspec.yaml                           # Khai báo thư viện & version 1.2.0+3
│   └── README.md                              # Hướng dẫn chi tiết dành riêng cho Mobile
│
└── README.md                                  # Toàn bộ tài liệu hướng dẫn sử dụng và phát triển dự án
```

---

## 👥 Tài khoản kiểm thử (Demo Accounts)

Hệ thống đã tự động cài đặt sẵn (Seed) các tài khoản mặc định và dữ liệu demo phong phú thông qua file `DataInitializer.java` ở Backend:

| Vai Trò | Email Đăng Nhập | Mật Khẩu | Quyền Hạn & Chức Năng |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@candyshop.com`<br>*(hoặc `admin@gmail.com`)* | `admin123` | Toàn quyền quản trị hệ thống trên cả Web và App: Quản lý Sản phẩm, Danh mục, Đơn hàng, Banner, Voucher, Khách hàng và Cài đặt cửa hàng. |
| **Khách hàng (User)** | `user@candyshop.com`<br>*(hoặc `customer@gmail.com`)* | `user123` | Người dùng mua sắm: Xem giỏ hàng, áp mã giảm giá, đặt hàng COD, theo dõi đơn hàng, sửa hồ sơ cá nhân và đánh giá sản phẩm. |

---

## 🚀 Hướng dẫn cài đặt và khởi chạy (How to Run)

### Yêu cầu môi trường
- **Java:** JDK 17 trở lên
- **Node.js:** Node.js v18 trở lên & npm
- **Flutter:** Flutter SDK 3.x (nếu phát triển / build Mobile)

---

### Bước 1: Khởi chạy Backend (Spring Boot)

1. Mở cửa sổ Terminal (PowerShell / Command Prompt) tại thư mục gốc của dự án.
2. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
3. Chạy ứng dụng bằng Maven Wrapper:
   - Trên **Windows**:
     ```powershell
     .\mvnw.cmd spring-boot:run
     ```
   - Trên **macOS / Linux**:
     ```bash
     ./mvnw spring-boot:run
     ```
4. Ứng dụng Backend sẽ khởi chạy tại: **`http://localhost:8080`**
   - **H2 Database Console:** `http://localhost:8080/h2-console`
     - *JDBC URL:* `jdbc:h2:mem:candyshop`
     - *User Name:* `sa`
     - *Password:* *(để trống)*

---

### Bước 2: Khởi chạy Frontend Web (React Vite)

1. Mở một cửa sổ Terminal mới tại thư mục gốc của dự án.
2. Di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
3. Cài đặt các thư viện dependencies (nếu là lần đầu chạy):
   ```bash
   npm install
   ```
4. Khởi chạy server phát triển (Development Server):
   ```bash
   npm run dev
   ```
5. Ứng dụng Frontend sẽ khởi chạy tại: **`http://localhost:5173`**

---

### Bước 3: Khởi chạy Ứng dụng Di động (Flutter Mobile Client)

1. Mở một cửa sổ Terminal mới tại thư mục `mobile`:
   ```bash
   cd mobile
   flutter pub get
   ```
2. Khởi chạy ứng dụng:
   - **Trên điện thoại Android kết nối cáp USB:**
     ```bash
     flutter run
     ```
   - **Trên trình duyệt Chrome (Web Preview):**
     ```bash
     flutter run -d chrome
     ```
3. **Cài đặt file APK Release v1.2.0 trực tiếp vào điện thoại:**
   - File APK đã biên dịch sẵn tại: [`mobile/build/app/outputs/flutter-apk/app-release.apk`](mobile/build/app/outputs/flutter-apk/app-release.apk)
   - Lệnh cài đặt nhanh qua USB:
     ```bash
     flutter install -d <device-id>
     ```

---

## 📖 Tính năng và Hướng dẫn sử dụng

### 1. Dành cho Khách Hàng (Storefront & Shopping Experience)
- **Trang chủ (`/`):**
  - Banner quảng cáo tự động chạy Carousel với hình ảnh bắt mắt và liên kết chuyển hướng nhanh.
  - Danh mục ngành hàng được lọc thông minh (🌈 Tất cả, Bánh kẹo nhập khẩu, Sô-cô-la, Nhu yếu phẩm,...).
  - Danh sách sản phẩm nổi bật, hiển thị giá niêm yết, nhãn giảm giá và tồn kho.
  - Bộ điều khiển tìm kiếm từ khóa, sắp xếp theo giá tăng/giảm, lọc theo mức giá linh hoạt.
- **Trang Chi Tiết Sản Phẩm (`/products/:id`):**
  - Xem ảnh phóng to, thông tin chi tiết, quy cách đóng gói, chính sách cam kết chất lượng.
  - Thêm vào giỏ hàng với số lượng tùy chọn, kiểm tra tồn kho tức thì.
  - Khu vực **Đánh giá & Nhận xét**: Khách hàng đã mua hàng có thể bình chọn sao (1-5 sao) và để lại phản hồi thực tế.
- **Giỏ Hàng (`/cart`):**
  - Quản lý danh sách sản phẩm đã chọn, cập nhật số lượng hoặc xóa món hàng.
  - Thanh toán tạm tính, thanh đo tiến trình Freeship thông minh.
  - **Áp dụng Mã giảm giá (Voucher):** Mở cửa sổ popup chọn nhanh các voucher khả dụng hoặc nhập mã thủ công.
- **Thanh Toán & Đặt Hàng (`/checkout`):**
  - Nhập thông tin nhận hàng (Họ tên, Số điện thoại, Địa chỉ giao hàng chi tiết, Ghi chú đơn).
  - Phương thức thanh toán khi nhận hàng (COD).
  - Tự động khấu trừ mã giảm giá (voucher) và áp dụng miễn phí vận chuyển nếu đủ điều kiện.
- **Lịch Sử Đơn Hàng (`/orders`):**
  - Khách hàng theo dõi danh sách các đơn hàng đã đặt cùng tiến trình xử lý (Chờ xác nhận, Đang giao, Đã hoàn thành, Đã hủy).
  - Cho phép hủy đơn hàng nếu đơn vẫn ở trạng thái `PENDING`.
- **Hồ Sơ Cá Nhân (`/profile`):**
  - Cập nhật Họ và tên, Số điện thoại, Địa chỉ giao hàng mặc định.
  - Tải lên ảnh đại diện (Avatar) với tính năng xem trước trực tiếp.
  - Đổi mật khẩu tài khoản có xác thực bảo mật.
- **Giao Diện Sáng / Tối (Dark / Light Mode):**
  - Chuyển đổi linh hoạt giữa giao diện sáng thanh lịch và giao diện tối dịu mắt chỉ với 1 click tại thanh Navbar.

---

### 2. Dành cho Quản Trị Viên (Admin Management Dashboard)
> **Lưu ý:** Chỉ tài khoản có quyền `ROLE_ADMIN` mới có thể nhìn thấy menu dropdown Admin và truy cập các trang quản trị sau:

- **Quản Lý Sản Phẩm (`/admin/products`):**
  - Thêm mới sản phẩm: Nhập tên, danh mục, giá bán, số lượng tồn kho, mô tả và tải ảnh từ máy tính (hỗ trợ kéo thả / xem trước ảnh).
  - Chỉnh sửa thông tin, cập nhật kho hàng, xóa sản phẩm an toàn với hộp thoại xác nhận.
  - Tìm kiếm và lọc sản phẩm đa tiêu chí, phân trang dữ liệu.
- **Quản Lý Danh Mục (`/admin/categories`):**
  - Thêm, sửa, xóa loại ngành hàng.
  - Kéo thả mượt mà để sắp xếp lại thứ tự hiển thị danh mục trên Trang chủ.
  - Công tắc bật/tắt hiển thị danh mục ngay lập tức.
- **Quản Lý Đơn Hàng (`/admin/orders`):**
  - Xem danh sách toàn bộ đơn hàng trong hệ thống kèm thông tin khách hàng, số điện thoại, địa chỉ và tổng tiền.
  - Lọc đơn hàng theo trạng thái xử lý hoặc theo khoảng ngày đặt hàng.
  - Cập nhật trạng thái đơn hàng (PENDING ➔ CONFIRMED ➔ SHIPPING ➔ COMPLETED ➔ CANCELLED).
- **Quản Lý Banner Quảng Cáo (`/admin/banners`):**
  - Thêm mới, chỉnh sửa, xóa banner hiển thị trên Carousel trang chủ.
  - Hỗ trợ tải lên ảnh banner riêng cho màn hình máy tính (Desktop) và điện thoại (Mobile).
  - Bật/tắt trạng thái hiển thị và sắp xếp thứ tự ưu tiên của banner.
- **Quản Lý Mã Giảm Giá (`/admin/vouchers`):**
  - Tạo voucher giảm theo phần trăm (%), giảm số tiền cố định (VNĐ) hoặc miễn phí ship.
  - Cài đặt giá trị giảm tối đa, ngưỡng đơn tối thiểu, số lượt sử dụng tối đa và hạn sử dụng.
- **Quản Lý Khách Hàng (`/admin/customers`):**
  - Xem danh sách người dùng, lịch sử tham gia, tổng số đơn đã mua và tổng chi tiêu tích lũy.
  - Khóa hoặc mở khóa tài khoản khách hàng khi phát hiện vi phạm.
- **Cài Đặt Cửa Hàng (`/admin/settings`):**
  - **Màu sắc chủ đạo (Primary Theme Color):** Cung cấp 9 bảng màu phối sẵn (Forest Teal, Candy Berry, Royal Purple, Ocean Blue, Fresh Emerald, Warm Amber, Caramel, Ruby Red, Midnight Slate) cùng công cụ chọn mã màu HEX tự do.
  - **Màu sắc chân trang (Footer Background Color):** Hỗ trợ tự động đồng bộ theo màu chủ đạo (`THEME_MATCH`), hoặc chọn các gam màu tối ưu sẵn (Đen đá Obsidian, Xanh rừng rậm, Xám than Zinc, Nâu cà phê, Tím đậm hoàng gia, hoặc mã HEX tùy chọn).
  - **Hình nền & Họa tiết shop (Shop Background):** Tùy chọn 6 mẫu họa tiết vector tinh tế (Lưới chấm Polka Dots, Họa tiết kẹo ngọt Candy Doodle, Vân sóng kẹo mút Wave, Lục giác mật ong Honeycomb, Ca-rô Tartan) hoặc tải ảnh nền tùy ý kèm thanh trượt độ mờ Opacity (0% - 50%).
  - **Hiệu ứng mùa & lễ hội:** Bật hiệu ứng rơi nhẹ nhàng (Tuyết rơi Giáng Sinh, Hoa đào/mai Tết Âm Lịch, Lá vàng mùa Thu, Bong bóng mùa Hè, Pháo giấy Confetti).
  - **Thông tin thương hiệu Header & Footer:** Tùy biến thanh thông báo Header, hotline, slogan, giới thiệu ngắn Footer, địa chỉ Google Maps, giờ mở cửa, email và bản quyền.
  - **Chính sách giao hàng:** Cài đặt phí vận chuyển tiêu chuẩn và ngưỡng đơn hàng đạt chuẩn Freeship 0đ.
  - **Mô phỏng thực tế (Live Mockup & Real-time Preview):** Xem thử tức thì giao diện thu nhỏ hoặc bật chế độ xem trực tiếp trên toàn màn hình trước khi lưu.

---

## 📡 Tài liệu API (RESTful Endpoints)

### 1. Xác thực & Tài khoản (Authentication & Profile)
| Phương thức | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Đăng ký tài khoản mới (trả về JWT Token) |
| `POST` | `/api/auth/login` | Public | Đăng nhập hệ thống (trả về JWT Token) |
| `GET` | `/api/users/me` | Authenticated | Lấy thông tin tài khoản đang đăng nhập |
| `PUT` | `/api/users/profile` | Authenticated | Cập nhật họ tên, số điện thoại, địa chỉ |
| `PUT` | `/api/users/password` | Authenticated | Đổi mật khẩu tài khoản |
| `POST` | `/api/users/avatar` | Authenticated | Tải lên ảnh đại diện (Avatar) |

### 2. Sản phẩm (Products)
| Phương thức | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | Danh sách sản phẩm (hỗ trợ phân trang, lọc danh mục, tìm kiếm từ khóa, khoảng giá, sắp xếp) |
| `GET` | `/api/products/{id}` | Public | Lấy thông tin chi tiết sản phẩm theo ID |
| `POST` | `/api/products` | ADMIN | Tạo mới sản phẩm |
| `PUT` | `/api/products/{id}` | ADMIN | Cập nhật thông tin sản phẩm |
| `DELETE` | `/api/products/{id}` | ADMIN | Xóa sản phẩm khỏi hệ thống |
| `POST` | `/api/products/upload-image` | ADMIN | Tải lên hình ảnh sản phẩm vào thư mục `/uploads` |

### 3. Danh mục (Categories)
| Phương thức | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Public | Lấy danh sách toàn bộ danh mục |
| `GET` | `/api/categories/{id}` | Public | Lấy thông tin chi tiết một danh mục |
| `POST` | `/api/categories` | ADMIN | Tạo mới danh mục sản phẩm |
| `PUT` | `/api/categories/{id}` | ADMIN | Cập nhật tên, mô tả, ảnh danh mục |
| `PUT` | `/api/categories/{id}/status`| ADMIN | Bật/tắt trạng thái ẩn/hiện danh mục |
| `PUT` | `/api/categories/reorder` | ADMIN | Cập nhật hàng loạt thứ tự hiển thị danh mục |
| `DELETE` | `/api/categories/{id}` | ADMIN | Xóa danh mục (chỉ xóa khi không có sản phẩm liên kết) |

### 4. Giỏ hàng (Cart)
| Phương thức | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Authenticated | Lấy thông tin giỏ hàng hiện tại |
| `POST` | `/api/cart/items` | Authenticated | Thêm sản phẩm vào giỏ hàng |
| `PUT` | `/api/cart/items/{itemId}` | Authenticated | Cập nhật số lượng của một món hàng |
| `DELETE` | `/api/cart/items/{itemId}` | Authenticated | Xóa một món hàng khỏi giỏ |
| `DELETE` | `/api/cart` | Authenticated | Xóa trắng toàn bộ giỏ hàng |

### 5. Đơn Hàng (Orders)
| Phương thức | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/orders` | ADMIN | Xem toàn bộ đơn hàng (phân trang, lọc trạng thái, tìm kiếm) |
| `GET` | `/api/orders/my-orders` | Authenticated | Lấy danh sách lịch sử đơn hàng của người dùng hiện tại |
| `GET` | `/api/orders/{id}` | Authenticated | Xem chi tiết 1 đơn hàng (Admin xem mọi đơn, User xem đơn của mình) |
| `POST` | `/api/orders` | Authenticated | Đặt hàng từ giỏ hàng hiện tại kèm địa chỉ và voucher |
| `PUT` | `/api/orders/{id}/status` | ADMIN | Cập nhật trạng thái xử lý đơn hàng |
| `PUT` | `/api/orders/{id}/cancel` | Authenticated | Hủy đơn hàng (User chỉ hủy khi đơn ở trạng thái PENDING) |

### 6. Đánh giá sản phẩm (Reviews)
| Phương thức | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reviews/product/{productId}` | Public | Lấy danh sách đánh giá của một sản phẩm |
| `POST` | `/api/reviews` | Authenticated | Gửi đánh giá mới (chỉ khách hàng đã mua sản phẩm mới có quyền) |
| `PUT` | `/api/reviews/{id}` | Authenticated | Sửa đánh giá đã gửi |
| `DELETE` | `/api/reviews/{id}` | Authenticated | Xóa đánh giá |

### 7. Banner Quảng Cáo (Banners)
| Phương thức | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/banners/active` | Public | Lấy danh sách các banner đang bật hiển thị |
| `GET` | `/api/banners` | ADMIN | Lấy toàn bộ danh sách banner để quản lý |
| `POST` | `/api/banners` | ADMIN | Thêm banner mới |
| `PUT` | `/api/banners/{id}` | ADMIN | Chỉnh sửa banner |
| `DELETE` | `/api/banners/{id}` | ADMIN | Xóa banner |

### 8. Mã Giảm Giá (Vouchers)
| Phương thức | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/vouchers/active` | Authenticated | Lấy danh sách các voucher đang kích hoạt và còn hiệu lực |
| `POST` | `/api/vouchers/apply` | Authenticated | Kiểm tra và áp dụng mã voucher cho giỏ hàng |
| `GET` | `/api/vouchers` | ADMIN | Lấy danh sách toàn bộ voucher trong hệ thống |
| `POST` | `/api/vouchers` | ADMIN | Tạo mới mã voucher |
| `PUT` | `/api/vouchers/{id}` | ADMIN | Cập nhật voucher |
| `DELETE` | `/api/vouchers/{id}` | ADMIN | Xóa voucher |

### 9. Cài Đặt Cửa Hàng (Shop Settings)
| Phương thức | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/settings/general` | Public | Lấy cấu hình chung (Màu chủ đạo, màu footer, họa tiết, hiệu ứng, thông tin shop) |
| `PUT` | `/api/settings/general` | ADMIN | Cập nhật cấu hình chung của cửa hàng |
| `GET` | `/api/settings/shipping` | Public | Lấy cấu hình phí vận chuyển và ngưỡng Freeship |
| `PUT` | `/api/settings/shipping` | ADMIN | Cập nhật cấu hình phí vận chuyển |

---

## 💻 Cẩm nang dành cho Developer (Developer Guide & Quick Edits)

Phần này cung cấp các hướng dẫn hữu ích để lập trình viên có thể nhanh chóng tiếp cận mã nguồn, hiểu kiến trúc và tiến hành tùy biến hoặc bổ sung tính năng mới.

### 1. Luồng hoạt động và Kiến trúc tổng thể
- **Client-Server Flow:**
  1. Người dùng thao tác trên giao diện React.
  2. Các module API tại `frontend/src/api/` sử dụng `axiosClient.js` gửi HTTP request có kèm header `Authorization: Bearer <token>` nếu đã đăng nhập.
  3. Spring Boot Backend nhận request, thông qua `JwtAuthenticationFilter` để giải mã token và nạp `UserDetails` vào `SecurityContextHolder`.
  4. Controller chuyển request tới Service xử lý nghiệp vụ, giao tiếp với Database qua Repository và trả kết quả dưới dạng DTO.
  5. Frontend nhận phản hồi, cập nhật state qua React Contexts và render giao diện tức thì.
- **Hệ thống Token CSS và Theme:**
  - Toàn bộ giao diện sử dụng các CSS Variables đặt tại `:root` trong `frontend/src/index.css`.
  - Khi quản trị viên chọn màu sắc chủ đạo hoặc màu footer tại trang cài đặt, `ShopSettingsContext.jsx` sẽ tự động cập nhật các biến `--primary`, `--primary-dark`, `--primary-light`, `--footer-bg`, v.v. trực tiếp lên thẻ `document.documentElement`.
  - Chế độ Dark Mode hoạt động bằng cách gắn thuộc tính `data-theme="dark"` lên thẻ `<html>`. Toàn bộ màu sắc trong Dark Mode kế thừa biến CSS động, bảo đảm không bị ghi đè màu sắc của Header hay Footer.

### 2. Cẩm nang chỉnh sửa nhanh (Quick Reference)

| Mục đích chỉnh sửa | Vị trí tệp tin tương ứng | Hướng dẫn thực hiện |
| :--- | :--- | :--- |
| **Thay đổi thông tin cửa hàng, Logo, Hotline, Bản quyền** | Giao diện Quản Trị `/admin/settings` | Đăng nhập tài khoản Admin, vào Cài Đặt Cửa Hàng và chỉnh sửa trực tiếp không cần sửa code. Nếu muốn sửa file code mặc định, xem `ShopSettingsContext.jsx` và `DataInitializer.java`. |
| **Chỉnh sửa thanh điều hướng (Menu / Header)** | `frontend/src/components/Navbar.jsx` | Chỉnh sửa cấu trúc link, logo biểu tượng hoặc menu dropdown admin. |
| **Chỉnh sửa chân trang (Footer)** | `frontend/src/components/Footer.jsx` | Chỉnh sửa các cột thông tin, link hỗ trợ và cam kết dịch vụ. |
| **Thêm hoặc sửa Route trang mới** | `frontend/src/App.jsx` | Thêm component trang mới vào thư mục `frontend/src/pages/` và khai báo thẻ `<Route path="..." element={<NewPage />} />`. |
| **Thêm Service kết nối API mới** | `frontend/src/api/` | Tạo file service mới, import `axiosClient` từ `./axiosClient` và viết các hàm gọi API REST. |
| **Chỉnh sửa giao diện & màu sắc CSS** | `frontend/src/index.css` | Tùy biến biến CSS ở đầu file hoặc các lớp component tương ứng. |
| **Thay đổi tiêu đề Tab trình duyệt mặc định** | `frontend/index.html` | Sửa thẻ `<title>` trong file `index.html`. |
| **Khởi tạo thêm dữ liệu mẫu khi chạy app** | `backend/src/main/java/com/candyshop/config/DataInitializer.java` | Bổ sung sản phẩm, danh mục, tài khoản hoặc cấu hình mặc định trong hàm `run()`. |
| **Cấu hình thời hạn JWT Token** | `backend/src/main/resources/application.properties` | Chỉnh sửa thuộc tính `candyshop.jwt.expiration-ms` (mặc định 86400000 ms = 24 giờ). |
| **Cấu hình cổng khởi chạy Backend** | `backend/src/main/resources/application.properties` | Thay đổi `server.port=8080`. |

---

## ⚙️ Cấu hình nâng cao & Cơ sở dữ liệu

### 1. Cơ sở dữ liệu mặc định (H2 In-Memory)
- Không cần cài đặt bất kỳ hệ quản trị cơ sở dữ liệu nào, ứng dụng tự động chạy với H2.
- Dữ liệu demo sẽ tự động nạp mới mỗi khi server Spring Boot khởi động lại.
- Truy cập giao diện quản lý cơ sở dữ liệu tại: `http://localhost:8080/h2-console`
  - *JDBC URL:* `jdbc:h2:mem:candyshop`
  - *User Name:* `sa`
  - *Password:* *(để trống)*

### 2. Chuyển sang cơ sở dữ liệu MySQL (Production)
1. Đảm bảo MySQL Server đã được cài đặt và đang chạy trên máy tính của bạn.
2. Tạo một cơ sở dữ liệu mới:
   ```sql
   CREATE DATABASE candyshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Mở file [application.properties](file:///c:/Users/Admin/.gemini/antigravity/scratch/candy-shop/backend/src/main/resources/application.properties), kích hoạt profile MySQL hoặc cấu hình trực tiếp:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/candyshop?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=your_password
   spring.jpa.hibernate.ddl-auto=update
   ```
4. Khởi động lại Backend Spring Boot. Hệ thống sẽ tự động tạo bảng và nạp dữ liệu khởi tạo vào MySQL.

---

*Chúc bạn có trải nghiệm phát triển tuyệt vời với Nguyen Huong Grocery Store!* 🚀🍬🧁