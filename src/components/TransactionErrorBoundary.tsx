"use client";

import React, { type ErrorInfo, type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import {
  getTransactionErrorMessage,
  isTransactionError,
} from "@/lib/blockchain/transactions";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  onReset?: () => void;
}

function ErrorFallback({ error, resetErrorBoundary, onReset }: ErrorFallbackProps) {
  const handleReset = () => {
    resetErrorBoundary();
    onReset?.();
  };

  // Get user-friendly error message
  const errorMessage = isTransactionError(error)
    ? getTransactionErrorMessage(error)
    : error.message || "An unexpected error occurred";

  const isTransactionErr = isTransactionError(error);
  const errorCode = isTransactionErr ? error.code : "UNKNOWN_ERROR";

  return (
    <Card className="w-96 m-5 border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive font-mono">
          <AlertTriangle className="h-5 w-5" />
          Transaction Error
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-2">Error Details:</p>
          <p className="break-words">{errorMessage}</p>
          {process.env.NODE_ENV === "development" && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                Debug Information
              </summary>
              <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                <p>
                  <strong>Error Code:</strong> {errorCode}
                </p>
                <p>
                  <strong>Error Type:</strong> {error.name}
                </p>
                {error.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer">Stack Trace</summary>
                    <pre className="mt-1 text-xs overflow-auto">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </details>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>

        {/* Action suggestions based on error type */}
        {isTransactionErr && (
          <div className="text-xs text-muted-foreground">
            {errorCode === "INSUFFICIENT_BALANCE" && (
              <p>
                💡 Make sure you have enough balance for the transaction and
                gas fees.
              </p>
            )}
            {errorCode === "INVALID_TO_ADDRESS" && (
              <p>💡 Double-check the recipient address format.</p>
            )}
            {errorCode === "NETWORK_ERROR" && (
              <p>💡 Check your internet connection and try again.</p>
            )}
            {errorCode === "USER_REJECTED" && (
              <p>
                💡 Transaction was cancelled. You can try again when ready.
              </p>
            )}
            {errorCode === "GAS_ERROR" && (
              <p>
                💡 Try reducing the transaction amount or wait for lower
                network congestion.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TransactionErrorBoundary({
  children,
  fallback,
  onError,
  onReset,
}: Props) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log error for debugging
    console.error("TransactionErrorBoundary caught an error:", error, errorInfo);

    // Call optional error callback
    onError?.(error, errorInfo);
  };

  return (
    <ErrorBoundary
      FallbackComponent={
        fallback
          ? () => <>{fallback}</>
          : (props) => <ErrorFallback {...props} onReset={onReset} />
      }
      onError={handleError}
      onReset={onReset}
    >
      {children}
    </ErrorBoundary>
  );
}
