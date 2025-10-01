# Task List: Personal Finance App with AI-Powered Email Transaction Detection

## Relevant Files

### Frontend (apps/web/)

- `apps/web/package.json` - Frontend dependencies and scripts configuration
- `apps/web/vite.config.ts` - Vite configuration with PWA plugin setup
- `apps/web/railway.json` - Railway deployment configuration for frontend
- `apps/web/src/main.tsx` - Application entry point and PWA registration
- `apps/web/src/App.tsx` - Main application component with routing
- `apps/web/src/lib/supabase.ts` - Supabase client configuration and initialization
- `apps/web/src/stores/authStore.ts` - Zustand store for authentication state
- `apps/web/src/stores/transactionStore.ts` - Zustand store for transaction management
- `apps/web/src/stores/budgetStore.ts` - Zustand store for budget management
- `apps/web/src/components/Auth/LoginForm.tsx` - User authentication component
- `apps/web/src/components/Dashboard/Dashboard.tsx` - Main dashboard component
- `apps/web/src/components/Transactions/TransactionList.tsx` - Transaction display component
- `apps/web/src/components/Budget/BudgetManager.tsx` - Budget management interface
- `apps/web/src/components/Settings/EmailAccounts.tsx` - Email account connection interface
- `apps/web/src/hooks/useAuth.ts` - Authentication hook
- `apps/web/src/hooks/useTransactions.ts` - Transaction management hook
- `apps/web/src/hooks/useBudget.ts` - Budget management hook
- `apps/web/src/hooks/useOfflineSync.ts` - PWA offline synchronization hook

### Backend (apps/email-service/)

- `apps/email-service/package.json` - Backend dependencies and scripts
- `apps/email-service/railway.json` - Railway deployment configuration for backend
- `apps/email-service/src/server.ts` - Express/Fastify server setup
- `apps/email-service/src/app.ts` - Application configuration and middleware
- `apps/email-service/src/config/database.ts` - Supabase client configuration
- `apps/email-service/src/config/gmail.ts` - Gmail API configuration
- `apps/email-service/src/config/redis.ts` - Redis and BullMQ configuration
- `apps/email-service/src/services/gmailService.ts` - Gmail API integration service
- `apps/email-service/src/services/aiService.ts` - OpenAI integration for regex generation
- `apps/email-service/src/services/transactionService.ts` - Transaction processing logic
- `apps/email-service/src/services/supabaseService.ts` - Database operations service
- `apps/email-service/src/jobs/emailProcessor.ts` - Background job for email processing
- `apps/email-service/src/jobs/scheduler.ts` - Cron job scheduler setup
- `apps/email-service/src/controllers/emailController.ts` - Email processing endpoints
- `apps/email-service/src/controllers/transactionController.ts` - Transaction management endpoints
- `apps/email-service/src/middleware/auth.ts` - JWT authentication middleware
- `apps/email-service/src/utils/encryption.ts` - Token encryption utilities
- `apps/email-service/src/utils/regex.ts` - Regex pattern utilities

### Shared Packages

- `packages/shared-types/src/database.ts` - Database schema types
- `packages/shared-types/src/api.ts` - API request/response types
- `packages/shared-types/src/transactions.ts` - Transaction-related types
- `packages/supabase/migrations/001_initial_schema.sql` - Database schema migration
- `packages/supabase/migrations/002_rls_policies.sql` - Row Level Security policies
- `packages/supabase/config.toml` - Supabase configuration

### Configuration & Scripts

- `package.json` - Root package.json with workspace configuration
- `pnpm-workspace.yaml` - PNPM workspace configuration
- `.env.example` - Environment variables template
- `Makefile` - Project automation and task management
- `scripts/utils.sh` - Utility functions for Makefile tasks

### Notes

- All TypeScript files should include corresponding `.test.ts` or `.test.tsx` files for unit testing
- Use `make test` to run all tests across the workspace
- Use `make dev` to start both frontend and backend in development mode
- Use `make setup` for initial project setup and dependency installation
- Railway deployment is configured through `railway.json` files in each app directory
- All project automation is managed through the Makefile for consistency

## Tasks

- [ ] 1.0 Project Infrastructure, Monorepo Setup & Railway Deployment Pipeline
  - [x] 1.1 Initialize monorepo with pnpm workspace configuration
  - [x] 1.2 Create root package.json with workspace scripts and dependencies
  - [x] 1.3 Set up TypeScript configuration for the workspace
  - [x] 1.4 Configure ESLint and Prettier for code consistency
  - [x] 1.5 Create .gitignore and .env.example files
  - [ ] 1.6 Connect GitHub repository to Railway via web interface
    - Go to railway.app and connect GitHub account
    - Deploy from GitHub repo (AFP_V2)
    - Configure services for /apps/web and /apps/email-service
  - [ ] 1.7 Configure Railway environment variables and deployment settings
    - Set up environment variables for both services
    - Configure build and start commands if needed
    - Set up custom domains (optional)
  - [ ] 1.8 Create Makefile with automation tasks for development, testing, and deployment
  - [ ] 1.9 Test initial deployment pipeline with hello world apps

