
// This script will initialize the database
// Run with: node init-database.js

const { execSync } = require('child_process');
const fs = require('fs');

console.log('Initializing local database...');

// Create prisma directory if it doesn't exist
if (!fs.existsSync('./prisma')) {
  fs.mkdirSync('./prisma');
  console.log('Created prisma directory');
}

// Check if schema.prisma file exists
if (!fs.existsSync('./prisma/schema.prisma')) {
  console.error('schema.prisma file not found. Please make sure it exists at ./prisma/schema.prisma');
  process.exit(1);
}

try {
  // Generate Prisma client
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Create SQLite database and run migrations
  console.log('Creating database and running migrations...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('Database initialized successfully!');
  console.log('You can now run the application with: npm run dev');
} catch (error) {
  console.error('Error initializing database:', error);
  process.exit(1);
}
