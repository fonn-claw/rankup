# Phase 1: Foundation - Research

**Researched:** 2026-04-01
**Domain:** Next.js 16 App Router, Neon Postgres, Authentication, Design System
**Confidence:** HIGH

## Summary

Phase 1 establishes the entire application foundation: Next.js 16 project setup, Neon Postgres database with Drizzle ORM, cookie-based authentication with 3 demo accounts, and the dark scoreboard design system shell. This is a greenfield project with 24 pre-generated assets ready to integrate.

The critical technical finding is that **Next.js 16 renames middleware.ts to proxy.ts** -- the `proxy` function replaces the `middleware` export, runs on Node.js runtime (not Edge), and the old convention is deprecated. This directly affects the auth route-protection implementation. Additionally, **Tailwind CSS v4 uses CSS-based configuration via `@theme` directives** instead of `tailwind.config.js`, which changes how the design system tokens are defined.

**Primary recommendation:** Use Next.js 16 with proxy.ts for route protection, iron-session v8 for cookie-based sessions, Drizzle ORM with neon-http driver for serverless Postgres, and Tailwind CSS v4 with `@theme` for the design system tokens.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Full-screen dark login page with hero-login.png background, centered form, logo.svg, inline errors, no registration
- Cookie-based sessions (not JWT), unauthorized redirects to /login with return URL
- Role-based routing: Rep -> /board, Manager -> /board (with manager banner), Admin -> /admin
- Top bar: 48px, logo left, 3 tabs center (LIVE BOARD | BATTLES | CHALLENGES), user/streak right, LIVE indicator
- No sidebar -- full-width stacked layout
- SVG icons as React components for inline rendering; PNGs via next/image or CSS background
- Neon Postgres with @neondatabase/serverless driver, Drizzle ORM
- Tables: users (with role enum), teams/pods, schema stubs for activities/battles/challenges
- Demo accounts seeded: rep@rankup.app, manager@rankup.app, admin@rankup.app (password: demo1234)
- Password hashing with bcrypt
- Tailwind CSS with custom theme tokens, NO component library
- CSS custom properties for tier colors and neon glow effects
- Exact color tokens defined (bg-primary #0A0E17 through tier-bronze #CD7F32)
- Fonts: Barlow Condensed (600, 700) and JetBrains Mono (400, 500) via next/font

### Claude's Discretion
- Exact Tailwind config structure and utility class naming
- Loading/skeleton states for the shell
- Error boundary implementation details
- Drizzle migration strategy

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can log in with email and password (3 demo accounts) | iron-session v8 + server actions, bcryptjs for password verification, seed script for demo accounts |
| AUTH-02 | User session persists across browser refresh via secure cookies | iron-session encrypted cookie sessions, getIronSession(cookies(), options) pattern |
| AUTH-03 | User can log out from any page | iron-session session.destroy() in server action, top bar logout button |
| AUTH-04 | Role-based access control routes users to appropriate views | proxy.ts route matcher + session cookie check, role enum in users table |
| DSGN-01 | Dark scoreboard theme (bg: #0A0E17) with neon cyan accents (#06D6F2) | Tailwind v4 @theme directive with custom color tokens |
| DSGN-02 | Full-width stacked ticker layout with NO sidebar navigation | App Router layout.tsx with full-width main, no sidebar components |
| DSGN-03 | Thin top bar (48px) with tab navigation (Live Board, Battles, Challenges) | Fixed header component, 48px height, flex layout |
| DSGN-04 | Typography: Barlow Condensed for headings/ranks, JetBrains Mono for data | next/font with Barlow_Condensed and JetBrains_Mono, CSS variables in @theme |
| DSGN-05 | All 24 pre-generated SVG/PNG assets used as documented in DESIGN-SPEC.md | SVG as React components, PNG via next/image, all 24 assets verified present in public/assets/ |
| DSGN-06 | Responsive design for desktop and tablet viewports | Tailwind responsive utilities, mobile-first approach |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.2 | App framework with App Router | Current stable, proxy.ts support, server components |
| react / react-dom | 19.x | UI library | Ships with Next.js 16 |
| drizzle-orm | 0.45.2 | Type-safe ORM for Postgres | Lightweight, serverless-friendly, excellent TypeScript support |
| @neondatabase/serverless | 1.0.2 | Neon Postgres HTTP driver | Required for Vercel serverless (no TCP connections needed) |
| iron-session | 8.0.4 | Encrypted cookie sessions | Stateless, works with Server Components/Actions, zero dependencies |
| bcryptjs | 3.0.3 | Password hashing | Pure JS bcrypt (no native deps), works in serverless |
| tailwindcss | 4.2.2 | Utility-first CSS | CSS-based config via @theme, automatic content detection |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tailwindcss/postcss | 4.2.2 | PostCSS plugin for Tailwind v4 | Required for Next.js integration |
| postcss | 8.5.8 | CSS processing | Required by @tailwindcss/postcss |
| drizzle-kit | 0.31.10 | Schema migrations and studio | CLI for generating/running migrations |
| @types/bcryptjs | 3.0.0 | TypeScript types for bcryptjs | Dev dependency for type safety |
| dotenv | latest | Environment variable loading | Used by drizzle-kit for migrations |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| iron-session | next-auth | Overkill for 3 demo accounts with email/password only; iron-session is simpler and lighter |
| bcryptjs | bcrypt | bcrypt requires native compilation, fails in some serverless envs; bcryptjs is pure JS |
| drizzle-orm/neon-http | drizzle-orm/neon-serverless | neon-http is simpler for non-interactive queries; use neon-serverless only if interactive transactions needed |

**Installation:**
```bash
npm install next@latest react@latest react-dom@latest drizzle-orm @neondatabase/serverless iron-session bcryptjs tailwindcss @tailwindcss/postcss postcss
npm install -D drizzle-kit @types/bcryptjs @types/react @types/react-dom typescript @types/node dotenv
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── layout.tsx              # Root layout with fonts, theme
│   ├── globals.css             # Tailwind @import + @theme tokens
│   ├── login/
│   │   └── page.tsx            # Full-screen login page
│   ├── board/
│   │   ├── layout.tsx          # Authenticated layout with top bar
│   │   └── page.tsx            # Live board (rep + manager view)
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout
│   │   └── page.tsx            # Admin dashboard
│   └── api/                    # Route handlers if needed
├── lib/
│   ├── db/
│   │   ├── index.ts            # Drizzle client instance
│   │   ├── schema.ts           # Drizzle schema definitions
│   │   └── seed.ts             # Demo data seeding script
│   ├── auth/
│   │   ├── session.ts          # iron-session config + getSession helper
│   │   └── actions.ts          # login/logout server actions
│   └── constants.ts            # Color tokens, XP values, tier thresholds
├── components/
│   ├── icons/                  # SVG icon React components
│   ├── TopBar.tsx              # 48px navigation bar
│   ├── TierBadge.tsx           # Tier badge pill component
│   └── Logo.tsx                # Logo component
├── proxy.ts                    # Route protection (NOT middleware.ts)
├── drizzle.config.ts           # Drizzle Kit configuration
└── postcss.config.mjs          # PostCSS with @tailwindcss/postcss
```

### Pattern 1: proxy.ts for Route Protection (Next.js 16)
**What:** Next.js 16 replaces middleware.ts with proxy.ts. The exported function is named `proxy` (not `middleware`). Runs on Node.js runtime.
**When to use:** Protecting authenticated routes, redirecting unauthenticated users.
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/proxy
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get('rankup-session')
  const { pathname } = request.nextUrl

  // Allow login page and static assets
  if (pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/assets')) {
    return NextResponse.next()
  }

  // Redirect to login if no session
  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico).*)'],
}
```

### Pattern 2: iron-session with Server Actions
**What:** Encrypted cookie sessions using getIronSession with Next.js cookies() API.
**When to use:** All session read/write operations in server components and server actions.
**Example:**
```typescript
// lib/auth/session.ts
import { getIronSession, SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  userId: number
  email: string
  role: 'rep' | 'manager' | 'admin'
  isLoggedIn: boolean
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'rankup-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
}

