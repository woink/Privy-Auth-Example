"use client";

import { walletBalanceQueryOptions } from "@/lib/queries/wallet-queries";
import { type User, usePrivy } from "@privy-io/react-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { type Address, isAddress } from "viem";

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  wallet: {
    address: Address | null;
    hasWallet: boolean;
    balance?: string;
    isLoadingBalance: boolean;
    balanceError?: Error | null;
  };
  login: () => void;
  logout: () => void;
  ready: boolean;
}

export function useAuthWithQuery(): AuthState {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const queryClient = useQueryClient();

  // Extract wallet information
  const walletInfo = useMemo(() => {
    const rawAddress = user?.wallet?.address;
    const address =
      rawAddress && isAddress(rawAddress) ? (rawAddress as Address) : null;
    const hasWallet = !!address;

    return { address, hasWallet };
  }, [user?.wallet?.address]);

  // Query wallet balance when we have a valid address
  const {
    data: balance,
    isLoading: isLoadingBalance,
    error: balanceError,
  } = useQuery({
    ...walletBalanceQueryOptions(walletInfo.address as Address),
    enabled: !!walletInfo.address && authenticated && ready,
  });

  // Invalidate wallet queries on authentication changes
  useEffect(() => {
    if (!authenticated) {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    }
  }, [authenticated, queryClient]);

  // Prefetch wallet balance when user connects
  useEffect(() => {
    if (walletInfo.address && authenticated && ready) {
      queryClient.prefetchQuery(walletBalanceQueryOptions(walletInfo.address));
    }
  }, [walletInfo.address, authenticated, ready, queryClient]);

  return {
    isLoading: !ready,
    isAuthenticated: authenticated && ready,
    user,
    wallet: {
      address: walletInfo.address,
      hasWallet: walletInfo.hasWallet,
      balance,
      isLoadingBalance,
      balanceError: balanceError as Error | null,
    },
    login,
    logout,
    ready,
  };
}

export default useAuthWithQuery;
