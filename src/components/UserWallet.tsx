import { getWalletInfo, useWalletBalance } from "@/hooks/useWalletDataSuspense";
import type { User } from "@privy-io/react-auth";

interface UserWalletProps {
  user: User | null;
}

export default function UserWallet({ user }: UserWalletProps) {
  const { address, hasWallet } = getWalletInfo(user);

  if (!hasWallet || !address) {
    return (
      <div className="container wallet">
        <h1>Your Wallet</h1>
        <div className="wallet-content">
          <div className="wallet-info">
            <p>No wallet connected</p>
            <p>Please connect your wallet to view balance information.</p>
          </div>
        </div>
      </div>
    );
  }

  const balance = useWalletBalance(address);

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>
      <div className="wallet-content">
        <div className="balance">
          <span className="label">Wallet Address: </span>
          <span className="value" title={address || ""}>
            {address}
          </span>
        </div>
        <div className="balance">
          <span className="label">Balance: </span>
          <span className="value">{balance} ETH</span>
        </div>
      </div>
    </div>
  );
}
