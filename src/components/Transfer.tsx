import { sendTransaction } from '@/lib/api';
import { useState } from 'react';

interface TransferProps {
  address: string;
  setBalance: (balance: number) => void;
}

export default function Transfer({ address, setBalance }: TransferProps) {
  const [sendAmount, setSendAmount] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const setValue =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (evt: React.ChangeEvent<HTMLInputElement>) =>
      setter(evt.target.value);

  const transfer = async (evt: React.FormEvent) => {
    evt.preventDefault();

    if (!address) {
      setError('You need to specify your wallet address first');
      return;
    }

    if (!recipient) {
      setError('Recipient address is required');
      return;
    }

    if (
      !sendAmount ||
      Number.isNaN(Number(sendAmount)) ||
      Number(sendAmount) <= 0
    ) {
      setError('Please enter a valid amount to send');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { balance } = await sendTransaction({
        sender: address,
        amount: Number(sendAmount),
        recipient,
      });

      setBalance(balance);
      setSendAmount('');
      setRecipient('');
    } catch (error: unknown) {
      console.error('Transaction error:', error);
      setError(
        error?.response?.data?.message ||
          'Transaction failed. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
          type="number"
          min="1"
          disabled={isLoading}
        />
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
          disabled={isLoading}
        />
      </label>

      {error && <div className="error">{error}</div>}

      <input
        type="submit"
        className="button"
        value={isLoading ? 'Processing...' : 'Transfer'}
        disabled={isLoading}
      />
    </form>
  );
}
