import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const t = await getTranslations("Dashboard")

  // Fetch user's recordings count
  const { count: recordingsCount } = await supabase
    .from('recordings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id)

  // Fetch user's presets count
  const { count: presetsCount } = await supabase
    .from('presets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id)

  // Fetch user's scripts count
  const { count: scriptsCount } = await supabase
    .from('scripts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id)

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t("welcomeBack", { email: user?.email || "" })}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t("subtitle")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link
          href="/studio"
          className="bg-card border border-border rounded-lg p-6 hover:border-pink-500 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{t("quickAction")}</p>
              <p className="text-card-foreground text-lg font-semibold mt-1 group-hover:text-pink-500">
                {t("openStudio")}
              </p>
            </div>
            <div className="h-12 w-12 bg-pink-500/20 rounded-lg flex items-center justify-center group-hover:bg-pink-500/30 transition-colors">
              <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </Link>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{t("totalScripts")}</p>
              <p className="text-card-foreground text-2xl font-bold mt-1">{scriptsCount || 0}</p>
            </div>
            <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{t("totalRecordings")}</p>
              <p className="text-card-foreground text-2xl font-bold mt-1">{recordingsCount || 0}</p>
            </div>
            <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{t("savedPresets")}</p>
              <p className="text-card-foreground text-2xl font-bold mt-1">{presetsCount || 0}</p>
            </div>
            <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-card-foreground text-lg font-semibold mb-4">{t("quickActions")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/studio"
            className="flex items-center gap-3 p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <div className="h-10 w-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="text-card-foreground font-medium">{t("createNewScript")}</p>
              <p className="text-muted-foreground text-sm">{t("createNewScriptDesc")}</p>
            </div>
          </Link>

          <Link
            href="/dashboard/recordings"
            className="flex items-center gap-3 p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <div className="h-10 w-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <p className="text-card-foreground font-medium">{t("viewRecordings")}</p>
              <p className="text-muted-foreground text-sm">{t("viewRecordingsDesc")}</p>
            </div>
          </Link>

          <Link
            href="/dashboard/scripts"
            className="flex items-center gap-3 p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <div className="h-10 w-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-card-foreground font-medium">{t("manageScripts")}</p>
              <p className="text-muted-foreground text-sm">{t("manageScriptsDesc")}</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-lg p-6">
        <h2 className="text-card-foreground text-lg font-semibold mb-2">{t("gettingStarted")}</h2>
        <p className="text-muted-foreground text-sm mb-4">
          {t("gettingStartedDesc")}
        </p>
        <ol className="space-y-2 text-gray-300 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-pink-500 font-bold">1.</span>
            <span className="text-foreground">{t("step1")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500 font-bold">2.</span>
            <span className="text-foreground">{t("step2")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500 font-bold">3.</span>
            <span className="text-foreground">{t("step3")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500 font-bold">4.</span>
            <span className="text-foreground">{t("step4")}</span>
          </li>
        </ol>
      </div>
    </div>
  )
}
