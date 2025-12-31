# Teleprompter App UX Flow Redesign

## Executive Summary

This document proposes a comprehensive redesign of the teleprompter application's user flow and navigation structure. The current implementation loads the studio interface directly at the root path (`/`), which creates poor UX for new users and lacks proper separation between public and authenticated features.

## Current State Analysis

### Problems Identified

| Problem | Impact | Severity |
|---------|--------|----------|
| Root path `/` directly loads studio | No onboarding, confusing for first-time users | **High** |
| No landing page | Users don't understand what the app does | **High** |
| No user dashboard | Authenticated users have no home base | **High** |
| Shared links go to root | No context when opening shared content | **Medium** |
| No clear navigation | Users can't discover features | **High** |
| Recordings library buried | Hard to find saved content | **Medium** |

### Current Route Structure

```
/                          # → Loads Editor/Runner directly (PROBLEM)
/auth/login               # Login page
/auth/sign-up             # Registration page
/auth/forgot-password     # Password reset
/auth/update-password     # Password update
/auth/error               # Auth error page
/auth/callback            # OAuth callback
/auth/confirm             # Email confirmation
/protected                # Placeholder (not used)
/api/...                  # API routes
```

## Proposed New Structure

### Route Architecture

```mermaid
graph TD
    Root[/] --> Landing[Landing Page]
    Root --> Studio[Studio]
    Root --> Dashboard[Dashboard]
    
    Landing -->|Public Features| QuickStart[Quick Start]
    Landing -->|Public Features| Demo[Demo Mode]
    Landing -->|Auth| Login[Login/Signup]
    
    Dashboard -->|Auth Required| Scripts[My Scripts]
    Dashboard -->|Auth Required| Recordings[Recordings Library]
    Dashboard -->|Auth Required| Presets[My Presets]
    Dashboard -->|Auth Required| Settings[Settings]
    
    Studio -->|Auth Optional| Editor[Editor]
    Studio -->|Auth Optional| Runner[Runner]
    Studio -->|Auth Optional| Share[Shared View]
    
    Login -->|After Auth| Dashboard
    Login -->|Direct Access| Studio
```

### New Route Map

```
/                          # → Landing page (NEW)
/quickstart                # → Quick start template (NEW)
/demo                      # → Demo mode with sample script (NEW)
/studio                    # → Teleprompter editor (MOVED from /)
/studio/running            # → Runner mode (explicit URL)
/studio/share/[id]         # → Shared scripts view (NEW)
/dashboard                 # → User dashboard (NEW)
/dashboard/scripts         # → Saved scripts library (NEW)
/dashboard/recordings      # → Recordings library (NEW)
/dashboard/presets         # → Custom presets (NEW)
/dashboard/settings        # → User settings (NEW)
/auth/login               # → Login (existing)
/auth/sign-up             # → Signup (existing)
/auth/forgot-password     # → Password reset (existing)
/auth/update-password     # → Password update (existing)
```

## Detailed Page Specifications

### 1. Landing Page (`/`) - NEW

**Purpose:** Introduce the app, explain value proposition, guide users to relevant features.

**Components:**
- Hero section with app name and tagline
- Feature highlights (teleprompter, recording, presets)
- Call-to-action buttons:
  - "Start Writing" (unauthenticated → `/quickstart`)
  - "Open Studio" (authenticated → `/studio`)
  - "Try Demo" (public → `/demo`)
- Feature showcase section
- Testimonials or use cases
- Footer with links

**Authentication State Behavior:**
- **Logged out:** Full landing page with CTAs for signup
- **Logged in:** Redirect to `/dashboard` or show personalized greeting with "Continue to Studio" CTA

### 2. Quick Start Page (`/quickstart`) - NEW

**Purpose:** Fast onboarding for new users without authentication.

**Features:**
- Pre-loaded template scripts
- Simple template selector
- One-click "Use this template" → redirects to `/studio` with pre-filled content
- No save capability (shows "Sign in to save" prompt)
- Exit prompt to encourage signup

