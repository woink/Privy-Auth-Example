import { publicSepoliaClient } from "@/lib/privy";
import { truncateBalance } from "@/utils/balance";
import type { User } from "@privy-io/react-auth";
import { renderHook, waitFor } from "@testing-library/react";
import { formatEther } from "viem";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { useWalletData } from "../useWalletData";

// Mock dependencies
vi.mock("@/lib/privy", () => ({
  publicSepoliaClient: {
    getBalance: vi.fn(),
  },
}));

vi.mock("viem", async () => {
  const actual = await vi.importActual("viem");
  return {
    ...actual,
    formatEther: vi.fn(),
  };
});

vi.mock("@/utils/balance", () => ({
  truncateBalance: vi.fn(),
}));

const mockGetBalance = publicSepoliaClient.getBalance as Mock;
const mockFormatEther = formatEther as Mock;
const mockTruncateBalance = truncateBalance as Mock;

describe("useWalletData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFormatEther.mockImplementation((value: bigint) => value.toString());
    mockTruncateBalance.mockImplementation((value: string) => value);
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
        }
      : undefined,
  });

  describe("initial state", () => {
    it("should return null values when no user provided", () => {
      const { result } = renderHook(() => useWalletData(null));

      expect(result.current.address).toBe(null);
      expect(result.current.balance).toBe(null);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.hasWallet).toBe(false);
    });

    it("should return null values when user has no wallet", () => {
      const user = createMockUser();
      const { result } = renderHook(() => useWalletData(user));

      expect(result.current.address).toBe(null);
      expect(result.current.balance).toBe(null);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.hasWallet).toBe(false);
    });
  });

  describe("successful balance fetching", () => {
    it("should fetch and format balance successfully", async () => {
      const walletAddress = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";
      const mockBalance = BigInt("1000000000000000000"); // 1 ETH in wei
      const formattedBalance = "1.0";
      const truncatedBalance = "1";

      mockGetBalance.mockResolvedValue(mockBalance);
      mockFormatEther.mockReturnValue(formattedBalance);
      mockTruncateBalance.mockReturnValue(truncatedBalance);

      const user = createMockUser(walletAddress);
      const { result } = renderHook(() => useWalletData(user));

      // Should set address immediately
      expect(result.current.address).toBe(walletAddress);
      expect(result.current.hasWallet).toBe(true);

      // Should start loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBe(null);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.balance).toBe(truncatedBalance);
      expect(result.current.error).toBe(null);

      // Verify function calls
      expect(mockGetBalance).toHaveBeenCalledWith({
        address: walletAddress,
      });
      expect(mockFormatEther).toHaveBeenCalledWith(mockBalance);
      expect(mockTruncateBalance).toHaveBeenCalledWith(formattedBalance);
    });

    it("should handle zero balance", async () => {
      const walletAddress = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";
      const mockBalance = BigInt("0");
      const formattedBalance = "0.0";
      const truncatedBalance = "0";

      mockGetBalance.mockResolvedValue(mockBalance);
      mockFormatEther.mockReturnValue(formattedBalance);
      mockTruncateBalance.mockReturnValue(truncatedBalance);

      const user = createMockUser(walletAddress);
      const { result } = renderHook(() => useWalletData(user));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.balance).toBe(truncatedBalance);
      expect(result.current.error).toBe(null);
    });

    it("should handle very small balance amounts", async () => {
      const walletAddress = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";
      const mockBalance = BigInt("1000000000000"); // 0.000001 ETH in wei
      const formattedBalance = "0.000001";
      const truncatedBalance = "0.000001";

      mockGetBalance.mockResolvedValue(mockBalance);
      mockFormatEther.mockReturnValue(formattedBalance);
      mockTruncateBalance.mockReturnValue(truncatedBalance);

      const user = createMockUser(walletAddress);
      const { result } = renderHook(() => useWalletData(user));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.balance).toBe(truncatedBalance);
    });
  });

  describe("error handling", () => {
    it("should handle getBalance API errors", async () => {
      const walletAddress = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";
      const errorMessage = "Network error";

      mockGetBalance.mockRejectedValue(new Error(errorMessage));

      const user = createMockUser(walletAddress);
      const { result } = renderHook(() => useWalletData(user));

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.balance).toBe(null);
    });

    it("should handle non-Error thrown values", async () => {
      const walletAddress = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";
      const errorValue = "String error";

      mockGetBalance.mockRejectedValue(errorValue);

      const user = createMockUser(walletAddress);
      const { result } = renderHook(() => useWalletData(user));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe(errorValue);
    });

    it("should handle undefined/null errors", async () => {
      const walletAddress = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";

      mockGetBalance.mockRejectedValue(null);

      const user = createMockUser(walletAddress);
      const { result } = renderHook(() => useWalletData(user));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe("null");
    });
  });

  describe("user changes", () => {
    it("should update when user changes from null to user with wallet", async () => {
      const walletAddress = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";
      const mockBalance = BigInt("1000000000000000000");

      mockGetBalance.mockResolvedValue(mockBalance);
      mockFormatEther.mockReturnValue("1.0");
      mockTruncateBalance.mockReturnValue("1");

      const { result, rerender } = renderHook(
        ({ user }: { user: User | null }) => useWalletData(user),
        { initialProps: { user: null } },
      );

      // Initially null
      expect(result.current.address).toBe(null);
      expect(result.current.hasWallet).toBe(false);

      // Update with user
      const user = createMockUser(walletAddress);
      rerender({ user });

      expect(result.current.address).toBe(walletAddress);
      expect(result.current.hasWallet).toBe(true);

      await waitFor(() => {
        expect(result.current.balance).toBe("1");
      });
    });

    it("should update when wallet address changes", async () => {
      const address1 = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";
      const address2 = "0x8ba1f109551bD432803012645Hac136c";

      mockGetBalance.mockResolvedValue(BigInt("1000000000000000000"));
      mockFormatEther.mockReturnValue("1.0");
      mockTruncateBalance.mockReturnValue("1");

      const { result, rerender } = renderHook(
        ({ user }) => useWalletData(user),
        { initialProps: { user: createMockUser(address1) } },
      );

      await waitFor(() => {
        expect(result.current.balance).toBe("1");
      });

      expect(mockGetBalance).toHaveBeenCalledWith({ address: address1 });

      // Change address
      rerender({ user: createMockUser(address2) });

      expect(result.current.address).toBe(address2);

      await waitFor(() => {
        expect(mockGetBalance).toHaveBeenCalledWith({ address: address2 });
      });
    });

    it("should clear data when user wallet is removed", () => {
      const walletAddress = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";

      const { result, rerender } = renderHook(
        ({ user }) => useWalletData(user),
        { initialProps: { user: createMockUser(walletAddress) } },
      );

      expect(result.current.address).toBe(walletAddress);
      expect(result.current.hasWallet).toBe(true);

      // Remove wallet
      rerender({ user: createMockUser() });

      expect(result.current.address).toBe(null);
      expect(result.current.balance).toBe(null);
      expect(result.current.hasWallet).toBe(false);
    });
  });

  describe("loading states", () => {
    it("should show loading state during fetch", async () => {
      const walletAddress = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";

      // Create a promise that we can control
      let resolveBalance: (value: bigint) => void;
      const balancePromise = new Promise<bigint>((resolve) => {
        resolveBalance = resolve;
      });

      mockGetBalance.mockReturnValue(balancePromise);

      const user = createMockUser(walletAddress);
      const { result } = renderHook(() => useWalletData(user));

      // Should be loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBe(null);

      // Resolve the promise
      resolveBalance!(BigInt("1000000000000000000"));
      mockFormatEther.mockReturnValue("1.0");
      mockTruncateBalance.mockReturnValue("1");

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.balance).toBe("1");
    });

    it("should clear error when starting new fetch", async () => {
      const walletAddress = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";

      // First fetch fails
      mockGetBalance.mockRejectedValueOnce(new Error("Network error"));

      const { result, rerender } = renderHook(
        ({ user }) => useWalletData(user),
        { initialProps: { user: createMockUser(walletAddress) } },
      );

      await waitFor(() => {
        expect(result.current.error).toBe("Network error");
      });

      // Second fetch succeeds
      mockGetBalance.mockResolvedValue(BigInt("1000000000000000000"));
      mockFormatEther.mockReturnValue("1.0");
      mockTruncateBalance.mockReturnValue("1");

      // Trigger re-fetch by changing address slightly
      const newAddress = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c3";
      rerender({ user: createMockUser(newAddress) });

      // Error should be cleared when starting new fetch
      expect(result.current.error).toBe(null);
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe(null);
      expect(result.current.balance).toBe("1");
    });
  });
});
