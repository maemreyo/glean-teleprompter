# Migration Guide

This document provides detailed guidance for migrating from the current application structure to the redesigned UX flow.

## Overview

The migration involves:
1. Moving the studio from `/` to `/studio`
2. Creating a new landing page at `/`
3. Adding dashboard functionality
4. Implementing new routes and navigation
5. Database schema changes
6. Component reorganization

---

## Phase 1: Database Changes

### Step 1.1: Create Scripts Table

The application needs a dedicated table for storing user scripts.

**Migration File:** `supabase/migrations/005_create_scripts_table.sql`

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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scripts_user_id ON scripts(user_id);
CREATE INDEX IF NOT EXISTS idx_scripts_share_id ON scripts(share_id);
CREATE INDEX IF NOT EXISTS idx_scripts_updated_at ON scripts(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_scripts_is_public ON scripts(is_public) WHERE is_public = true;

-- Enable RLS
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own scripts"
  ON scripts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scripts"
  ON scripts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scripts"
  ON scripts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scripts"
  ON scripts FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Public scripts are viewable by all"
  ON scripts FOR SELECT
  USING (is_public = true);

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

### Step 1.2: Update User Preferences

**Migration File:** `supabase/migrations/006_add_user_preferences.sql`

```sql
-- Add user preferences table
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

-- Insert default preferences for existing users
INSERT INTO user_preferences (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
```

### Step 1.3: Update Presets Table (if exists)

If presets are currently stored differently, migrate them:

**Migration File:** `supabase/migrations/007_update_presets_table.sql`

```sql
-- Check if presets table exists and add user_id if missing
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'presets') THEN
    -- Add user_id column if it doesn't exist
    ALTER TABLE presets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
    ALTER TABLE presets ADD COLUMN IF NOT EXISTS is_builtin BOOLEAN DEFAULT false;
    ALTER TABLE presets ADD COLUMN IF NOT EXISTS share_id UUID UNIQUE DEFAULT gen_random_uuid();
    ALTER TABLE presets ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
    ALTER TABLE presets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
    
    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_presets_user_id ON presets(user_id);
    CREATE INDEX IF NOT EXISTS idx_presets_is_builtin ON presets(is_builtin);
    
    -- Enable RLS if not already enabled
    ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
    
    -- Update policies
    DROP POLICY IF EXISTS "Users can view own presets" ON presets;
    CREATE POLICY "Users can view own presets"
      ON presets FOR SELECT
      USING (auth.uid() = user_id OR is_builtin = true);
      
    DROP POLICY IF EXISTS "Users can insert own presets" ON presets;
    CREATE POLICY "Users can insert own presets"
      ON presets FOR INSERT
      WITH CHECK (auth.uid() = user_id AND NOT is_builtin);
      
    DROP POLICY IF EXISTS "Users can update own presets" ON presets;
    CREATE POLICY "Users can update own presets"
      ON presets FOR UPDATE
      USING (auth.uid() = user_id AND NOT is_builtin);
      
    DROP POLICY IF EXISTS "Users can delete own presets" ON presets;
    CREATE POLICY "Users can delete own presets"
      ON presets FOR DELETE
      USING (auth.uid() = user_id AND NOT is_builtin);
  END IF;
END $$;
```

---

## Phase 2: Route Migration

### Step 2.1: Create Middleware

**File:** `middleware.ts` (new file at project root)

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
  
  // Check if user is authenticated
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
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Step 2.2: Move Studio to New Route

**Actions:**

1. Create `app/studio/page.tsx` with current `app/page.tsx` content
2. Remove shared link logic from studio (move to dedicated route)
3. Update `app/page.tsx` to become the landing page

**Migration steps:**

```bash
# Create studio directory
mkdir -p app/studio

# Move current page content
# (manual process - copy content, not move)
```

**New `app/page.tsx`:**

```typescript
// app/page.tsx - New landing page
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

**New `app/studio/page.tsx`:**

```typescript
// app/studio/page.tsx - Studio (moved from root)
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
      // TODO: Load script from API
      loadScript(scriptId)
    }
  }, [searchParams, store])
  
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
      <Suspense fallback={<LoadingSpinner />}>
        <StudioLogic />
      </Suspense>
    </AppProvider>
  )
}
```

### Step 2.3: Handle Legacy Shared Links

**Create `app/studio/legacy/page.tsx`:**

```typescript
// app/studio/legacy/page.tsx - Handle old format shared links
'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import LZString from 'lz-string'
import { useTeleprompterStore } from '@/stores/useTeleprompterStore'
import { Editor } from '@/components/teleprompter/Editor'
import { Runner } from '@/components/teleprompter/Runner'
import { AppProvider } from '@/components/AppProvider'

const FONT_STYLES = {
  Classic: { name: 'Classic' },
  Modern: { name: 'Modern' },
  // ...
}

