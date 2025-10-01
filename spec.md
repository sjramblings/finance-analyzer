# Finance Analyzer - Complete Development Specification

## Project Overview

A local web application that uses the Claude Agent SDK to analyze personal financial transactions. Users upload CSV files from their bank, and AI agents automatically categorize transactions, detect patterns, generate insights, and answer natural language questions about spending.

**Core Value Proposition**: Privacy-first financial analysis with AI-powered insights, running entirely on your local machine.

---

## Technical Architecture

### Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite3
- **AI Integration**:
  - Direct Anthropic API (@anthropic-ai/sdk)
  - AWS Bedrock (@anthropic-ai/bedrock-sdk) - supports Claude models via AWS
- **UI Components**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Real-time**: WebSocket (ws library)
- **Process Management**: concurrently

### Project Structure
```
finance-analyzer/
├── package.json                    # Root package with workspace config
├── .env.example                    # Environment variables template
├── .gitignore
├── README.md
├── docker-compose.yml              # Optional containerization
│
├── frontend/                       # React application
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── public/
│   │   └── favicon.ico
│   └── src/
│       ├── main.tsx                # App entry point
│       ├── App.tsx                 # Root component with routing
│       ├── vite-env.d.ts
│       │
│       ├── components/             # React components
│       │   ├── layout/
│       │   │   ├── Header.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   └── Layout.tsx
│       │   ├── dashboard/
│       │   │   ├── Dashboard.tsx
│       │   │   ├── StatsCard.tsx
│       │   │   ├── SpendingChart.tsx
│       │   │   ├── BudgetProgress.tsx
│       │   │   └── InsightsPanel.tsx
│       │   ├── transactions/
│       │   │   ├── TransactionTable.tsx
│       │   │   ├── TransactionRow.tsx
│       │   │   ├── TransactionFilters.tsx
│       │   │   └── CategoryBadge.tsx
│       │   ├── upload/
│       │   │   ├── UploadZone.tsx
│       │   │   ├── UploadProgress.tsx
│       │   │   └── CategoryReview.tsx
│       │   ├── chat/
│       │   │   ├── ChatInterface.tsx
│       │   │   ├── MessageList.tsx
│       │   │   ├── MessageInput.tsx
│       │   │   └── ChatMessage.tsx
│       │   ├── budget/
│       │   │   ├── BudgetManager.tsx
│       │   │   ├── CategoryBudget.tsx
│       │   │   └── BudgetForm.tsx
│       │   ├── reports/
│       │   │   ├── ReportsList.tsx
│       │   │   ├── MonthlyReport.tsx
│       │   │   └── ReportExport.tsx
│       │   └── ui/                 # shadcn/ui components
│       │       ├── button.tsx
│       │       ├── card.tsx
│       │       ├── dialog.tsx
│       │       ├── input.tsx
│       │       ├── select.tsx
│       │       ├── table.tsx
│       │       └── ... (other shadcn components)
│       │
│       ├── pages/                  # Page components
│       │   ├── HomePage.tsx
│       │   ├── TransactionsPage.tsx
│       │   ├── BudgetPage.tsx
│       │   ├── ReportsPage.tsx
│       │   ├── ChatPage.tsx
│       │   └── SettingsPage.tsx
│       │
│       ├── hooks/                  # Custom React hooks
│       │   ├── useTransactions.ts
│       │   ├── useCategories.ts
│       │   ├── useBudget.ts
│       │   ├── useWebSocket.ts
│       │   ├── useAgentStream.ts
│       │   └── useInsights.ts
│       │
│       ├── lib/                    # Utilities and API client
│       │   ├── api.ts              # Axios/fetch wrapper
│       │   ├── websocket.ts        # WebSocket client
│       │   ├── utils.ts            # Helper functions
│       │   └── format.ts           # Formatters (currency, date)
│       │
│       ├── types/                  # TypeScript types
│       │   ├── transaction.ts
│       │   ├── category.ts
│       │   ├── budget.ts
│       │   └── api.ts
│       │
│       └── styles/
│           └── globals.css         # Global styles + Tailwind
│
├── backend/                        # Express API server
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                # Server entry point
│       ├── server.ts               # Express app setup
│       ├── config.ts               # Configuration management
│       │
│       ├── routes/                 # API route handlers
│       │   ├── index.ts            # Route aggregator
│       │   ├── transactions.ts     # Transaction CRUD
│       │   ├── upload.ts           # CSV upload endpoints
│       │   ├── categories.ts       # Category management
│       │   ├── budget.ts           # Budget endpoints
│       │   ├── reports.ts          # Report generation
│       │   ├── insights.ts         # AI insights
│       │   ├── chat.ts             # Chat with agent
│       │   └── websocket.ts        # WebSocket handler
│       │
│       ├── services/               # Business logic
│       │   ├── AgentService.ts     # Claude Agent SDK wrapper
│       │   ├── TransactionService.ts
│       │   ├── CategoryService.ts
│       │   ├── BudgetService.ts
│       │   ├── ReportService.ts
│       │   ├── InsightService.ts
│       │   ├── UploadService.ts
│       │   └── ChatService.ts
│       │
│       ├── agents/                 # Agent configurations
│       │   ├── categorizer.ts      # Transaction categorization agent
│       │   ├── analyzer.ts         # Pattern analysis agent
│       │   ├── reporter.ts         # Report generation agent
│       │   └── assistant.ts        # Chat assistant agent
│       │
│       ├── parsers/                # CSV parsers for different banks
│       │   ├── BaseParser.ts
│       │   ├── ChaseParser.ts
│       │   ├── BankOfAmericaParser.ts
│       │   ├── WellsFargoParser.ts
│       │   ├── AmexParser.ts
│       │   └── ParserFactory.ts
│       │
│       ├── db/                     # Database layer
│       │   ├── database.ts         # SQLite connection
│       │   ├── schema.ts           # Table schemas
│       │   ├── migrations/         # Database migrations
│       │   │   ├── 001_initial.sql
│       │   │   ├── 002_add_insights.sql
│       │   │   └── migration-runner.ts
│       │   └── repositories/       # Data access layer
│       │       ├── TransactionRepository.ts
│       │       ├── CategoryRepository.ts
│       │       ├── BudgetRepository.ts
│       │       ├── InsightRepository.ts
│       │       └── ChatRepository.ts
│       │
│       ├── middleware/             # Express middleware
│       │   ├── errorHandler.ts
│       │   ├── validation.ts
│       │   ├── logger.ts
│       │   └── rateLimiter.ts
│       │
│       ├── utils/                  # Utility functions
│       │   ├── logger.ts
│       │   ├── validators.ts
│       │   └── helpers.ts
│       │
│       └── types/                  # TypeScript types
│           ├── transaction.ts
│           ├── category.ts
│           ├── agent.ts
│           └── api.ts
│
├── .claude/                        # Claude Agent SDK configuration
│   ├── agents/
│   │   ├── categorizer.md          # Categorization agent prompt
│   │   ├── analyzer.md             # Analysis agent prompt
│   │   ├── reporter.md             # Reporter agent prompt
│   │   └── assistant.md            # Chat assistant prompt
│   └── settings.json               # Agent settings (hooks, permissions)
│
├── data/                           # Local data storage
│   ├── transactions.db             # SQLite database (gitignored)
│   ├── uploads/                    # Temporary CSV uploads (gitignored)
│   └── reports/                    # Generated reports (gitignored)
│
├── config/                         # Application configuration
│   ├── categories.json             # Default categories
│   ├── rules.json                  # Default categorization rules
│   └── banks.json                  # Supported bank formats
│
└── scripts/                        # Utility scripts
    ├── init-db.ts                  # Initialize database
    ├── seed-demo.ts                # Seed with demo data
    └── setup.ts                    # First-time setup script
```

