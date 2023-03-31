import { Address, BigInt } from "@graphprotocol/graph-ts";
import { DFX, DFX_GAUGE_CONTROLLER } from "../../../packages/constants";
import { Gauge, GaugeController, Pair } from "../generated/schema";
import { Curve as CurveContract } from "../generated/templates/Gauge/Curve";
import { ERC20 as ERC20Contract } from "../generated/templates/Gauge/ERC20";
import {
  LiquidityGaugeV4 as GaugeContract,
  Deposit as DepositEvent,
  Withdraw as WithdrawEvent,
  Claim_rewardsCall as ClaimRewardsCall,
} from "../generated/templates/Gauge/LiquidityGaugeV4";
import { GaugeController as GaugeControllerContract } from "../generated/templates/Gauge/GaugeController";
import { valueAsBigDecimal, ZERO_BD } from "./helpers";

// Get or create GaugeController entity with default empty state
// TODO: Move to a helpers file?
export function getPair(pairAddr: string): Pair {
  let pair = Pair.load(pairAddr);
  if (pair === null) {
    const curveContract = CurveContract.bind(Address.fromString(pairAddr));

    pair = new Pair(pairAddr);
    pair.decimals = BigInt.fromI32(curveContract.decimals());
  }
  return pair;
}
export function getGaugeController(): GaugeController {
  let gaugeController = GaugeController.load(DFX_GAUGE_CONTROLLER);
  if (gaugeController === null) {
    gaugeController = new GaugeController(DFX_GAUGE_CONTROLLER);
    gaugeController.totalWeight = ZERO_BD;
  }
  return gaugeController;
}

function _updateRewardsBalance(gauge: Gauge): void {
  const gaugeAddr = Address.fromString(gauge.id);

  // default reward is DFX
  // TODO: Update this if multiple rewards are added to a single gauge
  // const gaugeContract = LiquidityGaugeV4.bind(gaugeAddr);
  // const numRewards = gaugeContract.reward_count();
  // const rewardAddr = gaugeContract.reward_tokens(BigInt.fromI32(0));

  const rewardContract = ERC20Contract.bind(Address.fromString(DFX));
  const rewardDecimals = BigInt.fromI32(rewardContract.decimals());
  const rewardAmount = valueAsBigDecimal(
    rewardContract.balanceOf(gaugeAddr),
    rewardDecimals
  );

  gauge.dfxBalance = rewardAmount;
}

function _updateWorkingSupply(gauge: Gauge): void {
  const gaugeAddr = Address.fromString(gauge.id);
  const gaugeContract = GaugeContract.bind(gaugeAddr);

  const workingSupply = gaugeContract.working_supply();
  const dfxDecimals = BigInt.fromI32(18);

  gauge.workingSupply = valueAsBigDecimal(workingSupply, dfxDecimals);
}

function _updateTotalSupply(gauge: Gauge): void {
  const gaugeAddr = Address.fromString(gauge.id);
  const gaugeContract = GaugeContract.bind(gaugeAddr);

  const totalSupply = gaugeContract.totalSupply();
  const dfxDecimals = BigInt.fromI32(18);

  gauge.totalSupply = valueAsBigDecimal(totalSupply, dfxDecimals);
}

function _updateTotalWeight(blockNum: BigInt): void {
  const gaugeControllerContract = GaugeControllerContract.bind(
    Address.fromString(DFX_GAUGE_CONTROLLER)
  );
  const gaugeController = getGaugeController();
  const totalWeight = gaugeControllerContract.get_total_weight();
  const dfxDecimals = BigInt.fromI32(18);

  gaugeController.totalWeight = valueAsBigDecimal(totalWeight, dfxDecimals);
  gaugeController.blockNum = blockNum;
  gaugeController.save();
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
    _updateTotalSupply(gauge);

    gauge.save();
  }

  _updateTotalWeight(event.block.number);
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
    _updateTotalSupply(gauge);

    gauge.save();
  }

  _updateTotalWeight(event.block.number);
}

/* Call Handlers */
export function handleClaimRewards(call: ClaimRewardsCall): void {
  const gaugeAddr = call.to.toHexString();
  const gauge = Gauge.load(gaugeAddr);

  if (gauge) {
    _updateRewardsBalance(gauge);
    _updateWorkingSupply(gauge);
    _updateTotalSupply(gauge);
    gauge.save();
  }

  _updateTotalWeight(call.block.number);
}
