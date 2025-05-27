export default function WalletLoading() {
  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>
      <div className="wallet-content">
        <div className="balance">
          <span className="label">Wallet Address:</span>
          <div className="loading-skeleton address-skeleton" />
        </div>
        <div className="balance">
          <span className="label">Balance:</span>
          <div className="loading-skeleton balance-skeleton" />
        </div>
      </div>

      <style jsx>{`
        .wallet-content {
          opacity: 0.7;
        }
        
        .loading-skeleton {
          height: 1.25rem;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 0.25rem;
          display: inline-block;
        }
        
        .address-skeleton {
          width: 300px;
        }
        
        .balance-skeleton {
          width: 120px;
        }
        
        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .loading-skeleton {
            animation: none;
            background: #e0e0e0;
          }
        }
      `}</style>
    </div>
  );
}
