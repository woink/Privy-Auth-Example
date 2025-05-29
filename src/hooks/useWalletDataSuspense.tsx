import { walletBalanceQueryOptions } from "@/lib/queries/wallet-queries";
import type { User } from "@privy-io/react-auth";
import { useSuspenseQuery } from "@tanstack/react-query";
import { type Address, isAddress } from "viem";

/**
 * Simple suspense hook for wallet balance
 * Returns "0" when no address is provided
 */
export function useWalletBalance(address: Address | null) {
  const queryOptions = address
    ? walletBalanceQueryOptions(address)
    : {
        queryKey: ["wallet", "balance", "null"],
        queryFn: () => Promise.resolve("0"),
        enabled: true,
        staleTime: Infinity, // Never refetch when no address
      };

  const { data: balance } = useSuspenseQuery(queryOptions);

  return balance || "0";
}

/**
 * Utility function to extract wallet data from user
 */
export function getWalletInfo(user: User | null) {
  if (!user || !user.wallet) {
    return { address: null, hasWallet: false };
  }

  const rawAddress = user.wallet.address;
  if (!rawAddress || typeof rawAddress !== 'string') {
    return { address: null, hasWallet: false };
  }

  // Use permissive validation for testing - check if it's a hex string with 0x prefix and 40 hex chars
  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(rawAddress) || isAddress(rawAddress);
  const address = isValidAddress ? (rawAddress as Address) : null;
  const hasWallet = !!address;

  return { address, hasWallet };
}

/**
 * Suspense hook that returns wallet data for a user
 * This is for backwards compatibility with existing tests
 */
export function useWalletDataSuspense(user: User | null) {
  const { address, hasWallet } = getWalletInfo(user);
  
  // Always call the hook to avoid hook order violations
  const balance = useWalletBalance(address);
  
  return {
    address,
    balance,
    hasWallet,
  };
}
