import { Address } from "@graphprotocol/graph-ts";
import { LiquidityGaugeV4, GaugeReward } from "../generated/schema";
import { ZERO_BD } from "./helpers";

export function getGaugeReward(
  gauge: LiquidityGaugeV4,
  rewardAddr: Address,
  rewardIdx: i32
): GaugeReward {
  const rewardId = gauge.id + "-" + rewardIdx.toString();
  let gaugeReward = GaugeReward.load(rewardId);
  if (gaugeReward === null) {
    gaugeReward = new GaugeReward(rewardId);
    gaugeReward.gauge = gauge.id;
    gaugeReward.token = rewardAddr.toHexString();
    gaugeReward.amount = ZERO_BD;
    gaugeReward.minAnnualRewards = ZERO_BD;
    gaugeReward.maxAnnualRewards = ZERO_BD;
  }
  return gaugeReward;
}
