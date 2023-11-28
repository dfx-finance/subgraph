import { LiquidityGaugeV4 } from "../generated/schema";
import {
  Deposit as DepositEvent,
  Withdraw as WithdrawEvent,
  Claim_rewardsCall as ClaimRewardsCall,
} from "../generated/templates/LiquidityGaugeV4/LiquidityGaugeV4";
import { _updateGaugeControllerAttributes } from "./gauge-controller";
import {
  _updateDfxBalance,
  _updateLiquidityGaugeWeights,
  _updateRewardsAvailable,
  _updateTotalSupply,
  _updateWorkingSupply,
} from "./gauge-helpers";
import { valueToBigDecimal } from "./helpers";

// Bundles all update routines into one method
export function _mirrorLiquidityGaugeAttributes(gauge: LiquidityGaugeV4): void {
  _updateDfxBalance(gauge);
  _updateWorkingSupply(gauge);
  _updateRewardsAvailable(gauge);
  _updateTotalSupply(gauge);
  _updateLiquidityGaugeWeights(gauge);
}

/* -- Main -- */
/* Event Handlers */
export function handleDeposit(event: DepositEvent): void {
  _updateGaugeControllerAttributes(event.block.number); // must be updated first for gauge calcs

  const gauge = LiquidityGaugeV4.load(event.address.toHexString());
  if (gauge) {
    const lptDecimals = 18;
    const amount = valueToBigDecimal(event.params.value, lptDecimals);
    gauge.lptAmount = gauge.lptAmount.plus(amount);
    gauge.blockNum = event.block.number;

    _mirrorLiquidityGaugeAttributes(gauge);
    gauge.save();
  }
}

export function handleWithdraw(event: WithdrawEvent): void {
  _updateGaugeControllerAttributes(event.block.number);

  const gauge = LiquidityGaugeV4.load(event.address.toHexString());
  if (gauge) {
    const lptDecimals = 18;
    const amount = valueToBigDecimal(event.params.value, lptDecimals);
    gauge.lptAmount = gauge.lptAmount.minus(amount);
    gauge.blockNum = event.block.number;

    _mirrorLiquidityGaugeAttributes(gauge);
    gauge.save();
  }
}

/* Call Handlers */
export function handleClaimRewards(call: ClaimRewardsCall): void {
  _updateGaugeControllerAttributes(call.block.number);

  const gaugeAddr = call.to.toHexString();
  const gauge = LiquidityGaugeV4.load(gaugeAddr);

  if (gauge) {
    _mirrorLiquidityGaugeAttributes(gauge);
    gauge.save();
  }
}
