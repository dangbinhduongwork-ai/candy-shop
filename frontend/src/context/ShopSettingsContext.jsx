import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import settingService from '../api/settingService';

const DEFAULT_SETTINGS = {
  shopName: 'Nguyen Huong Grocery Store',
  shopTitle: 'Nguyen Huong Grocery Store - Bánh kẹo & Tạp hóa chính hãng',
  shopSlogan: 'Grocery Store • Since 2026',
  headerAnnouncement: 'Miễn phí giao hàng cho đơn từ 200.000đ • Hotline đặt hàng & CSKH: 0969 315 603',
  headerHotline: '0969 315 603',
  footerDescription: 'Hệ thống bán lẻ thực phẩm thiết yếu, bánh kẹo cao cấp và đặc sản tuyển chọn. Cam kết chất lượng, nguồn gốc rõ ràng và giá thành hợp lý.',
  footerAddress: 'Số 509 thôn 9, Suối Hai, Ba Vì, Hà Nội',
  footerMapsUrl: 'https://maps.app.goo.gl/BiWJi5AJAdMfZvRb7',
  footerHotline: '0969 315 603',
  footerWorkingHours: '06:00 - 22:00 tất cả các ngày',
  footerEmail: 'taphoa.nguyenhuong@gmail.com',
  footerCopyright: '© 2026 Nguyen Huong Grocery Store. Tất cả các quyền được bảo lưu.',
  footerBadge1: 'Sản phẩm chính hãng',
  footerBadge2: 'Giao hàng tận nơi',
  activeEffect: 'NONE',
  primaryColor: '#0f766e',
  footerBgColor: 'THEME_MATCH',
  shopBackgroundPattern: 'DEFAULT',
  shopBackgroundImageUrl: '',
  shopBackgroundOpacity: 15,
};

/**
 * Convert 3 or 6 digit hex color to RGB object
 */
export const hexToRgb = (hex) => {
  if (!hex || typeof hex !== 'string') return { r: 15, g: 118, b: 110 };
  let c = hex.replace('#', '').trim();
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  if (c.length !== 6) return { r: 15, g: 118, b: 110 };
  const num = parseInt(c, 16);
  if (isNaN(num)) return { r: 15, g: 118, b: 110 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
};

/**
 * Adjust brightness of a hex color by a percentage (-100 to +100).
 * Scales RGB values proportionally to preserve hue and avoid crushing to pure black.
 */
export const adjustBrightness = (hex, percent) => {
  const { r, g, b } = hexToRgb(hex);
  if (percent < 0) {
    // Proportional scaling towards black to preserve color tone
    const factor = Math.max(0, 1 + percent / 100);
    const R = Math.round(r * factor);
    const G = Math.round(g * factor);
    const B = Math.round(b * factor);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  } else {
    // Proportional scaling towards white
    const factor = Math.min(100, percent) / 100;
    const R = Math.round(r + (255 - r) * factor);
    const G = Math.round(g + (255 - g) * factor);
    const B = Math.round(b + (255 - b) * factor);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  }
};

/**
 * Apply dynamic primary theme color and footer color CSS variables directly to document element
 */
export const applyThemeCssVariables = (hexColor, footerBgChoice) => {
  if (typeof document === 'undefined') return;
  const validHex = (hexColor && /^#([0-9A-Fa-f]{3}){1,2}$/.test(hexColor.trim()))
    ? hexColor.trim()
    : '#0f766e';

  const { r, g, b } = hexToRgb(validHex);
  const hoverColor = adjustBrightness(validHex, -12);
  const darkColor = adjustBrightness(validHex, -28);
  const darkerColor = adjustBrightness(validHex, -50);
  const lightColor = `rgba(${r}, ${g}, ${b}, 0.12)`;
  const glowColor = `rgba(${r}, ${g}, ${b}, 0.26)`;
  const accentTextColor = adjustBrightness(validHex, 42);

  // Compute footer background
  let computedFooterBg = '#042f2e';
  const cleanFooterChoice = (footerBgChoice || 'THEME_MATCH').trim();
  if (cleanFooterChoice === 'DARK_SLATE') {
    computedFooterBg = '#0f172a';
  } else if (cleanFooterChoice === 'DEEP_TEAL') {
    computedFooterBg = '#042f2e';
  } else if (cleanFooterChoice === 'DARK_ZINC') {
    computedFooterBg = '#18181b';
  } else if (cleanFooterChoice === 'DARK_COFFEE') {
    computedFooterBg = '#1c100c';
  } else if (cleanFooterChoice === 'DARK_PURPLE') {
    computedFooterBg = '#1e1035';
  } else if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(cleanFooterChoice)) {
    computedFooterBg = cleanFooterChoice;
  } else {
    // Default / THEME_MATCH: Deep, rich shade derived from primary color (~30% brightness)
    computedFooterBg = adjustBrightness(validHex, -70);
  }

  const root = document.documentElement;
  root.style.setProperty('--primary', validHex);
  root.style.setProperty('--primary-hover', hoverColor);
  root.style.setProperty('--primary-dark', darkColor);
  root.style.setProperty('--primary-darker', darkerColor);
  root.style.setProperty('--primary-light', lightColor);
  root.style.setProperty('--primary-glow', glowColor);
  root.style.setProperty('--primary-accent-text', accentTextColor);
  root.style.setProperty('--border-focus', validHex);
  root.style.setProperty('--footer-bg', computedFooterBg);
};

const ShopSettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: false,
  previewEffect: null,
  setPreviewEffect: () => {},
  previewColor: null,
  setPreviewColor: () => {},
  previewFooterColor: null,
  setPreviewFooterColor: () => {},
  previewBackground: null,
  setPreviewBackground: () => {},
  refreshSettings: async () => {},
  updateSettingsLocally: () => {},
});

export const ShopSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [previewEffect, setPreviewEffect] = useState(null);
  const [previewColor, setPreviewColor] = useState(null);
  const [previewFooterColor, setPreviewFooterColor] = useState(null);
  const [previewBackground, setPreviewBackground] = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await settingService.getGeneralSetting();
      if (data && typeof data === 'object') {
        setSettings((prev) => ({
          ...prev,
          ...data,
        }));
      }
    } catch (err) {
      console.warn('Using default shop settings due to network/api response:', err?.message || err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Synchronize dynamic primary and footer color CSS variables
  useEffect(() => {
    const activeColor = previewColor || settings.primaryColor || '#0f766e';
    const activeFooterColor = previewFooterColor || settings.footerBgColor || 'THEME_MATCH';
    applyThemeCssVariables(activeColor, activeFooterColor);
  }, [previewColor, settings.primaryColor, previewFooterColor, settings.footerBgColor]);

  // Dynamically synchronize browser window title
  useEffect(() => {
    const title = settings.shopTitle || settings.shopName;
    if (title) {
      document.title = title;
    }
  }, [settings.shopTitle, settings.shopName]);

  const updateSettingsLocally = (newSettings) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  return (
    <ShopSettingsContext.Provider
      value={{
        settings,
        loading,
        previewEffect,
        setPreviewEffect,
        previewColor,
        setPreviewColor,
        previewFooterColor,
        setPreviewFooterColor,
        previewBackground,
        setPreviewBackground,
        refreshSettings: fetchSettings,
        updateSettingsLocally,
      }}
    >
      {children}
    </ShopSettingsContext.Provider>
  );
};

export const useShopSettings = () => {
  const context = useContext(ShopSettingsContext);
  if (!context) {
    throw new Error('useShopSettings must be used within a ShopSettingsProvider');
  }
  return context;
};

export default ShopSettingsContext;
