import { walletBalanceQueryOptions } from "@/lib/queries/wallet-queries";
import type { User } from "@privy-io/react-auth";
import { useSuspenseQuery } from "@tanstack/react-query";

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
  const hasWallet = !!address;

  if (!hasWallet) {
    return {
      address: null,
      balance: "0",
      hasWallet: false,
    };
  }

  const { data: balance } = useSuspenseQuery(
    walletBalanceQueryOptions(address),
  );

  return {
    address,
    balance: balance || "0",
    hasWallet: !!address,
  };
}
