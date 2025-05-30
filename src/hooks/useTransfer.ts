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
import { useSendTransaction, useWallets } from "@privy-io/react-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { type Address, isAddress } from "viem";

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

  const { sendTransaction } = useSendTransaction();
  const { wallets } = useWallets();

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
      const recipientWallet = formData.recipient;
      const transactionAmount = formData.amount;

      if (!isAuthenticated) {
        throw new TransactionError(
          "Please connect your wallet to send transactions",
          "NOT_AUTHENTICATED",
        );
      }

      if (!hasWallet || !senderAddress) {
        throw new TransactionError("No wallet address available", "NO_WALLET");
      }

      if (!isAddress(recipientWallet)) {
        throw new TransactionError(
          "No recipent wallet address available",
          "NO_RECIPENT",
        );
      }

      // Create appropriate sendTransaction function based on wallet type
      const sendTransactionFn = async (params: {
        to: string;
        value: string;
      }) => {
        // First try Privy's embedded wallet sendTransaction
        try {
          return await sendTransaction(params);
        } catch (error: unknown) {
          // If embedded wallet fails, try external wallet
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          if (
            errorMessage.includes("embedded wallet") ||
            errorMessage.includes("User must have an embedded wallet")
          ) {
            const wallet = wallets.find(
              (w) => w.address.toLowerCase() === senderAddress.toLowerCase(),
            );

            if (!wallet) {
              throw new TransactionError(
                "No connected wallet found",
                "NO_WALLET_CONNECTION",
              );
            }

            // For external wallets, use the wallet's provider directly
            const provider = await wallet.getEthereumProvider();

            const hash = await provider.request({
              method: "eth_sendTransaction",
              params: [
                {
                  from: senderAddress,
                  to: params.to,
                  value: `0x${BigInt(params.value).toString(16)}`,
                },
              ],
            });

            return { hash };
          }

          throw error;
        }
      };

      const transferParams: TransferParams = {
        from: senderAddress,
        to: recipientWallet,
        amount: transactionAmount,
        sendTransaction: sendTransactionFn,
      };

      return mutation.mutateAsync(transferParams);
    },
    [
      isAuthenticated,
      hasWallet,
      senderAddress,
      mutation,
      sendTransaction,
      wallets,
    ],
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
