/**
 * Query key factory for consistent cache management
 *
 * This factory follows the pattern:
 * ['entity', 'detail', ...params]
 *
 * Examples:
 * - ['wallet', 'balance', { address: '0x...' }]
 * - ['wallet', 'all', { address: '0x...' }]
 */

export const queryKeys = {
  // All wallet-related queries
  wallet: {
    all: ["wallet"] as const,
    lists: () => [...queryKeys.wallet.all, "list"] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.wallet.lists(), { ...filters }] as const,
    details: () => [...queryKeys.wallet.all, "detail"] as const,
    detail: (address: string) =>
      [...queryKeys.wallet.details(), address] as const,
    balance: (address: string) =>
      [...queryKeys.wallet.all, "balance", address] as const,
  },
  // All transaction-related queries
  transaction: {
    all: ["transaction"] as const,
    lists: () => [...queryKeys.transaction.all, "list"] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.transaction.lists(), { ...filters }] as const,
    details: () => [...queryKeys.transaction.all, "detail"] as const,
    detail: (hash: string) =>
      [...queryKeys.transaction.details(), hash] as const,
    confirmation: (hash: string) =>
      [...queryKeys.transaction.all, "confirmation", hash] as const,
    history: (address: string) =>
      [...queryKeys.transaction.all, "history", address] as const,
  },
} as const;

/**
 * Type helpers for query keys
 */
export type WalletQueryKey = typeof queryKeys.wallet.all;
export type WalletBalanceQueryKey = ReturnType<typeof queryKeys.wallet.balance>;
export type WalletDetailQueryKey = ReturnType<typeof queryKeys.wallet.detail>;

export type TransactionQueryKey = typeof queryKeys.transaction.all;
export type TransactionDetailQueryKey = ReturnType<
  typeof queryKeys.transaction.detail
>;
export type TransactionConfirmationQueryKey = ReturnType<
  typeof queryKeys.transaction.confirmation
>;

/**
 * Helper to invalidate all wallet queries
 */
export const getWalletInvalidationKey = () => queryKeys.wallet.all;

/**
 * Helper to invalidate specific wallet address queries
 */
export const getWalletAddressInvalidationKey = (address: string) =>
  queryKeys.wallet.detail(address);

/**
 * Helper to invalidate all transaction queries
 */
export const getTransactionInvalidationKey = () => queryKeys.transaction.all;

/**
 * Helper to invalidate specific transaction hash queries
 */
export const getTransactionHashInvalidationKey = (hash: string) =>
  queryKeys.transaction.detail(hash);
