import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

console.log('🚀 Setting up Finance Analyzer...\n');

// Step 1: Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { cwd: rootDir, stdio: 'inherit' });
  console.log('✅ Dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// Step 2: Check for .env file
const envPath = path.join(rootDir, '.env');
const envExamplePath = path.join(rootDir, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from .env.example...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ .env file created');
  console.log('⚠️  Please edit .env and add your ANTHROPIC_API_KEY\n');
} else {
  console.log('✅ .env file already exists\n');
}

// Step 3: Create data directories
console.log('📁 Creating data directories...');
const dataDirs = [
  path.join(rootDir, 'data'),
  path.join(rootDir, 'data/uploads'),
  path.join(rootDir, 'data/reports'),
];

for (const dir of dataDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
console.log('✅ Data directories created\n');

// Step 4: Initialize database
console.log('🗄️  Initializing database...');
try {
  execSync('npm run init-db', { cwd: rootDir, stdio: 'inherit' });
  console.log('✅ Database initialized\n');
} catch (error) {
  console.error('❌ Failed to initialize database');
  process.exit(1);
}

console.log('🎉 Setup complete!\n');
console.log('Next steps:');
console.log('1. Edit .env and add your ANTHROPIC_API_KEY');
console.log('2. Run "npm run dev" to start the application');
console.log('3. Visit http://localhost:5173 in your browser\n');