**Templates:**
- Product Launch Script
- YouTube Video Intro
- Presentation Notes
- Podcast Script
- Custom/Blank

### 3. Demo Mode (`/demo`) - NEW

**Purpose:** Let users test all features without commitment.

**Features:**
- Pre-configured demo script with sample content
- Full teleprompter functionality
- Sample background images and music
- "Try Recording" with demo mode ( recordings discarded after session )
- Persistent "Sign up to save your work" banner
- Tutorial tooltips overlay

### 4. User Dashboard (`/dashboard`) - NEW

**Purpose:** Home base for authenticated users to access all their content.

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Glean Teleprompter                    [User Menu] [●] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Welcome back, [User]!                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Scripts  │  │Recordings│  │ Presets  │             │
│  │   12     │  │    8     │  │    3     │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Recent Scripts (last 5)                        │   │
│  │  ┌──────────────────┐  ┌──────────────────┐    │   │
│  │  │ Product Launch   │  │ Podcast Ep 42    │    │   │
│  │  │ Last edited 2h   │  │ Last edited 1d   │    │   │
│  │  └──────────────────┘  └──────────────────┘    │   │
│  │  [View All Scripts →]                          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Recent Recordings (last 3)                     │   │
│  │  [thumbnails with quick actions]                 │   │
│  │  [View All Recordings →]                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Quick Actions                                  │   │
│  │  [New Script] [New from Template] [Open Studio] │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Sections:**
1. **Stats Overview**: Script count, recording count, storage used
2. **Recent Scripts**: Quick access to last 5 edited scripts
3. **Recent Recordings**: Quick access to last 3 recordings
4. **Quick Actions**: High-frequency actions
5. **Storage Quota**: Visual indicator (reuse existing `StorageQuota`)

**Navigation Sidebar:**
```typescript
const dashboardNav = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  { name: 'Scripts', href: '/dashboard/scripts', icon: FileTextIcon },
  { name: 'Recordings', href: '/dashboard/recordings', icon: VideoIcon },
  { name: 'Presets', href: '/dashboard/presets', icon: PaletteIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
]
```

### 5. Scripts Library (`/dashboard/scripts`) - NEW

**Purpose:** Manage saved scripts.

**Features:**
- Grid/list view toggle
- Search and filter
- Script cards with:
  - Title (first 30 chars of content)
  - Last edited date
  - Quick actions: Edit, Duplicate, Delete, Share
- Create new script button
- Folder organization (future enhancement)
- Bulk actions (future)

**Script Actions:**
- **Edit**: Opens script in `/studio` with script loaded
- **Duplicate**: Creates copy, opens in `/studio`
- **Delete**: Confirmation dialog, then removes
- **Share**: Generates shareable link → `/studio/share/[id]`

### 6. Recordings Library (`/dashboard/recordings`) - ENHANCED

**Current location:** Component exists but no dedicated page

**Changes:**
- Move `RecordingsLibrary` component to dedicated page
- Add filters (date range, quality, duration)
- Add bulk delete
- Better pagination
- Search functionality
- Storage management actions (download all, cleanup old)

### 7. Presets Management (`/dashboard/presets`) - NEW

**Purpose:** Manage custom configuration presets.

**Features:**
- List of user-created presets
- Preset cards with preview thumbnail
- Edit/Delete actions
- Create new preset from current config
- Import/Export presets (future)
- Share presets (generate share link)

### 8. Studio Page (`/studio`) - MOVED from `/`

**Purpose:** Main teleprompter editing interface.

**Changes from current `/` page:**
1. Remove shared link logic (move to `/studio/share/[id]`)
2. Add authentication check for save functionality
3. Add "unsaved changes" warning when leaving
4. Improve navigation breadcrumbs
5. Add "Back to Dashboard" button for authenticated users

