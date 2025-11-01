'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  Package,
  DollarSign,
  Eye,
  Share,
  Filter,
  Search,
  RefreshCw,
  Loader2,
  Clock,
  CheckCircle,
  Plus,
  Settings,
  FileSpreadsheet,
  FileImage,
  FileBarChart,
  Mail,
  AlertCircle,
  Calendar as CalendarIcon,
} from 'lucide-react';

import { useAuthStore } from '@/store';
import { AnalyticsService } from '@/services/analytics.service';
import type { RevenueData, ProductAnalytics, DashboardStats } from '@/types/api';

// Enhanced report generation types
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'sales' | 'inventory' | 'customer' | 'financial' | 'analytics' | 'custom';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom';
  estimated_time: string;
  formats: ('pdf' | 'excel' | 'csv' | 'json' | 'png')[];
  includes: string[];
  premium: boolean;
}

interface ReportGenerationRequest {
  template_id: string;
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'png';
  date_range: {
    start_date: string;
    end_date: string;
  };
  filters?: {
    categories?: string[];
    products?: string[];
    customers?: string[];
  };
  options?: {
    include_charts: boolean;
    include_summary: boolean;
    include_recommendations: boolean;
    email_recipients?: string[];
    schedule?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      time: string;
    };
  };
}

// Enhanced report templates with real functionality
const enhancedReportTemplates: ReportTemplate[] = [
  {
    id: 'daily-sales',
    name: 'Daily Sales Summary',
    description: 'Comprehensive daily sales performance with product breakdown',
    category: 'sales',
    frequency: 'daily',
    estimated_time: '2-3 minutes',
    formats: ['pdf', 'excel', 'csv'],
    includes: ['Sales totals', 'Top products', 'Transaction count', 'Revenue trends', 'Customer metrics'],
    premium: false
  },
  {
    id: 'weekly-performance',
    name: 'Weekly Performance Dashboard',
    description: 'Complete weekly business metrics and trend analysis',
    category: 'analytics',
    frequency: 'weekly',
    estimated_time: '5-7 minutes',
    formats: ['pdf', 'excel', 'png'],
    includes: ['Revenue trends', 'Inventory status', 'Customer metrics', 'Growth analysis', 'Charts & graphs'],
    premium: false
  },
  {
    id: 'monthly-detailed',
    name: 'Monthly Business Review',
    description: 'In-depth monthly analysis with AI insights and forecasts',
    category: 'analytics',
    frequency: 'monthly',
    estimated_time: '10-15 minutes',
    formats: ['pdf', 'excel', 'json'],
    includes: ['Full analytics', 'AI forecasts', 'Recommendations', 'Competitive analysis', 'Strategic insights'],
    premium: false
  },
  {
    id: 'inventory-analysis',
    name: 'Inventory Management Report',
    description: 'Stock levels, turnover rates, and reorder recommendations',
    category: 'inventory',
    frequency: 'weekly',
    estimated_time: '5 minutes',
    formats: ['excel', 'csv', 'pdf'],
    includes: ['Stock levels', 'Turnover analysis', 'Reorder points', 'Dead stock alerts', 'ABC analysis'],
    premium: false
  },
  {
    id: 'customer-insights',
    name: 'Customer Analytics Report',
    description: 'Customer behavior analysis, segmentation, and retention metrics',
    category: 'customer',
    frequency: 'monthly',
    estimated_time: '8-10 minutes',
    formats: ['pdf', 'excel', 'png'],
    includes: ['Customer segments', 'Retention analysis', 'Purchase patterns', 'LTV calculations', 'Churn analysis'],
    premium: false
  },
  {
    id: 'financial-summary',
    name: 'Financial Performance Report',
    description: 'Revenue, costs, margins, and profitability analysis with forecasts',
    category: 'financial',
    frequency: 'monthly',
    estimated_time: '12-15 minutes',
    formats: ['pdf', 'excel', 'json'],
    includes: ['P&L analysis', 'Cash flow', 'Margin analysis', 'Budget vs actual', 'Financial forecasts'],
    premium: false
  },
  {
    id: 'seasonal-trends',
    name: 'Seasonal Trends Analysis',
    description: 'Seasonal patterns, festival impact, and trend predictions',
    category: 'analytics',
    frequency: 'quarterly',
    estimated_time: '15-20 minutes',
    formats: ['pdf', 'png', 'json'],
    includes: ['Seasonal patterns', 'Festival impact', 'Trend predictions', 'Year-over-year comparison', 'Market insights'],
    premium: false
  },
  {
    id: 'custom-analytics',
    name: 'Custom Analytics Report',
    description: 'Build your own report with selected metrics and timeframes',
    category: 'custom',
    frequency: 'custom',
    estimated_time: '5-30 minutes',
    formats: ['pdf', 'excel', 'csv', 'json', 'png'],
    includes: ['Custom metrics', 'Flexible date ranges', 'Chart customization', 'Data export', 'API integration'],
    premium: false
  }
];

