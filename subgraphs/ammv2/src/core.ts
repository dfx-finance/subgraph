import { Address, log, BigInt } from "@graphprotocol/graph-ts";

import { 
    ZERO_BI, 
    ZERO_BD, 
    ONE_BI,
    ONE_BD,
    fetchTokenDecimals, 
    fetchTokenSymbol,
    fetchTokenName,
    fetchBalanceOf,
    convertTokenToDecimal,
    fetchLiquidity,
    fetchTotalLPT
} from "./helpers";

import { 
    USDC,
    FACTORY_ADDRESS_V2,
    ASSIM_FACTORY_ADDRESS_V2,
    BLACKHOLE_ADDRESS 
} from "../../../packages/constants/index"

import { 
    Transfer as TransferEvent,
    Trade as TradeEvent,
} from "../generated/templates/Curve/Curve"

import {
    Trade,
    Transfer,
    Token,
    Pair,
    PoolParticipant,
} from "../generated/schema"

import { ERC20 } from '../generated/templates/Curve/ERC20'

export function handleTrade(event: TradeEvent): void {
    let entity = new Trade(
        event.transaction.hash.toHex() + "-" + event.logIndex.toString()
    )
    entity.timestamp = event.block.timestamp;
    entity.trader = event.transaction.from
    entity.origin = event.params.origin
    entity.target = event.params.target
    entity.pair = ''
    entity.originAmount = event.params.originAmount
    entity.targetAmount = event.params.targetAmount

    let pair = Pair.load(event.address.toHexString())!
    entity.pair = pair.id

    let token0 = Token.load(pair.token0)!
    let token1 = Token.load(pair.token1)!

    let amount0 = ZERO_BD
    let amount1 = ZERO_BD

    if (event.params.origin.toHexString() == token0.id) {
        amount0 = convertTokenToDecimal(event.params.originAmount, token0.decimals)
        amount1 = convertTokenToDecimal(event.params.targetAmount, token1.decimals)
    } else if (event.params.origin.toHexString() == token0.id) {
        amount0 = convertTokenToDecimal(event.params.targetAmount, token1.decimals)
        amount1 = convertTokenToDecimal(event.params.originAmount, token0.decimals)
    }

    if (token0.id == USDC) {
        if (amount1.gt(ZERO_BD)) {
            let exchangeRateUSD = amount0.div(amount1)
            pair.swapRateUSD = exchangeRateUSD
            token1.priceUSD = exchangeRateUSD
        }
    } else if (token1.id == USDC) {
        if (amount0.gt(ZERO_BD)) {
            let exchangeRateUSD = amount1.div(amount1)
            pair.swapRateUSD = exchangeRateUSD
            token0.priceUSD = exchangeRateUSD
        }
    }

    if (amount1.gt(ZERO_BD)) {
        let exchangeRate = amount0.div(amount1)
        pair.swapRateNative = exchangeRate
    }

    token0.save()
    token1.save()

    // TODO: POOL PARTICIPANT
    let reserve0 = fetchBalanceOf(token0, event.address)
    let reserve0USD = token0.priceUSD.times(reserve0)
    let reserve1 = fetchBalanceOf(token1, event.address)
    let reserve1USD = token1.priceUSD.times(reserve1)

    pair.reserve0 = fetchBalanceOf(token0, event.address)
    pair.reserve1 = fetchBalanceOf(token1, event.address)
    pair.reserveNative = fetchLiquidity(event.address)
    pair.reserveUSD = reserve0USD.plus(reserve1USD)

    let poolParticipant = PoolParticipant.load(event.address.toHexString() + "-" + event.transaction.from.toHexString())
    if (poolParticipant === null) {
        poolParticipant = new PoolParticipant(event.address.toHexString() + "-" + event.transaction.from.toHexString()) as PoolParticipant
        poolParticipant.pair = pair.id
        poolParticipant.participant = event.transaction.from
        poolParticipant.volumeUSD = ZERO_BD
        poolParticipant.volumeNative = ZERO_BD
    //     pair.participantCount = pair.participantCount.plus(ONE_BI)
    }
    // TODO:maybe put this at the top?
    // WHY IS THIS GIVING ME ZERO
    let amount0USD = amount0.times(token0.priceUSD)
    poolParticipant.volumeUSD = poolParticipant.volumeUSD.plus(amount0USD)
    poolParticipant.volumeNative = poolParticipant.volumeNative.plus(amount0)
    


      // update day entities
    //   let pairHourData = updatePairHourData(event)
    //   let pairDayData = updatePairDayData(event)
    //   let dfxDayData = updateDFXDayData(event)
    //   let token0DayData = updateTokenDayData(token0 as Token, event)
    //   let token1DayData = updateTokenDayData(token1 as Token, event)
    //   let dfx = DFXFactory.load(FACTORY_ADDRESS_V1)!
  
    //   dfx.totalVolumeUSD = dfx.totalVolumeUSD.plus(amount0)
    //   dfx.save()
  
    //   dfxDayData.dailyVolumeUSD = dfxDayData.dailyVolumeUSD.plus(amount0)
    //   dfxDayData.totalVolumeUSD = dfx.totalVolumeUSD
    //   dfxDayData.save()
  
    //   // update hourly pair data
    //   pairHourData.volumeToken0 = pairHourData.volumeToken0.plus(amount0)
    //   pairHourData.volumeToken1 = pairHourData.volumeToken1.plus(amount1)
    //   pairHourData.volumeUSD = pairHourData.volumeUSD.plus(amount0)
    //   pairHourData.save()
  
    //   // update daily pair data
    //   pairDayData.volumeToken0 = pairDayData.volumeToken0.plus(amount0)
    //   pairDayData.volumeToken1 = pairDayData.volumeToken1.plus(amount1)
    //   pairDayData.volumeUSD = pairDayData.volumeUSD.plus(amount0)
    //   pairDayData.save()
  
    //   // update daily token data
    //   token0DayData.dailyVolumeToken = token0DayData.dailyVolumeToken.plus(amount0)
    //   token0DayData.dailyVolumeUSD = token0DayData.dailyVolumeUSD.plus(amount0)
    //   token0DayData.save()
  
    //   token1DayData.dailyVolumeToken = token1DayData.dailyVolumeToken.plus(amount1)
    //   token1DayData.dailyVolumeUSD = token1DayData.dailyVolumeUSD.plus(amount1.times(token1DayData.priceUSD))
    //   token1DayData.save()
  
    //   // update pair yield farming data
    //   let rewardDuration = fetchRewardDuration(event.address.toHexString())
    //   let rewardsForDuration = fetchRewardsForDuration(event.address.toHexString())
    //   let totalStaked = fetchTotalStaked(event.address.toHexString())
  
    //   pair.rewardDuration = rewardDuration
    //   pair.rewardsForDuration = rewardsForDuration
    //   pair.totalStaked = totalStaked
  
      // update pair volume data
    pair.volumeToken0 = pair.volumeToken0.plus(amount0)
    pair.volumeToken1 = pair.volumeToken1.plus(amount1)
    pair.volumeUSD = pair.volumeUSD.plus(amount0USD)
    pair.txnsCount = pair.txnsCount.plus(ONE_BI)
    //   pair.save()
  
    //   token0.save()
    //   token1.save()
    pair.save()
    entity.save()
    poolParticipant.save()
}

export function handleTransfer(event: TransferEvent): void {
    let entity = new Transfer(
        event.transaction.hash.toHex() + "-" + event.logIndex.toString()
    )

    let pair = Pair.load(event.address.toHexString())
    if (pair === null) {
        return
    }
    entity.timestamp = event.block.timestamp;
    entity.pair = pair.id
    entity.from = event.params.from
    entity.to = event.params.to
    entity.token0Amount = ZERO_BD
    entity.token1Amount = ZERO_BD
    entity.value = event.params.value

    pair.totalLPToken = fetchTotalLPT(Address.fromString(pair.id))
    
    entity.save()
    pair.save()
}