**Authentication Behavior:**
- **Unauthenticated:** Full editing experience, save shows login prompt
- **Authenticated:** Full experience with cloud save, shows "Saving to cloud" indicator

**URL States:**
- `/studio` → Editor mode (setup)
- `/studio?script=[id]` → Editor with saved script loaded
- `/studio/running` → Runner mode (teleprompter active)

### 9. Shared Script View (`/studio/share/[id]`) - NEW

**Purpose:** View and use shared scripts without authentication.

**Features:**
- Read-only mode by default
- "Copy to my scripts" (requires auth)
- "Use as template" → opens in `/studio`
- Share metadata (created by, date, description)
- Option to "remix" (create copy with modifications)

**URL Structure:**
- Compressed data URL (current implementation): `/studio/share?data=...`
- Database-backed share: `/studio/share/[uuid]` (better for analytics, expiration)

### 10. Settings Page (`/dashboard/settings`) - NEW

**Purpose:** User account and app settings.

**Sections:**
1. **Profile**: Email, display name, avatar
2. **Subscription**: Plan details, upgrade/downgrade, billing
3. **Preferences**: 
   - Default font
   - Default theme (light/dark)
   - Auto-save toggle
   - Storage management
4. **Integrations**: (future) Google Drive, Dropbox sync
5. **Danger Zone**: Delete account, clear all data

## User Flow Diagrams

### New User Flow

```mermaid
flowchart TD
    A[Visitor arrives at /] --> B{Interested?}
    B -->|Yes| C{Want to try now?}
    B -->|Maybe| D[Read features]
    D --> C
    
    C -->|Quick test| E[/demo]
    C -->|Start writing| F[/quickstart]
    C -->|Sign up| G[/auth/sign-up]
    
    E -->|Likes it| H{Sign up?}
    F -->|Wants to save| I[Sign in prompt]
    
    H -->|Yes| G
    H -->|No| J[Continue in demo]
    
    I --> G
    G --> K[/dashboard]
    J --> E
    
    K --> L[Explore features]
    L --> M[/studio]
    M --> N[Create content]
```

### Returning User Flow

```mermaid
flowchart TD
    A[User logged in] --> B[/dashboard]
    B --> C{What to do?}
    
    C -->|New script| D[/studio]
    C -->|Continue script| E[Click recent script]
    C -->|View recordings| F[/dashboard/recordings]
    C -->|Manage presets| G[/dashboard/presets]
    C -->|Settings| H[/dashboard/settings]
    
    E --> D
    D --> I[Edit/Run teleprompter]
    F --> J[Watch/Download]
    G --> K[Configure presets]
    
    I --> L{Save?}
    L -->|Yes| M[Script saved]
    L -->|No| N[Discard]
    
    M --> B
    N --> B
```

### Sharing Flow

```mermaid
flowchart TD
    A[User in /studio] --> B[Click Share]
    B --> C{Signed in?}
    C -->|No| D[Sign in prompt]
    C -->|Yes| E[Generate share link]
    
    D --> F[User signs in]
    F --> E
    
    E --> G[Copy link]
    G --> H[Send to recipient]
    
    H --> I[Recipient opens link]
    I --> J[/studio/share/id]
    J --> K{Recipient wants to save?}
    
    K -->|Yes| L[Sign in/sign up]
    K -->|No| M[View only]
    K -->|Remix| N[/studio with copy]
    
    L --> N
```

## Navigation Architecture

### Global Navigation

**Public Pages (Landing, Demo, Quickstart):**
```typescript
// Simplified top nav
<header>
  <Logo />
  <nav>
    <Link href="/demo">Try Demo</Link>
    <Link href="/quickstart">Templates</Link>
  </nav>
  <AuthCTA /> {/* Login/Signup buttons or user avatar */}
</header>
```