// Mock reports data with enhanced structure
const mockReports = [
  {
    id: 1,
    title: 'Monthly Sales Report',
    description: 'Comprehensive sales analysis with product breakdowns and trends',
    type: 'Sales',
    period: 'August 2025',
    status: 'completed',
    generated_date: '2025-09-01',
    file_size: '2.4 MB',
    format: 'PDF',
    download_url: '/api/reports/download/1.pdf',
    views: 23,
    shared_with: 3,
    key_metrics: {
      total_sales: 185000,
      growth: 12.5,
      top_product: 'Basmati Rice Premium',
      transactions: 234
    }
  },
  {
    id: 2,
    title: 'Inventory Analysis Report',
    description: 'Stock levels, turnover rates, and reorder recommendations',
    type: 'Inventory',
    period: 'Q3 2025',
    status: 'completed',
    generated_date: '2025-08-28',
    file_size: '1.8 MB',
    format: 'Excel',
    download_url: '/api/reports/download/2.xlsx',
    views: 15,
    shared_with: 2,
    key_metrics: {
      total_products: 45,
      low_stock_items: 3,
      turnover_rate: 2.4,
      stock_value: 450000
    }
  },
  {
    id: 3,
    title: 'Customer Insights Report',
    description: 'Customer behavior analysis and segmentation study',
    type: 'Customer',
    period: 'July 2025',
    status: 'completed',
    generated_date: '2025-08-25',
    file_size: '3.1 MB',
    format: 'PDF',
    download_url: '/api/reports/download/3.pdf',
    views: 31,
    shared_with: 5,
    key_metrics: {
      total_customers: 156,
      repeat_rate: 68,
      avg_order_value: 1250,
      satisfaction: 4.2
    }
  },
  {
    id: 4,
    title: 'Financial Performance Report',
    description: 'Revenue, costs, margins, and profitability analysis',
    type: 'Financial',
    period: 'H1 2025',
    status: 'generating',
    generated_date: null,
    file_size: null,
    format: 'PDF',
    download_url: null,
    views: 0,
    shared_with: 0,
    key_metrics: null,
    progress: 65
  }
];

