import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NavAuth } from "@/components/auth/NavAuth";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import Link from "next/link";
import { Suspense } from "react";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication on server side
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to dashboard if authenticated (since /protected is deprecated)
  if (user) {
    redirect('/dashboard')
  }

  // Redirect to login if not authenticated
  redirect('/auth/login?redirectTo=/dashboard')

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>Teleprompter</Link>
            </div>
            <Suspense>
              <NavAuth />
            </Suspense>
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          {children}
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