export async function getSession() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  return session
}
```

```typescript
// lib/auth/actions.ts
'use server'
import { getSession } from './session'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const user = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (!user[0] || !await bcrypt.compare(password, user[0].passwordHash)) {
    return { error: 'Invalid email or password' }
  }

  const session = await getSession()
  session.userId = user[0].id
  session.email = user[0].email
  session.role = user[0].role
  session.isLoggedIn = true
  await session.save()

  // Role-based redirect
  if (user[0].role === 'admin') redirect('/admin')
  redirect('/board')
}

export async function logout() {
  const session = await getSession()
  session.destroy()
  redirect('/login')
}
```

### Pattern 3: Drizzle + Neon HTTP Connection
**What:** Serverless-optimized database connection using Neon's HTTP driver.
**When to use:** All database queries in server components and server actions.
**Example:**
```typescript
// lib/db/index.ts
// Source: https://orm.drizzle.team/docs/connect-neon
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

export const db = drizzle(process.env.DATABASE_URL!, { schema })
```

```typescript
// lib/db/schema.ts
import { pgTable, serial, varchar, pgEnum, timestamp, integer, text } from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', ['rep', 'manager', 'admin'])

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: roleEnum('role').notNull().default('rep'),
  teamId: integer('team_id').references(() => teams.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Schema stubs for later phases
export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  xpEarned: integer('xp_earned').notNull(),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

```typescript
// drizzle.config.ts
import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './drizzle',
  schema: './src/lib/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

### Pattern 4: Tailwind CSS v4 Theme Configuration
**What:** Tailwind v4 uses `@theme` in CSS instead of `tailwind.config.js`. No config file needed.
**When to use:** Defining the entire design system color palette, typography, and custom tokens.
**Example:**
```css
/* app/globals.css */
/* Source: https://tailwindcss.com/docs/theme */
@import "tailwindcss";

@theme {
  /* Background colors */
  --color-bg-primary: #0A0E17;
  --color-bg-surface: #111827;
  --color-bg-surface-hover: #1A2332;
  --color-bg-elevated: #1E293B;

  /* Text colors */
  --color-text-primary: #F1F5F9;
  --color-text-secondary: #94A3B8;
  --color-text-muted: #475569;

  /* Accent colors */
  --color-accent-cyan: #06D6F2;
  --color-accent-green: #10B981;
  --color-accent-red: #EF4444;
  --color-accent-amber: #F59E0B;

  /* Tier colors */
  --color-tier-gold: #FFD700;
  --color-tier-silver: #C0C0C0;
  --color-tier-bronze: #CD7F32;

  /* Fonts */
  --font-heading: var(--font-barlow-condensed);
  --font-data: var(--font-jetbrains-mono);
}
```

Usage in components:
```tsx
<div className="bg-bg-primary text-text-primary">
  <h1 className="font-heading text-4xl text-accent-cyan">LIVE BOARD</h1>
  <span className="font-data text-sm text-text-secondary">12,450 XP</span>
</div>
```

### Pattern 5: next/font with CSS Variables
**What:** Load Google Fonts with automatic optimization, expose as CSS variables for Tailwind.
**When to use:** Root layout font configuration.
**Example:**
```typescript
// app/layout.tsx
import { Barlow_Condensed, JetBrains_Mono } from 'next/font/google'

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-bg-primary text-text-primary antialiased">
        {children}
      </body>
    </html>
  )
}
```

### Anti-Patterns to Avoid
- **Using middleware.ts instead of proxy.ts** -- deprecated in Next.js 16, will be removed in future versions
- **Using tailwind.config.js for theme** -- Tailwind v4 uses @theme in CSS; config files are v3 pattern
- **Using pg driver with Neon on Vercel** -- TCP connections fail in serverless; must use @neondatabase/serverless HTTP driver
- **Database calls in proxy.ts** -- proxy runs on every request including prefetches; only read cookies, never query DB
- **JWT tokens for this demo** -- cookie sessions are simpler, work natively with Server Components, no token refresh complexity
- **Component libraries (shadcn, MUI)** -- CONTEXT.md explicitly says fully custom components, no libraries

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cookie encryption | Custom crypto/signing | iron-session | Handles encryption, signing, serialization, cookie size limits |
| Password hashing | Custom hash functions | bcryptjs | Timing-safe comparison, salt management, configurable rounds |
| Database migrations | Raw SQL scripts | drizzle-kit (generate + migrate) | Type-safe, reversible, tracks migration state |
| Font loading | Manual @font-face | next/font/google | Automatic optimization, self-hosting, no layout shift |
| Route matching | Custom URL parsing in proxy | config.matcher with regex | Static analysis at build time, optimized by Next.js |

**Key insight:** This phase is pure infrastructure -- every component has a well-tested library solution. Hand-rolling any of these introduces subtle security bugs (session handling), performance issues (font loading), or serverless incompatibilities (database drivers).

## Common Pitfalls

### Pitfall 1: middleware.ts vs proxy.ts in Next.js 16
**What goes wrong:** Creating middleware.ts instead of proxy.ts causes deprecation warnings and may break in future versions. The function export must be named `proxy`, not `middleware`.
**Why it happens:** Most tutorials and training data reference middleware.ts (pre-16 convention).
**How to avoid:** Create `proxy.ts` at project root (or `src/proxy.ts`), export function named `proxy`.
**Warning signs:** Deprecation warnings in console, "middleware" mentioned in file names.

### Pitfall 2: Tailwind v4 Config Confusion
**What goes wrong:** Creating a `tailwind.config.js` file and expecting it to work. In v4, customization is done via `@theme` in CSS.
**Why it happens:** Vast majority of existing tutorials use v3 config pattern.
**How to avoid:** Use `@theme { }` block in globals.css. No tailwind.config.js needed. PostCSS config only needs `@tailwindcss/postcss` plugin.
**Warning signs:** Custom colors not generating utility classes, config file being ignored.

### Pitfall 3: cookies() Must Be Awaited in Next.js 15+
**What goes wrong:** `cookies()` from `next/headers` is now async and returns a Promise. Passing it directly to `getIronSession` without `await` causes type errors or runtime failures.
**Why it happens:** Changed in Next.js 15; many examples show synchronous usage from v14.
**How to avoid:** Always `await cookies()` before passing to iron-session: `getIronSession<SessionData>(await cookies(), sessionOptions)`.
**Warning signs:** Type errors about Promise, "cookies is not iterable" runtime errors.

### Pitfall 4: Neon Serverless Driver Import Path
**What goes wrong:** Using `drizzle-orm/postgres-js` or `drizzle-orm/node-postgres` import paths instead of `drizzle-orm/neon-http`.
**Why it happens:** Multiple Postgres driver adapters exist in Drizzle; easy to pick wrong one.
**How to avoid:** For Neon on Vercel serverless, always use `import { drizzle } from 'drizzle-orm/neon-http'`. The neon-http driver uses HTTP protocol (no TCP/WebSocket needed).
**Warning signs:** Connection timeouts in production, "cannot connect to database" on Vercel.

### Pitfall 5: Session Data in proxy.ts
**What goes wrong:** Attempting to decrypt iron-session cookies or query the database inside proxy.ts.
**Why it happens:** Wanting to check user roles for route protection at the proxy level.
**How to avoid:** In proxy.ts, only check for cookie _existence_ (not contents). Do role-based access checks in server components or layout.tsx where you can properly call getSession(). Proxy runs on every request including prefetches.
**Warning signs:** Slow page loads, proxy importing heavy dependencies.

### Pitfall 6: SVG Import Strategy
**What goes wrong:** Importing SVGs as `<img>` tags or via next/image, losing ability to style with CSS (color, size).
**Why it happens:** Default approach for images; SVGs need special handling for inline rendering.
**How to avoid:** Create React components that return the SVG markup directly. This enables `className` for Tailwind styling, `currentColor` for theme-aware colors, and dynamic sizing.
**Warning signs:** SVG icons that can't change color, fixed sizes, extra network requests for each icon.

## Code Examples

### SVG Icon Component Pattern
```typescript
// components/icons/FlameIcon.tsx
export function FlameIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      {/* SVG path content from public/assets/icon-flame.svg */}
    </svg>
  )
}
```

### Login Page with Server Action
```typescript
// app/login/page.tsx
import { login } from '@/lib/auth/actions'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-bg-primary">
      <Image
        src="/assets/hero-login.png"
        alt=""
        fill
        className="object-cover opacity-30"
        priority
      />
      <div className="relative z-10 w-full max-w-md p-8">
        <img src="/assets/logo.svg" alt="RankUp" className="h-8 mx-auto mb-8" />
        <form action={login} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 bg-bg-surface border border-bg-surface-hover rounded text-text-primary font-data"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 bg-bg-surface border border-bg-surface-hover rounded text-text-primary font-data"
          />
          <button
            type="submit"
            className="w-full py-3 bg-accent-cyan text-bg-primary font-heading font-bold text-lg rounded"
          >
            ENTER THE ARENA
          </button>
        </form>
      </div>
    </div>
  )
}
```

### Database Seed Script
```typescript
// lib/db/seed.ts
import { db } from './index'
import { users, teams } from './schema'
import bcrypt from 'bcryptjs'

