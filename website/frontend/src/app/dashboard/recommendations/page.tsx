'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Lightbulb,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Package,
  BarChart3,
  RefreshCw,
  Filter,
  Loader2,
  ArrowRight,
  Star,
  Zap,
} from 'lucide-react';

import { useAuthStore } from '@/store';

// Mock recommendations data
const mockRecommendations = [
  {
    id: 1,
    title: 'Increase Turmeric Powder Stock',
    description: 'AI predicts 35% demand increase in next 2 weeks due to wedding season. Current stock insufficient.',
    category: 'Inventory',
    priority: 'High',
    confidence: 94,
    potential_impact: 'High Revenue',
    estimated_revenue: 45000,
    action_required: 'Order 500kg within 3 days',
    deadline: '2025-09-08',
    status: 'pending',
    ai_insight: 'Historical data shows 40% sales spike during wedding season (Sep-Nov)',
    implementation_cost: 35000,
    roi_estimate: 128
  },
  {
    id: 2,
    title: 'Launch Monsoon Tea Bundle',
    description: 'Create combo pack of Black Tea + Ginger + Honey. Weather patterns suggest 25% increase in hot beverage demand.',
    category: 'Product Strategy',
    priority: 'Medium',
    confidence: 87,
    potential_impact: 'New Revenue Stream',
    estimated_revenue: 28000,
    action_required: 'Create bundle offer',
    deadline: '2025-09-12',
    status: 'pending',
    ai_insight: 'Similar bundles increased sales by 32% in comparable weather conditions',
    implementation_cost: 5000,
    roi_estimate: 560
  },
  {
    id: 3,
    title: 'Optimize Mustard Oil Pricing',
    description: 'Current price 8% below market average. Gradual 5% increase recommended based on demand elasticity analysis.',
    category: 'Pricing',
    priority: 'Medium',
    confidence: 91,
    potential_impact: 'Margin Improvement',
    estimated_revenue: 18000,
    action_required: 'Adjust pricing strategy',
    deadline: '2025-09-10',
    status: 'in_progress',
    ai_insight: 'Price elasticity analysis shows minimal demand impact with 5% increase',
    implementation_cost: 0,
    roi_estimate: 100
  },
  {
    id: 4,
    title: 'Festival Marketing Campaign',
    description: 'Launch targeted campaign for Dashain essentials. Focus on rice, spices, and oil combos.',
    category: 'Marketing',
    priority: 'High',
    confidence: 89,
    potential_impact: 'Market Share Growth',
    estimated_revenue: 75000,
    action_required: 'Prepare marketing materials',
    deadline: '2025-09-15',
    status: 'pending',
    ai_insight: 'Last year festival campaign generated 45% revenue increase',
    implementation_cost: 15000,
    roi_estimate: 500
  },
  {
    id: 5,
    title: 'Reduce Sugar Inventory',
    description: 'Sugar sales declining 15% monthly. Recommend 30% inventory reduction and focus on alternatives.',
    category: 'Inventory',
    priority: 'Low',
    confidence: 82,
    potential_impact: 'Cost Optimization',
    estimated_revenue: -5000,
    action_required: 'Clear excess stock',
    deadline: '2025-09-20',
    status: 'completed',
    ai_insight: 'Health consciousness trend reducing refined sugar demand',
    implementation_cost: 8000,
    roi_estimate: 62
  },
  {
    id: 6,
    title: 'Introduce Premium Rice Variants',
    description: 'Customer segments show demand for premium options. Launch organic/specialty rice varieties.',
    category: 'Product Strategy',
    priority: 'Medium',
    confidence: 78,
    potential_impact: 'Premium Segment Entry',
    estimated_revenue: 32000,
    action_required: 'Source premium suppliers',
    deadline: '2025-09-25',
    status: 'pending',
    ai_insight: '23% customers willing to pay 40% premium for organic options',
    implementation_cost: 20000,
    roi_estimate: 160
  }
];

const mockPerformanceMetrics = [
  { metric: 'Recommendations Implemented', value: 12, change: '+3', period: 'This month' },
  { metric: 'Total ROI Generated', value: '₹2.4L', change: '+28%', period: 'Last 30 days' },
  { metric: 'Average Confidence Score', value: '87%', change: '+2%', period: 'Current batch' },
  { metric: 'Success Rate', value: '94%', change: '+5%', period: 'Last quarter' }
];

const categoryIcons = {
  'Inventory': Package,
  'Pricing': DollarSign,
  'Marketing': Users,
  'Product Strategy': Target,
  'Operations': BarChart3
};

const priorityColors = {
  'High': 'bg-red-100 text-red-800 border-red-200',
  'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Low': 'bg-green-100 text-green-800 border-green-200'
};

const statusColors = {
  'pending': 'bg-gray-100 text-gray-800',
  'in_progress': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
  'rejected': 'bg-red-100 text-red-800'
};

