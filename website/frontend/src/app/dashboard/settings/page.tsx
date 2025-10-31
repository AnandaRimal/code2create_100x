'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Switch } from '@/components/ui/switch';

// Simple Switch component
interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function Switch({ checked, onCheckedChange }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked ? 'true' : 'false'}
      aria-label="Toggle switch"
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  CreditCard,
  Globe,
  Smartphone,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  Loader2,
  Check,
  X,
} from 'lucide-react';

import { useAuthStore } from '@/store';

// Mock settings data
const mockUserSettings = {
  personal: {
    name: 'Ramesh Sharma',
    email: 'ramesh@example.com',
    company_name: 'Sharma General Store',
    phone: '+977-9841234567',
    address: 'Kathmandu, Nepal',
    language: 'en',
    timezone: 'Asia/Kathmandu'
  },
  notifications: {
    email_alerts: true,
    sms_alerts: false,
    push_notifications: true,
    low_stock_alerts: true,
    sales_reports: true,
    marketing_emails: false,
    system_updates: true
  },
  privacy: {
    profile_visibility: 'private',
    data_sharing: false,
    analytics_tracking: true,
    two_factor_auth: false
  },
  business: {
    currency: 'NPR',
    tax_rate: 13,
    business_hours_start: '09:00',
    business_hours_end: '20:00',
    auto_backup: true,
    inventory_alerts: true
  }
};

const languageOptions = [
  { code: 'en', name: 'English' },
  { code: 'ne', name: 'नेपाली' },
  { code: 'hi', name: 'हिन्दी' },
];

const timezoneOptions = [
  { value: 'Asia/Kathmandu', label: 'Kathmandu (GMT+5:45)' },
  { value: 'Asia/Kolkata', label: 'Delhi (GMT+5:30)' },
  { value: 'UTC', label: 'UTC (GMT+0)' },
];

const currencyOptions = [
  { code: 'NPR', name: 'Nepalese Rupee (₹)' },
  { code: 'INR', name: 'Indian Rupee (₹)' },
  { code: 'USD', name: 'US Dollar ($)' },
];

interface SettingsSectionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