async function seed() {
  // Create teams
  const [alpha, beta, gamma] = await db.insert(teams).values([
    { name: 'Alpha Pack', slug: 'alpha' },
    { name: 'Beta Squad', slug: 'beta' },
    { name: 'Gamma Force', slug: 'gamma' },
  ]).returning()

  // Create demo accounts
  const hash = await bcrypt.hash('demo1234', 10)
  await db.insert(users).values([
    { email: 'rep@rankup.app', passwordHash: hash, name: 'Sarah Chen', role: 'rep', teamId: alpha.id },
    { email: 'manager@rankup.app', passwordHash: hash, name: 'Mike Torres', role: 'manager', teamId: alpha.id },
    { email: 'admin@rankup.app', passwordHash: hash, name: 'Dana Wright', role: 'admin', teamId: null },
  ])

  console.log('Seed complete')
}

seed().catch(console.error)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| middleware.ts | proxy.ts | Next.js 16.0.0 (March 2026) | Must use proxy.ts, middleware is deprecated |
| tailwind.config.js | @theme in CSS | Tailwind CSS 4.0 (Jan 2025) | No JS config file; all theme tokens in CSS |
| cookies() sync | cookies() async | Next.js 15.0.0 (Oct 2024) | Must await cookies() before passing to iron-session |
| pg / node-postgres | @neondatabase/serverless | Neon driver 1.0 (2024) | HTTP driver required for Vercel serverless |
| drizzle-orm/neon | drizzle-orm/neon-http | Drizzle 0.30+ | Simplified connection: `drizzle(process.env.DATABASE_URL!)` |

