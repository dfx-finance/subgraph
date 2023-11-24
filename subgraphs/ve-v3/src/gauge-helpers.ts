import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  DFX,
  DFX_GAUGE_CONTROLLER_V3,
} from "../../../packages/constants/index";
import { LiquidityGaugeV4, RootGauge } from "../generated/schema";
import { GaugeController as GaugeControllerContract } from "../generated/templates/LiquidityGaugeV4/GaugeController";
import { LiquidityGaugeV4 as LiquidityGaugeV4Contract } from "../generated/templates/LiquidityGaugeV4/LiquidityGaugeV4";
import { ERC20 as ERC20Contract } from "../generated/templates/LiquidityGaugeV4/ERC20";
import {
  DFX_DECIMALS,
  EPOCHS_PER_YEAR,
  TOKENLESS_PRODUCTION,
  ZERO_BD,
  valueToBigDecimal,
} from "./helpers";
import { getGaugeReward } from "./gauge-reward";
import { getGaugeController } from "./gauge-controller";

// // Use Balancer pool to calculate its spot price at the current block
// // https://token-engineering-balancer.gitbook.io/balancer-simulations/additional-code-and-instructions/balancer-the-python-edition/balancer_math.py
// function calcSpotPrice(
//   tokenBalanceIn: BigDecimal,
//   tokenWeightIn: BigDecimal,
//   tokenBalanceOut: BigDecimal,
//   tokenWeightOut: BigDecimal,
//   swapFee: BigDecimal
// ): BigDecimal {
//   const numer = tokenBalanceIn.div(tokenWeightIn);
//   const denom = tokenBalanceOut.div(tokenWeightOut);
//   const ratio = numer.div(denom);
//   const scale = ONE_BD.div(ONE_BD.minus(swapFee));
//   return ratio.times(scale);
// }

// function getTokenBalances(poolId: Bytes, firstToken: Address): BigDecimal[] {
//   const vaultContract = BalancerVaultContract.bind(
//     Address.fromString(BALANCER_VAULT_V2)
//   );
//   const res = vaultContract.try_getPoolTokens(poolId);
//   const tokens = res.value.getTokens();
//   assert(tokens[0] == firstToken);

//   const token0Contract = ERC20Contract.bind(tokens[0]);
//   const token1Contract = ERC20Contract.bind(tokens[1]);
//   const token0Decimals = token0Contract.decimals();
//   const token1Decimals = token1Contract.decimals();

//   const balances = res.value.getBalances();
//   return [
//     valueToBigDecimal(balances[0], token0Decimals),
//     valueToBigDecimal(balances[1], token1Decimals),
//   ];
// }

// // Use Balancer.fi pool to emulate swap for 1 DFX to USDC to retrieve token price
// // at current block times
// export function getDfxPrice(): BigDecimal {
//   // 50/50 pool params w/ 0.3% fee
//   const weight = valueToBigDecimal(BigInt.fromU64(5e17 as u64), 18);
//   const fee = valueToBigDecimal(BigInt.fromU64(3e15 as u64), 18);

//   const DFX_WETH_POOL_ID = Bytes.fromHexString(
//     "0x3f7c10701b14197e2695dec6428a2ca4cf7fc3b800020000000000000000023c"
//   );
//   const dfxWethBals = getTokenBalances(
//     DFX_WETH_POOL_ID,
//     Address.fromString(DFX)
//   );

//   const dfxPerWeth = calcSpotPrice(
//     dfxWethBals[0],
//     weight,
//     dfxWethBals[1],
//     weight,
//     fee
//   );

//   const WETH_USDC_POOL_ID = Bytes.fromHexString(
//     "0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019"
//   );
//   const wethUsdcBals = getTokenBalances(
//     WETH_USDC_POOL_ID,
//     Address.fromString(USDC)
//   );
//   const usdcPerWeth = calcSpotPrice(
//     wethUsdcBals[0],
//     weight,
//     wethUsdcBals[1],
//     weight,
//     fee
//   );

//   const dfxPerUsdc = usdcPerWeth.div(dfxPerWeth);
//   return dfxPerUsdc;
// }

/* -- Helpers -- */
// Update the total DFX available (unclaimed and undistributed) in gauge
export function _updateDfxBalance(gauge: LiquidityGaugeV4): void {
  const gaugeAddr = Address.fromString(gauge.id);

  const dfxContract = ERC20Contract.bind(Address.fromString(DFX));
  const rewardAmount = valueToBigDecimal(dfxContract.balanceOf(gaugeAddr), 18);

  gauge.dfxBalance = rewardAmount;
}

