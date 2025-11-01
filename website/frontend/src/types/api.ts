// API Response Types for Pasale Dashboard

// Business Owner Types (for Next.js frontend)
export interface BusinessOwnerRegisterData {
  email: string;
  password: string;
  name: string;
  citizenship_no: string;
  contact_no: string;
}

export interface BusinessOwnerLoginData {
  email: string;
  password: string;
}

export interface BusinessOwnerResponse {
  owner_id: number;
  email: string;
  name: string;
  citizenship_no: string;
  contact_no: string;
  subscription_tier: 'free' | 'basic' | 'premium';
  is_active: boolean;
  created_at: string;
  account_status: string;
}

export interface BusinessOwnerTokenResponse {
  message: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  owner_id: number;
  email: string;
  subscription_tier: string;
  free_features?: string[];
  upgrade_note?: string;
}

// Shopkeeper Types (for Flutter app integration)
export interface LoginRequest {
  pan_id: string;
  password: string;
}

export interface RegisterRequest {
  shop_name: string;
  pan_id: string;
  password: string;
  address: string;
  contact: string;
  email: string;
  ctzn_no: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  shop_id: number;
  shop_name: string;
  subscription_tier: SubscriptionTier;
}

export type SubscriptionTier = 'free' | 'basic' | 'premium';

export interface Shop {
  shop_id: number;
  shop_name: string;
  pan_id: string;
  address: string;
  contact: string;
  email: string;
  ctzn_no: string;
  subscription_tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
}

export interface Product {
  product_id: number;
  product_name: string;
  category: string;
  price: number;
  shop_id: number;
  created_at: string;
}

export interface Transaction {
  txn_id: number;
  shop_id: number;
  product_id: number;
  quantity: number;
  price: number;
  total_amount: number;
  txn_date: string;
  product_name?: string;
}

export interface RevenueData {
  date: string;
  revenue: number;
  transactions_count: number;
  avg_transaction_value: number;
}

export interface RevenueResponse {
  data: RevenueData[];
  total_revenue: number;
  period_start: string;
  period_end: string;
  subscription_tier: SubscriptionTier;
}

export interface ProductAnalytics {
  product_id: number;
  product_name: string;
  product_type: string;
  total_quantity: number;
  total_revenue: number;
  transaction_count: number;
  avg_price: number;
  last_sale_date: string;
}

export interface ProductsResponse {
  data: ProductAnalytics[];
  total_products: number;
  subscription_tier: SubscriptionTier;
}

export interface ForecastData {
  date: string;
  predicted_revenue: number;
  confidence_lower: number;
  confidence_upper: number;
  trend: number;
}

export interface ForecastResponse {
  forecasts: ForecastData[];
  model_accuracy: number;
  forecast_period: string;
  generated_at: string;
  subscription_tier: SubscriptionTier;
}

export interface SeasonalInsight {
  season: string;
  period: string;
  revenue_impact: number;
  top_products: string[];
  recommendations: string[];
}

export interface SeasonalResponse {
  insights: SeasonalInsight[];
  upcoming_seasons: string[];
  subscription_tier: SubscriptionTier;
}

export interface Recommendation {
  type: 'inventory' | 'pricing' | 'marketing' | 'seasonal';
  title: string;
  description: string;
  impact_score: number;
  action_items: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface RecommendationsResponse {
  recommendations: Recommendation[];
  ai_confidence: number;
  generated_at: string;
  subscription_tier: SubscriptionTier;
}

export interface SubscriptionInfo {
  current_tier: SubscriptionTier;
  tier_limits: {
    data_retention_days: number;
    ai_features: boolean;
    forecasting: boolean;
    recommendations: boolean;
    priority_support: boolean;
  };
  upgrade_options: {
    tier: SubscriptionTier;
    price: number;
    features: string[];
  }[];
}

export interface DashboardStats {
  total_revenue: number;
  total_transactions: number;
  total_products: number;
  avg_transaction_value: number;
  revenue_growth?: number;
  transaction_growth?: number;
  subscription_tier?: SubscriptionTier;
}

export interface ApiError {
  detail: string;
  status_code: number;
  error_type?: string;
}

// Chart Data Types
export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  forecast?: boolean;
  confidence_lower?: number;
  confidence_upper?: number;
}

// Form Types
export interface LoginFormData {
  pan_id: string;
  password: string;
}

export interface RegisterFormData {
  shop_name: string;
  pan_id: string;
  password: string;
  confirm_password: string;
  address: string;
  contact: string;
  email: string;
  ctzn_no: string;
}

// Filter Types
export interface DateFilter {
  start_date: string;
  end_date: string;
  period: 'daily' | 'weekly' | 'monthly';
}

export interface AnalyticsFilters {
  date_filter: DateFilter;
  product_ids?: number[];
  categories?: string[];
}

// Response Wrappers
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
