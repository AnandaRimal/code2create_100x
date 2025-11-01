'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Sun,
  Snowflake,
  Leaf,
  Cloud,
  RefreshCw,
  Download,
  AlertCircle,
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
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
} from 'recharts';

import { useAuthStore } from '@/store';

// Mock seasonal data
const mockSeasonalData = [
  { month: 'Jan', sales: 165000, temp: 15, festivals: 1, seasonal_factor: 0.85 },
  { month: 'Feb', sales: 142000, temp: 18, festivals: 0, seasonal_factor: 0.75 },
  { month: 'Mar', sales: 198000, temp: 25, festivals: 1, seasonal_factor: 1.05 },
  { month: 'Apr', sales: 185000, temp: 30, festivals: 2, seasonal_factor: 0.95 },
  { month: 'May', sales: 156000, temp: 35, festivals: 0, seasonal_factor: 0.82 },
  { month: 'Jun', sales: 134000, temp: 32, festivals: 0, seasonal_factor: 0.72 },
  { month: 'Jul', sales: 145000, temp: 28, festivals: 0, seasonal_factor: 0.78 },
  { month: 'Aug', sales: 168000, temp: 27, festivals: 1, seasonal_factor: 0.88 },
  { month: 'Sep', sales: 189000, temp: 26, festivals: 2, seasonal_factor: 1.02 },
  { month: 'Oct', sales: 225000, temp: 22, festivals: 3, seasonal_factor: 1.25 },
  { month: 'Nov', sales: 198000, temp: 18, festivals: 2, seasonal_factor: 1.08 },
  { month: 'Dec', sales: 212000, temp: 12, festivals: 1, seasonal_factor: 1.18 },
];

const mockProductSeasonality = [
  {
    product: 'Basmati Rice Premium',
    category: 'Grains',
    peak_season: 'Oct-Dec',
    peak_factor: 1.45,
    low_season: 'Jun-Aug',
    low_factor: 0.65,
    festivals: ['Dashain', 'Tihar', 'New Year'],
    pattern: 'Festival-driven',
    volatility: 'High'
  },
  {
    product: 'Mustard Oil',
    category: 'Oils',
    peak_season: 'Nov-Jan',
    peak_factor: 1.32,
    low_season: 'May-Jul',
    low_factor: 0.72,
    festivals: ['Winter Season'],
    pattern: 'Weather-driven',
    volatility: 'Medium'
  },
  {
    product: 'Turmeric Powder',
    category: 'Spices',
    peak_season: 'Sep-Nov',
    peak_factor: 1.58,
    low_season: 'Mar-May',
    low_factor: 0.58,
    festivals: ['Dashain', 'Wedding Season'],
    pattern: 'Festival-driven',
    volatility: 'High'
  },
  {
    product: 'Black Tea',
    category: 'Beverages',
    peak_season: 'Dec-Feb',
    peak_factor: 1.25,
    low_season: 'Jun-Aug',
    low_factor: 0.78,
    festivals: ['Winter Season'],
    pattern: 'Weather-driven',
    volatility: 'Low'
  },
  {
    product: 'Red Lentils',
    category: 'Pulses',
    peak_season: 'Oct-Dec',
    peak_factor: 1.18,
    low_season: 'Apr-Jun',
    low_factor: 0.82,
    festivals: ['Festival Season'],
    pattern: 'Stable',
    volatility: 'Low'
  },
];

const mockFestivalImpact = [
  { festival: 'Dashain', period: 'Oct', impact: 285, growth: 45.2 },
  { festival: 'Tihar', period: 'Nov', impact: 198, growth: 28.5 },
  { festival: 'New Year', period: 'Jan', impact: 156, growth: 18.7 },
  { festival: 'Holi', period: 'Mar', impact: 142, growth: 22.3 },
  { festival: 'Buddha Jayanti', period: 'May', impact: 89, growth: 12.1 },
];

const mockWeatherCorrelation = [
  { factor: 'Temperature', correlation: 0.72, impact: 'High', description: 'Hot weather reduces sales' },
  { factor: 'Rainfall', correlation: -0.45, impact: 'Medium', description: 'Rain increases indoor consumption' },
  { factor: 'Humidity', correlation: -0.38, impact: 'Medium', description: 'High humidity affects storage' },
  { factor: 'Festivals', correlation: 0.89, impact: 'Very High', description: 'Festival seasons boost sales' },
];

const seasons = [
  { name: 'Spring', icon: Leaf, period: 'Mar-May', sales: 179667, growth: -5.2, color: 'text-green-600' },
  { name: 'Summer', icon: Sun, period: 'Jun-Aug', sales: 149000, growth: -12.8, color: 'text-yellow-600' },
  { name: 'Autumn', icon: Cloud, period: 'Sep-Nov', sales: 204000, growth: 18.5, color: 'text-orange-600' },
  { name: 'Winter', icon: Snowflake, period: 'Dec-Feb', sales: 173000, growth: 8.2, color: 'text-blue-600' },
];

interface ProductSeasonalityCardProps {
  product: typeof mockProductSeasonality[0];
}

