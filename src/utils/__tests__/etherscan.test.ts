import { describe, expect, it } from "vitest";
import {
  getTransactionUrl,
  getAddressUrl,
  getBlockUrl,
  extractHashFromUrl,
  isEtherscanUrl,
  type EtherscanNetwork,
} from "../etherscan";
import { type Hash } from "viem";

describe("etherscan utilities", () => {
  const mockTxHash = "0x0c88ac23d080c2037f0ede407b122f8ee4f1fd3f54f634b46b7f37c0041a3540" as Hash;
  const mockAddress = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";

  describe("getTransactionUrl", () => {
    it("should generate correct Sepolia URL by default", () => {
      const url = getTransactionUrl(mockTxHash);
      expect(url).toBe(`https://sepolia.etherscan.io/tx/${mockTxHash}`);
    });

    it("should generate correct mainnet URL", () => {
      const url = getTransactionUrl(mockTxHash, "mainnet");
      expect(url).toBe(`https://etherscan.io/tx/${mockTxHash}`);
    });

    it("should generate correct Goerli URL", () => {
      const url = getTransactionUrl(mockTxHash, "goerli");
      expect(url).toBe(`https://goerli.etherscan.io/tx/${mockTxHash}`);
    });

    it("should handle all supported networks", () => {
      const networks: EtherscanNetwork[] = ["mainnet", "sepolia", "goerli"];
      const expectedBases = {
        mainnet: "https://etherscan.io",
        sepolia: "https://sepolia.etherscan.io",
        goerli: "https://goerli.etherscan.io",
      };

      networks.forEach((network) => {
        const url = getTransactionUrl(mockTxHash, network);
        expect(url).toBe(`${expectedBases[network]}/tx/${mockTxHash}`);
      });
    });
  });

  describe("getAddressUrl", () => {
    it("should generate correct Sepolia address URL by default", () => {
      const url = getAddressUrl(mockAddress);
      expect(url).toBe(`https://sepolia.etherscan.io/address/${mockAddress}`);
    });

    it("should generate correct mainnet address URL", () => {
      const url = getAddressUrl(mockAddress, "mainnet");
      expect(url).toBe(`https://etherscan.io/address/${mockAddress}`);
    });

    it("should handle different networks", () => {
      const url = getAddressUrl(mockAddress, "goerli");
      expect(url).toBe(`https://goerli.etherscan.io/address/${mockAddress}`);
    });
  });

  describe("getBlockUrl", () => {
    it("should generate correct block URL with number", () => {
      const blockNumber = 12345678;
      const url = getBlockUrl(blockNumber);
      expect(url).toBe(`https://sepolia.etherscan.io/block/${blockNumber}`);
    });

    it("should generate correct block URL with string", () => {
      const blockNumber = "12345678";
      const url = getBlockUrl(blockNumber, "mainnet");
      expect(url).toBe(`https://etherscan.io/block/${blockNumber}`);
    });

    it("should handle different networks", () => {
      const blockNumber = 98765;
      const url = getBlockUrl(blockNumber, "goerli");
      expect(url).toBe(`https://goerli.etherscan.io/block/${blockNumber}`);
    });
  });

  describe("extractHashFromUrl", () => {
    it("should extract hash from valid Etherscan transaction URL", () => {
      const url = `https://sepolia.etherscan.io/tx/${mockTxHash}`;
      const hash = extractHashFromUrl(url);
      expect(hash).toBe(mockTxHash);
    });

    it("should extract hash from mainnet URL", () => {
      const url = `https://etherscan.io/tx/${mockTxHash}`;
      const hash = extractHashFromUrl(url);
      expect(hash).toBe(mockTxHash);
    });

    it("should extract hash from Goerli URL", () => {
      const url = `https://goerli.etherscan.io/tx/${mockTxHash}`;
      const hash = extractHashFromUrl(url);
      expect(hash).toBe(mockTxHash);
    });

    it("should return null for invalid URL", () => {
      const url = "https://example.com/not-a-tx-url";
      const hash = extractHashFromUrl(url);
      expect(hash).toBeNull();
    });

    it("should return null for URL without proper hash format", () => {
      const url = "https://sepolia.etherscan.io/tx/invalid-hash";
      const hash = extractHashFromUrl(url);
      expect(hash).toBeNull();
    });

    it("should return null for address URL", () => {
      const url = `https://sepolia.etherscan.io/address/${mockAddress}`;
      const hash = extractHashFromUrl(url);
      expect(hash).toBeNull();
    });

    it("should handle URLs with additional parameters", () => {
      const url = `https://sepolia.etherscan.io/tx/${mockTxHash}?tab=logs`;
      const hash = extractHashFromUrl(url);
      expect(hash).toBe(mockTxHash);
    });
  });

  describe("isEtherscanUrl", () => {
    it("should return true for valid Etherscan mainnet URL", () => {
      const url = "https://etherscan.io/tx/0x123";
      expect(isEtherscanUrl(url)).toBe(true);
    });

    it("should return true for valid Sepolia Etherscan URL", () => {
      const url = "https://sepolia.etherscan.io/address/0x123";
      expect(isEtherscanUrl(url)).toBe(true);
    });

    it("should return true for valid Goerli Etherscan URL", () => {
      const url = "https://goerli.etherscan.io/block/123";
      expect(isEtherscanUrl(url)).toBe(true);
    });

    it("should return false for non-Etherscan URL", () => {
      const url = "https://example.com/tx/0x123";
      expect(isEtherscanUrl(url)).toBe(false);
    });

    it("should return false for invalid URL", () => {
      const url = "not-a-valid-url";
      expect(isEtherscanUrl(url)).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isEtherscanUrl("")).toBe(false);
    });

    it("should handle URLs with different paths", () => {
      expect(isEtherscanUrl("https://etherscan.io/")).toBe(true);
      expect(isEtherscanUrl("https://sepolia.etherscan.io/search")).toBe(true);
      expect(isEtherscanUrl("https://goerli.etherscan.io/blocks")).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle hash with mixed case", () => {
      const mixedCaseHash = "0x0C88AC23d080c2037f0ede407b122f8ee4f1fd3f54f634b46b7f37c0041a3540" as Hash;
      const url = getTransactionUrl(mixedCaseHash);
      expect(url).toBe(`https://sepolia.etherscan.io/tx/${mixedCaseHash}`);
    });

    it("should extract hash with mixed case from URL", () => {
      const mixedCaseHash = "0x0C88AC23d080c2037f0ede407b122f8ee4f1fd3f54f634b46b7f37c0041a3540";
      const url = `https://sepolia.etherscan.io/tx/${mixedCaseHash}`;
      const extractedHash = extractHashFromUrl(url);
      expect(extractedHash).toBe(mixedCaseHash);
    });

    it("should handle addresses with mixed case", () => {
      const mixedCaseAddress = "0x742D35Cc6634C0532925a3b8D6ad54EfC04Cb2c2";
      const url = getAddressUrl(mixedCaseAddress);
      expect(url).toBe(`https://sepolia.etherscan.io/address/${mixedCaseAddress}`);
    });
  });
});