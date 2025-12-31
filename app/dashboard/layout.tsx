import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NavAuth } from '@/components/auth/NavAuth'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/auth/login?redirectTo=/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Dashboard Top Navigation */}
      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-pink-500">
              Glean
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Overview
              </Link>
              <Link
                href="/dashboard/recordings"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Recordings
              </Link>
              <Link
                href="/studio"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Studio
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
          <p>© {new Date().getFullYear()} Glean Teleprompter. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
