"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { NavAuth } from '@/components/auth/NavAuth'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import Link from 'next/link'
import { useAuthStore } from '@/stores/useAuthStore'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t = useTranslations("DashboardLayout")
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/auth/login?redirectTo=${encodeURIComponent(pathname)}`)
    }
  }, [user, isLoading, router, pathname])

  // // Show loading state while checking authentication
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-gray-950 flex items-center justify-center">
  //       <div className="text-white">Loading...</div>
  //     </div>
  //   )
  // }

  // Don't render protected content if not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Dashboard Top Navigation */}
      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-pink-500">
              {t("brand")}
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t("overview")}
              </Link>
              <Link
                href="/dashboard/recordings"
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t("recordings")}
              </Link>
              <Link
                href="/studio"
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t("studio")}
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <NavAuth />
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-auto py-8">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>{t("footer", { year: new Date().getFullYear() })}</p>
        </div>
      </footer>
    </div>
  )
}
