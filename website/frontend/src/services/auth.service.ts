import { apiClient, API_ENDPOINTS } from '@/lib/api-config';
import type { 
  BusinessOwnerLoginData,
  BusinessOwnerRegisterData,
  BusinessOwnerTokenResponse,
  BusinessOwnerResponse,
  SubscriptionInfo 
} from '@/types/api';

export class AuthService {
  // Login business owner
  static async login(credentials: BusinessOwnerLoginData): Promise<BusinessOwnerTokenResponse> {
    const response = await apiClient.post<BusinessOwnerTokenResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    // Store auth data
    if (response.data.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
      localStorage.setItem('user_data', JSON.stringify({
        owner_id: response.data.owner_id,
        email: response.data.email,
        subscription_tier: response.data.subscription_tier,
      }));
    }
    
    return response.data;
  }

  // Register new business owner
  static async register(userData: BusinessOwnerRegisterData): Promise<BusinessOwnerTokenResponse> {
    const response = await apiClient.post<BusinessOwnerTokenResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      userData
    );
    
    // Auto-login after registration
    if (response.data.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
      localStorage.setItem('user_data', JSON.stringify({
        owner_id: response.data.owner_id,
        email: response.data.email,
        subscription_tier: response.data.subscription_tier,
      }));
    }
    
    return response.data;
  }

  // Logout user
  static logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    window.location.href = '/auth/business-login';
  }

  // Get current user data
  static getCurrentUser(): { 
    owner_id: number; 
    email: string; 
    subscription_tier: string;
    name?: string;
    contact_no?: string;
    citizenship_no?: string;
  } | null {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  // Get auth token
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    return localStorage.getItem('auth_token');
  }

  // Check subscription tier
  static hasSubscription(requiredTier: 'free' | 'basic' | 'premium'): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const tierLevels = { free: 0, basic: 1, premium: 2 };
    const userLevel = tierLevels[user.subscription_tier as keyof typeof tierLevels];
    const requiredLevel = tierLevels[requiredTier];

    return userLevel >= requiredLevel;
  }

  // Get subscription info
  static async getSubscriptionInfo(): Promise<SubscriptionInfo> {
    const response = await apiClient.get<SubscriptionInfo>(
      API_ENDPOINTS.SUBSCRIPTIONS.INFO
    );
    return response.data;
  }

  // Upgrade subscription
  static async upgradeSubscription(tier: 'basic' | 'premium'): Promise<void> {
    await apiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.UPGRADE, { tier });
    
    // Update local user data
    const userData = this.getCurrentUser();
    if (userData) {
      userData.subscription_tier = tier;
      localStorage.setItem('user_data', JSON.stringify(userData));
    }
  }
}
