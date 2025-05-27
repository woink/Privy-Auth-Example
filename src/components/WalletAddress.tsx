import { publicMainnetClient } from "@/lib/privy";
import { useEffect, useState } from "react";
import type { Address, GetEnsNameReturnType } from "viem";

interface WalletDisplay {
  address: Address;
  truncated?: boolean;
}

export default function WalletAddress({
  address,
  truncated = true,
}: WalletDisplay) {
  if (!address) return null;
  if (!truncated) return <span>{address}</span>;

  const [ens, setEns] = useState<GetEnsNameReturnType>(null);
  const ensName = async () => await publicMainnetClient.getEnsName({ address });

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    ensName().then(setEns);
  }, [address]);

  return <span>{ens || `${address.slice(0, 6)}...${address.slice(-4)}`}</span>;
}
