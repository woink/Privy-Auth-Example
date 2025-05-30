import { publicSepoliaClient } from "@/lib/privy";
import { truncateBalance } from "@/utils/balance";
import type { User } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { type Address, formatEther } from "viem";

export function useWalletData(user: User | null) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const walletAddress = user?.wallet?.address;

    async function fetchBalance() {
      if (!walletAddress) return;

      setIsLoading(true);
      setError(null);
      try {
        const balanceResponse = await publicSepoliaClient.getBalance({
          address: walletAddress as Address,
        });
        const balanceAsEther = formatEther(balanceResponse);
        const truncatedBalance = truncateBalance(balanceAsEther);

        setBalance(truncatedBalance);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setIsLoading(false);
      }
    }

    if (walletAddress) {
      setAddress(walletAddress || null);
      fetchBalance();
    } else {
      setBalance(null);
      setAddress(null);
    }
  }, [user?.wallet?.address]);

  return { address, balance, isLoading, error, hasWallet: !!address };
}