export default function LegacySharedPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const store = useTeleprompterStore()
  
  useEffect(() => {
    const data = searchParams.get('data')
    if (data) {
      try {
        const decompressed = LZString.decompressFromEncodedURIComponent(data)
        if (decompressed) {
          const parsed = JSON.parse(decompressed)
          store.setAll({
            text: parsed.text,
            bgUrl: parsed.bgUrl,
            musicUrl: parsed.musicUrl,
            font: FONT_STYLES[parsed.font]?.name || 'Classic',
            colorIndex: parsed.color || 0,
            align: parsed.align || 'center',
            mode: 'running',
            isReadOnly: true
          })
        }
      } catch (e) {
        console.error('Error reading legacy share link', e)
        router.push('/')
      }
    } else {
      router.push('/')
    }
  }, [searchParams, store, router])
  
  return (
    <AppProvider>
      <AnimatePresence mode="wait">
        {store.mode === 'setup' ? <Editor key="editor" /> : <Runner key="runner" />}
      </AnimatePresence>
    </AppProvider>
  )
}
```

---

## Phase 3: Component Migration

### Step 3.1: Reorganize Components

**Create new directory structure:**

```bash
# Create new component directories
mkdir -p components/Navigation
mkdir -p components/Landing
mkdir -p components/Dashboard
mkdir -p components/Scripts
mkdir -p components/Presets
mkdir -p components/Settings
mkdir -p components/Layouts
mkdir -p components/Shared
mkdir -p components/Demo
```

### Step 3.2: Create Navigation Components

**File:** `components/Navigation/PublicNavbar.tsx`

```typescript
'use client'

import Link from 'next/link'
import { useAuthStore } from '@/stores/useAuthStore'
import { AuthButton } from '@/components/auth/AuthButton'

export function PublicNavbar() {
  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Glean Teleprompter
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <Link href="/demo" className="text-gray-300 hover:text-white">
            Try Demo
          </Link>
          <Link href="/quickstart" className="text-gray-300 hover:text-white">
            Templates
          </Link>
        </div>
        
        <AuthButton />
      </div>
    </nav>
  )
}
```

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
    <aside className="w-64 border-r border-gray-800 bg-gray-950 p-6">
      <div className="mb-8">
        <Link href="/dashboard" className="text-xl font-bold">
          Glean
        </Link>
      </div>
      
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
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

### Step 3.3: Update Recordings Library

**Move and enhance:**

```bash
# Move existing component
mv components/teleprompter/RecordingsLibrary.tsx components/Recordings/RecordingsLibrary.tsx
```

**Update imports in the moved file:**

```typescript
// components/Recordings/RecordingsLibrary.tsx
// Add new props for filtering

interface RecordingsLibraryProps {
  className?: string
  showFilters?: boolean
  enableBulkActions?: boolean
  initialFilters?: RecordingFilters
}

interface RecordingFilters {
  quality?: 'standard' | 'high' | 'all'
  minDuration?: number
  maxDuration?: number
  dateFrom?: Date
  dateTo?: Date
}
```

---

## Phase 4: API Routes

### Step 4.1: Create Scripts API

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
  const limit = parseInt(searchParams.get('limit') || '20')
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
  
  const body = await request.json()
  
  const { data, error } = await supabase
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
  
  return NextResponse.json(data, { status: 201 })
}
```

### Step 4.2: Create Individual Script API

**File:** `app/api/scripts/[id]/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: script } = await supabase
    .from('scripts')
    .select('*')
    .eq('id', params.id)
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
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Verify ownership
  const { data: existing } = await supabase
    .from('scripts')
    .select('user_id')
    .eq('id', params.id)
    .single()
  
  if (!existing || existing.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('scripts')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Verify ownership
  const { data: existing } = await supabase
    .from('scripts')
    .select('user_id')
    .eq('id', params.id)
    .single()
  
  if (!existing || existing.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  const { error } = await supabase
    .from('scripts')
    .delete()
    .eq('id', params.id)
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return new NextResponse(null, { status: 204 })
}
```

### Step 4.3: Create Share API

**File:** `app/api/share/[shareId]/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { shareId: string } }
) {
  const supabase = await createClient()
  
  const { data: script, error } = await supabase
    .from('scripts')
    .select(`
      *,
      author:user_id(email, display_name, avatar_url)
    `)
    .eq('share_id', params.shareId)
    .eq('is_public', true)
    .single()
  
  if (error || !script) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  
  return NextResponse.json({
    share_id: params.shareId,
    script: {
      id: script.id,
      title: script.title,
      content: script.content,
      bg_url: script.bg_url,
      music_url: script.music_url,
      settings: script.settings
    },
    author: {
      display_name: script.author?.display_name,
      avatar_url: script.author?.avatar_url
    },
    shared_at: script.updated_at
  })
}
```

---

## Phase 5: Create New Pages

