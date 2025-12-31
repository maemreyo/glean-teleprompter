# Page-by-Page Requirements

This document provides detailed specifications for each page in the redesigned teleprompter application.

## Table of Contents

1. [Landing Page (`/`)](#1-landing-page)
2. [Quick Start Page (`/quickstart`)](#2-quick-start-page)
3. [Demo Mode (`/demo`)](#3-demo-mode)
4. [User Dashboard (`/dashboard`)](#4-user-dashboard)
5. [Scripts Library (`/dashboard/scripts`)](#5-scripts-library)
6. [Recordings Library (`/dashboard/recordings`)](#6-recordings-library)
7. [Presets Management (`/dashboard/presets`)](#7-presets-management)
8. [Studio Page (`/studio`)](#8-studio-page)
9. [Shared Script View (`/studio/share/[id]`)](#9-shared-script-view)
10. [Settings Page (`/dashboard/settings`)](#10-settings-page)

---

## 1. Landing Page (`/`)

### Route
```
/                          # Root path
```

### File Location
```
app/page.tsx               # Landing page
components/Landing/        # Landing components
```

### Requirements

#### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| L-001 | Display app name, tagline, and value proposition | P0 |
| L-002 | Show "Try Demo" button linking to `/demo` | P0 |
| L-003 | Show "Start Writing" button linking to `/quickstart` | P0 |
| L-004 | Show "Sign Up" button linking to `/auth/sign-up` | P0 |
| L-005 | Display feature highlights section | P1 |
| L-006 | Show testimonials or use cases | P2 |
| L-007 | Redirect authenticated users to `/dashboard` | P0 |
| L-008 | Responsive design for mobile/tablet/desktop | P0 |

#### Content Sections

1. **Hero Section**
   - App name: "Glean Teleprompter"
   - Tagline: "Professional teleprompter for content creators"
   - Subheading: "Write, rehearse, and record your scripts with ease"
   - CTA buttons (primary: "Start Writing", secondary: "Try Demo")
   - Hero image or video preview

2. **Features Section** (3-4 cards)
   - Feature 1: "Smart Teleprompter"
     - Adjustable speed, fonts, colors
     - Mirror mode for reflectors
   - Feature 2: "Built-in Recording"
     - Record while you read
     - Camera overlay widget
   - Feature 3: "Cloud Sync"
     - Save scripts securely
     - Access from any device
   - Feature 4: "Custom Presets"
     - Save your favorite configurations
     - One-click apply

3. **Social Proof Section** (optional)
   - "Used by 10,000+ creators"
   - Testimonials from users
   - Trust badges

4. **CTA Section**
   - Final call to action
   - "Ready to start? Create your first script now"

#### Authentication Behavior

```typescript
// Pseudo-code for authentication handling
const LandingPage = () => {
  const { user, isLoading } = useAuthStore()
  
  if (isLoading) return <LoadingSpinner />
  if (user) redirect('/dashboard')
  
  return <LandingContent />
}
```

#### Components Needed

```
components/Landing/
├── Hero.tsx                 # Hero section with CTAs
├── FeatureCards.tsx         # Feature highlights
├── Testimonials.tsx         # Social proof (optional)
├── CTASection.tsx           # Bottom call to action
└── LandingPage.tsx          # Main container
```

#### Mock Data Structure

```typescript
interface Feature {
  id: string
  title: string
  description: string
  icon: LucideIcon
  comingSoon?: boolean
}

const features: Feature[] = [
  {
    id: 'teleprompter',
    title: 'Smart Teleprompter',
    description: 'Adjustable speed, fonts, colors, and mirror mode',
    icon: ScrollText
  },
  {
    id: 'recording',
    title: 'Built-in Recording',
    description: 'Record yourself while reading the script',
    icon: Video
  },
  // ...
]
```

---

## 2. Quick Start Page (`/quickstart`)

### Route
```
/quickstart                # Template selection page
```

### File Location
```
app/quickstart/page.tsx
components/QuickStart/
```

### Requirements

#### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| QS-001 | Display template selection grid | P0 |
| QS-001 | Show 5-7 pre-configured templates | P0 |
| QS-003 | "Use this template" opens `/studio` with pre-filled content | P0 |
| QS-004 | Show "Custom/Blank" template option | P0 |
| QS-005 | Display template preview/thumbnail | P1 |
| QS-006 | Show word count and estimated duration | P2 |
| QS-007 | No save capability for unauthenticated users | P0 |
| QS-008 | Show "Sign in to save" prompt when attempting to save | P0 |

#### Template Definitions

```typescript
interface ScriptTemplate {
  id: string
  name: string
  description: string
  category: 'business' | 'creative' | 'education' | 'blank'
  content: string
  settings: Partial<TeleprompterConfig>
  estimatedDuration: number // seconds
  thumbnail?: string
}

const templates: ScriptTemplate[] = [
  {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'Introduce your new product with impact',
    category: 'business',
    content: `// Product Launch Script Template

[Opening Hook]
In just 2 minutes, I'm going to show you something that will change how you...

[Problem Statement]
You know how frustrating it is when...

[Solution]
That's why we built...

[Demo]
Let me show you how it works...

[Call to Action]
Click the link below to...`,
    settings: {
      font: 'Modern',
      speed: 2,
      fontSize: 48
    },
    estimatedDuration: 120
  },
  {
    id: 'youtube-intro',
    name: 'YouTube Intro',
    description: 'Catchy video intro for your channel',
    category: 'creative',
    content: `// YouTube Intro Template

What's up everyone! Welcome back to the channel.

Today we're talking about...

Make sure to hit that subscribe button and ring the bell so you never miss an upload.

Let's dive in!`,
    settings: {
      font: 'Classic',
      speed: 2.5,
      fontSize: 52
    },
    estimatedDuration: 30
  },
  {
    id: 'podcast-script',
    name: 'Podcast Script',
    description: 'Structured podcast episode outline',
    category: 'creative',
    content: `// Podcast Episode Script

[Intro - 2 min]
- Welcome listeners
- Episode topic teaser
- Sponsor message (if applicable)

[Main Content - 15-20 min]
- Point 1: Explanation and examples
- Point 2: Personal story
- Point 3: Actionable tips

[Outro - 2 min]
- Key takeaways recap
- Call to action (subscribe/review)
- Next episode teaser`,
    settings: {
      font: 'Typewriter',
      speed: 2,
      fontSize: 44
    },
    estimatedDuration: 1200
  },
  {
    id: 'presentation-notes',
    name: 'Presentation Notes',
    description: 'Speaker notes for your presentation',
    category: 'business',
    content: `// Presentation Notes Template

[Slide 1: Title]
- Welcome everyone
- Introduce yourself
- State the presentation goal

[Slide 2: Agenda]
- Cover the three main points
- Mention timing

[Slide 3: Point 1]
- Explain the concept
- Give an example
- Transition to next point

...`,
    settings: {
      font: 'Classic',
      speed: 1.5,
      fontSize: 40
    },
    estimatedDuration: 600
  },
  {
    id: 'blank',
    name: 'Start from Scratch',
    description: 'Blank slate for your own content',
    category: 'blank',
    content: '',
    settings: {
      font: 'Classic',
      speed: 2,
      fontSize: 48
    },
    estimatedDuration: 0
  }
]
```

#### Components Needed

```
components/QuickStart/
├── TemplateGrid.tsx          # Grid of template cards
├── TemplateCard.tsx          # Individual template card
├── TemplatePreview.tsx       # Preview modal
├── CategoryFilter.tsx        # Filter by category
└── QuickStartPage.tsx        # Main container
```

#### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Glean Teleprompter                        [User Menu] [●]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Quick Start with Templates                                 │
│  Choose a template to get started faster                    │
│                                                              │
│  [All] [Business] [Creative] [Education]                    │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │Product     │  │YouTube     │  │Podcast     │           │
│  │Launch      │  │Intro       │  │Script      │           │
│  │2 min       │  │30 sec      │  │20 min      │           │
│  │[Use ✓]     │  │[Use ✓]     │  │[Use ✓]     │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│                                                              │
│  ┌────────────┐  ┌────────────┐                            │
│  │Presentation│  │Blank       │                            │
│  │Notes       │  │Scratch     │                            │
│  │10 min      │  │Custom      │                            │
│  │[Use ✓]     │  │[Use ✓]     │                            │
│  └────────────┘  └────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Demo Mode (`/demo`)

### Route
```
/demo                      # Demo mode with sample content
```

### File Location
```
app/demo/page.tsx
components/Demo/
```

### Requirements

#### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| D-001 | Pre-loaded demo script with realistic content | P0 |
| D-002 | Full teleprompter functionality available | P0 |
| D-003 | Sample background images and music pre-loaded | P0 |
| D-004 | Recordings discarded after session (not saved) | P0 |
| D-005 | Persistent "Sign up to save" banner | P0 |
| D-006 | Tutorial tooltips overlay (optional, can be dismissed) | P1 |
| D-007 | No database writes for any actions | P0 |
| D-008 | Clear indication of "Demo Mode" in UI | P0 |

#### Demo Content Configuration

```typescript
const demoConfig = {
  script: {
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
    font: 'Modern' as FontStyle,
    colorIndex: 2,
    speed: 2,
    fontSize: 48,
    align: 'center' as TextAlign
  },
  media: {
    bgUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=2500',
    musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' // Sample music
  },
  limits: {
    maxRecordingDuration: 60, // 60 seconds for demo
    warnBeforeSave: true
  }
}
```

#### Components Needed

```
components/Demo/
├── DemoBanner.tsx            # Persistent "Sign up to save" banner
├── TutorialTooltip.tsx       # Feature introduction tooltips
├── DemoProvider.tsx          # Context for demo mode
└── demoStore.ts              # Zustand store for demo state
```

#### Demo Banner Design

```
┌─────────────────────────────────────────────────────────────┐
│  🎮 Demo Mode    Sign up to save your scripts and recordings │
│              [Sign Up Free →]                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. User Dashboard (`/dashboard`)

### Route
```
/dashboard                 # Main user dashboard
```

### File Location
```
app/dashboard/page.tsx
components/Dashboard/
```

### Requirements

#### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| DB-001 | Display user stats (scripts, recordings, storage) | P0 |
| DB-002 | Show last 5 recently edited scripts | P0 |
| DB-003 | Show last 3 recently created recordings | P0 |
| DB-004 | Quick action buttons for common tasks | P0 |
| DB-005 | Storage quota indicator | P0 |
| DB-006 | Sidebar navigation to all dashboard sections | P0 |
| DB-007 | Welcome message with user's email/name | P0 |
| DB-008 | Mobile-responsive layout | P0 |

#### Layout Structure

```typescript
// Dashboard layout with sidebar
<DashboardLayout>
  {/* Sidebar - Fixed on desktop, collapsible on mobile */}
  <DashboardSidebar>
    <Logo />
    <NavLinks>
      <NavLink href="/dashboard" icon={HomeIcon} active>Overview</NavLink>
      <NavLink href="/dashboard/scripts" icon={FileTextIcon}>Scripts</NavLink>
      <NavLink href="/dashboard/recordings" icon={VideoIcon}>Recordings</NavLink>
      <NavLink href="/dashboard/presets" icon={PaletteIcon}>Presets</NavLink>
      <NavLink href="/dashboard/settings" icon={SettingsIcon}>Settings</NavLink>
    </NavLinks>
    <UserMenu />
  </DashboardSidebar>

  {/* Main content area */}
  <DashboardContent>
    <PageHeader>
      <Title>Welcome back!</Title>
      <QuickActions />
    </PageHeader>

    <StatsCards />

    <RecentScripts />

    <RecentRecordings />
  </DashboardContent>
</DashboardLayout>
```

#### Component Specifications

**StatsCards**
```typescript
interface UserStats {
  totalScripts: number
  totalRecordings: number
  totalPresets: number
  storageUsed: number
  storageLimit: number
}

const statsCards = [
  { label: 'Scripts', value: stats.totalScripts, icon: FileText, href: '/dashboard/scripts' },
  { label: 'Recordings', value: stats.totalRecordings, icon: Video, href: '/dashboard/recordings' },
  { label: 'Presets', value: stats.totalPresets, icon: Palette, href: '/dashboard/presets' },
  { label: 'Storage', value: `${(stats.storageUsed / 1024).toFixed(1)} GB`, icon: HardDrive, href: '/dashboard/settings' }
]
```

**QuickActions**
```typescript
const quickActions = [
  { label: 'New Script', icon: Plus, href: '/studio', primary: true },
  { label: 'New from Template', icon: LayoutTemplate, href: '/quickstart' },
  { label: 'Open Studio', icon: Clapperboard, href: '/studio' }
]
```

#### Data Requirements

```typescript
// API responses needed
interface DashboardData {
  user: {
    email: string
    displayName?: string
    avatarUrl?: string
    isPro: boolean
  }
  stats: UserStats
  recentScripts: ScriptSummary[]
  recentRecordings: RecordingSummary[]
}

interface ScriptSummary {
  id: string
  title: string
  preview: string // First 100 chars
  updatedAt: string
}

interface RecordingSummary {
  id: string
  thumbnailUrl: string
  duration: number
  createdAt: string
}
```

---

## 5. Scripts Library (`/dashboard/scripts`)

### Route
```
/dashboard/scripts         # Scripts management page
```

### File Location
```
app/dashboard/scripts/page.tsx
components/Scripts/
```

### Requirements

#### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| S-001 | Display all user scripts in grid/list view | P0 |
| S-002 | Search scripts by title/content | P0 |
| S-003 | Filter by date created/modified | P1 |
| S-004 | Sort by name, date, size | P1 |
| S-005 | Grid/list view toggle | P0 |
| S-006 | Script card with preview and actions | P0 |
| S-007 | Create new script button | P0 |
| S-008 | Pagination (20 per page) | P0 |
| S-009 | Delete script with confirmation | P0 |
| S-010 | Duplicate script | P1 |
| S-011 | Share script (generate link) | P1 |

#### Script Card Design

```
┌─────────────────────────────────────────┐
│  Product Launch Script                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  In just 2 minutes, I'm going to show   │
│  you something that will change...      │
│                                         │
│  📅 Edited 2 hours ago                  │
│                                         │
│  [Edit] [Duplicate] [Share] [•••]       │
└─────────────────────────────────────────┘
```

#### Actions

| Action | Behavior | Auth Required |
|--------|----------|---------------|
| Edit | Opens `/studio?script={id}` | Yes |
| Duplicate | Creates copy, opens `/studio` with new script | Yes |
| Share | Generates share link, shows modal | Yes |
| Delete | Confirmation dialog, then deletes | Yes |

#### Components Needed

```
components/Scripts/
├── ScriptsGrid.tsx           # Grid of script cards
├── ScriptsList.tsx           # List view alternative
├── ScriptCard.tsx            # Individual script card
├── ScriptActions.tsx         # Action buttons/dropdown
├── SearchBar.tsx             # Search input
├── ViewToggle.tsx            # Grid/list switcher
├── CreateScriptButton.tsx    # FAB or header button
└── ShareScriptModal.tsx      # Share link dialog
```

---

## 6. Recordings Library (`/dashboard/recordings`)

### Route
```
/dashboard/recordings      # Recordings management page
```

### File Location
```
app/dashboard/recordings/page.tsx
components/Recordings/  # Move existing RecordingsLibrary here
```

### Requirements

#### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| R-001 | Display paginated list of recordings (20 per page) | P0 |
| R-002 | Play recording in modal/player | P0 |
| R-003 | Download recording | P0 |
| R-004 | Delete recording with confirmation | P0 |
| R-005 | Storage quota indicator at top | P0 |
| R-006 | Filter by date range | P1 |
| R-007 | Filter by quality (standard/high) | P2 |
| R-008 | Filter by duration | P2 |
| R-009 | Sort by date, duration, size | P1 |
| R-010 | Bulk delete | P2 |
| R-011 | Download all (zip) | P2 |

#### Enhanced Features (New)

These are enhancements to the existing `RecordingsLibrary` component:

1. **Advanced Filters**
   - Date range picker
   - Quality filter (All / Standard / High)
   - Duration filter (< 1 min, 1-5 min, 5-10 min, 10+ min)

2. **Sorting Options**
   - Date (newest/oldest)
   - Duration (shortest/longest)
   - Size (smallest/largest)

3. **Bulk Actions**
   - Select multiple recordings
   - Bulk delete
   - Download selected as ZIP

#### Component Changes

```typescript
// Enhance existing RecordingsLibrary
interface RecordingsLibraryProps {
  // Existing props
  className?: string
  
  // New props
  showFilters?: boolean
  enableBulkActions?: boolean
  initialSort?: 'date' | 'duration' | 'size'
  initialSortOrder?: 'asc' | 'desc'
}

// New filters component
interface RecordingFilters {
  dateRange?: { start: Date; end: Date }
  quality?: 'standard' | 'high' | 'all'
  duration?: 'short' | 'medium' | 'long' | 'all'
}
```

---

## 7. Presets Management (`/dashboard/presets`)

### Route
```
/dashboard/presets         # Presets management page
```

### File Location
```
app/dashboard/presets/page.tsx
components/Presets/
```

### Requirements

#### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| P-001 | Display user-created presets in grid | P0 |
| P-002 | Show preset preview (thumbnail or live preview) | P0 |
| P-003 | Edit preset (opens config panel with preset loaded) | P0 |
| P-004 | Delete preset with confirmation | P0 |
| P-005 | Create new preset from current config | P0 |
| P-006 | Apply preset to current studio session | P1 |
| P-007 | Share preset (generate link) | P2 |
| P-008 | Import preset from file/link | P2 |
| P-009 | Show built-in presets (read-only) | P1 |

#### Preset Card Design

```
┌────────────────────────────────────┐
│  ┌──────────────────────────────┐ │
│  │   [Preview thumbnail]        │ │
│  │   or live preview of text    │ │
│  └──────────────────────────────┘ │
│  My Professional Look              │
│  Modern, 48px, Pink                │
│  Created Jan 15, 2025              │
│                                    │
│  [Apply] [Edit] [Share] [•••]     │
└────────────────────────────────────┘
```

#### Preset Data Structure

```typescript
interface Preset {
  id: string
  userId: string
  name: string
  description?: string
  config: TeleprompterConfig
  thumbnailUrl?: string
  isBuiltIn: boolean
  shareId?: string
  createdAt: string
  updatedAt: string
}

interface TeleprompterConfig {
  font: FontStyle
  colorIndex: number
  fontSize: number
  lineHeight: number
  margin: number
  align: TextAlign
  overlayOpacity: number
  // Animation settings (if applicable)
}
```

#### Components Needed

```
components/Presets/
├── PresetsGrid.tsx            # Grid of preset cards
├── PresetCard.tsx             # Individual preset card
├── PresetPreview.tsx          # Live preview component
├── CreatePresetDialog.tsx     # Create from current config
├── SharePresetModal.tsx       # Share link dialog
└── ImportPresetDialog.tsx     # Import from file/link
```

---

## 8. Studio Page (`/studio`)

### Route
```
/studio                    # Main teleprompter editor (moved from /)
/studio?script={id}       # Edit specific script
/studio/running           # Runner mode (can be implicit)
```

### File Location
```
app/studio/
├── page.tsx              # Editor mode
├── running/page.tsx      # Runner mode (optional, can be implicit)
components/teleprompter/
├── Editor.tsx            # Existing, enhance
├── Runner.tsx            # Existing
```

### Requirements

#### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| ST-001 | Full editing interface for teleprompter content | P0 |
| ST-002 | Load script from URL parameter if provided | P0 |
| ST-003 | Unauthenticated users can edit, save prompts login | P0 |
| ST-004 | Authenticated users have auto-save to cloud | P0 |
| ST-005 | "Unsaved changes" warning when leaving | P0 |
| ST-006 | Breadcrumb navigation back to dashboard | P0 |
| ST-007 | Remove shared link URL parsing (moved to dedicated route) | P0 |
| ST-008 | Support both `?script={id}` and legacy `?data={compressed}` | P0 |

#### Changes from Current Implementation

1. **Remove Shared Link Logic**
   ```typescript
   // Current app/page.tsx has this:
   const data = searchParams.get('data')
   if (data) {
     // Decompress and load shared link
   }
   
   // NEW: Move this to /studio/share/[id]
   // Studio only loads from ?script={id} parameter
   ```

2. **Add Navigation**
   ```typescript
   <StudioTopbar>
     <Logo href="/dashboard" />
     <Breadcrumb>
       <Link href="/dashboard">Dashboard</Link>
       <span>Studio</span>
     </Breadcrumb>
     <SaveIndicator status={saveStatus} />
     <UserMenu />
   </StudioTopbar>
   ```

3. **Script Loading**
   ```typescript
   // Load script on mount
   useEffect(() => {
     const scriptId = searchParams.get('script')
     if (scriptId) {
       loadScript(scriptId)
     } else {
       // Start fresh or load from localStorage
       loadLocalDraft()
     }
   }, [searchParams])
   ```

4. **Auto-save Behavior**
   ```typescript
   // For authenticated users
   useEffect(() => {
     if (!user) return
     
     const timer = setInterval(async () => {
       if (hasUnsavedChanges) {
         await saveToCloud()
       }
     }, 30000) // Auto-save every 30 seconds
     
     return () => clearInterval(timer)
   }, [user, hasUnsavedChanges])
   ```

#### Component Enhancements

```typescript
// Enhanced Editor component
interface EditorProps {
  // Existing props
  className?: string
  
  // New props
  scriptId?: string
  onSave?: (script: Script) => Promise<void>
  autoSave?: boolean
  showUnsavedWarning?: boolean
}
```

---

## 9. Shared Script View (`/studio/share/[id]`)

### Route
```
/studio/share/[id]          # View shared script by ID
/studio/legacy?data=...    # Support old format during transition
```

### File Location
```
app/studio/share/[id]/page.tsx
app/studio/legacy/page.tsx
components/Shared/
```

### Requirements

#### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| SH-001 | Load shared script by share ID | P0 |
| SH-002 | Display in read-only mode by default | P0 |
| SH-003 | Show "Copy to my scripts" button (requires auth) | P0 |
| SH-004 | Show "Use as template" button | P0 |
| SH-005 | Display script metadata (author, date, description) | P0 |
| SH-006 | Support legacy compressed URL format | P0 |
| SH-007 | Handle expired/deleted shares gracefully | P0 |
| SH-008 | "Remix" option (create copy with modifications) | P1 |

#### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [← Back] Glean Teleprompter - Shared Script                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Product Launch Script                              │   │
│  │  Shared by john@example.com on Jan 15, 2025         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Read Only View]                                    │   │
│  │                                                      │   │
│  │  // Product Launch Script Template                  │   │
│  │                                                      │   │
│  │  [Opening Hook]                                      │   │
│  │  In just 2 minutes...                               │   │
│  │                                                      │   │
│  │  ...                                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  [Use as Template] [Copy to My Scripts] [Remix]             │
└─────────────────────────────────────────────────────────────┘
```

#### Component Specifications

```typescript
interface SharedScriptPageProps {
  params: { id: string }
}

interface SharedScriptData {
  id: string
  shareId: string
  title: string
  content: string
  config: TeleprompterConfig
  author: {
    email: string
    displayName?: string
  }
  createdAt: string
  expiresAt?: string
}
```

---

## 10. Settings Page (`/dashboard/settings`)

### Route
```
/dashboard/settings        # User settings page
```

### File Location
```
app/dashboard/settings/page.tsx
components/Settings/
```

### Requirements

#### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| SET-001 | Profile section (email, display name, avatar) | P0 |
| SET-002 | Subscription section (plan details, upgrade/downgrade) | P0 |
| SET-003 | Preferences section (defaults, theme) | P0 |
| SET-004 | Storage management (view usage, cleanup) | P0 |
| SET-005 | Danger zone (delete account, clear data) | P0 |
| SET-006 | Tabbed or sectioned layout | P0 |
| SET-007 | Save changes with visual feedback | P0 |

#### Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│  ← Dashboard                    Settings                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┬─────────────────────────────────────────────┐  │
│  │Profile │  Profile                                      │  │
│  │        │  ────────────────────────────────────────    │  │
│  │        │  Email: john@example.com                    │  │
│  │Subscrip│  Display Name: John Doe              [Edit] │  │
│  │ption   │                                               │  │
│  │        │  ────────────────────────────────────────    │  │
│  │Prefer  │  [Save Changes]                             │  │
│  │ences   │                                               │  │
│  │        │                                               │  │
│  │Storage │                                               │  │
│  │        │                                               │  │
│  │Danger  │                                               │  │
│  │Zone    │                                               │  │
│  └─────────┴─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### Settings Sections

**1. Profile**
- Email (read-only, managed by Supabase)
- Display name (editable)
- Avatar URL (editable, upload to storage)
- Timezone preference

**2. Subscription**
- Current plan (Free / Pro)
- Plan features comparison
- Upgrade button (if Free)
- Manage subscription link (if Pro)
- Billing history

**3. Preferences**
```typescript
interface UserPreferences {
  defaultFont: FontStyle
  defaultFontSize: number
  defaultTheme: 'light' | 'dark' | 'system'
  autoSave: boolean
  autoSaveInterval: number // seconds
  defaultSpeed: number
  mirrorModeDefault: boolean
}
```

**4. Storage**
- Storage usage bar (reuse `StorageQuota` component)
- Breakdown by type (scripts, recordings, presets)
- "Clear old recordings" button
- "Download all data" button

**5. Danger Zone**
- Delete account button
- Clear all data button
- Both require password confirmation

#### Components Needed

```
components/Settings/
├── SettingsLayout.tsx        # Layout with sidebar/tabs
├── ProfileSection.tsx        # Profile settings
├── SubscriptionSection.tsx   # Plan and billing
├── PreferencesSection.tsx    # User preferences form
├── StorageSection.tsx        # Storage management
├── DangerZone.tsx            # Account deletion
└── DeleteAccountDialog.tsx   # Confirmation dialog
```

---

## Shared Components

### Navigation Components

```
components/Navigation/
├── PublicNavbar.tsx          # Landing, demo, quickstart nav
├── DashboardSidebar.tsx      # Dashboard sidebar
├── StudioTopbar.tsx          # Studio top navigation
├── UserMenu.tsx              # User dropdown menu
└── Breadcrumb.tsx            # Breadcrumb navigation
```

### Layout Components

```
components/Layouts/
├── PublicLayout.tsx          # Layout for public pages
├── DashboardLayout.tsx       # Layout for dashboard pages
└── StudioLayout.tsx          # Layout for studio
```

---

## Route Protection

### Middleware Configuration

```typescript
// middleware.ts
export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    // Optional auth routes
    '/studio/:path*',
    // Exclude API routes and static files
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
```

### Route Categories

| Category | Routes | Auth Behavior |
|----------|--------|---------------|
| Public | `/`, `/demo`, `/quickstart`, `/auth/*` | No auth required |
| Protected | `/dashboard/*` | Auth required, redirect to login |
| Optional Auth | `/studio/*`, `/studio/share/*` | Works without auth, enhanced with auth |

---

## Data Loading Strategies

### Server Components vs Client Components

| Page | Rendering | Data Loading |
|------|-----------|--------------|
| Landing | SSR | Static content |
| Dashboard | SSR | Server-side auth check, data fetch |
| Scripts | SSR | Server-side scripts list |
| Recordings | CSR (or SSR) | Client-side fetch for pagination |
| Studio | CSR | Client-side state management |
| Share | SSR | Server-side share lookup |

---

## Accessibility Requirements

All pages must:
- Support keyboard navigation
- Have proper ARIA labels
- Meet WCAG 2.1 AA standards
- Support screen readers
- Have sufficient color contrast
- Support reduced motion preferences

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.5s |
| Cumulative Layout Shift | < 0.1 |
| First Input Delay | < 100ms |
