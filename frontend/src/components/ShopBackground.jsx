import React from 'react';
import { useShopSettings } from '../context/ShopSettingsContext';

/**
 * Pre-defined crisp, lightweight SVG Vector pattern Data URIs.
 * Infinitely sharp on all screen pixel ratios, zero external CDN dependencies.
 */
export const SHOP_PATTERNS = {
  DEFAULT: {
    id: 'DEFAULT',
    name: 'Chấm Bi Tinh Tế',
    desc: 'Họa tiết chấm bi vi mô tinh giản, trang nhã',
    icon: '🫧',
    badge: 'Mặc định',
    // 24x24 dot grid
    svg: `data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='12' cy='12' r='1.5' fill='%2364748b'/%3E%3C/svg%3E`,
    size: '24px 24px',
  },
  CANDY_DOODLE: {
    id: 'CANDY_DOODLE',
    name: 'Thế Giới Bánh Kẹo',
    desc: 'Họa tiết kẹo mút, kẹo gói, ngôi sao ngọt ngào',
    icon: '🍭',
    badge: 'Đặc trưng Candy Shop',
    // 100x100 confectionery doodles
    svg: `data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2364748b'%3E%3C!-- Wrapped candy --%3E%3Cellipse cx='20' cy='20' rx='7' ry='5'/%3E%3Cpolygon points='13,20 7,16 7,24'/%3E%3Cpolygon points='27,20 33,16 33,24'/%3E%3C!-- Lollipop --%3E%3Ccircle cx='75' cy='25' r='7' fill='none' stroke='%2364748b' stroke-width='1.8'/%3E%3Ccircle cx='75' cy='25' r='3'/%3E%3Cpath d='M75,32 L75,44' stroke='%2364748b' stroke-width='1.8' stroke-linecap='round'/%3E%3C!-- 4-Point Star --%3E%3Cpath d='M50,15 Q50,20 55,20 Q50,20 50,25 Q50,20 45,20 Q50,20 50,15 Z'/%3E%3C!-- Gumdrop --%3E%3Cpath d='M25,75 C25,68 35,68 35,75 C35,80 25,80 25,75 Z'/%3E%3C!-- Heart --%3E%3Cpath d='M75,75 C75,72 71,70 69,73 C67,70 63,72 63,75 C63,80 69,85 69,85 C69,85 75,80 75,75 Z'/%3E%3C!-- Sparkles --%3E%3Ccircle cx='12' cy='48' r='1.5'/%3E%3Ccircle cx='88' cy='58' r='1.8'/%3E%3Ccircle cx='50' cy='85' r='1.5'/%3E%3Ccircle cx='90' cy='12' r='1.2'/%3E%3C/g%3E%3C/svg%3E`,
    size: '100px 100px',
  },
  STARRY_CELESTIAL: {
    id: 'STARRY_CELESTIAL',
    name: 'Ngàn Sao Lung Linh',
    desc: 'Sao lấp lánh và bụi tinh vân ma mị, hiện đại',
    icon: '✨',
    badge: 'Sang trọng',
    // 60x60 stars
    svg: `data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2364748b'%3E%3Cpath d='M30,10 Q30,18 38,18 Q30,18 30,26 Q30,18 22,18 Q30,18 30,10 Z'/%3E%3Cpath d='M10,42 Q10,46 14,46 Q10,46 10,50 Q10,46 6,46 Q10,46 10,42 Z'/%3E%3Ccircle cx='50' cy='45' r='1.6'/%3E%3Ccircle cx='48' cy='15' r='1.2'/%3E%3Ccircle cx='18' cy='18' r='1.4'/%3E%3Ccircle cx='32' cy='48' r='1.2'/%3E%3C/g%3E%3C/svg%3E`,
    size: '60px 60px',
  },
  WARM_GEOMETRIC: {
    id: 'WARM_GEOMETRIC',
    name: 'Lưới Tổ Ong Hiện Đại',
    desc: 'Cấu trúc lục giác tổ ong tối giản, công nghệ',
    icon: '🔷',
    badge: 'Hình học',
    // 40x40 hexagon mesh
    svg: `data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20,2 L35,11 L35,29 L20,38 L5,29 L5,11 Z' fill='none' stroke='%2364748b' stroke-width='1' stroke-opacity='0.6'/%3E%3C/svg%3E`,
    size: '40px 40px',
  },
  CHEVRON_WAVE: {
    id: 'CHEVRON_WAVE',
    name: 'Sóng Nhẹ Mềm Mại',
    desc: 'Đường cong gợn sóng nhịp nhàng, êm dịu',
    icon: '🌊',
    badge: 'Mềm mại',
    // 50x30 wave
    svg: `data:image/svg+xml,%3Csvg width='50' height='30' viewBox='0 0 50 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,15 Q12.5,5 25,15 T50,15' fill='none' stroke='%2364748b' stroke-width='1.2' stroke-linecap='round' stroke-opacity='0.7'/%3E%3C/svg%3E`,
    size: '50px 30px',
  },
  NONE: {
    id: 'NONE',
    name: 'Nền Đơn Sắc',
    desc: 'Không sử dụng hoa văn, chỉ giữ màu nền thuần túy',
    icon: '🚫',
    badge: 'Tối giản',
    svg: '',
    size: 'auto',
  },
  CUSTOM_IMAGE: {
    id: 'CUSTOM_IMAGE',
    name: 'Hình Nền Tùy Chỉnh',
    desc: 'Sử dụng hình ảnh bạn tự tải lên hoặc dán liên kết URL',
    icon: '🖼️',
    badge: 'Tùy biến cao',
    svg: '',
    size: 'cover',
  },
};

