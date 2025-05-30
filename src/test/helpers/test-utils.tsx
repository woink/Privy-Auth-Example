import { PrivyProvider } from "@privy-io/react-auth";
import type { User, Wallet } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { vi } from "vitest";

// Mock user data factory
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: "test-user-id",
  createdAt: new Date(),
  linkedAccounts: [],
  mfaMethods: [],
  hasAcceptedTerms: true,
  isGuest: false,
  wallet: {
    address: "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2",
  } as Wallet,
  ...overrides,
});

// Mock Privy hooks
export const mockPrivyHooks = (user: User | null = null) => {
  return {
    usePrivy: vi.fn(() => ({
      user,
      ready: true,
      authenticated: !!user,
      login: vi.fn(),
      logout: vi.fn(),
    })),
    useWallets: vi.fn(() => ({
      wallets: user?.wallet ? [user.wallet] : [],
      ready: true,
    })),
  };
};

// Create test query client
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Test wrapper with providers
interface AllTheProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
  privyAppId?: string;
}

function AllTheProviders({
  children,
  queryClient = createTestQueryClient(),
  privyAppId = "test-app-id",
}: AllTheProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider
        appId={privyAppId}
        config={{ embeddedWallets: { createOnLogin: "users-without-wallets" } }}
      >
        {children}
      </PrivyProvider>
    </QueryClientProvider>
  );
}

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & {
    queryClient?: QueryClient;
    privyAppId?: string;
  },
) => {
  const { queryClient, privyAppId, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders queryClient={queryClient} privyAppId={privyAppId}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

export * from "@testing-library/react";
export { customRender as render };

// Mock viem client responses
export const mockViemClient = {
  getBalance: vi.fn(),
};

// Mock balance responses
export const mockBalanceResponses = {
  zero: BigInt(0),
  oneEther: BigInt("1000000000000000000"), // 1 ETH in wei
  halfEther: BigInt("500000000000000000"), // 0.5 ETH in wei
  smallAmount: BigInt("1000000000000000"), // 0.001 ETH in wei
  tinyAmount: BigInt("1000000000000"), // 0.000001 ETH in wei
};

// Wait for React Query to settle
export const waitForQueryToSettle = () =>
  new Promise((resolve) => setTimeout(resolve, 0));