function ProductSeasonalityCard({ product }: ProductSeasonalityCardProps) {
  const getVolatilityColor = (volatility: string) => {
    switch (volatility) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPatternColor = (pattern: string) => {
    switch (pattern) {
      case 'Festival-driven': return 'bg-purple-100 text-purple-800';
      case 'Weather-driven': return 'bg-blue-100 text-blue-800';
      case 'Stable': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">{product.product}</h3>
            <p className="text-sm text-gray-500">{product.category}</p>
          </div>
          <Badge className={getVolatilityColor(product.volatility)}>
            {product.volatility}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Peak Season</p>
            <p className="font-semibold">{product.peak_season}</p>
            <p className="text-sm text-green-600">+{((product.peak_factor - 1) * 100).toFixed(0)}% sales</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Low Season</p>
            <p className="font-semibold">{product.low_season}</p>
            <p className="text-sm text-red-600">{((product.low_factor - 1) * 100).toFixed(0)}% sales</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">Key Festivals</p>
          <div className="flex flex-wrap gap-1">
            {product.festivals.map((festival, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {festival}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Badge className={getPatternColor(product.pattern)}>
            {product.pattern}
          </Badge>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SeasonalAnalysisPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2025');

  const loadSeasonalData = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to load seasonal data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSeasonalData();
  }, [selectedYear]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalAnnualSales = () => {
    return mockSeasonalData.reduce((sum, month) => sum + month.sales, 0);
  };

  const getHighestMonth = () => {
    return mockSeasonalData.reduce((max, month) => 
      month.sales > max.sales ? month : max
    );
  };

  const getLowestMonth = () => {
    return mockSeasonalData.reduce((min, month) => 
      month.sales < min.sales ? month : min
    );
  };

  const getSeasonalVariation = () => {
    const highest = getHighestMonth();
    const lowest = getLowestMonth();
    return ((highest.sales - lowest.sales) / lowest.sales * 100).toFixed(1);
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
          <h1 className="text-3xl font-bold tracking-tight">Seasonal Analysis</h1>
          <p className="text-muted-foreground">
            Understanding seasonal patterns and trends for {user?.company_name || 'your business'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            aria-label="Select year"
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
          <Button variant="outline" size="sm" onClick={loadSeasonalData}>
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
                <p className="text-sm font-medium text-muted-foreground">Annual Sales</p>
                <p className="text-2xl font-bold">{formatCurrency(getTotalAnnualSales())}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Total for {selectedYear}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Peak Month</p>
                <p className="text-2xl font-bold">{getHighestMonth().month}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{formatCurrency(getHighestMonth().sales)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Month</p>
                <p className="text-2xl font-bold">{getLowestMonth().month}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{formatCurrency(getLowestMonth().sales)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Variation</p>
                <p className="text-2xl font-bold">{getSeasonalVariation()}%</p>
              </div>
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Peak vs Low</p>
          </CardContent>
        </Card>
      </div>

      {/* Seasonal Breakdown */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {seasons.map((season, index) => {
          const IconComponent = season.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className={`h-6 w-6 ${season.color}`} />
                  <Badge variant={season.growth > 0 ? "default" : "destructive"}>
                    {season.growth > 0 ? '+' : ''}{season.growth}%
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg">{season.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{season.period}</p>
                <p className="text-xl font-bold">{formatCurrency(season.sales)}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Monthly Sales Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Sales Pattern</CardTitle>
          <CardDescription>Sales performance throughout the year with seasonal factors</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={mockSeasonalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} fontSize={12} />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'sales' ? formatCurrency(value) : value,
                  name === 'sales' ? 'Sales' : 'Festivals'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3}
                name="sales"
              />
              <Line 
                type="monotone" 
                dataKey="festivals" 
                stroke="#F59E0B" 
                strokeWidth={2}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
                name="festivals"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Festival Impact Analysis */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Festival Impact</CardTitle>
            <CardDescription>Sales boost during major festivals</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockFestivalImpact}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="festival" fontSize={12} />
                <YAxis tickFormatter={(value) => `${value}%`} fontSize={12} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value}%`,
                    name === 'growth' ? 'Growth' : 'Impact'
                  ]}
                />
                <Bar dataKey="growth" fill="#10B981" name="growth" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weather Correlation</CardTitle>
            <CardDescription>How external factors affect sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockWeatherCorrelation.map((factor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{factor.factor}</h4>
                    <p className="text-sm text-gray-500">{factor.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{factor.correlation > 0 ? '+' : ''}{factor.correlation}</p>
                    <Badge variant={factor.impact === 'Very High' ? 'destructive' : factor.impact === 'High' ? 'default' : 'secondary'}>
                      {factor.impact}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Seasonality */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Product Seasonality Patterns</h2>
            <p className="text-sm text-gray-500">Seasonal behavior of individual products</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockProductSeasonality.map((product, index) => (
            <ProductSeasonalityCard key={index} product={product} />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Seasonal Recommendations</CardTitle>
          <CardDescription>Strategic insights based on seasonal analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800">Prepare for Festival Season</h4>
                <p className="text-sm text-blue-700">
                  October shows 45% sales increase during Dashain. Stock up on Basmati Rice and Turmeric Powder.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <Sun className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800">Summer Strategy</h4>
                <p className="text-sm text-yellow-700">
                  Plan promotions for June-August period to combat seasonal sales drop of 12.8%.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-800">Autumn Opportunity</h4>
                <p className="text-sm text-green-700">
                  Leverage 18.5% autumn growth by focusing marketing on spices and festival essentials.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
