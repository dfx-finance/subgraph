import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Pair } from "../generated/schema";
import { Curve } from "../generated/CurveFactoryV2/Curve";

/* -- Main -- */
/* Event Handlers */

// Handle creating entity with default empty state
export function getPair(pairAddr: string): Pair {
  let pair = Pair.load(pairAddr);
  if (pair === null) {
    const curveContract = Curve.bind(Address.fromString(pairAddr));

    pair = new Pair(pairAddr);
    pair.decimals = BigInt.fromI32(curveContract.decimals());
  }
  return pair;
}
