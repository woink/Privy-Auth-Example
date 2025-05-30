import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import UserWallet from "../UserWallet";

// Mock the WalletContext
vi.mock("@/contexts/WalletContext", () => ({
  useWallet: vi.fn(),
}));

// Mock the WalletAddress component
vi.mock("../WalletAddress", () => ({
  default: ({ address }: { address: string }) => (
    <span data-testid="wallet-address">{address}</span>
  ),
}));

// Mock the Card components
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className} data-testid="card-content">
      {children}
    </div>
  ),
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h1 data-testid="card-title">{children}</h1>,
}));

// Mock viem's getAddress function
vi.mock("viem", () => ({
  getAddress: (address: string) => address.toLowerCase(),
}));

import { useWallet } from "@/contexts/WalletContext";

describe("UserWallet", () => {
  const mockUseWallet = useWallet as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when user has no wallet", () => {
    it("should display no wallet connected message", () => {
      mockUseWallet.mockReturnValue({
        hasWallet: false,
        address: null,
        balance: undefined,
        isLoadingBalance: false,
        isAuthenticated: true,
        isReady: true,
        user: { id: "test-user" },
        balanceError: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshBalance: vi.fn(),
      });

      render(<UserWallet />);

      expect(screen.getByText("No wallet connected")).toBeInTheDocument();
      expect(
        screen.getByText("Please connect your wallet to view balance information.")
      ).toBeInTheDocument();
    });

    it("should render in a card with correct styling", () => {
      mockUseWallet.mockReturnValue({
        hasWallet: false,
        address: null,
        balance: undefined,
        isLoadingBalance: false,
        isAuthenticated: true,
        isReady: true,
        user: { id: "test-user" },
        balanceError: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshBalance: vi.fn(),
      });

      render(<UserWallet />);

      const card = screen.getByTestId("card");
      expect(card).toHaveClass("w-fit", "m-5");
    });
  });

  describe("when user has a wallet", () => {
    const mockAddress = "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2";

    it("should display wallet address and balance", () => {
      mockUseWallet.mockReturnValue({
        hasWallet: true,
        address: mockAddress,
        balance: "1.5",
        isLoadingBalance: false,
        isAuthenticated: true,
        isReady: true,
        user: { id: "test-user" },
        balanceError: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshBalance: vi.fn(),
      });

      render(<UserWallet />);

      expect(screen.getByText("Wallet:")).toBeInTheDocument();
      expect(screen.getByTestId("wallet-address")).toHaveTextContent(mockAddress.toLowerCase());
      expect(screen.getByText("Balance:")).toBeInTheDocument();
      expect(screen.getByText("1.5 ETH")).toBeInTheDocument();
    });

    it("should show loading state for balance", () => {
      mockUseWallet.mockReturnValue({
        hasWallet: true,
        address: mockAddress,
        balance: undefined,
        isLoadingBalance: true,
        isAuthenticated: true,
        isReady: true,
        user: { id: "test-user" },
        balanceError: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshBalance: vi.fn(),
      });

      render(<UserWallet />);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should display zero balance when balance is null", () => {
      mockUseWallet.mockReturnValue({
        hasWallet: true,
        address: mockAddress,
        balance: null,
        isLoadingBalance: false,
        isAuthenticated: true,
        isReady: true,
        user: { id: "test-user" },
        balanceError: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshBalance: vi.fn(),
      });

      render(<UserWallet />);

      expect(screen.getByText("0 ETH")).toBeInTheDocument();
    });

    it("should display zero balance when balance is undefined", () => {
      mockUseWallet.mockReturnValue({
        hasWallet: true,
        address: mockAddress,
        balance: undefined,
        isLoadingBalance: false,
        isAuthenticated: true,
        isReady: true,
        user: { id: "test-user" },
        balanceError: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshBalance: vi.fn(),
      });

      render(<UserWallet />);

      expect(screen.getByText("0 ETH")).toBeInTheDocument();
    });

    it("should have correct styling classes", () => {
      mockUseWallet.mockReturnValue({
        hasWallet: true,
        address: mockAddress,
        balance: "1.5",
        isLoadingBalance: false,
        isAuthenticated: true,
        isReady: true,
        user: { id: "test-user" },
        balanceError: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshBalance: vi.fn(),
      });

      render(<UserWallet />);

      const card = screen.getByTestId("card");
      expect(card).toHaveClass("w-fit", "m-5");

      const cardContent = screen.getByTestId("card-content");
      expect(cardContent).toHaveClass("space-y-4");
    });

    it("should handle font-mono classes correctly", () => {
      mockUseWallet.mockReturnValue({
        hasWallet: true,
        address: mockAddress,
        balance: "1.5",
        isLoadingBalance: false,
        isAuthenticated: true,
        isReady: true,
        user: { id: "test-user" },
        balanceError: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshBalance: vi.fn(),
      });

      render(<UserWallet />);

      const walletLabel = screen.getByText("Wallet:");
      expect(walletLabel).toHaveClass("font-semibold", "font-mono");

      const balanceLabel = screen.getByText("Balance:");
      expect(balanceLabel).toHaveClass("text-muted-foreground", "font-semibold", "font-mono");
    });
  });

  describe("edge cases", () => {
    it("should handle missing address gracefully", () => {
      mockUseWallet.mockReturnValue({
        hasWallet: true,
        address: null,
        balance: "1.5",
        isLoadingBalance: false,
        isAuthenticated: true,
        isReady: true,
        user: { id: "test-user" },
        balanceError: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshBalance: vi.fn(),
      });

      render(<UserWallet />);

      expect(screen.getByText("No wallet connected")).toBeInTheDocument();
    });

    it("should handle hasWallet false but address present", () => {
      mockUseWallet.mockReturnValue({
        hasWallet: false,
        address: "0x742d35Cc6634C0532925a3b8D6ad54EfC04cb2c2",
        balance: "1.5",
        isLoadingBalance: false,
        isAuthenticated: true,
        isReady: true,
        user: { id: "test-user" },
        balanceError: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshBalance: vi.fn(),
      });

      render(<UserWallet />);

      expect(screen.getByText("No wallet connected")).toBeInTheDocument();
    });
  });
});