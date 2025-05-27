import { publicSepoliaClient } from "@/lib/privy";
import type { Address } from "viem";

interface GetUserBalanceParams {
  address: Address;
  chainId: number;
}

export const getUserBalance = async ({
  address,
}: GetUserBalanceParams): Promise<bigint> => {
  const balance = await publicSepoliaClient.getBalance({ address });
  return balance;
};
