"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/contexts/WalletContext";
import { getAddress } from "viem";
import WalletAddress from "./WalletAddress";

export default function UserWallet() {
  const { hasWallet, address, balance, isLoadingBalance } = useWallet();
  const walletAddress = address && getAddress(address);

  if (!hasWallet || !address) {
    return (
      <Card className="w-fit m-5">
        {/* <CardHeader>
          <CardTitle>Your Wallet</CardTitle>
        </CardHeader> */}
        <CardContent>
          <div className="wallet-info">
            <p className="font-mono">No wallet connected</p>
            <p className="font-mono">
              Please connect your wallet to view balance information.
            </p>
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
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold font-mono">Wallet:</span>
            {walletAddress ? (
              <WalletAddress address={walletAddress} />
            ) : (
              <span className="font-mono text-gray-500">
                No wallet connected
              </span>
            )}
          </div>
        </div>
        <div>
          <span className="text-muted-foreground font-semibold font-mono">
            Balance:{" "}
          </span>
          <span className="font-mono">
            {isLoadingBalance ? "Loading..." : `${balance || "0"} ETH`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
