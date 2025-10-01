# Finance Analyzer

A privacy-first personal finance analyzer powered by Claude AI. Upload your bank CSV files and get AI-powered insights, automatic categorization, and intelligent budget tracking - all running locally on your machine.

## Features

- 🤖 **AI-Powered Categorization**: Automatically categorize transactions using Claude AI
- 📊 **Interactive Dashboard**: Visualize your spending with charts and insights
- 💰 **Budget Management**: Set and track budgets by category
- 📈 **Spending Analysis**: Detect trends, anomalies, and recurring subscriptions
- 💬 **AI Chat Assistant**: Ask questions about your finances in natural language
- 🔒 **Privacy-First**: All data stays on your machine
- 📁 **CSV Import**: Support for multiple bank formats

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite3
- **AI**: Claude API (Anthropic)
- **Charts**: Recharts

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Anthropic API Key ([get one here](https://console.anthropic.com/))

## Quick Start

### 1. Clone and Setup

\`\`\`bash
git clone <your-repo-url>
cd finance-analyzer
npm run setup
\`\`\`

### 2. Configure Environment

Edit `.env` and add your Anthropic API key:

\`\`\`env
ANTHROPIC_API_KEY=your_api_key_here
\`\`\`

### 3. Run the Application

\`\`\`bash
npm run dev
\`\`\`

This will start both the backend (port 3000) and frontend (port 5173).

Visit [http://localhost:5173](http://localhost:5173) to use the application.

## Project Structure

\`\`\`
finance-analyzer/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities and API client
├── backend/           # Express API server
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   ├── agents/       # AI agent configs
│   │   ├── parsers/      # CSV parsers
│   │   └── db/           # Database layer
├── config/            # Configuration files
├── data/              # Local data storage (gitignored)
└── scripts/           # Utility scripts
\`\`\`

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend for production
- `npm run init-db` - Initialize the database
- `npm run setup` - First-time setup (installs deps, creates .env, initializes DB)

## Supported Banks

Currently supported CSV formats:
- Chase Bank

More banks will be added. You can also create custom parsers by extending the `BaseParser` class.

## How It Works

1. **Upload**: Upload a CSV file from your bank
2. **Parse**: The system detects the bank format and parses transactions
3. **Categorize**: Claude AI automatically categorizes each transaction
4. **Review**: Review and adjust categories as needed
5. **Analyze**: Get insights, track budgets, and chat with your financial data

## Privacy & Security

- All financial data stays on your local machine
- SQLite database is stored locally in `data/transactions.db`
- CSV files are processed locally and can be deleted after import
- Only transaction descriptions are sent to Claude API for categorization
- No financial data is stored on external servers

## Development

### Adding a New Bank Parser

1. Create a new parser in `backend/src/parsers/`
2. Extend the `BaseParser` class
3. Implement `detectFormat()` and `parse()` methods
4. Register the parser in `ParserFactory.ts`

### Adding New Features

See `TASKS.md` for the development roadmap and remaining features to implement.

## License

ISC

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.
