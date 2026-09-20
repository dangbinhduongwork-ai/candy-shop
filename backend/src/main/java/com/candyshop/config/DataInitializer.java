package com.candyshop.config;

import com.candyshop.entity.*;
import com.candyshop.repository.CategoryRepository;
import com.candyshop.repository.ProductRepository;
import com.candyshop.repository.UserRepository;
import com.candyshop.repository.VoucherRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final VoucherRepository voucherRepository;
    private final com.candyshop.repository.ShopSettingRepository shopSettingRepository;
    private final com.candyshop.repository.BannerRepository bannerRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           VoucherRepository voucherRepository,
                           com.candyshop.repository.ShopSettingRepository shopSettingRepository,
                           com.candyshop.repository.BannerRepository bannerRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.voucherRepository = voucherRepository;
        this.shopSettingRepository = shopSettingRepository;
        this.bannerRepository = bannerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        initUsers();
        initCategoriesAndProducts();
        initVouchers();
        initShopSettings();
        initBanners();
    }

    private void initUsers() {
        if (!userRepository.existsByEmail("admin@candyshop.com")) {
            User admin = new User();
            admin.setFullName("Quản Trị Viên");
            admin.setEmail("admin@candyshop.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setPhone("0988888888");
            admin.setRole(Role.ROLE_ADMIN);
            userRepository.save(admin);
            log.info("Initialized default ADMIN account: admin@candyshop.com / admin123");
        }

        if (!userRepository.existsByEmail("user@candyshop.com")) {
            User customer = new User();
            customer.setFullName("Nguyễn Văn Khách");
            customer.setEmail("user@candyshop.com");
            customer.setPassword(passwordEncoder.encode("user123"));
            customer.setPhone("0912345678");
            customer.setRole(Role.ROLE_USER);
            userRepository.save(customer);
            log.info("Initialized default USER account: user@candyshop.com / user123");
        }
    }

    private void initCategoriesAndProducts() {
        if (categoryRepository.count() > 0) {
            return;
        }

        log.info("Initializing sample categories and products...");

        // 5 Categories with images and display orders
        Category gummy = categoryRepository.save(new Category(
                "Kẹo Dẻo & Marshmallow",
                "Các loại kẹo dẻo trái cây mềm mịn, marshmallow bông xốp đủ vị thơm ngon",
                "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=600&auto=format&fit=crop&q=80",
                1
        ));
        Category chocolate = categoryRepository.save(new Category(
                "Sô Cô La & Cacao",
                "Sô cô la thủ công cao cấp, sô cô la sữa, sô cô la đen nguyên chất và hạnh nhân",
                "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80",
                2
        ));
        Category cookies = categoryRepository.save(new Category(
                "Bánh Quy & Bánh Ngọt",
                "Bánh quy bơ giòn rụm, bánh tart, macaron và các loại pastry ngọt ngào",
                "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80",
                3
        ));
        Category hardCandy = categoryRepository.save(new Category(
                "Kẹo Cứng & Kẹo Mút",
                "Kẹo mút cầu vồng sắc màu, kẹo ngậm thảo mộc hoa quả thơm mát sảng khoái",
                "https://images.unsplash.com/photo-1575224300306-1b8da36134ec?w=600&auto=format&fit=crop&q=80",
                4
        ));
        Category traditional = categoryRepository.save(new Category(
                "Bánh Kẹo Truyền Thống",
                "Kẹo dừa Bến Tre, kẹo mè xửng, bánh pía, kẹo đậu phộng thơm bùi đậm đà",
                "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&auto=format&fit=crop&q=80",
                5
        ));

        // 12 Sample Products
        List<Product> sampleProducts = Arrays.asList(
            new Product(null, "Kẹo Dẻo Gấu Trái Cây Haribo Gummy",
                "Kẹo dẻo hình chú gấu xinh xắn với 5 hương vị trái cây tự nhiên: táo, dâu tây, cam, chanh và mâm xôi. Nhập khẩu chính hãng.",
                new BigDecimal("45000"), 120, gummy,
                "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=600&auto=format&fit=crop&q=80", null, null),

            new Product(null, "Marshmallow Bông Tuyết Vani & Dâu",
                "Kẹo xốp dẻo mềm mịn vị vani dâu ngọt dịu, thích hợp ăn trực tiếp hoặc nướng thả vào tách cacao nóng ấm áp.",
                new BigDecimal("55000"), 85, gummy,
                "https://images.unsplash.com/photo-1575224300306-1b8da36134ec?w=600&auto=format&fit=crop&q=80", null, null),

            new Product(null, "Sô Cô La Đen 72% Hạnh Nhân Rang Muối",
                "Thanh sô cô la đen nguyên chất 72% cacao kết hợp cùng hạt hạnh nhân giòn bùi và chút muối biển tinh tế.",
                new BigDecimal("85000"), 60, chocolate,
                "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80", null, null),

            new Product(null, "Hộp Quà Truffles Sô Cô La Thượng Hạng",
                "Hộp quà 12 viên truffles phủ bột cacao Bỉ với nhân kem tươi ganache tan chảy đậm đà thơm lừng.",
                new BigDecimal("160000"), 40, chocolate,
                "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=600&auto=format&fit=crop&q=80", null, null),

            new Product(null, "Bánh Quy Bơ Đan Mạch Hộp Thiếc",
                "Bánh quy bơ cao cấp theo công thức hoàng gia Đan Mạch, thơm ngậy mùi bơ tươi nhập khẩu, giòn tan khi cắn.",
                new BigDecimal("125000"), 50, cookies,
                "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80", null, null),

            new Product(null, "Hộp Bánh Macaron Pháp 6 Vị Sắc Màu",
                "Bánh macaron chuẩn hương vị Pháp gồm các vị: matcha, quả mọng, việt quất, chanh leo, caramel muối và sô cô la.",
                new BigDecimal("145000"), 35, cookies,
                "https://images.unsplash.com/photo-1569864321398-386001097ee0?w=600&auto=format&fit=crop&q=80", null, null),

            new Product(null, "Kẹo Mút Cầu Vồng Xoắn Khổng Lồ",
                "Cây kẹo mút xoắn tròn nhiều màu rực rỡ hương vị kẹo bông ngọt ngào, món quà yêu thích của trẻ em và giới trẻ chụp ảnh.",
                new BigDecimal("25000"), 200, hardCandy,
                "https://images.unsplash.com/photo-1575224300306-1b8da36134ec?w=600&auto=format&fit=crop&q=80", null, null),

            new Product(null, "Kẹo Cứng Bạc Hà Thảo Mộc Sảng Khoái",
                "Kẹo ngậm thảo dược chiết xuất từ lá bạc hà tự nhiên và hoa quả rừng, mang lại cảm giác the mát sảng khoái và thông cổ.",
                new BigDecimal("35000"), 150, hardCandy,
                "https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=600&auto=format&fit=crop&q=80", null, null),

            new Product(null, "Kẹo Dừa Sáp Bến Tre Thượng Hạng",
                "Đặc sản kẹo dừa dẻo béo ngậy được làm từ dừa sáp Cầu Kè cùng sữa tươi và lá dứa thơm lừng ngọt dịu thanh tao.",
                new BigDecimal("65000"), 90, traditional,
                "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&auto=format&fit=crop&q=80", null, null),

            new Product(null, "Kẹo Mè Xửng Giòn Cố Đô Huế",
                "Kẹo mè xửng giòn truyền thống rắc vừng rang vàng ươm, hòa quyện đậu phộng và mạch nha dẻo thơm đậm vị quê hương.",
                new BigDecimal("40000"), 110, traditional,
                "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80", null, null),

            new Product(null, "Kẹo Dẻo Vị Trái Cây Nhiệt Đới Sour Gummy",
                "Kẹo dẻo chua ngọt phủ lớp đường tinh thể chua kích thích vị giác, mang hương vị chanh dây, xoài cát và dứa thơm ngon.",
                new BigDecimal("48000"), 95, gummy,
                "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=600&auto=format&fit=crop&q=80", null, null),

            new Product(null, "Thỏi Sô Cô La Trắng Hạt Dẻ Cười Pistachio",
                "Sô cô la trắng béo ngậy kết hợp sốt hồ trăn hạt dẻ cười (Pistachio) thơm ngon chuẩn phong cách Dubai.",
                new BigDecimal("110000"), 70, chocolate,
                "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80", null, null)
        );

        productRepository.saveAll(sampleProducts);
        log.info("Initialized 5 categories and {} sample products.", sampleProducts.size());
    }

    private void initVouchers() {
        if (voucherRepository.count() == 0) {
            LocalDateTime now = LocalDateTime.now();

            Voucher v1 = new Voucher(
                    "WELCOME10",
                    "Giảm 10% cho khách hàng mới",
                    "Giảm 10% tối đa 30.000đ cho đơn hàng từ 50.000đ",
                    DiscountType.PERCENTAGE,
                    new BigDecimal("10"),
                    new BigDecimal("50000"),
                    new BigDecimal("30000"),
                    now.minusDays(1),
                    now.plusMonths(3),
                    100,
                    0,
                    1,
                    VoucherStatus.ACTIVE
            );

            Voucher v2 = new Voucher(
                    "GIAM30K",
                    "Giảm ngay 30.000đ",
                    "Giảm 30.000đ cho đơn hàng từ 100.000đ",
                    DiscountType.FIXED_AMOUNT,
                    new BigDecimal("30000"),
                    new BigDecimal("100000"),
                    null,
                    now.minusDays(1),
                    now.plusMonths(2),
                    50,
                    0,
                    1,
                    VoucherStatus.ACTIVE
            );

            Voucher v3 = new Voucher(
                    "SWEET50",
                    "Tri ân tín đồ hảo ngọt",
                    "Giảm 50.000đ cho đơn hàng từ 200.000đ",
                    DiscountType.FIXED_AMOUNT,
                    new BigDecimal("50000"),
                    new BigDecimal("200000"),
                    null,
                    now.minusDays(1),
                    now.plusMonths(1),
                    20,
                    0,
                    1,
                    VoucherStatus.ACTIVE
            );

            voucherRepository.saveAll(Arrays.asList(v1, v2, v3));
            log.info("Initialized 3 sample vouchers: WELCOME10, GIAM30K, SWEET50");
        }
    }

    private void initShopSettings() {
        saveSettingIfAbsent("DEFAULT_SHIPPING_FEE", "25000", "Phí vận chuyển mặc định (VNĐ)");
        saveSettingIfAbsent("FREE_SHIPPING_THRESHOLD", "300000", "Ngưỡng giá trị đơn hàng được miễn phí vận chuyển (VNĐ)");
        saveSettingIfAbsent("SHOP_NAME", "Nguyen Huong Grocery Store", "Tên hiển thị thương hiệu shop");
        saveSettingIfAbsent("SHOP_TITLE", "Nguyen Huong Grocery Store - Bánh kẹo & Tạp hóa chính hãng", "Tiêu đề trình duyệt & SEO của shop");
        saveSettingIfAbsent("SHOP_SLOGAN", "Grocery Store • Since 2026", "Slogan / Phụ đề thương hiệu");
        saveSettingIfAbsent("HEADER_ANNOUNCEMENT", "Miễn phí giao hàng cho đơn từ 200.000đ • Hotline đặt hàng & CSKH: 0969 315 603", "Thanh thông báo chạy trên đầu trang header");
        saveSettingIfAbsent("HEADER_HOTLINE", "0969 315 603", "Hotline hỗ trợ hiển thị trên header");
        saveSettingIfAbsent("FOOTER_DESCRIPTION", "Hệ thống bán lẻ thực phẩm thiết yếu, bánh kẹo cao cấp và đặc sản tuyển chọn. Cam kết chất lượng, nguồn gốc rõ ràng và giá thành hợp lý.", "Đoạn giới thiệu ngắn về shop ở chân trang footer");
        saveSettingIfAbsent("FOOTER_ADDRESS", "Số 509 thôn 9, Suối Hai, Ba Vì, Hà Nội", "Địa chỉ cửa hàng ở footer");
        saveSettingIfAbsent("FOOTER_MAPS_URL", "https://maps.app.goo.gl/BiWJi5AJAdMfZvRb7", "Đường dẫn Google Maps");
        saveSettingIfAbsent("FOOTER_HOTLINE", "0969 315 603", "Số điện thoại hotline ở footer");
        saveSettingIfAbsent("FOOTER_WORKING_HOURS", "06:00 - 22:00 tất cả các ngày", "Thời gian mở cửa phục vụ");
        saveSettingIfAbsent("FOOTER_EMAIL", "taphoa.nguyenhuong@gmail.com", "Email liên hệ của cửa hàng");
        saveSettingIfAbsent("FOOTER_COPYRIGHT", "© 2026 Nguyen Huong Grocery Store. Tất cả các quyền được bảo lưu.", "Dòng chữ bản quyền ở đáy trang footer");
        saveSettingIfAbsent("FOOTER_BADGE_1", "Sản phẩm chính hãng", "Huy hiệu cam kết 1 ở footer");
        saveSettingIfAbsent("FOOTER_BADGE_2", "Giao hàng tận nơi", "Huy hiệu cam kết 2 ở footer");
        saveSettingIfAbsent("ACTIVE_SEASONAL_EFFECT", "NONE", "Hiệu ứng giao diện theo mùa");
        saveSettingIfAbsent("PRIMARY_COLOR", "#0f766e", "Màu sắc chủ đạo của toàn bộ hệ thống shop");
        saveSettingIfAbsent("SHOP_BACKGROUND_PATTERN", "DEFAULT", "Họa tiết nền của shop (DEFAULT, CANDY_DOODLE, STARRY_CELESTIAL, WARM_GEOMETRIC, CHEVRON_WAVE, NONE, CUSTOM_IMAGE)");
        saveSettingIfAbsent("SHOP_BACKGROUND_IMAGE_URL", "", "Đường dẫn hình nền tùy chỉnh của shop");
        saveSettingIfAbsent("SHOP_BACKGROUND_OPACITY", "15", "Độ mờ / trong suốt của hình nền shop (5 - 50)");
        saveSettingIfAbsent("FOOTER_BG_COLOR", "THEME_MATCH", "Màu sắc chân trang footer (THEME_MATCH, DARK_OBSIDIAN, hoặc mã Hex)");
        log.info("Initialized default shop settings (Shipping, Branding, Header, Footer, Visual Effects & Appearance)");
    }


    private void saveSettingIfAbsent(String key, String value, String description) {
        if (!shopSettingRepository.existsBySettingKey(key)) {
            shopSettingRepository.save(new ShopSetting(key, value, description));
        }
    }


    private void initBanners() {
        if (bannerRepository.count() == 0) {
            LocalDateTime now = LocalDateTime.now();
            Banner b1 = new Banner(
                    "https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=1600&auto=format&fit=crop&q=80",
                    "Thiên Đường Kẹo Ngọt - Giảm Đến 30% Đơn Đầu Tiên",
                    "/products",
                    1,
                    true,
                    now.minusDays(1),
                    now.plusMonths(3)
            );
            Banner b2 = new Banner(
                    "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=1600&auto=format&fit=crop&q=80",
                    "Sô Cô La Thủ Công Cao Cấp - Hương Vị Đậm Đà Khó Quên",
                    "/category/2",
                    2,
                    true,
                    now.minusDays(1),
                    now.plusMonths(3)
            );
            Banner b3 = new Banner(
                    "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1600&auto=format&fit=crop&q=80",
                    "Bánh Quy Bơ Thượng Hạng - Mua 2 Tặng 1 Cực Hot",
                    "/category/3",
                    3,
                    true,
                    now.minusDays(1),
                    now.plusMonths(3)
            );
            bannerRepository.saveAll(Arrays.asList(b1, b2, b3));
            log.info("Initialized 3 sample homepage banners");
        }
    }
}
