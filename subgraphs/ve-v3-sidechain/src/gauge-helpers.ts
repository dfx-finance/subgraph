import { Address } from "@graphprotocol/graph-ts";
import { Gauge } from "../generated/schema";
import { fetchGaugeInfo } from "./child-chain-factory";
import { ChildChainStreamer as StreamerContract } from "../generated/templates/Gauge/ChildChainStreamer";
import { RewardsOnlyGauge as GaugeContract } from "../generated/templates/Gauge/RewardsOnlyGauge";
import { ERC20 as ERC20Contract } from "../generated/templates/Gauge/ERC20";
import { valueToBigDecimal } from "./helpers";

import { DFX_L2 } from "../../../packages/constants";

// Get or create Gauge entity with default empty state
export function getGauge(gaugeAddr: string): Gauge {
  let gauge = Gauge.load(gaugeAddr);
  if (gauge === null) {
    const _addr = Address.fromString(gaugeAddr);
    const gaugeInfo = fetchGaugeInfo(_addr);

    gauge = new Gauge(gaugeAddr);
    gauge.decimals = gaugeInfo.decimals;
    gauge.name = gaugeInfo.name;
    gauge.symbol = gaugeInfo.symbol;
    gauge.totalSupply = gaugeInfo.totalSupply;
  }
  return gauge;
}

/* -- Helpers -- */
// Update the total DFX available (unclaimed and undistributed) in gauge
export function _updateDfxBalance(gauge: Gauge): void {
  const gaugeAddr = Address.fromString(gauge.id);

  const dfxContract = ERC20Contract.bind(Address.fromString(DFX_L2));
  const rewardAmount = valueToBigDecimal(dfxContract.balanceOf(gaugeAddr), 18);

  gauge.dfxBalance = rewardAmount;
}

// Update the total amount of veDFX provided to gauge
export function _updateTotalSupply(gauge: Gauge): void {
  const gaugeAddr = Address.fromString(gauge.id);
  const gaugeContract = GaugeContract.bind(gaugeAddr);

  const totalSupply = gaugeContract.totalSupply();
  const dfxDecimals = 18;

  gauge.totalSupply = valueToBigDecimal(totalSupply, dfxDecimals);
}

function _updateRewardsAvailable(gauge: Gauge): void {
  const gaugeAddr = Address.fromString(gauge.id);

  // iterate and update each gauge reward
  const gaugeContract = GaugeContract.bind(gaugeAddr);
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
    const weeklyRewards = valueToBigDecimal(
      rewardsRate.times(BigInt.fromI32(604800)),
      rewardDecimals
    );

    // update gauge rewards entity
    const gaugeReward = getGaugeReward(gauge, rewardsAddr, i);
    gaugeReward.amount = weeklyRewards;
    gaugeReward.save();
  }
}
