"use client";

import { ExternalLink } from "lucide-react";
import type { Hash } from "viem";
import { getTransactionUrl, type EtherscanNetwork } from "@/utils/etherscan";

interface TransactionLinkProps {
  hash: Hash;
  network?: EtherscanNetwork;
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function TransactionLink({
  hash,
  network = "sepolia",
  className = "",
  showIcon = true,
  children,
}: TransactionLinkProps) {
  const url = getTransactionUrl(hash, network);
  const displayText = children || `${hash.slice(0, 10)}...${hash.slice(-8)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline hover:no-underline transition-colors ${className}`}
    >
      <span className="font-mono text-sm">{displayText}</span>
      {showIcon && <ExternalLink className="h-3 w-3 flex-shrink-0" />}
    </a>
  );
}

export function FullTransactionLink({
  hash,
  network = "sepolia",
  className = "",
}: Omit<TransactionLinkProps, "children" | "showIcon">) {
  return (
    <TransactionLink hash={hash} network={network} className={className}>
      {hash}
    </TransactionLink>
  );
}
