import { createPublicClient, createWalletClient, http, parseAbi, type Address, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { contractErrorsAbi } from '@somnia-chain/markets-sdk';
import { hidekiTestnet } from '@somnia-chain/markets-sdk/chains';
import { cfg, GAS_LIMIT } from '../config.ts';

const ABI = [
  ...parseAbi([
    'function placeOrderFor(address owner, bool isBid, uint64 userData, uint256 price, uint256 quantity, uint64 expireTimestampNs, uint8 orderType, uint8 selfMatchingOption, address builder, uint96 builderFeeBpsTimes1k) payable returns (bool success, uint128 orderId)',
    'function cancelOrderFor(address owner, uint128 orderId)',
  ]),
  ...contractErrorsAbi,
] as const;

export function ownerAddress(): Address {
  if (!cfg.OWNER_ADDRESS) throw new Error('OWNER_ADDRESS is required for owner-path probes');
  return cfg.OWNER_ADDRESS as Address;
}

function clients() {
  const account = privateKeyToAccount(cfg.BOT_PRIVATE_KEY as `0x${string}`);
  const transport = http(cfg.RPC_URL_HTTP);
  return {
    account,
    publicClient: createPublicClient({ chain: hidekiTestnet, transport }),
    walletClient: createWalletClient({ account, chain: hidekiTestnet, transport }),
  };
}

export async function simulateOwner(pool: Address, functionName: 'placeOrderFor' | 'cancelOrderFor', args: readonly unknown[]): Promise<{ ok: true } | { ok: false; message: string }> {
  const { account, publicClient } = clients();
  try {
    await publicClient.simulateContract({
      address: pool, abi: ABI, functionName, args: args as never, account, gas: GAS_LIMIT,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}

export async function sendOwner(pool: Address, functionName: 'placeOrderFor' | 'cancelOrderFor', args: readonly unknown[]): Promise<{ hash: Hex; status: string }> {
  const { account, publicClient, walletClient } = clients();
  const { request } = await publicClient.simulateContract({
    address: pool, abi: ABI, functionName, args: args as never, account, gas: GAS_LIMIT,
  });
  const hash = await walletClient.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { hash, status: receipt.status };
}

export function farFutureNs(): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + 50 * 365 * 24 * 3600) * 1_000_000_000n;
}

export function placeArgs(owner: Address, isBid: boolean, price: bigint, quantity: bigint, orderType: number) {
  return [owner, isBid, 0n, price, quantity, farFutureNs(), orderType, 0, '0x0000000000000000000000000000000000000000', 0n] as const;
}
