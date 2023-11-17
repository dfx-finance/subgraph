import { Gauge } from "../generated/schema";
import { RewardsOnlyGauge as GaugeContract } from "../generated/ChildChainFactory/RewardsOnlyGauge";
import {
  Deposit as DepositEvent,
  Withdraw as WithdrawEvent,
  Claim_rewardsCall as ClaimRewardsCall,
} from "../generated/templates/Gauge/RewardsOnlyGauge";

import { valueToBigDecimal } from "./helpers";
import {
  getGauge,
  _updateDfxBalance,
  _updateTotalSupply,
  _updateRewardsAvailable,
  // _updateMinMaxApr,
} from "./gauge-helpers";

// Bundles all update routines into one method
function _mirrorAttributes(gauge: Gauge): void {
  _updateDfxBalance(gauge);
  // _updateWorkingSupply(gauge);
  _updateRewardsAvailable(gauge);
  _updateTotalSupply(gauge);
  // _updateWeights(gauge);
  // _updateMinMaxApr(gauge);
}

export function handleDeposit(event: DepositEvent): void {
  const gauge = getGauge(event.address);
  if (gauge) {
    const amount = valueToBigDecimal(event.params.value, 18);
    gauge.lptAmount = gauge.lptAmount.plus(amount);
    gauge.blockNum = event.block.number;
    _mirrorAttributes(gauge);
    gauge.save();
  }
}

export function handleWithdraw(event: WithdrawEvent): void {
  const gauge = getGauge(event.address);
  if (gauge) {
    const amount = valueToBigDecimal(event.params.value, 18);
    gauge.lptAmount = gauge.lptAmount.minus(amount);
    gauge.blockNum = event.block.number;
    _mirrorAttributes(gauge);
    gauge.save();
  }
}

/* Call Handlers */
export function handleClaimRewards(call: ClaimRewardsCall): void {
  const gaugeAddr = call.to.toHexString();
  const gauge = Gauge.load(gaugeAddr);
  if (gauge) {
    _mirrorAttributes(gauge);
    gauge.save();
  }
}
