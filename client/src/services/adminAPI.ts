import apiRequest from './api';

// Admin API endpoints
export const adminAPI = {
  // Users management
  getUsers: async (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await apiRequest(`/admin/users${queryString}`);
  },

  getUserById: async (id: string) => {
    return await apiRequest(`/admin/users/${id}`);
  },

  updateUser: async (id: string, data: any) => {
    return await apiRequest(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteUser: async (id: string) => {
    return await apiRequest(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Sellers management
  getSellers: async (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await apiRequest(`/admin/sellers${queryString}`);
  },

  getSellerById: async (id: string) => {
    return await apiRequest(`/admin/sellers/${id}`);
  },

  approveSeller: async (id: string) => {
    return await apiRequest(`/admin/sellers/${id}/approve`, {
      method: 'PUT',
    });
  },

  rejectSeller: async (id: string, reason?: string) => {
    return await apiRequest(`/admin/sellers/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  },

  // Products management
  getProducts: async (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await apiRequest(`/admin/products${queryString}`);
  },

  updateProduct: async (id: string, data: any) => {
    return await apiRequest(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteProduct: async (id: string) => {
    return await apiRequest(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Orders management
  getOrders: async (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await apiRequest(`/admin/orders${queryString}`);
  },

  updateOrderStatus: async (id: string, status: string) => {
    return await apiRequest(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Analytics
  getAnalytics: async () => {
    return await apiRequest('/admin/analytics');
  },

  getSalesData: async (period?: string) => {
    const queryString = period ? `?period=${period}` : '';
    return await apiRequest(`/admin/analytics/sales${queryString}`);
  },

  getUserStats: async () => {
    return await apiRequest('/admin/analytics/users');
  },

  getProductStats: async () => {
    return await apiRequest('/admin/analytics/products');
  },
};

export default adminAPI;
