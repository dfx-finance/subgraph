import { BigInt } from "@graphprotocol/graph-ts";
import {
  gaugeController as GaugeController,
  VoteForGauge as VoteForGaugeEvent,
} from "../generated/gaugeController/gaugeController";
import { GaugeHourData, Vote } from "../generated/schema";
import { ZERO_BI } from "./helpers";
import { getGauge } from "./gauge-core";

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

function writeVoteEntity(
  _controller: GaugeController,
  event: VoteForGaugeEvent
) {
  let voteEntity = new Vote(
    event.transaction.hash.concatI32(event.address.toI32())
  );

  voteEntity.voteFor = event.params.gauge_addr;
  voteEntity.weight = event.params.weight;

  voteEntity.blockNumber = event.block.number;
  voteEntity.blockTimestamp = event.block.timestamp;
  voteEntity.transactionHash = event.transaction.hash;

  voteEntity.save();
}

function writeGaugesHourData(
  gaugeController: GaugeController,
  event: VoteForGaugeEvent
) {
  const timestamp = event.block.timestamp.toI32();
  const hourIndex = timestamp / 3600;
  const hourStartUnix = hourIndex * 3600;
  const hourGaugeWeightID = event.address
    .toHexString()
    .concat("-")
    .concat(BigInt.fromI32(hourIndex).toString());

  // load or create Gauge
  const gauge = getGauge(event.params.gauge_addr);

  // create default record
  let gaugeHourData = GaugeHourData.load(hourGaugeWeightID);
  if (gaugeHourData === null) {
    gaugeHourData = new GaugeHourData(hourGaugeWeightID);
    gaugeHourData.hourStartUnix = hourStartUnix;
    gaugeHourData.gauge = gauge.id;
    gaugeHourData.lptAmount = ZERO_BI;
    gaugeHourData.weight = ZERO_BI;
    gaugeHourData.relativeWeight = ZERO_BI;
    gaugeHourData.totalWeight = ZERO_BI;
  }

  // update every vote
  const weight = gaugeController.get_gauge_weight(gauge.address);
  const relativeWeight = gaugeController.gauge_relative_weight(gauge.address);
  gaugeHourData.weight = gaugeHourData.weight; // TODO: plus(weight) here?
  gaugeHourData.relativeWeight = relativeWeight;

  // always keep latest data
  gaugeHourData.lptAmount = gauge.lptAmount;
  gaugeHourData.totalWeight = gauge.totalWeight;

  gaugeHourData.save();
}

/* -- Main -- */
export function handleVoteForGauge(event: VoteForGaugeEvent): void {
  const gaugeController = GaugeController.bind(event.address);

  // write record for vote
  writeVoteEntity(gaugeController, event);

  // sum record into hourly object
  writeGaugesHourData(gaugeController, event);
}
