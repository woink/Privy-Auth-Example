"use client";

import { useWallet } from "@/contexts/WalletContext";
import { Suspense } from "react";
import UserWallet from "./UserWallet";
import WalletErrorBoundary from "./WalletErrorBoundary";
import WalletLoading from "./WalletLoading";

interface AuthWrapperProps {
  children?: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { hasWallet } = useWallet();

  if (hasWallet) {
    return (
      <WalletErrorBoundary>
        <Suspense fallback={<WalletLoading />}>
          <UserWallet />
          {children}
        </Suspense>
      </WalletErrorBoundary>
    );
  }
}
