import { usePrivy } from '@privy-io/react-auth';

interface WalletDisplay {
  address: string;
  truncated?: boolean;
}

const WalletAddress = ({ address, truncated = true }: WalletDisplay) => {
  if (!address) return null;
  if (!truncated) return <span>{address}</span>;
  return (
    <span>
      {address.slice(0, 6)}...{address.slice(-4)}
    </span>
  );
};

export default function AuthStatus() {
  const { ready, authenticated, login, logout, user } = usePrivy();

  if (!ready) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return (
      <button 
        onClick={login}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Login
      </button>
    );
  }

  const walletAddress = user?.wallet?.address;

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex items-center gap-2">
        <span className="font-medium">Wallet:</span>
        {walletAddress ? (
          <WalletAddress address={walletAddress} />
        ) : (
          <span className="text-gray-500">No wallet connected</span>
        )}
      </div>
      <button 
        onClick={logout}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}