// Report service for API interactions
class ReportService {
  static async generateReport(request: ReportGenerationRequest): Promise<{ report_id: string; status: string; estimated_time: number }> {
    // Simulate API call to generate report
    console.log('Generating report with request:', request);
    
    // Simulate different processing times based on report type
    const estimatedTimes = {
      'daily-sales': 2,
      'weekly-performance': 5,
      'monthly-detailed': 15,
      'inventory-analysis': 5,
      'customer-insights': 10,
      'financial-summary': 15,
      'seasonal-trends': 20,
      'custom-analytics': 10
    };
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          report_id: `rpt_${Date.now()}`,
          status: 'processing',
          estimated_time: estimatedTimes[request.template_id as keyof typeof estimatedTimes] || 5
        });
      }, 1000);
    });
  }

  static async downloadReport(reportId: number, format: string): Promise<void> {
    // Simulate file download
    console.log(`Downloading report ${reportId} in ${format} format`);
    
    // Create a mock download
    const element = document.createElement('a');
    element.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(`Mock ${format.toUpperCase()} Report Data for Report ID: ${reportId}`);
    element.download = `report_${reportId}.${format.toLowerCase()}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  static async getReportStatus(reportId: string): Promise<{ status: string; progress?: number; download_url?: string }> {
    // Simulate checking report generation status
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'completed',
          progress: 100,
          download_url: `/api/reports/download/${reportId}.pdf`
        });
      }, 500);
    });
  }

  static async shareReport(reportId: number, emails: string[]): Promise<void> {
    console.log(`Sharing report ${reportId} with:`, emails);
    // Simulate API call to share report
    return Promise.resolve();
  }

  static async scheduleReport(request: ReportGenerationRequest & { schedule: { frequency: string; time: string } }): Promise<void> {
    console.log('Scheduling report:', request);
    // Simulate API call to schedule report
    return Promise.resolve();
  }

  // Get real analytics data for report generation
  static async getAnalyticsData(dateRange: { start_date: string; end_date: string }) {
    try {
      const [revenueData, productsData, dashboardStats] = await Promise.all([
        AnalyticsService.getRevenue({ 
          date_filter: { 
            start_date: dateRange.start_date, 
            end_date: dateRange.end_date, 
            period: 'daily' as const 
          } 
        }),
        AnalyticsService.getProducts({ 
          date_filter: { 
            start_date: dateRange.start_date, 
            end_date: dateRange.end_date 
          } 
        }),
        AnalyticsService.getDashboardStats()
      ]);

      return {
        revenue: revenueData.data || [],
        products: productsData.data || [],
        stats: dashboardStats
      };
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      return null;
    }
  }

  // Generate reports in different formats
  static async exportToFormat(data: any, format: 'pdf' | 'excel' | 'csv' | 'json', reportType: string): Promise<void> {
    switch (format) {
      case 'json':
        this.downloadJSON(data, `${reportType}_report`);
        break;
      case 'csv':
        this.downloadCSV(data, `${reportType}_report`);
        break;
      case 'excel':
        this.downloadExcel(data, `${reportType}_report`);
        break;
      case 'pdf':
        this.downloadPDF(data, `${reportType}_report`);
        break;
      default:
        console.error('Unsupported format:', format);
    }
  }

  private static downloadJSON(data: any, filename: string): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const element = document.createElement('a');
    element.href = url;
    element.download = `${filename}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  }

  private static downloadCSV(data: any, filename: string): void {
    let csvContent = '';
    
    if (Array.isArray(data.revenue) && data.revenue.length > 0) {
      // Convert revenue data to CSV
      const headers = Object.keys(data.revenue[0]);
      csvContent += headers.join(',') + '\n';
      
      data.revenue.forEach((row: any) => {
        const values = headers.map(header => row[header]);
        csvContent += values.join(',') + '\n';
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const element = document.createElement('a');
    element.href = url;
    element.download = `${filename}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  }

  private static downloadExcel(data: any, filename: string): void {
    // For now, download as CSV with .xlsx extension
    // In a real app, you'd use a library like SheetJS
    this.downloadCSV(data, filename.replace('.xlsx', ''));
    
    // Show message about Excel format
    alert('Excel format downloaded as CSV. For true Excel format, integrate SheetJS library.');
  }

  private static downloadPDF(data: any, filename: string): void {
    // For now, create a simple HTML report
    // In a real app, you'd use a library like jsPDF or Puppeteer
    const htmlContent = this.generateHTMLReport(data);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const element = document.createElement('a');
    element.href = url;
    element.download = `${filename}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
    
    alert('PDF format downloaded as HTML. For true PDF format, integrate jsPDF or Puppeteer.');
  }

  private static generateHTMLReport(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Analytics Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
          .metric { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Business Analytics Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        ${data.stats ? `
        <div class="section">
          <h2>Key Metrics</h2>
          <div class="metrics">
            <div class="metric">
              <h3>Total Revenue</h3>
              <p>NPR ${data.stats.total_revenue?.toLocaleString() || 0}</p>
            </div>
            <div class="metric">
              <h3>Total Products</h3>
              <p>${data.stats.total_products || 0}</p>
            </div>
            <div class="metric">
              <h3>Total Transactions</h3>
              <p>${data.stats.total_transactions || 0}</p>
            </div>
            <div class="metric">
              <h3>Average Transaction</h3>
              <p>NPR ${data.stats.avg_transaction_value?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
        ` : ''}
        
        ${data.revenue && data.revenue.length > 0 ? `
        <div class="section">
          <h2>Revenue Data</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Revenue</th>
                <th>Transactions</th>
                <th>Avg Transaction Value</th>
              </tr>
            </thead>
            <tbody>
              ${data.revenue.map((item: any) => `
                <tr>
                  <td>${item.date}</td>
                  <td>NPR ${item.revenue?.toLocaleString() || 0}</td>
                  <td>${item.transactions_count || 0}</td>
                  <td>NPR ${item.avg_transaction_value?.toLocaleString() || 0}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}
        
        ${data.products && data.products.length > 0 ? `
        <div class="section">
          <h2>Top Products</h2>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Total Revenue</th>
                <th>Units Sold</th>
              </tr>
            </thead>
            <tbody>
              ${data.products.slice(0, 10).map((item: any) => `
                <tr>
                  <td>${item.product_name || 'N/A'}</td>
                  <td>${item.product_type || 'N/A'}</td>
                  <td>NPR ${item.total_revenue?.toLocaleString() || 0}</td>
                  <td>${item.units_sold || 0}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}
      </body>
      </html>
    `;
  }
}

const typeColors = {
  'Sales': 'bg-blue-100 text-blue-800',
  'Inventory': 'bg-green-100 text-green-800',
  'Customer': 'bg-purple-100 text-purple-800',
  'Financial': 'bg-yellow-100 text-yellow-800',
  'Analytics': 'bg-pink-100 text-pink-800',
  'Market': 'bg-indigo-100 text-indigo-800'
};

const statusColors = {
  'completed': 'bg-green-100 text-green-800',
  'generating': 'bg-yellow-100 text-yellow-800',
  'scheduled': 'bg-gray-100 text-gray-800',
  'failed': 'bg-red-100 text-red-800'
};

const typeIcons = {
  'Sales': TrendingUp,
  'Inventory': Package,
  'Customer': Users,
  'Financial': DollarSign,
  'Analytics': BarChart3,
  'Market': PieChart
};

interface ReportCardProps {
  report: typeof mockReports[0];
  onAction: (id: number, action: string) => void;
}

function ReportCard({ report, onAction }: ReportCardProps) {
  const IconComponent = typeIcons[report.type as keyof typeof typeIcons] || FileText;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderKeyMetrics = () => {
    if (!report.key_metrics) return null;

    const metrics = report.key_metrics;
    
    switch (report.type) {
      case 'Sales':
        return (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Revenue:</span>
              <span className="font-semibold ml-1">{formatCurrency(metrics.total_sales || 0)}</span>
            </div>
            <div>
              <span className="text-gray-500">Growth:</span>
              <span className="font-semibold ml-1 text-green-600">+{metrics.growth}%</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Top Product:</span>
              <span className="font-semibold ml-1">{metrics.top_product}</span>
            </div>
          </div>
        );
      case 'Inventory':
        return (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Products:</span>
              <span className="font-semibold ml-1">{metrics.total_products}</span>
            </div>
            <div>
              <span className="text-gray-500">Low Stock:</span>
              <span className="font-semibold ml-1 text-red-600">{metrics.low_stock_items}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Stock Value:</span>
              <span className="font-semibold ml-1">{formatCurrency(metrics.stock_value || 0)}</span>
            </div>
          </div>
        );
      case 'Customer':
        return (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Customers:</span>
              <span className="font-semibold ml-1">{metrics.total_customers}</span>
            </div>
            <div>
              <span className="text-gray-500">Repeat Rate:</span>
              <span className="font-semibold ml-1">{metrics.repeat_rate}%</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Avg Order:</span>
              <span className="font-semibold ml-1">{formatCurrency(metrics.avg_order_value || 0)}</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <IconComponent className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{report.title}</h3>
              <p className="text-sm text-gray-500">{report.period}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={typeColors[report.type as keyof typeof typeColors]}>
              {report.type}
            </Badge>
            <Badge className={statusColors[report.status as keyof typeof statusColors]}>
              {report.status}
            </Badge>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4">{report.description}</p>

        {/* Key Metrics */}
        {report.key_metrics && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Key Metrics</h4>
            {renderKeyMetrics()}
          </div>
        )}

        {/* File Details */}
        {report.status === 'completed' && (
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-4">
              <span>{report.format}</span>
              <span>{report.file_size}</span>
              <span>Generated {formatDate(report.generated_date!)}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{report.views}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Share className="h-4 w-4" />
                <span>{report.shared_with}</span>
              </div>
            </div>
          </div>
        )}

        {/* Status-specific content */}
        {report.status === 'generating' && (
          <div className="flex items-center space-x-2 text-sm text-yellow-600 mb-4">
            <Clock className="h-4 w-4 animate-spin" />
            <span>Generating report... This may take a few minutes</span>
          </div>
        )}

        {report.status === 'scheduled' && (
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Calendar className="h-4 w-4" />
            <span>Scheduled for next generation cycle</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div />
          <div className="flex items-center space-x-2">
            {report.status === 'completed' && (
              <>
                <Button variant="outline" size="sm" onClick={() => onAction(report.id, 'share')}>
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button size="sm" onClick={() => onAction(report.id, 'download')}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </>
            )}
            {report.status === 'scheduled' && (
              <Button variant="outline" size="sm" onClick={() => onAction(report.id, 'generate_now')}>
                Generate Now
              </Button>
            )}
            {report.status === 'generating' && (
              <Button variant="outline" size="sm" disabled>
                <Clock className="h-4 w-4 mr-2" />
                Generating...
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState(mockReports);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [generatingReports, setGeneratingReports] = useState<Set<string>>(new Set());
  
  // Report generation form state
  const [reportForm, setReportForm] = useState({
    format: 'pdf' as 'pdf' | 'excel' | 'csv' | 'json' | 'png',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    includeCharts: true,
    includeSummary: true,
    includeRecommendations: false,
    emailRecipients: '',
    scheduleFrequency: 'none' as 'none' | 'daily' | 'weekly' | 'monthly',
    scheduleTime: '09:00'
  });

  const loadReports = async () => {
    setIsLoading(true);
    try {
      // In a real app, fetch from API
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleGenerateReport = async (template: ReportTemplate) => {
    if (!template) return;

    const reportId = `${template.id}_${Date.now()}`;
    setGeneratingReports(prev => new Set([...prev, reportId]));

    try {
      // Get real analytics data
      const analyticsData = await ReportService.getAnalyticsData({
        start_date: reportForm.startDate,
        end_date: reportForm.endDate
      });

      if (analyticsData) {
        // Generate report with real data
        await ReportService.exportToFormat(analyticsData, reportForm.format, template.id);
        
        // Add to reports list
        const newReport = {
          id: Date.now(),
          title: `${template.name} - ${new Date().toLocaleDateString()}`,
          description: template.description,
          type: template.category.charAt(0).toUpperCase() + template.category.slice(1),
          period: `${reportForm.startDate} to ${reportForm.endDate}`,
          status: 'completed' as const,
          generated_date: new Date().toISOString().split('T')[0],
          file_size: '1.2 MB',
          format: reportForm.format.toUpperCase(),
          download_url: '#',
          views: 0,
          shared_with: 0,
          key_metrics: analyticsData.stats
        };

        setReports(prev => [newReport, ...prev]);
        setShowGenerateDialog(false);
        
        // Send email if recipients specified
        if (reportForm.emailRecipients.trim()) {
          const emails = reportForm.emailRecipients.split(',').map(email => email.trim());
          await ReportService.shareReport(newReport.id, emails);
        }

        // Schedule if frequency specified
        if (reportForm.scheduleFrequency !== 'none') {
          await ReportService.scheduleReport({
            template_id: template.id,
            format: reportForm.format,
            date_range: {
              start_date: reportForm.startDate,
              end_date: reportForm.endDate
            },
            schedule: {
              frequency: reportForm.scheduleFrequency,
              time: reportForm.scheduleTime
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGeneratingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  const handleQuickGenerate = async (template: ReportTemplate) => {
    // Set default form values
    setReportForm(prev => ({
      ...prev,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      endDate: new Date().toISOString().split('T')[0],
      format: template.formats[0] as any
    }));
    
    setSelectedTemplate(template);
    await handleGenerateReport(template);
  };

  const handleAction = async (id: number, action: string) => {
    const report = reports.find(r => r.id === id);
    if (!report) return;

    switch (action) {
      case 'download':
        if (report.download_url) {
          await ReportService.downloadReport(id, report.format.toLowerCase());
        }
        break;
      case 'share':
        const emails = prompt('Enter email addresses (comma-separated):');
        if (emails) {
          const emailList = emails.split(',').map(email => email.trim());
          await ReportService.shareReport(id, emailList);
          setReports(prev => 
            prev.map(r => 
              r.id === id 
                ? { ...r, shared_with: r.shared_with + emailList.length }
                : r
            )
          );
        }
        break;
      case 'generate_now':
        setReports(prev => 
          prev.map(report => 
            report.id === id 
              ? { ...report, status: 'generating' }
              : report
          )
        );
        setTimeout(() => {
          setReports(prev => 
            prev.map(report => 
              report.id === id 
                ? { 
                    ...report, 
                    status: 'completed' as const,
                    generated_date: new Date().toISOString().split('T')[0],
                    file_size: '2.1 MB',
                    download_url: `/api/reports/download/${id}.pdf`
                  }
                : report
            )
          );
        }, 3000);
        break;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getUniqueTypes = () => {
    return Array.from(new Set(reports.map(report => report.type)));
  };

  const formatIcons = {
    pdf: FileText,
    excel: FileSpreadsheet,
    csv: FileBarChart,
    json: FileText,
    png: FileImage
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
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate comprehensive business reports in multiple formats for {user?.company_name || 'your business'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={loadReports}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            size="sm"
            onClick={() => {
              setSelectedTemplate(enhancedReportTemplates.find(t => t.id === 'custom-analytics') || null);
              setShowGenerateDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Custom Report
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={async () => {
              // Quick export all data
              const analyticsData = await ReportService.getAnalyticsData({
                start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end_date: new Date().toISOString().split('T')[0]
              });
              if (analyticsData) {
                await ReportService.exportToFormat(analyticsData, 'json', 'complete_analytics');
              }
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Quick Export
          </Button>
        </div>
      </div>

      {/* Enhanced Quick Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Report Templates</span>
          </CardTitle>
          <CardDescription>Generate comprehensive reports with real analytics data in multiple formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {enhancedReportTemplates.map((template) => {
              const IconComponent = typeIcons[template.category as keyof typeof typeIcons] || FileText;
              const isGenerating = Array.from(generatingReports).some(id => id.includes(template.id));
              
              return (
                <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex space-x-1">
                      {template.formats.map(format => {
                        const FormatIcon = formatIcons[format];
                        return (
                          <div key={format} title={format.toUpperCase()}>
                            <FormatIcon className="h-3 w-3 text-gray-400" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-sm mb-2">{template.name}</h4>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium capitalize">{template.category}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Est. Time:</span>
                      <span className="font-medium">{template.estimated_time}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Formats:</span>
                      <span className="font-medium">{template.formats.length} formats</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Includes:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.includes.slice(0, 3).map((item, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs px-1 py-0">
                          {item}
                        </Badge>
                      ))}
                      {template.includes.length > 3 && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          +{template.includes.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1" 
                      onClick={() => handleQuickGenerate(template)}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="h-3 w-3 mr-1" />
                          Quick Generate
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowGenerateDialog(true);
                      }}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom Report Generation Dialog */}
      {showGenerateDialog && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Generate {selectedTemplate.name}</h3>
              <Button variant="outline" size="sm" onClick={() => setShowGenerateDialog(false)}>×</Button>
            </div>

            <div className="space-y-4">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Export Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {selectedTemplate.formats.map(format => {
                    const FormatIcon = formatIcons[format];
                    return (
                      <button
                        key={format}
                        type="button"
                        onClick={() => setReportForm(prev => ({ ...prev, format: format as any }))}
                        className={`p-2 border rounded-lg flex flex-col items-center space-y-1 ${
                          reportForm.format === format 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <FormatIcon className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase">{format}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <Input
                    type="date"
                    value={reportForm.startDate}
                    onChange={(e) => setReportForm(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <Input
                    type="date"
                    value={reportForm.endDate}
                    onChange={(e) => setReportForm(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium mb-2">Report Options</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Include Charts</span>
                    <input
                      type="checkbox"
                      checked={reportForm.includeCharts}
                      onChange={(e) => setReportForm(prev => ({ ...prev, includeCharts: e.target.checked }))}
                      className="rounded"
                      aria-label="Include charts in report"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Include Executive Summary</span>
                    <input
                      type="checkbox"
                      checked={reportForm.includeSummary}
                      onChange={(e) => setReportForm(prev => ({ ...prev, includeSummary: e.target.checked }))}
                      className="rounded"
                      aria-label="Include executive summary in report"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI Recommendations</span>
                    <input
                      type="checkbox"
                      checked={reportForm.includeRecommendations}
                      onChange={(e) => setReportForm(prev => ({ ...prev, includeRecommendations: e.target.checked }))}
                      className="rounded"
                      aria-label="Include AI recommendations in report"
                    />
                  </div>
                </div>
              </div>

              {/* Email Recipients */}
              <div>
                <label className="block text-sm font-medium mb-1">Email Recipients (Optional)</label>
                <Input
                  placeholder="email1@example.com, email2@example.com"
                  value={reportForm.emailRecipients}
                  onChange={(e) => setReportForm(prev => ({ ...prev, emailRecipients: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">Comma-separated email addresses</p>
              </div>

              {/* Scheduling */}
              <div>
                <label className="block text-sm font-medium mb-2">Schedule (Optional)</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={reportForm.scheduleFrequency}
                    onChange={(e) => setReportForm(prev => ({ ...prev, scheduleFrequency: e.target.value as any }))}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    aria-label="Schedule frequency"
                  >
                    <option value="none">One-time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  {reportForm.scheduleFrequency !== 'none' && (
                    <Input
                      type="time"
                      value={reportForm.scheduleTime}
                      onChange={(e) => setReportForm(prev => ({ ...prev, scheduleTime: e.target.value }))}
                    />
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowGenerateDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => handleGenerateReport(selectedTemplate)}
                  disabled={Array.from(generatingReports).some(id => id.includes(selectedTemplate.id))}
                >
                  {Array.from(generatingReports).some(id => id.includes(selectedTemplate.id)) ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                aria-label="Filter by type"
              >
                <option value="all">All Types</option>
                {getUniqueTypes().map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="generating">Generating</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                {filteredReports.length} reports
              </Badge>
              
              <div className="text-sm text-gray-500">
                Total Downloads: {reports.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.views, 0)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Reports</p>
                <p className="text-2xl font-bold">{reports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold">{reports.filter(r => r.status === 'completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">In Progress</p>
                <p className="text-2xl font-bold">{reports.filter(r => r.status === 'generating').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Total Downloads</p>
                <p className="text-2xl font-bold">{reports.reduce((sum, r) => sum + r.views, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredReports.map((report) => (
          <ReportCard 
            key={report.id} 
            report={report}
            onAction={handleAction}
          />
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
