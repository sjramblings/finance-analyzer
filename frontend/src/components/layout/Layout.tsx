import { Link, Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold">
                💰 Finance Analyzer
              </Link>
              <div className="flex space-x-4">
                <Link
                  to="/"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Dashboard
                </Link>
                <Link
                  to="/transactions"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Transactions
                </Link>
                <Link
                  to="/upload"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Upload
                </Link>
                <Link
                  to="/budget"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Budget
                </Link>
                <Link
                  to="/insights"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Insights
                </Link>
                <Link
                  to="/chat"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Chat
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
