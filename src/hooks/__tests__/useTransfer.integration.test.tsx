import { TransactionError } from "@/lib/blockchain/transactions";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { parseEther } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTransfer } from "../useTransfer";

// Mock the wallet context
const mockWalletContext = {
  address: "0x1234567890123456789012345678901234567890",
  hasWallet: true,
  isAuthenticated: true,
  refreshBalance: vi.fn(),
};

vi.mock("@/contexts/WalletContext", () => ({
  useWallet: () => mockWalletContext,
}));

// Mock Privy's useSendTransaction and useWallets
const mockSendTransaction = vi.fn();
const mockWallets = vi.fn();
vi.mock("@privy-io/react-auth", () => ({
  useSendTransaction: () => ({
    sendTransaction: mockSendTransaction,
  }),
  useWallets: () => ({
    wallets: mockWallets(),
  }),
}));

// Mock the public client
vi.mock("@/lib/privy", () => ({
  publicSepoliaClient: {
    getBalance: vi.fn(),
    estimateGas: vi.fn(),
    getGasPrice: vi.fn(),
  },
}));

import { publicSepoliaClient } from "@/lib/privy";
const mockClient = vi.mocked(publicSepoliaClient);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useTransfer Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks for successful transaction
    const balance = parseEther("10.0");
    mockClient.getBalance.mockResolvedValue(balance);
    mockClient.estimateGas.mockResolvedValue(BigInt(21000));
    mockClient.getGasPrice.mockResolvedValue(BigInt(20000000000));

    // Setup default wallets mock
    mockWallets.mockReturnValue([]);
  });

  it("should integrate with Privy sendTransaction for real blockchain transactions", async () => {
    const mockTransactionHash = "0xabc123def456789";
    mockSendTransaction.mockResolvedValue({ hash: mockTransactionHash });

    const { result } = renderHook(() => useTransfer(), {
      wrapper: createWrapper(),
    });

    expect(result.current.canTransfer).toBe(true);

    await act(async () => {
      const transferResult = await result.current.transfer({
        recipient: "0x0987654321098765432109876543210987654321",
        amount: "1.5",
      });

      expect(transferResult.hash).toBe(mockTransactionHash);
      expect(transferResult.from).toBe(mockWalletContext.address);
      expect(transferResult.to).toBe(
        "0x0987654321098765432109876543210987654321",
      );
      expect(transferResult.amount).toBe("1.5");
    });

    // Verify Privy's sendTransaction was called with correct parameters
    expect(mockSendTransaction).toHaveBeenCalledWith({
      to: "0x0987654321098765432109876543210987654321",
      value: parseEther("1.5").toString(),
    });

    // Verify blockchain validation was performed
    expect(mockClient.getBalance).toHaveBeenCalledWith({
      address: mockWalletContext.address,
    });
    expect(mockClient.estimateGas).toHaveBeenCalled();
    expect(mockClient.getGasPrice).toHaveBeenCalled();

    // Verify wallet balance refresh was called
    expect(mockWalletContext.refreshBalance).toHaveBeenCalled();
  });

  it("should handle insufficient balance errors from blockchain validation", async () => {
    // Mock insufficient balance
    const lowBalance = parseEther("0.5");
    mockClient.getBalance.mockResolvedValue(lowBalance);

    const { result } = renderHook(() => useTransfer(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.transfer({
          recipient: "0x0987654321098765432109876543210987654321",
          amount: "1.0",
        }),
      ).rejects.toThrow(TransactionError);
    });

    // Verify sendTransaction was NOT called due to validation failure
    expect(mockSendTransaction).not.toHaveBeenCalled();

    // But balance check was performed
    expect(mockClient.getBalance).toHaveBeenCalledWith({
      address: mockWalletContext.address,
    });
  });

  it("should handle Privy transaction errors", async () => {
    mockSendTransaction.mockRejectedValue(
      new Error("User rejected transaction"),
    );

    const { result } = renderHook(() => useTransfer(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.transfer({
          recipient: "0x0987654321098765432109876543210987654321",
          amount: "1.0",
        }),
      ).rejects.toThrow("Transaction was rejected by user");
    });

    // Verify all validation steps were performed before failure
    expect(mockClient.getBalance).toHaveBeenCalled();
    expect(mockClient.estimateGas).toHaveBeenCalled();
    expect(mockSendTransaction).toHaveBeenCalled();
  });

  it("should validate addresses before sending transaction", async () => {
    const { result } = renderHook(() => useTransfer(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.transfer({
          recipient: "invalid-address",
          amount: "1.0",
        }),
      ).rejects.toThrow("No recipent wallet address available");
    });

    // No blockchain calls should be made for invalid address
    expect(mockClient.getBalance).not.toHaveBeenCalled();
    expect(mockSendTransaction).not.toHaveBeenCalled();
  });

  it("should provide user-friendly error messages", async () => {
    mockSendTransaction.mockRejectedValue(new Error("Gas limit exceeded"));

    const { result } = renderHook(() => useTransfer(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.transfer({
          recipient: "0x0987654321098765432109876543210987654321",
          amount: "1.0",
        }),
      ).rejects.toThrow("Transaction failed due to gas issues");
    });

    // The error is properly thrown and handled by the transaction system
    expect(mockSendTransaction).toHaveBeenCalled();
  });

  it("should handle external wallet transactions when embedded wallet fails", async () => {
    const mockTransactionHash = "0xexternal123def456789";
    const mockProvider = {
      request: vi.fn().mockResolvedValue(mockTransactionHash),
    };

    // Mock external wallet
    const mockExternalWallet = {
      address: mockWalletContext.address,
      getEthereumProvider: vi.fn().mockResolvedValue(mockProvider),
    };

    mockWallets.mockReturnValue([mockExternalWallet]);

    // Mock embedded wallet to fail first
    mockSendTransaction.mockRejectedValue(
      new Error("User must have an embedded wallet"),
    );

    const { result } = renderHook(() => useTransfer(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      const transferResult = await result.current.transfer({
        recipient: "0x0987654321098765432109876543210987654321",
        amount: "0.5",
      });

      expect(transferResult.hash).toBe(mockTransactionHash);
    });

    // Verify embedded wallet was tried first
    expect(mockSendTransaction).toHaveBeenCalledWith({
      to: "0x0987654321098765432109876543210987654321",
      value: parseEther("0.5").toString(),
    });

    // Verify external wallet provider was called
    expect(mockProvider.request).toHaveBeenCalledWith({
      method: "eth_sendTransaction",
      params: [
        {
          from: mockWalletContext.address,
          to: "0x0987654321098765432109876543210987654321",
          value: `0x${BigInt(parseEther("0.5").toString()).toString(16)}`,
        },
      ],
    });
  });

  it("should handle case when no external wallet is found", async () => {
    // Mock embedded wallet to fail
    mockSendTransaction.mockRejectedValue(
      new Error("User must have an embedded wallet"),
    );
    // No wallets available
    mockWallets.mockReturnValue([]);

    const { result } = renderHook(() => useTransfer(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.transfer({
          recipient: "0x0987654321098765432109876543210987654321",
          amount: "1.0",
        }),
      ).rejects.toThrow("No connected wallet found");
    });

    expect(mockSendTransaction).toHaveBeenCalled();
  });
});
