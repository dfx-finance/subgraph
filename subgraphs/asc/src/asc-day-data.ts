import { BigInt, ethereum } from "@graphprotocol/graph-ts";

import { ZERO_BD } from "./helpers";

import { DFX_CADC_PROXY } from "../../../packages/constants/index";

import { ASCDayData, ASC } from "../generated/schema";

export function updateASCDayData(event: ethereum.Event): ASCDayData {
  let asc = ASC.load(DFX_CADC_PROXY);
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
  let dayPairID = event.address
    .toHexString()
    .concat("-")
    .concat(BigInt.fromI32(dayID).toString());

  let acsDayData = ASCDayData.load(dayPairID);
  if (acsDayData === null) {
    acsDayData = new ASCDayData(dayPairID);
    acsDayData.date = dayStartTimestamp;
    acsDayData.mintVolume = ZERO_BD;
    acsDayData.burnVolume = ZERO_BD;
  }
  if (asc) {
    acsDayData.reserveDfx = asc.reserveDfx;
    acsDayData.reserveCadc = asc.reserveCadc;
  }

  return acsDayData as ASCDayData;
}
