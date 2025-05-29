"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/contexts/WalletContext";

export default function UserWallet() {
  const { hasWallet, address, balance, isLoadingBalance } = useWallet();

  if (!hasWallet || !address) {
    return (
      <Card className="w-fit m-5">
        {/* <CardHeader>
          <CardTitle>Your Wallet</CardTitle>
        </CardHeader> */}
        <CardContent>
          <div className="wallet-info">
            <p>No wallet connected</p>
            <p>Please connect your wallet to view balance information.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-fit m-5">
      {/* <CardHeader>
        <CardTitle>Your Wallet</CardTitle>
      </CardHeader> */}
      <CardContent className="space-y-4">
        <div className="text-lg font-semibold">
          <span className="text-muted-foreground">Wallet Address: </span>
          <span className="font-mono text-sm" title={address || ""}>
            {address}
          </span>
        </div>
        <div className="text-lg font-semibold">
          <span className="text-muted-foreground">Balance: </span>
          <span>
            {isLoadingBalance ? "Loading..." : `${balance || "0"} ETH`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
