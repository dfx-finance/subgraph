import { Gauge } from "../generated/schema";
import {
  Deposit as DepositEvent,
  Withdraw as WithdrawEvent,
  Claim_rewardsCall as ClaimRewardsCall,
} from "../generated/templates/Gauge/RewardsOnlyGauge";

import { valueToBigDecimal } from "./helpers";
import {
  getGauge,
  _updateTotalSupply,
  _updateRewardsAvailable,
} from "./gauge-helpers";

// Bundles all update routines into one method
function _mirrorAttributes(gauge: Gauge): void {
  _updateRewardsAvailable(gauge);
  _updateTotalSupply(gauge);
}

export function handleDeposit(event: DepositEvent): void {
  const gauge = getGauge(event.address);
  const amount = valueToBigDecimal(event.params.value, 18);
  gauge.lptAmount = gauge.lptAmount.plus(amount);
  gauge.blockNum = event.block.number;
  _mirrorAttributes(gauge);
  gauge.save();
}

export function handleWithdraw(event: WithdrawEvent): void {
  const gauge = getGauge(event.address);
  const amount = valueToBigDecimal(event.params.value, 18);
  gauge.lptAmount = gauge.lptAmount.minus(amount);
  gauge.blockNum = event.block.number;
  _mirrorAttributes(gauge);
  gauge.save();
}

/* Call Handlers */
export function handleClaimRewards(call: ClaimRewardsCall): void {
  const gaugeAddr = call.to;
  const gauge = getGauge(gaugeAddr);
  gauge.blockNum = call.block.number;
  _mirrorAttributes(gauge);
  gauge.save();
}
