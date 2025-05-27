import { http, createPublicClient } from "viem";
import { mainnet, sepolia } from "viem/chains";

export const publicMainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export const publicSepoliaClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});
