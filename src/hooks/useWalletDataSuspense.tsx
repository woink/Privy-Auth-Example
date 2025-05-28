import { walletBalanceQueryOptions } from "@/lib/queries/wallet-queries";
import type { User } from "@privy-io/react-auth";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

interface UseWalletDataSuspenseResult {
  address: string | null;
  balance: string;
  hasWallet: boolean;
}

/**
 * Suspense-based hook for wallet data fetching
 *
 * This hook uses React Query's useSuspenseQuery when an address is available,
 * and returns default values immediately when no address is present.
 */
export function useWalletDataSuspense(
  user: User | null,
): UseWalletDataSuspenseResult {
  const address = user?.wallet?.address || null;

  // Always call useSuspenseQuery to maintain hook order
  // When no address, use a query that resolves immediately
  // When address exists, use the actual balance query
  const queryOptions = address
    ? walletBalanceQueryOptions(address)
    : {
        queryKey: ["wallet", "balance", "no-address"] as const,
        queryFn: async () => "0",
        staleTime: Number.POSITIVE_INFINITY,
      };

  const { data: balance } = useSuspenseQuery(queryOptions);

  return {
    address,
    balance,
    hasWallet: !!address,
  };
}