---

## Database Schema

### SQLite Tables

```sql
-- Categories table
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  parent_id INTEGER,
  icon TEXT,
  color TEXT,
  budget_amount DECIMAL(10,2),
  is_system BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Transactions table
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category_id INTEGER,
  merchant TEXT,
  account_name TEXT,
  account_last4 TEXT,
  transaction_type TEXT CHECK(transaction_type IN ('debit', 'credit', 'transfer')),
  original_description TEXT,
  notes TEXT,
  is_recurring BOOLEAN DEFAULT 0,
  recurring_group_id INTEGER,
  confidence_score DECIMAL(3,2),
  manually_categorized BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (recurring_group_id) REFERENCES recurring_transactions(id) ON DELETE SET NULL
);

CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_merchant ON transactions(merchant);

-- Categorization rules
CREATE TABLE categorization_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pattern TEXT NOT NULL,
  category_id INTEGER NOT NULL,
  priority INTEGER DEFAULT 0,
  is_regex BOOLEAN DEFAULT 0,
  confidence REAL DEFAULT 1.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used TIMESTAMP,
  usage_count INTEGER DEFAULT 0,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX idx_rules_pattern ON categorization_rules(pattern);

-- Recurring transactions (subscriptions)
CREATE TABLE recurring_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant TEXT NOT NULL,
  category_id INTEGER,
  expected_amount DECIMAL(10,2),
  frequency TEXT CHECK(frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  last_seen DATE,
  next_expected DATE,
  is_active BOOLEAN DEFAULT 1,
  price_history TEXT, -- JSON array of {date, amount}
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Budget targets
CREATE TABLE budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  period TEXT CHECK(period IN ('monthly', 'quarterly', 'yearly')) DEFAULT 'monthly',
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE(category_id, start_date, period)
);

-- Insights
CREATE TABLE insights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('anomaly', 'trend', 'recommendation', 'alert')),
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 0,
  metadata TEXT, -- JSON
  is_dismissed BOOLEAN DEFAULT 0,
  is_read BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

CREATE INDEX idx_insights_created ON insights(created_at);
CREATE INDEX idx_insights_dismissed ON insights(is_dismissed);

-- Chat messages
CREATE TABLE chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata TEXT, -- JSON for attachments, charts, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_session ON chat_messages(session_id);

-- Upload jobs
CREATE TABLE upload_jobs (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
  total_transactions INTEGER,
  processed_transactions INTEGER,
  bank_format TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_upload_status ON upload_jobs(status);
```

