-- ==========================================================
-- V2__add_performance_indexes.sql : Enterprise Performance & Query Indexes
-- Idempotent: DROP first to avoid "Duplicate key" on retry
-- ==========================================================

-- Products indexes
DROP INDEX IF EXISTS idx_products_category ON products;
DROP INDEX IF EXISTS idx_products_price ON products;
DROP INDEX IF EXISTS idx_products_created_at ON products;
DROP INDEX IF EXISTS idx_products_cat_price ON products;
DROP INDEX IF EXISTS idx_products_fulltext_name ON products;
DROP INDEX IF EXISTS idx_products_fulltext_desc ON products;
DROP INDEX IF EXISTS idx_products_fulltext ON products;

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_cat_price ON products(category_id, price);

-- Orders indexes
DROP INDEX IF EXISTS idx_orders_user_status ON orders;
DROP INDEX IF EXISTS idx_orders_status ON orders;
DROP INDEX IF EXISTS idx_orders_created_at ON orders;

CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Order Items indexes
DROP INDEX IF EXISTS idx_order_items_order ON order_items;
DROP INDEX IF EXISTS idx_order_items_product ON order_items;

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Vouchers indexes
DROP INDEX IF EXISTS idx_vouchers_date_status ON vouchers;

CREATE INDEX idx_vouchers_date_status ON vouchers(status, start_date, end_date);

-- Reviews indexes
DROP INDEX IF EXISTS idx_reviews_product_rating ON reviews;

CREATE INDEX idx_reviews_product_rating ON reviews(product_id, rating);

-- Banners indexes
DROP INDEX IF EXISTS idx_banners_active_order ON banners;

CREATE INDEX idx_banners_active_order ON banners(active, display_order);
