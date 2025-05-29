import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <Card className="w-96 m-5">
      <CardHeader>
        <CardTitle>Send Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={transfer} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Send Amount</Label>
            <Input
              id="amount"
              placeholder="1, 2, 3..."
              value={sendAmount}
              onChange={setValue(setSendAmount)}
              type="number"
              min="1"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              placeholder="Type an address, for example: 0x2"
              value={recipient}
              onChange={setValue(setRecipient)}
              disabled={isLoading}
            />
          </div>

          {error && <div className="text-destructive text-sm font-medium text-center">{error}</div>}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Transfer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
