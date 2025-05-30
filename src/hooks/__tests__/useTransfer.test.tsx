import { useWallet } from "@/contexts/WalletContext";
import { TransactionError } from "@/lib/blockchain/transactions";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTransfer } from "../useTransfer";

// Mock the wallet context
vi.mock("@/contexts/WalletContext");
const mockUseWallet = vi.mocked(useWallet);

// Mock the blockchain transactions module
vi.mock("@/lib/blockchain/transactions", async () => {
  const actual = await vi.importActual("@/lib/blockchain/transactions");
  return {
    ...actual,
    sendTransfer: vi.fn(),
    TransactionError: actual.TransactionError,
    getTransactionErrorMessage: actual.getTransactionErrorMessage,
  };
});

import { sendTransfer } from "@/lib/blockchain/transactions";
const mockSendTransfer = vi.mocked(sendTransfer);

describe("useTransfer", () => {
  let queryClient: QueryClient;

  const createWrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Default wallet mock
    mockUseWallet.mockReturnValue({
      isReady: true,
      isAuthenticated: true,
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      user: { wallet: { address: "0x123" } } as any,
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      address: "0x1234567890123456789012345678901234567890" as any,
      hasWallet: true,
      balance: "1.0",
      isLoadingBalance: false,
      balanceError: null,
      login: vi.fn(),
      logout: vi.fn(),
      refreshBalance: vi.fn(),
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe("initial state", () => {
    it("should return initial state correctly", () => {
      const { result } = renderHook(() => useTransfer(), {
        wrapper: createWrapper,
      });

      expect(result.current.isPending).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.data).toBe(undefined);
      expect(result.current.canTransfer).toBe(true);
      expect(result.current.senderAddress).toBe(
        "0x1234567890123456789012345678901234567890",
      );
      expect(result.current.hasWallet).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should return canTransfer false when not authenticated", () => {
      mockUseWallet.mockReturnValue({
        isReady: true,
        isAuthenticated: false,
        user: null,
        address: null,
        hasWallet: false,
        balance: undefined,
        isLoadingBalance: false,
        balanceError: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshBalance: vi.fn(),
      });

      const { result } = renderHook(() => useTransfer(), {
        wrapper: createWrapper,
      });

      expect(result.current.canTransfer).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should return canTransfer false when no wallet", () => {
      mockUseWallet.mockReturnValue({
        isReady: true,
        isAuthenticated: true,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        user: { wallet: null } as any,
        address: null,
        hasWallet: false,
        balance: undefined,
        isLoadingBalance: false,
        balanceError: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshBalance: vi.fn(),
      });

      const { result } = renderHook(() => useTransfer(), {
        wrapper: createWrapper,
      });

      expect(result.current.canTransfer).toBe(false);
      expect(result.current.hasWallet).toBe(false);
    });
  });

  describe("transfer function", () => {
    it("should successfully transfer funds", async () => {
      const mockResult = {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        hash: "0xabc123" as any,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        from: "0x1234567890123456789012345678901234567890" as any,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        to: "0x0987654321098765432109876543210987654321" as any,
        amount: "1.0",
        timestamp: Date.now(),
      };

      mockSendTransfer.mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useTransfer(), {
        wrapper: createWrapper,
      });

      await act(async () => {
        const transferResult = await result.current.transfer({
          recipient: "0x0987654321098765432109876543210987654321",
          amount: "1.0",
        });

        expect(transferResult).toEqual(mockResult);
      });

      expect(mockSendTransfer).toHaveBeenCalledWith({
        from: "0x1234567890123456789012345678901234567890",
        to: "0x0987654321098765432109876543210987654321",
        amount: "1.0",
        sendTransaction: expect.any(Function),
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockResult);
        expect(result.current.isError).toBe(false);
      });
    });

    it("should handle transfer errors", async () => {
      const mockError = new TransactionError(
        "Insufficient balance",
        "INSUFFICIENT_BALANCE",
      );
      mockSendTransfer.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useTransfer(), {
        wrapper: createWrapper,
      });

      await act(async () => {
        try {
          await result.current.transfer({
            recipient: "0x0987654321098765432109876543210987654321",
            amount: "1000.0",
          });
        } catch (error) {
          expect(error).toBe(mockError);
        }
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toBe(mockError);
      });
    });

    it("should throw error when not authenticated", async () => {
      mockUseWallet.mockReturnValue({
        isReady: true,
        isAuthenticated: false,
        user: null,
        address: null,
        hasWallet: false,
        balance: undefined,
        isLoadingBalance: false,
        balanceError: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshBalance: vi.fn(),
      });

      const { result } = renderHook(() => useTransfer(), {
        wrapper: createWrapper,
      });

      await act(async () => {
        try {
          await result.current.transfer({
            recipient: "0x0987654321098765432109876543210987654321",
            amount: "1.0",
          });
        } catch (error) {
          expect(error).toBeInstanceOf(TransactionError);
          expect((error as TransactionError).code).toBe("NOT_AUTHENTICATED");
        }
      });
    });

    it("should throw error when no wallet address", async () => {
      mockUseWallet.mockReturnValue({
        isReady: true,
        isAuthenticated: true,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        user: { wallet: null } as any,
        address: null,
        hasWallet: false,
        balance: undefined,
        isLoadingBalance: false,
        balanceError: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshBalance: vi.fn(),
      });

      const { result } = renderHook(() => useTransfer(), {
        wrapper: createWrapper,
      });

      await act(async () => {
        try {
          await result.current.transfer({
            recipient: "0x0987654321098765432109876543210987654321",
            amount: "1.0",
          });
        } catch (error) {
          expect(error).toBeInstanceOf(TransactionError);
          expect((error as TransactionError).code).toBe("NO_WALLET");
        }
      });
    });
  });

  describe("callbacks", () => {
    it("should call onSuccess callback when transfer succeeds", async () => {
      const onSuccess = vi.fn();
      const mockResult = {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        hash: "0xabc123" as any,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        from: "0x1234567890123456789012345678901234567890" as any,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        to: "0x0987654321098765432109876543210987654321" as any,
        amount: "1.0",
        timestamp: Date.now(),
      };

      mockSendTransfer.mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useTransfer({ onSuccess }), {
        wrapper: createWrapper,
      });

      await act(async () => {
        await result.current.transfer({
          recipient: "0x0987654321098765432109876543210987654321",
          amount: "1.0",
        });
      });

      expect(onSuccess).toHaveBeenCalledWith(mockResult);
    });

    it("should call onError callback when transfer fails", async () => {
      const onError = vi.fn();
      const mockError = new TransactionError(
        "Insufficient balance",
        "INSUFFICIENT_BALANCE",
      );
      mockSendTransfer.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useTransfer({ onError }), {
        wrapper: createWrapper,
      });

      await act(async () => {
        try {
          await result.current.transfer({
            recipient: "0x0987654321098765432109876543210987654321",
            amount: "1000.0",
          });
        } catch (error) {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(mockError);
      });
    });

    it("should call onSettled callback regardless of outcome", async () => {
      const onSettled = vi.fn();
      const mockResult = {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        hash: "0xabc123" as any,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        from: "0x1234567890123456789012345678901234567890" as any,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        to: "0x0987654321098765432109876543210987654321" as any,
        amount: "1.0",
        timestamp: Date.now(),
      };

      mockSendTransfer.mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useTransfer({ onSettled }), {
        wrapper: createWrapper,
      });

      await act(async () => {
        await result.current.transfer({
          recipient: "0x0987654321098765432109876543210987654321",
          amount: "1.0",
        });
      });

      expect(onSettled).toHaveBeenCalledWith(mockResult, null);
    });
  });

  describe("helper functions", () => {
    it("should return user-friendly error message", async () => {
      const mockError = new TransactionError(
        "Insufficient balance",
        "INSUFFICIENT_BALANCE",
      );
      mockSendTransfer.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useTransfer(), {
        wrapper: createWrapper,
      });

      await act(async () => {
        try {
          await result.current.transfer({
            recipient: "0x0987654321098765432109876543210987654321",
            amount: "1000.0",
          });
        } catch (error) {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.getUserFriendlyError()).toBe(
          "Insufficient balance for this transaction",
        );
      });
    });

    it("should reset mutation state", async () => {
      const mockError = new TransactionError(
        "Insufficient balance",
        "INSUFFICIENT_BALANCE",
      );
      mockSendTransfer.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useTransfer(), {
        wrapper: createWrapper,
      });

      await act(async () => {
        try {
          await result.current.transfer({
            recipient: "0x0987654321098765432109876543210987654321",
            amount: "1000.0",
          });
        } catch (error) {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      await act(() => {
        result.current.reset();
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(false);
        expect(result.current.error).toBe(null);
        expect(result.current.data).toBe(undefined);
      });
    });
  });

  describe("loading states", () => {
    it("should show pending state during transfer", async () => {
      const mockResult = {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        hash: "0xabc123" as any,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        from: "0x1234567890123456789012345678901234567890" as any,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        to: "0x0987654321098765432109876543210987654321" as any,
        amount: "1.0",
        timestamp: Date.now(),
      };

      // Create a promise that we can control
      let resolveTransfer: (value: typeof mockResult) => void;
      const transferPromise = new Promise<typeof mockResult>((resolve) => {
        resolveTransfer = resolve;
      });

      mockSendTransfer.mockReturnValueOnce(transferPromise);

      const { result } = renderHook(() => useTransfer(), {
        wrapper: createWrapper,
      });

      // Start the transfer
      await act(async () => {
        result.current.transfer({
          recipient: "0x0987654321098765432109876543210987654321",
          amount: "1.0",
        });
      });

      // Should be pending initially
      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
        expect(result.current.canTransfer).toBe(false); // Can't transfer while pending
      });

      // Resolve the transfer
      await act(async () => {
        resolveTransfer(mockResult);
        await transferPromise;
      });

      // Should no longer be pending
      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
        expect(result.current.canTransfer).toBe(true);
      });
    });
  });
});
