import { fetchWalletBalance, walletBalanceQueryOptions } from "@/lib/queries/wallet-queries";
import type { User } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { Suspense, Component } from "react";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { useWalletDataSuspense } from "../useWalletDataSuspense";

// Mock the wallet queries
vi.mock("@/lib/queries/wallet-queries", () => ({
  fetchWalletBalance: vi.fn(),
  walletBalanceQueryOptions: vi.fn(),
}));

const mockFetchWalletBalance = fetchWalletBalance as Mock;
const mockWalletBalanceQueryOptions = walletBalanceQueryOptions as Mock;

describe("useWalletDataSuspense", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });

    // Setup mock for walletBalanceQueryOptions
    mockWalletBalanceQueryOptions.mockImplementation((address: string | null) => {
      if (address) {
        return {
          queryKey: ["wallet", "balance", address],
          queryFn: () => fetchWalletBalance(address),
          enabled: true,
          staleTime: 30 * 1000,
          gcTime: 5 * 60 * 1000,
        };
      }
      return {
        queryKey: ["wallet", "balance", "null"],
        queryFn: () => Promise.resolve("0"),
        enabled: true,
        staleTime: Number.POSITIVE_INFINITY,
      };
    });
  });

  const createMockUser = (walletAddress?: string): User => ({
    id: "test-user-id",
    createdAt: new Date(),
    linkedAccounts: [],
    mfaMethods: [],
    hasAcceptedTerms: true,
    isGuest: false,
    wallet: walletAddress
      ? {
          address: walletAddress,
          chainType: "ethereum",
          connectorType: "injected",
          walletClientType: "metamask",
          imported: false,
          delegated: false,
          walletIndex: 0,
        }
      : undefined,
  });

  class ErrorBoundary extends Component<
    { children: React.ReactNode },
    { hasError: boolean; error?: Error }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    render() {
      if (this.state.hasError) {
        return <div>Error: {this.state.error?.message}</div>;
      }
      return this.props.children;
    }
  }

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </ErrorBoundary>
    </QueryClientProvider>
  );

  describe("without wallet", () => {
    it("should return default values when user is null", async () => {
      const { result } = renderHook(() => useWalletDataSuspense(null), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current).toBeTruthy();
        expect(result.current.address).toBe(null);
        expect(result.current.balance).toBe("0");
        expect(result.current.hasWallet).toBe(false);
      });
    });

    it("should return default values when user has no wallet", async () => {
      const user = createMockUser();
      const { result } = renderHook(() => useWalletDataSuspense(user), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current).toBeTruthy();
        expect(result.current.address).toBe(null);
        expect(result.current.balance).toBe("0");
        expect(result.current.hasWallet).toBe(false);
      });
    });
  });

  describe("with wallet", () => {
    it("should fetch and return balance when user has wallet", async () => {
      const walletAddress = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";
      const mockBalance = "1.5";

      mockFetchWalletBalance.mockResolvedValue(mockBalance);

      const user = createMockUser(walletAddress);
      const { result } = renderHook(() => useWalletDataSuspense(user), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.address).toBe(walletAddress);
        expect(result.current.balance).toBe(mockBalance);
        expect(result.current.hasWallet).toBe(true);
      });

      expect(mockFetchWalletBalance).toHaveBeenCalledWith(walletAddress);
    });

    it("should handle zero balance", async () => {
      const walletAddress = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";
      const mockBalance = "0";

      mockFetchWalletBalance.mockResolvedValue(mockBalance);

      const user = createMockUser(walletAddress);
      const { result } = renderHook(() => useWalletDataSuspense(user), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.balance).toBe(mockBalance);
      });
    });

    it("should handle very small balances", async () => {
      const walletAddress = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";
      const mockBalance = "0.000001";

      mockFetchWalletBalance.mockResolvedValue(mockBalance);

      const user = createMockUser(walletAddress);
      const { result } = renderHook(() => useWalletDataSuspense(user), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.balance).toBe(mockBalance);
      });
    });

    it("should handle large balances", async () => {
      const walletAddress = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";
      const mockBalance = "999999.123456";

      mockFetchWalletBalance.mockResolvedValue(mockBalance);

      const user = createMockUser(walletAddress);
      const { result } = renderHook(() => useWalletDataSuspense(user), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.balance).toBe(mockBalance);
      });
    });
  });

  describe("user changes", () => {
    it("should update when user changes from null to user with wallet", async () => {
      const walletAddress = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";
      const mockBalance = "2.5";

      mockFetchWalletBalance.mockResolvedValue(mockBalance);

      const { result, rerender } = renderHook(
        ({ user }) => useWalletDataSuspense(user),
        {
          wrapper,
          initialProps: { user: null as User | null },
        },
      );

      // Initially null user
      await waitFor(() => {
        expect(result.current).toBeTruthy();
        expect(result.current.address).toBe(null);
        expect(result.current.hasWallet).toBe(false);
      });

      // Update with user
      const user = createMockUser(walletAddress);
      rerender({ user });

      await waitFor(() => {
        expect(result.current.address).toBe(walletAddress);
        expect(result.current.balance).toBe(mockBalance);
        expect(result.current.hasWallet).toBe(true);
      });
    });

    it("should update when wallet address changes", async () => {
      const address1 = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";
      const address2 = "0x8ba1f109551bd432803012645eac136c12345678";
      const balance1 = "1.5";
      const balance2 = "3.0";

      mockFetchWalletBalance
        .mockResolvedValueOnce(balance1)
        .mockResolvedValueOnce(balance2);

      const { result, rerender } = renderHook(
        ({ user }) => useWalletDataSuspense(user),
        {
          wrapper,
          initialProps: { user: createMockUser(address1) },
        },
      );

      await waitFor(() => {
        expect(result.current.address).toBe(address1);
        expect(result.current.balance).toBe(balance1);
      });

      // Change address
      await act(async () => {
        rerender({ user: createMockUser(address2) });
      });

      // Wait for both address and balance to update
      await waitFor(() => {
        expect(result.current.address).toBe(address2);
        expect(result.current.balance).toBe(balance2);
      });

      expect(mockFetchWalletBalance).toHaveBeenCalledWith(address1);
      expect(mockFetchWalletBalance).toHaveBeenCalledWith(address2);
    });

    it("should revert to default when user wallet is removed", async () => {
      const walletAddress = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";
      const mockBalance = "1.5";

      mockFetchWalletBalance.mockResolvedValue(mockBalance);

      const { result, rerender } = renderHook(
        ({ user }) => useWalletDataSuspense(user),
        {
          wrapper,
          initialProps: { user: createMockUser(walletAddress) },
        },
      );

      await waitFor(() => {
        expect(result.current.address).toBe(walletAddress);
        expect(result.current.hasWallet).toBe(true);
      });

      // Remove wallet
      rerender({ user: createMockUser() });

      await waitFor(() => {
        expect(result.current.address).toBe(null);
        expect(result.current.balance).toBe("0");
        expect(result.current.hasWallet).toBe(false);
      });
    });
  });

  describe("query caching", () => {
    it("should use cached data for same address", async () => {
      const walletAddress = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";
      const mockBalance = "1.5";

      mockFetchWalletBalance.mockResolvedValue(mockBalance);

      const user = createMockUser(walletAddress);

      // First render
      const { result: result1 } = renderHook(
        () => useWalletDataSuspense(user),
        { wrapper },
      );

      await waitFor(() => {
        expect(result1.current.balance).toBe(mockBalance);
      });

      // Second render with same user - should use cache
      const { result: result2 } = renderHook(
        () => useWalletDataSuspense(user),
        { wrapper },
      );

      expect(result2.current.balance).toBe(mockBalance);
      expect(mockFetchWalletBalance).toHaveBeenCalledTimes(1);
    });
  });

  describe("error handling", () => {
    it("should throw error when query fails", async () => {
      const walletAddress = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";
      const errorMessage = "Network error";

      mockFetchWalletBalance.mockRejectedValue(new Error(errorMessage));

      const user = createMockUser(walletAddress);

      // We expect this to throw and be caught by error boundary
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      try {
        renderHook(() => useWalletDataSuspense(user), { wrapper });
        await waitFor(() => {
          // The error should propagate to the error boundary
          expect(mockFetchWalletBalance).toHaveBeenCalledWith(walletAddress);
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      consoleSpy.mockRestore();
    });
  });

  describe("return type consistency", () => {
    it("should always return correct shape when no wallet", async () => {
      const { result } = renderHook(() => useWalletDataSuspense(null), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current).toBeTruthy();
        expect(result.current).toHaveProperty("address");
        expect(result.current).toHaveProperty("balance");
        expect(result.current).toHaveProperty("hasWallet");

        expect(typeof result.current.address).toBe("object"); // null
        expect(typeof result.current.balance).toBe("string");
        expect(typeof result.current.hasWallet).toBe("boolean");
      });
    });

    it("should always return correct shape when wallet exists", async () => {
      const walletAddress = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";
      const mockBalance = "1.5";

      mockFetchWalletBalance.mockResolvedValue(mockBalance);

      const user = createMockUser(walletAddress);
      const { result } = renderHook(() => useWalletDataSuspense(user), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current).toHaveProperty("address");
        expect(result.current).toHaveProperty("balance");
        expect(result.current).toHaveProperty("hasWallet");

        expect(typeof result.current.address).toBe("string");
        expect(typeof result.current.balance).toBe("string");
        expect(typeof result.current.hasWallet).toBe("boolean");
      });
    });
  });
});
