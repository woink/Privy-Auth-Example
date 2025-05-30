import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { type Hash } from "viem";
import { TransactionLink, FullTransactionLink } from "../TransactionLink";

describe("TransactionLink", () => {
  const mockHash = "0x0c88ac23d080c2037f0ede407b122f8ee4f1fd3f54f634b46b7f37c0041a3540" as Hash;

  describe("TransactionLink", () => {
    it("should render with default props", () => {
      render(<TransactionLink hash={mockHash} />);
      
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", `https://sepolia.etherscan.io/tx/${mockHash}`);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("should display truncated hash by default", () => {
      render(<TransactionLink hash={mockHash} />);
      
      const expectedText = `${mockHash.slice(0, 10)}...${mockHash.slice(-8)}`;
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    });

    it("should show external link icon by default", () => {
      render(<TransactionLink hash={mockHash} />);
      
      const icon = screen.getByTestId(/external-link|lucide-external-link/i);
      expect(icon).toBeInTheDocument();
    });

    it("should hide icon when showIcon is false", () => {
      render(<TransactionLink hash={mockHash} showIcon={false} />);
      
      const icon = screen.queryByTestId(/external-link|lucide-external-link/i);
      expect(icon).not.toBeInTheDocument();
    });

    it("should use custom network", () => {
      render(<TransactionLink hash={mockHash} network="mainnet" />);
      
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", `https://etherscan.io/tx/${mockHash}`);
    });

    it("should apply custom className", () => {
      const customClass = "custom-link-class";
      render(<TransactionLink hash={mockHash} className={customClass} />);
      
      const link = screen.getByRole("link");
      expect(link).toHaveClass(customClass);
    });

    it("should render custom children", () => {
      const customText = "View Transaction";
      render(<TransactionLink hash={mockHash}>{customText}</TransactionLink>);
      
      expect(screen.getByText(customText)).toBeInTheDocument();
      expect(screen.queryByText(mockHash.slice(0, 10))).not.toBeInTheDocument();
    });

    it("should have correct accessibility attributes", () => {
      render(<TransactionLink hash={mockHash} />);
      
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("should have proper CSS classes for styling", () => {
      render(<TransactionLink hash={mockHash} />);
      
      const link = screen.getByRole("link");
      expect(link).toHaveClass("inline-flex", "items-center", "gap-1");
      expect(link).toHaveClass("text-blue-600", "hover:text-blue-800");
      expect(link).toHaveClass("dark:text-blue-400", "dark:hover:text-blue-300");
      expect(link).toHaveClass("underline", "hover:no-underline");
    });

    it("should render span with font-mono class", () => {
      render(<TransactionLink hash={mockHash} />);
      
      const span = screen.getByText(new RegExp(mockHash.slice(0, 10)));
      expect(span).toHaveClass("font-mono", "text-sm");
    });
  });

  describe("FullTransactionLink", () => {
    it("should render full hash", () => {
      render(<FullTransactionLink hash={mockHash} />);
      
      expect(screen.getByText(mockHash)).toBeInTheDocument();
    });

    it("should use correct network", () => {
      render(<FullTransactionLink hash={mockHash} network="goerli" />);
      
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", `https://goerli.etherscan.io/tx/${mockHash}`);
    });

    it("should apply custom className", () => {
      const customClass = "full-link-class";
      render(<FullTransactionLink hash={mockHash} className={customClass} />);
      
      const link = screen.getByRole("link");
      expect(link).toHaveClass(customClass);
    });

    it("should always show external link icon", () => {
      render(<FullTransactionLink hash={mockHash} />);
      
      const icon = screen.getByTestId(/external-link|lucide-external-link/i);
      expect(icon).toBeInTheDocument();
    });

    it("should have same accessibility attributes as TransactionLink", () => {
      render(<FullTransactionLink hash={mockHash} />);
      
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  describe("different network support", () => {
    const networks = [
      { network: "mainnet" as const, expectedUrl: "https://etherscan.io" },
      { network: "sepolia" as const, expectedUrl: "https://sepolia.etherscan.io" },
      { network: "goerli" as const, expectedUrl: "https://goerli.etherscan.io" },
    ];

    networks.forEach(({ network, expectedUrl }) => {
      it(`should generate correct URL for ${network}`, () => {
        render(<TransactionLink hash={mockHash} network={network} />);
        
        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("href", `${expectedUrl}/tx/${mockHash}`);
      });
    });
  });

  describe("responsive design classes", () => {
    it("should include dark mode classes", () => {
      render(<TransactionLink hash={mockHash} />);
      
      const link = screen.getByRole("link");
      expect(link.className).toMatch(/dark:text-blue-400/);
      expect(link.className).toMatch(/dark:hover:text-blue-300/);
    });

    it("should include hover effects", () => {
      render(<TransactionLink hash={mockHash} />);
      
      const link = screen.getByRole("link");
      expect(link.className).toMatch(/hover:text-blue-800/);
      expect(link.className).toMatch(/hover:no-underline/);
    });

    it("should include transition effects", () => {
      render(<TransactionLink hash={mockHash} />);
      
      const link = screen.getByRole("link");
      expect(link).toHaveClass("transition-colors");
    });
  });
});