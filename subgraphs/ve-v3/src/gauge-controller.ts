import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  GaugeController as GaugeControllerContract,
  NewGauge as NewGaugeEvent,
  VoteForGauge as VoteForGaugeEvent,
} from "../generated/GaugeController/GaugeController";
import { LiquidityGaugeV4 as LiquidityGaugeV4Contract } from "../generated/GaugeController/LiquidityGaugeV4";
import { CcipRootGauge as RootGaugeContract } from "../generated/GaugeController/CcipRootGauge";
import {
  LiquidityGaugeV4,
  RootGauge,
  GaugeController,
  GaugeReward,
} from "../generated/schema";
import { LiquidityGaugeV4 as LiquidityGaugeV4Template } from "../generated/templates";
import { getToken } from "./curve-helpers";
import {
  DFX_DECIMALS,
  ONE_BI,
  TWO_BI,
  ZERO_BD,
  ZERO_BI,
  valueToBigDecimal,
} from "./helpers";
import { DFX_GAUGE_CONTROLLER_V3 } from "../../../packages/constants";
import {
  _updateLiquidityGaugeWeights,
  _updateRootGaugeWeights,
} from "./gauge-helpers";

/* -- Helpers -- */
export function getGaugeController(): GaugeController {
  let gaugeController = GaugeController.load(DFX_GAUGE_CONTROLLER_V3);
  if (gaugeController === null) {
    gaugeController = new GaugeController(DFX_GAUGE_CONTROLLER_V3);
    gaugeController.totalWeight = ZERO_BD;
    gaugeController.timeTotal = ZERO_BI;
  }
  return gaugeController;
}

export function getActiveGauges(gaugeControllerAddr: Address): Address[] {
  const gaugeControllerContract = GaugeControllerContract.bind(
    gaugeControllerAddr
  );
  const numGauges = gaugeControllerContract.n_gauges();

  let activeAddrs: Address[] = [];
  for (let i = BigInt.fromI32(0); i.lt(numGauges); i = i.plus(ONE_BI)) {
    const gaugeAddr = gaugeControllerContract.gauges(i);
    const mainnetGauge = LiquidityGaugeV4.load(gaugeAddr.toHexString());
    if (mainnetGauge && mainnetGauge.active === true) {
      activeAddrs.push(gaugeAddr);
    }
    const rootGauge = RootGauge.load(gaugeAddr.toHexString());
    if (rootGauge && rootGauge.active === true) {
      activeAddrs.push(gaugeAddr);
    }
  }
  return activeAddrs;
}

// Update the total voting weight available to all gauges
export function _updateGaugeControllerAttributes(blockNum: BigInt): void {
  const gaugeControllerAddr = Address.fromString(DFX_GAUGE_CONTROLLER_V3);
  const gaugeControllerContract = GaugeControllerContract.bind(
    gaugeControllerAddr
  );
  const gaugeController = getGaugeController();

  // iterate active gauges to sum total weight
  let _totalWeight = ZERO_BD;
  const gaugeAddrs = getActiveGauges(gaugeControllerAddr);
  for (let i = 0; i < gaugeAddrs.length; i++) {
    const _gaugeWeight = valueToBigDecimal(
      gaugeControllerContract.get_gauge_weight(gaugeAddrs[i]),
      18
    );
    _totalWeight = _totalWeight.plus(_gaugeWeight);
  }
  gaugeController.totalWeight = _totalWeight;
  gaugeController.timeTotal = gaugeControllerContract.time_total();
  gaugeController.blockNum = blockNum;
  gaugeController.save();
}

