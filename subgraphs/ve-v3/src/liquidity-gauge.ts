import { Address, BigInt } from "@graphprotocol/graph-ts";
import { DFX, DFX_GAUGE_CONTROLLER_V3 } from "../../../packages/constants";
import { LiquidityGaugeV4, GaugeReward } from "../generated/schema";
import { ERC20 as ERC20Contract } from "../generated/templates/LiquidityGaugeV4/ERC20";
import {
  LiquidityGaugeV4 as LiquidityGaugeV4Contract,
  Deposit as DepositEvent,
  Withdraw as WithdrawEvent,
  Claim_rewardsCall as ClaimRewardsCall,
} from "../generated/templates/LiquidityGaugeV4/LiquidityGaugeV4";
import { GaugeController as GaugeControllerContract } from "../generated/templates/LiquidityGaugeV4/GaugeController";
import {
  DFX_DECIMALS,
  valueToBigDecimal,
  WEEK_BI,
  ZERO_BD,
  ZERO_BI,
} from "./helpers";
import {
  _updateGaugeControllerAttributes,
  getGaugeController,
} from "./gauge-controller";

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
  }
  return gaugeReward;
}

/* -- Helpers -- */
// Update the total DFX available (unclaimed and undistributed) in gauge
function _updateDfxBalance(gauge: LiquidityGaugeV4): void {
  const gaugeAddr = Address.fromString(gauge.id);

  const dfxContract = ERC20Contract.bind(Address.fromString(DFX));
  const rewardAmount = valueToBigDecimal(dfxContract.balanceOf(gaugeAddr), 18);

  gauge.dfxBalance = rewardAmount;
}

// Update the weighted amount of veDFX provided to gauge
function _updateWorkingSupply(gauge: LiquidityGaugeV4): void {
  const gaugeAddr = Address.fromString(gauge.id);
  const gaugeContract = LiquidityGaugeV4Contract.bind(gaugeAddr);

  const workingSupply = gaugeContract.working_supply();
  const dfxDecimals = 18;

  gauge.workingSupply = valueToBigDecimal(workingSupply, dfxDecimals);
}

// Update the total amount of veDFX provided to gauge
function _updateTotalSupply(gauge: LiquidityGaugeV4): void {
  const gaugeAddr = Address.fromString(gauge.id);
  const gaugeContract = LiquidityGaugeV4Contract.bind(gaugeAddr);

  const totalSupply = gaugeContract.totalSupply();
  const dfxDecimals = 18;

  gauge.totalSupply = valueToBigDecimal(totalSupply, dfxDecimals);
}

function _updateRewardsAvailable(gauge: LiquidityGaugeV4): void {
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

export function _updateWeights(gauge: LiquidityGaugeV4): void {
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

// // DISABLED: Can be re-enabled after APR built into frontend independently to avoid confusion. This
// // would remain useful for analytics afterwards.
// //
// // Using weekly rate for DFX reward distribution gauge, price of DFX in USDC (1:1 USD/USDC assumed),
// // and USD value of lpt deposited in gauge, calculate the minimum and maximum APR
// function _updateMinMaxApr(gauge: Gauge): void {
//   const gaugeAddr = Address.fromString(gauge.id);
//   const gaugeContract = GaugeContract.bind(gaugeAddr);
//   const pair = getPair(gauge.lpt.toHexString());

//   // VE hardcoded constants (contract-side)
//   const epochsPerYear = BigInt.fromI32(52).toBigDecimal();
//   const tokenlessProduction = BigInt.fromI32(40).toBigDecimal();

//   // get gauge contract amounts
//   const workingSupply = valueToBigDecimal(gaugeContract.working_supply(), 18);
//   const weeklyRewards = _updateRewardsAvailable(gauge);

//   // get DFX/USDC price from Balancer
//   const dfxPrice = getDfxPrice();

//   if (
//     pair.reserveUSD.notEqual(ZERO_BD) &&
//     pair.supply.notEqual(ZERO_BD) &&
//     workingSupply.notEqual(ZERO_BD)
//   ) {
//     const lptPrice = pair.reserveUSD.div(pair.supply);
//     let gaugeLptValue = workingSupply.times(lptPrice);

//     const maxYearlyRewards = weeklyRewards.times(epochsPerYear);
//     const minYearlyRewards = maxYearlyRewards.times(
//       tokenlessProduction.div(BigInt.fromI32(100).toBigDecimal())
//     );
//     const minApr = minYearlyRewards.times(dfxPrice).div(gaugeLptValue);
//     const maxApr = maxYearlyRewards.times(dfxPrice).div(gaugeLptValue);
//     // gauge.minApr = minApr;
//     // gauge.maxApr = maxApr;
//   }
// }

// Bundles all update routines into one method
function _mirrorAttributes(gauge: LiquidityGaugeV4): void {
  _updateDfxBalance(gauge);
  _updateWorkingSupply(gauge);
  _updateRewardsAvailable(gauge);
  _updateTotalSupply(gauge);
  _updateWeights(gauge);
  // _updateMinMaxApr(gauge);
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

    _mirrorAttributes(gauge);
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

    _mirrorAttributes(gauge);
    gauge.save();
  }
}

/* Call Handlers */
export function handleClaimRewards(call: ClaimRewardsCall): void {
  _updateGaugeControllerAttributes(call.block.number);

  const gaugeAddr = call.to.toHexString();
  const gauge = LiquidityGaugeV4.load(gaugeAddr);

  if (gauge) {
    _mirrorAttributes(gauge);
    gauge.save();
  }
}