**Deprecated/outdated:**
- `middleware.ts` file convention: Renamed to `proxy.ts` in Next.js 16, will be removed
- `tailwind.config.js`: Tailwind v4 uses CSS-first config; JS config is v3 legacy
- Synchronous `cookies()`: Must be awaited in Next.js 15+

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Next.js built-in testing + proxy test utilities |
| Config file | none -- Wave 0 |
| Quick run command | `npx next build` (type checking + build validation) |
| Full suite command | `npx next build && curl -s http://localhost:3000/login` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Login with email/password | smoke | Build succeeds + manual login test | Wave 0 |
| AUTH-02 | Session persists on refresh | smoke | Manual -- refresh after login | Manual-only (browser state) |
| AUTH-03 | Logout from any page | smoke | Manual -- click logout | Manual-only (browser state) |
| AUTH-04 | Role-based routing | smoke | Build succeeds + proxy.ts compiles | Wave 0 |
| DSGN-01 | Dark theme with cyan accents | visual | Build succeeds + manual inspection | Manual-only (visual) |
| DSGN-02 | Full-width no sidebar | visual | Manual inspection | Manual-only (visual) |
| DSGN-03 | 48px top bar with tabs | visual | Manual inspection | Manual-only (visual) |
| DSGN-04 | Barlow Condensed + JetBrains Mono | visual | Build succeeds (font loading) | Manual-only (visual) |
| DSGN-05 | 24 assets integrated | build | `ls public/assets/ | wc -l` returns 24 | Wave 0 |
| DSGN-06 | Responsive design | visual | Manual inspection at different widths | Manual-only (visual) |

