import { Suspense } from "react";

interface WalletProps {
  address: string | null;
  balance: string | null;
  isLoading: boolean;
  error: string | null;
}

export default function UserWallet({ address, balance }: WalletProps) {
  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="balance">Wallet Address: {address}</div>
        <div className="balance">Balance: {balance}</div>
      </Suspense>
    </div>
  );
}
