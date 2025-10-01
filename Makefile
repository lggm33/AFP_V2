# AFP Finance App - Makefile
# Personal Finance App with AI-Powered Email Transaction Detection

.PHONY: help setup dev build test lint format clean deploy install-deps check-deps

# Default target
.DEFAULT_GOAL := help

# Colors for output
CYAN := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

# Project info
PROJECT_NAME := AFP Finance App
VERSION := 1.0.0

## Help - Show available commands
help:
	@echo "$(CYAN)$(PROJECT_NAME) v$(VERSION)$(RESET)"
	@echo "$(CYAN)=====================================$(RESET)"
	@echo ""
	@echo "$(GREEN)Available commands:$(RESET)"
	@echo ""
	@echo "$(YELLOW)Setup & Installation:$(RESET)"
	@echo "  make setup          - Initial project setup"
	@echo "  make install-deps   - Install all dependencies"
	@echo "  make check-deps     - Check for outdated dependencies"
	@echo ""
	@echo "$(YELLOW)Development:$(RESET)"
	@echo "  make dev            - Start development servers"
	@echo "  make dev-web        - Start only frontend development"
	@echo "  make dev-api        - Start only backend development"
	@echo ""
	@echo "$(YELLOW)Build & Test:$(RESET)"
	@echo "  make build          - Build all applications"
	@echo "  make build-web      - Build only frontend"
	@echo "  make build-api      - Build only backend"
	@echo "  make test           - Run all tests"
	@echo "  make test-web       - Run frontend tests"
	@echo "  make test-api       - Run backend tests"
	@echo "  make test-watch     - Run tests in watch mode"
	@echo ""
	@echo "$(YELLOW)Code Quality:$(RESET)"
	@echo "  make lint           - Lint all code"
	@echo "  make lint-fix       - Lint and fix all code"
	@echo "  make format         - Format all code"
	@echo "  make type-check     - Run TypeScript type checking"
	@echo ""
	@echo "$(YELLOW)Database:$(RESET)"
	@echo "  make db-setup       - Setup Supabase locally"
	@echo "  make db-migrate     - Run database migrations"
	@echo "  make db-seed        - Seed database with test data"
	@echo "  make db-reset       - Reset local database"
	@echo ""
	@echo "$(YELLOW)Deployment:$(RESET)"
	@echo "  make deploy         - Deploy to Railway"
	@echo "  make deploy-web     - Deploy only frontend"
	@echo "  make deploy-api     - Deploy only backend"
	@echo ""
	@echo "$(YELLOW)Utilities:$(RESET)"
	@echo "  make clean          - Clean all build artifacts"
	@echo "  make clean-deps     - Clean node_modules"
	@echo "  make logs           - Show Railway logs"
	@echo "  make env-check      - Validate environment variables"

## Setup & Installation
setup: check-deps install-deps
	@echo "$(GREEN)✅ Project setup completed!$(RESET)"
	@echo "$(CYAN)Next steps:$(RESET)"
	@echo "  1. Copy .env.example to .env and configure"
	@echo "  2. Run 'make dev' to start development"

install-deps:
	@echo "$(CYAN)📦 Installing dependencies...$(RESET)"
	pnpm install

check-deps:
	@echo "$(CYAN)🔍 Checking dependencies...$(RESET)"
	@command -v node >/dev/null 2>&1 || { echo "$(RED)❌ Node.js is required$(RESET)"; exit 1; }
	@command -v pnpm >/dev/null 2>&1 || { echo "$(RED)❌ pnpm is required$(RESET)"; exit 1; }
	@echo "$(GREEN)✅ Dependencies check passed$(RESET)"

## Development
dev:
	@echo "$(CYAN)🚀 Starting development servers...$(RESET)"
	pnpm run --parallel --filter "@afp/web" --filter "@afp/email-service" dev

dev-web:
	@echo "$(CYAN)🌐 Starting frontend development...$(RESET)"
	pnpm --filter "@afp/web" dev

dev-api:
	@echo "$(CYAN)⚙️ Starting backend development...$(RESET)"
	pnpm --filter "@afp/email-service" dev

## Build & Test
build:
	@echo "$(CYAN)🔨 Building all applications...$(RESET)"
	pnpm -r build

