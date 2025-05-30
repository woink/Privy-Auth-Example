"use client";

import { walletBalanceQueryOptions } from "@/lib/queries/wallet-queries";
import { type User, usePrivy } from "@privy-io/react-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { type Address, isAddress } from "viem";

interface WalletState {
  // Authentication state
  isReady: boolean;
  isAuthenticated: boolean;
  user: User | null;

  // Wallet state
  address: Address | null;
  hasWallet: boolean;
  balance: string | undefined;
  isLoadingBalance: boolean;
  balanceError: Error | null;

  // Actions
  login: () => void;
  logout: () => void;
  refreshBalance: () => void;
}

const WalletContext = createContext<WalletState | null>(null);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
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
    refetch: refreshBalance,
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

  const value: WalletState = {
    isReady: ready,
    isAuthenticated: authenticated && ready,
    user,
    address: walletInfo.address,
    hasWallet: walletInfo.hasWallet,
    balance,
    isLoadingBalance,
    balanceError: balanceError as Error | null,
    login,
    logout,
    refreshBalance: () => refreshBalance(),
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet(): WalletState {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
