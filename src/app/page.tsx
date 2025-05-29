"use client";

import AuthStatus from "@/components/AuthStatus";

// import Transfer from "@/components/Transfer";
import UserWallet from "@/components/UserWallet";
import WalletErrorBoundary from "@/components/WalletErrorBoundary";
import WalletLoading from "@/components/WalletLoading";
import { usePrivy } from "@privy-io/react-auth";
import { Suspense, useEffect, useState } from "react";

export default function Home() {
  const { user, ready } = usePrivy();
  const [isClientReady, setIsClientReady] = useState(false);

  useEffect(() => {
    if (ready) {
      setIsClientReady(true);
    }
  }, [ready]);

  if (!isClientReady) {
    return (
      <>
        <nav className="fixed top-0 left-0 w-full bg-white shadow-md p-4">
          <AuthStatus />
        </nav>
        <main className="flex items-center justify-center flex-wrap max-w-7xl mx-auto pt-24 p-4">
          <WalletLoading />
        </main>
      </>
    );
  }

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white shadow-md p-4">
        <AuthStatus />
      </nav>
      <main className="flex items-center justify-center flex-wrap max-w-7xl mx-auto pt-24 p-4">
        <WalletErrorBoundary>
          <Suspense fallback={<WalletLoading />}>
            <UserWallet user={user} />
          </Suspense>
        </WalletErrorBoundary>

        {/* <Transfer setBalance={setBalance} address={user.address} /> */}
      </main>
    </>
  );
}
