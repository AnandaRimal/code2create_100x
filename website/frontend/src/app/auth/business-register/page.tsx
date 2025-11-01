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
import type { BusinessOwnerRegisterData } from '@/types/api';

const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .email('Please enter a valid email address'),
  citizenship_no: z.string()
    .min(10, 'Citizenship number must be at least 10 characters')
    .max(20, 'Citizenship number must be less than 20 characters'),
  contact_no: z.string()
    .min(10, 'Contact must be exactly 10 digits')
    .max(10, 'Contact must be exactly 10 digits')
    .regex(/^\d+$/, 'Contact must contain only numbers'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type FormData = BusinessOwnerRegisterData & { confirm_password: string };

export default function BusinessOwnerRegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { confirm_password, ...registerData } = data;
      
      // Call business owner registration API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const result = await response.json();
      
      // Registration successful - now login the user
      const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password
        }),
      });
      
      if (!loginResponse.ok) {
        // Registration was successful but login failed
        setSuccess('Registration successful! Please login with your credentials.');
        setTimeout(() => {
          router.push('/auth/business-login');
        }, 2000);
        return;
      }
      
      const loginResult = await loginResponse.json();
      
      // Get complete user profile using the token
      const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/profile`, {
        headers: {
          'Authorization': `Bearer ${loginResult.access_token}`
        }
      });
      
      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        
        // Store token and complete user data
        localStorage.setItem('auth_token', loginResult.access_token);
        localStorage.setItem('user_data', JSON.stringify({
          shop_id: profile.owner_id,
          shop_name: profile.company_name || profile.name,
          subscription_tier: 'free',
          email: profile.email,
          name: profile.name,
          company_name: profile.company_name,
          contact_no: profile.contact_no,
          citizenship_no: profile.citizenship_no
        }));
      }

      setSuccess('Registration successful! Redirecting to dashboard...');
      
      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-green-600 rounded-full">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Join Pasale Business
          </CardTitle>
          <CardDescription className="text-center">
            Create your business analytics account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="citizenship_no">Citizenship No.</Label>
                <Input
                  id="citizenship_no"
                  type="text"
                  placeholder="Citizenship number"
                  {...register('citizenship_no')}
                  className={errors.citizenship_no ? 'border-red-500' : ''}
                />
                {errors.citizenship_no && (
                  <p className="text-xs text-red-600">{errors.citizenship_no.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_no">Contact Number</Label>
                <Input
                  id="contact_no"
                  type="text"
                  placeholder="98XXXXXXXX"
                  {...register('contact_no')}
                  className={errors.contact_no ? 'border-red-500' : ''}
                />
                {errors.contact_no && (
                  <p className="text-xs text-red-600">{errors.contact_no.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create password"
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
                  <p className="text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    {...register('confirm_password')}
                    className={errors.confirm_password ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="text-xs text-red-600">{errors.confirm_password.message}</p>
                )}
              </div>
            </div>

            {/* Features info */}
            <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-2">🎉 FREE Trial Includes:</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Basic shop analytics</li>
                <li>• Revenue tracking</li>
                <li>• Limited dashboard access</li>
                <li>• View up to 5 shops</li>
              </ul>
              <p className="text-xs text-blue-600 mt-2 font-medium">
                Upgrade anytime for AI insights and advanced features!
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Start FREE Trial'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                href="/auth/business-login" 
                className="font-medium text-green-600 hover:text-green-500"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
