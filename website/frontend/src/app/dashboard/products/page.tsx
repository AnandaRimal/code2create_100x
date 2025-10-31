'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Package,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Star,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { useAuthStore } from '@/store';
import type { ProductAnalytics } from '@/types/api';

// Mock product data
const mockProductData: ProductAnalytics[] = [
  { 
    product_id: 1, 
    product_name: 'Basmati Rice Premium', 
    category: 'Grains & Cereals', 
    total_quantity: 450, 
    total_revenue: 135000, 
    transaction_count: 89, 
    avg_price: 300, 
    last_sale_date: '2025-09-05' 
  },
  { 
    product_id: 2, 
    product_name: 'Mustard Oil', 
    category: 'Oils & Fats', 
    total_quantity: 180, 
    total_revenue: 108000, 
    transaction_count: 67, 
    avg_price: 600, 
    last_sale_date: '2025-09-05' 
  },
  { 
    product_id: 3, 
    product_name: 'Red Lentils (Masoor)', 
    category: 'Pulses', 
    total_quantity: 220, 
    total_revenue: 88000, 
    transaction_count: 54, 
    avg_price: 400, 
    last_sale_date: '2025-09-04' 
  },
  { 
    product_id: 4, 
    product_name: 'Turmeric Powder', 
    category: 'Spices', 
    total_quantity: 85, 
    total_revenue: 68000, 
    transaction_count: 42, 
    avg_price: 800, 
    last_sale_date: '2025-09-05' 
  },
  { 
    product_id: 5, 
    product_name: 'Black Tea Leaves', 
    category: 'Beverages', 
    total_quantity: 95, 
    total_revenue: 57000, 
    transaction_count: 38, 
    avg_price: 600, 
    last_sale_date: '2025-09-03' 
  },
  { 
    product_id: 6, 
    product_name: 'Chickpeas (Chana)', 
    category: 'Pulses', 
    total_quantity: 130, 
    total_revenue: 52000, 
    transaction_count: 34, 
    avg_price: 400, 
    last_sale_date: '2025-09-04' 
  },
  { 
    product_id: 7, 
    product_name: 'Cumin Seeds', 
    category: 'Spices', 
    total_quantity: 45, 
    total_revenue: 45000, 
    transaction_count: 28, 
    avg_price: 1000, 
    last_sale_date: '2025-09-02' 
  },
  { 
    product_id: 8, 
    product_name: 'Refined Sugar', 
    category: 'Sweeteners', 
    total_quantity: 280, 
    total_revenue: 42000, 
    transaction_count: 56, 
    avg_price: 150, 
    last_sale_date: '2025-09-05' 
  },
];

const mockCategoryData = [
  { name: 'Grains & Cereals', products: 12, revenue: 285000, growth: 15.2 },
  { name: 'Oils & Fats', products: 8, revenue: 198000, growth: 8.7 },
  { name: 'Spices', products: 15, revenue: 165000, growth: 22.3 },
  { name: 'Pulses', products: 10, revenue: 142000, growth: 12.1 },
  { name: 'Beverages', products: 6, revenue: 89000, growth: 5.4 },
  { name: 'Sweeteners', products: 4, revenue: 67000, growth: -2.1 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface ProductCardProps {
  product: ProductAnalytics;
  rank: number;
}

function ProductCard({ product, rank }: ProductCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 3) return 'bg-yellow-100 text-yellow-800';
    if (rank <= 5) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{product.product_name}</h3>
              <p className="text-sm text-gray-500">{product.category}</p>
            </div>
          </div>
          <Badge className={getRankBadgeColor(rank)}>
            #{rank}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Revenue</p>
            <p className="text-xl font-bold">{formatCurrency(product.total_revenue)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Quantity Sold</p>
            <p className="text-xl font-bold">{product.total_quantity}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Avg. Price</p>
            <p className="text-lg font-semibold">{formatCurrency(product.avg_price)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Sales Count</p>
            <p className="text-lg font-semibold">{product.transaction_count}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            Last sale: {getDaysAgo(product.last_sale_date)} days ago
          </div>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProductInsightsPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'revenue' | 'quantity' | 'sales'>('revenue');
  const [filteredProducts, setFilteredProducts] = useState<ProductAnalytics[]>(mockProductData);

  const loadProductData = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Apply filters and sorting
      let filtered = mockProductData.filter(product => {
        const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });

      // Sort products
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'revenue':
            return b.total_revenue - a.total_revenue;
          case 'quantity':
            return b.total_quantity - a.total_quantity;
          case 'sales':
            return b.transaction_count - a.transaction_count;
          default:
            return 0;
        }
      });

      setFilteredProducts(filtered);
    } catch (error) {
      console.error('Failed to load product data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProductData();
  }, [searchTerm, selectedCategory, sortBy]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalProducts = () => mockProductData.length;
  const getTotalRevenue = () => mockProductData.reduce((sum, p) => sum + p.total_revenue, 0);
  const getAvgPrice = () => {
    const total = mockProductData.reduce((sum, p) => sum + p.avg_price, 0);
    return total / mockProductData.length;
  };
  const getTopCategory = () => {
    const categories = mockCategoryData.sort((a, b) => b.revenue - a.revenue);
    return categories[0];
  };

  const chartData = mockCategoryData.map(cat => ({
    category: cat.name.split(' ')[0], // Shorten names for chart
    revenue: cat.revenue,
    products: cat.products,
    growth: cat.growth
  }));

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
          <h1 className="text-3xl font-bold tracking-tight">Product Insights</h1>
          <p className="text-muted-foreground">
            Detailed analysis of product performance for {user?.company_name || 'your business'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={loadProductData}>
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
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{getTotalProducts()}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Active in inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(getTotalRevenue())}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">From all products</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Price</p>
                <p className="text-2xl font-bold">{formatCurrency(getAvgPrice())}</p>
              </div>
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Across all products</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Category</p>
                <p className="text-lg font-bold">{getTopCategory().name.split(' ')[0]}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{formatCurrency(getTopCategory().revenue)} revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance Chart */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
            <CardDescription>Performance comparison across product categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" fontSize={12} />
                <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} fontSize={12} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? formatCurrency(value) : value,
                    name === 'revenue' ? 'Revenue' : 'Products'
                  ]}
                />
                <Bar dataKey="revenue" fill="#3B82F6" name="revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Product count by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="products"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                aria-label="Filter by category"
              >
                <option value="all">All Categories</option>
                {Array.from(new Set(mockProductData.map(p => p.category))).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'revenue' | 'quantity' | 'sales')}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                aria-label="Sort products by"
              >
                <option value="revenue">Revenue</option>
                <option value="quantity">Quantity</option>
                <option value="sales">Sales Count</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product, index) => (
          <ProductCard 
            key={product.product_id} 
            product={product} 
            rank={index + 1}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
