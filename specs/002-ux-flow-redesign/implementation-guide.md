# Implementation Guide

This guide provides step-by-step instructions for implementing the teleprompter UX flow redesign.

## Overview

This implementation is organized into 7 phases that can be completed sequentially:

1. **Database Setup** - Create new tables and migrations
2. **Core Routes** - Set up routing and middleware
3. **Navigation** - Create navigation components
4. **API Routes** - Implement backend endpoints
5. **Dashboard** - Build user dashboard
6. **New Pages** - Create landing, quickstart, demo pages
7. **Polish** - Testing, optimization, deployment

---

## Phase 1: Database Setup

### Step 1.1: Create Scripts Table Migration

Create the migration file:

```bash
# Create migration file
touch supabase/migrations/005_create_scripts_table.sql
```

**File:** `supabase/migrations/005_create_scripts_table.sql`

```sql
-- Create scripts table
CREATE TABLE IF NOT EXISTS scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  bg_url TEXT,
  music_url TEXT,
  settings JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  share_id UUID UNIQUE DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scripts_user_id ON scripts(user_id);
CREATE INDEX IF NOT EXISTS idx_scripts_share_id ON scripts(share_id);
CREATE INDEX IF NOT EXISTS idx_scripts_updated_at ON scripts(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_scripts_is_public ON scripts(is_public) WHERE is_public = true;

-- Enable RLS
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own scripts"
  ON scripts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scripts"
  ON scripts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scripts"
  ON scripts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scripts"
  ON scripts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public scripts are viewable by all"
  ON scripts FOR SELECT USING (is_public = true);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_scripts_updated_at
    BEFORE UPDATE ON scripts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Apply the migration:**

```bash
# Local development
supabase db reset

# Or apply just this migration
supabase db push
```

### Step 1.2: Add User Preferences

```bash
touch supabase/migrations/006_add_user_preferences.sql
```

**File:** `supabase/migrations/006_add_user_preferences.sql`

```sql
-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  default_font TEXT DEFAULT 'Classic',
  default_font_size INTEGER DEFAULT 48,
  default_theme TEXT DEFAULT 'system',
  auto_save BOOLEAN DEFAULT true,
  auto_save_interval INTEGER DEFAULT 30,
  default_speed NUMERIC(3,1) DEFAULT 2.0,
  mirror_mode_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert defaults for existing users
