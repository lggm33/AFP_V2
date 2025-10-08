# @afp/shared-types

Shared TypeScript types for the AFP Finance App monorepo.

## Purpose

This package provides a single source of truth for:

- Supabase database types (auto-generated)
- API request/response interfaces
- Supabase client configuration helpers

## Usage

### In Web App (Frontend)

```typescript
import { Database, createSupabaseWebClient } from '@afp/shared-types';

const supabase = createSupabaseWebClient({
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
});
```

### In Email Service (Backend)

```typescript
import { Database, createSupabaseServiceClient } from '@afp/shared-types';

const supabase = createSupabaseServiceClient({
  url: process.env.SUPABASE_URL,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
});
```

### Importing Types

```typescript
// Database types
import type { Database, Tables, Enums } from '@afp/shared-types';

// API types
import type { ApiResponse, ProcessEmailsRequest } from '@afp/shared-types';

// Specific table types
type User = Tables<'users'>;
type Transaction = Tables<'transactions'>;
```

## Development

### Building

```bash
pnpm build
```

### Watch Mode

```bash
pnpm dev
```

## Exports

### Database Types

- `Database` - Full database schema type
- `Tables<T>` - Extract table row type
- `TablesInsert<T>` - Extract insert type
- `TablesUpdate<T>` - Extract update type
- `Enums<T>` - Extract enum type

### API Types

- `ApiResponse<T>` - Standard API response wrapper
- `ProcessEmailsRequest` - Email processing request
- `ProcessEmailsResponse` - Email processing response
- `HealthCheckResponse` - Health check response

### Client Helpers

- `createSupabaseWebClient()` - Create web client
- `createSupabaseServiceClient()` - Create service client
- `SupabaseClient` - Client type
