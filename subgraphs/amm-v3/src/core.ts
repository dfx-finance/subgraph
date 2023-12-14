import { Address, BigDecimal } from "@graphprotocol/graph-ts";

import {
  ZERO_BD,
  ONE_BI,
  fetchBalanceOf,
  convertTokenToDecimal,
  fetchLiquidity,
  fetchTotalLPT,
  getTransferType,
  fetchLPTDeposit,
  calculateProtocolFee,
  fetchTokenPriceInUSD,
} from "./helpers";

import { CURVE_FACTORY_ADDRESS_V3 } from "./constants";

import {
  Transfer as TransferEvent,
  Trade as TradeEvent,
} from "../generated/templates/Curve/Curve";

import {
  Trade,
  Transfer,
  Token,
  Pair,
  PoolParticipant,
  DFXFactoryV3,
  Oracle,
} from "../generated/schema";

import { updatePairHourData } from "./curve-hour-data";
import { updatePairDayData } from "./curve-day-data";
import { updateTokenDayData } from "./token-day-data";
import { updateDFXDayData } from "./dfx-day-data";

export function handleTrade(event: TradeEvent): void {
  let entity = new Trade(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.timestamp = event.block.timestamp;
  entity.trader = event.transaction.from;
  entity.origin = event.params.origin;
  entity.target = event.params.target;
  entity.pair = "";
  entity.originAmount = event.params.originAmount;
  entity.targetAmount = event.params.targetAmount;
  entity.fee = event.params.rawProtocolFee;

  let pair = Pair.load(event.address.toHexString())!;
  entity.pair = pair.id;

  let token0 = Token.load(pair.token0)!;
  let token1 = Token.load(pair.token1)!;

  let amount0 = ZERO_BD;
  let amount1 = ZERO_BD;

  // if origin is NON-USDC
  if (event.params.origin.toHexString() == token0.id) {
    amount0 = convertTokenToDecimal(event.params.originAmount, token0.decimals);
    amount1 = convertTokenToDecimal(event.params.targetAmount, token1.decimals);
  }
  // else if origin is USDC
  else if (event.params.origin.toHexString() == token1.id) {
    amount0 = convertTokenToDecimal(event.params.targetAmount, token0.decimals);
    amount1 = convertTokenToDecimal(event.params.originAmount, token1.decimals);
  }
  let oracle0 = Oracle.load(token0.oracle);
  if (oracle0) {
    token0.priceUSD = fetchTokenPriceInUSD(Address.fromString(oracle0.id));
  }
  let oracle1 = Oracle.load(token1.oracle);
  if (oracle1) {
    token1.priceUSD = fetchTokenPriceInUSD(Address.fromString(oracle1.id));
  }

  pair.save();
  token0.save();
  token1.save();

  // TODO: POOL PARTICIPANT
  let reserve0 = fetchBalanceOf(token0, event.address);
  let reserve0USD = token0.priceUSD.times(reserve0);
  let reserve1 = fetchBalanceOf(token1, event.address);
  let reserve1USD = token1.priceUSD.times(reserve1);

  pair.reserve0 = fetchBalanceOf(token0, event.address);
  pair.reserve1 = fetchBalanceOf(token1, event.address);

  pair.reserve0USD = reserve0USD;
  pair.reserve1USD = reserve1USD;
  /** */
  pair.reserveNative = fetchLiquidity(event.address);
  pair.reserveUSD = reserve0USD.plus(reserve1USD);

  let poolParticipant = PoolParticipant.load(
    event.address.toHexString() + "-" + event.transaction.from.toHexString()
  );
  if (poolParticipant === null) {
    poolParticipant = new PoolParticipant(
      event.address.toHexString() + "-" + event.transaction.from.toHexString()
    ) as PoolParticipant;
    poolParticipant.pair = pair.id;
    poolParticipant.participant = event.transaction.from;
    poolParticipant.liquidityProvided = ZERO_BD;
    poolParticipant.lpTokenBalance = ZERO_BD;
    pair.participantCount = pair.participantCount.plus(ONE_BI);
  }
  poolParticipant.save();

  // calculate swap rate
  let amount1USD = amount1.times(token1.priceUSD);
  let amount0USD = amount0.times(token0.priceUSD);
  if (amount0USD.gt(ZERO_BD)) {
    let swapRateFrom0To1 = amount1USD.div(amount0USD);
    pair.swapRateFrom0To1 = amount1.div(amount0);
    pair.swapRateFrom0To1USD = swapRateFrom0To1;
  } else {
    pair.swapRateFrom0To1 = ZERO_BD;
    pair.swapRateFrom0To1USD = ZERO_BD;
  }
  if (amount1.gt(ZERO_BD)) {
    let swapRateFrom1To0 = amount0USD.div(amount1USD);
    pair.swapRateFrom1To0 = amount0.div(amount1);
    pair.swapRateFrom1To0USD = swapRateFrom1To0;
  } else {
    pair.swapRateFrom1To0 = ZERO_BD;
    pair.swapRateFrom1To0USD = ZERO_BD;
  }
  let feeUSD = calculateProtocolFee(amount1USD, event.address);

  // update day entities
  let pairHourData = updatePairHourData(event);
  let pairDayData = updatePairDayData(event);
  let dfxDayData = updateDFXDayData(event);
  let token0DayData = updateTokenDayData(token0 as Token, event);
  let token1DayData = updateTokenDayData(token1 as Token, event);
  let dfx = DFXFactoryV3.load(CURVE_FACTORY_ADDRESS_V3)!;

  dfx.totalVolumeUSD = dfx.totalVolumeUSD.plus(amount1USD);
  dfx.totalFeeUSD = dfx.totalFeeUSD.plus(feeUSD);
  dfx.save();

  dfxDayData.dailyVolumeUSD = dfxDayData.dailyVolumeUSD.plus(amount1USD);
  dfxDayData.dailyFeeUSD = dfxDayData.dailyFeeUSD.plus(feeUSD);
  dfxDayData.totalVolumeUSD = dfx.totalVolumeUSD;
  dfxDayData.save();

  // update hourly pair data
  pairHourData.volumeToken0 = pairHourData.volumeToken0.plus(amount0);
  pairHourData.volumeToken1 = pairHourData.volumeToken1.plus(amount1);
  pairHourData.volumeUSD = pairHourData.volumeUSD.plus(amount1USD);
  pairHourData.hourVolumeToken0 = pairHourData.hourVolumeToken0.plus(amount0);
  pairHourData.hourVolumeToken1 = pairHourData.hourVolumeToken1.plus(amount1);

  pairHourData.save();

  // update daily pair data
  pairDayData.volumeToken0 = pairDayData.volumeToken0.plus(amount0);
  pairDayData.volumeToken1 = pairDayData.volumeToken1.plus(amount1);
  pairDayData.volumeUSD = pairDayData.volumeUSD.plus(amount1USD);
  pairDayData.feeUSD = pairDayData.feeUSD.plus(feeUSD);
  pairDayData.save();

  // TODO: Double check this data
  // update daily token data
  token0DayData.dailyVolumeToken = token0DayData.dailyVolumeToken.plus(amount0);
  token0DayData.dailyVolumeUSD = token0DayData.dailyVolumeUSD.plus(
    amount1.times(token0DayData.priceUSD)
  );
  token0DayData.save();

  token1DayData.dailyVolumeToken = token1DayData.dailyVolumeToken.plus(amount1);
  token1DayData.dailyVolumeUSD = token1DayData.dailyVolumeUSD.plus(amount1USD);
  token1DayData.save();

  // update pair yield farming data - (Delayed due because)
  //   let rewardDuration = fetchRewardDuration(event.address.toHexString())
  //   let rewardsForDuration = fetchRewardsForDuration(event.address.toHexString())
  //   let totalStaked = fetchTotalStaked(event.address.toHexString())

  //   pair.rewardDuration = rewardDuration
  //   pair.rewardsForDuration = rewardsForDuration
  //   pair.totalStaked = totalStaked

  // update pair volume data
  pair.volumeToken0 = pair.volumeToken0.plus(amount0);
  pair.volumeToken1 = pair.volumeToken1.plus(amount1);
  pair.volumeToken0USD = pair.volumeToken0USD.plus(amount0USD);
  pair.volumeToken1USD = pair.volumeToken1USD.plus(amount1USD);
  pair.totalFeeUSD = pair.totalFeeUSD.plus(feeUSD);
  pair.txnsCount = pair.txnsCount.plus(ONE_BI);

  //   token0.save()
  //   token1.save()
  pair.save();
  entity.save();
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );

  let pair = Pair.load(event.address.toHexString());
  if (pair === null) {
    return;
  }
  entity.timestamp = event.block.timestamp;
  entity.pair = pair.id;
  entity.from = event.params.from;
  entity.to = event.params.to;
  entity.token0Amount = ZERO_BD;
  entity.token1Amount = ZERO_BD;
  entity.tokenLPTAmount = event.params.value;
  entity.type = getTransferType(
    event.params.from.toHexString(),
    event.params.to.toHexString()
  );

  let prevReserve0 = pair.reserve0;
  let prevReserve1 = pair.reserve1;

  let token0 = Token.load(pair.token0)!;
  let token1 = Token.load(pair.token1)!;

  pair.reserve0 = fetchBalanceOf(token0, event.address);
  pair.reserve1 = fetchBalanceOf(token1, event.address);

  let reserve0Diff = pair.reserve0.minus(prevReserve0);
  let reserve1Diff = pair.reserve1.minus(prevReserve1);

  let poolParticipant = PoolParticipant.load(
    event.address.toHexString() + "-" + event.transaction.from.toHexString()
  );
  if (poolParticipant === null) {
    poolParticipant = new PoolParticipant(
      event.address.toHexString() + "-" + event.transaction.from.toHexString()
    ) as PoolParticipant;
    poolParticipant.pair = pair.id;
    poolParticipant.participant = event.transaction.from;
    poolParticipant.lpTokenBalance = ZERO_BD;
  }

  if (entity.type == "withdraw") {
    reserve0Diff = reserve0Diff.neg();
    reserve1Diff = reserve1Diff.neg();
    /** */
    // poolParticipant.liquidityProvided = poolParticipant.liquidityProvided.minus(LPTokens)
    // pair.totalLPToken = pair.totalLPToken.minus(LPTokens)
    // if (poolParticipant.liquidityProvided <= ZERO_BD) {
    //     pair.participantCount.minus(ONE_BI)
    // }
    /** */
  }
  // else if (entity.type == "two-sided-deposit" || entity.type == "single-sided-deposit") {
  //     poolParticipant.liquidityProvided = poolParticipant.liquidityProvided.plus(LPTokens)
  //     pair.totalLPToken = pair.totalLPToken.plus(LPTokens)
  // } else if (entity.type == "LP-transfer") {
  //     let poolParticipant2 = PoolParticipant.load(event.address.toHexString() + "-" + entity.to.toHexString())
  //     if (poolParticipant2 === null) {
  //         poolParticipant2 = new PoolParticipant(event.address.toHexString() + "-" + entity.to.toHexString()) as PoolParticipant
  //         poolParticipant2.pair = pair.id
  //         poolParticipant2.participant = event.transaction.from
  //         poolParticipant2.volumeUSD = ZERO_BD
  //         poolParticipant2.liquidityProvided = ZERO_BD
  //     }
  //     poolParticipant2.liquidityProvided = poolParticipant2.liquidityProvided.plus(LPTokens)
  //     poolParticipant.liquidityProvided = poolParticipant.liquidityProvided.minus(LPTokens)
  // }
  // poolParticipant.save()

  // let poolParticipant = PoolParticipant.load(event.address.toHexString() + "-" + event.transaction.from.toHexString())
  // if (poolParticipant === null) {
  //     // TODO:
  //     // should fill this in just because they dont trade doesnt mean they dont
  //     return
  // }
  // TODO: Gauge is not a required field
  // simple addition of their current token holdings + their staked version but this is not a norm
  // Update Gauge right now

  entity.token0Amount = reserve0Diff;
  entity.token1Amount = reserve1Diff;
  if (entity.type == "single-sided-deposit") {
    let rawLPToDepositResult = fetchLPTDeposit(
      Address.fromString(pair.id),
      entity.tokenLPTAmount
    );
    entity.token0Amount = convertTokenToDecimal(
      rawLPToDepositResult[0],
      token0.decimals
    );
    entity.token1Amount = convertTokenToDecimal(
      rawLPToDepositResult[1],
      token1.decimals
    );
  }

  // TODO: Verify this
  let dfx = DFXFactoryV3.load(CURVE_FACTORY_ADDRESS_V3)!;
  let prevReserveUSD = pair.reserveUSD;
  pair.reserveUSD = fetchLiquidity(event.address);
  dfx.totalLiquidityUSD = dfx.totalLiquidityUSD
    .minus(prevReserveUSD)
    .plus(pair.reserveUSD);
  pair.save();
  dfx.save();

  let pairHourData = updatePairHourData(event);
  let pairDayData = updatePairDayData(event);
  // let reserve0DiffUSD = entity.token0Amount.times(pair.swapRateUSD)
  let reserve0DiffUSD = entity.token0Amount.times(
    fetchTokenPriceInUSD(Address.fromString(token0.id))
  );
  if (entity.type == "withdraw") {
    pairDayData.reserve0Withdraw = pairDayData.reserve0Withdraw.plus(
      entity.token0Amount
    );
    pairDayData.reserve0WithdrawUSD = pairDayData.reserve0WithdrawUSD.plus(
      reserve0DiffUSD
    );
    pairDayData.reserve1Withdraw = pairDayData.reserve1Withdraw.plus(
      entity.token1Amount
    );

    // pool participant
    // poolParticipant.liquidityProvided = poolParticipant.liquidityProvided.minus(reserve0DiffUSD)
    pair.participantCount.minus(ONE_BI);
  } else if (
    entity.type == "two-sided-deposit" ||
    entity.type == "single-sided-deposit"
  ) {
    pairDayData.reserve0Deposit = pairDayData.reserve0Deposit.plus(
      entity.token0Amount
    );
    pairDayData.reserve0DepositUSD = pairDayData.reserve0DepositUSD.plus(
      reserve0DiffUSD
    );
    pairDayData.reserve1Deposit = pairDayData.reserve1Deposit.plus(
      entity.token1Amount
    );

    // pool participant
    pair.participantCount.plus(ONE_BI);
  } else if (entity.type == "lp-transfer") {
    // new participant
  }

  // pool participation starts here

  pairHourData.save();
  pairDayData.save();

  // poolParticipant.liquidityProvided
  pair.totalLPToken = fetchTotalLPT(Address.fromString(pair.id));

  entity.save();
  pair.save();
}
