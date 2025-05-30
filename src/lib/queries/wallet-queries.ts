import { publicSepoliaClient } from "@/lib/privy";
import { truncateBalance } from "@/utils/balance";
import { type Address, formatEther } from "viem";
import { queryKeys } from "./query-keys";

/**
 * Custom error class for wallet-related errors
 */
export class WalletQueryError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = "WalletQueryError";
  }
}

/**
 * Query function to fetch wallet balance
 */
export const fetchWalletBalance = async (address: string): Promise<string> => {
  if (!address) {
    throw new WalletQueryError("Wallet address is required", "MISSING_ADDRESS");
  }

  // Validate address format (basic check)
  if (!address.startsWith("0x") || address.length !== 42) {
    throw new WalletQueryError(
      "Invalid wallet address format",
      "INVALID_ADDRESS",
      { address },
    );
  }

  try {
    const balanceResponse = await publicSepoliaClient.getBalance({
      address: address as Address,
    });

    const balanceAsEther = formatEther(balanceResponse);
    const truncatedBalance = truncateBalance(balanceAsEther);

    return truncatedBalance;
  } catch (error) {
    // Handle different types of errors
    if (error instanceof Error) {
      // Network or RPC errors
      if (
        error.message.includes("network") ||
        error.message.includes("timeout")
      ) {
        throw new WalletQueryError(
          "Network error while fetching balance",
          "NETWORK_ERROR",
          error,
        );
      }

      // Invalid address errors from the client
      if (
        error.message.includes("invalid") ||
        error.message.includes("address")
      ) {
        throw new WalletQueryError(
          "Invalid address provided to balance query",
          "INVALID_ADDRESS",
          error,
        );
      }

      // Rate limiting errors
      if (
        error.message.includes("rate limit") ||
        error.message.includes("429")
      ) {
        throw new WalletQueryError(
          "Rate limit exceeded, please try again later",
          "RATE_LIMIT",
          error,
        );
      }

      // Generic error with original message
      throw new WalletQueryError(
        `Failed to fetch wallet balance: ${error.message}`,
        "FETCH_ERROR",
        error,
      );
    }

    // Handle non-Error objects
    throw new WalletQueryError(
      "Unknown error occurred while fetching balance",
      "UNKNOWN_ERROR",
      error,
    );
  }
};

/**
 * Query options for wallet balance
 */
export const walletBalanceQueryOptions = (address: string | null) => ({
  queryKey: address ? queryKeys.wallet.balance(address) : [],
  queryFn: () => {
    if (!address) {
      throw new WalletQueryError("No address provided", "MISSING_ADDRESS");
    }
    return fetchWalletBalance(address);
  },
  enabled: !!address,
  staleTime: 30 * 1000, // 30 seconds
  gcTime: 5 * 60 * 1000, // 5 minutes
  retry: (failureCount: number, error: unknown) => {
    // Don't retry on validation errors
    if (error instanceof WalletQueryError) {
      if (["MISSING_ADDRESS", "INVALID_ADDRESS"].includes(error.code)) {
        return false;
      }
      // Retry on network errors up to 3 times
      if (error.code === "NETWORK_ERROR") {
        return failureCount < 3;
      }
      // Don't retry on rate limits
      if (error.code === "RATE_LIMIT") {
        return false;
      }
    }
    return failureCount < 2;
  },
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
});

/**
 * Helper function to check if an error is a wallet query error
 */
export const isWalletQueryError = (
  error: unknown,
): error is WalletQueryError => {
  return error instanceof WalletQueryError;
};

/**
 * Helper function to get user-friendly error message
 */
export const getWalletErrorMessage = (error: unknown): string => {
  if (isWalletQueryError(error)) {
    switch (error.code) {
      case "MISSING_ADDRESS":
        return "Please connect your wallet to view balance";
      case "INVALID_ADDRESS":
        return "Invalid wallet address";
      case "NETWORK_ERROR":
        return "Network connection error. Please check your internet connection.";
      case "RATE_LIMIT":
        return "Too many requests. Please wait a moment and try again.";
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
};
