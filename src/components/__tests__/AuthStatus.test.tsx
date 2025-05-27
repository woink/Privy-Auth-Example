import { usePrivy } from "@privy-io/react-auth";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthStatus from "../AuthStatus";

// Mock the entire module
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: vi.fn(),
}));

// Create a base mock that satisfies the PrivyInterface
const createPrivyMock = (overrides = {}) => ({
  // Add required fields from PrivyInterface
  ready: false,
  authenticated: false,
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
  linkEmail: vi.fn(),
  linkWallet: vi.fn(),
  createWallet: vi.fn(),
  connectWallet: vi.fn(),
  connectOrCreateWallet: vi.fn(),
  linkPhone: vi.fn(),
  unlinkEmail: vi.fn(),
  unlinkWallet: vi.fn(),
  unlinkPhone: vi.fn(),
  linkTwitter: vi.fn(),
  unlinkTwitter: vi.fn(),
  linkDiscord: vi.fn(),
  unlinkDiscord: vi.fn(),
  linkGithub: vi.fn(),
  unlinkGithub: vi.fn(),
  // Override any fields with provided values
  ...overrides,
});

describe("AuthStatus Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays loading message when not ready", () => {
    const mockPrivy = usePrivy as unknown as ReturnType<typeof vi.fn>;
    mockPrivy.mockReturnValue(
      createPrivyMock({
        ready: false,
        authenticated: false,
      }),
    );

    render(<AuthStatus />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("displays login button when ready but not authenticated", async () => {
    const mockLogin = vi.fn();
    const mockPrivy = usePrivy as unknown as ReturnType<typeof vi.fn>;
    mockPrivy.mockReturnValue(
      createPrivyMock({
        ready: true,
        authenticated: false,
        login: mockLogin,
      }),
    );

    render(<AuthStatus />);
    const user = userEvent.setup();

    const loginButton = screen.getByRole("button", { name: /login/i });
    expect(loginButton).toBeInTheDocument();

    await user.click(loginButton);
    expect(mockLogin).toHaveBeenCalledTimes(1);
  });

  it("displays user info and logout button when authenticated with wallet", async () => {
    const mockLogout = vi.fn();
    const mockAddress = "0x1234567890abcdef1234567890abcdef12345678";
    const mockPrivy = usePrivy as unknown as ReturnType<typeof vi.fn>;

    // Create a mock wallet object that satisfies the Wallet interface
    const mockWallet = {
      address: mockAddress,
      chainType: "ethereum",
      imported: false,
      delegated: false,
      walletIndex: 0,
    };

    mockPrivy.mockReturnValue(
      createPrivyMock({
        ready: true,
        authenticated: true,
        logout: mockLogout,
        user: {
          id: "user-id",
          createdAt: new Date().toISOString(),
          linkedAccounts: [],
          mfaMethods: [],
          wallet: mockWallet,
        },
      }),
    );

    render(<AuthStatus />);

    // Check for truncated address display (first 6 and last 4 chars)
    expect(
      screen.getByText(`${mockAddress.slice(0, 6)}...${mockAddress.slice(-4)}`),
    ).toBeInTheDocument();

    const logoutButton = screen.getByRole("button", { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(logoutButton);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it("handles missing wallet address gracefully", () => {
    const mockPrivy = usePrivy as unknown as ReturnType<typeof vi.fn>;

    mockPrivy.mockReturnValue(
      createPrivyMock({
        ready: true,
        authenticated: true,
        user: {
          id: "user-id",
          createdAt: new Date().toISOString(),
          linkedAccounts: [],
          mfaMethods: [],
          // No wallet property
        },
      }),
    );

    render(<AuthStatus />);
    expect(screen.getByText("No wallet connected")).toBeInTheDocument();
  });

  it("handles user with malformed wallet object", () => {
    const mockPrivy = usePrivy as unknown as ReturnType<typeof vi.fn>;

    // Create a mock with incomplete wallet object
    mockPrivy.mockReturnValue(
      createPrivyMock({
        ready: true,
        authenticated: true,
        user: {
          id: "user-id",
          createdAt: new Date().toISOString(),
          linkedAccounts: [],
          mfaMethods: [],
          wallet: {
            // Missing address property but including other required props
            chainType: "ethereum",
            imported: false,
            delegated: false,
            walletIndex: 0,
          },
        },
      }),
    );

    render(<AuthStatus />);
    expect(screen.getByText("No wallet connected")).toBeInTheDocument();
  });
});
