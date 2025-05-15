import { useState, useEffect } from 'react';
import { getBalance } from '@/lib/api';

interface WalletProps {
  address: string;
  setAddress: (address: string) => void;
  balance: number;
  setBalance: (balance: number) => void;
}

export default function Wallet({ address, setAddress, balance, setBalance }: WalletProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddressChange(evt: React.ChangeEvent<HTMLInputElement>) {
    const newAddress = evt.target.value;
    setAddress(newAddress);

    if (newAddress) {
      setIsLoading(true);
      setError(null);
      
      try {
        const newBalance = await getBalance(newAddress);
        setBalance(newBalance);
      } catch (err) {
        console.error('Error fetching balance:', err);
        setError('Failed to fetch balance');
        setBalance(0);
      } finally {
        setIsLoading(false);
      }
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Address
        <input
          placeholder="Type an address, for example: 0x1"
          value={address}
          onChange={handleAddressChange}
        />
      </label>

      {isLoading ? (
        <div className="balance">Loading balance...</div>
      ) : error ? (
        <div className="balance error">{error}</div>
      ) : (
        <div className="balance">Balance: {balance}</div>
      )}
    </div>
  );
}