### Default Categories

```json
[
  {"name": "Groceries", "icon": "🛒", "color": "#10b981"},
  {"name": "Dining Out", "icon": "🍽️", "color": "#f59e0b"},
  {"name": "Transportation", "icon": "🚗", "color": "#3b82f6"},
  {"name": "Entertainment", "icon": "🎬", "color": "#8b5cf6"},
  {"name": "Shopping", "icon": "🛍️", "color": "#ec4899"},
  {"name": "Utilities", "icon": "💡", "color": "#6366f1"},
  {"name": "Healthcare", "icon": "🏥", "color": "#14b8a6"},
  {"name": "Insurance", "icon": "🛡️", "color": "#06b6d4"},
  {"name": "Housing", "icon": "🏠", "color": "#64748b"},
  {"name": "Personal Care", "icon": "💅", "color": "#d946ef"},
  {"name": "Education", "icon": "📚", "color": "#84cc16"},
  {"name": "Gifts & Donations", "icon": "🎁", "color": "#f43f5e"},
  {"name": "Travel", "icon": "✈️", "color": "#0ea5e9"},
  {"name": "Subscriptions", "icon": "📱", "color": "#a855f7"},
  {"name": "Income", "icon": "💰", "color": "#22c55e"},
  {"name": "Transfers", "icon": "🔄", "color": "#94a3b8"},
  {"name": "Other", "icon": "📋", "color": "#71717a"}
]
```

---

## API Specification

### REST Endpoints

#### Transactions

```
GET    /api/transactions
Query params: 
  - page: number (default: 1)
  - limit: number (default: 50)
  - category: number (category ID)
  - startDate: string (ISO date)
  - endDate: string (ISO date)
  - merchant: string (search term)
  - minAmount: number
  - maxAmount: number
Response: {
  transactions: Transaction[],
  pagination: { page, limit, total, totalPages }
}

GET    /api/transactions/:id
Response: Transaction

PUT    /api/transactions/:id
Body: { category_id?, notes?, manually_categorized? }
Response: Transaction

DELETE /api/transactions/:id
Response: { success: boolean }

PUT    /api/transactions/:id/category
Body: { category_id: number }
Response: Transaction
```

#### Upload

```
POST   /api/upload
Content-Type: multipart/form-data
Body: { file: File }
Response: { jobId: string }

GET    /api/upload/:jobId/status
Response: {
  jobId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  progress: { current: number, total: number },
  transactions?: Transaction[]
}

POST   /api/upload/:jobId/confirm
Body: { corrections?: { transactionId: number, categoryId: number }[] }
Response: { success: boolean, savedCount: number }
```

#### Categories

```
GET    /api/categories
Response: Category[]

POST   /api/categories
Body: { name: string, icon?: string, color?: string, parent_id?: number }
Response: Category

PUT    /api/categories/:id
Body: { name?, icon?, color?, budget_amount? }
Response: Category

DELETE /api/categories/:id
Response: { success: boolean }

GET    /api/categories/:id/rules
Response: CategorizationRule[]

POST   /api/categories/:id/rules
Body: { pattern: string, priority?: number, is_regex?: boolean }
Response: CategorizationRule
```

