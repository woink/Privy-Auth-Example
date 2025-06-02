# Web3 Wallet Authentication & Transactions

A modern React application demonstrating Web3 wallet integration and blockchain transaction handling.

## 🎯 Purpose

This project explores Web3 wallet authentication and blockchain transaction handling. Built as a learning exercise and potential template for future Web3 applications.

## ✨ Features

- **Wallet Authentication**: Seamless login with Privy (supports MetaMask, WalletConnect, social logins)
- **Blockchain Transactions**: Send ETH transactions via wallet integration
- **Modern Stack**: Next.js 15, TypeScript, TanStack Query, shadcn/ui
- **Real-time Updates**: Live balance tracking and transaction status
- **Error Handling**: Robust transaction error management

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Web3**: Privy Auth, Viem, Ethereum transactions
- **UI**: Tailwind CSS, shadcn/ui components
- **State**: TanStack Query, React Context
- **Testing**: Vitest, React Testing Library

## 🚀 Quick Start

1. **Clone & Install**
   ```bash
   git clone <repo-url>
   cd ecdsa-node
   pnpm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Add your Privy App ID and Infura API key
   ```

3. **Run Development Server**
   ```bash
   pnpm dev
   ```

## 🔐 Security

- Never commit real API keys
- Uses `.env.local` for sensitive credentials
- Dynamic test account generation
- See `SECURITY.md` for full security guidelines

## 📱 Demo Features

- Connect wallet via multiple providers
- View wallet address and ETH balance
- Send transactions with form validation
- Real-time transaction tracking
- Responsive mobile-friendly UI

## 🧪 Testing

```bash
pnpm test        # Run test suite
pnpm type-check  # TypeScript validation
pnpm lint        # Code quality checks
```

## 📄 License

MIT License - see LICENSE file for details.

---

*Built to showcase modern Web3 development patterns and React expertise.*