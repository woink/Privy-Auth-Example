import { getBalance } from "@/lib/api";
import { useState } from "react";

interface WalletProps {
  address: string;
  setAddress: (address: string) => void;
  balance: number;
  setBalance: (balance: number) => void;
}

export default function Wallet({ address, balance }: WalletProps) {
  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <div className="balance">Wallet Address: {address}</div>
      <div className="balance">Balance: {balance}</div>
    </div>
  );
}
