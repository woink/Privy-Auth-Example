'use client';

import AuthStatus from '@/components/AuthStatus';
import Transfer from '@/components/Transfer';
import Wallet from '@/components/Wallet';
import { publicSepoliaClient } from '@/lib/privy';
import { truncateBalance } from '@/utils/balance';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { formatEther } from 'viem';

export default function Home() {
  const [address, setAddress] = useState<privyUser['wallet']['address']>(null);
  const [balance, setBalance] = useState<bigint | null>(null);

  const { user } = usePrivy();

  useEffect(() => {
    async function getUserBalance() {
      const balance = await publicSepoliaClient.getBalance({
        address: user.wallet.address,
        chainId: 11155111,
      });

      const balanceAsEther = String(formatEther(balance));
      const truncatedBalance = truncateBalance(balanceAsEther);
      setBalance(truncatedBalance);
    }

    if (user) {
      setAddress(user.wallet.address);
      getUserBalance();
    }
  }, [user]);

  return (
    <>
      <nav className="navbar">
        <AuthStatus />
      </nav>
      <main className="app">
        {user && <Wallet balance={balance} address={address} />}
        {/* <Transfer setBalance={setBalance} address={user.address} /> */}
      </main>
    </>
  );
}
