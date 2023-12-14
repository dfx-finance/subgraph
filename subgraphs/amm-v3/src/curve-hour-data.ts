import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { ZERO_BD } from "./helpers";

import { PairHourData, Pair } from "../generated/schema";

export function updatePairHourData(event: ethereum.Event): PairHourData {
  let timestamp = event.block.timestamp.toI32();
  let hourIndex = timestamp / 3600;
  let hourStartUnix = hourIndex * 3600;
  let hourPairID = event.address
    .toHexString()
    .concat("-")
    .concat(BigInt.fromI32(hourIndex).toString());

  let pair = Pair.load(event.address.toHex());
  let pairHourData = PairHourData.load(hourPairID);
  if (pairHourData === null) {
    pairHourData = new PairHourData(hourPairID);
    pairHourData.firstTxn = event.transaction.hash;
    pairHourData.hourStartUnix = hourStartUnix;
    pairHourData.pair = event.address.toHexString();

    pairHourData.reserve0 = ZERO_BD;
    pairHourData.reserve1 = ZERO_BD;
    pairHourData.reserve0USD = ZERO_BD;
    pairHourData.reserve1USD = ZERO_BD;

    pairHourData.swapRateFrom0To1USD = ZERO_BD;
    pairHourData.swapRateFrom1To0USD = ZERO_BD;
    // pairHourData.swapRateUSD = ZERO_BD
    pairHourData.volumeToken0 = ZERO_BD;
    pairHourData.volumeToken1 = ZERO_BD;
    pairHourData.volumeUSD = ZERO_BD;
    pairHourData.volumeToken0USD = ZERO_BD;
    pairHourData.volumeToken1USD = ZERO_BD;
    pairHourData.minRateFrom0To1 = ZERO_BD;
    pairHourData.maxRateFrom0To1 = ZERO_BD;
    pairHourData.minRateFrom1To0 = ZERO_BD;
    pairHourData.maxRateFrom1To0 = ZERO_BD;
    pairHourData.hourVolumeToken0 = ZERO_BD;
    pairHourData.hourVolumeToken1 = ZERO_BD;
    // pairHourData.participantCount = ZERO_BI
  }
  if (pair !== null) {
    pairHourData.reserve0 = pair.reserve0;
    pairHourData.reserve1 = pair.reserve1;
    pairHourData.reserve0USD = pair.reserve0USD;
    pairHourData.reserve1USD = pair.reserve1USD;
    pairHourData.volumeToken0 = pair.volumeToken0;
    pairHourData.volumeToken0USD = pair.volumeToken0USD;
    pairHourData.volumeToken1 = pair.volumeToken1;
    pairHourData.volumeToken1USD = pair.volumeToken1USD;
    pairHourData.volumeUSD = pair.volumeToken0USD.plus(pair.volumeToken1USD);

    pairHourData.swapRateFrom0To1USD = pair.swapRateFrom0To1USD;
    pairHourData.swapRateFrom1To0USD = pair.swapRateFrom1To0USD;

    if (pair.swapRateFrom0To1.notEqual(ZERO_BD)) {
      if (
        pairHourData.minRateFrom0To1.equals(ZERO_BD) ||
        pairHourData.minRateFrom0To1.gt(pair.swapRateFrom0To1)
      ) {
        pairHourData.minRateFrom0To1 = pair.swapRateFrom0To1;
      }

      if (
        pairHourData.maxRateFrom0To1.equals(ZERO_BD) ||
        pairHourData.maxRateFrom0To1.lt(pair.swapRateFrom0To1)
      ) {
        pairHourData.maxRateFrom0To1 = pair.swapRateFrom0To1;
      }
    }

    if (pair.swapRateFrom1To0.notEqual(ZERO_BD)) {
      if (
        pairHourData.minRateFrom1To0.equals(ZERO_BD) ||
        pairHourData.minRateFrom1To0.gt(pair.swapRateFrom1To0)
      ) {
        pairHourData.minRateFrom1To0 = pair.swapRateFrom1To0;
      }

      if (
        pairHourData.maxRateFrom1To0.equals(ZERO_BD) ||
        pairHourData.maxRateFrom1To0.lt(pair.swapRateFrom1To0)
      ) {
        pairHourData.maxRateFrom1To0 = pair.swapRateFrom1To0;
      }
    }
  }
  pairHourData.save();

  return pairHourData as PairHourData;
}
