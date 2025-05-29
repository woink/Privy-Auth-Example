"use client";

import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { getAddress } from "viem";
import WalletAddress from "./WalletAddress";

export default function AuthStatus() {
  const { isReady, isAuthenticated, login, logout, address } = useWallet();

  if (!isReady) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Button onClick={login}>Login</Button>;
  }

  const walletAddress = address && getAddress(address);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="font-medium">Wallet:</span>
        {walletAddress ? (
          <WalletAddress address={walletAddress} />
        ) : (
          <span className="text-gray-500">No wallet connected</span>
        )}
      </div>
      <Button variant="destructive" onClick={logout}>
        Logout
      </Button>
    </div>
  );
}