### Sampling Rate
- **Per task commit:** `npx next build` (catches type errors, import issues, config problems)
- **Per wave merge:** Full build + manual login flow verification
- **Phase gate:** Build passes + all 3 demo accounts can log in and see correct views

### Wave 0 Gaps
- None -- for a Phase 1 foundation, build validation is the primary automated check. Full test infrastructure (Jest/Vitest) can be added in later phases when there is business logic to test.

## Open Questions

1. **iron-session + Next.js 16 proxy.ts compatibility**
   - What we know: iron-session works with cookies() in server components/actions. Proxy.ts cannot decrypt sessions (by design).
   - What's unclear: Whether proxy.ts cookie detection pattern is sufficient or if additional role checks in layouts are needed
   - Recommendation: Check cookie existence in proxy.ts, check role in authenticated layout server component

2. **Drizzle push vs migrate strategy**
   - What we know: `drizzle-kit push` applies schema directly; `drizzle-kit generate` + `drizzle-kit migrate` creates SQL migration files
   - What's unclear: Which is preferred for a demo app that will be deployed once
   - Recommendation: Use `drizzle-kit push` for development speed (demo app, not production migrations)

3. **Tailwind v4 @theme inline vs regular for font variables**
   - What we know: `@theme inline` uses `var()` references; regular @theme resolves values
   - What's unclear: Whether next/font CSS variables work correctly with @theme inline
   - Recommendation: Use `@theme inline` for font references since next/font sets CSS variables at runtime

