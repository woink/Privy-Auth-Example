import fs from 'node:fs';
import path from 'node:path';

export interface User {
  privateKey: string;
  publicKey: string;
  address: string;
  balance: number;
}

export interface AccountsData {
  balances: Record<string, number>;
  users: User[];
}

// Initial data if no file exists
const initialData: AccountsData = {
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

// Function to load account data
export function getAccounts(): AccountsData {
  try {
    // In Next.js, we need to use an absolute path for the data file
    const dbPath = path.join(process.cwd(), 'src/db/accounts.json');

    // Check if the file exists
    if (!fs.existsSync(dbPath)) {
      // Create the file with initial data if it doesn't exist
      fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
      return initialData;
    }

    // Read the file if it exists
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data) as AccountsData;
  } catch (error) {
    console.error('Error loading account data:', error);
    return initialData;
  }
}

// Function to save account data
export function saveAccounts(data: AccountsData): void {
  try {
    const dbPath = path.join(process.cwd(), 'src/db/accounts.json');
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving account data:', error);
  }
}

// Function to update balance
export function updateBalance(
  sender: string,
  recipient: string,
  amount: number,
): { success: boolean; newBalance?: number; message?: string } {
  const accounts = getAccounts();

  // Initialize balances if they don't exist
  if (!accounts.balances[sender]) {
    accounts.balances[sender] = 0;
  }

  if (!accounts.balances[recipient]) {
    accounts.balances[recipient] = 0;
  }

  // Check if sender has enough funds
  if (accounts.balances[sender] < amount) {
    return { success: false, message: 'Not enough funds!' };
  }

  // Update balances
  accounts.balances[sender] -= amount;
  accounts.balances[recipient] += amount;

  // Update user balances as well
  for (const user of accounts.users) {
    if (user.address === sender) {
      user.balance = accounts.balances[sender];
    }
    if (user.address === recipient) {
      user.balance = accounts.balances[recipient];
    }
  }

  // Save updated data
  saveAccounts(accounts);

  return { success: true, newBalance: accounts.balances[sender] };
}

// Function to get balance
export function getBalance(address: string): number {
  const accounts = getAccounts();
  return accounts.balances[address] || 0;
}
