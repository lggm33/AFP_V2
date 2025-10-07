# Railway Deployment Guide

This project uses a monorepo structure with shared types between the frontend (SPA) and backend (API) services.

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

### Service 1: Frontend (SPA)

**Configuration:**
- **Name:** `afp-web`
- **Root Directory:** `/`
- **Build Command:** `pnpm install && pnpm run build:web`
- **Start Command:** `cd apps/web && pnpm start`
- **Port:** `3000`

> **Note:** Railway will automatically detect pnpm and use it. The build command will:
> 1. Install all workspace dependencies
> 2. Build `@afp/shared-types` package
> 3. Build the web app

**Environment Variables:**
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Service 2: Backend API

**Configuration:**
- **Name:** `afp-email-service`
- **Root Directory:** `/`
- **Build Command:** `pnpm install && pnpm run build:api`
- **Start Command:** `cd apps/email-service && pnpm start`
- **Port:** `3001` (or configure in your service)

> **Note:** Railway will automatically detect pnpm and use it. The build command will:
> 1. Install all workspace dependencies
> 2. Build `@afp/shared-types` package
> 3. Build the email service

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

**Benefits:**
✅ Single source of truth for types  
✅ Type safety between frontend and backend  
✅ DRY principle - no code duplication  
✅ Automatic type checking during build  

## Build Process

The build process automatically:
1. Installs all workspace dependencies
2. Builds `@afp/shared-types` first
3. Builds the target service (web or email-service)
4. Ensures type consistency across services

## Deployment Steps

### 1. Create Railway Project

```bash
railway login
railway init
```

### 2. Create Web Service

```bash
# In Railway dashboard, create new service
# Settings:
# - Build Command: pnpm install && pnpm build:web
# - Start Command: cd apps/web && pnpm start
# - Root Directory: /
```

### 3. Create Email Service

```bash
# In Railway dashboard, create new service
# Settings:
# - Build Command: pnpm install && pnpm build:api
# - Start Command: cd apps/email-service && pnpm start
# - Root Directory: /
```

### 4. Configure Environment Variables

Set the appropriate environment variables in each service's settings.

### 5. Deploy

```bash
# Deploy all services
railway up
```

## Local Testing

```bash
# Build everything locally to test
pnpm build

# Build individual services
pnpm build:web
pnpm build:api

# Development mode
pnpm dev        # Both services
pnpm dev:web    # Only frontend
pnpm dev:api    # Only backend
```

## Alternative: Using Makefile Commands

The project includes a Makefile for convenience during local development:

```bash
# Build everything locally to test
make build

# Build individual services
make build-web
make build-api
```

> **Important:** Railway does NOT use make. The npm scripts are configured to work without make, using direct pnpm commands.

## Troubleshooting

### Build fails with "Module not found: @afp/shared-types"

**Solution:** Ensure pnpm install runs before build. Railway should automatically handle workspace dependencies.

### Types not updating after changes

**Solution:** Rebuild shared-types first:
```bash
pnpm --filter "@afp/shared-types" build
```

### CORS issues between services

**Solution:** Configure CORS in email-service to allow requests from web service URL.

## Cost Optimization

- **Frontend:** Consider using Vercel, Netlify, or Cloudflare Pages (free tier) instead of Railway for static hosting
- **Backend:** Keep on Railway as it needs to run 24/7

## Monitoring

Railway provides built-in monitoring:
- Logs: `railway logs`
- Metrics: View in Railway dashboard
- Deployments: View build history and rollback if needed
