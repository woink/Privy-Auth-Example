import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWalletInfo, useWalletBalance } from "@/hooks/useWalletDataSuspense";
import type { User } from "@privy-io/react-auth";

interface UserWalletProps {
  user: User | null;
}

export default function UserWallet({ user }: UserWalletProps) {
  const { address, hasWallet } = getWalletInfo(user);

  if (!hasWallet || !address) {
    return (
      <Card className="w-fit m-5">
        <CardHeader>
          <CardTitle>Your Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="wallet-info">
            <p>No wallet connected</p>
            <p>Please connect your wallet to view balance information.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const balance = useWalletBalance(address);

  return (
    <Card className="w-fit m-5">
      <CardHeader>
        <CardTitle>Your Wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-lg font-semibold">
          <span className="text-muted-foreground">Wallet Address: </span>
          <span className="font-mono text-sm" title={address || ""}>
            {address}
          </span>
        </div>
        <div className="text-lg font-semibold">
          <span className="text-muted-foreground">Balance: </span>
          <span>{balance} ETH</span>
        </div>
      </CardContent>
    </Card>
  );
}
