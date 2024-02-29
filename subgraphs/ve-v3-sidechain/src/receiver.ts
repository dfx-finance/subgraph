import { Address } from "@graphprotocol/graph-ts";
import { GaugeRewardReceived as GaugeRewardReceivedEvent } from "../generated/ChildChainFactory/ChildChainReceiver";
import {
  _updateRewardsAvailable,
  getGauge,
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

  // Update receiver attributes
  receiver.totalAmount = receiver.totalAmount.plus(
    valueToBigDecimal(event.params.tokenAmount, 18)
  );
  receiver.latestAmount = valueToBigDecimal(event.params.tokenAmount, 18);
  receiver.blockNum = event.block.number;

  // Update available reward amount
  _updateRewardsAvailable(gauge, event.block.timestamp);
}
