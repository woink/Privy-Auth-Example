import { publicSepoliaClient } from '@/lib/viemFuncs';

export const getUserBalance = async ({ address, chainId }) => {
  const balance = await publicSepoliaClient.getBalance({ address });
  return balance;
};
