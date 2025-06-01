"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/useToast";
import { useTransfer } from "@/hooks/useTransfer";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import TransactionErrorBoundary from "./TransactionErrorBoundary";
import { TransactionLink } from "./TransactionLink";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function Transfer() {
  const [sendAmount, setSendAmount] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<{
    amount?: string;
    recipient?: string;
  }>({});

  const { toast } = useToast();

  const {
    transfer,
    isPending,
    isError,
    data,
    canTransfer,
    getUserFriendlyError,
    reset,
    senderAddress,
    isAuthenticated,
  } = useTransfer({
    onSuccess: (_data) => {
      // Reset form on success
      setSendAmount("");
      setRecipient("");
      setValidationErrors({});
    },
    onError: () => {
      toast({
        title: "Transfer Error",
        description: getUserFriendlyError() || "Transaction failed",
        variant: "destructive",
      });
    },
  });

  // Form validation
  const validateForm = useCallback(() => {
    const errors: typeof validationErrors = {};

    // Validate amount
    if (!sendAmount.trim()) {
      errors.amount = "Amount is required";
    } else {
      const amount = Number(sendAmount);
      if (Number.isNaN(amount) || amount <= 0) {
        errors.amount = "Amount must be a positive number";
      } else if (amount > 1000000) {
        errors.amount = "Amount seems unusually large";
      }
    }

    // Validate recipient
    if (!recipient.trim()) {
      errors.recipient = "Recipient address is required";
    } else if (!recipient.startsWith("0x") || recipient.length !== 42) {
      errors.recipient =
        "Invalid address format (should start with 0x and be 42 characters)";
    } else if (
      senderAddress &&
      recipient.toLowerCase() === senderAddress.toLowerCase()
    ) {
      errors.recipient = "Cannot send to your own address";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [sendAmount, recipient, senderAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await transfer({
        recipient,
        amount: sendAmount,
      });
    } catch (error) {
      // Error is handled by the onError callback
      console.error("Transfer failed:", error);
    }
  };

  const handleReset = () => {
    reset();
    setValidationErrors({});
  };

  // Show authentication message if not authenticated
  if (!isAuthenticated) {
    return (
      <Card className="w-96 m-5">
        <CardHeader>
          <CardTitle className="font-mono">Send Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Please connect your wallet to send transactions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TransactionErrorBoundary onReset={handleReset}>
      <Card className="w-96 m-5">
        <CardHeader>
          <CardTitle className="font-mono">Send Transaction</CardTitle>
          {senderAddress && (
            <p className="text-xs text-muted-foreground font-mono">
              From: {senderAddress.slice(0, 6)}...{senderAddress.slice(-4)}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="amount">Send Amount (ETH)</Label>
              <Input
                id="amount"
                placeholder="0.1"
                value={sendAmount}
                onChange={(e) => {
                  setSendAmount(e.target.value);
                  if (validationErrors.amount) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      amount: undefined,
                    }));
                  }
                }}
                type="number"
                min="0"
                step="0.001"
                disabled={isPending}
                className={validationErrors.amount ? "border-destructive" : ""}
              />
              {validationErrors.amount && (
                <p className="text-xs text-destructive">
                  {validationErrors.amount}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                placeholder="0x742d35Cc6634C0532925a3b8D91C1C9a1C3965E5"
                value={recipient}
                onChange={(e) => {
                  setRecipient(e.target.value);
                  if (validationErrors.recipient) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      recipient: undefined,
                    }));
                  }
                }}
                disabled={isPending}
                className={
                  validationErrors.recipient ? "border-destructive" : ""
                }
              />
              {validationErrors.recipient && (
                <p className="text-xs text-destructive">
                  {validationErrors.recipient}
                </p>
              )}
            </div>

            {/* Show transaction error */}
            {isError && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive">
                    {getUserFriendlyError()}
                  </p>
                </div>
              </div>
            )}

            {/* Show success message */}
            {data && (
              <div className="p-3 rounded-md bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <div className="text-sm">
                    <p className="text-green-800 dark:text-green-200 mb-1">
                      Transaction sent successfully!
                    </p>
                    <div className="text-xs text-green-600 dark:text-green-400">
                      <span>View on Etherscan: </span>
                      <TransactionLink
                        hash={data.hash}
                        className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={!canTransfer || isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Transfer"
                )}
              </Button>

              {(isError || data) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isPending}
                >
                  Reset
                </Button>
              )}
            </div>

            {!canTransfer && isAuthenticated && (
              <p className="text-xs text-muted-foreground text-center">
                {!senderAddress && "No wallet address available"}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </TransactionErrorBoundary>
  );
}
