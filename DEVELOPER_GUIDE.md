# Hướng Dẫn Dành Cho Developer (Developer Guide)

Chào mừng bạn đến với dự án **Nguyen Huong Grocery Store (Tiệm Bánh Kẹo)**. Tài liệu này cung cấp cái nhìn tổng quan về kiến trúc, công nghệ và cách khởi chạy ứng dụng để bạn có thể dễ dàng tiếp nhận và phát triển dự án.

---

## 1. Công Nghệ Sử Dụng (Tech Stack)

Dự án được chia thành 2 phần rõ rệt (Client-Server Architecture):

### 1.1. Frontend (Thư mục `/frontend`)
- **Framework:** React.js (chạy trên môi trường Vite cho tốc độ build cực nhanh).
- **Ngôn ngữ:** JavaScript / JSX.
- **Styling:** CSS thuần (Vanilla CSS) đặt tại `index.css`, sử dụng biến CSS (`--var`) để quản lý màu sắc và giao diện chuẩn.
- **Routing:** React Router v6.
- **State/API:** Fetch API / Axios (call tới Backend).

### 1.2. Backend (Thư mục `/backend`)
- **Framework:** Spring Boot 3.x (Java 17).
- **Database:** H2 Database (In-memory database - dữ liệu tự động khởi tạo mỗi khi chạy app).
- **Security:** Spring Security + JWT Token Authentication (Stateless).
- **ORM:** Spring Data JPA (Hibernate).
- **Build Tool:** Maven.

---

## 2. Hướng Dẫn Khởi Chạy Dự Án (How to Run)

Để hệ thống hoạt động đầy đủ, bạn cần chạy song song cả Backend và Frontend.

### 2.1. Khởi chạy Backend
1. Mở Terminal (Command Prompt / PowerShell).
2. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
3. Chạy lệnh:
   ```bash
   .\mvnw.cmd spring-boot:run
   ```
   *(Backend sẽ khởi chạy tại: `http://localhost:8080`)*

### 2.2. Khởi chạy Frontend
1. Mở một cửa sổ Terminal mới.
2. Di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
3. Cài đặt thư viện (nếu là lần đầu tiên clone code):
   ```bash
   npm install
   ```
4. Chạy ứng dụng:
   ```bash
   npm run dev
   ```
   *(Frontend sẽ khởi chạy tại: `http://localhost:5173`)*

---

## 3. Tài Khoản Test (Seeded Accounts)

Hệ thống đã được cài đặt sẵn (Seed) các tài khoản mặc định và dữ liệu demo thông qua file `DataInitializer.java` ở Backend. Bạn có thể đăng nhập ngay bằng các tài khoản sau:

| Vai Trò | Email | Mật Khẩu | Mô tả |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@candyshop.com` | `admin123` | Quản trị viên: Quản lý Sản phẩm, Danh mục, Đơn hàng |
| **Khách hàng** | `user@candyshop.com` | `user123` | Người dùng: Mua hàng, xem lịch sử, đánh giá sản phẩm |

---

## 4. Cấu Trúc Thư Mục Quan Trọng (Folder Structure)

### 4.1. Frontend (`/frontend/src/`)
- `/api/`: Các file call API tới backend (`authService.js`, `productService.js`, `categoryService.js`,...).
- `/components/`: Các UI Component tái sử dụng (`Navbar.jsx`, `Footer.jsx`, `ProductCard.jsx`,...).
- `/pages/`: Các màn hình chính (`HomePage.jsx`, `CartPage.jsx`, `AdminProductsPage.jsx`,...).
- `App.jsx`: Nơi định nghĩa các Routes (đường dẫn URL).
- `index.css`: File chứa toàn bộ CSS toàn cục của dự án.

### 4.2. Backend (`/backend/src/main/java/com/candyshop/`)
- `/config/`: Cấu hình Security (JWT), CORS, và Khởi tạo dữ liệu mẫu (`DataInitializer.java`).
- `/controller/`: Các REST API Endpoints đón request từ Frontend.
- `/dto/`: Các Data Transfer Object (Request/Response format).
- `/entity/`: Các Model ánh xạ xuống Database (User, Product, Category, Order, Review).
- `/repository/`: Các Interface tương tác với Database (kế thừa JpaRepository).
- `/service/`: Chứa toàn bộ Logic nghiệp vụ của ứng dụng.

---

## 5. Cẩm Nang Chỉnh Sửa Nhanh (Quick Edit Guide)

Nếu bạn muốn thay đổi các thông tin cơ bản trên giao diện mà không cần tìm kiếm nhiều:

- **Thay đổi Logo, Tên cửa hàng trên thanh Menu:** Chỉnh sửa file `frontend/src/components/Navbar.jsx`.
- **Thay đổi Thông tin liên hệ, Địa chỉ ở cuối trang:** Chỉnh sửa file `frontend/src/components/Footer.jsx`.
- **Thay đổi câu chào, Banner quảng cáo ở Trang Chủ:** Chỉnh sửa file `frontend/src/pages/HomePage.jsx`.
- **Thay đổi Tên trên Tab trình duyệt:** Chỉnh sửa file `frontend/index.html` (trong thẻ `<title>`).
- **Chỉnh sửa bảng màu chủ đạo (Màu chính, màu nền):** Chỉnh sửa các biến `--primary`, `--bg-light` ở đầu file `frontend/src/index.css`.

---

*Chúc bạn code vui vẻ và xây dựng được những tính năng tuyệt vời cho Nguyen Huong Grocery Store!* 🚀
