const API_BASE_URL = 'http://localhost:5000/api';

// Generic API request function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    defaultOptions.headers = {
      ...defaultOptions.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response:', errorData);
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API endpoints
export const authAPI = {
  login: async (email: string, password: string) => {
    console.log('API Login attempt:', email);
    
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    console.log('API Login response:', response);
    
    // Store token and user data
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  register: async (name: string, email: string, password: string, role: string, storeName?: string) => {
    console.log('API Register attempt:', { name, email, role, storeName });
    
    const requestBody: any = { name, email, password, role };
    
    // Add store name for sellers
    if (role === 'seller' && storeName) {
      requestBody.storeName = storeName;
    }
    
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
    
    console.log('API Register response:', response);
    
    // Store token and user data
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  getProfile: async () => {
    return await apiRequest('/auth/me');
  },

  updateProfile: async (data: any) => {
    return await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem('authToken');
  },
};

// Products API
export const productsAPI = {
  getAll: async (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await apiRequest(`/products${queryString}`);
  },

  getById: async (id: string) => {
    return await apiRequest(`/products/${id}`);
  },

  create: async (formData: FormData) => {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create product');
    }
    
    return await response.json();
  },

  update: async (id: string, formData: FormData) => {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update product');
    }
    
    return await response.json();
  },

  delete: async (id: string) => {
    return await apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    return await apiRequest('/categories');
  },

  getById: async (id: string) => {
    return await apiRequest(`/categories/${id}`);
  },
};

// Orders API
export const ordersAPI = {
  getMyOrders: async (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await apiRequest(`/orders/my-orders${queryString}`);
  },

  getById: async (id: string) => {
    return await apiRequest(`/orders/${id}`);
  },

  create: async (orderData: any) => {
    return await apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },
};

// Cart API
export const cartAPI = {
  get: async () => {
    return await apiRequest('/cart');
  },

  add: async (productId: string, quantity: number) => {
    return await apiRequest('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  update: async (productId: string, quantity: number) => {
    return await apiRequest('/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  remove: async (productId: string) => {
    return await apiRequest(`/cart/remove/${productId}`, {
      method: 'DELETE',
    });
  },

  clear: async () => {
    return await apiRequest('/cart/clear', {
      method: 'DELETE',
    });
  },
};

// Upload API
export const uploadAPI = {
  uploadAvatar: async (file: File) => {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await fetch(`${API_BASE_URL}/upload/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload avatar');
    }
    
    return await response.json();
  },

  uploadStoreLogo: async (file: File) => {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await fetch(`${API_BASE_URL}/upload/store-logo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload logo');
    }
    
    return await response.json();
  },
};

export default apiRequest;
