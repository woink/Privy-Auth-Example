#!/usr/bin/env node

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

// Print a colored message
function printColored(message, color) {
  console.log(`${color}${message}${colors.reset}`);
}

// Execute a command and print its output
function executeCommand(command, errorMessage) {
  try {
    printColored(`Executing: ${command}`, colors.blue);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    printColored(errorMessage || `Failed to execute: ${command}`, colors.red);
    printColored(error.message, colors.red);
    return false;
  }
}

// Main setup function
function setup() {
  printColored(
    '\n📦 Setting up ECDSA Node Next.js Application...\n',
    colors.green,
  );

  // Check if package.json exists
  if (!fs.existsSync(path.join(__dirname, 'package.json'))) {
    printColored(
      'package.json not found. Are you in the correct directory?',
      colors.red,
    );
    process.exit(1);
  }

  // Install dependencies
  printColored('🔧 Installing dependencies...', colors.green);
  if (!executeCommand('npm install', 'Failed to install dependencies')) {
    process.exit(1);
  }

  // Create necessary directories if they don't exist
  printColored('📁 Creating necessary directories...', colors.green);
  const dirs = [path.join(__dirname, 'src/db')];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      printColored(`Created directory: ${dir}`, colors.blue);
    }
  }

  // Create the accounts.json file if it doesn't exist
  const accountsPath = path.join(__dirname, 'src/db/accounts.json');
  if (!fs.existsSync(accountsPath)) {
    printColored('📝 Creating initial accounts.json...', colors.green);

    const initialData = {
      balances: {
        '0xcccafaac77543495ceaf76ee9d46b4d28cbc3805': 100,
        '0xf86d274f271043a753de43c510d2f5bfa17760df': 100,
        '0x3cb9c9d9692977778418448877f1457bc186e231': 100,
      },
      users: [
        {
          privateKey:
            '04030d7ff9412e8c9d833c1606543eaa153fda0b2e35e5d3053732497c91eb1d',
          publicKey:
            '04e2d688585204645d6593341213f4b42bc0fe5b34d2e14eee4e23f9644464f52f7db2ca5024d212fa300af06fcccafaac77543495ceaf76ee9d46b4d28cbc3805',
          address: '0xcccafaac77543495ceaf76ee9d46b4d28cbc3805',
          balance: 100,
        },
        {
          privateKey:
            'e3718d582a9a22352b9a28f9f73d67f34f3b22a78e85b4c1a3623e57fc7d28b1',
          publicKey:
            '0463146e6d8a3266dda6b27f24bc75ad541108e41e8e44ad5b3ff9abd506035a7daa1753ff4c3bcaae23b62703f86d274f271043a753de43c510d2f5bfa17760df',
          address: '0xf86d274f271043a753de43c510d2f5bfa17760df',
          balance: 100,
        },
        {
          privateKey:
            '49626a059cb6fa6da4dfa4b51c6e11a5ab3ae0162fb830a9b5ba456d115c4349',
          publicKey:
            '047200112b5a0a07032cc280f4a659a100ecd2a9e0e10f1cd69c7294ef518a9453eab0305c5a0ddd02d2b392d23cb9c9d9692977778418448877f1457bc186e231',
          address: '0x3cb9c9d9692977778418448877f1457bc186e231',
          balance: 100,
        },
      ],
    };

    fs.writeFileSync(accountsPath, JSON.stringify(initialData, null, 2));
    printColored('Created accounts.json with initial data', colors.blue);
  }

  // Start the development server
  printColored(
    '\n🚀 Setup completed! Starting the development server...\n',
    colors.green,
  );
  executeCommand('npm run dev');
}

// Run the setup
setup();
