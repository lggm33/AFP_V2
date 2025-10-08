# Railway Deployment Guide

This project uses a monorepo structure with shared types between the frontend (SPA) and the micro
service for email processing.

## Project Structure

```
AFP_V2/
├── packages/
│   └── shared-types/          # Shared TypeScript types
├── apps/
│   ├── web/                   # Frontend SPA (React + Vite)
│   └── email-service/         # Backend API (Fastify)
└── pnpm-workspace.yaml        # Workspace configuration
```

## Railway Configuration

> **Important:** This project uses pnpm workspaces. Railway (Railpack) automatically detects pnpm
> via:
>
> - `package.json` → `"packageManager": "pnpm@8.12.0"`
> - `.npmrc` → `package-manager=pnpm`
> - `engines` → `"pnpm": ">=8.0.0"`
>
> Railway's Railpack builder automatically uses pnpm when these files are present.

### Service 1: Frontend (SPA)

**Configuration:**

- **Name:** `afp-web`
- **Root Directory:** `/`
- **Build Command:** `pnpm install && pnpm run build:web`
- **Start Command:** `pnpm run start:web`
- **Port:** `3000`

> **Note:** Railway will automatically detect pnpm and use it. All commands run from the root:
>
> - `build:web` → Compiles `@afp/shared-types` then `@afp/web`
> - `start:web` → Serves the built static files with `serve`

**Environment Variables:**

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Service 2: Email micro-service

**Configuration:**

- **Name:** `afp-email-service`
- **Root Directory:** `/`
- **Build Command:** `pnpm install && pnpm run build:api`
- **Start Command:** `pnpm run start:api`
- **Port:** `8080` (configured via PORT env var)

> **Note:** Railway will automatically detect pnpm and use it. All commands run from the root:
>
> - `build:api` → Compiles `@afp/shared-types` then `@afp/email-service`
> - `start:api` → Runs the compiled Node.js server

**Environment Variables:**

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3001
NODE_ENV=production
```

## Shared Types

The project uses `@afp/shared-types` package to share:

- Database types (Supabase generated)
- API request/response types
- Supabase client configuration

**Benefits:** ✅ Single source of truth for types  
✅ Type safety between frontend and backend  
✅ DRY principle - no code duplication  
✅ Automatic type checking during build

## Build Process

The build process automatically:

1. Installs all workspace dependencies
2. Builds `@afp/shared-types` first
3. Builds the target service (web or email-service)
4. Ensures type consistency across services
