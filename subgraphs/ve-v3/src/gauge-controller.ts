import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import {
  GaugeController as GaugeControllerContract,
  NewGauge as NewGaugeEvent,
  VoteForGauge as VoteForGaugeEvent,
} from "../generated/GaugeController/GaugeController";
// import { LiquidityGaugeV4 as GaugeContract } from "../generated/GaugeController/LiquidityGaugeV4";
import { Gauge, GaugeController, GaugeReward } from "../generated/schema";
// import { Gauge as GaugeTemplate } from "../generated/templates";
// import { getToken } from "./curve-helpers";
import {
  DFX_DECIMALS,
  ONE_BI,
  ZERO_BD,
  ZERO_BI,
  valueToBigDecimal,
} from "./helpers";
import { DFX_GAUGE_CONTROLLER } from "../../../packages/constants";
// import { _updateWeights } from "./gauge";

/* -- Helpers -- */
export function getGaugeController(): GaugeController {
  let gaugeController = GaugeController.load(DFX_GAUGE_CONTROLLER);
  if (gaugeController === null) {
    gaugeController = new GaugeController(DFX_GAUGE_CONTROLLER);
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
    const gauge = Gauge.load(gaugeAddr.toHexString());
    if (gauge && gauge.active === true) {
      activeAddrs.push(gaugeAddr);
    }
  }
  return activeAddrs;
}

// Update the total voting weight available to all gauges
export function _updateGaugeControllerAttributes(blockNum: BigInt): void {
  const gaugeControllerAddr = Address.fromString(DFX_GAUGE_CONTROLLER);
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

// function writeGaugesHourData(
//   gaugeController: GaugeController,
//   event: VoteForGaugeEvent
// ): void {
//   const timestamp = event.block.timestamp.toI32();
//   const hourIndex = timestamp / 3600;
//   const hourStartUnix = hourIndex * 3600;
//   const hourGaugeWeightID = event.address
//     .toHexString()
//     .concat("-")
//     .concat(BigInt.fromI32(hourIndex).toString());

//   // load or create Gauge
//   const gauge = getGauge(event.params.gauge_addr);
//   const gaugeAddr = Address.fromBytes(gauge.address);

//   // create default record
//   let gaugeHourData = GaugeHourData.load(hourGaugeWeightID);
//   if (gaugeHourData === null) {
//     gaugeHourData = new GaugeHourData(hourGaugeWeightID);
//     gaugeHourData.hourStartUnix = hourStartUnix;
//     gaugeHourData.gauge = gauge.id;
//     gaugeHourData.lptAmount = ZERO_BI;
//     gaugeHourData.weight = ZERO_BI;
//     gaugeHourData.relativeWeight = ZERO_BI;
//     gaugeHourData.totalWeight = ZERO_BI;
//   }

//   // update every vote
//   const weight = gaugeController.get_gauge_weight(gaugeAddr);
//   const relativeWeight = gaugeController.gauge_relative_weight(gaugeAddr);
//   gaugeHourData.weight = gaugeHourData.weight; // TODO: plus(weight) here?
//   gaugeHourData.relativeWeight = relativeWeight;

//   // always keep latest data
//   gaugeHourData.lptAmount = gauge.lptAmount;
//   gaugeHourData.totalWeight = gauge.totalWeight;

//   gaugeHourData.save();
// }

/* -- Main -- */
/* Event Handlers */
// Handle creating entity with default empty state when new gauges are deployed
export function handleNewGauge(event: NewGaugeEvent): void {
  //   _updateGaugeControllerAttributes(event.block.number);
  //   // create Gauge
  //   const gaugeControllerContract = GaugeControllerContract.bind(event.address);
  //   const gaugeController = getGaugeController();
  //   const gaugeAddr = event.params.addr;
  //   const gaugeContract = GaugeContract.bind(gaugeAddr);
  //   let gauge = new Gauge(gaugeAddr.toHexString());
  //   gauge.gaugeController = event.address.toHexString();
  //   gauge.active = true;
  //   // mirror from GaugeController contract
  //   gauge.weight = valueToBigDecimal(
  //     gaugeControllerContract.get_gauge_weight(gaugeAddr),
  //     DFX_DECIMALS
  //   );
  //   gauge.proportionalWeight = gaugeController.totalWeight.gt(ZERO_BD)
  //     ? gauge.weight.div(gaugeController.totalWeight)
  //     : ZERO_BD;
  //   // mirror from GaugeContract
  //   gauge.decimals = gaugeContract.decimals().toI32();
  //   gauge.symbol = gaugeContract.symbol();
  //   gauge.lpt = gaugeContract.staking_token();
  //   gauge.rewardCount = gaugeContract.reward_count().toI32();
  //   // amounts to updated via events
  //   gauge.lptAmount = ZERO_BD;
  //   gauge.workingSupply = ZERO_BD;
  //   gauge.totalSupply = ZERO_BD;
  //   gauge.dfxBalance = ZERO_BD;
  //   // amounts calculated from previous values
  //   gauge.startProportionalWeight = ZERO_BD;
  //   gauge.weightDelta = ZERO_BD;
  //   gauge.blockNum = event.block.number;
  //   gauge.save();
  //   // create entity for each reward available on gauge
  //   for (let i: i32 = 0; i < gauge.rewardCount; i++) {
  //     const rewardAddr = gaugeContract.reward_tokens(BigInt.fromI32(i));
  //     // get or create token for reward
  //     const token = getToken(rewardAddr.toHexString());
  //     // create reward entity
  //     let gaugeReward = new GaugeReward(gauge.id + "-" + i.toString());
  //     gaugeReward.gauge = gauge.id;
  //     gaugeReward.token = token.id;
  //     gaugeReward.amount = ZERO_BD;
  //     gaugeReward.save();
  //   }
  //   // start indexing the gauge
  //   GaugeTemplate.create(gaugeAddr);
}

// // On every vote, update all gauges weights, relative weights, time weights, and time totals
// export function handleVoteForGauge(event: VoteForGaugeEvent): void {
//   _updateGaugeControllerAttributes(event.block.number);

//   const gaugeAddrs = getActiveGauges(event.address);
//   for (let i = 0; i < gaugeAddrs.length; i++) {
//     const gauge = Gauge.load(gaugeAddrs[i].toHexString());
//     if (gauge) {
//       _updateWeights(gauge);
//       gauge.save();
//     }
//   }
// }
