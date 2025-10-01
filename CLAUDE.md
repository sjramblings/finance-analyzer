# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Finance Analyzer is a privacy-first personal finance analyzer powered by Claude AI. It's a monorepo with a React frontend and Node.js/Express backend that allows users to upload bank CSV files for AI-powered transaction categorization, budget tracking, and financial insights. All data stays local on the user's machine.

## Development Commands

### Setup and Installation
```bash
npm run setup              # First-time setup: installs deps, creates .env, initializes DB
npm run init-db            # Initialize the SQLite database
npm run seed               # Seed with demo data
```

### Development
```bash
npm run dev                # Start both frontend (port 5173) and backend (port 3000)
npm run dev:frontend       # Start frontend only
npm run dev:backend        # Start backend only (requires NODE_OPTIONS='--max-http-header-size=32768')
```

### Building
```bash
npm run build              # Build both frontend and backend
npm run build:frontend     # Build frontend only (includes TypeScript compilation)
npm run build:backend      # Build backend only (TypeScript compilation)
npm run typecheck          # Run TypeScript type checking on all workspaces
```

### Cleanup
```bash
npm run clean              # Remove dist folders and database
```

## Architecture Overview

### Monorepo Structure
This is an npm workspaces monorepo with two main packages:
- `frontend/` - React 18 + TypeScript + Vite + Tailwind CSS
- `backend/` - Express + TypeScript + SQLite

### Frontend Architecture
- **Pages**: Route-level components in `frontend/src/pages/` (HomePage, TransactionsPage, ChatPage, etc.)
- **Components**: Reusable UI components in `frontend/src/components/`
- **API Client**: Centralized in `frontend/src/lib/api.ts` using axios
- **State Management**: Custom React hooks in `frontend/src/hooks/` (useTransactions, useCategories, etc.)
- **Routing**: React Router v6 configured in App.tsx

### Backend Architecture
- **Services Layer**: Business logic in `backend/src/services/` (AgentService, TransactionService, CategoryService, BudgetService, etc.)
  - `AgentService.ts` - Wrapper around Anthropic SDK for AI operations (categorization, analysis, chat, reports)
  - Each service encapsulates specific domain logic and database operations
- **Routes**: API endpoints in `backend/src/routes/` following RESTful conventions
- **Database**: SQLite with promisified wrapper in `backend/src/db/database.ts`
  - Single instance exported as `db` singleton
  - Schema defined in `backend/src/db/schema.ts`
- **CSV Parsers**: Extensible parser system in `backend/src/parsers/`
  - `BaseParser.ts` - Abstract base class with common utilities
  - Bank-specific parsers extend BaseParser (e.g., `ChaseParser.ts`)
  - `ParserFactory.ts` - Detects format and returns appropriate parser

### AI Integration
The backend uses the Anthropic Claude API (not the Claude Agent SDK) for:
1. **Transaction Categorization** - Batch categorize transactions using structured prompts
2. **Spending Analysis** - Detect subscriptions, anomalies, trends, and recommendations
3. **Chat Assistant** - Natural language Q&A about finances
4. **Report Generation** - Monthly financial reports with insights

All AI operations go through `AgentService.ts` which uses `claude-3-5-sonnet-20241022` model.

### Database Schema
Key tables (see `backend/src/db/schema.ts` for full schema):
- `transactions` - Transaction records with category_id FK
- `categories` - Spending categories (can be hierarchical with parent_id)
- `budgets` - Budget targets by category and period
- `categorization_rules` - Pattern-based auto-categorization rules
- `recurring_transactions` - Detected subscriptions
- `insights` - AI-generated insights and alerts
- `chat_messages` - Chat history with the AI assistant
- `upload_jobs` - CSV upload processing status

## Key Implementation Details

### Parser System
To add a new bank parser:
1. Create class extending `BaseParser` in `backend/src/parsers/`
2. Implement `detectFormat()` (check CSV header patterns) and `parse()` methods
3. Use inherited helper methods: `parseCSV()`, `normalizeAmount()`, `parseDate()`, `extractMerchant()`
4. Register in `ParserFactory.ts`

### Transaction Categorization Flow
1. CSV uploaded via `/api/upload` endpoint
2. ParserFactory detects bank format and parses CSV
3. AgentService.categorizeTransactions() sends batch to Claude API
4. Returns structured JSON with suggested categories and confidence scores
5. Frontend displays for user review/correction
6. Confirmed transactions saved to database

### Configuration
- Backend config in `backend/src/config.ts` reads from `.env`
- Required: `ANTHROPIC_API_KEY`
- Database path: `data/transactions.db` (gitignored)
- Default categories defined in `config/categories.json`

### NODE_OPTIONS Header Size
Both frontend and backend require `NODE_OPTIONS='--max-http-header-size=32768'` to handle large AI responses. This is set in:
- `frontend/package.json` dev script
- `backend/package.json` dev/start scripts
- `backend/src/index.ts` server configuration

## Common Development Tasks

### Working with Services
When adding new functionality:
1. Add business logic to appropriate service in `backend/src/services/`
2. Create route handler in `backend/src/routes/`
3. Export route from `backend/src/routes/index.ts`
4. Update frontend API client in `frontend/src/lib/api.ts`
5. Create React hook if needed in `frontend/src/hooks/`

### Database Changes
1. Update schema in `backend/src/db/schema.ts`
2. Delete existing `data/transactions.db`
3. Run `npm run init-db` to recreate with new schema
4. Update TypeScript types in relevant service files

### AI Prompt Changes
AI agent prompts are defined in `AgentService.ts` methods:
- `categorizeTransactions()` - Transaction categorization
- `analyzeSpending()` - Pattern analysis
- `chat()` - Chat assistant
- `generateReport()` - Report generation

Each method constructs a prompt and calls the Anthropic API with structured output expectations.

## Privacy & Security Notes
- All financial data stays in local SQLite database
- Only transaction descriptions sent to Claude API for categorization
- No account numbers or sensitive PII sent to external services
- Database and uploads folders are gitignored
