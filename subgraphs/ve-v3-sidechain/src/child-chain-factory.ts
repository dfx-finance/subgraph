import { Registered as RegisteredEvent } from "../generated/ChildChainFactory/ChildChainFactory";
import {
  Gauge as GaugeTemplate,
  Receiver as ReceiverTemplate,
} from "../generated/templates";

import {
  getGauge,
  getGaugeSet,
  getReceiver,
  getStreamer,
} from "./gauge-helpers";

export function handleNewGaugeSet(event: RegisteredEvent): void {
  // create parent mapping
  const gaugeSet = getGaugeSet(event.params.rootGauge);
  gaugeSet.factory = event.address.toHexString();
  gaugeSet.receiver = event.params.receiver.toHexString();
  gaugeSet.streamer = event.params.streamer.toHexString();
  gaugeSet.gauge = event.params.childGauge.toHexString();

  // create child mappings -- receiver
  const receiver = getReceiver(event.address);
  receiver.gaugeSet = gaugeSet.id;
  receiver.save();

  // create child mappings -- streamer
  const streamer = getStreamer(event.params.streamer);
  streamer.gaugeSet = gaugeSet.id;
  streamer.save();

  // create child mappings -- gauge
  const gauge = getGauge(event.params.childGauge);
  gauge.gaugeSet = gaugeSet.id;
  gauge.save();

  // create relations on parent
  gaugeSet.receiver = receiver.id;
  gaugeSet.streamer = streamer.id;
  gaugeSet.gauge = gauge.id;
  gaugeSet.save();

  ReceiverTemplate.create(event.params.receiver);
  GaugeTemplate.create(event.params.childGauge);
}
