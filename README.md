# ECDSA Node - Next.js Web3 Wallet Application

A modern Web3 application built with Next.js 15, TypeScript, and Privy authentication that enables secure cryptocurrency transactions using ECDSA (Elliptic Curve Digital Signature Algorithm).

## 🚀 Features

- **Wallet Integration**: Seamless connection with both embedded and external wallets via Privy
- **Secure Transactions**: Send ETH transactions with ECDSA signature verification
- **Modern UI**: Beautiful interface built with shadcn/ui and Tailwind CSS v4
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Testing**: Comprehensive test suite with Vitest and React Testing Library
- **Real-time Updates**: Live balance updates and transaction status tracking
- **Error Handling**: Robust error boundaries and user-friendly error messages

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 18** - UI library with concurrent features
- **TypeScript** - Static type checking
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - Modern, accessible UI components
- **Lucide React** - Beautiful icon library

### Web3 & Authentication
- **Privy** - Web3 authentication and wallet management
- **Viem** - TypeScript library for Ethereum interactions
- **ECDSA** - Cryptographic signature algorithm

### State Management & Data
- **TanStack Query** - Server state management
- **React Context** - Global state management
- **Local Storage** - Client-side data persistence

### Development & Testing
- **Vitest** - Fast unit testing framework
- **React Testing Library** - Component testing utilities
- **Biome** - Fast linter and formatter
- **PNPM** - Efficient package manager

## 📋 Prerequisites

- Node.js 18+ 
- PNPM package manager
- Privy account and App ID
- Infura API key (for RPC access)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ecdsa-node
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Copy the environment template and configure your keys:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Privy Authentication
NEXT_PUBLIC_PRIVY_APP_ID="your_privy_app_id_here"

# Blockchain RPC Provider (Infura)
NEXT_PUBLIC_INFURA_API_KEY="your_infura_api_key_here"

# Chain settings
NEXT_PUBLIC_DEFAULT_CHAIN="sepolia"
NEXT_PUBLIC_SUPPORTED_CHAINS="sepolia"
```

### 4. Initialize Project

Run the setup script to initialize the project:

```bash
node setup.js
```

This will:
- Install all dependencies
- Create necessary directories
- Generate initial account data
- Start the development server

### 5. Manual Start (Alternative)

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗 Project Structure

```
ecdsa-node/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.scss        # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── privy-provider.tsx  # Privy authentication wrapper
│   │   └── query-provider.tsx  # TanStack Query provider
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── AuthWrapper.tsx     # Authentication handler
│   │   ├── Transfer.tsx        # Transaction form
│   │   ├── UserWallet.tsx      # Wallet display
│   │   └── ...
│   ├── contexts/               # React contexts
│   │   └── WalletContext.tsx   # Wallet state management
│   ├── hooks/                  # Custom React hooks
│   │   ├── useTransfer.ts      # Transaction logic
│   │   └── useToast.ts         # Toast notifications
│   ├── lib/                    # Utility libraries
│   │   ├── blockchain/         # Blockchain utilities
│   │   ├── queries/            # TanStack Query configs
│   │   ├── privy.ts            # Privy configuration
│   │   └── utils.ts            # General utilities
│   └── test/                   # Test utilities
├── components.json             # shadcn/ui configuration
├── biome.json                  # Biome linter/formatter config
├── vitest.config.mts           # Vitest test configuration
├── setup.js                    # Project initialization script
└── package.json
```

## 🔧 Available Scripts

```bash
# Development
pnpm dev                # Start development server
pnpm build              # Build for production
pnpm start              # Start production server

# Code Quality
pnpm lint               # Run linter
pnpm lint:fix           # Fix linting issues
pnpm format             # Check formatting
pnpm format:fix         # Fix formatting
pnpm check              # Run all checks
pnpm check:fix          # Fix all issues
pnpm type-check         # TypeScript type checking

# Testing
pnpm test               # Run tests
```

## 💳 Wallet Integration

### Supported Wallets

- **Embedded Wallets**: Privy's built-in wallet solution
- **External Wallets**: MetaMask, WalletConnect, and other Web3 wallets
- **Social Logins**: Google, Twitter, Discord (via Privy)

### Authentication Flow

1. User connects wallet through Privy interface
2. Wallet address and balance are retrieved
3. User can send transactions with signature verification
4. Real-time balance updates after successful transactions

## 🔐 Security Features

- **ECDSA Signatures**: All transactions signed with elliptic curve cryptography
- **Type Safety**: Comprehensive TypeScript coverage prevents runtime errors
- **Input Validation**: Client-side validation for all transaction parameters
- **Error Boundaries**: Graceful error handling and recovery
- **Secure RPC**: Encrypted communication with blockchain networks

## 🧪 Testing

The project includes comprehensive testing with:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

### Test Structure
- **Unit Tests**: Individual component and utility testing
- **Integration Tests**: Component interaction testing
- **Error Boundary Tests**: Error handling verification

## 🎨 UI Components

Built with shadcn/ui for consistent, accessible design:

- **Cards**: Transaction forms and wallet displays
- **Buttons**: Actions with multiple variants
- **Forms**: Input fields with validation
- **Alerts**: Error and success notifications
- **Loading States**: Skeleton components for async operations

### Adding New Components

```bash
# Add a new shadcn/ui component
pnpm dlx shadcn@latest add dialog

# Add multiple components
pnpm dlx shadcn@latest add dialog dropdown-menu tabs
```

## 🌐 Blockchain Integration

### Supported Networks
- **Sepolia Testnet** (default)
- Configurable for other EVM-compatible networks

### Transaction Features
- Send ETH between addresses
- Real-time transaction status
- Etherscan integration for transaction viewing
- Gas estimation and optimization

## 🔄 State Management

### Global State
- **WalletContext**: Wallet connection and balance management
- **TanStack Query**: Server state caching and synchronization
- **React State**: Local component state for forms and UI

### Data Flow
1. Wallet connection via Privy
2. Balance queries cached with TanStack Query
3. Transaction mutations with optimistic updates
4. Real-time invalidation and refetching

## 🚨 Error Handling

Comprehensive error handling system:

- **Transaction Errors**: User-friendly blockchain error messages
- **Network Errors**: Automatic retry mechanisms
- **Validation Errors**: Real-time form validation
- **Error Boundaries**: Component-level error recovery

## 📱 Responsive Design

- Mobile-first design approach
- Responsive breakpoints for all screen sizes
- Touch-friendly interface elements
- Optimized for both desktop and mobile usage

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_PRIVY_APP_ID` | Privy application ID | Yes |
| `NEXT_PUBLIC_INFURA_API_KEY` | Infura API key for RPC | Yes |
| `NEXT_PUBLIC_DEFAULT_CHAIN` | Default blockchain network | No |
| `NEXT_PUBLIC_SUPPORTED_CHAINS` | Supported blockchain networks | No |

### Privy Configuration

Configure wallet options in `src/lib/privy.ts`:
- Supported wallet types
- Network configurations
- Authentication methods

## 🐛 Troubleshooting

### Common Issues

**Wallet Connection Issues**
```bash
# Clear browser storage and reconnect
localStorage.clear()
```

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
pnpm build
```

**Type Errors**
```bash
# Regenerate TypeScript declarations
pnpm type-check
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Write tests for new features
- Use conventional commit messages
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Privy Documentation](https://docs.privy.io/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Viem Documentation](https://viem.sh/)
- [TanStack Query](https://tanstack.com/query)

## 📞 Support

For support and questions:
- Open an issue on GitHub
- Check the documentation
- Review the troubleshooting section

---

Built with ❤️ using Next.js, TypeScript, and Web3 technologies.