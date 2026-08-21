# Frontend Architecture & Conventions Document

## 1. Executive Summary
This document outlines the architecture, code conventions, state management, design tokens, and folder layout for the **RunSheet** Next.js 16 frontend application.

The frontend communicates with a NestJS backend powered by Prisma ORM and PostgreSQL.

---

## 2. Directory Structure

```
frontend/
├── docs/                      # Architecture & API integration docs
│   ├── frontend-architecture.md
│   └── api-integration.md
├── src/
│   ├── app/                   # Next.js App Router (pages & layouts)
│   │   ├── (auth)/            # Auth routes (login, register)
│   │   ├── (dashboard)/       # Application shell area (dashboard, events, teams...)
│   │   ├── layout.tsx         # Root layout with Poppins font & providers
│   │   ├── page.tsx           # Home page landing shell
│   │   ├── loading.tsx        # Global loading boundary
│   │   ├── error.tsx          # Global error boundary
│   │   └── not-found.tsx      # 404 page
│   ├── components/
│   │   ├── ui/                # Generic reusable primitives (Button, Input, Card...)
│   │   └── layout/            # Shell components (AppShell, Sidebar, Header, UserMenu)
│   ├── features/              # Feature-isolated modules
│   │   ├── auth/
│   │   ├── events/
│   │   ├── invitations/
│   │   ├── event-members/
│   │   ├── teams/
│   │   ├── team-membership/
│   │   ├── tasks/
│   │   ├── task-assignments/
│   │   ├── notifications/
│   │   └── dashboard/
│   ├── services/              # API communication layer
│   │   ├── api/               # Central fetch client & error normalizer
│   │   ├── auth/              # Auth API calls
│   │   └── [domain]-service.ts # Feature service endpoints
│   ├── hooks/                 # Reusable custom React hooks
│   ├── lib/
│   │   ├── api/               # ApiError normalization class
│   │   ├── auth/              # Cookie storage manager
│   │   └── utils/             # Helper utilities (cn...)
│   ├── types/
│   │   ├── api/               # ApiResponse, ApiError, PaginatedResponse
│   │   ├── auth/              # AuthUser, LoginCredentials, RegisterData
│   │   └── common/            # Enums & Domain entities
│   ├── providers/             # React Context Providers (Auth, Toast)
│   ├── styles/                # CSS variables, Tailwind tokens (globals.css)
│   └── middleware.ts          # Server-side edge route protection
├── .env.example               # Environment variables template
├── .env.local                 # Local development environment overrides
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript strict configuration with `@/*` -> `./src/*`
└── package.json
```

---

## 3. Core Architectural Layers

```
UI Component / View
        ↓
Feature Component / Page
        ↓
Custom Hook / State Manager
        ↓
Domain Service (`src/services/*-service.ts`)
        ↓
Central API Client (`src/services/api/api-client.ts`)
        ↓
NestJS REST API Backend
```

---

## 4. Design System & Branding Tokens

- **Primary Brand Color**: `#44D944` (`var(--color-primary)`)
- **Primary Hover**: `#38C238`
- **Typography**: Poppins (Google Fonts via `next/font/google`)
- **Semantic Colors**:
  - Success: `#10B981`
  - Warning: `#F59E0B`
  - Error: `#EF4444`
  - Info: `#3B82F6`
- **Theme**: Support for responsive dark and light modes via CSS variable tokens.

---

## 5. Security & Authentication Strategy

1. **Authentication Protocol**: JWT-based Bearer token authentication.
2. **Token Storage**: `runsheet_access_token` cookie set with `SameSite=Lax` for server-side Next.js `middleware.ts` evaluation, with `localStorage` fallback.
3. **Route Protection**:
   - Protected routes (`/dashboard`, `/events`, `/teams`, `/tasks`, `/notifications`) are guarded server-side by `src/middleware.ts`.
   - Unauthenticated requests are redirected to `/login?callbackUrl=...`.
4. **Header Injection**: Requests through `apiClient` automatically attach `Authorization: Bearer <token>`.
