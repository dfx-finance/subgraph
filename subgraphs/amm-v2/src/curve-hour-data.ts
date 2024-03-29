import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { ZERO_BD } from "./helpers";

import { PairHourData, Pair, Token } from "../generated/schema";

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
    pairHourData.reserveUSD = ZERO_BD;
    pairHourData.swapRateUSD = ZERO_BD;
    pairHourData.volumeToken0 = ZERO_BD;
    pairHourData.volumeToken1 = ZERO_BD;
    pairHourData.volumeUSD = ZERO_BD;
    // pairHourData.participantCount = ZERO_BI
  }
  if (pair !== null) {
    pairHourData.reserve0 = pair.reserve0;
    pairHourData.reserve1 = pair.reserve1;
    pairHourData.swapRateUSD = pair.swapRateUSD;
    // pairHourData.participantCount = pair.participantCount

    pairHourData.reserveUSD = pair.reserveUSD;
  }
  pairHourData.save();

  return pairHourData as PairHourData;
}
