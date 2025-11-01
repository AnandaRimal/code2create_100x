import { apiClient, API_ENDPOINTS } from '@/lib/api-config';
import type { 
  RevenueResponse,
  ProductsResponse,
  ForecastResponse,
  SeasonalResponse,
  RecommendationsResponse,
  DashboardStats,
  AnalyticsFilters 
} from '@/types/api';

export class AnalyticsService {
  // Get revenue analytics
  static async getRevenue(filters?: AnalyticsFilters): Promise<RevenueResponse> {
    const params = new URLSearchParams();
    
    if (filters?.date_filter) {
      params.append('start_date', filters.date_filter.start_date);
      params.append('end_date', filters.date_filter.end_date);
      params.append('period', filters.date_filter.period);
    }

    const response = await apiClient.get<RevenueResponse>(
      `${API_ENDPOINTS.ANALYTICS.REVENUE}?${params.toString()}`
    );
    return response.data;
  }

  // Get product analytics
  static async getProducts(filters?: AnalyticsFilters): Promise<ProductsResponse> {
    const params = new URLSearchParams();
    
    if (filters?.date_filter) {
      params.append('start_date', filters.date_filter.start_date);
      params.append('end_date', filters.date_filter.end_date);
    }
    
    if (filters?.categories?.length) {
      filters.categories.forEach(cat => params.append('categories', cat));
    }

    const response = await apiClient.get<ProductsResponse>(
      `${API_ENDPOINTS.ANALYTICS.PRODUCTS}?${params.toString()}`
    );
    return response.data;
  }

  // Get AI forecast with error handling
  static async getForecast(weeks: number = 4): Promise<ForecastResponse> {
    try {
      const params = new URLSearchParams();
      params.append('weeks', weeks.toString());

      const response = await apiClient.get<ForecastResponse>(
        `${API_ENDPOINTS.ANALYTICS.FORECAST}?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Forecast API error:', error.response?.status, error.response?.data);
      
      // Return fallback data for common errors
      if (error.response?.status === 401 || error.response?.status === 422 || error.response?.status === 403) {
        throw new Error('Authentication failed - please login again');
      }
      
      // Re-throw other errors to be handled by caller
      throw error;
    }
  }

  // Get seasonal insights with error handling
  static async getSeasonalInsights(): Promise<SeasonalResponse> {
    try {
      const response = await apiClient.get<SeasonalResponse>(
        API_ENDPOINTS.ANALYTICS.SEASONAL
      );
      return response.data;
    } catch (error: any) {
      console.error('Seasonal insights API error:', error.response?.status, error.response?.data);
      
      if (error.response?.status === 401 || error.response?.status === 422 || error.response?.status === 403) {
        throw new Error('Authentication failed - please login again');
      }
      
      throw error;
    }
  }

  // Get AI recommendations with error handling
  static async getRecommendations(): Promise<RecommendationsResponse> {
    try {
      const response = await apiClient.get<RecommendationsResponse>(
        API_ENDPOINTS.ANALYTICS.RECOMMENDATIONS
      );
      return response.data;
    } catch (error: any) {
      console.error('Recommendations API error:', error.response?.status, error.response?.data);
      
      if (error.response?.status === 401 || error.response?.status === 422 || error.response?.status === 403) {
        throw new Error('Authentication failed - please login again');
      }
      
      throw error;
    }
  }

  // Get dashboard stats
  static async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>(
      API_ENDPOINTS.ANALYTICS.DASHBOARD_STATS
    );
    return response.data;
  }

  // Helper: Format currency
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // Helper: Format percentage
  static formatPercentage(value: number): string {
    return new Intl.NumberFormat('en-NP', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  }

  // Helper: Format date
  static formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-NP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  }

  // Helper: Get date range presets
  static getDatePresets() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const lastYear = new Date(today);
    lastYear.setFullYear(lastYear.getFullYear() - 1);

    return {
      today: {
        start_date: today.toISOString().split('T')[0],
        end_date: today.toISOString().split('T')[0],
        period: 'daily' as const,
      },
      yesterday: {
        start_date: yesterday.toISOString().split('T')[0],
        end_date: yesterday.toISOString().split('T')[0],
        period: 'daily' as const,
      },
      last7days: {
        start_date: lastWeek.toISOString().split('T')[0],
        end_date: today.toISOString().split('T')[0],
        period: 'daily' as const,
      },
      last30days: {
        start_date: lastMonth.toISOString().split('T')[0],
        end_date: today.toISOString().split('T')[0],
        period: 'weekly' as const,
      },
      last12months: {
        start_date: lastYear.toISOString().split('T')[0],
        end_date: today.toISOString().split('T')[0],
        period: 'monthly' as const,
      },
    };
  }
}