interface RecommendationCardProps {
  recommendation: typeof mockRecommendations[0];
  onAction: (id: number, action: string) => void;
}

function RecommendationCard({ recommendation, onAction }: RecommendationCardProps) {
  const IconComponent = categoryIcons[recommendation.category as keyof typeof categoryIcons] || Lightbulb;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysUntilDeadline = () => {
    const deadline = new Date(recommendation.deadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilDeadline();

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 ${recommendation.priority === 'High' ? 'border-l-4 border-l-red-500' : recommendation.priority === 'Medium' ? 'border-l-4 border-l-yellow-500' : 'border-l-4 border-l-green-500'}`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <IconComponent className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{recommendation.title}</h3>
              <p className="text-sm text-gray-600">{recommendation.category}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={priorityColors[recommendation.priority as keyof typeof priorityColors]}>
              {recommendation.priority}
            </Badge>
            <Badge className={statusColors[recommendation.status as keyof typeof statusColors]}>
              {recommendation.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4">{recommendation.description}</p>

        {/* AI Insight */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
          <div className="flex items-start space-x-2">
            <Zap className="h-4 w-4 text-purple-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-purple-800">AI Insight</p>
              <p className="text-sm text-purple-700">{recommendation.ai_insight}</p>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">Confidence Score</p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-blue-600 h-2 rounded-full transition-all duration-300 w-${Math.round(recommendation.confidence / 10) * 10}`}
                  />
                </div>
                <span className="text-sm font-semibold">{recommendation.confidence}%</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Estimated Revenue</p>
              <p className="text-sm font-bold text-green-600">
                {recommendation.estimated_revenue > 0 ? '+' : ''}{formatCurrency(recommendation.estimated_revenue)}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">Implementation Cost</p>
              <p className="text-sm font-semibold">{formatCurrency(recommendation.implementation_cost)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Expected ROI</p>
              <p className="text-sm font-bold text-blue-600">{recommendation.roi_estimate}%</p>
            </div>
          </div>
        </div>

        {/* Action Required */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-gray-800 mb-1">Action Required:</p>
          <p className="text-sm text-gray-700">{recommendation.action_required}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>
              {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Due today' : `${Math.abs(daysLeft)} days overdue`}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {recommendation.status === 'pending' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onAction(recommendation.id, 'reject')}
                >
                  Dismiss
                </Button>
                <Button 
                  size="sm"
                  onClick={() => onAction(recommendation.id, 'implement')}
                >
                  Implement
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </>
            )}
            {recommendation.status === 'in_progress' && (
              <Button variant="outline" size="sm">
                View Progress
              </Button>
            )}
            {recommendation.status === 'completed' && (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RecommendationsPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState(mockRecommendations);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleAction = (id: number, action: string) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === id 
          ? { ...rec, status: action === 'implement' ? 'in_progress' : 'rejected' }
          : rec
      )
    );
  };

  const filteredRecommendations = recommendations.filter(rec => {
    const categoryMatch = filterCategory === 'all' || rec.category === filterCategory;
    const priorityMatch = filterPriority === 'all' || rec.priority === filterPriority;
    const statusMatch = filterStatus === 'all' || rec.status === filterStatus;
    return categoryMatch && priorityMatch && statusMatch;
  });

  const getUniqueCategories = () => {
    return Array.from(new Set(recommendations.map(rec => rec.category)));
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
          <h1 className="text-3xl font-bold tracking-tight">AI Recommendations</h1>
          <p className="text-muted-foreground">
            Smart insights and actionable suggestions for {user?.company_name || 'your business'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={loadRecommendations}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockPerformanceMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.metric}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
                <div className="text-right">
                  <Badge variant={metric.change.startsWith('+') ? 'default' : 'secondary'}>
                    {metric.change}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{metric.period}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <Star className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Button variant="outline" className="justify-start">
              <Target className="h-4 w-4 mr-2" />
              Implement All High Priority
            </Button>
            <Button variant="outline" className="justify-start">
              <DollarSign className="h-4 w-4 mr-2" />
              Review Pricing Recommendations
            </Button>
            <Button variant="outline" className="justify-start">
              <Package className="h-4 w-4 mr-2" />
              Update Inventory Levels
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {getUniqueCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
              aria-label="Filter by priority"
            >
              <option value="all">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <div className="flex-1" />
            
            <Badge variant="secondary">
              {filteredRecommendations.length} recommendations
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.map((recommendation) => (
          <RecommendationCard 
            key={recommendation.id} 
            recommendation={recommendation}
            onAction={handleAction}
          />
        ))}
      </div>

      {filteredRecommendations.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No recommendations found</h3>
            <p className="text-gray-500">Try adjusting your filters or check back later for new insights</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
