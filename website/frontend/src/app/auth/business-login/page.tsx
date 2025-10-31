'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Eye, EyeOff, Building2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { BusinessOwnerLoginData } from '@/types/api';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function BusinessOwnerLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessOwnerLoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: BusinessOwnerLoginData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const result = await response.json();
      
      // Get complete user profile using the token
      const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/profile`, {
        headers: {
          'Authorization': `Bearer ${result.access_token}`
        }
      });
      
      if (!profileResponse.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const profile = await profileResponse.json();
      
      // Store token and complete user data in the format expected by AuthService
      localStorage.setItem('auth_token', result.access_token);
      localStorage.setItem('user_data', JSON.stringify({
        shop_id: profile.owner_id, // Map owner_id to shop_id for compatibility
        shop_name: profile.company_name || profile.name,
        subscription_tier: 'free', // All business owners get free tier with all features
        email: profile.email,
        name: profile.name,
        company_name: profile.company_name,
        contact_no: profile.contact_no,
        citizenship_no: profile.citizenship_no
      }));

      // Redirect to dashboard
      router.push('/dashboard');

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-green-600 rounded-full">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Business Owner Login
          </CardTitle>
          <CardDescription className="text-center">
            Access your business analytics dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Link 
                href="#" 
                className="text-sm text-green-600 hover:text-green-500"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                href="/auth/business-register" 
                className="font-medium text-green-600 hover:text-green-500"
              >
                Start FREE trial
              </Link>
            </p>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-xs text-blue-700 text-center">
              <strong>New to Pasale Business?</strong><br />
              Get instant access to analytics with your FREE trial!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
