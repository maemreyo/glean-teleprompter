"use client";

import React from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations("App");

  // Redirect authenticated users to dashboard
  React.useEffect(() => {
    if (user && !isLoading) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // Don't render landing content if user is authenticated (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/50 to-background">
      <PublicNavbar />
      <main>
        <Hero />
        <FeatureCards />
        <CTASection />

        {/* Footer */}
        <footer className="border-t border-border py-8 px-4">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>{t("footer.copyright")}</p>
            <div className="flex justify-center gap-6 mt-4">
              <a href="/demo" className="hover:text-primary transition-colors">{t("footer.demo")}</a>
              <a href="/quickstart" className="hover:text-primary transition-colors">{t("footer.templates")}</a>
              <a href="/auth/login" className="hover:text-primary transition-colors">{t("footer.login")}</a>
              <a href="/auth/sign-up" className="hover:text-primary transition-colors">{t("footer.signUp")}</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
