import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = Cookies.get("refresh_token");
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });
          Cookies.set("access_token", data.access_token, { expires: 1 });
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return apiClient(originalRequest);
        } catch {
          Cookies.remove("access_token");
          Cookies.remove("refresh_token");
          if (typeof window !== "undefined") window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map((d) => d.msg).join(", ");
  }
  return "Something went wrong. Please try again.";
}

// Auth
export const authApi = {
  register: (data: { name: string; email?: string; phone: string; password: string }) =>
    apiClient.post("/auth/register", data),
  login: (data: { phone: string; password: string } | { email: string; password: string }) =>
    apiClient.post<{ access_token: string; refresh_token: string; token_type: string }>(
      "/auth/login",
      data
    ),
  logout: () => apiClient.post("/auth/logout"),
  me: () => apiClient.get("/auth/me"),
};

// Products
export const productsApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get("/products", { params }),
  getBySlug: (slug: string) => apiClient.get(`/products/${slug}`),
  getFeatured: (limit = 8) => apiClient.get("/products", { params: { is_featured: true, page_size: limit } }),
};

// Categories
export const categoriesApi = {
  list: () => apiClient.get("/categories"),
  getBySlug: (slug: string) => apiClient.get(`/categories/${slug}`),
  getTree: () => apiClient.get("/categories/tree"),
};

// Brands
export const brandsApi = {
  list: (params?: Record<string, unknown>) => apiClient.get("/brands", { params }),
};

// Search
export const searchApi = {
  search: (params: Record<string, unknown>) => apiClient.get("/search", { params }),
  autocomplete: (q: string) => apiClient.get("/search/autocomplete", { params: { q } }),
};

// Cart
export const cartApi = {
  get: () => apiClient.get("/cart"),
  addItem: (data: { product_id: string; quantity: number }) =>
    apiClient.post("/cart/items", data),
  updateItem: (productId: string, quantity: number) =>
    apiClient.put(`/cart/items/${productId}`, { quantity }),
  removeItem: (productId: string) => apiClient.delete(`/cart/items/${productId}`),
  clear: () => apiClient.delete("/cart"),
  applyCoupon: (code: string) => apiClient.post("/cart/coupon", { code }),
  removeCoupon: () => apiClient.delete("/cart/coupon"),
};

// Orders
export const ordersApi = {
  create: (data: Record<string, unknown>) => apiClient.post("/orders", data),
  list: (params?: Record<string, unknown>) => apiClient.get("/orders", { params }),
  getById: (id: string) => apiClient.get(`/orders/${id}`),
};

// Payments
export const paymentsApi = {
  initiate: (data: { order_id: string; payment_method: string }) =>
    apiClient.post("/payments/initiate", data),
};

// Users / Profile
export const usersApi = {
  getProfile: () => apiClient.get("/users/me"),
  updateProfile: (data: Record<string, unknown>) => apiClient.put("/users/me", data),
  getAddresses: () => apiClient.get("/users/me/addresses"),
  addAddress: (data: Record<string, unknown>) => apiClient.post("/users/me/addresses", data),
  updateAddress: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/users/me/addresses/${id}`, data),
  deleteAddress: (id: string) => apiClient.delete(`/users/me/addresses/${id}`),
};

// Notifications
export const notificationsApi = {
  list: () => apiClient.get("/notifications"),
  markRead: (id: string) => apiClient.put(`/notifications/${id}/read`),
  markAllRead: () => apiClient.put("/notifications/read-all"),
};

// Delivery branches
export const branchesApi = {
  list: () => apiClient.get("/branches"),
};