function _addLiquidityGaugeV4(event: NewGaugeEvent): void {
  // create Gauge
  const gaugeController = getGaugeController();
  const gaugeAddr = event.params.addr;
  const gaugeContract = LiquidityGaugeV4Contract.bind(gaugeAddr);

  let gauge = new LiquidityGaugeV4(gaugeAddr.toHexString());

  gauge.gaugeController = gaugeController.id;
  gauge.active = true;

  gauge.weight = ZERO_BD;
  gauge.proportionalWeight = ZERO_BD;

  // mirror from GaugeContract
  gauge.decimals = gaugeContract.decimals().toI32();
  gauge.symbol = gaugeContract.symbol();
  gauge.lpt = gaugeContract.staking_token();
  gauge.rewardCount = gaugeContract.reward_count().toI32();

  // amounts to updated via events
  gauge.lptAmount = ZERO_BD;
  gauge.workingSupply = ZERO_BD;
  gauge.totalSupply = ZERO_BD;
  gauge.dfxBalance = ZERO_BD;

  // amounts calculated from previous values
  gauge.startProportionalWeight = ZERO_BD;
  gauge.weightDelta = ZERO_BD;

  gauge.blockNum = event.block.number;
  gauge.save();

  // create entity for each reward available on gauge
  for (let i: i32 = 0; i < gauge.rewardCount; i++) {
    const rewardAddr = gaugeContract.reward_tokens(BigInt.fromI32(i));
    // get or create token for reward
    const token = getToken(rewardAddr.toHexString());
    // create reward entity
    let gaugeReward = new GaugeReward(gauge.id + "-" + i.toString());
    gaugeReward.gauge = gauge.id;
    gaugeReward.token = token.id;
    gaugeReward.amount = ZERO_BD;
    gaugeReward.minAnnualRewards = ZERO_BD;
    gaugeReward.maxAnnualRewards = ZERO_BD;
    gaugeReward.save();
  }
}

function _addRootGauge(event: NewGaugeEvent): void {
  const gaugeControllerContract = GaugeControllerContract.bind(event.address);
  const gaugeController = getGaugeController();
  const gaugeAddr = event.params.addr;
  const gaugeContract = RootGaugeContract.bind(gaugeAddr);

  let gauge = new RootGauge(gaugeAddr.toHexString());

  gauge.gaugeController = gaugeController.id;
  gauge.active = true;

  // mirror from GaugeController contract
  gauge.weight = valueToBigDecimal(
    gaugeControllerContract.get_gauge_weight(gaugeAddr),
    DFX_DECIMALS
  );
  gauge.proportionalWeight = gaugeController.totalWeight.gt(ZERO_BD)
    ? gauge.weight.div(gaugeController.totalWeight)
    : ZERO_BD;

  gauge.symbol = gaugeContract.symbol();
  gauge.reward = gaugeContract.DFX().toHexString();

  // amounts calculated from previous values
  gauge.startProportionalWeight = ZERO_BD;
  gauge.weightDelta = ZERO_BD;

  gauge.destination = Address.fromI32(0).toHexString();
  gauge.network = 0;

  gauge.blockNum = event.block.number;
  gauge.save();
}

function _updateAllGaugeWeights(gaugeControllerAddr: Address): void {
  const gaugeAddrs = getActiveGauges(gaugeControllerAddr);
  for (let i = 0; i < gaugeAddrs.length; i++) {
    const mainnetGauge = LiquidityGaugeV4.load(gaugeAddrs[i].toHexString());
    if (mainnetGauge) {
      _updateLiquidityGaugeWeights(mainnetGauge);
      mainnetGauge.save();
    }
    const l2Gauge = RootGauge.load(gaugeAddrs[i].toHexString());
    if (l2Gauge) {
      _updateRootGaugeWeights(l2Gauge);
      l2Gauge.save();
    }
  }
}

/* -- Main -- */
/* Event Handlers */
// Handle creating entity with default empty state when new gauges are deployed
export function handleNewGauge(event: NewGaugeEvent): void {
  _updateGaugeControllerAttributes(event.block.number);

  // create mainnet gauge and start indexing
  if (event.params.gauge_type == ZERO_BI) {
    _addLiquidityGaugeV4(event);
    LiquidityGaugeV4Template.create(event.params.addr); //
  }
  // create sidechain gauge
  // no need to index, tracked by sidechain subgraph
  else if (event.params.gauge_type == TWO_BI) {
    _addRootGauge(event);
  }

  // Update all weights on gauges to consider newly added gauge
  _updateAllGaugeWeights(event.address);
}

// On every vote, update all gauges weights, relative weights, time weights, and time totals
export function handleVoteForGauge(event: VoteForGaugeEvent): void {
  _updateGaugeControllerAttributes(event.block.number);
  _updateAllGaugeWeights(event.address);
}
