import { Address, BigInt } from "@graphprotocol/graph-ts";
import { DFX, DFX_GAUGE_CONTROLLER } from "../../../packages/constants";
import { Gauge, GaugeController, Pair } from "../generated/schema";
import { ERC20 as ERC20Contract } from "../generated/templates/Gauge/ERC20";
import {
  LiquidityGaugeV4 as GaugeContract,
  Deposit as DepositEvent,
  Withdraw as WithdrawEvent,
  Claim_rewardsCall as ClaimRewardsCall,
} from "../generated/templates/Gauge/LiquidityGaugeV4";
import { GaugeController as GaugeControllerContract } from "../generated/templates/Gauge/GaugeController";
import { valueToBigDecimal, ZERO_BD } from "./helpers";
import { getDfxPrice } from "./gauge-helpers";
import { getPair } from "./curve-helpers";

// Get or create GaugeController entity with default empty state
// TODO: Move to a helpers file?
export function getGaugeController(): GaugeController {
  let gaugeController = GaugeController.load(DFX_GAUGE_CONTROLLER);
  if (gaugeController === null) {
    gaugeController = new GaugeController(DFX_GAUGE_CONTROLLER);
    gaugeController.totalWeight = ZERO_BD;
  }
  return gaugeController;
}

/* -- Helpers -- */
function _updateRewardsBalance(gauge: Gauge): void {
  const gaugeAddr = Address.fromString(gauge.id);

  // default reward is DFX
  // TODO: Update this if multiple rewards are added to a single gauge
  // const gaugeContract = LiquidityGaugeV4.bind(gaugeAddr);
  // const numRewards = gaugeContract.reward_count();
  // const rewardAddr = gaugeContract.reward_tokens(BigInt.fromI32(0));

  const rewardContract = ERC20Contract.bind(Address.fromString(DFX));
  const rewardDecimals = rewardContract.decimals();
  const rewardAmount = valueToBigDecimal(
    rewardContract.balanceOf(gaugeAddr),
    rewardDecimals
  );

  gauge.dfxBalance = rewardAmount;
}

function _updateWorkingSupply(gauge: Gauge): void {
  const gaugeAddr = Address.fromString(gauge.id);
  const gaugeContract = GaugeContract.bind(gaugeAddr);

  const workingSupply = gaugeContract.working_supply();
  const dfxDecimals = 18;

  gauge.workingSupply = valueToBigDecimal(workingSupply, dfxDecimals);
}

function _updateTotalSupply(gauge: Gauge): void {
  const gaugeAddr = Address.fromString(gauge.id);
  const gaugeContract = GaugeContract.bind(gaugeAddr);

  const totalSupply = gaugeContract.totalSupply();
  const dfxDecimals = 18;

  gauge.totalSupply = valueToBigDecimal(totalSupply, dfxDecimals);
}

function _updateTotalWeight(blockNum: BigInt): void {
  const gaugeControllerContract = GaugeControllerContract.bind(
    Address.fromString(DFX_GAUGE_CONTROLLER)
  );
  const gaugeController = getGaugeController();
  const totalWeight = gaugeControllerContract.get_total_weight();
  const dfxDecimals = 18;

  gaugeController.totalWeight = valueToBigDecimal(totalWeight, dfxDecimals);
  gaugeController.blockNum = blockNum;
  gaugeController.save();
}

function _updateMinMaxApr(gauge: Gauge): void {
  const gaugeAddr = Address.fromString(gauge.id);
  const gaugeContract = GaugeContract.bind(gaugeAddr);
  const rewardContract = ERC20Contract.bind(Address.fromString(DFX));
  const rewardDecimals = rewardContract.decimals();
  const pair = getPair(gauge.lpt.toHexString());

  // VE hardcoded constants (contract-side)
  const epochsPerYear = BigInt.fromI32(52).toBigDecimal();
  const tokenlessProduction = BigInt.fromI32(40).toBigDecimal();

  // get gauge contract amounts
  const workingSupply = gaugeContract.working_supply().toBigDecimal();
  const availableRewards = valueToBigDecimal(
    rewardContract.balanceOf(gaugeAddr),
    rewardDecimals
  );

  // get prices
  const dfxPrice = getDfxPrice();

  if (
    pair.reserveUSD.notEqual(ZERO_BD) &&
    pair.supply.notEqual(ZERO_BD) &&
    workingSupply.notEqual(ZERO_BD)
  ) {
    const lptPrice = pair.reserveUSD.div(pair.supply);
    let gaugeLptValue = workingSupply.times(lptPrice);

    const maxYearlyRewards = availableRewards.times(epochsPerYear);
    const minYearlyRewards = maxYearlyRewards.times(
      tokenlessProduction.div(BigInt.fromI32(100).toBigDecimal())
    );
    const minApr = minYearlyRewards.times(dfxPrice).div(gaugeLptValue);
    const maxApr = maxYearlyRewards.times(dfxPrice).div(gaugeLptValue);
    gauge.minApr = minApr;
    gauge.maxApr = maxApr;
  }
}

function _mirrorAttributes(gauge: Gauge): void {
  _updateRewardsBalance(gauge);
  _updateWorkingSupply(gauge);
  _updateTotalSupply(gauge);
  _updateMinMaxApr(gauge);
}

/* -- Main -- */
/* Event Handlers */
export function handleDeposit(event: DepositEvent): void {
  const gauge = Gauge.load(event.address.toHexString());
  if (gauge) {
    const lptDecimals = 18;
    const amount = valueToBigDecimal(event.params.value, lptDecimals);
    gauge.lptAmount = gauge.lptAmount.plus(amount);
    gauge.blockNum = event.block.number;

    _mirrorAttributes(gauge);
    gauge.save();
  }

  _updateTotalWeight(event.block.number);
}

export function handleWithdraw(event: WithdrawEvent): void {
  const gauge = Gauge.load(event.address.toHexString());
  if (gauge) {
    const lptDecimals = 18;
    const amount = valueToBigDecimal(event.params.value, lptDecimals);
    gauge.lptAmount = gauge.lptAmount.minus(amount);
    gauge.blockNum = event.block.number;

    _mirrorAttributes(gauge);
    gauge.save();
  }

  _updateTotalWeight(event.block.number);
}

/* Call Handlers */
export function handleClaimRewards(call: ClaimRewardsCall): void {
  const gaugeAddr = call.to.toHexString();
  const gauge = Gauge.load(gaugeAddr);

  if (gauge) {
    _mirrorAttributes(gauge);
    gauge.save();
  }

  _updateTotalWeight(call.block.number);
}
