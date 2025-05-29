export default function WalletLoading() {
  return (
    <div className="wallet-card">
      <h1 className="my-3 text-gray-800 text-2xl">Your Wallet</h1>
      <div className="wallet-content opacity-70">
        <div className="wallet-balance">
          <span className="label">Wallet Address:</span>
          <div className="h-5 w-80 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-pulse rounded inline-block" />
        </div>
        <div className="wallet-balance">
          <span className="label">Balance:</span>
          <div className="h-5 w-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-pulse rounded inline-block" />
        </div>
      </div>
    </div>
  );
}
