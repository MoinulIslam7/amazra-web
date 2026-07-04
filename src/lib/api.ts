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
  login: (
    data:
      | { phone: string; password: string; totp_code?: string }
      | { email: string; password: string; totp_code?: string }
  ) =>
    apiClient.post<
      | { access_token: string; refresh_token: string; token_type: string }
      | { requires_2fa: true }
    >("/auth/login", data),
  logout: () => apiClient.post("/auth/logout"),
  me: () => apiClient.get("/users/me"),
  setup2fa: () => apiClient.post<{ secret: string; otpauth_uri: string }>("/auth/2fa/setup"),
  enable2fa: (code: string) => apiClient.post("/auth/2fa/enable", { code }),
  disable2fa: (code: string) => apiClient.post("/auth/2fa/disable", { code }),
};

// Products
export const productsApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get("/products", { params }),
  getBySlug: (slug: string) => apiClient.get(`/products/${slug}`),
  getFeatured: (limit = 8) => apiClient.get("/products", { params: { is_featured: true, page_size: limit } }),
  priceHistory: (idOrSlug: string) => apiClient.get(`/products/${idOrSlug}/price-history`),
  // Admin
  adminList: (params?: Record<string, unknown>) => apiClient.get("/admin/products", { params }),
  adminGet: (id: string) => apiClient.get(`/admin/products/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post("/products", data),
  update: (id: string, data: Record<string, unknown>) => apiClient.put(`/products/${id}`, data),
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/products/${id}/status`, { status }),
  uploadImage: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient.post(`/products/${id}/images`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  setPrimaryImage: (id: string, imageSetId: string) =>
    apiClient.patch(`/products/${id}/images/${imageSetId}/primary`),
  deleteImage: (id: string, imageSetId: string) =>
    apiClient.delete(`/products/${id}/images/${imageSetId}`),
};

// Reviews
export const reviewsApi = {
  list: (productId: string, params?: Record<string, unknown>) =>
    apiClient.get(`/products/${productId}/reviews`, { params }),
  create: (productId: string, data: { rating: number; title?: string; comment?: string }) =>
    apiClient.post(`/products/${productId}/reviews`, data),
  markHelpful: (reviewId: string) => apiClient.post(`/reviews/${reviewId}/helpful`),
};

// Q&A
export const questionsApi = {
  list: (productId: string, params?: Record<string, unknown>) =>
    apiClient.get(`/products/${productId}/questions`, { params }),
  ask: (productId: string, question: string) =>
    apiClient.post(`/products/${productId}/questions`, { question }),
  answer: (questionId: string, answer: string) =>
    apiClient.post(`/questions/${questionId}/answer`, { answer }),
};

// Laptop Finder
export const finderApi = {
  questions: () => apiClient.get("/search/finder/questions"),
  results: (data: Record<string, unknown>) => apiClient.post("/search/finder/results", data),
};

// Categories
export const categoriesApi = {
  list: () => apiClient.get("/categories"),
  getBySlug: (slug: string) => apiClient.get(`/categories/${slug}`),
  getTree: () => apiClient.get("/categories/tree"),
  create: (data: Record<string, unknown>) => apiClient.post("/categories", data),
  update: (id: string, data: Record<string, unknown>) => apiClient.put(`/categories/${id}`, data),
  remove: (id: string) => apiClient.delete(`/categories/${id}`),
};

// Brands
export const brandsApi = {
  list: (params?: Record<string, unknown>) => apiClient.get("/brands", { params }),
  create: (data: Record<string, unknown>) => apiClient.post("/brands", data),
  update: (id: string, data: Record<string, unknown>) => apiClient.put(`/brands/${id}`, data),
  uploadLogo: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient.post(`/brands/${id}/logo`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// Bulk product import
export const importsApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient.post<{ job_id: string }>("/products/import", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  status: (jobId: string) => apiClient.get(`/products/import/${jobId}`),
  templateUrl: () => `${BASE_URL}/api/v1/products/import/template`,
};

// Admin: inventory, orders, payments (for dashboard + inventory screens)
export const adminApi = {
  lowStock: (branchId?: string) =>
    apiClient.get("/inventory/low-stock", { params: branchId ? { branch_id: branchId } : {} }),
  orders: (params?: Record<string, unknown>) => apiClient.get("/admin/orders", { params }),
  reconciliation: (date: string) =>
    apiClient.get("/admin/payments/reconciliation", { params: { date } }),
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
