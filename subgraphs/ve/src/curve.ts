import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Pair, Token } from "../generated/schema";
import {
  Curve,
  Trade as TradeEvent,
  Transfer as TransferEvent,
} from "../generated/templates/Curve/Curve";
import { ERC20 } from "../generated/templates/Curve/ERC20";
import { USDC } from "../../../packages/constants";

import {
  convertTokenToDecimal,
  fetchTokenDecimals,
  fetchTokenName,
  fetchTokenSymbol,
} from "./helpers";

// Get or create Pair entity with default empty state
// TODO: Move to a helpers file?
export function getPair(pairAddr: string): Pair {
  let pair = Pair.load(pairAddr);
  if (pair === null) {
    const curveContract = Curve.bind(Address.fromString(pairAddr));

    pair = new Pair(pairAddr);
    pair.decimals = BigInt.fromI32(curveContract.decimals());
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
    token.save();
  }

  return token;
}

export function handleTrade(event: TradeEvent): void {
  const pair = getPair(event.address.toHexString());

  let token0 = getToken(event.params.origin.toHexString());
  let token1 = getToken(event.params.target.toHexString());
  if (token1.id == USDC) {
    let tempToken = token1;
    token1 = token0;
    token0 = tempToken;
  }

  let contract0 = ERC20.bind(Address.fromString(token0.id));
  let reserve0Result = contract0.try_balanceOf(event.address);
  if (!reserve0Result.reverted) {
    let reserve0 = convertTokenToDecimal(reserve0Result.value, token0.decimals);
    pair.reserve0 = reserve0;
  }

  let contract1 = ERC20.bind(Address.fromString(token1.id));
  let reserve1Result = contract1.try_balanceOf(event.address);
  if (!reserve1Result.reverted) {
    let reserve1 = convertTokenToDecimal(reserve1Result.value, token1.decimals);
    pair.reserve1 = reserve1;
  }

  pair.save();
}

export function handleTransfer(event: TransferEvent): void {
  const pair = getPair(event.address.toHexString());

  let token0 = getToken(pair.token0);
  let token1 = getToken(pair.token1);

  let tokenContract0 = ERC20.bind(Address.fromString(token0.id));
  let reserve0Result = tokenContract0.try_balanceOf(event.address);
  if (!reserve0Result.reverted) {
    let reserve0 = convertTokenToDecimal(reserve0Result.value, token0.decimals);
    pair.reserve0 = reserve0;
  }

  let tokenContract1 = ERC20.bind(Address.fromString(token1.id));
  let reserve1Result = tokenContract1.try_balanceOf(event.address);
  if (!reserve1Result.reverted) {
    let reserve1 = convertTokenToDecimal(reserve1Result.value, token1.decimals);
    pair.reserve1 = reserve1;
  }

  pair.save();
}
