import { Address } from "@graphprotocol/graph-ts";
import {
  Trade as TradeEvent,
  Transfer as TransferEvent,
} from "../generated/templates/Curve/Curve";
import { Curve } from "../generated/CurveFactoryV2/Curve";
import { ERC20 } from "../generated/templates/Curve/ERC20";
import { USDC } from "../../../packages/constants";

import { ZERO_BD, valueToBigDecimal } from "./helpers";
import { getPair, getToken } from "./curve-helpers";

// Trade events update:
// - total amounts of lpt pair reserves
// - total USD value of lpt pair reserves
// - token price shown on token and lpt pair entities
export function handleTrade(event: TradeEvent): void {
  const pair = getPair(event.address.toHexString());
  const curveContract = Curve.bind(event.address);

  // update total supply of lpt for pair
  pair.supply = valueToBigDecimal(curveContract.totalSupply(), 18);

  // get traded amounts with USDC (quote) as amount1
  let token0 = getToken(pair.token0);
  let token1 = getToken(pair.token1); // USDC (quote) always token1
  let amount0 = ZERO_BD;
  let amount1 = ZERO_BD;
  if (event.params.origin.toHexString() == token0.id) {
    // if origin is NON-USDC
    amount0 = valueToBigDecimal(event.params.originAmount, token0.decimals);
    amount1 = valueToBigDecimal(event.params.targetAmount, token1.decimals);
  } else if (event.params.origin.toHexString() == token1.id) {
    // if origin is USDC
    amount0 = valueToBigDecimal(event.params.targetAmount, token0.decimals);
    amount1 = valueToBigDecimal(event.params.originAmount, token1.decimals);
  }

  // update amounts of token reserves in lpt pair
  let contract0 = ERC20.bind(Address.fromString(token0.id));
  let reserve0Result = contract0.try_balanceOf(event.address);
  if (!reserve0Result.reverted) {
    pair.reserve0 = valueToBigDecimal(reserve0Result.value, token0.decimals);
  }

  let contract1 = ERC20.bind(Address.fromString(token1.id));
  let reserve1Result = contract1.try_balanceOf(event.address);
  if (!reserve1Result.reverted) {
    pair.reserve1 = valueToBigDecimal(reserve1Result.value, token1.decimals);
  }

  let reserveResult = curveContract.try_liquidity();
  if (!reserveResult.reverted) {
    let reserveUSD = valueToBigDecimal(reserveResult.value.value0, 18);
    pair.reserveUSD = reserveUSD;
  }

  // update token0's priceUSD and pair's swapRateUSD
  if (token0.id == USDC) {
    if (amount1.gt(ZERO_BD)) {
      let exchangeRateUSD = amount0.div(amount1);
      pair.swapRateUSD = exchangeRateUSD;
      token1.priceUSD = exchangeRateUSD;
    }
  } else if (token1.id == USDC) {
    if (amount0.gt(ZERO_BD)) {
      let exchangeRateUSD = amount1.div(amount0);
      pair.swapRateUSD = exchangeRateUSD;
      token0.priceUSD = exchangeRateUSD;
    }
  }

  pair.save();
  token0.save();
  token1.save();
}

// Transfer events update:
// - total amounts of lpt pair reserves
// - total USD value of lpt pair reserves
export function handleTransfer(event: TransferEvent): void {
  const pair = getPair(event.address.toHexString());
  const curveContract = Curve.bind(event.address);

  // update total supply of lpt for pair
  pair.supply = valueToBigDecimal(curveContract.totalSupply(), 18);

  let token0 = getToken(pair.token0);
  let token1 = getToken(pair.token1);

  // update amounts of token reserves in lpt pair
  let tokenContract0 = ERC20.bind(Address.fromString(token0.id));
  let reserve0Result = tokenContract0.try_balanceOf(event.address);
  if (!reserve0Result.reverted) {
    let reserve0 = valueToBigDecimal(reserve0Result.value, token0.decimals);
    pair.reserve0 = reserve0;
  }

  let tokenContract1 = ERC20.bind(Address.fromString(token1.id));
  let reserve1Result = tokenContract1.try_balanceOf(event.address);
  if (!reserve1Result.reverted) {
    let reserve1 = valueToBigDecimal(reserve1Result.value, token1.decimals);
    pair.reserve1 = reserve1;
  }

  let reserveResult = curveContract.try_liquidity();
  if (!reserveResult.reverted) {
    let reserveUSD = valueToBigDecimal(reserveResult.value.value0, 18);
    pair.reserveUSD = reserveUSD;
  }

  pair.save();
}
