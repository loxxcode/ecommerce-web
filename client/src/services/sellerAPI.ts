import apiRequest from './api';

// Seller API endpoints
export const sellerAPI = {
  // Dashboard analytics
  getDashboardStats: async () => {
    return await apiRequest('/seller/dashboard');
  },

  getSalesData: async (period?: string) => {
    const queryString = period ? `?period=${period}` : '';
    return await apiRequest(`/seller/sales${queryString}`);
  },

  // Products management
  getProducts: async (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await apiRequest(`/seller/products${queryString}`);
  },

  getProductById: async (id: string) => {
    return await apiRequest(`/seller/products/${id}`);
  },

  createProduct: async (productData: any) => {
    return await apiRequest('/seller/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  updateProduct: async (id: string, productData: any) => {
    return await apiRequest(`/seller/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  deleteProduct: async (id: string) => {
    return await apiRequest(`/seller/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Orders management
  getOrders: async (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await apiRequest(`/seller/orders${queryString}`);
  },

  getOrderById: async (id: string) => {
    return await apiRequest(`/seller/orders/${id}`);
  },

  updateOrderStatus: async (id: string, status: string) => {
    return await apiRequest(`/seller/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Analytics
  getAnalytics: async (period?: string) => {
    const queryString = period ? `?period=${period}` : '';
    return await apiRequest(`/seller/analytics${queryString}`);
  },

  // Profile management
  getProfile: async () => {
    return await apiRequest('/seller/profile');
  },

  updateProfile: async (profileData: any) => {
    return await apiRequest('/seller/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Store settings
  getStoreSettings: async () => {
    return await apiRequest('/seller/store');
  },

  updateStoreSettings: async (storeData: any) => {
    return await apiRequest('/seller/store', {
      method: 'PUT',
      body: JSON.stringify(storeData),
    });
  }
};
