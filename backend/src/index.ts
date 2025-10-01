import { createServer } from './server.js';
import { config } from './config.js';
import { db } from './db/database.js';

async function startServer() {
  try {
    // Connect to database
    await db.connect();
    await db.initialize();

    // Start server
    const app = createServer();

    const server = app.listen(config.port, () => {
      console.log(`🚀 Finance Analyzer backend running on port ${config.port}`);
      console.log(`📊 Health check: http://localhost:${config.port}/health`);
      console.log(`📡 API: http://localhost:${config.port}/api`);
    });

    // Increase header size limit to handle large requests
    server.maxHeadersCount = 0;
    server.headersTimeout = 60000; // 60 seconds
    server.requestTimeout = 120000; // 120 seconds
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