**Authenticated Pages (Dashboard, Studio):**
```typescript
// Dashboard layout with sidebar
<DashboardLayout>
  <Sidebar>
    <Logo />
    <NavLinks />
    <UserMenu />
  </Sidebar>
  <MainContent>
    {/* Page content */}
  </MainContent>
</DashboardLayout>

// Studio layout (immersive, minimal nav)
<StudioLayout>
  <TopBar>
    <Logo />
    <Breadcrumbs />
    <SaveIndicator />
    <UserMenu />
  </TopBar>
  <StudioContent />
</StudioLayout>
```

### Shared Navigation Component

Create `components/Navigation/`:
- `PublicNavbar.tsx` - For landing, demo, quickstart
- `DashboardSidebar.tsx` - For dashboard and subpages
- `StudioTopbar.tsx` - Minimal nav for studio
- `UserMenu.tsx` - Dropdown with profile, settings, logout

## Authentication Flow

### Protected Routes Middleware

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public routes (no auth required)
  const publicRoutes = ['/', '/demo', '/quickstart', '/auth/login', '/auth/sign-up']
  
  // Protected routes (auth required)
  const protectedRoutes = ['/dashboard', '/dashboard/scripts', '/dashboard/recordings', '/dashboard/presets', '/dashboard/settings']
  
  // Optional auth routes (work without auth, better with auth)
  const optionalAuthRoutes = ['/studio']
  
  const token = request.cookies.get('sb-access-token')
  const isAuthenticated = !!token
  
  // Redirect to login if accessing protected route without auth
  if (protectedRoutes.some(path => pathname.startsWith(path)) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // Redirect to dashboard if accessing login while already authenticated
  if ((pathname === '/auth/login' || pathname === '/auth/sign-up') && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}
```

## Component Reorganization

### Current Structure Issues

```
components/
├── teleprompter/
│   ├── Editor.tsx       # Currently at root level
│   ├── Runner.tsx       # Currently at root level
│   ├── RecordingsLibrary.tsx  # No dedicated page
│   └── config/
```

### Proposed New Structure

```
components/
├── Navigation/
│   ├── PublicNavbar.tsx        # NEW
│   ├── DashboardSidebar.tsx    # NEW
│   ├── StudioTopbar.tsx        # NEW
│   └── UserMenu.tsx            # NEW
├── Landing/
│   ├── Hero.tsx                # NEW
│   ├── FeatureShowcase.tsx     # NEW
│   ├── TemplateSelector.tsx    # NEW
│   └── CTAButtons.tsx          # NEW
├── Dashboard/
│   ├── StatsCards.tsx          # NEW
│   ├── RecentScripts.tsx       # NEW
│   ├── RecentRecordings.tsx    # NEW
│   ├── QuickActions.tsx        # NEW
│   └── DashboardLayout.tsx     # NEW
├── Scripts/
│   ├── ScriptsGrid.tsx         # NEW
│   ├── ScriptCard.tsx          # NEW
│   └── ScriptActions.tsx       # NEW
├── Presets/
│   ├── PresetsGrid.tsx         # NEW
│   ├── PresetCard.tsx          # NEW
│   └── CreatePresetDialog.tsx  # Extract from existing
├── Settings/
│   ├── ProfileSection.tsx      # NEW
│   ├── SubscriptionSection.tsx # NEW
│   ├── PreferencesSection.tsx  # NEW
│   └── DangerZone.tsx          # NEW
└── teleprompter/
    ├── Editor.tsx              # KEEP, enhance
    ├── Runner.tsx              # KEEP
    ├── RecordingsLibrary.tsx   # MOVE to /dashboard/recordings
    └── SharedScriptView.tsx    # NEW for shared links
```

## Data Model Changes

### New Tables Required

```sql
-- Scripts table (if not exists)
CREATE TABLE scripts (
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
CREATE INDEX idx_scripts_user_id ON scripts(user_id);
CREATE INDEX idx_scripts_share_id ON scripts(share_id);
CREATE INDEX idx_scripts_updated_at ON scripts(updated_at DESC);

-- RLS Policies
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;

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
```

## API Route Changes

### New API Routes

```
/api/scripts/
  GET    - List user's scripts (paginated)
  POST   - Create new script

/api/scripts/[id]/
  GET    - Get single script
  PATCH  - Update script
  DELETE - Delete script

/api/scripts/[id]/share/
  POST   - Generate or update share link
  DELETE - Remove public share

/api/share/[shareId]/
  GET    - Get public script by share ID

/api/presets/
  GET    - List user's presets
  POST   - Create preset

/api/presets/[id]/
  GET    - Get single preset
  PATCH  - Update preset
  DELETE - Delete preset

/api/user/
  GET    - Get user profile
  PATCH  - Update user profile

/api/user/storage/
  GET    - Get storage usage stats
  DELETE - Clear old recordings
```

## Implementation Phases

### Phase 1: Foundation (Priority: HIGH)
1. Create landing page at `/`
2. Create dashboard layout at `/dashboard`
3. Move studio from `/` to `/studio`
4. Add middleware for route protection
5. Create navigation components

### Phase 2: Dashboard Features (Priority: HIGH)
1. Build dashboard overview with stats
2. Create scripts library page
3. Move recordings library to dedicated page
4. Add recent scripts/recordings sections

### Phase 3: Enhanced Features (Priority: MEDIUM)
1. Create quickstart page with templates
2. Create demo mode
3. Build presets management page
4. Implement shared script view

### Phase 4: Polish (Priority: LOW)
1. Build settings page
2. Add search and filtering
3. Implement advanced sharing features
4. Add onboarding tour

## Migration Strategy

### Breaking Changes

1. **Root path changes:**
   - Old: `/` → Studio
   - New: `/` → Landing
   - **Impact:** Existing bookmarks/shared links break
   - **Mitigation:** Add redirect from `/` to `/studio` for authenticated users with certain conditions

2. **Shared link format:**
   - Old: `/?data=<compressed>`
   - New: `/studio/share/<id>`
   - **Impact:** Old shared links stop working
   - **Mitigation:** Support both formats during transition period

### Redirect Strategy

```typescript
// app/page.tsx - Handle legacy redirects
export default function RootPage() {
  const { user } = useAuthStore()
  const searchParams = useSearchParams()
  const legacyData = searchParams.get('data')
  
  // Legacy shared link - redirect to new format
  if (legacyData) {
    redirect(`/studio/legacy?data=${legacyData}`)
  }
  
  // Authenticated user with no specific intent → dashboard
  if (user) {
    redirect('/dashboard')
  }
  
  // New/visitor → landing page
  return <LandingPage />
}
```

## Open Questions

1. **Default experience for authenticated users:**
   - Should `/` redirect to `/dashboard` for logged-in users?
   - Or should landing page show personalized version?

2. **Script storage:**
   - Where are scripts currently saved? Need to verify database schema.
   - Migration needed if using localStorage currently.

3. **Presets ownership:**
   - Are presets user-specific or global?
   - Need to clarify preset data model.

4. **Demo mode persistence:**
   - Should demo state persist across sessions?
   - Recommendation: No, keep it ephemeral to encourage signup.

5. **Mobile experience:**
   - Dashboard sidebar may need responsive treatment
   - Studio editing on mobile needs consideration

## Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Sign-up conversion | Unknown | 15% of demo users | Analytics |
| Feature discovery | Unknown | 60% access dashboard | Analytics |
| Return user rate | Unknown | 40% DAU/MAU | Analytics |
| Time to first script | Unknown | < 2 minutes | Analytics |
| Scripts created per user | Unknown | > 3/month | Database query |

## Next Steps

1. **Review this proposal** with stakeholders
2. **Prioritize phases** based on business goals
3. **Create detailed specs** for each new page
4. **Set up analytics** to measure current baseline
5. **Begin Phase 1 implementation**
