import { NewGauge as NewGaugeEvent } from "../generated/GaugeController/GaugeController";
import { LiquidityGaugeV4 as GaugeContract } from "../generated/GaugeController/LiquidityGaugeV4";
import { Gauge } from "../generated/schema";
import { Gauge as GaugeTemplate } from "../generated/templates";
import { ZERO_BD } from "./helpers";

/* -- Helpers -- */
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
  const gaugeAddr = event.params.addr;
  const gaugeContract = GaugeContract.bind(gaugeAddr);
  let gauge = new Gauge(gaugeAddr.toHexString());

  gauge.active = true;

  // mirror from contract
  gauge.decimals = gaugeContract.decimals().toI32();
  gauge.symbol = gaugeContract.symbol();
  gauge.lpt = gaugeContract.staking_token();
  gauge.rewardCount = gaugeContract.reward_count();

  // amounts to updated via events
  gauge.lptAmount = ZERO_BD;
  gauge.workingSupply = ZERO_BD;
  gauge.totalSupply = ZERO_BD;
  gauge.dfxBalance = ZERO_BD;

  gauge.blockNum = event.block.number;
  gauge.save();

  // start indexing the gauge
  GaugeTemplate.create(gaugeAddr);
}