INSERT INTO user_preferences (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
```

### Step 1.3: Create TypeScript Types

**File:** `types/script.ts` (new file)

```typescript
export interface Script {
  id: string
  user_id: string
  title: string
  content: string
  bg_url?: string
  music_url?: string
  settings: TeleprompterSettings
  is_public: boolean
  share_id?: string
  created_at: string
  updated_at: string
}

export interface TeleprompterSettings {
  font: FontStyle
  colorIndex: number
  fontSize: number
  lineHeight: number
  margin: number
  align: TextAlign
  overlayOpacity: number
  speed?: number
}

export type FontStyle = 'Classic' | 'Modern' | 'Typewriter' | 'Novel' | 'Neon'
export type TextAlign = 'left' | 'center'

export interface ScriptSummary {
  id: string
  title: string
  preview: string
  updated_at: string
}

export interface CreateScriptInput {
  title?: string
  content: string
  bg_url?: string
  music_url?: string
  settings?: Partial<TeleprompterSettings>
  is_public?: boolean
}

export interface UpdateScriptInput {
  title?: string
  content?: string
  bg_url?: string
  music_url?: string
  settings?: Partial<TeleprompterSettings>
  is_public?: boolean
}
```

---

## Phase 2: Core Routes

### Step 2.1: Create Middleware

**File:** `middleware.ts` (at project root)

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  
  const { pathname } = req.nextUrl
  
  // Public routes (no auth required)
  const publicRoutes = ['/', '/demo', '/quickstart', '/auth/login', '/auth/sign-up', '/auth/forgot-password']
  
  // Protected routes (auth required)
  const protectedRoutes = ['/dashboard']
  
  // Check authentication
  const isAuthed = !!session
  
  // Redirect to login if accessing protected route without auth
  if (protectedRoutes.some(path => pathname.startsWith(path)) && !isAuthed) {
    const redirectUrl = new URL('/auth/login', req.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Redirect to dashboard if accessing login while already authenticated
  if (['/auth/login', '/auth/sign-up'].includes(pathname) && isAuthed) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  
  // Redirect authenticated users accessing root to dashboard
  if (pathname === '/' && isAuthed) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  
  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Step 2.2: Update Root Page to Landing

**Rename current `app/page.tsx` to prepare for move:**

First, create the new landing page:

**File:** `app/page.tsx`

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LandingPage } from '@/components/Landing/LandingPage'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  // Redirect authenticated users to dashboard
  if (session) {
    redirect('/dashboard')
  }
  
  // Show landing page for visitors
  return <LandingPage />
}
```

### Step 2.3: Move Studio to New Route

**Create studio directory and move page:**

```bash
mkdir -p app/studio
```

**File:** `app/studio/page.tsx`

```typescript
'use client'

import React, { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTeleprompterStore } from '@/stores/useTeleprompterStore'
import { Editor } from '@/components/teleprompter/Editor'
import { Runner } from '@/components/teleprompter/Runner'
import { AppProvider } from '@/components/AppProvider'
import { Toaster } from 'sonner'
import { AnimatePresence } from 'framer-motion'

function StudioLogic() {
  const searchParams = useSearchParams()
  const store = useTeleprompterStore()
  
  useEffect(() => {
    // Load script from ?script={id} parameter
    const scriptId = searchParams.get('script')
    if (scriptId) {
      // TODO: Implement script loading from API
      // For now, log it
      console.log('Loading script:', scriptId)
    }
  }, [searchParams])
  
  return (
    <AnimatePresence mode="wait">
      {store.mode === 'setup' ? <Editor key="editor" /> : <Runner key="runner" />}
    </AnimatePresence>
  )
}

export default function StudioPage() {
  return (
    <AppProvider>
      <Toaster position="top-center" richColors />
      <Suspense fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Loading...
        </div>
      }>
        <StudioLogic />
      </Suspense>
    </AppProvider>
  )
}
```

### Step 2.4: Create Layout Components

**Create layouts directory:**

```bash
mkdir -p components/Layouts
```

**File:** `components/Layouts/DashboardLayout.tsx`

```typescript
'use client'

import { ReactNode } from 'react'
import { DashboardSidebar } from '@/components/Navigation/DashboardSidebar'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-950">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
```

---

## Phase 3: Navigation Components

### Step 3.1: Create Navigation Directory

```bash
mkdir -p components/Navigation
```

### Step 3.2: Public Navbar

**File:** `components/Navigation/PublicNavbar.tsx`

```typescript
'use client'

import Link from 'next/link'
import { AuthButton } from '@/components/auth/AuthButton'

export function PublicNavbar() {
  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-linear-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
          Glean Teleprompter
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <Link href="/demo" className="text-gray-300 hover:text-white transition-colors">
            Try Demo
          </Link>
          <Link href="/quickstart" className="text-gray-300 hover:text-white transition-colors">
            Templates
          </Link>
        </div>
        
        <AuthButton />
      </div>
    </nav>
  )
}
```

### Step 3.3: Dashboard Sidebar

**File:** `components/Navigation/DashboardSidebar.tsx`

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, Video, Palette, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'Scripts', href: '/dashboard/scripts', icon: FileText },
  { name: 'Recordings', href: '/dashboard/recordings', icon: Video },
  { name: 'Presets', href: '/dashboard/presets', icon: Palette },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  
  return (
    <aside className="w-64 border-r border-gray-800 bg-gray-950 p-6 flex flex-col">
      <div className="mb-8">
        <Link href="/dashboard" className="text-xl font-bold bg-linear-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
          Glean
        </Link>
      </div>
      
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-pink-500/20 text-pink-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

---

## Phase 4: API Routes

### Step 4.1: Create Scripts API

```bash
mkdir -p app/api/scripts
```

**File:** `app/api/scripts/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const search = searchParams.get('search')
  const sort = searchParams.get('sort') || 'updated_at'
  const order = searchParams.get('order') || 'desc'
  
  const from = (page - 1) * limit
  const to = from + limit - 1
  
  let query = supabase
    .from('scripts')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
  
  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
  }
  
  const { data, error, count } = await query
    .order(sort, { ascending: order === 'asc' })
    .range(from, to)
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({
    scripts: data || [],
    pagination: {
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    
    const { data: script, error } = await supabase
      .from('scripts')
      .insert({
        user_id: user.id,
        title: body.title || 'Untitled',
        content: body.content || '',
        bg_url: body.bg_url,
        music_url: body.music_url,
        settings: body.settings || {},
        is_public: body.is_public || false
      })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(script, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
```

### Step 4.2: Individual Script API

```bash
mkdir -p app/api/scripts/[id]
```

**File:** `app/api/scripts/[id]/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { id } = await params
  
  const { data: script } = await supabase
    .from('scripts')
    .select('*')
    .eq('id', id)
    .single()
  
  if (!script) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  
  // Check access permission
  if (!script.is_public && script.user_id !== user?.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  return NextResponse.json(script)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { id } = await params
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Verify ownership
  const { data: existing } = await supabase
    .from('scripts')
    .select('user_id')
    .eq('id', id)
    .single()
  
  if (!existing || existing.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  try {
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('scripts')
      .update(body)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { id } = await params
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Verify ownership
  const { data: existing } = await supabase
    .from('scripts')
    .select('user_id')
    .eq('id', id)
    .single()
  
  if (!existing || existing.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  const { error } = await supabase
    .from('scripts')
    .delete()
    .eq('id', id)
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return new NextResponse(null, { status: 204 })
}
```

### Step 4.3: Share API

```bash
mkdir -p app/api/share/[shareId]
```

**File:** `app/api/share/[shareId]/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const supabase = await createClient()
  const { shareId } = await params
  
  const { data: script, error } = await supabase
    .from('scripts')
    .select(`
      *,
      user:user_id(email, display_name)
    `)
    .eq('share_id', shareId)
    .eq('is_public', true)
    .single()
  
  if (error || !script) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  
  return NextResponse.json({
    share_id: shareId,
    script: {
      id: script.id,
      title: script.title,
      content: script.content,
      bg_url: script.bg_url,
      music_url: script.music_url,
      settings: script.settings
    },
    author: {
      display_name: script.user?.display_name,
      email: script.user?.email
    },
    shared_at: script.updated_at
  })
}
```

---

## Phase 5: Dashboard

### Step 5.1: Create Dashboard Components

```bash
mkdir -p components/Dashboard
```

**File:** `components/Dashboard/StatsCards.tsx`

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { FileText, Video, Palette, HardDrive } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardsProps {
  className?: string
}

export function StatsCards({ className }: StatsCardsProps) {
  // For now, use static data. Replace with API call later
  const stats = {
    scripts: 12,
    recordings: 8,
    presets: 5,
    storage: { used: 1250, limit: 5120 }
  }
  
  const cards = [
    {
      label: 'Scripts',
      value: stats.scripts,
      icon: FileText,
      href: '/dashboard/scripts',
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/20'
    },
    {
      label: 'Recordings',
      value: stats.recordings,
      icon: Video,
      href: '/dashboard/recordings',
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/20'
    },
    {
      label: 'Presets',
      value: stats.presets,
      icon: Palette,
      href: '/dashboard/presets',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      label: 'Storage',
      value: `${(stats.storage.used / 1024).toFixed(1)} GB`,
      icon: HardDrive,
      href: '/dashboard/settings',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    }
  ]
  
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <a
            key={card.label}
            href={card.href}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm">{card.label}</span>
              <div className={cn('p-2 rounded-lg', card.bgColor)}>
                <Icon className={cn('w-5 h-5', card.color)} />
              </div>
            </div>
            <div className="text-3xl font-bold">{card.value}</div>
          </a>
        )
      })}
    </div>
  )
}
```

**File:** `components/Dashboard/RecentScripts.tsx`

```typescript
'use client'

