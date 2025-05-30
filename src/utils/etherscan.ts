import type { Hash } from "viem";

/**
 * Supported Etherscan networks
 */
export type EtherscanNetwork = "mainnet" | "sepolia" | "goerli";

/**
 * Base URLs for different Etherscan networks
 */
const ETHERSCAN_BASE_URLS: Record<EtherscanNetwork, string> = {
  mainnet: "https://etherscan.io",
  sepolia: "https://sepolia.etherscan.io",
  goerli: "https://goerli.etherscan.io",
};

/**
 * Generate an Etherscan URL for a transaction hash
 * @param hash - The transaction hash
 * @param network - The network (defaults to sepolia)
 * @returns The complete Etherscan URL
 */
export function getTransactionUrl(
  hash: Hash,
  network: EtherscanNetwork = "sepolia",
): string {
  const baseUrl = ETHERSCAN_BASE_URLS[network];
  return `${baseUrl}/tx/${hash}`;
}

/**
 * Generate an Etherscan URL for an address
 * @param address - The wallet address
 * @param network - The network (defaults to sepolia)
 * @returns The complete Etherscan URL
 */
export function getAddressUrl(
  address: string,
  network: EtherscanNetwork = "sepolia",
): string {
  const baseUrl = ETHERSCAN_BASE_URLS[network];
  return `${baseUrl}/address/${address}`;
}

/**
 * Generate an Etherscan URL for a block
 * @param blockNumber - The block number
 * @param network - The network (defaults to sepolia)
 * @returns The complete Etherscan URL
 */
export function getBlockUrl(
  blockNumber: number | string,
  network: EtherscanNetwork = "sepolia",
): string {
  const baseUrl = ETHERSCAN_BASE_URLS[network];
  return `${baseUrl}/block/${blockNumber}`;
}

/**
 * Extract transaction hash from an Etherscan URL
 * @param url - The Etherscan URL
 * @returns The transaction hash or null if not found
 */
export function extractHashFromUrl(url: string): Hash | null {
  const match = url.match(/\/tx\/(0x[a-fA-F0-9]{64})/);
  return match ? (match[1] as Hash) : null;
}

/**
 * Check if a string is a valid Etherscan URL
 * @param url - The URL to check
 * @returns True if it's a valid Etherscan URL
 */
export function isEtherscanUrl(url: string): boolean {
  const etherscanDomains = Object.values(ETHERSCAN_BASE_URLS).map(
    (baseUrl) => new URL(baseUrl).hostname,
  );

  try {
    const urlObj = new URL(url);
    return etherscanDomains.includes(urlObj.hostname);
  } catch {
    return false;
  }
}
