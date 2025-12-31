# UX Flow Redesign - Documentation Index

This specification redesigns the user experience and navigation flow for the Glean Teleprompter application. The main issue is that the root page `/` directly loads the studio, which isn't ideal for UX. This proposal introduces a proper landing/dashboard page, maintains teleprompter functionality, and provides clear navigation between public features and authenticated user features.

## Quick Overview

### Current Problems
| Problem | Severity |
|---------|----------|
| Root path `/` directly loads studio | **High** |
| No landing page for new users | **High** |
| No user dashboard for authenticated users | **High** |
| Shared links go to root without context | **Medium** |
| No clear navigation between features | **High** |

### Proposed Solution
- Move studio from `/` to `/studio`
- Create landing page at `/` with proper onboarding
- Add user dashboard at `/dashboard`
- Introduce quickstart and demo modes
- Implement proper navigation structure

## Documentation Files

### 1. Architecture Overview
**File:** [`architecture.md`](./architecture.md)

The main architectural document containing:
- Current state analysis
- Proposed new route structure
- Detailed page specifications
- User flow diagrams
- Component reorganization
- Data model changes
- Implementation phases

**Key sections:**
- Route architecture with Mermaid diagrams
- 10 detailed page specifications
- Navigation patterns
- Authentication flow
- Implementation phases with priorities

### 2. Page-by-Page Requirements
**File:** [`page-specifications.md`](./page-specifications.md)

Detailed requirements for each page including:

| Page | Route | Priority |
|------|-------|----------|
| Landing Page | `/` | P0 |
| Quick Start | `/quickstart` | P0 |
| Demo Mode | `/demo` | P0 |
| User Dashboard | `/dashboard` | P0 |
| Scripts Library | `/dashboard/scripts` | P0 |
| Recordings Library | `/dashboard/recordings` | P0 |
| Presets Management | `/dashboard/presets` | P1 |
| Studio Page | `/studio` | P0 |
| Shared Script View | `/studio/share/[id]` | P0 |
| Settings Page | `/dashboard/settings` | P0 |

Each page includes:
- Functional requirements with priority levels
- Component specifications
- Mock data structures
- Layout designs
- Authentication behavior

### 3. API Specifications
**File:** [`api-specifications.md`](./api-specifications.md)

Complete API route documentation covering:

**New APIs:**
- `GET/POST /api/scripts` - List and create scripts
- `GET/PATCH/DELETE /api/scripts/[id]` - Script CRUD operations
- `POST /api/scripts/[id]/duplicate` - Duplicate a script
- `POST /api/scripts/[id]/share` - Generate share link
- `DELETE /api/scripts/[id]/share` - Revoke share link
- `GET/POST /api/presets` - List and create presets
- `GET/PATCH/DELETE /api/presets/[id]` - Preset operations
- `GET/PATCH/DELETE /api/user` - User profile
- `GET /api/user/stats` - User statistics
- `DELETE /api/user` - Delete account
- `GET /api/share/[shareId]` - Get shared script
- `POST /api/share/[shareId]/copy` - Copy shared script
- `GET /api/user/storage` - Storage usage
- `POST /api/user/storage/cleanup` - Clear old data

Each endpoint includes:
- HTTP method and path
- Authentication requirements
- Request/response examples
- Error responses
- Rate limiting information

### 4. Migration Guide
**File:** [`migration-guide.md`](./migration-guide.md)

Step-by-step migration instructions organized into 7 phases:

| Phase | Duration | Focus |
|-------|----------|-------|
| 1 | 1 day | Database changes (scripts table, user preferences) |
| 2 | 2 days | Route migration (middleware, move studio) |
| 3 | 3 days | Component reorganization |
| 4 | 2 days | API routes implementation |
| 5 | 3 days | Dashboard creation |
| 6 | 2 days | New pages (landing, quickstart, demo) |
| 7 | 1 day | Testing and deployment |

**Total Estimated Time:** 14 days

Includes:
- SQL migration scripts
- Route protection middleware
- Legacy shared link handling
- Rollback plan
- Potential issues and solutions

### 5. Implementation Guide
**File:** [`implementation-guide.md`](./implementation-guide.md)

Hands-on implementation instructions with:

**Phase-by-phase code:**
- Database setup with migration files
- Core routes and middleware
- Navigation components
- API route implementations
- Dashboard components
- New page implementations

**Quick start commands:**
```bash
# Database
supabase db reset

# Development
npm run dev

# Build
npm run build
```

**Testing checklist** for verifying:
- Routing works correctly
- Authentication flows
- Feature functionality
- Edge cases

## New Route Structure