import Link from 'next/link'
import { FileText, Clock } from 'lucide-react'

export function RecentScripts() {
  // Static data for now - replace with API
  const scripts = [
    { id: '1', title: 'Product Launch Script', updated: '2 hours ago' },
    { id: '2', title: 'Podcast Episode 42', updated: '1 day ago' },
    { id: '3', title: 'Weekly Update', updated: '3 days ago' },
  ]
  
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Scripts</h2>
        <Link
          href="/dashboard/scripts"
          className="text-pink-400 hover:text-pink-300 text-sm"
        >
          View all →
        </Link>
      </div>
      
      <div className="space-y-3">
        {scripts.map((script) => (
          <a
            key={script.id}
            href={`/studio?script=${script.id}`}
            className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <div className="p-2 bg-pink-500/20 rounded-lg">
              <FileText className="w-5 h-5 text-pink-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{script.title}</h3>
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <Clock size={12} />
                {script.updated}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
```

**File:** `components/Dashboard/RecentRecordings.tsx`

```typescript
'use client'

import Link from 'next/link'
import { Video } from 'lucide-react'

export function RecentRecordings() {
  const recordings = [
    { id: '1', thumbnail: '', duration: '2:30', date: 'Yesterday' },
    { id: '2', thumbnail: '', duration: '5:15', date: '2 days ago' },
    { id: '3', thumbnail: '', duration: '1:45', date: '1 week ago' },
  ]
  
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Recordings</h2>
        <Link
          href="/dashboard/recordings"
          className="text-pink-400 hover:text-pink-300 text-sm"
        >
          View all →
        </Link>
      </div>
      
      <div className="space-y-3">
        {recordings.map((recording) => (
          <a
            key={recording.id}
            href={`/dashboard/recordings`}
            className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <div className="p-2 bg-violet-500/20 rounded-lg aspect-video flex items-center justify-center">
              <Video className="w-5 h-5 text-violet-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Recording</h3>
              <p className="text-sm text-gray-400">
                {recording.duration} • {recording.date}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
```

### Step 5.2: Create Dashboard Page

**File:** `app/dashboard/page.tsx`

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/Layouts/DashboardLayout'
import { StatsCards } from '@/components/Dashboard/StatsCards'
import { RecentScripts } from '@/components/Dashboard/RecentScripts'
import { RecentRecordings } from '@/components/Dashboard/RecentRecordings'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-gray-400 mt-2">
            Manage your scripts, recordings, and settings
          </p>
        </div>
        
        <StatsCards />
        <RecentScripts />
        <RecentRecordings />
      </div>
    </DashboardLayout>
  )
}
```

---

## Phase 6: New Pages

### Step 6.1: Create Landing Page Components

```bash
mkdir -p components/Landing
```

**File:** `components/Landing/LandingPage.tsx`

```typescript
'use client'

import Link from 'next/link'
import { Play, FileText, Video, Sparkles } from 'lucide-react'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-linear-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
            Glean Teleprompter
          </h1>
          <p className="text-xl text-gray-400 mb-12">
            Professional teleprompter for content creators. Write, rehearse, and record your scripts with ease.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/quickstart"
              className="px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <FileText size={20} />
              Start Writing
            </Link>
            <Link
              href="/demo"
              className="px-8 py-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <Play size={20} />
              Try Demo
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <h2 className="text-3xl font-bold text-center mb-16">Everything you need</h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard
            icon={Sparkles}
            title="Smart Teleprompter"
            description="Adjustable speed, fonts, colors, and mirror mode for reflectors"
          />
          <FeatureCard
            icon={Video}
            title="Built-in Recording"
            description="Record yourself while reading the script with camera overlay"
          />
          <FeatureCard
            icon={FileText}
            title="Cloud Sync"
            description="Save scripts securely and access from any device"
          />
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
      <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-pink-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}
```

### Step 6.2: Create Demo Page

**File:** `app/demo/page.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { useTeleprompterStore } from '@/stores/useTeleprompterStore'
import { Editor } from '@/components/teleprompter/Editor'
import { Runner } from '@/components/teleprompter/Runner'
import { AnimatePresence } from 'framer-motion'

export default function DemoPage() {
  const store = useTeleprompterStore()
  
  useEffect(() => {
    // Load demo content
    store.setAll({
      text: `// Welcome to Glean Teleprompter Demo!

This is a sample script to help you explore all the features.

🎯 Try adjusting the SPEED slider to find your perfect reading pace.

🎨 Change the FONT style to see how different fonts look on screen.

🌈 Pick a COLOR that matches your brand or mood.

📸 Click the CAMERA button to try recording yourself!

💾 When you're ready to save your own scripts, sign up for a free account.

The teleprompter will scroll automatically when you click the Preview button.
You can pause, play, and adjust speed while reading.

Happy recording! 🎬`,
      font: 'Modern',
      colorIndex: 2,
      speed: 2,
      fontSize: 48,
      align: 'center',
      bgUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=2500',
      musicUrl: '',
      mode: 'setup',
      isReadOnly: false
    })
  }, [store])
  
  return (
    <div className="relative">
      {/* Demo banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/90 text-black py-2 px-4 text-center">
        🎮 Demo Mode - Sign up to save your scripts and recordings
        <a href="/auth/sign-up" className="ml-4 underline font-bold">Sign Up Free →</a>
      </div>
      
      <div className="pt-12">
        <AnimatePresence mode="wait">
          {store.mode === 'setup' ? <Editor key="editor" /> : <Runner key="runner" />}
        </AnimatePresence>
      </div>
    </div>
  )
}
```

### Step 6.3: Create Quickstart Page

**File:** `app/quickstart/page.tsx`

```typescript
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, Video, Mic, Briefcase } from 'lucide-react'

const templates = [
  {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'Introduce your new product with impact',
    icon: Briefcase,
    content: `// Product Launch Script Template

[Opening Hook]
In just 2 minutes, I'm going to show you something that will change how you...

[Problem Statement]
You know how frustrating it is when...

[Solution]
That's why we built...

[Call to Action]
Click the link below to...`
  },
  {
    id: 'youtube-intro',
    name: 'YouTube Intro',
    description: 'Catchy video intro for your channel',
    icon: Video,
    content: `// YouTube Intro Template

What's up everyone! Welcome back to the channel.

Today we're talking about...

Make sure to hit that subscribe button and ring the bell!

Let's dive in!`
  },
  {
    id: 'podcast-script',
    name: 'Podcast Script',
    description: 'Structured podcast episode outline',
    icon: Mic,
    content: `// Podcast Episode Script

[Intro - 2 min]
- Welcome listeners
- Episode topic teaser

[Main Content - 15-20 min]
- Point 1: Explanation
- Point 2: Personal story
- Point 3: Actionable tips

[Outro - 2 min]
- Key takeaways recap
- Call to action`
  },
  {
    id: 'blank',
    name: 'Start from Scratch',
    description: 'Blank slate for your own content',
    icon: FileText,
    content: ''
  }
]

export default function QuickstartPage() {
  return (
    <div className="min-h-screen bg-gray-950 py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Quick Start with Templates</h1>
          <p className="text-gray-400 text-lg">
            Choose a template to get started faster
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {templates.map((template) => {
            const Icon = template.icon
            return (
              <Link
                key={template.id}
                href={`/studio?template=${template.id}`}
                className="bg-gray-900 border border-gray-800 rounded-xl p-8 hover:border-gray-700 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-pink-500/20 rounded-lg group-hover:bg-pink-500/30 transition-colors">
                    <Icon className="w-6 h-6 text-pink-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                    <p className="text-gray-400 mb-4">{template.description}</p>
                    <span className="text-pink-400 font-medium">Use this template →</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

---

## Phase 7: Polish & Testing

### Step 7.1: Update Editor Component

The existing `Editor.tsx` needs updates to work with the new routing:

**Changes needed in `components/teleprompter/Editor.tsx`:**

1. Add script loading from URL parameter
2. Update save functionality to use new API
3. Add "Back to Dashboard" link for authenticated users

```typescript
// Add to existing Editor component
useEffect(() => {
  const scriptId = searchParams.get('script')
  if (scriptId) {
    // Load script from API
    fetch(`/api/scripts/${scriptId}`)
      .then(res => res.json())
      .then(data => {
        store.setAll({
          text: data.content,
          bgUrl: data.bg_url,
          musicUrl: data.music_url,
          font: data.settings.font,
          colorIndex: data.settings.colorIndex,
          align: data.settings.align,
          mode: 'setup'
        })
      })
  }
}, [searchParams, store])
```

### Step 7.2: Test Checklist

Run through this checklist before deployment:

#### Routing Tests
- [ ] `/` shows landing page for visitors
- [ ] `/` redirects to `/dashboard` for logged-in users
- [ ] `/dashboard` requires authentication
- [ ] `/studio` works without authentication
- [ ] `/demo` shows demo banner
- [ ] `/quickstart` shows templates

#### Authentication Tests
- [ ] Login works correctly
- [ ] Logout redirects to home
- [ ] Protected routes redirect to login
- [ ] Session persists across pages

#### Feature Tests
- [ ] Creating a script works
- [ ] Saving a script works (authenticated)
- [ ] Save prompts login for unauthenticated users
- [ ] Dashboard shows correct stats
- [ ] Navigation works correctly

---

## Quick Start Commands

```bash
# Install dependencies (if needed)
npm install

# Run database migrations
supabase db reset

# Start development server
npm run dev

# Run tests (when available)
npm test

# Lint code
npm run lint

# Build for production
npm run build
```

---

## Troubleshooting

### Issue: Middleware not working

**Solution:** Ensure you have `@supabase/auth-helpers-nextjs` installed:

```bash
npm install @supabase/auth-helpers-nextjs
```

### Issue: Scripts not saving

**Solution:** Check that:
1. Database migrations have been applied
2. RLS policies are correct
3. User is authenticated

### Issue: Navigation not highlighting active route

**Solution:** Ensure `usePathname()` is being used client-side:

```typescript
'use client' // Required at top of file
```

---

## Next Steps

After completing this implementation:

1. **Add Analytics** - Track user behavior and conversion
2. **Add Onboarding** - Create first-run experience for new users
3. **Enhance Dashboard** - Add more widgets and insights
4. **Add Search** - Implement full-text search for scripts
5. **Add Folders** - Organize scripts into folders
6. **Add Collaboration** - Allow sharing with editing permissions

---

## Support

For questions or issues:
- Check the main architecture document: `specs/002-ux-flow-redesign/architecture.md`
- Review API specs: `specs/002-ux-flow-redesign/api-specifications.md`
- See migration guide: `specs/002-ux-flow-redesign/migration-guide.md`
