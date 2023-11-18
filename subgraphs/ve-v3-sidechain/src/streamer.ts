import { Address } from "@graphprotocol/graph-ts";
import { GaugeSet, Streamer } from "../generated/schema";
import {
  Add_rewardCall as AddRewardCall,
  Remove_rewardCall as RemoveRewardCall,
} from "../generated/templates/Streamer/ChildChainStreamer";
import { getGaugeSet, getStreamer, getGaugeReward } from "./gauge-helpers";

/* Call Handlers */
export function handleAddReward(call: AddRewardCall): void {
  const streamerAddr = call.to;
  const streamer = getStreamer(streamerAddr);
  const gaugeSet = getGaugeSet(Address.fromString(streamer.gaugeSet));

  const reward = getGaugeReward(
    Address.fromString(gaugeSet.id),
    streamerAddr,
    Address.fromString(gaugeSet.gauge),
    call.inputs._token
  );
  reward.active = true;
  reward.save();
}

export function handleRemoveReward(call: RemoveRewardCall): void {
  const streamerAddr = call.to;
  const streamer = getStreamer(streamerAddr);
  const gaugeSet = getGaugeSet(Address.fromString(streamer.gaugeSet));

  const reward = getGaugeReward(
    Address.fromString(gaugeSet.id),
    streamerAddr,
    Address.fromString(gaugeSet.gauge),
    call.inputs._token
  );
  reward.active = false;
  reward.save();
}
