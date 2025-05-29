"use client";

import { Suspense } from "react";
import UserWallet from "./UserWallet";
import WalletErrorBoundary from "./WalletErrorBoundary";
import WalletLoading from "./WalletLoading";
import { WalletProvider, useWallet } from "@/contexts/WalletContext";

interface AuthWrapperProps {
  children?: React.ReactNode;
}

function AuthWrapperContent({ children }: AuthWrapperProps) {
  const { isReady } = useWallet();

  if (!isReady) {
    return <WalletLoading />;
  }

  return (
    <WalletErrorBoundary>
      <Suspense fallback={<WalletLoading />}>
        <UserWallet />
        {children}
      </Suspense>
    </WalletErrorBoundary>
  );
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  return (
    <WalletProvider>
      <AuthWrapperContent>{children}</AuthWrapperContent>
    </WalletProvider>
  );
}