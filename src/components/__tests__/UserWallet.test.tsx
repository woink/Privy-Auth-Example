import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import UserWallet from "../UserWallet";

describe("UserWallet", () => {
  const defaultProps = {
    address: null,
    balance: null,
    isLoading: false,
    error: null,
  };

  describe("rendering", () => {
    it("should render wallet container with title", () => {
      render(<UserWallet {...defaultProps} />);

      expect(
        screen.getByRole("heading", { name: "Your Wallet" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Wallet Address:")).toBeInTheDocument();
      expect(screen.getByText("Balance:")).toBeInTheDocument();
    });

    it("should have correct CSS classes", () => {
      render(<UserWallet {...defaultProps} />);

      const container = screen.getByText("Your Wallet").closest(".container");
      expect(container).toHaveClass("container", "wallet");
    });
  });

  describe("address display", () => {
    it("should display wallet address when provided", () => {
      const address = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";
      render(<UserWallet {...defaultProps} address={address} />);

      expect(
        screen.getByText(`Wallet Address: ${address}`),
      ).toBeInTheDocument();
    });

    it("should display null when address is null", () => {
      render(<UserWallet {...defaultProps} address={null} />);

      expect(screen.getByText("Wallet Address:")).toBeInTheDocument();
    });

    it("should display empty string when address is empty", () => {
      render(<UserWallet {...defaultProps} address="" />);

      expect(screen.getByText("Wallet Address:")).toBeInTheDocument();
    });

    it("should handle long addresses", () => {
      const longAddress =
        "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";
      render(<UserWallet {...defaultProps} address={longAddress} />);

      expect(
        screen.getByText(`Wallet Address: ${longAddress}`),
      ).toBeInTheDocument();
    });
  });

  describe("balance display", () => {
    it("should display balance when provided", () => {
      const balance = "1.5";
      render(<UserWallet {...defaultProps} balance={balance} />);

      expect(screen.getByText(`Balance: ${balance}`)).toBeInTheDocument();
    });

    it("should display zero balance", () => {
      render(<UserWallet {...defaultProps} balance="0" />);

      expect(screen.getByText("Balance: 0")).toBeInTheDocument();
    });

    it("should display very small balances", () => {
      const smallBalance = "0.000001";
      render(<UserWallet {...defaultProps} balance={smallBalance} />);

      expect(screen.getByText(`Balance: ${smallBalance}`)).toBeInTheDocument();
    });

    it("should display large balances", () => {
      const largeBalance = "999999.123456";
      render(<UserWallet {...defaultProps} balance={largeBalance} />);

      expect(screen.getByText(`Balance: ${largeBalance}`)).toBeInTheDocument();
    });

    it("should handle null balance", () => {
      render(<UserWallet {...defaultProps} balance={null} />);

      expect(screen.getByText("Balance:")).toBeInTheDocument();
    });

    it("should handle empty string balance", () => {
      render(<UserWallet {...defaultProps} balance="" />);

      expect(screen.getByText("Balance:")).toBeInTheDocument();
    });
  });

  describe("combined address and balance", () => {
    it("should display both address and balance when provided", () => {
      const address = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";
      const balance = "42.123456";

      render(
        <UserWallet {...defaultProps} address={address} balance={balance} />,
      );

      expect(
        screen.getByText(`Wallet Address: ${address}`),
      ).toBeInTheDocument();
      expect(screen.getByText(`Balance: ${balance}`)).toBeInTheDocument();
    });

    it("should handle mismatched null values", () => {
      const address = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";

      render(<UserWallet {...defaultProps} address={address} balance={null} />);

      expect(
        screen.getByText(`Wallet Address: ${address}`),
      ).toBeInTheDocument();
      expect(screen.getByText("Balance:")).toBeInTheDocument();
    });
  });

  describe("props that are not currently used but passed", () => {
    it("should render correctly with isLoading true", () => {
      render(<UserWallet {...defaultProps} isLoading={true} />);

      expect(screen.getByText("Your Wallet")).toBeInTheDocument();
      expect(screen.getByText("Wallet Address:")).toBeInTheDocument();
      expect(screen.getByText("Balance:")).toBeInTheDocument();
    });

    it("should render correctly with error", () => {
      render(<UserWallet {...defaultProps} error="Network error" />);

      expect(screen.getByText("Your Wallet")).toBeInTheDocument();
      expect(screen.getByText("Wallet Address:")).toBeInTheDocument();
      expect(screen.getByText("Balance:")).toBeInTheDocument();
    });

    it("should render correctly with all props provided", () => {
      const props = {
        address: "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2",
        balance: "1.5",
        isLoading: true,
        error: "Some error",
      };

      render(<UserWallet {...props} />);

      expect(
        screen.getByText(`Wallet Address: ${props.address}`),
      ).toBeInTheDocument();
      expect(screen.getByText(`Balance: ${props.balance}`)).toBeInTheDocument();
    });
  });

  describe("suspense integration", () => {
    it("should render without suspense fallback when not loading", () => {
      render(<UserWallet {...defaultProps} />);

      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      expect(screen.getByText("Wallet Address:")).toBeInTheDocument();
      expect(screen.getByText("Balance:")).toBeInTheDocument();
    });

    it("should render content inside Suspense boundary", () => {
      const address = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";
      const balance = "1.5";

      render(
        <UserWallet {...defaultProps} address={address} balance={balance} />,
      );

      // Content should be rendered (not suspended)
      expect(
        screen.getByText(`Wallet Address: ${address}`),
      ).toBeInTheDocument();
      expect(screen.getByText(`Balance: ${balance}`)).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("should have proper heading structure", () => {
      render(<UserWallet {...defaultProps} />);

      const heading = screen.getByRole("heading", { name: "Your Wallet" });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe("H1");
    });

    it("should have proper text content for screen readers", () => {
      const address = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";
      const balance = "1.5";

      render(
        <UserWallet {...defaultProps} address={address} balance={balance} />,
      );

      expect(
        screen.getByText((content, element) =>
          content.includes("Wallet Address:"),
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText((content, element) => content.includes("Balance:")),
      ).toBeInTheDocument();
    });
  });
});
