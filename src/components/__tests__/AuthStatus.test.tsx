import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WalletProvider } from "@/contexts/WalletContext";
import AuthStatus from "../AuthStatus";

// Mock the WalletContext
vi.mock("@/contexts/WalletContext", async () => {
  const actual = await vi.importActual("@/contexts/WalletContext");
  return {
    ...actual,
    useWallet: vi.fn(),
  };
});

// Mock the Button component
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, variant, className }: any) => (
    <button
      onClick={onClick}
      data-variant={variant}
      className={className}
    >
      {children}
    </button>
  ),
}));

import { useWallet } from "@/contexts/WalletContext";

describe("AuthStatus Component", () => {
  const mockLogin = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render login button when not authenticated", async () => {
    const mockUseWallet = useWallet as ReturnType<typeof vi.fn>;
    mockUseWallet.mockReturnValue({
      isAuthenticated: false,
      login: mockLogin,
      logout: mockLogout,
      isReady: true,
      user: null,
      address: null,
      hasWallet: false,
      balance: undefined,
      isLoadingBalance: false,
      balanceError: null,
      refreshBalance: vi.fn(),
    });

    render(<AuthStatus />);
    
    const loginButton = screen.getByRole("button", { name: /login/i });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveClass("font-mono");

    const user = userEvent.setup();
    await user.click(loginButton);
    expect(mockLogin).toHaveBeenCalledTimes(1);
  });

  it("should render logout button when authenticated", async () => {
    const mockUseWallet = useWallet as ReturnType<typeof vi.fn>;
    mockUseWallet.mockReturnValue({
      isAuthenticated: true,
      login: mockLogin,
      logout: mockLogout,
      isReady: true,
      user: { id: "test-user" },
      address: "0x1234567890abcdef1234567890abcdef12345678",
      hasWallet: true,
      balance: "1.5",
      isLoadingBalance: false,
      balanceError: null,
      refreshBalance: vi.fn(),
    });

    render(<AuthStatus />);
    
    const logoutButton = screen.getByRole("button", { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveClass("font-mono");
    expect(logoutButton).toHaveAttribute("data-variant", "destructive");

    const user = userEvent.setup();
    await user.click(logoutButton);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it("should have correct styling classes", () => {
    const mockUseWallet = useWallet as ReturnType<typeof vi.fn>;
    mockUseWallet.mockReturnValue({
      isAuthenticated: false,
      login: mockLogin,
      logout: mockLogout,
      isReady: true,
      user: null,
      address: null,
      hasWallet: false,
      balance: undefined,
      isLoadingBalance: false,
      balanceError: null,
      refreshBalance: vi.fn(),
    });

    render(<AuthStatus />);
    
    const button = screen.getByRole("button");
    expect(button).toHaveClass("font-mono");
  });

  it("should render logout button with destructive variant when authenticated", () => {
    const mockUseWallet = useWallet as ReturnType<typeof vi.fn>;
    mockUseWallet.mockReturnValue({
      isAuthenticated: true,
      login: mockLogin,
      logout: mockLogout,
      isReady: true,
      user: { id: "test-user" },
      address: "0x1234567890abcdef1234567890abcdef12345678",
      hasWallet: true,
      balance: "1.5",
      isLoadingBalance: false,
      balanceError: null,
      refreshBalance: vi.fn(),
    });

    render(<AuthStatus />);
    
    const logoutButton = screen.getByRole("button", { name: /logout/i });
    expect(logoutButton).toHaveAttribute("data-variant", "destructive");
  });
});