```
/                          # → Landing page (NEW)
/quickstart                # → Quick start templates (NEW)
/demo                      # → Demo mode (NEW)
/studio                    # → Teleprompter editor (MOVED from /)
/studio/share/[id]         # → Shared scripts view (NEW)
/dashboard                 # → User dashboard (NEW)
/dashboard/scripts         # → Saved scripts library (NEW)
/dashboard/recordings      # → Recordings library (NEW)
/dashboard/presets         # → Custom presets (NEW)
/dashboard/settings        # → User settings (NEW)
/auth/login               # → Login (existing)
/auth/sign-up             # → Signup (existing)
```

## Component Reorganization

```
components/
├── Navigation/                    # NEW
│   ├── PublicNavbar.tsx
│   ├── DashboardSidebar.tsx
│   └── StudioTopbar.tsx
├── Landing/                       # NEW
│   ├── Hero.tsx
│   ├── FeatureCards.tsx
│   └── LandingPage.tsx
├── Dashboard/                     # NEW
│   ├── StatsCards.tsx
│   ├── RecentScripts.tsx
│   └── RecentRecordings.tsx
├── Scripts/                       # NEW
│   ├── ScriptsGrid.tsx
│   └── ScriptCard.tsx
├── Presets/                       # NEW
│   └── PresetsGrid.tsx
├── Settings/                      # NEW
│   └── ProfileSection.tsx
├── Layouts/                       # NEW
│   ├── PublicLayout.tsx
│   ├── DashboardLayout.tsx
│   └── StudioLayout.tsx
└── teleprompter/                  # EXISTING, enhanced
    ├── Editor.tsx                 # Updates for new routing
    ├── Runner.tsx                 # No changes needed
    └── RecordingsLibrary.tsx      # Moved to dashboard page
```

## Database Changes

### New Tables

**scripts table:**
```sql
CREATE TABLE scripts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  bg_url TEXT,
  music_url TEXT,
  settings JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  share_id UUID UNIQUE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**user_preferences table:**
```sql
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  default_font TEXT DEFAULT 'Classic',
  default_theme TEXT DEFAULT 'system',
  auto_save BOOLEAN DEFAULT true,
  -- ... more preferences
);
```

## User Flow Summary

```mermaid
graph LR
    A[Visitor] --> B[/]
    B -->|Try Demo| C[/demo]
    B -->|Start Writing| D[/quickstart]
    B -->|Sign Up| E[/auth/sign-up]
    
    C -->|Likes it| E
    D -->|Wants to save| E
    
    E --> F[/dashboard]
    F --> G[/studio]
    F --> H[/dashboard/scripts]
    F --> I[/dashboard/recordings]
    
    G -->|Share| J[/studio/share/id]
    J -->|Recipient| K[View & Copy]
```

## Breaking Changes

### 1. Root Path Changes
- **Before:** `/` → Studio editor
- **After:** `/` → Landing page, `/studio` → Studio editor
- **Migration:** Middleware handles redirect for authenticated users

### 2. Shared Link Format
- **Before:** `/?data=<compressed>`
- **After:** `/studio/share/<id>`
- **Migration:** `/studio/legacy` route handles old format during transition

## Open Questions

| Question | Options | Recommendation |
|----------|---------|----------------|
| Should `/` redirect to `/dashboard` for logged-in users? | Yes/No | Yes - personalized experience |
| Where are scripts currently saved? | localStorage/DB | Need to verify |
| Demo mode persistence? | Session/Permanent | Session (ephemeral) |
| Recording storage during demo? | Discard/Keep | Discard after session |

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Sign-up conversion | Unknown | 15% of demo users |
| Feature discovery | Unknown | 60% access dashboard |
| Return user rate | Unknown | 40% DAU/MAU |
| Time to first script | Unknown | < 2 minutes |

## Next Steps

1. **Review this proposal** with stakeholders
2. **Prioritize phases** based on business goals
3. **Create detailed tasks** from implementation guide
4. **Set up analytics** to measure baseline
5. **Begin Phase 1** (database setup)

## Related Specs

- [`001-camera-recording-widget/`](../001-camera-recording-widget/) - Camera integration features
- [`001-ui-config-system/`](../001-ui-config-system/) - UI configuration system

## Questions?

Refer to individual documents for detailed information:
- Architecture: [`architecture.md`](./architecture.md)
- Pages: [`page-specifications.md`](./page-specifications.md)
- API: [`api-specifications.md`](./api-specifications.md)
- Migration: [`migration-guide.md`](./migration-guide.md)
- Implementation: [`implementation-guide.md`](./implementation-guide.md)
