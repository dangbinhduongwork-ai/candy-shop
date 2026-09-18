import axiosClient from './axiosClient';

const settingService = {
  // Public
  getShippingSetting: async () => {
    const response = await axiosClient.get('/api/settings/shipping');
    return response.data;
  },

  // Admin
  getAdminShippingSetting: async () => {
    const response = await axiosClient.get('/api/admin/settings/shipping');
    return response.data;
  },

  updateShippingSetting: async (data) => {
    const response = await axiosClient.put('/api/admin/settings/shipping', data);
    return response.data;
  },
};

export default settingService;