/**
 * Global background layer component.
 * Renders fixed behind page content, responsive to admin settings & preview.
 */
const ShopBackground = () => {
  const { settings, previewBackground } = useShopSettings();

  // Determine active values (preview overrides stored settings when actively previewing)
  const activePattern = previewBackground?.pattern !== undefined
    ? previewBackground.pattern
    : (settings?.shopBackgroundPattern || 'DEFAULT');

  const activeImageUrl = previewBackground?.imageUrl !== undefined
    ? previewBackground.imageUrl
    : (settings?.shopBackgroundImageUrl || '');

  const activeOpacityRaw = previewBackground?.opacity !== undefined
    ? previewBackground.opacity
    : (settings?.shopBackgroundOpacity ?? 15);

  const opacityValue = Math.max(5, Math.min(50, Number(activeOpacityRaw) || 15)) / 100;

  // Solid background mode
  if (activePattern === 'NONE') {
    return null;
  }

  // Custom uploaded image or URL mode
  if (activePattern === 'CUSTOM_IMAGE' && activeImageUrl && activeImageUrl.trim() !== '') {
    return (
      <div
        id="shop-custom-background"
        aria-hidden="true"
        className="shop-background-overlay shop-bg-custom-image"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("${activeImageUrl.trim()}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          opacity: opacityValue,
          pointerEvents: 'none',
          zIndex: 0,
          transition: 'opacity 0.25s ease',
        }}
      />
    );
  }

  // Preset SVG Vector Pattern mode
  const patternConfig = SHOP_PATTERNS[activePattern] || SHOP_PATTERNS.DEFAULT;
  if (!patternConfig.svg) {
    return null;
  }

  return (
    <div
      id="shop-custom-background"
      aria-hidden="true"
      className={`shop-background-overlay shop-bg-pattern-${activePattern.toLowerCase()}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url("${patternConfig.svg}")`,
        backgroundSize: patternConfig.size,
        backgroundRepeat: 'repeat',
        opacity: opacityValue,
        pointerEvents: 'none',
        zIndex: 0,
        transition: 'opacity 0.25s ease',
      }}
    />
  );
};

export default ShopBackground;
