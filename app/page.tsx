"use client";

import React from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'next/navigation';
import { PublicNavbar } from '@/components/Navigation/PublicNavbar';
import { Hero } from '@/components/Landing/Hero';
import { FeatureCards } from '@/components/Landing/FeatureCards';
import { CTASection } from '@/components/Landing/CTASection';
import { AuthInitializer } from '@/components/auth/AuthInitializer';

/**
 * Landing page
 * Redirects authenticated users to dashboard, shows landing content for visitors
 */
export default function LandingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  // Redirect authenticated users to dashboard
  React.useEffect(() => {
    if (user && !isLoading) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // Don't render landing content if user is authenticated (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <PublicNavbar />
      <main>
        <Hero />
        <FeatureCards />
        <CTASection />

        {/* Footer */}
        <footer className="border-t border-gray-800 py-8 px-4">
          <div className="container mx-auto text-center text-sm text-gray-500">
            <p>© 2025 Glean Teleprompter. All rights reserved.</p>
            <div className="flex justify-center gap-6 mt-4">
              <a href="/demo" className="hover:text-pink-400 transition-colors">Demo</a>
              <a href="/quickstart" className="hover:text-pink-400 transition-colors">Templates</a>
              <a href="/auth/login" className="hover:text-pink-400 transition-colors">Log In</a>
              <a href="/auth/sign-up" className="hover:text-pink-400 transition-colors">Sign Up</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