build-web:
	@echo "$(CYAN)🌐 Building frontend...$(RESET)"
	pnpm --filter "@afp/web" build

build-api:
	@echo "$(CYAN)⚙️ Building backend...$(RESET)"
	pnpm --filter "@afp/email-service" build

test:
	@echo "$(CYAN)🧪 Running all tests...$(RESET)"
	pnpm -r test

test-web:
	@echo "$(CYAN)🌐 Running frontend tests...$(RESET)"
	pnpm --filter "@afp/web" test

test-api:
	@echo "$(CYAN)⚙️ Running backend tests...$(RESET)"
	pnpm --filter "@afp/email-service" test

test-watch:
	@echo "$(CYAN)👀 Running tests in watch mode...$(RESET)"
	pnpm -r test --watch

## Code Quality
lint:
	@echo "$(CYAN)🔍 Linting all code...$(RESET)"
	pnpm -r lint

lint-fix:
	@echo "$(CYAN)🔧 Linting and fixing all code...$(RESET)"
	pnpm -r lint --fix

format:
	@echo "$(CYAN)✨ Formatting all code...$(RESET)"
	pnpm -r format

type-check:
	@echo "$(CYAN)📝 Running TypeScript type checking...$(RESET)"
	@echo "$(CYAN)Checking shared-types...$(RESET)"
	pnpm --filter "@afp/shared-types" exec tsc --noEmit
	@echo "$(CYAN)Checking web app...$(RESET)"
	pnpm --filter "@afp/web" exec tsc --noEmit
	@echo "$(CYAN)Checking email service...$(RESET)"
	pnpm --filter "@afp/email-service" exec tsc --noEmit
	@echo "$(GREEN)✅ TypeScript check completed$(RESET)"

## Database
db-setup:
	@echo "$(CYAN)🗄️ Setting up Supabase locally...$(RESET)"
	@command -v supabase >/dev/null 2>&1 || { echo "$(RED)❌ Supabase CLI is required$(RESET)"; exit 1; }
	supabase init
	supabase start

db-migrate:
	@echo "$(CYAN)📊 Running database migrations...$(RESET)"
	supabase db push

db-seed:
	@echo "$(CYAN)🌱 Seeding database...$(RESET)"
	supabase db seed

db-reset:
	@echo "$(CYAN)🔄 Resetting local database...$(RESET)"
	supabase db reset

## Deployment
deploy:
	@echo "$(CYAN)🚀 Deploying to Railway...$(RESET)"
	@command -v railway >/dev/null 2>&1 || { echo "$(RED)❌ Railway CLI is required$(RESET)"; exit 1; }
	railway up

deploy-web:
	@echo "$(CYAN)🌐 Deploying frontend to Railway...$(RESET)"
	cd apps/web && railway up

deploy-api:
	@echo "$(CYAN)⚙️ Deploying backend to Railway...$(RESET)"
	cd apps/email-service && railway up

## Utilities
clean:
	@echo "$(CYAN)🧹 Cleaning build artifacts...$(RESET)"
	pnpm -r exec rm -rf dist build .next
	@echo "$(GREEN)✅ Clean completed$(RESET)"

clean-deps:
	@echo "$(CYAN)🧹 Cleaning node_modules...$(RESET)"
	find . -name "node_modules" -type d -prune -exec rm -rf {} +
	rm -f pnpm-lock.yaml
	@echo "$(GREEN)✅ Dependencies cleaned$(RESET)"

logs:
	@echo "$(CYAN)📋 Showing Railway logs...$(RESET)"
	railway logs

env-check:
	@echo "$(CYAN)🔍 Validating environment variables...$(RESET)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)⚠️ .env file not found. Copy .env.example to .env$(RESET)"; \
	else \
		echo "$(GREEN)✅ .env file found$(RESET)"; \
	fi

## Advanced Commands
update-deps:
	@echo "$(CYAN)📦 Updating dependencies...$(RESET)"
	pnpm update

security-audit:
	@echo "$(CYAN)🔒 Running security audit...$(RESET)"
	pnpm audit

fix-audit:
	@echo "$(CYAN)🔧 Fixing security issues...$(RESET)"
	pnpm audit --fix

workspace-info:
	@echo "$(CYAN)📊 Workspace information:$(RESET)"
	pnpm -r list --depth=0
