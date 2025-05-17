import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import PrivyProviderWrapper from '../privy-provider';

vi.mock('@privy-io/react-auth', () => ({
  PrivyProvider: ({ children, appId }: { children: React.ReactNode; appId: string }) => (
    <div data-testid="mock-privy-provider" data-app-id={appId}>
      {children}
    </div>
  ),
}));

describe('PrivyProviderWrapper', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    cleanup();
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  it('renders children components', () => {
    process.env.NEXT_PUBLIC_PRIVY_APP_ID = 'test-app-id';
    const { getByTestId } = render(
      <PrivyProviderWrapper>
        <div data-testid="test-child">Test Child</div>
      </PrivyProviderWrapper>
    );

    expect(getByTestId('test-child')).toBeInTheDocument();
  });

  it('initializes PrivyProvider with correct app ID', () => {
    const testAppId = 'test-app-id';
    process.env.NEXT_PUBLIC_PRIVY_APP_ID = testAppId;
    
    const { getByTestId } = render(
      <PrivyProviderWrapper>
        <div>Test Child</div>
      </PrivyProviderWrapper>
    );

    expect(getByTestId('mock-privy-provider')).toHaveAttribute('data-app-id', testAppId);
  });

  it('handles missing APP_ID gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {}) as MockedFunction<typeof console.error>;
    process.env.NEXT_PUBLIC_PRIVY_APP_ID = undefined;

    const { getByTestId } = render(
      <PrivyProviderWrapper>
        <div data-testid="test-child">Test Child</div>
      </PrivyProviderWrapper>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'Privy App ID is not configured. Please set NEXT_PUBLIC_PRIVY_APP_ID in your environment variables.'
    );
    expect(getByTestId('test-child')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});