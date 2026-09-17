# 🍬 Nguyen Huong Grocery Store (E-Commerce)

Dự án website thương mại điện tử chuyên bán các loại bánh kẹo cao cấp, được xây dựng với kiến trúc tách biệt giữa **Backend (Spring Boot 3 + JWT)** và **Frontend (React + Vite)**.

---

## 📑 Mục lục
1. [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
2. [Cấu trúc dự án](#-cấu-trúc-dự-án)
3. [Tài khoản kiểm thử](#-tài-khoản-kiểm-thử)
4. [Hướng dẫn cài đặt và khởi chạy](#-hướng-dẫn-cài-đặt-và-khởi-chạy)
5. [Hướng dẫn sử dụng chức năng](#-hướng-dẫn-sử-dụng-chức-năng)
6. [Tài liệu API (RESTful Endpoints)](#-tài-liệu-api-restful-endpoints)
7. [Cấu hình nâng cao](#-cấu-hình-nâng-cao)

---

## 🛠 Công nghệ sử dụng

### Backend
- **Ngôn ngữ & Framework:** Java 17, Spring Boot 3.3.5
- **Bảo mật:** Spring Security 6, JSON Web Token (JJWT 0.12.6), BCrypt Password Hashing
- **Cơ sở dữ liệu:** 
  - Mặc định môi trường dev: **H2 In-Memory Database** (dữ liệu mẫu tự động khởi tạo khi chạy)
  - Sẵn sàng chuyển đổi: **MySQL** (kèm file cấu hình `application-mysql.properties`)
- **Lưu trữ & Dữ liệu:** Spring Data JPA, Hibernate ORM
- **Upload File:** Lưu trữ ảnh tại thư mục `uploads/` trên server backend và phục vụ qua `/uploads/**`

### Frontend
- **Framework & Build Tool:** React 19, Vite
- **Routing:** React Router v7
- **HTTP Client:** Axios (Interceptors tự động đính kèm JWT Bearer token và xử lý lỗi 401)
- **Styling:** Vanilla CSS tùy biến cao cấp, responsive đa thiết bị, giao diện kẹo ngọt hiện đại

---

## 📁 Cấu trúc dự án

```text
candy-shop/
├── backend/                       # Source code Spring Boot Backend
│   ├── src/main/java/com/candyshop/
│   │   ├── config/                # Cấu hình Security, MVC Resource, DataInitializer
│   │   ├── controller/            # REST Controllers (Auth, Product, Category, User)
│   │   ├── dto/                   # Request & Response Data Transfer Objects
│   │   ├── entity/                # JPA Entities (User, Role, Product, Category)
│   │   ├── exception/             # Xử lý lỗi toàn cục (GlobalExceptionHandler)
│   │   ├── repository/            # Spring Data JPA Repositories
│   │   ├── security/              # JWT Token Provider, Filters, UserDetailsService
│   │   └── service/               # Business Logic Services & Implementations
│   ├── src/main/resources/
│   │   ├── application.properties # Cấu hình H2 Database, JWT, Uploads
│   │   └── application-mysql.properties # Cấu hình môi trường MySQL
│   ├── uploads/                   # Thư mục lưu trữ ảnh tải lên từ client
│   └── pom.xml                    # Maven dependencies
│
├── frontend/                      # Source code React Frontend
│   ├── src/
│   │   ├── api/                   # Axios Client & API Services (authService, productService)
│   │   ├── components/            # Navbar, ProtectedRoute, AdminRoute, ProductModal
│   │   ├── context/               # AuthContext (quản lý trạng thái đăng nhập, JWT)
│   │   ├── pages/                 # HomePage, LoginPage, RegisterPage, AdminProductsPage
│   │   ├── App.jsx                # Routing chính
│   │   ├── index.css              # Design System toàn cục
│   │   └── main.jsx               # React entry point
│   └── package.json
└── README.md                      # Tài liệu hướng dẫn sử dụng này
```

---

## 👥 Tài khoản kiểm thử

Hệ thống đã tự động nạp sẵn 2 tài khoản qua `DataInitializer`:

| Vai trò | Email đăng nhập | Mật khẩu | Quyền hạn & Chức năng |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@candyshop.com` | `admin123` | Có toàn quyền CRUD sản phẩm & danh mục, upload ảnh, truy cập trang quản lý Admin (`/admin/products`). |
| **Khách hàng (User)** | `user@candyshop.com` | `user123` | Xem danh mục sản phẩm, duyệt sản phẩm trên trang chủ; **bị chặn** nếu cố truy cập trang Admin. |

---

## 🚀 Hướng dẫn cài đặt và khởi chạy

### Yêu cầu môi trường
- **Java:** JDK 17 trở lên
- **Node.js:** Node.js v18 trở lên & npm

---

### Bước 1: Khởi chạy Backend (Spring Boot)

Mở Terminal tại thư mục `backend`:
```powershell
# Di chuyển vào thư mục backend
cd backend

# Khởi chạy bằng Maven Wrapper
.\mvnw.cmd spring-boot:run
```
* **Backend API Base URL:** `http://localhost:8080`
* **H2 Database Web Console:** `http://localhost:8080/h2-console`
  - *JDBC URL:* `jdbc:h2:mem:candyshop`
  - *User Name:* `sa`
  - *Password:* (để trống)

---

### Bước 2: Khởi chạy Frontend (React Vite)

Mở một cửa sổ Terminal khác tại thư mục `frontend`:
```powershell
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies (nếu chạy lần đầu)
npm install

# Khởi chạy server phát triển
npm run dev
```
* **Frontend Web App URL:** `http://localhost:5173`

---

## 📖 Hướng dẫn sử dụng chức năng

### 1. Đăng ký & Đăng nhập
1. Truy cập `http://localhost:5173/login`.
2. Đăng nhập bằng tài khoản Admin (`admin@candyshop.com` / `admin123`) hoặc User (`user@candyshop.com` / `user123`).
3. Hoặc chuyển sang trang **Đăng ký** (`/register`) để tạo tài khoản mới.

### 2. Xem sản phẩm trên Trang chủ (`/`)
- Hiển thị danh mục bánh kẹo sinh động lấy trực tiếp từ cơ sở dữ liệu.
- Bấm vào các thẻ danh mục (**🌈 Tất cả, 🍬 Kẹo Dẻo & Marshmallow, Sô Cô La & Cacao, Bánh Quy,...**) để lọc sản phẩm nhanh chóng.
- Thẻ sản phẩm hiển thị ảnh, tên, mô tả, giá bán định dạng VNĐ và số lượng tồn kho.

### 3. Trang Quản lý Sản phẩm dành cho Admin (`/admin/products`)
> **Lưu ý:** Chỉ tài khoản có Role `ROLE_ADMIN` mới có thể truy cập trang này hoặc nhìn thấy nút **⚙️ Quản lý sản phẩm** trên thanh điều hướng (Navbar).

#### ✨ Thêm sản phẩm mới:
1. Nhấn nút **"✨ Thêm sản phẩm mới"** ở góc phải màn hình.
2. Hộp thoại (Modal) mở ra, nhập các thông tin:
   - **Tên sản phẩm:** *(Bắt buộc)*
   - **Loại bánh kẹo:** *(Chọn từ danh sách có sẵn)*
   - **Giá bán (VNĐ):** *(Bắt buộc, số dương > 0)*
   - **Số lượng tồn kho:** *(Bắt buộc, số nguyên >= 0)*
   - **Mô tả:** *(Tùy chọn)*
   - **Hình ảnh:** Bấm nút **"📁 Tải ảnh từ máy tính"** để chọn file ảnh từ máy (hệ thống sẽ tự động upload và hiển thị xem trước) hoặc dán đường dẫn URL ảnh trực tiếp.
3. Bấm **"Tạo sản phẩm"**.

#### ✏️ Chỉnh sửa sản phẩm:
1. Tại dòng sản phẩm muốn sửa trong bảng, nhấn nút **"✏️ Sửa"**.
2. Cập nhật các thông tin mong muốn (giá, số lượng tồn, tên, ảnh mới).
3. Bấm **"Cập nhật sản phẩm"**.

#### 🗑️ Xóa sản phẩm:
1. Nhấn nút **"🗑️ Xóa"** tại sản phẩm cần xóa.
2. Hộp thoại xác nhận cảnh báo an toàn sẽ xuất hiện để tránh xóa nhầm.
3. Bấm **"Xác nhận xóa"** để xóa sản phẩm.

#### 🔍 Tìm kiếm & Lọc sản phẩm:
- Nhập từ khóa vào ô tìm kiếm (tìm kiếm theo tên sản phẩm hoặc mô tả).
- Lọc theo danh mục hoặc trạng thái.
- Sử dụng các nút phân trang ở dưới cùng bảng để chuyển trang.

### 4. Đặt Hàng & Lịch Sử Đơn Hàng (Orders)
- Kiểm tra giỏ hàng và tiến hành đặt hàng trực tuyến (Thanh toán COD).
- Theo dõi lịch sử đơn hàng đã đặt tại màn hình "Đơn hàng của tôi".
- Theo dõi tiến trình đơn hàng với các trạng thái rõ ràng (PENDING, CONFIRMED, SHIPPING, COMPLETED, CANCELLED).

### 5. Quản Lý Đơn Hàng dành cho Admin (`/admin/orders`)
- Xem danh sách toàn bộ đơn hàng trong hệ thống.
- Tìm kiếm đơn hàng, lọc đơn hàng theo trạng thái hoặc khoảng thời gian đặt hàng.
- Cập nhật trạng thái đơn hàng (Ví dụ: Từ Chờ xác nhận sang Đã xác nhận).
- Hủy đơn hàng (nếu cần thiết, hệ thống tự động hoàn lại tồn kho).

### 6. Đánh Giá Sản Phẩm (Reviews)
- Khách hàng có thể viết đánh giá & bình chọn sao (1-5 sao) cho những sản phẩm đã mua thành công (Đơn hàng ở trạng thái COMPLETED).
- Mỗi user chỉ được đánh giá 1 lần cho mỗi sản phẩm.
- Hiển thị điểm đánh giá trung bình và danh sách bình luận chân thực trên trang chi tiết sản phẩm.

### 7. Quản Lý Danh Mục dành cho Admin (`/admin/categories`)
- Kéo thả mượt mà để sắp xếp lại thứ tự hiển thị danh mục trên Trang chủ.
- Công tắc (Switch) Bật/tắt trạng thái ẩn hiện của danh mục ngay lập tức.
- Thêm/sửa ảnh đại diện, mô tả chi tiết cho từng loại bánh kẹo.

---

## 📡 Tài liệu API (RESTful Endpoints)

### 1. Xác thực (Authentication) - Public
| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới (trả về JWT Token) |
| `POST` | `/api/auth/login` | Đăng nhập hệ thống (trả về JWT Token) |
| `GET` | `/api/users/me` | Lấy thông tin tài khoản đang đăng nhập |

### 2. Sản phẩm (Products)
| Phương thức | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | **Public** | Lấy danh sách sản phẩm (hỗ trợ phân trang `page`, `size`, tìm kiếm theo tên `keyword`, lọc danh mục `categoryId`, lọc khoảng giá `minPrice` & `maxPrice`, sắp xếp `sortBy`, `sortDir`) |
| `GET` | `/api/products/{id}` | **Public** | Lấy chi tiết 1 sản phẩm theo ID |
| `POST` | `/api/products` | **ADMIN** | Tạo sản phẩm mới |
| `PUT` | `/api/products/{id}` | **ADMIN** | Cập nhật sản phẩm theo ID |
| `DELETE` | `/api/products/{id}` | **ADMIN** | Xóa sản phẩm theo ID |
| `POST` | `/api/products/upload-image` | **ADMIN** | Upload file ảnh multipart lên thư mục `uploads/` |

### 3. Danh mục bánh kẹo (Categories)
| Phương thức | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | **Public** | Lấy danh sách tất cả loại bánh kẹo |
| `GET` | `/api/categories/{id}` | **Public** | Lấy chi tiết loại bánh kẹo theo ID |
| `POST` | `/api/categories` | **ADMIN** | Tạo loại bánh kẹo mới |
| `PUT` | `/api/categories/{id}` | **ADMIN** | Cập nhật loại bánh kẹo |
| `PUT` | `/api/categories/{id}/status` | **ADMIN** | Đổi trạng thái ẩn/hiện danh mục |
| `PUT` | `/api/categories/reorder` | **ADMIN** | Cập nhật hàng loạt thứ tự hiển thị |
| `DELETE` | `/api/categories/{id}` | **ADMIN** | Xóa loại bánh kẹo (nếu không có sản phẩm liên kết) |

### 4. Giỏ hàng (Shopping Cart) - Yêu cầu Đăng nhập (USER & ADMIN)
| Phương thức | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | **Authenticated** | Lấy giỏ hàng của user đang đăng nhập (kèm danh sách món hàng, đơn giá, số lượng, thành tiền từng món, tổng số lượng và tổng tiền) |
| `POST` | `/api/cart/items` | **Authenticated** | Thêm sản phẩm vào giỏ hàng (`productId`, `quantity`). Tự động cộng dồn số lượng nếu sản phẩm đã có |
| `PUT` | `/api/cart/items/{itemId}` | **Authenticated** | Cập nhật số lượng của một món hàng trong giỏ (`quantity > 0` và `<= stockQuantity`) |
| `DELETE` | `/api/cart/items/{itemId}` | **Authenticated** | Xóa một món hàng khỏi giỏ |
| `DELETE` | `/api/cart` | **Authenticated** | Xóa toàn bộ giỏ hàng |

### 5. File tĩnh
| Phương thức | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/uploads/{filename}` | **Public** | Xem ảnh tĩnh đã upload lên server |

### 6. Đơn Hàng (Orders)
| Phương thức | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/orders` | **ADMIN** | Xem toàn bộ đơn hàng (có phân trang, tìm kiếm, lọc) |
| `GET` | `/api/orders/my-orders` | **Authenticated** | Lấy danh sách lịch sử đơn hàng của user hiện tại |
| `GET` | `/api/orders/{id}` | **Authenticated** | Xem chi tiết 1 đơn hàng (Admin xem mọi đơn, User chỉ xem đơn của mình) |
| `POST` | `/api/orders` | **Authenticated** | Đặt hàng từ giỏ hàng hiện tại (chọn COD) |
| `PUT` | `/api/orders/{id}/status` | **ADMIN** | Cập nhật trạng thái xử lý đơn hàng |
| `PUT` | `/api/orders/{id}/cancel` | **Authenticated / ADMIN** | Hủy đơn hàng (User chỉ hủy khi PENDING) |

### 7. Đánh Giá Sản Phẩm (Reviews)
| Phương thức | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reviews/product/{productId}` | **Public** | Lấy danh sách đánh giá của sản phẩm |
| `POST` | `/api/reviews` | **Authenticated** | Viết đánh giá mới (yêu cầu đơn hàng đã mua ở trạng thái COMPLETED) |

---

## ⚙️ Cấu hình nâng cao

### Chuyển sang cơ sở dữ liệu MySQL
1. Mở file [application.properties](file:///c:/Users/Admin/.gemini/antigravity/scratch/candy-shop/backend/src/main/resources/application.properties).
2. Tạo database MySQL có tên `candyshop`.
3. Kích hoạt profile MySQL hoặc cấu hình chuỗi kết nối:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/candyshop?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=your_password
   spring.jpa.hibernate.ddl-auto=update
   ```

---
*Chúc bạn có trải nghiệm tuyệt vời với ứng dụng Nguyen Huong Grocery Store!* 🍭🍬🍰
#   c a n d y - s h o p  
 