### Step 5.1: Create Dashboard

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
  
  // Fetch user stats
  const { data: stats } = await supabase
    .from('scripts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
  
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

### Step 5.2: Create Scripts Library

**File:** `app/dashboard/scripts/page.tsx`

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/Layouts/DashboardLayout'
import { ScriptsGrid } from '@/components/Scripts/ScriptsGrid'

export default async function ScriptsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  // Fetch scripts server-side for initial render
  const { data: scripts } = await supabase
    .from('scripts')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(20)
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Scripts</h1>
          <a
            href="/studio"
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            New Script
          </a>
        </div>
        
        <ScriptsGrid initialScripts={scripts || []} />
      </div>
    </DashboardLayout>
  )
}
```

---

## Phase 6: Testing

### Test Checklist

#### Route Testing
- [ ] `/` redirects authenticated users to `/dashboard`
- [ ] `/` shows landing page for visitors
- [ ] `/dashboard` requires authentication
- [ ] `/dashboard` redirects to login for unauthenticated users
- [ ] `/studio` accessible without authentication
- [ ] `/studio?script={id}` loads script correctly
- [ ] `/studio/share/{id}` works for public scripts
- [ ] Legacy `/?data=...` links still work

#### Component Testing
- [ ] Navigation components render correctly
- [ ] Dashboard sidebar shows active route
- [ ] Recordings library works in new location
- [ ] Save functionality works from `/studio`

#### API Testing
- [ ] `GET /api/scripts` returns user's scripts
- [ ] `POST /api/scripts` creates new script
- [ ] `PATCH /api/scripts/{id}` updates script
- [ ] `DELETE /api/scripts/{id}` deletes script
- [ ] `GET /api/share/{shareId}` returns public script

---

## Phase 7: Deployment

### Pre-Deployment Checklist

1. **Backup Database**
   ```bash
   # Export current database
   supabase db dump -f backup.sql
   ```

2. **Run Migrations**
   ```bash
   # Apply new migrations
   supabase db push
   ```

3. **Test in Staging**
   - Deploy to staging environment
   - Run full test suite
   - Verify all routes work correctly

4. **Prepare Rollback Plan**
   - Document rollback steps
   - Keep backup of current code

### Deployment Steps

1. **Deploy Database Changes**
   ```bash
   # Apply migrations to production
   supabase db push --linked
   ```

2. **Deploy Application Code**
   ```bash
   # Build and deploy
   npm run build
   # Deploy to your platform (Vercel, etc.)
   ```

3. **Verify Deployment**
   - Test all routes
   - Check authentication flows
   - Monitor error logs

4. **Monitor Metrics**
   - Watch for error spikes
   - Monitor page load times
   - Track user engagement

---

## Rollback Plan

If issues arise:

1. **Code Rollback**
   ```bash
   git revert <commit-hash>
   # Redeploy
   ```

2. **Database Rollback** (if needed)
   ```bash
   # Restore from backup
   supabase db reset --db-url "backup_connection_string"
   ```

3. **Communication**
   - Notify users of issues
   - Provide ETA for resolution

---

## Migration Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Database | 1 day | None |
| Phase 2: Routes | 2 days | Phase 1 |
| Phase 3: Components | 3 days | Phase 2 |
| Phase 4: API Routes | 2 days | Phase 1 |
| Phase 5: New Pages | 3 days | Phase 2, 3, 4 |
| Phase 6: Testing | 2 days | Phase 5 |
| Phase 7: Deployment | 1 day | Phase 6 |

**Total Estimated Time:** 14 days

---

## Potential Issues & Solutions

### Issue 1: Existing Shared Links Break

**Problem:** Users have shared links with old `/?data=...` format.

**Solution:** 
- Create `/studio/legacy` route to handle old format
- Implement redirect to new format
- Add migration script to convert old shares to new database-backed shares

### Issue 2: LocalStorage Scripts Lost

**Problem:** Scripts saved in localStorage won't be in database.

**Solution:**
- Add migration utility in `/dashboard` that reads localStorage
- Prompt users to migrate their local scripts
- Auto-migrate on first login after update

### Issue 3: Performance Issues with New Routes

**Problem:** Additional routes may slow down initial load.

**Solution:**
- Implement route-based code splitting
- Use dynamic imports for heavy components
- Add loading states and skeleton screens

### Issue 4: Authentication State Desync

**Problem:** Middleware and client auth state may get out of sync.

**Solution:**
- Use Supabase auth helpers consistently
- Implement auth state refresh on route change
- Add error boundaries for auth failures

---

## Post-Migration Tasks

1. **Analytics Setup**
   - Track page views
   - Monitor user flows
   - Measure conversion rates

2. **User Documentation**
   - Update help docs
   - Create migration guide for users
   - Add in-app tooltips for new features

3. **Performance Optimization**
   - Run Lighthouse audits
   - Optimize images and assets
   - Implement caching strategies

4. **User Feedback**
   - Collect feedback on new UX
   - Monitor support tickets
   - Iterate based on feedback
