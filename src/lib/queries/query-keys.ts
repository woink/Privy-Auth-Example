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
} as const;

/**
 * Type helpers for query keys
 */
export type WalletQueryKey = typeof queryKeys.wallet.all;
export type WalletBalanceQueryKey = ReturnType<typeof queryKeys.wallet.balance>;
export type WalletDetailQueryKey = ReturnType<typeof queryKeys.wallet.detail>;

/**
 * Helper to invalidate all wallet queries
 */
export const getWalletInvalidationKey = () => queryKeys.wallet.all;

/**
 * Helper to invalidate specific wallet address queries
 */
export const getWalletAddressInvalidationKey = (address: string) =>
  queryKeys.wallet.detail(address);
