import { Address, BigInt } from "@graphprotocol/graph-ts";
import { DFX } from "../../../packages/constants";
import { Gauge } from "../generated/schema";
import { ERC20 } from "../generated/templates/Gauge/ERC20";
import {
  LiquidityGaugeV4,
  Deposit as DepositEvent,
  Withdraw as WithdrawEvent,
  Claim_rewardsCall as ClaimRewardsCall,
} from "../generated/templates/Gauge/LiquidityGaugeV4";
import { valueAsBigDecimal } from "./helpers";

function _updateRewardsBalance(gauge: Gauge): void {
  const gaugeAddr = Address.fromString(gauge.id);
  const gaugeContract = LiquidityGaugeV4.bind(gaugeAddr);

  // default reward is DFX
  // TODO: Update this if multiple rewards are added to a single gauge
  // const numRewards = gaugeContract.reward_count();
  // const rewardAddr = gaugeContract.reward_tokens(BigInt.fromI32(0));

  const rewardContract = ERC20.bind(Address.fromString(DFX));
  const rewardDecimals = BigInt.fromI32(rewardContract.decimals());
  const rewardAmount = valueAsBigDecimal(
    rewardContract.balanceOf(gaugeAddr),
    rewardDecimals
  );

  gauge.dfxBalance = rewardAmount;
}

function _updateWorkingSupply(gauge: Gauge): void {
  const gaugeAddr = Address.fromString(gauge.id);
  const gaugeContract = LiquidityGaugeV4.bind(gaugeAddr);

  const workingSupply = gaugeContract.working_supply();
  const dfxDecimals = BigInt.fromI32(18);

  gauge.workingSupply = valueAsBigDecimal(workingSupply, dfxDecimals);
}

/* -- Main -- */
/* Event Handlers */
export function handleDeposit(event: DepositEvent): void {
  const gauge = Gauge.load(event.address.toHexString());
  if (gauge) {
    const lptDecimals = BigInt.fromString("18");
    const amount = valueAsBigDecimal(event.params.value, lptDecimals);
    gauge.lptAmount = gauge.lptAmount.plus(amount);
    gauge.blockNum = event.block.number;

    _updateRewardsBalance(gauge);
    _updateWorkingSupply(gauge);

    gauge.save();
  }
}

export function handleWithdraw(event: WithdrawEvent): void {
  const gauge = Gauge.load(event.address.toHexString());
  if (gauge) {
    const lptDecimals = BigInt.fromString("18");
    const amount = valueAsBigDecimal(event.params.value, lptDecimals);
    gauge.lptAmount = gauge.lptAmount.minus(amount);
    gauge.blockNum = event.block.number;

    _updateRewardsBalance(gauge);
    _updateWorkingSupply(gauge);

    gauge.save();
  }
}

/* Call Handlers */
export function handleClaimRewards(call: ClaimRewardsCall): void {
  const gaugeAddr = call.to.toHexString();
  const gauge = Gauge.load(gaugeAddr);

  if (gauge) {
    _updateRewardsBalance(gauge);
    _updateWorkingSupply(gauge);
    gauge.save();
  }
}
