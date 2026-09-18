import axiosClient from './axiosClient';

const bannerService = {
  // Public: Active banners
  getActiveBanners: async () => {
    const response = await axiosClient.get('/api/banners');
    return response.data;
  },

  // Admin: All banners
  getAllBanners: async () => {
    const response = await axiosClient.get('/api/admin/banners');
    return response.data;
  },

  getBannerById: async (id) => {
    const response = await axiosClient.get(`/api/admin/banners/${id}`);
    return response.data;
  },

  createBanner: async (formData) => {
    const response = await axiosClient.post('/api/admin/banners', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateBanner: async (id, formData) => {
    const response = await axiosClient.put(`/api/admin/banners/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteBanner: async (id) => {
    const response = await axiosClient.delete(`/api/admin/banners/${id}`);
    return response.data;
  },

  toggleBannerStatus: async (id, active) => {
    const url = active !== undefined 
      ? `/api/admin/banners/${id}/status?active=${active}`
      : `/api/admin/banners/${id}/status`;
    const response = await axiosClient.put(url);
    return response.data;
  },
};

export default bannerService;
