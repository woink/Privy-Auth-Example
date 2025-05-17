'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { type Chain } from 'viem';
import { ReactNode } from 'react';

const SEPOLIA_TESTNET: Chain = {
  id: 11155111,
  name: 'Sepolia',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ||
        `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`
      ],
    },
    public: {
      http: [
        process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ||
        `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`
      ],
    }
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://sepolia.etherscan.io',
    },
  },
};

export default function PrivyProviderWrapper({ children }: { children: ReactNode }) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!privyAppId) {
    console.error("Privy App ID is not configured. Please set NEXT_PUBLIC_PRIVY_APP_ID in your environment variables.");
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        loginMethods: ['email', 'wallet', 'google', 'github'],
        defaultChain: SEPOLIA_TESTNET,
        supportedChains: [SEPOLIA_TESTNET],
      }}
    >
      {children}
    </PrivyProvider>
  );
}