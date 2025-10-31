'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  AlertTriangle,
  RefreshCw,
  Download,
  Zap,
  BarChart3,
  Loader2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from 'recharts';

import { useAuthStore } from '@/store';

// Mock forecast data
const mockForecastData = [
  { month: 'Oct 2025', actual: 185000, predicted: 192000, confidence: 92 },
  { month: 'Nov 2025', actual: null, predicted: 198000, confidence: 89 },
  { month: 'Dec 2025', actual: null, predicted: 215000, confidence: 87 },
  { month: 'Jan 2026', actual: null, predicted: 178000, confidence: 85 },
  { month: 'Feb 2026', actual: null, predicted: 195000, confidence: 83 },
  { month: 'Mar 2026', actual: null, predicted: 208000, confidence: 81 },
];

const mockDemandForecast = [
  { 
    product: 'Basmati Rice Premium', 
    category: 'Grains',
    current_demand: 450, 
    predicted_demand: 520, 
    change: 15.6,
    confidence: 91,
    seasonality: 'High',
    stock_status: 'sufficient'
  },
  { 
    product: 'Mustard Oil', 
    category: 'Oils',
    current_demand: 180, 
    predicted_demand: 165, 
    change: -8.3,
    confidence: 88,
    seasonality: 'Medium',
    stock_status: 'low'
  },
  { 
    product: 'Turmeric Powder', 
    category: 'Spices',
    current_demand: 85, 
    predicted_demand: 110, 
    change: 29.4,
    confidence: 85,
    seasonality: 'High',
    stock_status: 'critical'
  },
  { 
    product: 'Red Lentils', 
    category: 'Pulses',
    current_demand: 220, 
    predicted_demand: 195, 
    change: -11.4,
    confidence: 89,
    seasonality: 'Low',
    stock_status: 'sufficient'
  },
  { 
    product: 'Black Tea', 
    category: 'Beverages',
    current_demand: 95, 
    predicted_demand: 125, 
    change: 31.6,
    confidence: 82,
    seasonality: 'Medium',
    stock_status: 'sufficient'
  },
];

const mockTrendData = [
  { week: 'Week 1', sales: 45000, forecast: 47000 },
  { week: 'Week 2', sales: 48000, forecast: 49500 },
  { week: 'Week 3', sales: 52000, forecast: 51000 },
  { week: 'Week 4', sales: 49000, forecast: 48500 },
  { week: 'Week 5', sales: null, forecast: 53000 },
  { week: 'Week 6', sales: null, forecast: 55000 },
  { week: 'Week 7', sales: null, forecast: 52000 },
  { week: 'Week 8', sales: null, forecast: 57000 },
];

interface DemandCardProps {
  item: typeof mockDemandForecast[0];
}

function DemandCard({ item }: DemandCardProps) {
  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'sufficient': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeasonalityColor = (seasonality: string) => {
    switch (seasonality) {
      case 'High': return 'bg-purple-100 text-purple-800';
      case 'Medium': return 'bg-blue-100 text-blue-800';
      case 'Low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">{item.product}</h3>
            <p className="text-sm text-gray-500">{item.category}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStockStatusColor(item.stock_status)}>
              {item.stock_status}
            </Badge>
            {item.stock_status === 'critical' && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Current Demand</p>
            <p className="text-xl font-bold">{item.current_demand}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Predicted Demand</p>
            <p className="text-xl font-bold">{item.predicted_demand}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {getChangeIcon(item.change)}
            <span className={`text-sm font-semibold ${getChangeColor(item.change)}`}>
              {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}%
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Confidence: {item.confidence}%
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Badge className={getSeasonalityColor(item.seasonality)}>
            {item.seasonality} Seasonality
          </Badge>
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div
              className={`bg-blue-600 h-2 rounded-full w-${Math.round(item.confidence / 10) * 10}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ForecastingPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly');

  const loadForecastData = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to load forecast data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadForecastData();
  }, [timeframe]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getNextMonthPrediction = () => {
    const nextMonth = mockForecastData.find(d => d.actual === null);
    return nextMonth ? nextMonth.predicted : 0;
  };

  const getCurrentMonthActual = () => {
    const currentMonth = mockForecastData.find(d => d.actual !== null);
    return currentMonth ? currentMonth.actual : 0;
  };

  const getAverageConfidence = () => {
    const totalConfidence = mockDemandForecast.reduce((sum, item) => sum + item.confidence, 0);
    return Math.round(totalConfidence / mockDemandForecast.length);
  };

  const getCriticalProducts = () => {
    return mockDemandForecast.filter(item => item.stock_status === 'critical').length;
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Sales Forecasting</h1>
          <p className="text-muted-foreground">
            AI-powered demand prediction and inventory planning for {user?.company_name || 'your business'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={loadForecastData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Next Month Forecast</p>
                <p className="text-2xl font-bold">{formatCurrency(getNextMonthPrediction())}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Predicted revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Month</p>
                <p className="text-2xl font-bold">{formatCurrency(getCurrentMonthActual())}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Actual revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Confidence</p>
                <p className="text-2xl font-bold">{getAverageConfidence()}%</p>
              </div>
              <Zap className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Prediction accuracy</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock Alerts</p>
                <p className="text-2xl font-bold text-red-600">{getCriticalProducts()}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Critical stock items</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Forecast Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Revenue Forecast</CardTitle>
              <CardDescription>6-month sales prediction with confidence intervals</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as 'weekly' | 'monthly' | 'quarterly')}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                aria-label="Select timeframe"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={mockForecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} fontSize={12} />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'actual' ? 'Actual Revenue' : 'Predicted Revenue'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="predicted" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3}
                name="predicted"
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="actual"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Weekly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Sales Trends</CardTitle>
          <CardDescription>Short-term forecast vs actual performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" fontSize={12} />
              <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} fontSize={12} />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'sales' ? 'Actual Sales' : 'Forecast'
                ]}
              />
              <Bar dataKey="sales" fill="#10B981" name="sales" />
              <Bar dataKey="forecast" fill="#3B82F6" name="forecast" opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Demand Forecast */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Product Demand Forecast</h2>
            <p className="text-sm text-gray-500">Predicted demand changes for top products</p>
          </div>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            View Calendar
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockDemandForecast.map((item, index) => (
            <DemandCard key={index} item={item} />
          ))}
        </div>
      </div>

      {/* Insights & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI Insights & Recommendations</CardTitle>
          <CardDescription>Smart suggestions based on forecast analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800">Critical Stock Alert</h4>
                <p className="text-sm text-red-700">
                  Turmeric Powder demand is expected to increase by 29.4% next month. Current stock may be insufficient.
                </p>
                <Button variant="outline" size="sm" className="mt-2 border-red-300 text-red-700">
                  Reorder Now
                </Button>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-800">Growth Opportunity</h4>
                <p className="text-sm text-green-700">
                  Black Tea demand is forecasted to grow 31.6%. Consider increasing marketing efforts and stock levels.
                </p>
                <Button variant="outline" size="sm" className="mt-2 border-green-300 text-green-700">
                  View Details
                </Button>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800">Seasonal Pattern Detected</h4>
                <p className="text-sm text-blue-700">
                  Basmati Rice shows high seasonal variation. Plan inventory accordingly for upcoming festival season.
                </p>
                <Button variant="outline" size="sm" className="mt-2 border-blue-300 text-blue-700">
                  Set Reminder
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
