import { BigInt, ethereum } from "@graphprotocol/graph-ts";

import { ZERO_BD } from "./helpers";

import { DFX_CADC_PROXY } from "../../../packages/constants/index";

import { ASCHourData, ASC } from "../generated/schema";

export function updateASCHourData(event: ethereum.Event): ASCHourData {
  let timestamp = event.block.timestamp.toI32();
  let hourIndex = timestamp / 3600;
  let hourStartUnix = hourIndex * 3600;
  let hourPairID = event.address
    .toHexString()
    .concat("-")
    .concat(BigInt.fromI32(hourIndex).toString());

  let asc = ASC.load(DFX_CADC_PROXY);
  let acsHourData = ASCHourData.load(hourPairID);
  if (acsHourData === null) {
    acsHourData = new ASCHourData(hourPairID);
    acsHourData.hourStartUnix = hourStartUnix;
    acsHourData.mintVolume = ZERO_BD;
    acsHourData.burnVolume = ZERO_BD;
  }
  if (asc) {
    acsHourData.reserveDfx = asc.reserveDfx;
    acsHourData.reserveCadc = asc.reserveCadc;
  }

  return acsHourData as ASCHourData;
}
