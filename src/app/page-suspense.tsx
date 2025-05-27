"use client";

import AuthStatus from "@/components/AuthStatus";
import UserWalletSuspense from "@/components/UserWalletSuspense";
import WalletErrorBoundary from "@/components/WalletErrorBoundary";
import WalletLoading from "@/components/WalletLoading";
import { usePrivy } from "@privy-io/react-auth";
import { Suspense } from "react";

export default function HomePage() {
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
              <UserWalletSuspense user={user} />
            </Suspense>
          </WalletErrorBoundary>
        )}
      </main>
    </>
  );
}