#### Budget

```
GET    /api/budget
Query params: period?: 'monthly' | 'quarterly' | 'yearly'
Response: {
  budgets: Budget[],
  spending: { categoryId: number, amount: number, percentage: number }[]
}

PUT    /api/budget/:categoryId
Body: { amount: number, period: string }
Response: Budget

GET    /api/budget/status
Query params: month?: string (YYYY-MM)
Response: {
  total_budget: number,
  total_spent: number,
  remaining: number,
  categories: {
    category: Category,
    budget: number,
    spent: number,
    percentage: number,
    status: 'under' | 'near' | 'over'
  }[]
}
```

#### Reports

```
GET    /api/reports/monthly/:month
Params: month (YYYY-MM)
Response: {
  summary: { total_spent, total_income, net, transaction_count },
  by_category: { category: Category, amount: number, percentage: number }[],
  trends: { category: string, change_pct: number }[],
  top_merchants: { merchant: string, amount: number, count: number }[]
}

GET    /api/reports/spending-trends
Query params: startDate, endDate, groupBy: 'day' | 'week' | 'month'
Response: {
  data: { date: string, amount: number }[],
  by_category: { category: string, data: { date: string, amount: number }[] }[]
}

GET    /api/reports/subscriptions
Response: {
  active: RecurringTransaction[],
  inactive: RecurringTransaction[],
  total_monthly: number,
  price_changes: { subscription: RecurringTransaction, old: number, new: number, date: string }[]
}
```

#### Insights

```
GET    /api/insights
Query params: dismissed?: boolean, type?: string
Response: Insight[]

POST   /api/insights/generate
Response: { generated: number, insights: Insight[] }

PUT    /api/insights/:id/dismiss
Response: { success: boolean }

DELETE /api/insights/:id
Response: { success: boolean }
```

#### Chat

```
POST   /api/chat
Body: { message: string, sessionId?: string }
Response: { sessionId: string, response: string, metadata?: any }

GET    /api/chat/sessions
Response: { sessionId: string, lastMessage: string, timestamp: string }[]

GET    /api/chat/sessions/:sessionId
Response: ChatMessage[]

DELETE /api/chat/sessions/:sessionId
Response: { success: boolean }
```

### WebSocket Events

```
// Client → Server
{
  type: 'chat.message',
  payload: { sessionId: string, message: string }
}

{
  type: 'upload.start',
  payload: { jobId: string }
}

// Server → Client
{
  type: 'agent.thinking',
  payload: { message: string }
}

{
  type: 'agent.progress',
  payload: { step: string, current: number, total: number }
}

{
  type: 'agent.message',
  payload: { content: string, metadata?: any }
}

{
  type: 'upload.progress',
  payload: { jobId: string, current: number, total: number, status: string }
}

{
  type: 'insight.new',
  payload: Insight
}

{
  type: 'transaction.categorized',
  payload: { transactionId: number, categoryId: number, confidence: number }
}
```

---

## AI Integration

### Supported Providers

The application supports two ways to access Claude AI models:

1. **Direct Anthropic API** - Use your Anthropic API key
   - Configuration: `ANTHROPIC_API_KEY` environment variable
   - Best for: Direct access to Anthropic's API
   - Package: `@anthropic-ai/sdk`

2. **AWS Bedrock** - Access Claude models through AWS
   - Configuration: AWS credentials (access key, secret key, region)
   - Best for: Enterprise deployments, AWS-integrated environments
   - Package: `@anthropic-ai/bedrock-sdk`
   - Supported models: `anthropic.claude-3-5-sonnet-20241022-v2:0`, `global.anthropic.claude-sonnet-4-5-20250929-v1:0`

The system automatically detects which provider to use based on available configuration:
- If AWS credentials are configured (AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY), uses AWS Bedrock
- Otherwise, falls back to direct Anthropic API if ANTHROPIC_API_KEY is set
- If neither is configured, AI features are disabled gracefully

### Environment Configuration

```bash
# Option 1: Direct Anthropic API
ANTHROPIC_API_KEY=sk-ant-xxx

# Option 2: AWS Bedrock
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
# Optional for temporary credentials:
AWS_SESSION_TOKEN=...

# Option 3: AWS Default Credentials
# Leave AWS keys blank to use default AWS credential providers:
# - ~/.aws/credentials
# - EC2 instance profile
# - ECS task role
AWS_REGION=us-west-2
```

