import {
  TransactionError,
  type TransactionResult,
  type TransferParams,
  getTransaction,
  sendTransfer,
  waitForTransaction,
} from "@/lib/blockchain/transactions";
import type {
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import type { Address, Hash } from "viem";
import { queryKeys } from "./query-keys";

/**
 * Query options for getting a transaction by hash
 */
export const transactionQueryOptions = (
  hash: Hash | null,
): UseQueryOptions<TransactionQueryData, TransactionError> => ({
  queryKey: hash ? queryKeys.transaction.detail(hash) : [],
  queryFn: () => {
    if (!hash) {
      throw new TransactionError(
        "No transaction hash provided",
        "MISSING_HASH",
      );
    }
    return getTransaction(hash);
  },
  enabled: !!hash,
  staleTime: 5 * 60 * 1000, // 5 minutes - transactions don't change
  gcTime: 30 * 60 * 1000, // 30 minutes
  retry: (failureCount: number, error: unknown) => {
    if (error instanceof TransactionError) {
      if (["MISSING_HASH"].includes(error.code)) {
        return false;
      }
      if (error.code === "NETWORK_ERROR") {
        return failureCount < 3;
      }
    }
    return failureCount < 2;
  },
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
});

/**
 * Query options for waiting for transaction confirmation
 */
export const transactionConfirmationQueryOptions = (
  hash: Hash | null,
): UseQueryOptions<TransactionConfirmationData, TransactionError> => ({
  queryKey: hash ? queryKeys.transaction.confirmation(hash) : [],
  queryFn: () => {
    if (!hash) {
      throw new TransactionError(
        "No transaction hash provided",
        "MISSING_HASH",
      );
    }
    return waitForTransaction(hash);
  },
  enabled: !!hash,
  staleTime: Number.POSITIVE_INFINITY, // Once confirmed, never refetch
  gcTime: 60 * 60 * 1000, // 1 hour
  retry: (failureCount: number, error: unknown) => {
    if (error instanceof TransactionError) {
      if (["MISSING_HASH", "CONFIRMATION_ERROR"].includes(error.code)) {
        return false;
      }
    }
    return failureCount < 1; // Only retry once for confirmations
  },
  retryDelay: 5000, // 5 seconds between retries
});

/**
 * Mutation options for sending transfer transactions
 */
export const transferMutationOptions: UseMutationOptions<
  TransactionResult,
  TransactionError,
  TransferParams
> = {
  mutationFn: sendTransfer,
  retry: (failureCount: number, error: unknown) => {
    if (error instanceof TransactionError) {
      // Don't retry validation errors
      if (
        [
          "INVALID_FROM_ADDRESS",
          "INVALID_TO_ADDRESS",
          "INVALID_AMOUNT",
          "SAME_ADDRESS",
          "INSUFFICIENT_BALANCE",
          "USER_REJECTED",
          "MISSING_SEND_FUNCTION",
          "NO_WALLET_CONNECTION",
        ].includes(error.code)
      ) {
        return false;
      }
      // Retry network errors up to 2 times
      if (error.code === "NETWORK_ERROR") {
        return failureCount < 2;
      }
    }
    return false; // Don't retry by default for transactions
  },
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 10000),
};

/**
 * Helper types for transaction queries
 */
export type TransactionQueryData = Awaited<ReturnType<typeof getTransaction>>;
export type TransactionConfirmationData = Awaited<
  ReturnType<typeof waitForTransaction>
>;

/**
 * Helper function to invalidate transaction-related queries
 */
export const getTransactionInvalidationKeys = (hash?: Hash) => {
  if (hash) {
    return [
      queryKeys.transaction.detail(hash),
      queryKeys.transaction.confirmation(hash),
    ];
  }
  return [queryKeys.transaction.all];
};
