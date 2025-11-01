'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Brain,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Crown,
  Zap,
  BarChart3,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore, useAppStore, useSubscription } from '@/store';
import { AuthService } from '@/services/auth.service';
import type { SubscriptionTier } from '@/types/api';

interface SidebarProps {
  children: React.ReactNode;
}

const sidebarItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    tier: 'free' as const,
  },
  {
    title: 'AI Analytics',
    icon: Brain,
    href: '/dashboard/ai-analytics',
    tier: 'free' as const,
    featured: true,
  },
  {
    title: 'Revenue Analytics',
    icon: TrendingUp,
    href: '/dashboard/revenue',
    tier: 'free' as const,
  },
  {
    title: 'Product Insights',
    icon: Package,
    href: '/dashboard/products',
    tier: 'basic' as const,
  },
  {
    title: 'AI Forecasting',
    icon: Brain,
    href: '/dashboard/forecasting',
    tier: 'premium' as const,
    premium: true,
  },
  {
    title: 'Seasonal Insights',
    icon: Calendar,
    href: '/dashboard/seasonal',
    tier: 'premium' as const,
    premium: true,
  },
  {
    title: 'Recommendations',
    icon: Zap,
    href: '/dashboard/recommendations',
    tier: 'premium' as const,
    premium: true,
  },
  {
    title: 'Reports',
    icon: BarChart3,
    href: '/dashboard/reports',
    tier: 'basic' as const,
  },
];

function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { tier, hasFeature } = useSubscription();

  const handleLogout = () => {
    AuthService.logout();
    router.push('/auth/business-login');
  };

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case 'premium':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'basic':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case 'premium':
        return <Crown className="h-3 w-3" />;
      case 'basic':
        return <Zap className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">Pasale</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {(user.name || user.email || user.company_name || 'User').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name || user.company_name || user.email || 'Business Owner'}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Badge className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800">
                      <span className="flex items-center space-x-1">
                        <Brain className="h-3 w-3" />
                        <span>Business Owner</span>
                      </span>
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              // All features are now available to all business owners
              const canAccess = true;

              return (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    } ${item.featured ? 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.title}</span>
                    {item.featured && (
                      <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                        NEW
                      </Badge>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* AI Info Section */}
          <div className="p-4 border-t">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  AI Analytics Active
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                All AI features unlocked for business owners
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-gray-900"
              onClick={() => router.push('/dashboard/settings')}
            >
              <Settings className="h-4 w-4 mr-3" />
              Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function Header() {
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { user } = useAuthStore();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">
            Business Analytics Dashboard
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="hidden sm:flex">
            {new Date().toLocaleDateString('en-NP', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Badge>
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: SidebarProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const checkAuth = () => {
      const token = AuthService.getToken();
      const userData = AuthService.getCurrentUser();
      
      if (!token || !userData) {
        router.push('/auth/business-login'); // Updated to correct login route
        return;
      }
      
      // Update auth store with current user data
      useAuthStore.getState().setUser({
        shop_id: userData.shop_id,
        name: userData.name || userData.shop_name,
        email: userData.email,
        shop_name: userData.shop_name,
        company_name: userData.company_name || userData.shop_name,
        subscription_tier: userData.subscription_tier as SubscriptionTier
      });
      
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