### Agent Configurations

#### Categorizer Agent (.claude/agents/categorizer.md)

```markdown
# Transaction Categorizer Agent

You are a financial transaction categorization specialist.

## Your Role
Analyze transaction descriptions and categorize them accurately based on:
1. Merchant name patterns
2. Transaction amount and context
3. Historical categorization rules
4. User corrections and feedback

## Available Tools
- FileSystem: Read categorization rules from config/rules.json
- CodeExecution: Run pattern matching and confidence scoring

## Process
1. Load existing categorization rules
2. For each transaction:
   - Check for exact merchant matches
   - Apply regex patterns
   - Use context clues (amount, date, description)
   - Assign confidence score (0.0 - 1.0)
3. Flag low-confidence transactions for user review (<0.7)
4. Learn from corrections by updating rules

## Categories Available
{categories will be injected here}

## Output Format
For each transaction, return JSON:
{
  "transactionId": number,
  "suggestedCategory": string,
  "confidence": number,
  "reasoning": string,
  "alternatives": [{ "category": string, "confidence": number }]
}
```

#### Analyzer Agent (.claude/agents/analyzer.md)

```markdown
# Financial Analysis Agent

You are a personal finance analyst specializing in pattern detection and insights.

## Your Role
Analyze transaction data to identify:
1. Recurring subscriptions and price changes
2. Spending trends and anomalies
3. Budget performance
4. Optimization opportunities

## Available Tools
- FileSystem: Read transactions from database
- CodeExecution: Statistical analysis and pattern detection
- Bash: Query SQLite database

## Analysis Types

### Subscription Detection
- Identify transactions that occur regularly (monthly, yearly)
- Track price changes over time
- Flag new subscriptions

### Anomaly Detection
- Transactions >2 standard deviations from category average
- Unusual merchants or transaction types
- Duplicate or potentially fraudulent charges

### Trend Analysis
- Month-over-month spending changes
- Category growth/decline patterns
- Seasonal variations

### Budget Analysis
- Current spending vs. budget targets
- Projected end-of-month spending
- Categories at risk of exceeding budget

## Output Format
Return structured JSON with:
{
  "subscriptions": RecurringTransaction[],
  "anomalies": Anomaly[],
  "trends": Trend[],
  "recommendations": Recommendation[]
}
```

#### Reporter Agent (.claude/agents/reporter.md)

```markdown
# Financial Report Generator

You are a financial report writer who creates clear, actionable summaries.

## Your Role
Generate comprehensive financial reports including:
1. Executive summaries with key metrics
2. Category breakdowns with visualizations
3. Trends and comparisons
4. Actionable recommendations

## Available Tools
- FileSystem: Read transaction data and previous reports
- CodeExecution: Calculate statistics and generate charts
- Bash: Query database for aggregations

## Report Types

### Monthly Summary
- Total spending, income, and net
- Top 5 spending categories
- Budget performance
- Month-over-month comparisons
- Notable changes or anomalies

### Category Deep Dive
- Detailed breakdown for a specific category
- Top merchants
- Trend over time
- Comparison to average

### Subscription Report
- All active subscriptions
- Total monthly cost
- Recent price changes
- Unused or rarely used subscriptions

## Output Format
Generate both:
1. Markdown for readability
2. JSON with structured data for visualizations

Include specific numbers, percentages, and clear recommendations.
```

#### Assistant Agent (.claude/agents/assistant.md)

```markdown
# Personal Finance Assistant

You are a helpful financial advisor who answers questions about the user's spending.

## Your Role
- Answer natural language questions about transactions
- Provide context and insights
- Offer personalized recommendations
- Be conversational and supportive

## Available Tools
- FileSystem: Access all transaction data
- CodeExecution: Perform calculations
- Bash: Query database for specific information

## Guidelines
1. Always provide specific numbers and dates
2. Compare to historical data when relevant
3. Offer actionable suggestions
4. Be encouraging about good financial habits
5. Ask clarifying questions if needed

## Example Interactions

User: "How much did I spend on coffee last month?"
Assistant: "You spent $127.45 on coffee in September across 18 transactions. 
That's 23% more than August ($103.50). Your main spots were:
- Starbucks: $89.20 (14 visits)
- Peet's: $28.50 (3 visits)
- Local café: $9.75 (1 visit)

Consider brewing at home 2-3 days per week to save ~$40/month."

User: "Where can I cut back?"
Assistant: [Analyzes spending patterns and provides specific recommendations]
```

