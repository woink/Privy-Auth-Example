"use client";

import { useWallet } from "@/contexts/WalletContext";
import {
  TransactionError,
  type TransactionResult,
  type TransferParams,
  getTransactionErrorMessage,
} from "@/lib/blockchain/transactions";
import { queryKeys } from "@/lib/queries/query-keys";
import {
  getTransactionInvalidationKeys,
  transferMutationOptions,
} from "@/lib/queries/transaction-queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { Address } from "viem";

export interface UseTransferOptions {
  onSuccess?: (data: TransactionResult) => void;
  onError?: (error: TransactionError) => void;
  onSettled?: (
    data: TransactionResult | undefined,
    error: TransactionError | null,
  ) => void;
}

export interface TransferFormData {
  recipient: string;
  amount: string;
}

export interface UseTransferReturn {
  // Transfer function
  transfer: (data: TransferFormData) => Promise<TransactionResult>;

  // Mutation state
  isPending: boolean;
  isError: boolean;
  error: TransactionError | null;
  data: TransactionResult | undefined;

  // Helper functions
  reset: () => void;
  canTransfer: boolean;
  getUserFriendlyError: () => string | null;

  // Wallet information
  senderAddress: Address | null;
  hasWallet: boolean;
  isAuthenticated: boolean;
}

export function useTransfer(
  options: UseTransferOptions = {},
): UseTransferReturn {
  const { onSuccess, onError, onSettled } = options;
  const queryClient = useQueryClient();

  const {
    address: senderAddress,
    hasWallet,
    isAuthenticated,
    refreshBalance,
  } = useWallet();

  const mutation = useMutation({
    ...transferMutationOptions,
    onSuccess: (data) => {
      if (senderAddress) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.wallet.balance(senderAddress),
        });
      }

      for (const key of getTransactionInvalidationKeys(data.hash)) {
        queryClient.invalidateQueries({ queryKey: key });
      }

      refreshBalance();

      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
    onSettled: (data, error) => {
      onSettled?.(data, error);
    },
  });

  const transfer = useCallback(
    async (formData: TransferFormData): Promise<TransactionResult> => {
      if (!isAuthenticated) {
        throw new TransactionError(
          "Please connect your wallet to send transactions",
          "NOT_AUTHENTICATED",
        );
      }

      if (!hasWallet || !senderAddress) {
        throw new TransactionError("No wallet address available", "NO_WALLET");
      }

      const transferParams: TransferParams = {
        from: senderAddress,
        to: formData.recipient as Address,
        amount: formData.amount,
      };

      return mutation.mutateAsync(transferParams);
    },
    [isAuthenticated, hasWallet, senderAddress, mutation],
  );

  const getUserFriendlyError = useCallback((): string | null => {
    if (!mutation.error) return null;
    return getTransactionErrorMessage(mutation.error);
  }, [mutation.error]);

  const canTransfer =
    isAuthenticated && hasWallet && !!senderAddress && !mutation.isPending;

  return {
    transfer,

    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,

    reset: mutation.reset,
    canTransfer,
    getUserFriendlyError,

    senderAddress,
    hasWallet,
    isAuthenticated,
  };
}
