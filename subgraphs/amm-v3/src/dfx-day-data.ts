import { ethereum } from "@graphprotocol/graph-ts";

import { ZERO_BD } from "./helpers";

import { CURVE_FACTORY_ADDRESS_V3 } from "./constants";

import { DFXDayData, DFXFactoryV3 } from "../generated/schema";

export function updateDFXDayData(event: ethereum.Event): DFXDayData {
  let dfx = DFXFactoryV3.load(CURVE_FACTORY_ADDRESS_V3)!;
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
  let dfxDayData = DFXDayData.load(dayID.toString());
  if (dfxDayData === null) {
    dfxDayData = new DFXDayData(dayID.toString());

    dfxDayData.date = dayStartTimestamp;

    dfxDayData.dailyVolumeUSD = ZERO_BD;
    dfxDayData.dailyFeeUSD = ZERO_BD;
    dfxDayData.totalVolumeUSD = ZERO_BD;
    dfxDayData.totalFeeUSD = ZERO_BD;
    dfxDayData.totalLiquidityUSD = ZERO_BD;
  }

  dfxDayData.totalLiquidityUSD = dfx.totalLiquidityUSD;
  dfxDayData.save();

  return dfxDayData as DFXDayData;
}
