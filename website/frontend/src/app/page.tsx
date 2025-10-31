'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Store,
  Zap,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Brain,
  Shield,
  Target,
  Star,
  Check,
  Users,
  Award,
  Clock,
  Globe,
  ChevronRight,
  Play,
} from 'lucide-react';
import { AuthService } from '@/services/auth.service';

export default function HomePage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    if (AuthService.isAuthenticated()) {
      router.push('/dashboard');
    }
    
    // Trigger animations
    setIsLoaded(true);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className={`z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BusinessAI
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Features</a>
            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Testimonials</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Pricing</a>
            <button 
              onClick={() => router.push('/auth/business-login')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-lg font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        <div className={`text-center transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-8">
            <Star className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-blue-700 text-sm font-medium">Trusted by 10,000+ businesses worldwide</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight text-gray-900">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Transform Your Business
            </span>
            <br />
            <span className="text-gray-900">with AI Analytics</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Unlock the power of artificial intelligence to optimize your business operations, 
            predict trends, and make data-driven decisions that drive real growth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => router.push('/auth/business-register')}
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-xl flex items-center"
            >
              Start Free Trial
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="group px-8 py-4 bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center">
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </button>
          </div>
          
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">99.9%</div>
              <div className="text-gray-600 text-sm">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">50M+</div>
              <div className="text-gray-600 text-sm">Data Points</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">24/7</div>
              <div className="text-gray-600 text-sm">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview Section */}
      <section id="features" className="relative z-10 py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className={`text-center mb-16 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features for Modern Businesses
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to understand, optimize, and grow your business with cutting-edge AI technology
            </p>
          </div>
          
          <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Revenue Analytics */}
            <div className="group p-8 bg-gray-50 hover:bg-white rounded-2xl border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Revenue Analytics</h3>
              <p className="text-gray-600 mb-6">Real-time revenue tracking with AI-powered insights and predictive forecasting.</p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Real-time dashboards
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Predictive analytics
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Custom reports
                </li>
              </ul>
            </div>

            {/* AI Forecasting */}
            <div className="group p-8 bg-gray-50 hover:bg-white rounded-2xl border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Forecasting</h3>
              <p className="text-gray-600 mb-6">Advanced machine learning models predict future trends and market opportunities.</p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <Check className="w-4 h-4 text-purple-500 mr-3" />
                  Demand prediction
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-4 h-4 text-purple-500 mr-3" />
                  Seasonal analysis
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-4 h-4 text-purple-500 mr-3" />
                  Risk assessment
                </li>
              </ul>
            </div>

            {/* Smart Recommendations */}
            <div className="group p-8 bg-gray-50 hover:bg-white rounded-2xl border border-gray-200 hover:border-cyan-300 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Recommendations</h3>
              <p className="text-gray-600 mb-6">AI-driven insights and actionable recommendations to optimize your operations.</p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <Check className="w-4 h-4 text-cyan-500 mr-3" />
                  Optimization suggestions
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-4 h-4 text-cyan-500 mr-3" />
                  ROI estimates
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-4 h-4 text-cyan-500 mr-3" />
                  Priority scoring
                </li>
              </ul>
            </div>

            {/* Enterprise Security */}
            <div className="group p-8 bg-gray-50 hover:bg-white rounded-2xl border border-gray-200 hover:border-orange-300 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise Security</h3>
              <p className="text-gray-600 mb-6">Bank-level security with end-to-end encryption and compliance standards.</p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <Check className="w-4 h-4 text-orange-500 mr-3" />
                  256-bit encryption
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-4 h-4 text-orange-500 mr-3" />
                  GDPR compliant
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-4 h-4 text-orange-500 mr-3" />
                  SOC 2 certified
                </li>
              </ul>
            </div>

            {/* 24/7 Support */}
            <div className="group p-8 bg-gray-50 hover:bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">24/7 Support</h3>
              <p className="text-gray-600 mb-6">Round-the-clock expert support with dedicated success managers.</p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <Check className="w-4 h-4 text-indigo-500 mr-3" />
                  Live chat support
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-4 h-4 text-indigo-500 mr-3" />
                  Video consultations
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-4 h-4 text-indigo-500 mr-3" />
                  Training sessions
                </li>
              </ul>
            </div>

            {/* Global Scale */}
            <div className="group p-8 bg-gray-50 hover:bg-white rounded-2xl border border-gray-200 hover:border-teal-300 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Global Scale</h3>
              <p className="text-gray-600 mb-6">Built for businesses of all sizes with global infrastructure and multi-currency support.</p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <Check className="w-4 h-4 text-teal-500 mr-3" />
                  99.9% uptime SLA
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-4 h-4 text-teal-500 mr-3" />
                  Multi-currency
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-4 h-4 text-teal-500 mr-3" />
                  Global CDN
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className={`text-center mb-16 transition-all duration-1000 delay-900 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how businesses are transforming their operations with our AI-powered platform
            </p>
          </div>

          <div className={`grid md:grid-cols-3 gap-8 transition-all duration-1000 delay-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="p-8 bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic">
                "BusinessAI transformed our revenue forecasting. We've seen a 40% improvement in prediction accuracy and saved countless hours on manual analysis."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-gray-900 font-semibold">Sarah Chen</div>
                  <div className="text-gray-500 text-sm">CEO, TechFlow Inc.</div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic">
                "The AI recommendations helped us optimize our inventory management, reducing costs by 25% while improving customer satisfaction."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mr-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-gray-900 font-semibold">Marcus Rodriguez</div>
                  <div className="text-gray-500 text-sm">Operations Director, RetailPro</div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic">
                "Implementation was seamless and the support team is exceptional. Our data-driven decisions have improved significantly since adoption."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-gray-900 font-semibold">Emily Johnson</div>
                  <div className="text-gray-500 text-sm">CFO, DataCorp Solutions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <div className={`transition-all duration-1000 delay-1200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-12">
              Join thousands of businesses that are already using AI to drive growth and make smarter decisions
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => router.push('/auth/business-register')}
                className="group px-10 py-5 bg-white hover:bg-gray-50 text-blue-600 hover:text-blue-700 font-bold text-lg rounded-xl transition-all duration-300 hover:scale-105 shadow-2xl flex items-center"
              >
                Start Your Free Trial
                <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => router.push('/auth/business-login')}
                className="px-10 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold text-lg rounded-xl transition-all duration-300 border border-white/20 hover:border-white/30"
              >
                Login to Dashboard
              </button>
            </div>
            
            <p className="text-blue-100 text-sm mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 bg-white border-t border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BusinessAI
              </span>
            </div>
            
            <div className="flex items-center space-x-6 text-gray-500 text-sm">
              <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Contact Us</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            © 2024 BusinessAI. All rights reserved. Empowering businesses with AI-driven insights.
          </div>
        </div>
      </footer>
    </div>
  );
}
