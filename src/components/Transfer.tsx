import { useState } from "react";

interface TransferProps {
  address: string;
  setBalance: (balance: number) => void;
}

export default function Transfer({ address, setBalance }: TransferProps) {
  const [sendAmount, setSendAmount] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const setValue =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (evt: React.ChangeEvent<HTMLInputElement>) =>
      setter(evt.target.value);

  const transfer = async (evt: React.FormEvent) => {
    evt.preventDefault();

    if (!address) {
      setError("You need to specify your wallet address first");
      return;
    }

    if (!recipient) {
      setError("Recipient address is required");
      return;
    }

    if (
      !sendAmount ||
      Number.isNaN(Number(sendAmount)) ||
      Number(sendAmount) <= 0
    ) {
      setError("Please enter a valid amount to send");
      return;
    }

    setIsLoading(true);
    setError(null);

    //   try {
    //     const { balance } = await sendTransaction({
    //       sender: address,
    //       amount: Number(sendAmount),
    //       recipient,
    //     });

    //     setBalance(balance);
    //     setSendAmount("");
    //     setRecipient("");
    //   } catch (error: unknown) {
    //     console.error("Transaction error:", error);
    //     setError(
    //       error?.response?.data?.message ||
    //         "Transaction failed. Please try again.",
    //     );
    //   } finally {
    //     setIsLoading(false);
    //   }
  };

  return (
    <form className="transfer-card" onSubmit={transfer}>
      <h1 className="my-3 text-gray-800 text-2xl">Send Transaction</h1>

      <label className="form-label">
        Send Amount
        <input
          className="form-input"
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
          type="number"
          min="1"
          disabled={isLoading}
        />
      </label>

      <label className="form-label">
        Recipient
        <input
          className="form-input"
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
          disabled={isLoading}
        />
      </label>

      {error && <div className="error-message">{error}</div>}

      <input
        type="submit"
        className="button-primary"
        value={isLoading ? "Processing..." : "Transfer"}
        disabled={isLoading}
      />
    </form>
  );
}