- [ ] 2.0 Database Schema & Supabase Configuration
  - [ ] 2.1 Create Supabase project and configure basic settings
  - [ ] 2.2 Design and create database schema for users, email_accounts, transactions, and budgets
  - [ ] 2.3 Set up Row Level Security (RLS) policies for all tables
  - [ ] 2.4 Create database functions for transaction categorization and budget calculations
  - [ ] 2.5 Set up Supabase migrations and seed data
  - [ ] 2.6 Configure Supabase authentication providers (email, OAuth)
  - [ ] 2.7 Create shared types package with database schema types
  - [ ] 2.8 Set up Supabase local development environment
  - [ ] 2.9 Create database backup and recovery procedures
  - [ ] 2.10 Test database operations and RLS policies

- [ ] 3.0 Authentication System & User Management
  - [ ] 3.1 Set up Supabase Auth configuration with email and OAuth providers
  - [ ] 3.2 Create authentication store using Zustand for state management
  - [ ] 3.3 Implement login/register forms with form validation
  - [ ] 3.4 Create protected route wrapper and authentication guards
  - [ ] 3.5 Implement user profile management interface
  - [ ] 3.6 Set up JWT token handling and refresh logic
  - [ ] 3.7 Create authentication middleware for backend API
  - [ ] 3.8 Implement password reset and email verification flows
  - [ ] 3.9 Add user session persistence and automatic logout
  - [ ] 3.10 Create user onboarding flow for initial setup
  - [ ] 3.11 Test authentication flows and security measures

- [ ] 4.0 Email Processing & AI Integration Microservice
  - [ ] 4.1 Set up Node.js backend with Fastify framework and TypeScript
  - [ ] 4.2 Configure Gmail API integration with OAuth2 flow
  - [ ] 4.3 Implement secure token storage with encryption utilities
  - [ ] 4.4 Set up BullMQ with Redis for background job processing
  - [ ] 4.5 Create email fetching service to retrieve banking notifications
  - [ ] 4.6 Integrate OpenAI API for regex pattern generation and improvement
  - [ ] 4.7 Implement transaction extraction logic using AI-generated patterns
  - [ ] 4.8 Create transaction categorization service with learning capabilities
  - [ ] 4.9 Set up scheduled jobs for hourly email processing
  - [ ] 4.10 Implement error handling and retry mechanisms for API failures
  - [ ] 4.11 Create webhook endpoints for real-time email notifications
  - [ ] 4.12 Add logging and monitoring for email processing pipeline
  - [ ] 4.13 Implement rate limiting and Gmail API quota management
  - [ ] 4.14 Create transaction feedback system for AI improvement
  - [ ] 4.15 Test email processing accuracy and performance

- [ ] 5.0 Frontend PWA & User Interface
  - [ ] 5.1 Set up Vite + React project with TypeScript and PWA plugin
  - [ ] 5.2 Configure Tailwind CSS and create design system components
  - [ ] 5.3 Implement PWA manifest and service worker for offline functionality
  - [ ] 5.4 Create responsive layout with mobile-first design approach
  - [ ] 5.5 Build main dashboard with budget overview and recent transactions
  - [ ] 5.6 Implement transaction list with filtering and search capabilities
  - [ ] 5.7 Create transaction detail view with edit and categorization options
  - [ ] 5.8 Build email account connection interface with OAuth flow
  - [ ] 5.9 Implement real-time updates using Supabase subscriptions
  - [ ] 5.10 Create offline sync functionality for PWA capabilities
  - [ ] 5.11 Add push notification support for budget alerts
  - [ ] 5.12 Implement data export functionality (CSV, PDF)
  - [ ] 5.13 Create settings page for user preferences and account management
  - [ ] 5.14 Add loading states, error handling, and user feedback
  - [ ] 5.15 Optimize performance and implement lazy loading
  - [ ] 5.16 Test PWA functionality and cross-device compatibility

- [ ] 6.0 Budget Management & Transaction Categorization
  - [ ] 6.1 Create budget category management system with CRUD operations
  - [ ] 6.2 Implement monthly budget limits and spending tracking
  - [ ] 6.3 Build automatic transaction categorization with AI assistance
  - [ ] 6.4 Create budget alert system for spending limit notifications
  - [ ] 6.5 Implement spending trend analysis and reporting features
  - [ ] 6.6 Build interactive charts and visualizations using Recharts
  - [ ] 6.7 Create budget vs actual spending comparison views
  - [ ] 6.8 Implement transaction recategorization with user feedback
  - [ ] 6.9 Add support for multiple currencies and exchange rates
  - [ ] 6.10 Create recurring transaction detection and management
  - [ ] 6.11 Implement budget goal setting and progress tracking
  - [ ] 6.12 Add budget sharing and export capabilities
  - [ ] 6.13 Create financial insights and recommendations system
  - [ ] 6.14 Test budget calculations and alert accuracy
