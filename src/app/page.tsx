"use client";

import AuthStatus from "@/components/AuthStatus";
// import Transfer from "@/components/Transfer";
import UserWallet from "@/components/UserWallet";
import WalletErrorBoundary from "@/components/WalletErrorBoundary";
import WalletLoading from "@/components/WalletLoading";
import { usePrivy } from "@privy-io/react-auth";
import { Suspense } from "react";

export default function Home() {
  const { user } = usePrivy();

  return (
    <>
      <nav className="navbar">
        <AuthStatus />
      </nav>
      <main className="app">
        {user && (
          <WalletErrorBoundary>
            <Suspense fallback={<WalletLoading />}>
              <UserWallet user={user} />
            </Suspense>
          </WalletErrorBoundary>
        )}
        {/* <Transfer setBalance={setBalance} address={user.address} /> */}
      </main>
    </>
  );
}