## Sources

### Primary (HIGH confidence)
- [Next.js 16 proxy.ts docs](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) - Complete proxy API, migration from middleware, code examples
- [Tailwind CSS v4 @theme docs](https://tailwindcss.com/docs/theme) - Theme directive syntax, namespaces, all patterns
- [Tailwind CSS v4 Next.js setup](https://tailwindcss.com/docs/guides/nextjs) - Installation and PostCSS config
- [Drizzle ORM Neon connection](https://orm.drizzle.team/docs/connect-neon) - neon-http driver setup, connection patterns
- npm registry - All package versions verified via `npm view`

### Secondary (MEDIUM confidence)
- [iron-session GitHub](https://github.com/vvo/iron-session) - App Router examples, getIronSession API
- [iron-session examples](https://get-iron-session.vercel.app/) - Server components + server actions patterns
- [Neon Drizzle guide](https://neon.com/docs/guides/drizzle) - Connection and migration patterns

### Tertiary (LOW confidence)
- Next.js 16 proxy.ts runtime behavior in production (Vercel) -- verified docs say Node.js runtime, but production performance characteristics not tested

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All versions verified against npm registry, official docs consulted
- Architecture: HIGH - Patterns verified against Next.js 16 and Tailwind v4 official documentation
- Pitfalls: HIGH - proxy.ts rename confirmed via official Next.js docs; Tailwind v4 @theme confirmed via official docs; cookies() async confirmed

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (stable stack, no fast-moving dependencies)
