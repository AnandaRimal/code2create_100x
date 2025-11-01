'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { AnalyticsService } from '@/services/analytics.service';
import { useDashboardStore, useSubscription } from '@/store';
import type { RevenueData, ProductAnalytics, DashboardStats } from '@/types/api';

// Mock data for demonstration
const mockRevenueData: RevenueData[] = [
  { date: '2025-08-28', revenue: 45000, transactions_count: 23, avg_transaction_value: 1956 },
  { date: '2025-08-29', revenue: 52000, transactions_count: 28, avg_transaction_value: 1857 },
  { date: '2025-08-30', revenue: 38000, transactions_count: 19, avg_transaction_value: 2000 },
  { date: '2025-08-31', revenue: 61000, transactions_count: 32, avg_transaction_value: 1906 },
  { date: '2025-09-01', revenue: 74000, transactions_count: 41, avg_transaction_value: 1805 },
  { date: '2025-09-02', revenue: 68000, transactions_count: 35, avg_transaction_value: 1943 },
  { date: '2025-09-03', revenue: 82000, transactions_count: 45, avg_transaction_value: 1822 },
];

const mockProductData: ProductAnalytics[] = [
  { product_id: 1, product_name: 'Rice', product_type: 'Food', total_quantity: 150, total_revenue: 125000, transaction_count: 25, avg_price: 300, last_sale_date: '2025-09-03' },
  { product_id: 2, product_name: 'Cooking Oil', product_type: 'Food', total_quantity: 80, total_revenue: 95000, transaction_count: 20, avg_price: 400, last_sale_date: '2025-09-03' },
  { product_id: 3, product_name: 'Mobile Phone', product_type: 'Electronics', total_quantity: 5, total_revenue: 80000, transaction_count: 5, avg_price: 16000, last_sale_date: '2025-09-02' },
  { product_id: 4, product_name: 'Tea', product_type: 'Beverage', total_quantity: 90, total_revenue: 45000, transaction_count: 18, avg_price: 300, last_sale_date: '2025-09-03' },
  { product_id: 5, product_name: 'Soap', product_type: 'Hygiene', total_quantity: 60, total_revenue: 30000, transaction_count: 15, avg_price: 200, last_sale_date: '2025-09-02' },
  { product_id: 6, product_name: 'T-Shirt', product_type: 'Clothing', total_quantity: 25, total_revenue: 25000, transaction_count: 10, avg_price: 1000, last_sale_date: '2025-09-01' },
];

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ElementType;
  description: string;
}

function StatCard({ title, value, change = 0, icon: Icon, description }: StatCardProps) {
  const displayChange = typeof change === 'number' ? change : 0;
  const isPositive = displayChange >= 0;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
            {isPositive ? '+' : ''}{displayChange.toFixed(1)}%
          </span>
          <span>{description}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function UpgradePrompt({ feature }: { feature: string }) {
  return (
    <Card className="border-dashed border-2 border-gray-300">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <CardTitle className="mb-2">Upgrade Required</CardTitle>
        <CardDescription className="mb-4">
          {feature} is only available for Premium subscribers
        </CardDescription>
        <Button className="bg-purple-600 hover:bg-purple-700">
          Upgrade to Premium
        </Button>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { tier, hasFeature } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [productsData, setProductsData] = useState<ProductAnalytics[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load real data from API
      const [dashboardStats, revenueResponse, productsResponse] = await Promise.all([
        AnalyticsService.getDashboardStats(),
        AnalyticsService.getRevenue({ date_filter: AnalyticsService.getDatePresets().last7days }),
        AnalyticsService.getProducts({ date_filter: AnalyticsService.getDatePresets().last30days }),
      ]);
      
      setStats(dashboardStats);
      setRevenueData(revenueResponse.data || []);
      setProductsData(productsResponse.data || []);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Fallback to mock data if API fails
      const mockStats: DashboardStats = {
        total_revenue: 320000,
        total_transactions: 167,
        total_products: 45,
        avg_transaction_value: 1916,
        revenue_growth: 12.5,
        transaction_growth: 8.3,
        subscription_tier: tier,
      };
      
      setStats(mockStats);
      setRevenueData(mockRevenueData);
      setProductsData(mockProductData);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const chartData = revenueData.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-NP', { month: 'short', day: 'numeric' }),
    revenue: item.revenue,
    transactions: item.transactions_count,
  }));

  // Process category data similar to revenue page
  const categoryData = productsData.reduce((acc, product) => {
    const categoryName = product.product_type || 'Unknown';
    const existing = acc.find(item => item.name === categoryName);
    if (existing) {
      existing.value += product.total_revenue;
    } else {
      acc.push({ name: categoryName, value: product.total_revenue });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Calculate percentages and format data like revenue page
  const totalRevenue = categoryData.reduce((sum, item) => sum + item.value, 0);
  const categoryDataWithPercentage = categoryData.map(item => ({
    ...item,
    percentage: totalRevenue > 0 ? Math.round((item.value / totalRevenue) * 100) : 0
  })).sort((a, b) => b.value - a.value); // Sort by revenue descending

  // Color scheme similar to revenue page
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'];
  
  // Predefined color classes to avoid inline styles
  const colorClasses = [
    'bg-blue-500', 'bg-emerald-500', 'bg-yellow-400', 'bg-orange-500', 'bg-purple-500',
    'bg-teal-400', 'bg-amber-400', 'bg-red-400', 'bg-sky-400', 'bg-pink-400'
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your business overview.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {tier.toUpperCase()} Plan
          </Badge>
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={AnalyticsService.formatCurrency(stats.total_revenue)}
            change={stats.revenue_growth || 0}
            icon={DollarSign}
            description="from last period"
          />
          <StatCard
            title="Transactions"
            value={stats.total_transactions.toString()}
            change={stats.transaction_growth || 0}
            icon={ShoppingCart}
            description="from last period"
          />
          <StatCard
            title="Products"
            value={stats.total_products.toString()}
            change={5.2}
            icon={Package}
            description="active products"
          />
          <StatCard
            title="Avg. Transaction"
            value={AnalyticsService.formatCurrency(stats.avg_transaction_value)}
            change={3.8}
            icon={TrendingUp}
            description="per transaction"
          />
        </div>
      )}

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>
              Daily revenue for the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: number) => [AnalyticsService.formatCurrency(value), 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution - Enhanced like Revenue Page */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
            <CardDescription>
              Distribution across product categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDataWithPercentage}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percentage }) => `${percentage}%`}
                >
                  {categoryDataWithPercentage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => AnalyticsService.formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {categoryDataWithPercentage.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${colorClasses[index % colorClasses.length]}`} />
                    <span>{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{AnalyticsService.formatCurrency(category.value)}</div>
                    <div className="text-xs text-gray-500">{category.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Products</CardTitle>
          <CardDescription>
            Your best-selling products by revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {productsData.slice(0, 5).map((product, index) => (
              <div key={product.product_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{product.product_name}</p>
                    <p className="text-sm text-gray-500">{product.product_type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{AnalyticsService.formatCurrency(product.total_revenue)}</p>
                  <p className="text-sm text-gray-500">{product.total_quantity} units sold</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Premium Features Preview */}
      {!hasFeature('ai_features') && (
        <div className="grid gap-4 md:grid-cols-2">
          <UpgradePrompt feature="AI Revenue Forecasting" />
          <UpgradePrompt feature="Smart Recommendations" />
        </div>
      )}

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {lastUpdated.toLocaleString('en-NP')}
      </div>
    </div>
  );
}
