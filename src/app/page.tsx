"use client";

import { useState } from "react";
import Wallet from "@/components/Wallet";
import Transfer from "@/components/Transfer";
import AuthStatus from "@/components/AuthStatus";

export default function Home() {
  const [balance, setBalance] = useState<number>(0);
  const [address, setAddress] = useState<string>("");

  return (
    <>
      <nav className="navbar">
        <AuthStatus />
      </nav>
      <main className="app">
        <Wallet
          balance={balance}
          setBalance={setBalance}
          address={address}
          setAddress={setAddress}
        />
        <Transfer setBalance={setBalance} address={address} />
      </main>
    </>
  );
}
