import { Address } from "@graphprotocol/graph-ts";
import { Pair, Token } from "../generated/schema";
import { fetchCurveInfo } from "./curve-factory";
import { ZERO_BD } from "./helpers";
import {
  fetchTokenDecimals,
  fetchTokenName,
  fetchTokenSymbol,
} from "./token-helpers";

// Get or create Pair entity with default empty state
// TODO: Move to a helpers file?
// Mostly the same as handleNewCurve helper in curve-factory.ts
export function getPair(pairAddr: string): Pair {
  let pair = Pair.load(pairAddr);
  if (pair === null) {
    const _addr = Address.fromString(pairAddr);
    const curveInfo = fetchCurveInfo(_addr);

    pair = new Pair(pairAddr);
    pair.decimals = curveInfo.decimals;
    pair.name = curveInfo.name;
    pair.symbol = curveInfo.symbol;
    pair.supply = curveInfo.totalSupply;

    pair.token0 = curveInfo.token0.toHexString();
    pair.token1 = curveInfo.token1.toHexString();

    pair.reserve0 = ZERO_BD;
    pair.reserve1 = ZERO_BD;
    pair.reserveUSD = ZERO_BD;

    pair.swapRateUSD = ZERO_BD;
  }
  return pair;
}

// Get or create Token entity with default empty state
// TODO: Move to a helpers file?
export function getToken(tokenAddr: string): Token {
  let token = Token.load(tokenAddr);
  if (token === null) {
    const _tokenAddr = Address.fromString(tokenAddr);

    token = new Token(tokenAddr);
    token.decimals = fetchTokenDecimals(_tokenAddr);
    token.symbol = fetchTokenSymbol(_tokenAddr);
    token.name = fetchTokenName(_tokenAddr);
    token.priceUSD = ZERO_BD;
    token.save();
  }

  return token;
}
