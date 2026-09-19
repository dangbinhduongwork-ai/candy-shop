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
};

const ShopSettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: false,
  refreshSettings: async () => {},
  updateSettingsLocally: () => {},
});

export const ShopSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

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
