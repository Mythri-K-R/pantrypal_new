const API_BASE = 'https://pantrypal-new.onrender.com';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('pantrypal_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// Auth
export const authApi = {
  login: (phone: string, password: string) =>
    request<{ token: string; role: string; name: string }>('/api/auth/login', {
      method: 'POST', body: JSON.stringify({ phone, password }),
    }),
  register: (data: { name: string; phone: string; password: string; role: string }) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
};

// Products
export const productsApi = {
  searchByBarcode: (barcode: string) =>
    request<any>(`/api/products/barcode/${barcode}`),
  search: (query: string) =>
    request<any[]>(`/api/products/search?q=${encodeURIComponent(query)}`),
};

// Inventory
export const inventoryApi = {
  getAll: () => request<any[]>('/api/inventory'),
  add: (data: {
    product_id: number; mfd_date: string; expiry_date: string;
    quantity: number; purchase_price: number; selling_price: number;
  }) => request('/api/inventory', { method: 'POST', body: JSON.stringify(data) }),
  getDashboard: () => request<any>('/api/inventory/dashboard'),
  getStockHistory: () => request<any[]>('/api/inventory/history'),
  getNearExpiry: () => request<any[]>('/api/inventory/near-expiry'),
  getDiscountSuggestions: () => request<any[]>('/api/inventory/discounts'),
};

// Sales
export const salesApi = {
  create: (items: any[]) =>
    request<{ claim_code: string; total_amount: number }>('/api/sales', {
      method: 'POST', body: JSON.stringify({ items }),
    }),
  getHistory: () => request<any[]>('/api/sales/history'),
};

// Customer
export const customerApi = {
  claim: (code: string) =>
    request('/api/claim', { method: 'POST', body: JSON.stringify({ claim_code: code }) }),
  getItems: () => request<any[]>('/api/customer/items'),
  markUsed: (id: number) =>
    request(`/api/customer/items/${id}/use`, { method: 'PUT' }),
  setReminder: (id: number, reminder_date: string, reminder_time?: string) =>
    request(`/api/customer/items/${id}/reminder`, {
      method: 'PUT',
      body: JSON.stringify({ reminder_date, reminder_time: reminder_time || '06:00' }),
    }),
  getNotifications: () => request<any[]>('/api/customer/notifications'),
};

export const analyticsApi = {
  get: () => request<any>('/api/analytics'),
};
