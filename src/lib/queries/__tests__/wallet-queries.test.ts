import { publicSepoliaClient } from "@/lib/privy";
import { truncateBalance } from "@/utils/balance";
import { formatEther } from "viem";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import {
  WalletQueryError,
  fetchWalletBalance,
  getWalletErrorMessage,
  isWalletQueryError,
  walletBalanceQueryOptions,
} from "../wallet-queries";

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

describe("wallet-queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFormatEther.mockImplementation((value: bigint) => value.toString());
    mockTruncateBalance.mockImplementation((value: string) => value);
  });

  describe("WalletQueryError", () => {
    it("should create error with message and code", () => {
      const error = new WalletQueryError("Test message", "TEST_CODE");

      expect(error.message).toBe("Test message");
      expect(error.code).toBe("TEST_CODE");
      expect(error.name).toBe("WalletQueryError");
      expect(error.originalError).toBeUndefined();
    });

    it("should create error with original error", () => {
      const originalError = new Error("Original error");
      const error = new WalletQueryError(
        "Test message",
        "TEST_CODE",
        originalError,
      );

      expect(error.originalError).toBe(originalError);
    });

    it("should be instance of Error", () => {
      const error = new WalletQueryError("Test message", "TEST_CODE");
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("fetchWalletBalance", () => {
    const validAddress = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";

    describe("validation", () => {
      it("should throw error when address is empty", async () => {
        await expect(fetchWalletBalance("")).rejects.toThrow(WalletQueryError);
        await expect(fetchWalletBalance("")).rejects.toThrow(
          "Wallet address is required",
        );
      });

      it("should throw error when address doesn't start with 0x", async () => {
        await expect(
          fetchWalletBalance("742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2"),
        ).rejects.toThrow(WalletQueryError);
        await expect(
          fetchWalletBalance("742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2"),
        ).rejects.toThrow("Invalid wallet address format");
      });

      it("should throw error when address is wrong length", async () => {
        await expect(fetchWalletBalance("0x742d35")).rejects.toThrow(
          WalletQueryError,
        );
        await expect(fetchWalletBalance("0x742d35")).rejects.toThrow(
          "Invalid wallet address format",
        );
      });

      it("should validate error code for invalid address", async () => {
        try {
          await fetchWalletBalance("invalid");
        } catch (error) {
          expect(error).toBeInstanceOf(WalletQueryError);
          expect((error as WalletQueryError).code).toBe("INVALID_ADDRESS");
        }
      });
    });

    describe("successful fetching", () => {
      it("should fetch and format balance successfully", async () => {
        const mockBalance = BigInt("1000000000000000000"); // 1 ETH in wei
        const formattedBalance = "1.0";
        const truncatedBalance = "1";

        mockGetBalance.mockResolvedValue(mockBalance);
        mockFormatEther.mockReturnValue(formattedBalance);
        mockTruncateBalance.mockReturnValue(truncatedBalance);

        const result = await fetchWalletBalance(validAddress);

        expect(result).toBe(truncatedBalance);
        expect(mockGetBalance).toHaveBeenCalledWith({
          address: validAddress,
        });
        expect(mockFormatEther).toHaveBeenCalledWith(mockBalance);
        expect(mockTruncateBalance).toHaveBeenCalledWith(formattedBalance);
      });

      it("should handle zero balance", async () => {
        const mockBalance = BigInt("0");
        const formattedBalance = "0.0";
        const truncatedBalance = "0";

        mockGetBalance.mockResolvedValue(mockBalance);
        mockFormatEther.mockReturnValue(formattedBalance);
        mockTruncateBalance.mockReturnValue(truncatedBalance);

        const result = await fetchWalletBalance(validAddress);

        expect(result).toBe(truncatedBalance);
      });

      it("should handle very large balance", async () => {
        const mockBalance = BigInt("999999000000000000000000"); // 999999 ETH in wei
        const formattedBalance = "999999.0";
        const truncatedBalance = "999999";

        mockGetBalance.mockResolvedValue(mockBalance);
        mockFormatEther.mockReturnValue(formattedBalance);
        mockTruncateBalance.mockReturnValue(truncatedBalance);

        const result = await fetchWalletBalance(validAddress);

        expect(result).toBe(truncatedBalance);
      });
    });

    describe("error handling", () => {
      it("should handle network errors", async () => {
        const networkError = new Error("network timeout");
        mockGetBalance.mockRejectedValue(networkError);

        try {
          await fetchWalletBalance(validAddress);
        } catch (error) {
          expect(error).toBeInstanceOf(WalletQueryError);
          expect((error as WalletQueryError).code).toBe("NETWORK_ERROR");
          expect((error as WalletQueryError).message).toContain(
            "Network error",
          );
          expect((error as WalletQueryError).originalError).toBe(networkError);
        }
      });

      it("should handle invalid address errors from client", async () => {
        const invalidAddressError = new Error("invalid address format");
        mockGetBalance.mockRejectedValue(invalidAddressError);

        try {
          await fetchWalletBalance(validAddress);
        } catch (error) {
          expect(error).toBeInstanceOf(WalletQueryError);
          expect((error as WalletQueryError).code).toBe("INVALID_ADDRESS");
          expect((error as WalletQueryError).originalError).toBe(
            invalidAddressError,
          );
        }
      });

      it("should handle rate limit errors", async () => {
        const rateLimitError = new Error("rate limit exceeded - 429");
        mockGetBalance.mockRejectedValue(rateLimitError);

        try {
          await fetchWalletBalance(validAddress);
        } catch (error) {
          expect(error).toBeInstanceOf(WalletQueryError);
          expect((error as WalletQueryError).code).toBe("RATE_LIMIT");
          expect((error as WalletQueryError).message).toContain(
            "Rate limit exceeded",
          );
        }
      });

      it("should handle generic errors", async () => {
        const genericError = new Error("Something went wrong");
        mockGetBalance.mockRejectedValue(genericError);

        try {
          await fetchWalletBalance(validAddress);
        } catch (error) {
          expect(error).toBeInstanceOf(WalletQueryError);
          expect((error as WalletQueryError).code).toBe("FETCH_ERROR");
          expect((error as WalletQueryError).message).toContain(
            "Failed to fetch wallet balance",
          );
        }
      });

      it("should handle non-Error thrown values", async () => {
        const nonError = "String error";
        mockGetBalance.mockRejectedValue(nonError);

        try {
          await fetchWalletBalance(validAddress);
        } catch (error) {
          expect(error).toBeInstanceOf(WalletQueryError);
          expect((error as WalletQueryError).code).toBe("UNKNOWN_ERROR");
          expect((error as WalletQueryError).originalError).toBe(nonError);
        }
      });
    });
  });

  describe("walletBalanceQueryOptions", () => {
    const validAddress = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";

    it("should return correct query options for valid address", () => {
      const options = walletBalanceQueryOptions(validAddress);

      expect(options.queryKey).toEqual(["wallet", "balance", validAddress]);
      expect(options.enabled).toBe(true);
      expect(options.staleTime).toBe(30 * 1000);
      expect(options.gcTime).toBe(5 * 60 * 1000);
      expect(typeof options.queryFn).toBe("function");
    });

    it("should return disabled query for null address", () => {
      const options = walletBalanceQueryOptions(null);

      expect(options.queryKey).toEqual([]);
      expect(options.enabled).toBe(false);
    });

    it("should call fetchWalletBalance in queryFn", async () => {
      const options = walletBalanceQueryOptions(validAddress);
      const mockBalance = "1.5";

      mockGetBalance.mockResolvedValue(BigInt("1500000000000000000"));
      mockFormatEther.mockReturnValue("1.5");
      mockTruncateBalance.mockReturnValue(mockBalance);

      const result = await options.queryFn();
      expect(result).toBe(mockBalance);
    });

    it("should throw error in queryFn when no address", () => {
      const options = walletBalanceQueryOptions(null);

      expect(() => options.queryFn()).toThrow(WalletQueryError);
      expect(() => options.queryFn()).toThrow("No address provided");
    });

    describe("retry logic", () => {
      it("should not retry validation errors", () => {
        const options = walletBalanceQueryOptions(validAddress);
        const missingAddressError = new WalletQueryError(
          "Missing address",
          "MISSING_ADDRESS",
        );
        const invalidAddressError = new WalletQueryError(
          "Invalid address",
          "INVALID_ADDRESS",
        );

        expect(options.retry(1, missingAddressError)).toBe(false);
        expect(options.retry(1, invalidAddressError)).toBe(false);
      });

      it("should retry network errors up to 3 times", () => {
        const options = walletBalanceQueryOptions(validAddress);
        const networkError = new WalletQueryError(
          "Network error",
          "NETWORK_ERROR",
        );

        expect(options.retry(0, networkError)).toBe(true);
        expect(options.retry(1, networkError)).toBe(true);
        expect(options.retry(2, networkError)).toBe(true);
        expect(options.retry(3, networkError)).toBe(false);
      });

      it("should not retry rate limit errors", () => {
        const options = walletBalanceQueryOptions(validAddress);
        const rateLimitError = new WalletQueryError("Rate limit", "RATE_LIMIT");

        expect(options.retry(1, rateLimitError)).toBe(false);
      });

      it("should retry other errors up to 2 times", () => {
        const options = walletBalanceQueryOptions(validAddress);
        const fetchError = new WalletQueryError("Fetch error", "FETCH_ERROR");

        expect(options.retry(0, fetchError)).toBe(true);
        expect(options.retry(1, fetchError)).toBe(true);
        expect(options.retry(2, fetchError)).toBe(false);
      });

      it("should handle non-WalletQueryError errors", () => {
        const options = walletBalanceQueryOptions(validAddress);
        const genericError = new Error("Generic error");

        expect(options.retry(0, genericError)).toBe(true);
        expect(options.retry(1, genericError)).toBe(true);
        expect(options.retry(2, genericError)).toBe(false);
      });
    });

    describe("retry delay", () => {
      it("should calculate exponential backoff delay", () => {
        const options = walletBalanceQueryOptions(validAddress);

        expect(options.retryDelay(0)).toBe(1000);
        expect(options.retryDelay(1)).toBe(2000);
        expect(options.retryDelay(2)).toBe(4000);
        expect(options.retryDelay(3)).toBe(8000);
        expect(options.retryDelay(10)).toBe(30000); // Max cap
      });
    });
  });

  describe("isWalletQueryError", () => {
    it("should return true for WalletQueryError instances", () => {
      const error = new WalletQueryError("Test", "TEST_CODE");
      expect(isWalletQueryError(error)).toBe(true);
    });

    it("should return false for regular Error instances", () => {
      const error = new Error("Test");
      expect(isWalletQueryError(error)).toBe(false);
    });

    it("should return false for non-error values", () => {
      expect(isWalletQueryError("string")).toBe(false);
      expect(isWalletQueryError(null)).toBe(false);
      expect(isWalletQueryError(undefined)).toBe(false);
      expect(isWalletQueryError({})).toBe(false);
    });
  });

  describe("getWalletErrorMessage", () => {
    it("should return user-friendly message for MISSING_ADDRESS", () => {
      const error = new WalletQueryError("Missing address", "MISSING_ADDRESS");
      expect(getWalletErrorMessage(error)).toBe(
        "Please connect your wallet to view balance",
      );
    });

    it("should return user-friendly message for INVALID_ADDRESS", () => {
      const error = new WalletQueryError("Invalid address", "INVALID_ADDRESS");
      expect(getWalletErrorMessage(error)).toBe("Invalid wallet address");
    });

    it("should return user-friendly message for NETWORK_ERROR", () => {
      const error = new WalletQueryError("Network error", "NETWORK_ERROR");
      expect(getWalletErrorMessage(error)).toBe(
        "Network connection error. Please check your internet connection.",
      );
    });

    it("should return user-friendly message for RATE_LIMIT", () => {
      const error = new WalletQueryError("Rate limit", "RATE_LIMIT");
      expect(getWalletErrorMessage(error)).toBe(
        "Too many requests. Please wait a moment and try again.",
      );
    });

    it("should return original message for unknown wallet error codes", () => {
      const error = new WalletQueryError("Custom error", "CUSTOM_CODE");
      expect(getWalletErrorMessage(error)).toBe("Custom error");
    });

    it("should handle regular Error instances", () => {
      const error = new Error("Regular error");
      expect(getWalletErrorMessage(error)).toBe("Regular error");
    });

    it("should handle non-error values", () => {
      expect(getWalletErrorMessage("string error")).toBe(
        "An unexpected error occurred",
      );
      expect(getWalletErrorMessage(null)).toBe("An unexpected error occurred");
      expect(getWalletErrorMessage(undefined)).toBe(
        "An unexpected error occurred",
      );
    });
  });
});
