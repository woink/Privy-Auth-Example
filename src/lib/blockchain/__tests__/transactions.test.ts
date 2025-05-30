import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { type Address, parseEther } from "viem";
import {
  sendTransfer,
  getTransaction,
  waitForTransaction,
  TransactionError,
  isTransactionError,
  getTransactionErrorMessage,
  type TransferParams,
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
    const validTransferParams: TransferParams = {
      from: mockAddresses.from,
      to: mockAddresses.to,
      amount: "1.0",
    };

    describe("validation", () => {
      it("should throw error for invalid from address", async () => {
        const params = { ...validTransferParams, from: mockAddresses.invalid as Address };

        await expect(sendTransfer(params)).rejects.toThrow(TransactionError);
        await expect(sendTransfer(params)).rejects.toThrow("Invalid sender address");
      });

      it("should throw error for invalid to address", async () => {
        const params = { ...validTransferParams, to: mockAddresses.invalid as Address };

        await expect(sendTransfer(params)).rejects.toThrow(TransactionError);
        await expect(sendTransfer(params)).rejects.toThrow("Invalid recipient address");
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
        await expect(sendTransfer(params)).rejects.toThrow("Cannot send to the same address");
      });
    });

    describe("balance checking", () => {
      it("should throw error for insufficient balance", async () => {
        const balance = parseEther("0.5"); // Less than required amount
        mockClient.getBalance.mockResolvedValueOnce(balance);

        await expect(sendTransfer(validTransferParams)).rejects.toThrow(TransactionError);
        await expect(sendTransfer(validTransferParams)).rejects.toThrow("Insufficient balance");

        expect(mockClient.getBalance).toHaveBeenCalledWith({
          address: mockAddresses.from,
        });
      });

      it("should proceed when balance is sufficient", async () => {
        const balance = parseEther("2.0"); // More than required amount
        mockClient.getBalance.mockResolvedValueOnce(balance);
        mockClient.estimateGas.mockResolvedValueOnce(21000n);
        mockClient.getGasPrice.mockResolvedValueOnce(20000000000n);

        const result = await sendTransfer(validTransferParams);

        expect(result).toMatchObject({
          from: mockAddresses.from,
          to: mockAddresses.to,
          amount: "1.0",
        });
        expect(result.hash).toBeDefined();
        expect(result.timestamp).toBeDefined();
      });

      it("should handle balance check errors", async () => {
        mockClient.getBalance.mockRejectedValueOnce(new Error("Network error"));

        await expect(sendTransfer(validTransferParams)).rejects.toThrow(TransactionError);
        await expect(sendTransfer(validTransferParams)).rejects.toThrow("Failed to check balance");
      });
    });

    describe("gas estimation", () => {
      beforeEach(() => {
        // Mock sufficient balance
        mockClient.getBalance.mockResolvedValue(parseEther("10.0"));
      });

      it("should estimate gas successfully", async () => {
        mockClient.estimateGas.mockResolvedValueOnce(21000n);
        mockClient.getGasPrice.mockResolvedValueOnce(20000000000n);

        const result = await sendTransfer(validTransferParams);

        expect(mockClient.estimateGas).toHaveBeenCalledWith({
          account: mockAddresses.from,
          to: mockAddresses.to,
          value: parseEther("1.0"),
        });
        expect(result).toBeDefined();
      });

      it("should handle gas estimation errors", async () => {
        mockClient.estimateGas.mockRejectedValueOnce(new Error("Gas estimation failed"));

        await expect(sendTransfer(validTransferParams)).rejects.toThrow(TransactionError);
        await expect(sendTransfer(validTransferParams)).rejects.toThrow("Failed to estimate gas");
      });
    });
  });

  describe("getTransaction", () => {
    const mockHash = "0xabc123def456" as any;

    it("should fetch transaction successfully", async () => {
      const mockTransaction = {
        hash: mockHash,
        from: mockAddresses.from,
        to: mockAddresses.to,
        value: parseEther("1.0"),
      };

      mockClient.getTransaction.mockResolvedValueOnce(mockTransaction as any);

      const result = await getTransaction(mockHash);

      expect(result).toEqual(mockTransaction);
      expect(mockClient.getTransaction).toHaveBeenCalledWith({ hash: mockHash });
    });

    it("should handle fetch transaction errors", async () => {
      mockClient.getTransaction.mockRejectedValueOnce(new Error("Transaction not found"));

      await expect(getTransaction(mockHash)).rejects.toThrow(TransactionError);
      await expect(getTransaction(mockHash)).rejects.toThrow("Failed to fetch transaction");
    });
  });

  describe("waitForTransaction", () => {
    const mockHash = "0xabc123def456" as any;

    it("should wait for transaction confirmation successfully", async () => {
      const mockReceipt = {
        transactionHash: mockHash,
        status: "success",
        blockNumber: 12345n,
      };

      mockClient.waitForTransactionReceipt.mockResolvedValueOnce(mockReceipt as any);

      const result = await waitForTransaction(mockHash);

      expect(result).toEqual(mockReceipt);
      expect(mockClient.waitForTransactionReceipt).toHaveBeenCalledWith({
        hash: mockHash,
        timeout: 60000,
      });
    });

    it("should handle confirmation timeout", async () => {
      mockClient.waitForTransactionReceipt.mockRejectedValueOnce(new Error("Timeout"));

      await expect(waitForTransaction(mockHash)).rejects.toThrow(TransactionError);
      await expect(waitForTransaction(mockHash)).rejects.toThrow("Transaction confirmation timeout");
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
      const error = new TransactionError("Test message", "TEST_CODE", originalError);

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
        { code: "INVALID_TO_ADDRESS", expected: "Please enter a valid recipient address" },
        { code: "INVALID_AMOUNT", expected: "Please enter a valid amount greater than 0" },
        { code: "SAME_ADDRESS", expected: "Cannot send funds to yourself" },
        { code: "INSUFFICIENT_BALANCE", expected: "Insufficient balance for this transaction" },
        { code: "USER_REJECTED", expected: "Transaction was cancelled" },
        { code: "NETWORK_ERROR", expected: "Network error. Please check your connection and try again" },
      ];

      testCases.forEach(({ code, expected }) => {
        const error = new TransactionError("Original message", code);
        expect(getTransactionErrorMessage(error)).toBe(expected);
      });
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
      expect(getTransactionErrorMessage("string error")).toBe("An unexpected error occurred");
      expect(getTransactionErrorMessage({})).toBe("An unexpected error occurred");
      expect(getTransactionErrorMessage(null)).toBe("An unexpected error occurred");
    });
  });
});