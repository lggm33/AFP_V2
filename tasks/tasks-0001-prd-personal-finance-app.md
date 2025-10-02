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
  - [x] 1.6 Connect GitHub repository to Railway via web interface
    - Go to railway.app and connect GitHub account
    - Deploy from GitHub repo (AFP_V2)
    - Configure services for /apps/web and /apps/email-service
  - [X] 1.7 Configure Railway environment variables and deployment settings
    - Set up environment variables for both services
    - Configure build and start commands if needed
    - Set up custom domains (optional)
  - [x] 1.8 Create Makefile with automation tasks for development, testing, and deployment
  - [x] 1.9 Test initial deployment pipeline with hello world apps
    ✅ Email service deployed successfully to Railway
    ✅ Web app deployed successfully to Railway  
    ✅ Both apps have working health endpoints
    ✅ Deployment pipeline is functional (takes ~10 minutes)

- [ ] 2.0 Supabase Setup & Basic Authentication Configuration
  - [x] 2.1 Create Supabase project and configure basic settings
  - [x] 2.2 Configure Supabase authentication providers (email, OAuth)
  - [x] 2.3 Set up environment variables for Supabase connection
  - [x] 2.4 Test Supabase connection and authentication setup
  - [x] 2.5 Configure Supabase local development environment (optional)

- [ ] 3.0 Basic Authentication System Implementation
  - [ ] 3.1 Install required dependencies (Zustand, React Router, React Hook Form, Zod)
  - [ ] 3.2 Create authentication store using Zustand for state management
  - [ ] 3.3 Implement useAuth hook for authentication logic
  - [ ] 3.4 Create login/register forms with form validation
  - [ ] 3.5 Implement basic routing system with React Router
  - [ ] 3.6 Create protected route wrapper and authentication guards
  - [ ] 3.7 Add user session persistence and automatic logout
  - [ ] 3.8 Update main App component with authentication flow
  - [ ] 3.9 Test basic authentication flows (login, register, logout)
  - [ ] 3.10 Create simple dashboard for authenticated users

- [ ] 4.0 Database Schema & Advanced Supabase Configuration
  - [ ] 4.1 Design and create database schema for users, email_accounts, transactions, and budgets
  - [ ] 4.2 Set up Row Level Security (RLS) policies for all tables
  - [ ] 4.3 Create database functions for transaction categorization and budget calculations
  - [ ] 4.4 Set up Supabase migrations and seed data
  - [ ] 4.5 Create shared types package with database schema types
  - [ ] 4.6 Create database backup and recovery procedures
  - [ ] 4.7 Test database operations and RLS policies
  - [ ] 4.8 Implement advanced authentication features (password reset, email verification)
  - [ ] 4.9 Create user profile management interface
  - [ ] 4.10 Create user onboarding flow for initial setup

- [ ] 5.0 Email Processing & AI Integration Microservice
  - [ ] 5.1 Set up Node.js backend with Fastify framework and TypeScript
  - [ ] 5.2 Configure Gmail API integration with OAuth2 flow
  - [ ] 5.3 Implement secure token storage with encryption utilities
  - [ ] 5.4 Set up BullMQ with Redis for background job processing
  - [ ] 5.5 Create email fetching service to retrieve banking notifications
  - [ ] 5.6 Integrate OpenAI API for regex pattern generation and improvement
  - [ ] 5.7 Implement transaction extraction logic using AI-generated patterns
  - [ ] 5.8 Create transaction categorization service with learning capabilities
  - [ ] 5.9 Set up scheduled jobs for hourly email processing
  - [ ] 5.10 Implement error handling and retry mechanisms for API failures
  - [ ] 5.11 Create webhook endpoints for real-time email notifications
  - [ ] 5.12 Add logging and monitoring for email processing pipeline
  - [ ] 5.13 Implement rate limiting and Gmail API quota management
  - [ ] 5.14 Create transaction feedback system for AI improvement
  - [ ] 5.15 Test email processing accuracy and performance

- [ ] 6.0 Frontend PWA & User Interface
  - [ ] 6.1 Set up Vite + React project with TypeScript and PWA plugin
  - [ ] 6.2 Configure Tailwind CSS and create design system components
  - [ ] 6.3 Implement PWA manifest and service worker for offline functionality
  - [ ] 6.4 Create responsive layout with mobile-first design approach
  - [ ] 6.5 Build main dashboard with budget overview and recent transactions
  - [ ] 6.6 Implement transaction list with filtering and search capabilities
  - [ ] 6.7 Create transaction detail view with edit and categorization options
  - [ ] 6.8 Build email account connection interface with OAuth flow
  - [ ] 6.9 Implement real-time updates using Supabase subscriptions
  - [ ] 6.10 Create offline sync functionality for PWA capabilities
  - [ ] 6.11 Add push notification support for budget alerts
  - [ ] 6.12 Implement data export functionality (CSV, PDF)
  - [ ] 6.13 Create settings page for user preferences and account management
  - [ ] 6.14 Add loading states, error handling, and user feedback
  - [ ] 6.15 Optimize performance and implement lazy loading
  - [ ] 6.16 Test PWA functionality and cross-device compatibility

- [ ] 7.0 Budget Management & Transaction Categorization
  - [ ] 7.1 Create budget category management system with CRUD operations
  - [ ] 7.2 Implement monthly budget limits and spending tracking
  - [ ] 7.3 Build automatic transaction categorization with AI assistance
  - [ ] 7.4 Create budget alert system for spending limit notifications
  - [ ] 7.5 Implement spending trend analysis and reporting features
  - [ ] 7.6 Build interactive charts and visualizations using Recharts
  - [ ] 7.7 Create budget vs actual spending comparison views
  - [ ] 7.8 Implement transaction recategorization with user feedback
  - [ ] 7.9 Add support for multiple currencies and exchange rates
  - [ ] 7.10 Create recurring transaction detection and management
  - [ ] 7.11 Implement budget goal setting and progress tracking
  - [ ] 7.12 Add budget sharing and export capabilities
  - [ ] 7.13 Create financial insights and recommendations system
  - [ ] 7.14 Test budget calculations and alert accuracy
