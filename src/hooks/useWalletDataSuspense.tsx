import { walletBalanceQueryOptions } from "@/lib/queries/wallet-queries";
import type { User } from "@privy-io/react-auth";
import { useSuspenseQuery } from "@tanstack/react-query";
import { type Address, isAddress } from "viem";

/**
 * Simple suspense hook for wallet balance
 * Only call this when you're certain you have a valid address
 */
export function useWalletBalance(address: Address) {
  const { data: balance } = useSuspenseQuery(
    walletBalanceQueryOptions(address),
  );

  return balance;
}

/**
 * Utility function to extract wallet data from user
 */
export function getWalletInfo(user: User | null) {
  const rawAddress = user?.wallet?.address;
  const address =
    rawAddress && isAddress(rawAddress) ? (rawAddress as Address) : null;
  const hasWallet = !!address;

  return { address, hasWallet };
}
