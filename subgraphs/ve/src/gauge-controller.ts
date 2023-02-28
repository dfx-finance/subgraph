import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  gaugeController,
  VoteForGauge as VoteForGaugeEvent,
  NewGauge as NewGaugeEvent,
  KilledGauge as KilledGaugeEvent,
} from "../generated/gaugeController/gaugeController";
import { dfxDistributor } from "../generated/dfxDistributor/dfxDistributor";
import { Vote, GaugeWeight } from "../generated/schema";
import { Addresses } from "./helpers";

export function handleVoteForGauge(event: VoteForGaugeEvent): void {
  const GaugeController = gaugeController.bind(event.address);
  const DfxDistributor = dfxDistributor.bind(Addresses.DFX_DISTRIBUTOR);

  // get all active gauges
  const totalGauges = GaugeController.n_gauges().toI64();
  let activeGauges: Address[] = [];
  for (let i = 0; i < totalGauges; i++) {
    const addr = GaugeController.gauges(BigInt.fromI64(i));
    if (!DfxDistributor.killedGauges(addr)) activeGauges.push(addr);
  }

  let voteEntity = new Vote(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  voteEntity.totalWeight = GaugeController.get_total_weight();

  voteEntity.voteFor = event.params.gauge_addr;
  voteEntity.weight = event.params.weight;

  voteEntity.blockNumber = event.block.number;
  voteEntity.blockTimestamp = event.block.timestamp;
  voteEntity.transactionHash = event.transaction.hash;

  voteEntity.save();

  for (let i = 0; i < activeGauges.length; i++) {
    const addr = activeGauges[i];
    const weight = GaugeController.get_gauge_weight(addr);
    let gaugeWeightEntity = new GaugeWeight(
      event.transaction.hash.concatI32(event.logIndex.toI32() + i + 1)
    );
    gaugeWeightEntity.gauge = addr;
    gaugeWeightEntity.weight = weight;
    gaugeWeightEntity.vote = event.transaction.hash.concatI32(
      event.logIndex.toI32()
    );
    gaugeWeightEntity.save();
  }
}