// Update the weighted amount of veDFX provided to gauge
export function _updateWorkingSupply(gauge: LiquidityGaugeV4): void {
  const gaugeAddr = Address.fromString(gauge.id);
  const gaugeContract = LiquidityGaugeV4Contract.bind(gaugeAddr);

  const workingSupply = gaugeContract.working_supply();
  const dfxDecimals = 18;

  gauge.workingSupply = valueToBigDecimal(workingSupply, dfxDecimals);
}

// Update the total amount of veDFX provided to gauge
export function _updateTotalSupply(gauge: LiquidityGaugeV4): void {
  const gaugeAddr = Address.fromString(gauge.id);
  const gaugeContract = LiquidityGaugeV4Contract.bind(gaugeAddr);

  const totalSupply = gaugeContract.totalSupply();
  const dfxDecimals = 18;

  gauge.totalSupply = valueToBigDecimal(totalSupply, dfxDecimals);
}

export function _updateRewardsAvailable(gauge: LiquidityGaugeV4): void {
  const gaugeAddr = Address.fromString(gauge.id);

  // iterate and update each gauge reward
  const gaugeContract = LiquidityGaugeV4Contract.bind(gaugeAddr);
  const numRewards = gaugeContract.reward_count().toI32();

  for (let i: i32 = 0; i < numRewards; i++) {
    const gaugeContract = LiquidityGaugeV4Contract.bind(
      Address.fromString(gauge.id)
    );

    // get rewards contract info
    const rewardsAddr = gaugeContract.reward_tokens(BigInt.fromI32(i));
    const rewardContract = ERC20Contract.bind(rewardsAddr);
    const rewardDecimals = rewardContract.decimals();

    // get weekly rewards
    const rewardsRate = gaugeContract.reward_data(rewardsAddr).rate;
    const weeklyRewards = rewardsRate.times(BigInt.fromI32(604800));

    // update gauge rewards entity
    const gaugeReward = getGaugeReward(gauge, rewardsAddr, i);
    gaugeReward.amount = valueToBigDecimal(weeklyRewards, rewardDecimals);

    // add min/max annual token calculations for APR
    const maxAnnualRewards = weeklyRewards.times(
      BigInt.fromI32(EPOCHS_PER_YEAR)
    );
    const minAnnualRewards = maxAnnualRewards.times(
      BigInt.fromI32(TOKENLESS_PRODUCTION / 100)
    );
    gaugeReward.maxAnnualRewards = valueToBigDecimal(
      maxAnnualRewards,
      rewardDecimals
    );
    gaugeReward.minAnnualRewards = valueToBigDecimal(
      minAnnualRewards,
      rewardDecimals
    );

    gaugeReward.save();
  }
}

export function _updateLiquidityGaugeWeights(gauge: LiquidityGaugeV4): void {
  const gaugeControllerContract = GaugeControllerContract.bind(
    Address.fromString(DFX_GAUGE_CONTROLLER_V3)
  );
  const gaugeController = getGaugeController();
  const gaugeAddr = Address.fromString(gauge.id);

  const prevWeight = gauge.weight;

  gauge.weight = valueToBigDecimal(
    gaugeControllerContract.get_gauge_weight(gaugeAddr),
    DFX_DECIMALS
  );
  gauge.proportionalWeight = gaugeController.totalWeight.gt(ZERO_BD)
    ? gauge.weight.div(gaugeController.totalWeight)
    : ZERO_BD;

  gauge.weightDelta = gauge.weight.minus(prevWeight);
}

export function _updateRootGaugeWeights(gauge: RootGauge): void {
  const gaugeControllerContract = GaugeControllerContract.bind(
    Address.fromString(DFX_GAUGE_CONTROLLER_V3)
  );
  const gaugeController = getGaugeController();
  const gaugeAddr = Address.fromString(gauge.id);

  const prevWeight = gauge.weight;

  gauge.weight = valueToBigDecimal(
    gaugeControllerContract.get_gauge_weight(gaugeAddr),
    DFX_DECIMALS
  );
  gauge.proportionalWeight = gaugeController.totalWeight.gt(ZERO_BD)
    ? gauge.weight.div(gaugeController.totalWeight)
    : ZERO_BD;

  gauge.weightDelta = gauge.weight.minus(prevWeight);
}
