"use client";

import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";

export default function AuthStatus() {
  const { isAuthenticated, login, logout } = useWallet();

  if (!isAuthenticated) {
    return (
      <Button className="font-mono" onClick={login}>
        Login
      </Button>
    );
  }

  return (
    <Button className="font-mono" variant="destructive" onClick={logout}>
      Logout
    </Button>
  );
}
