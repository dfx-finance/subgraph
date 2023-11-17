import { Address } from "@graphprotocol/graph-ts";
import { GaugeSet, Streamer } from "../generated/schema";
import {
  Add_rewardCall as AddRewardCall,
  Remove_rewardCall as RemoveRewardCall,
} from "../generated/templates/Streamer/ChildChainStreamer";
import { getGaugeSet, getStreamer } from "./gauge-helpers";

/* Call Handlers */
export function handleAddReward(call: AddRewardCall): void {
  const streamerAddr = call.to;
  const streamer = getStreamer(streamerAddr);
  const gaugeSet = getGaugeSet(Address.fromString(streamer.gaugeSet));

  // if (gauge) {
  //   _mirrorAttributes(gauge);
  //   gauge.save();
  // }
}
