import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  SubscriptionTier,
  DashboardStats,
  RevenueData,
  ProductAnalytics,
  ForecastData,
  Recommendation 
} from '@/types/api';

interface User {
  owner_id?: number;
  shop_id?: number;
  name?: string;
  email?: string;
  shop_name?: string;
  company_name?: string;
  subscription_tier?: SubscriptionTier;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

interface DashboardState {
  stats: DashboardStats | null;
  revenueData: RevenueData[];
  productsData: ProductAnalytics[];
  forecastData: ForecastData[];
  recommendations: Recommendation[];
  isLoading: boolean;
  lastUpdated: string | null;
  setStats: (stats: DashboardStats) => void;
  setRevenueData: (data: RevenueData[]) => void;
  setProductsData: (data: ProductAnalytics[]) => void;
  setForecastData: (data: ForecastData[]) => void;
  setRecommendations: (data: Recommendation[]) => void;
  setLoading: (loading: boolean) => void;
  clearData: () => void;
}

interface AppState {
  sidebarOpen: boolean;
  currentPage: string;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentPage: (page: string) => void;
}

// Auth Store
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'pasale-auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// Dashboard Store
export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  revenueData: [],
  productsData: [],
  forecastData: [],
  recommendations: [],
  isLoading: false,
  lastUpdated: null,
  setStats: (stats) => set({ stats, lastUpdated: new Date().toISOString() }),
  setRevenueData: (revenueData) => set({ revenueData, lastUpdated: new Date().toISOString() }),
  setProductsData: (productsData) => set({ productsData, lastUpdated: new Date().toISOString() }),
  setForecastData: (forecastData) => set({ forecastData, lastUpdated: new Date().toISOString() }),
  setRecommendations: (recommendations) => set({ recommendations, lastUpdated: new Date().toISOString() }),
  setLoading: (isLoading) => set({ isLoading }),
  clearData: () => set({
    stats: null,
    revenueData: [],
    productsData: [],
    forecastData: [],
    recommendations: [],
    lastUpdated: null,
  }),
}));

// App State Store
export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  currentPage: 'dashboard',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setCurrentPage: (currentPage) => set({ currentPage }),
}));

// Subscription helpers
export const useSubscription = () => {
  const user = useAuthStore((state) => state.user);
  
  const hasFeature = (feature: 'ai_features' | 'forecasting' | 'recommendations'): boolean => {
    if (!user || !user.subscription_tier) return false;
    
    const features = {
      free: {
        ai_features: true,  // Allow basic AI features for all
        forecasting: false,
        recommendations: false,
      },
      basic: {
        ai_features: true,
        forecasting: false,
        recommendations: false,
      },
      premium: {
        ai_features: true,
        forecasting: true,
        recommendations: true,
      },
    };
    
    return features[user.subscription_tier][feature];
  };
  
  const canAccessDays = (): number => {
    if (!user || !user.subscription_tier) return 7;
    
    const access = {
      free: 7,
      basic: 365,
      premium: 365,
    };
    
    return access[user.subscription_tier];
  };
  
  const getUpgradeOptions = () => {
    if (!user || !user.subscription_tier) return [];
    
    const options = [];
    
    if (user.subscription_tier === 'free') {
      options.push(
        { tier: 'basic', name: 'Basic', price: 2000 },
        { tier: 'premium', name: 'Premium', price: 5000 }
      );
    } else if (user.subscription_tier === 'basic') {
      options.push(
        { tier: 'premium', name: 'Premium', price: 3000 }
      );
    }
    
    return options;
  };
  
  return {
    tier: user?.subscription_tier || 'free',
    hasFeature,
    canAccessDays,
    getUpgradeOptions,
  };
};
