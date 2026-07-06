export interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  type: "b2c" | "b2b" | "admin" | "staff";
  loyalty_points: number;
  is_active: boolean;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  children?: Category[];
  icon?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand_id: string | null;
  brand_name?: string;
  category_id: string | null;
  category_name?: string;
  price: number;
  original_price: number | null;
  specs: Record<string, unknown> | null;
  status: "active" | "draft" | "discontinued";
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
  stock?: number;
  average_rating?: number;
  review_count?: number;
}

export interface ProductImage {
  image_set_id: string;
  url: string;
  size: "thumbnail" | "medium" | "large";
  sort_order: number;
  is_primary: boolean;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SearchResult {
  items: Product[];
  total: number;
  facets: SearchFacets;
  page: number;
  page_size: number;
}

export interface SearchFacets {
  brands: FacetBucket[];
  categories: FacetBucket[];
  price_min: number;
  price_max: number;
}

export interface FacetBucket {
  key: string;
  label: string;
  count: number;
}

export interface CartItem {
  product_id: string;
  product_name: string;
  product_slug: string;
  image_url: string | null;
  price: number;
  quantity: number;
  stock: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  coupon_code?: string;
}

export interface Address {
  id?: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  district: string;
  postal_code?: string;
  is_default?: boolean;
}

export interface Order {
  id: string;
  status: OrderStatus;
  total_amount: number;
  discount_amount: number;
  shipping_amount: number;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  payment_ref: string | null;
  delivery_address: Address;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type PaymentMethod = "bkash" | "nagad" | "rocket" | "card" | "cod" | "bank_transfer";

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  image_url?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Review {
  id: string;
  user_name: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

export interface ReviewListResponse {
  items: Review[];
  total: number;
}

export interface ProductQuestion {
  id: string;
  question: string;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
  user_name: string;
}

export interface QuestionListResponse {
  items: ProductQuestion[];
  total: number;
}

export interface PriceHistoryEntry {
  old_price: string;
  new_price: string;
  changed_at: string;
}

export interface PriceHistoryResponse {
  current_price: string;
  history: PriceHistoryEntry[];
}

export interface FinderQuestion {
  id: string;
  label: string;
  type: string;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

export interface FinderResult {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  category: string | null;
  price: number;
  match_score: number;
  match_explanation: string[];
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ApiError {
  detail: string | { msg: string; type: string }[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AdminOrderDetail {
  id: string;
  reference: string;
  status: OrderStatus;
  total_amount: string;
  discount_amount: string;
  shipping_amount: string;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  payment_ref: string | null;
  delivery_address: Address;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  branch_name: string | null;
  items: {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: string;
    total_price: string;
  }[];
  status_history: {
    status: string;
    changed_by: string | null;
    changed_by_name: string | null;
    changed_at: string;
    note: string | null;
  }[];
}

export interface ReturnRequest {
  id: string;
  order_id: string;
  order_reference: string;
  user_id: string;
  customer_name: string;
  items: { product_id: string; quantity: number }[];
  reason: string | null;
  status: "pending" | "approved" | "rejected" | "completed";
  created_at: string;
}

export interface WarrantyClaim {
  id: string;
  order_id: string;
  order_reference: string;
  product_id: string;
  product_name: string;
  user_id: string;
  customer_name: string;
  issue_desc: string;
  status: "pending" | "approved" | "rejected" | "completed";
  created_at: string;
}

export interface InventoryLevel {
  product_id: string;
  branch_id: string;
  branch_name: string;
  branch_address: string;
  branch_phone: string;
  branch_active: boolean;
  quantity: number;
  reserved_qty: number;
  available_qty: number;
  low_stock_threshold: number;
}

export interface InventoryTransfer {
  id: string;
  product_id: string;
  from_branch_id: string;
  to_branch_id: string;
  quantity: number;
  status: "pending" | "approved" | "in_transit" | "completed";
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
}

export interface SalesSummary {
  daily: { date: string; order_count: number; revenue: string }[];
  total_orders: number;
  total_revenue: string;
  average_order_value: string;
}

export interface CategoryRevenue {
  category_id: string;
  category_name: string;
  units_sold: number;
  revenue: string;
}

export interface BranchRevenue {
  branch_id: string;
  branch_name: string;
  order_count: number;
  revenue: string;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  product_slug: string;
  units_sold: number;
  revenue: string;
}

export interface CustomerAcquisitionDay {
  date: string;
  new_customers: number;
  returning_customers: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: string;
  min_order: string | null;
  max_uses: number | null;
  expires_at: string | null;
  is_active: boolean;
  usage_count: number;
}

export interface ImportJobStatus {
  job_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  total_rows: number;
  processed_rows: number;
  success_count: number;
  error_count: number;
  errors: { row_number: number; message: string }[];
}

export interface LowStockItem {
  product_id: string;
  product_name: string;
  product_slug: string;
  branch_id: string;
  branch_name: string;
  quantity: number;
  reserved_qty: number;
  available_qty: number;
  low_stock_threshold: number;
}

export interface ProductFilters {
  category?: string;
  brand?: string | string[];
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  is_featured?: boolean;
  sort?: "price_asc" | "price_desc" | "newest" | "relevance";
  page?: number;
  page_size?: number;
  q?: string;
}
