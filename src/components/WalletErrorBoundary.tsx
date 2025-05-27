import {
  getWalletErrorMessage,
  isWalletQueryError,
} from "@/lib/queries/wallet-queries";
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class WalletErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Wallet Error Boundary caught an error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  private renderDefaultError = (error: Error) => {
    const errorMessage = getWalletErrorMessage(error);
    const isWalletError = isWalletQueryError(error);

    return (
      <div className="wallet-error-boundary">
        <div className="error-content">
          <h3>Unable to Load Wallet Data</h3>
          <p>{errorMessage}</p>

          {/* Show retry button for certain error types */}
          {isWalletError &&
            !["MISSING_ADDRESS", "INVALID_ADDRESS"].includes(error.code) && (
              <button
                onClick={this.handleRetry}
                className="retry-button"
                type="button"
              >
                Try Again
              </button>
            )}

          {/* Development error details */}
          {process.env.NODE_ENV === "development" && (
            <details className="error-details">
              <summary>Error Details (Development)</summary>
              <pre>{error.stack}</pre>
            </details>
          )}
        </div>

        <style jsx>{`
          .wallet-error-boundary {
            padding: 1rem;
            margin: 1rem 0;
            border: 1px solid #e53e3e;
            border-radius: 0.375rem;
            background-color: #fed7d7;
            color: #c53030;
          }

          .error-content h3 {
            margin: 0 0 0.5rem 0;
            font-size: 1.125rem;
            font-weight: 600;
          }

          .error-content p {
            margin: 0 0 1rem 0;
            line-height: 1.5;
          }

          .retry-button {
            background-color: #c53030;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            cursor: pointer;
            font-size: 0.875rem;
            transition: background-color 0.2s;
          }

          .retry-button:hover {
            background-color: #9c2a2a;
          }

          .error-details {
            margin-top: 1rem;
            font-size: 0.75rem;
          }

          .error-details summary {
            cursor: pointer;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }

          .error-details pre {
            background-color: #f7fafc;
            padding: 0.5rem;
            border-radius: 0.25rem;
            overflow-x: auto;
            white-space: pre-wrap;
            word-break: break-all;
          }
        `}</style>
      </div>
    );
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }
      return this.renderDefaultError(this.state.error);
    }

    return this.props.children;
  }
}

export default WalletErrorBoundary;
