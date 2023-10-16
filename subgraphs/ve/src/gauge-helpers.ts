import { Address, BigInt } from "@graphprotocol/graph-ts";
import { BigDecimal, Bytes } from "@graphprotocol/graph-ts";
import { BALANCER_VAULT, DFX, USDC } from "../../../packages/constants/index";
import { BalancerVault as BalancerVaultContract } from "../generated/templates/Gauge/BalancerVault";
import { ERC20 as ERC20Contract } from "../generated/templates/Gauge/ERC20";
import { ONE_BD, ZERO_BD, valueToBigDecimal } from "./helpers";
import { GaugeReward } from "../generated/schema";

// Use Balancer pool to calculate its spot price at the current block
// https://token-engineering-balancer.gitbook.io/balancer-simulations/additional-code-and-instructions/balancer-the-python-edition/balancer_math.py
function calcSpotPrice(
  tokenBalanceIn: BigDecimal,
  tokenWeightIn: BigDecimal,
  tokenBalanceOut: BigDecimal,
  tokenWeightOut: BigDecimal,
  swapFee: BigDecimal
): BigDecimal {
  const numer = tokenBalanceIn.div(tokenWeightIn);
  const denom = tokenBalanceOut.div(tokenWeightOut);
  const ratio = numer.div(denom);
  const scale = ONE_BD.div(ONE_BD.minus(swapFee));
  return ratio.times(scale);
}

function getTokenBalances(poolId: Bytes, firstToken: Address): BigDecimal[] {
  const vaultContract = BalancerVaultContract.bind(
    Address.fromString(BALANCER_VAULT)
  );
  const res = vaultContract.try_getPoolTokens(poolId);
  const tokens = res.value.getTokens();
  assert(tokens[0] == firstToken);

  const token0Contract = ERC20Contract.bind(tokens[0]);
  const token1Contract = ERC20Contract.bind(tokens[1]);
  const token0Decimals = token0Contract.decimals();
  const token1Decimals = token1Contract.decimals();

  const balances = res.value.getBalances();
  return [
    valueToBigDecimal(balances[0], token0Decimals),
    valueToBigDecimal(balances[1], token1Decimals),
  ];
}

// Use Balancer.fi pool to emulate swap for 1 DFX to USDC to retrieve token price
// at current block times
export function getDfxPrice(): BigDecimal {
  // 50/50 pool params w/ 0.3% fee
  const weight = valueToBigDecimal(BigInt.fromU64(5e17 as u64), 18);
  const fee = valueToBigDecimal(BigInt.fromU64(3e15 as u64), 18);

  const DFX_WETH_POOL_ID = Bytes.fromHexString(
    "0x3f7c10701b14197e2695dec6428a2ca4cf7fc3b800020000000000000000023c"
  );
  const dfxWethBals = getTokenBalances(
    DFX_WETH_POOL_ID,
    Address.fromString(DFX)
  );

  const dfxPerWeth = calcSpotPrice(
    dfxWethBals[0],
    weight,
    dfxWethBals[1],
    weight,
    fee
  );

  const WETH_USDC_POOL_ID = Bytes.fromHexString(
    "0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019"
  );
  const wethUsdcBals = getTokenBalances(
    WETH_USDC_POOL_ID,
    Address.fromString(USDC)
  );
  const usdcPerWeth = calcSpotPrice(
    wethUsdcBals[0],
    weight,
    wethUsdcBals[1],
    weight,
    fee
  );

  const dfxPerUsdc = usdcPerWeth.div(dfxPerWeth);
  return dfxPerUsdc;
}
