"use client";

import AuthStatus from "@/components/AuthStatus";
// import Transfer from "@/components/Transfer";
import UserWallet from "@/components/UserWallet";
import { useWalletData } from "@/hooks/useWalletData";
import { usePrivy } from "@privy-io/react-auth";

export default function Home() {
  const { user } = usePrivy();
  const { address, balance, isLoading, error } = useWalletData(user);

  return (
    <>
      <nav className="navbar">
        <AuthStatus />
      </nav>
      <main className="app">
        {user && (
          <UserWallet
            balance={balance}
            address={address}
            isLoading={isLoading}
            error={error}
          />
        )}
        {/* <Transfer setBalance={setBalance} address={user.address} /> */}
      </main>
    </>
  );
}
