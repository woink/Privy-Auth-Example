import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { getAddress } from "viem";
import WalletAddress from "./WalletAddress";

export default function AuthStatus() {
  const { ready, authenticated, login, logout, user } = usePrivy();

  if (!ready) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return (
      <Button className="text-black" onClick={login}>
        Login
      </Button>
    );
  }

  const walletAddress =
    user?.wallet?.address && getAddress(user.wallet.address);

  return (
    <div className="flex items-center items-start gap-4">
      <div className="flex items-center gap-2">
        <span className="font-medium">Wallet:</span>
        {walletAddress ? (
          <WalletAddress address={walletAddress} />
        ) : (
          <span className="text-gray-500">No wallet connected</span>
        )}
      </div>
      <Button className="text-black" variant="destructive" onClick={logout}>
        Logout
      </Button>
    </div>
  );
}
