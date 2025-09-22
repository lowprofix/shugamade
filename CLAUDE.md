# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Shugamade** is a Next.js 15 beauty care platform specializing in natural hair treatments, with integrated e-commerce, booking system, and WhatsApp Business automation. Built for African markets with French localization and optimizations for low bandwidth.

## Commands

```bash
# Development
pnpm dev         # Start development server on localhost:3000
pnpm build       # Build for production
pnpm lint        # Run ESLint checks
pnpm start       # Start production server

# TypeScript checking (no dedicated command, use in IDE or run via ESLint)
npx tsc --noEmit # Manual type checking if needed
```

## Architecture

### Core Stack
- **Framework**: Next.js 15.3.0 with App Router
- **Language**: TypeScript 5 with strict mode enabled
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Package Manager**: pnpm (ALWAYS use pnpm, never npm/yarn)

### Key Integrations
- **Database/Storage**: Supabase (PostgreSQL + S3-compatible storage)
- **E-commerce**: Hiboutik API for real-time inventory management
- **WhatsApp**: EvolutionAPI for automated reminders and customer communication
- **Calendar**: Google Calendar via N8N webhooks for appointment management

### Directory Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # REST API endpoints
│   │   ├── bookings/      # Booking system endpoints
│   │   ├── reminders/     # WhatsApp reminder automation
│   │   ├── whatsapp/      # WhatsApp Business API
│   │   ├── hiboutik/      # E-commerce integration
│   │   └── products/      # Product management
│   └── [pages]            # Route pages
├── components/            # React components
│   ├── booking/          # Booking system UI
│   └── ui/               # Shadcn/ui design system
└── lib/                  # Utilities and configuration
    ├── config.ts         # Centralized configuration
    ├── types.ts          # TypeScript types
    └── supabase/         # Supabase client
```

## Development Guidelines

### TypeScript & Validation
- **ALWAYS** use TypeScript strict mode (already configured)
- **ALWAYS** validate API inputs with Zod before processing
- **NEVER** use `any` type or `as` type assertions
- **ALWAYS** handle null/undefined explicitly

### Error Handling Pattern
Use the Result<T> pattern for all operations that can fail:
```typescript
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } }
```

### Import Convention
- Use absolute imports with `@/` prefix (configured in tsconfig.json)
- Example: `import { Button } from "@/components/ui/button"`

### API Development
- All API routes in `src/app/api/`
- Use Next.js route handlers (route.ts)
- Validate request bodies with Zod
- Return typed responses with proper HTTP status codes

### Component Development
- Check existing components in `src/components/` before creating new ones
- Follow shadcn/ui patterns for UI components
- Use existing utilities from `@/lib/utils`

## Environment Variables

Required environment variables (check .env.example or create if missing):
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Hiboutik E-commerce
HIBOUTIK_BASE_URL=
HIBOUTIK_API_LOGIN=
HIBOUTIK_API_KEY=

# WhatsApp/EvolutionAPI
EVOLUTION_API_SERVER=
EVOLUTION_API_INSTANCE=
EVOLUTION_API_KEY=

# Calendar Integration
N8N_WEBHOOK_CALENDAR_EVENTS=
N8N_WEBHOOK_CALENDAR_UPDATE=
```

## Key Features & APIs

### 1. Booking System (`/api/bookings`)
- Calendar-based appointment booking with FullCalendar
- Multi-location support (Brazzaville, Pointe-Noire)
- Service selection with pricing
- Customer form with Zod validation

### 2. WhatsApp Integration (`/api/whatsapp`, `/api/reminders`)
- Automated appointment reminders (via Vercel Cron at 16h and 17h)
- Phone number detection with country code support (+242, +237, +33, etc.)
- Media and product catalog sending capabilities
- Reminder system detailed in `DIAGNOSTIC-WEBHOOK-N8N.md`

### 3. E-commerce (`/api/products`, `/api/hiboutik`)
- Real-time stock synchronization with Hiboutik
- Product images via Supabase Storage
- Optimized image loading with Next.js Image component

### 4. Calendar Events
- Format migration in progress: `"Réservation - Service - Client"` → `"Client - Service"`
- Migration API: `/api/update-calendar-events`
- Integration with Google Calendar via N8N webhooks

## African Market Optimizations

- **Language**: French interface throughout
- **Timezone**: Africa/Douala (UTC+1)
- **Currency**: XAF (Franc CFA)
- **Phone formats**: Support for multiple African country codes
- **Network**: Aggressive caching, lazy loading, compressed payloads
- **Images**: WebP/AVIF optimization with CDN caching (31536000s)

## Testing

No test framework currently configured. When implementing tests:
1. Check with user for preferred testing framework
2. Consider Vitest or Jest for Next.js compatibility
3. Test critical paths: booking flow, payment processing, WhatsApp sending

## Deployment

- **Platform**: Vercel
- **Cron Jobs**: Configured in vercel.json for reminder automation
- **Environment**: Production environment variables set in Vercel dashboard

## Important Notes

1. **NEVER** commit API keys or secrets
2. **ALWAYS** use pnpm for package management
3. **ALWAYS** validate phone numbers before WhatsApp operations
4. **CHECK** existing components/utilities before creating new ones
5. **FOLLOW** existing code patterns and conventions in the codebase
6. **USE** French for user-facing strings and comments related to business logic