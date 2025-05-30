import { type Address, parseEther } from "viem";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  TransactionError,
  type TransferParams,
  getTransaction,
  getTransactionErrorMessage,
  isTransactionError,
  sendTransfer,
  waitForTransaction,
} from "../transactions";

// Mock the privy client
vi.mock("@/lib/privy", () => ({
  publicSepoliaClient: {
    getBalance: vi.fn(),
    estimateGas: vi.fn(),
    getGasPrice: vi.fn(),
    getTransaction: vi.fn(),
    waitForTransactionReceipt: vi.fn(),
  },
}));

import { publicSepoliaClient } from "@/lib/privy";
const mockClient = vi.mocked(publicSepoliaClient);

describe("transactions", () => {
  const mockAddresses = {
    from: "0x1234567890123456789012345678901234567890" as Address,
    to: "0x0987654321098765432109876543210987654321" as Address,
    invalid: "invalid-address",
    same: "0x1234567890123456789012345678901234567890" as Address,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("sendTransfer", () => {
    const mockSendTransaction = vi.fn();
    const validTransferParams: TransferParams = {
      from: mockAddresses.from,
      to: mockAddresses.to,
      amount: "1.0",
      sendTransaction: mockSendTransaction,
    };

    describe("validation", () => {
      beforeEach(() => {
        mockSendTransaction.mockClear();
      });

      it("should throw error for invalid from address", async () => {
        const params = {
          ...validTransferParams,
          from: mockAddresses.invalid as Address,
        };

        await expect(sendTransfer(params)).rejects.toThrow(TransactionError);
        await expect(sendTransfer(params)).rejects.toThrow(
          "Invalid sender address",
        );
      });

      it("should throw error for invalid to address", async () => {
        const params = {
          ...validTransferParams,
          to: mockAddresses.invalid as Address,
        };

        await expect(sendTransfer(params)).rejects.toThrow(TransactionError);
        await expect(sendTransfer(params)).rejects.toThrow(
          "Invalid recipient address",
        );
      });

      it("should throw error for invalid amount", async () => {
        const params = { ...validTransferParams, amount: "0" };

        await expect(sendTransfer(params)).rejects.toThrow(TransactionError);
        await expect(sendTransfer(params)).rejects.toThrow("Invalid amount");
      });

      it("should throw error for negative amount", async () => {
        const params = { ...validTransferParams, amount: "-1" };

        await expect(sendTransfer(params)).rejects.toThrow(TransactionError);
        await expect(sendTransfer(params)).rejects.toThrow("Invalid amount");
      });

      it("should throw error for non-numeric amount", async () => {
        const params = { ...validTransferParams, amount: "abc" };

        await expect(sendTransfer(params)).rejects.toThrow(TransactionError);
        await expect(sendTransfer(params)).rejects.toThrow("Invalid amount");
      });

      it("should throw error when sending to same address", async () => {
        const params = { ...validTransferParams, to: mockAddresses.same };

        await expect(sendTransfer(params)).rejects.toThrow(TransactionError);
        await expect(sendTransfer(params)).rejects.toThrow(
          "Cannot send to the same address",
        );
      });

      it("should throw error for missing sendTransaction function", async () => {
        const params = {
          ...validTransferParams,
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          sendTransaction: undefined as any,
        };

        await expect(sendTransfer(params)).rejects.toThrow(TransactionError);
        await expect(sendTransfer(params)).rejects.toThrow(
          "Send transaction function is required",
        );
      });

      it("should throw error for invalid sendTransaction function", async () => {
        const params = {
          ...validTransferParams,
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          sendTransaction: "not a function" as any,
        };

        await expect(sendTransfer(params)).rejects.toThrow(TransactionError);
        await expect(sendTransfer(params)).rejects.toThrow(
          "Send transaction function is required",
        );
      });
    });

    describe("balance checking", () => {
      beforeEach(() => {
        mockSendTransaction.mockClear();
      });

      it("should throw error for insufficient balance", async () => {
        const balance = parseEther("0.5"); // Less than required amount
        mockClient.getBalance.mockResolvedValue(balance);

        // Ensure sendTransaction is not called for this test
        mockSendTransaction.mockImplementation(() => {
          throw new Error("sendTransaction should not be called");
        });

        await expect(sendTransfer(validTransferParams)).rejects.toThrow(
          TransactionError,
        );
        await expect(sendTransfer(validTransferParams)).rejects.toThrow(
          "Insufficient balance",
        );

        expect(mockClient.getBalance).toHaveBeenCalledWith({
          address: mockAddresses.from,
        });
        expect(mockSendTransaction).not.toHaveBeenCalled();
      });

      it("should proceed when balance is sufficient", async () => {
        const balance = parseEther("2.0"); // More than required amount
        const mockHash = "0x1234567890abcdef";
        mockClient.getBalance.mockResolvedValue(balance);
        mockClient.estimateGas.mockResolvedValue(BigInt(21000));
        mockClient.getGasPrice.mockResolvedValue(BigInt(20000000000));
        mockSendTransaction.mockResolvedValue({ hash: mockHash });

        const result = await sendTransfer(validTransferParams);

        expect(result).toMatchObject({
          hash: mockHash,
          from: mockAddresses.from,
          to: mockAddresses.to,
          amount: "1.0",
        });
        expect(result.timestamp).toBeDefined();
        expect(mockSendTransaction).toHaveBeenCalledWith({
          to: mockAddresses.to,
          value: parseEther("1.0").toString(),
        });
      });

      it("should handle balance check errors", async () => {
        mockClient.getBalance.mockRejectedValue(new Error("Network error"));

        await expect(sendTransfer(validTransferParams)).rejects.toThrow(
          TransactionError,
        );
        await expect(sendTransfer(validTransferParams)).rejects.toThrow(
          "Failed to check balance",
        );
      });
    });

    describe("gas estimation", () => {
      beforeEach(() => {
        const balance = parseEther("2.0");
        mockClient.getBalance.mockResolvedValue(balance);
        mockSendTransaction.mockClear();
        mockSendTransaction.mockResolvedValue({ hash: "0xtest" });
      });

      it("should estimate gas successfully", async () => {
        mockClient.estimateGas.mockResolvedValue(BigInt(21000));
        mockClient.getGasPrice.mockResolvedValue(BigInt(20000000000));

        const result = await sendTransfer(validTransferParams);

        expect(mockClient.estimateGas).toHaveBeenCalledWith({
          account: mockAddresses.from,
          to: mockAddresses.to,
          value: parseEther("1.0"),
        });
        expect(result.hash).toBe("0xtest");
      });

      it("should handle gas estimation errors", async () => {
        const balance = parseEther("2.0");
        mockClient.getBalance.mockResolvedValue(balance);
        mockClient.estimateGas.mockRejectedValue(
          new Error("Gas estimation failed"),
        );

        await expect(sendTransfer(validTransferParams)).rejects.toThrow(
          TransactionError,
        );
        await expect(sendTransfer(validTransferParams)).rejects.toThrow(
          "Failed to estimate gas",
        );
      });
    });

    describe("transaction sending", () => {
      beforeEach(() => {
        const balance = parseEther("2.0");
        mockClient.getBalance.mockResolvedValue(balance);
        mockClient.estimateGas.mockResolvedValue(BigInt(21000));
        mockClient.getGasPrice.mockResolvedValue(BigInt(20000000000));
        mockSendTransaction.mockClear();
      });

      it("should send transaction successfully", async () => {
        const mockHash = "0xabcdef1234567890";
        mockSendTransaction.mockResolvedValueOnce({ hash: mockHash });

        const result = await sendTransfer(validTransferParams);

        expect(mockSendTransaction).toHaveBeenCalledWith({
          to: mockAddresses.to,
          value: parseEther("1.0").toString(),
        });

        expect(result).toEqual({
          hash: mockHash,
          from: mockAddresses.from,
          to: mockAddresses.to,
          amount: "1.0",
          timestamp: expect.any(Number),
        });
      });

      it("should handle transaction rejection by user", async () => {
        const balance = parseEther("2.0");
        mockClient.getBalance.mockResolvedValue(balance);
        mockClient.estimateGas.mockResolvedValue(BigInt(21000));
        mockClient.getGasPrice.mockResolvedValue(BigInt(20000000000));
        mockSendTransaction.mockRejectedValue(
          new Error("User rejected transaction"),
        );

        await expect(sendTransfer(validTransferParams)).rejects.toThrow(
          TransactionError,
        );
        await expect(sendTransfer(validTransferParams)).rejects.toThrow(
          "Transaction was rejected by user",
        );
      });

      it("should handle network errors during transaction", async () => {
        const balance = parseEther("2.0");
        mockClient.getBalance.mockResolvedValue(balance);
        mockClient.estimateGas.mockResolvedValue(BigInt(21000));
        mockClient.getGasPrice.mockResolvedValue(BigInt(20000000000));
        mockSendTransaction.mockRejectedValue(new Error("Network timeout"));

        await expect(sendTransfer(validTransferParams)).rejects.toThrow(
          TransactionError,
        );
        await expect(sendTransfer(validTransferParams)).rejects.toThrow(
          "Network error during transaction",
        );
      });

      it("should handle gas-related transaction errors", async () => {
        const balance = parseEther("2.0");
        mockClient.getBalance.mockResolvedValue(balance);
        mockClient.estimateGas.mockResolvedValue(BigInt(21000));
        mockClient.getGasPrice.mockResolvedValue(BigInt(20000000000));
        mockSendTransaction.mockRejectedValue(new Error("Gas limit exceeded"));

        await expect(sendTransfer(validTransferParams)).rejects.toThrow(
          TransactionError,
        );
        await expect(sendTransfer(validTransferParams)).rejects.toThrow(
          "Transaction failed due to gas issues",
        );
      });

      it("should handle unknown transaction errors", async () => {
        const balance = parseEther("2.0");
        mockClient.getBalance.mockResolvedValue(balance);
        mockClient.estimateGas.mockResolvedValue(BigInt(21000));
        mockClient.getGasPrice.mockResolvedValue(BigInt(20000000000));
        mockSendTransaction.mockRejectedValue(
          new Error("Unknown blockchain error"),
        );

        await expect(sendTransfer(validTransferParams)).rejects.toThrow(
          TransactionError,
        );
        await expect(sendTransfer(validTransferParams)).rejects.toThrow(
          "Transaction failed: Unknown blockchain error",
        );
      });

      it("should convert amount to wei correctly", async () => {
        const balance = parseEther("10.0"); // Sufficient balance for 2.5 ETH
        mockClient.getBalance.mockResolvedValue(balance);
        mockClient.estimateGas.mockResolvedValue(BigInt(21000));
        mockClient.getGasPrice.mockResolvedValue(BigInt(20000000000));

        const mockHash = "0xtest123";
        mockSendTransaction.mockResolvedValue({ hash: mockHash });

        const testAmount = "2.5";
        const params = { ...validTransferParams, amount: testAmount };

        await sendTransfer(params);

        expect(mockSendTransaction).toHaveBeenCalledWith({
          to: mockAddresses.to,
          value: parseEther(testAmount).toString(),
        });
      });
    });
  });

  describe("getTransaction", () => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const mockHash = "0xabc123def456" as any;

    it("should fetch transaction successfully", async () => {
      const mockTransaction = {
        hash: mockHash,
        from: mockAddresses.from,
        to: mockAddresses.to,
        value: parseEther("1.0"),
      };

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      mockClient.getTransaction.mockResolvedValueOnce(mockTransaction as any);

      const result = await getTransaction(mockHash);

      expect(result).toEqual(mockTransaction);
      expect(mockClient.getTransaction).toHaveBeenCalledWith({
        hash: mockHash,
      });
    });

    it("should handle fetch transaction errors", async () => {
      mockClient.getTransaction.mockRejectedValue(
        new Error("Transaction not found"),
      );

      await expect(getTransaction(mockHash)).rejects.toThrow(TransactionError);
      await expect(getTransaction(mockHash)).rejects.toThrow(
        "Failed to fetch transaction",
      );
    });
  });

  describe("waitForTransaction", () => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const mockHash = "0xabc123def456" as any;

    it("should wait for transaction confirmation successfully", async () => {
      const mockReceipt = {
        transactionHash: mockHash,
        status: "success",
        blockNumber: BigInt(12345),
      };

      mockClient.waitForTransactionReceipt.mockResolvedValueOnce(
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        mockReceipt as any,
      );

      const result = await waitForTransaction(mockHash);

      expect(result).toEqual(mockReceipt);
      expect(mockClient.waitForTransactionReceipt).toHaveBeenCalledWith({
        hash: mockHash,
        timeout: 60000,
      });
    });

    it("should handle confirmation timeout", async () => {
      mockClient.waitForTransactionReceipt.mockRejectedValue(
        new Error("Timeout"),
      );

      await expect(waitForTransaction(mockHash)).rejects.toThrow(
        TransactionError,
      );
      await expect(waitForTransaction(mockHash)).rejects.toThrow(
        "Transaction confirmation timeout or failed",
      );
    });
  });

  describe("TransactionError", () => {
    it("should create error with code and message", () => {
      const error = new TransactionError("Test message", "TEST_CODE");

      expect(error.message).toBe("Test message");
      expect(error.code).toBe("TEST_CODE");
      expect(error.name).toBe("TransactionError");
    });

    it("should include original error", () => {
      const originalError = new Error("Original");
      const error = new TransactionError(
        "Test message",
        "TEST_CODE",
        originalError,
      );

      expect(error.originalError).toBe(originalError);
    });
  });

  describe("isTransactionError", () => {
    it("should return true for TransactionError", () => {
      const error = new TransactionError("Test", "TEST_CODE");
      expect(isTransactionError(error)).toBe(true);
    });

    it("should return false for regular Error", () => {
      const error = new Error("Test");
      expect(isTransactionError(error)).toBe(false);
    });

    it("should return false for non-error objects", () => {
      expect(isTransactionError("string")).toBe(false);
      expect(isTransactionError({})).toBe(false);
      expect(isTransactionError(null)).toBe(false);
    });
  });

  describe("getTransactionErrorMessage", () => {
    it("should return user-friendly message for known error codes", () => {
      const testCases = [
        { code: "INVALID_FROM_ADDRESS", expected: "Invalid sender address" },
        {
          code: "INVALID_TO_ADDRESS",
          expected: "Please enter a valid recipient address",
        },
        {
          code: "INVALID_AMOUNT",
          expected: "Please enter a valid amount greater than 0",
        },
        { code: "SAME_ADDRESS", expected: "Cannot send funds to yourself" },
        {
          code: "INSUFFICIENT_BALANCE",
          expected: "Insufficient balance for this transaction",
        },
        { code: "USER_REJECTED", expected: "Transaction was cancelled" },
        {
          code: "NETWORK_ERROR",
          expected: "Network error. Please check your connection and try again",
        },
        {
          code: "MISSING_SEND_FUNCTION",
          expected: "Wallet connection error. Please reconnect your wallet",
        },
        {
          code: "NO_WALLET_CONNECTION",
          expected: "No connected wallet found. Please connect your wallet",
        },
      ];

      for (const { code, expected } of testCases) {
        const error = new TransactionError("Original message", code);
        expect(getTransactionErrorMessage(error)).toBe(expected);
      }
    });

    it("should return original message for unknown error codes", () => {
      const error = new TransactionError("Custom message", "UNKNOWN_CODE");
      expect(getTransactionErrorMessage(error)).toBe("Custom message");
    });

    it("should handle regular Error objects", () => {
      const error = new Error("Regular error");
      expect(getTransactionErrorMessage(error)).toBe("Regular error");
    });

    it("should handle non-error objects", () => {
      expect(getTransactionErrorMessage("string error")).toBe(
        "An unexpected error occurred",
      );
      expect(getTransactionErrorMessage({})).toBe(
        "An unexpected error occurred",
      );
      expect(getTransactionErrorMessage(null)).toBe(
        "An unexpected error occurred",
      );
    });
  });
});
