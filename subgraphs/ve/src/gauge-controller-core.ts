import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  gaugeController as GaugeController,
  NewGauge as NewGaugeEvent,
  VoteForGauge as VoteForGaugeEvent,
} from "../generated/gaugeController/gaugeController";
import { liquidityGaugeV4 as LiquidityGaugeV4 } from "../generated/gaugeController/liquidityGaugeV4";
// import { GaugeHourData, Vote } from "../generated/schema";
import { Gauge } from "../generated/schema";
import { Gauge as GaugeTemplate } from "../generated/templates";
import { ZERO_BD, ZERO_BI } from "./helpers";
// import { getGauge } from "./gauge-core";

/* -- Helpers -- */
// function getActiveGauges(
//   _controller: GaugeController,
//   _distributor: DfxDistributor
// ) {
//   const totalGauges = _controller.n_gauges().toI64();
//   let activeGauges: Address[] = [];
//   for (let i = 0; i < totalGauges; i++) {
//     const addr = _controller.gauges(BigInt.fromI64(i));
//     if (!_distributor.killedGauges(addr)) activeGauges.push(addr);
//   }
//   return activeGauges;
// }

// function writeVoteEntity(
//   _controller: GaugeController,
//   event: VoteForGaugeEvent
// ): void {
//   let voteEntity = new Vote(
//     event.transaction.hash.concatI32(event.address.toI32())
//   );

//   voteEntity.voteFor = event.params.gauge_addr;
//   voteEntity.weight = event.params.weight;

//   voteEntity.blockNumber = event.block.number;
//   voteEntity.blockTimestamp = event.block.timestamp;
//   voteEntity.transactionHash = event.transaction.hash;

//   voteEntity.save();
// }

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

// Handle creating entity with default empty state when new gauges are deployed
export function handleNewGauge(event: NewGaugeEvent): void {
  const gaugeAddr = event.params.addr;
  const gaugeContract = LiquidityGaugeV4.bind(gaugeAddr);
  let gauge = new Gauge(gaugeAddr.toHexString());

  gauge.active = true;

  // mirror from contract
  gauge.decimals = gaugeContract.decimals().toI32();
  gauge.symbol = gaugeContract.symbol();
  gauge.lpt = gaugeContract.staking_token();
  gauge.rewardCount = gaugeContract.reward_count();

  // amounts to updated via events
  gauge.lptAmount = ZERO_BI;
  gauge.totalSupply = ZERO_BD;
  gauge.workingSupply = ZERO_BI;
  gauge.dfxBalance = ZERO_BD;
  gauge.totalWeight = ZERO_BI;

  gauge.blockNumber = event.block.number;
  gauge.save();

  // start indexing the gauge
  GaugeTemplate.create(gaugeAddr);
}

// export function handleVoteForGauge(event: VoteForGaugeEvent): void {
//   const gaugeController = GaugeController.bind(event.address);

//   // // write record for vote
//   // writeVoteEntity(gaugeController, event);

//   // sum record into hourly object
//   // writeGaugesHourData(gaugeController, event);
// }