function SettingsSection({ title, description, icon: Icon, children }: SettingsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

interface ToggleSettingProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleSetting({ label, description, checked, onChange }: ToggleSettingProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <h4 className="font-medium">{label}</h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState(mockUserSettings);
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Here you would make the actual API call
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePersonalChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value
      }
    }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  const handlePrivacyChange = (field: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: value
      }
    }));
  };

  const handleBusinessChange = (field: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      business: {
        ...prev.business,
        [field]: value
      }
    }));
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
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences for {user?.company_name || 'your business'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={loadSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Personal Information */}
      <SettingsSection
        title="Personal Information"
        description="Update your personal details and contact information"
        icon={User}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium mb-2 block">Full Name</label>
            <Input
              value={settings.personal.name}
              onChange={(e) => handlePersonalChange('name', e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Email Address</label>
            <Input
              type="email"
              value={settings.personal.email}
              onChange={(e) => handlePersonalChange('email', e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Company Name</label>
            <Input
              value={settings.personal.company_name}
              onChange={(e) => handlePersonalChange('company_name', e.target.value)}
              placeholder="Enter company name"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Phone Number</label>
            <Input
              value={settings.personal.phone}
              onChange={(e) => handlePersonalChange('phone', e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-2 block">Address</label>
            <Input
              value={settings.personal.address}
              onChange={(e) => handlePersonalChange('address', e.target.value)}
              placeholder="Enter your address"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Language</label>
            <select
              value={settings.personal.language}
              onChange={(e) => handlePersonalChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              aria-label="Select language"
            >
              {languageOptions.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Timezone</label>
            <select
              value={settings.personal.timezone}
              onChange={(e) => handlePersonalChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              aria-label="Select timezone"
            >
              {timezoneOptions.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>
        </div>
      </SettingsSection>

      {/* Security */}
      <SettingsSection
        title="Security & Password"
        description="Manage your password and security settings"
        icon={Shield}
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-3">Change Password</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Current Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={passwords.current}
                    onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">New Password</label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={passwords.new}
                  onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Confirm Password</label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <Button variant="outline" className="mt-3">
              Update Password
            </Button>
          </div>

          <div className="border-t pt-4">
            <ToggleSetting
              label="Two-Factor Authentication"
              description="Add an extra layer of security to your account"
              checked={settings.privacy.two_factor_auth}
              onChange={(checked) => handlePrivacyChange('two_factor_auth', checked)}
            />
          </div>
        </div>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection
        title="Notifications"
        description="Choose how you want to be notified about important events"
        icon={Bell}
      >
        <div className="space-y-1">
          <ToggleSetting
            label="Email Alerts"
            description="Receive important notifications via email"
            checked={settings.notifications.email_alerts}
            onChange={(checked) => handleNotificationChange('email_alerts', checked)}
          />
          <ToggleSetting
            label="SMS Alerts"
            description="Receive critical alerts via SMS"
            checked={settings.notifications.sms_alerts}
            onChange={(checked) => handleNotificationChange('sms_alerts', checked)}
          />
          <ToggleSetting
            label="Push Notifications"
            description="Receive push notifications in your browser"
            checked={settings.notifications.push_notifications}
            onChange={(checked) => handleNotificationChange('push_notifications', checked)}
          />
          <ToggleSetting
            label="Low Stock Alerts"
            description="Get notified when inventory levels are low"
            checked={settings.notifications.low_stock_alerts}
            onChange={(checked) => handleNotificationChange('low_stock_alerts', checked)}
          />
          <ToggleSetting
            label="Sales Reports"
            description="Receive automated sales report summaries"
            checked={settings.notifications.sales_reports}
            onChange={(checked) => handleNotificationChange('sales_reports', checked)}
          />
          <ToggleSetting
            label="Marketing Emails"
            description="Receive tips and promotional content"
            checked={settings.notifications.marketing_emails}
            onChange={(checked) => handleNotificationChange('marketing_emails', checked)}
          />
        </div>
      </SettingsSection>

      {/* Business Settings */}
      <SettingsSection
        title="Business Configuration"
        description="Configure your business-specific settings and preferences"
        icon={Database}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium mb-2 block">Currency</label>
            <select
              value={settings.business.currency}
              onChange={(e) => handleBusinessChange('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              aria-label="Select currency"
            >
              {currencyOptions.map(currency => (
                <option key={currency.code} value={currency.code}>{currency.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Tax Rate (%)</label>
            <Input
              type="number"
              value={settings.business.tax_rate}
              onChange={(e) => handleBusinessChange('tax_rate', parseFloat(e.target.value) || 0)}
              placeholder="Enter tax rate"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Business Hours Start</label>
            <Input
              type="time"
              value={settings.business.business_hours_start}
              onChange={(e) => handleBusinessChange('business_hours_start', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Business Hours End</label>
            <Input
              type="time"
              value={settings.business.business_hours_end}
              onChange={(e) => handleBusinessChange('business_hours_end', e.target.value)}
            />
          </div>
        </div>

        <div className="border-t pt-4 mt-4 space-y-1">
          <ToggleSetting
            label="Auto Backup"
            description="Automatically backup your data daily"
            checked={settings.business.auto_backup}
            onChange={(checked) => handleBusinessChange('auto_backup', checked)}
          />
          <ToggleSetting
            label="Inventory Alerts"
            description="Enable automatic inventory management alerts"
            checked={settings.business.inventory_alerts}
            onChange={(checked) => handleBusinessChange('inventory_alerts', checked)}
          />
        </div>
      </SettingsSection>

      {/* Data & Privacy */}
      <SettingsSection
        title="Privacy & Data"
        description="Control your privacy settings and data usage"
        icon={Globe}
      >
        <div className="space-y-1">
          <div className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Profile Visibility</h4>
                <p className="text-sm text-gray-500">Control who can see your business profile</p>
              </div>
              <select
                value={settings.privacy.profile_visibility}
                onChange={(e) => handlePrivacyChange('profile_visibility', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                aria-label="Profile visibility"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="limited">Limited</option>
              </select>
            </div>
          </div>
          <ToggleSetting
            label="Data Sharing"
            description="Allow sharing anonymized data to improve our services"
            checked={settings.privacy.data_sharing}
            onChange={(checked) => handlePrivacyChange('data_sharing', checked)}
          />
          <ToggleSetting
            label="Analytics Tracking"
            description="Enable analytics to help us improve your experience"
            checked={settings.privacy.analytics_tracking}
            onChange={(checked) => handlePrivacyChange('analytics_tracking', checked)}
          />
        </div>
      </SettingsSection>

      {/* Data Management */}
      <SettingsSection
        title="Data Management"
        description="Export or delete your data"
        icon={Download}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Export Data</h4>
              <p className="text-sm text-gray-500">Download a copy of all your business data</p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h4 className="font-medium text-red-800">Delete Account</h4>
              <p className="text-sm text-red-600">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
