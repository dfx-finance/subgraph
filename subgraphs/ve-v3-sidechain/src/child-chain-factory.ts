import { Address } from "@graphprotocol/graph-ts";
import { Registered as RegisteredEvent } from "../generated/ChildChainFactory/ChildChainFactory";
import {
  Gauge as GaugeTemplate,
  Receiver as ReceiverTemplate,
} from "../generated/templates";

import {
  addAllGaugeRewards,
  getGauge,
  getGaugeSet,
  getReceiver,
  getStreamer,
} from "./gauge-helpers";

export function handleNewGaugeSet(event: RegisteredEvent): void {
  // create parent mapping
  let gaugeSet = getGaugeSet(event.params.rootGauge);

  // create child mappings -- receiver
  const receiver = getReceiver(event.params.receiver);
  receiver.gaugeSet = gaugeSet.id;
  receiver.blockNum = event.block.number;
  receiver.save();

  // create child mappings -- streamer
  const streamer = getStreamer(event.params.streamer);
  streamer.gaugeSet = gaugeSet.id;
  streamer.blockNum = event.block.number;
  streamer.save();

  // create child mappings -- gauge
  const gauge = getGauge(event.params.childGauge);
  gauge.gaugeSet = gaugeSet.id;
  gauge.blockNum = event.block.number;
  gauge.save();

  // add entities and mappings for all starting gauge rewards
  addAllGaugeRewards(
    event.params.rootGauge,
    Address.fromString(gauge.id),
    Address.fromString(streamer.id)
  );

  // create relations on parent
  gaugeSet.factory = event.address.toHexString();
  gaugeSet.receiver = receiver.id;
  gaugeSet.streamer = streamer.id;
  gaugeSet.gauge = gauge.id;
  gaugeSet.save();

  ReceiverTemplate.create(event.params.receiver);
  GaugeTemplate.create(event.params.childGauge);
}