### Agent Service Implementation Pattern

```typescript
// backend/src/services/AgentService.ts
import { ClaudeSDKClient } from 'claude-code-sdk';

export class AgentService {
  private client: ClaudeSDKClient;

  constructor() {
    this.client = new ClaudeSDKClient({
      apiKey: process.env.ANTHROPIC_API_KEY!,
      cwd: process.cwd(),
      permissionMode: 'acceptEdits',
      allowedTools: ['FileSystem', 'Bash', 'CodeExecution']
    });
  }

  // Categorize transactions
  async categorizeTransactions(transactions: Transaction[]): Promise<CategorizedTransaction[]> {
    const prompt = `
      Categorize these transactions using the categorizer agent.
      Read rules from config/rules.json.
      
      Transactions:
      ${JSON.stringify(transactions, null, 2)}
    `;

    const result = await this.client.query(prompt, {
      outputFormat: 'json',
      appendSystemPrompt: 'Use the categorizer agent configuration.'
    });

    return JSON.parse(result.finalOutput);
  }

  // Stream categorization with progress
  async *streamCategorization(transactions: Transaction[]) {
    const prompt = `
      Categorize these ${transactions.length} transactions one by one.
      Report progress after each transaction.
      ${JSON.stringify(transactions, null, 2)}
    `;

    for await (const message of this.client.query(prompt, {
      outputFormat: 'stream-json'
    })) {
      if (message.role === 'assistant') {
        yield message;
      }
    }
  }

  // Analyze spending patterns
  async analyzeSpending(startDate: string, endDate: string) {
    const prompt = `
      Analyze spending patterns between ${startDate} and ${endDate}.
      Query transactions.db for data.
      Use the analyzer agent to detect:
      - Subscriptions
      - Anomalies
      - Trends
      - Budget status
      
      Return structured JSON with findings.
    `;

    const result = await this.client.query(prompt, {
      outputFormat: 'json'
    });

    return JSON.parse(result.finalOutput);
  }

  // Generate report
  async generateReport(month: string, type: 'monthly' | 'category' | 'subscription') {
    const prompt = `
      Generate a ${type} report for ${month}.
      Use the reporter agent configuration.
      Include visualizations and actionable insights.
    `;

    const result = await this.client.query(prompt, {
      outputFormat: 'json'
    });

    return JSON.parse(result.finalOutput);
  }

  // Chat interface
  async chat(message: string, sessionId?: string) {
    const systemPrompt = `
      You are a personal finance assistant.
      Access the user's transaction database to answer questions.
      Provide specific numbers and actionable advice.
    `;

    const result = this.client.query(message, {
      resume: sessionId,
      outputFormat: 'stream-json',
      appendSystemPrompt: systemPrompt
    });

    return result; // Return async iterator
  }
}
```

---

## CSV Parser Implementation

### Parser Interface

```typescript
// backend/src/parsers/BaseParser.ts
export interface ParsedTransaction {
  date: Date;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  originalDescription: string;
  merchant?: string;
  category?: string;
}

export abstract class BaseParser {
  abstract bankName: string;
  abstract detectFormat(csvContent: string): boolean;
  abstract parse(csvContent: string): ParsedTransaction[];
  
  protected normalizeAmount(amount: string): number {
    // Remove currency symbols, commas
    return parseFloat(amount.replace(/[$,]/g, ''));
  }
  
  protected parseDate(dateString: string): Date {
    // Handle various date formats
    return new Date(dateString);
  }
}
```

### Example: Chase Parser

```typescript
// backend/src/parsers/ChaseParser.ts
export class ChaseParser extends BaseParser {
  bankName = 'Chase';
  
  detectFormat(csvContent: string): boolean {
    const firstLine = csvContent.split('\n')[0];
    return firstLine.includes('Details,Posting Date,Description,Amount');
  }
  
  parse(csvContent: string): ParsedTransaction[] {
    const lines = csvContent.split('\n').slice(1); // Skip header
    return lines.map(line => {
      const [details, postingDate, description, amount, type, balance, checkNumber] = 
        line.split(',');
      
      return {
        date: this.parseDate(postingDate),
        description: description.trim(),
        amount: Math.abs(this.normalizeAmount(amount)),
        type: type.toLowerCase() === 'debit' ? 'debit' : 'credit',
        originalDescription: description,
        merchant: this.extractMerchant(description)
      };
    }).filter(t => t.amount > 0);
  }
  
  private extractMerchant
