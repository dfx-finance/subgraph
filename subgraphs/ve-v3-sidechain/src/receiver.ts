import { Address } from "@graphprotocol/graph-ts";
import { GaugeRewardReceived as GaugeRewardReceivedEvent } from "../generated/ChildChainFactory/ChildChainReceiver";
import {
  getGauge,
  getGaugeReward,
  getGaugeSet,
  getReceiver,
} from "./gauge-helpers";
import { valueToBigDecimal } from "./helpers";

export function handleGaugeRewardReceived(
  event: GaugeRewardReceivedEvent
): void {
  const receiver = getReceiver(event.address);
  const gaugeSet = getGaugeSet(Address.fromString(receiver.gaugeSet));
  const gauge = getGauge(Address.fromString(gaugeSet.gauge));
  const reward = getGaugeReward(
    Address.fromString(gaugeSet.id),
    Address.fromString(gaugeSet.streamer),
    Address.fromString(gauge.id),
    event.params.token
  );

  reward.amount = reward.amount.plus(
    valueToBigDecimal(event.params.tokenAmount, 18)
  );
  reward.save();
}
