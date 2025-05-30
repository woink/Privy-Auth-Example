import { publicSepoliaClient } from "@/lib/privy";
import { type Address, type Hash, parseEther } from "viem";

/**
 * Custom error class for transaction-related errors
 */
export class TransactionError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = "TransactionError";
  }
}

/**
 * Interface for transfer transaction parameters
 */
export interface TransferParams {
  from: Address;
  to: Address;
  amount: string; // Amount in ETH as string
  sendTransaction: (params: {
    to: string;
    value: string;
  }) => Promise<{ hash: string }>;
}

/**
 * Interface for transaction result
 */
export interface TransactionResult {
  hash: Hash;
  from: Address;
  to: Address;
  amount: string;
  timestamp: number;
}

/**
 * Validate transfer parameters
 */
const validateTransferParams = (params: TransferParams): void => {
  const { from, to, amount, sendTransaction } = params;

  // Validate from address
  if (!from || !from.startsWith("0x") || from.length !== 42) {
    throw new TransactionError(
      "Invalid sender address",
      "INVALID_FROM_ADDRESS",
      { from },
    );
  }

  // Validate to address
  if (!to || !to.startsWith("0x") || to.length !== 42) {
    throw new TransactionError(
      "Invalid recipient address",
      "INVALID_TO_ADDRESS",
      { to },
    );
  }

  // Validate amount
  const amountNum = Number(amount);
  if (Number.isNaN(amountNum) || amountNum <= 0) {
    throw new TransactionError(
      "Invalid amount: must be a positive number",
      "INVALID_AMOUNT",
      { amount },
    );
  }

  // Check if sender and recipient are different
  if (from.toLowerCase() === to.toLowerCase()) {
    throw new TransactionError(
      "Cannot send to the same address",
      "SAME_ADDRESS",
      { from, to },
    );
  }

  // Validate sendTransaction function
  if (!sendTransaction || typeof sendTransaction !== "function") {
    throw new TransactionError(
      "Send transaction function is required",
      "MISSING_SEND_FUNCTION",
    );
  }
};

/**
 * Check if sender has sufficient balance
 */
const checkSufficientBalance = async (
  address: Address,
  amount: string,
): Promise<void> => {
  try {
    const balance = await publicSepoliaClient.getBalance({ address });
    const amountWei = parseEther(amount);

    if (balance < amountWei) {
      throw new TransactionError(
        "Insufficient balance for transaction",
        "INSUFFICIENT_BALANCE",
        { balance: balance.toString(), required: amountWei.toString() },
      );
    }
  } catch (error) {
    if (error instanceof TransactionError) {
      throw error;
    }
    throw new TransactionError(
      "Failed to check balance",
      "BALANCE_CHECK_ERROR",
      error,
    );
  }
};

/**
 * Estimate gas for the transaction
 */
const estimateTransactionGas = async (params: TransferParams) => {
  try {
    const { from, to, amount } = params;
    const value = parseEther(amount);

    const gasEstimate = await publicSepoliaClient.estimateGas({
      account: from,
      to,
      value,
    });

    const gasPrice = await publicSepoliaClient.getGasPrice();
    const estimatedCost = gasEstimate * gasPrice;

    return {
      gasEstimate,
      gasPrice,
      estimatedCost,
    };
  } catch (error) {
    throw new TransactionError(
      "Failed to estimate gas",
      "GAS_ESTIMATION_ERROR",
      error,
    );
  }
};

/**
 * Send a transfer transaction
 */
export const sendTransfer = async (
  params: TransferParams,
): Promise<TransactionResult> => {
  // Validate parameters
  validateTransferParams(params);

  const { from, to, amount, sendTransaction } = params;

  try {
    // Check sufficient balance
    await checkSufficientBalance(from, amount);

    // Estimate gas (for validation, actual gas will be estimated by wallet)
    await estimateTransactionGas(params);

    // Convert amount to wei for blockchain transaction
    const valueInWei = parseEther(amount);

    // Send the real transaction using Privy
    const result = await sendTransaction({
      to,
      value: valueInWei.toString(),
    });

    return {
      hash: result.hash as Hash,
      from,
      to,
      amount,
      timestamp: Date.now(),
    };
  } catch (error) {
    // Handle different types of errors
    if (error instanceof TransactionError) {
      throw error;
    }

    if (error instanceof Error) {
      // Network or RPC errors
      if (
        error.message.includes("network") ||
        error.message.includes("timeout")
      ) {
        throw new TransactionError(
          "Network error during transaction",
          "NETWORK_ERROR",
          error,
        );
      }

      // Gas-related errors
      if (error.message.includes("gas") || error.message.includes("limit")) {
        throw new TransactionError(
          "Transaction failed due to gas issues",
          "GAS_ERROR",
          error,
        );
      }

      // User rejection
      if (
        error.message.includes("rejected") ||
        error.message.includes("denied")
      ) {
        throw new TransactionError(
          "Transaction was rejected by user",
          "USER_REJECTED",
          error,
        );
      }

      // Generic error
      throw new TransactionError(
        `Transaction failed: ${error.message}`,
        "TRANSACTION_ERROR",
        error,
      );
    }

    // Handle non-Error objects
    throw new TransactionError(
      "Unknown error occurred during transaction",
      "UNKNOWN_ERROR",
      error,
    );
  }
};

/**
 * Get transaction by hash
 */
export const getTransaction = async (hash: Hash) => {
  try {
    const transaction = await publicSepoliaClient.getTransaction({ hash });
    return transaction;
  } catch (error) {
    throw new TransactionError(
      "Failed to fetch transaction",
      "FETCH_TRANSACTION_ERROR",
      error,
    );
  }
};

/**
 * Wait for transaction confirmation
 */
export const waitForTransaction = async (hash: Hash) => {
  try {
    const receipt = await publicSepoliaClient.waitForTransactionReceipt({
      hash,
      timeout: 60000, // 60 seconds timeout
    });
    return receipt;
  } catch (error) {
    throw new TransactionError(
      "Transaction confirmation timeout or failed",
      "CONFIRMATION_ERROR",
      error,
    );
  }
};

/**
 * Helper function to check if an error is a transaction error
 */
export const isTransactionError = (
  error: unknown,
): error is TransactionError => {
  return error instanceof TransactionError;
};

/**
 * Helper function to get user-friendly error message
 */
export const getTransactionErrorMessage = (error: unknown): string => {
  if (isTransactionError(error)) {
    switch (error.code) {
      case "INVALID_FROM_ADDRESS":
        return "Invalid sender address";
      case "INVALID_TO_ADDRESS":
        return "Please enter a valid recipient address";
      case "INVALID_AMOUNT":
        return "Please enter a valid amount greater than 0";
      case "SAME_ADDRESS":
        return "Cannot send funds to yourself";
      case "INSUFFICIENT_BALANCE":
        return "Insufficient balance for this transaction";
      case "GAS_ESTIMATION_ERROR":
        return "Unable to estimate transaction cost";
      case "GAS_ERROR":
        return "Transaction failed due to gas issues";
      case "USER_REJECTED":
        return "Transaction was cancelled";
      case "NETWORK_ERROR":
        return "Network error. Please check your connection and try again";
      case "CONFIRMATION_ERROR":
        return "Transaction confirmation failed or timed out";
      case "MISSING_SEND_FUNCTION":
        return "Wallet connection error. Please reconnect your wallet";
      case "NO_WALLET_CONNECTION":
        return "No connected wallet found. Please connect your wallet";
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
};
