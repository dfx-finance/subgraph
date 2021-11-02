import { Address, log, BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import { 
    ZERO_BI, 
    ZERO_BD, 
    ONE_BI,
    ONE_BD,
    fetchTokenDecimals, 
    fetchTokenSymbol,
    fetchTokenName,
    convertTokenToDecimal,
    fetchRewardDuration,
    fetchRewardsForDuration,
    fetchTotalStaked,
} from "./helpers";

import { 
    USDC,
    FACTORY_ADDRESS,
    BLACKHOLE_ADDRESS 
} from "../packages/constants/index"

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
    DFXDayData,
    DFXFactory,
} from "../generated/schema"

import { ERC20 } from '../generated/Factory/ERC20'

import { updatePairHourData } from "./curve-hour-data";
import { updatePairDayData } from "./curve-day-data";
import { updateDFXDayData } from "./dfx-day-data";
import { updateTokenDayData } from "./token-day-data";

export function handleTrade(event: TradeEvent): void {
    let entity = new Trade(
        event.transaction.hash.toHex() + "-" + event.logIndex.toString()
    )
    entity.timestamp = event.block.timestamp;
    entity.trader = event.transaction.from
    entity.origin = event.params.origin
    entity.target = event.params.target
    entity.originAmount = event.params.originAmount
    entity.targetAmount = event.params.targetAmount
    
    let token0 = Token.load(event.params.origin.toHexString())
    let token1 = Token.load(event.params.target.toHexString())
    
    // fetch info if null
    if (token0 === null) {
        token0 = new Token(event.params.origin.toHexString())
        let decimals = fetchTokenDecimals(event.params.origin)
        // bail if we couldn't figure out the decimals
        if (decimals === null) {
          log.debug('mybug the decimal on token 0 was null', [])
          return
        }
        let symbol = fetchTokenSymbol(event.params.origin)
        let name = fetchTokenName(event.params.origin)
        token0.priceUSD = ONE_BD
        token0.decimals = decimals
        token0.symbol = symbol
        token0.name = name
    }

    // fetch info if null
    if (token1 === null) {
        token1 = new Token(event.params.target.toHexString())
        let decimals = fetchTokenDecimals(event.params.target)

        // bail if we couldn't figure out the decimals
        if (decimals === null) {
            log.debug('mybug the decimal on token 1 was null', [])
            return
        }
        let symbol = fetchTokenSymbol(event.params.target)
        let name = fetchTokenName(event.params.target)
        token1.priceUSD = ONE_BD
        token1.decimals = decimals
        token1.symbol = symbol
        token1.name = name
    }

    let pair = Pair.load(event.address.toHexString())
    if (pair === null) {
        pair = new Pair(event.address.toHexString()) as Pair
        pair.reserve1 = ZERO_BD
        pair.reserve0 = ZERO_BD
        pair.reserveUSD = ZERO_BD
        pair.prevReserveUSD = ZERO_BD
        pair.swapRateUSD = ZERO_BD
        pair.rewardDuration = ZERO_BI
        pair.rewardsForDuration = ZERO_BD
        pair.volumeToken0 = ZERO_BD
        pair.volumeToken1 = ZERO_BD
        pair.volumeUSD = ZERO_BD
        pair.txnsCount = ZERO_BI
        pair.participantCount = ZERO_BI
        if (token0.id == USDC) {
            // USDC first
            pair.token0 = token0.id
            pair.token1 = token1.id
        } else {
            pair.token0 = token1.id
            pair.token1 = token0.id
        }
    }

    let amount0 = ZERO_BD
    let amount1 = ZERO_BD

    if (event.params.origin.toHexString() == USDC) {
        amount0 = convertTokenToDecimal(event.params.originAmount, token0.decimals)
        amount1 = convertTokenToDecimal(event.params.targetAmount, token1.decimals)
    } else {
        amount0 = convertTokenToDecimal(event.params.targetAmount, token1.decimals)
        amount1 = convertTokenToDecimal(event.params.originAmount, token0.decimals)
    }

    if (token1.id == USDC) {
        let tempToken = token1
        token1 = token0
        token0 = tempToken
    }
    
    if (amount1.gt(ZERO_BD)) {
        let exchangeRateUSD =  amount0.div(amount1)
        pair.swapRateUSD = exchangeRateUSD
        token1.priceUSD = exchangeRateUSD
        token1.save()
    }

    let poolParticipant = PoolParticipant.load(event.address.toHexString() + "-" + event.transaction.from.toHexString())
    if (poolParticipant === null) {
        poolParticipant = new PoolParticipant(event.address.toHexString() + "-" + event.transaction.from.toHexString()) as PoolParticipant
        poolParticipant.pair = pair.id
        poolParticipant.volumeUSD = ZERO_BD
        pair.participantCount = pair.participantCount.plus(ONE_BI)
    }
    poolParticipant.volumeUSD = poolParticipant.volumeUSD.plus(amount0)
    poolParticipant.save()
    
    let contract0 = ERC20.bind(Address.fromString(token0.id))
    let reserve0Result = contract0.try_balanceOf(event.address)
    if (!reserve0Result.reverted){
        let reserve0 = convertTokenToDecimal(reserve0Result.value, token0.decimals)
        pair.reserve0 = reserve0
    } 

    let contract1 = ERC20.bind(Address.fromString(token1.id))
    let reserve1Result = contract1.try_balanceOf(event.address)
    if (!reserve1Result.reverted){
        let reserve1 = convertTokenToDecimal(reserve1Result.value, token1.decimals)
        pair.reserve1 = reserve1
    }

    // update day entities
    let pairHourData = updatePairHourData(event)
    let pairDayData = updatePairDayData(event)
    let dfxDayData = updateDFXDayData(event)
    let token0DayData = updateTokenDayData(token0 as Token, event)
    let token1DayData = updateTokenDayData(token1 as Token, event)
    let dfx = DFXFactory.load(FACTORY_ADDRESS)

    dfx.totalVolumeUSD = dfx.totalVolumeUSD.plus(amount0)
    dfx.save()

    dfxDayData.dailyVolumeUSD = dfxDayData.dailyVolumeUSD.plus(amount0)
    dfxDayData.totalVolumeUSD = dfx.totalVolumeUSD
    dfxDayData.save()

    // update hourly pair data
    pairHourData.volumeToken0 = pairHourData.volumeToken0.plus(amount0)
    pairHourData.volumeToken1 = pairHourData.volumeToken1.plus(amount1)
    pairHourData.volumeUSD = pairHourData.volumeUSD.plus(amount0)
    pairHourData.save()

    // update daily pair data
    pairDayData.volumeToken0 = pairDayData.volumeToken0.plus(amount0)
    pairDayData.volumeToken1 = pairDayData.volumeToken1.plus(amount1)
    pairDayData.volumeUSD = pairDayData.volumeUSD.plus(amount0)
    pairDayData.save()

    // update daily token data
    token0DayData.dailyVolumeToken = token0DayData.dailyVolumeToken.plus(amount0)
    token0DayData.dailyVolumeUSD = token0DayData.dailyVolumeUSD.plus(amount0)
    token0DayData.save()

    token1DayData.dailyVolumeToken = token1DayData.dailyVolumeToken.plus(amount1)
    token1DayData.dailyVolumeUSD = token1DayData.dailyVolumeUSD.plus(amount1.times(token1DayData.priceUSD))
    token1DayData.save()

    // update pair yield farming data
    let rewardDuration = fetchRewardDuration(event.address.toHexString())
    let rewardsForDuration = fetchRewardsForDuration(event.address.toHexString())
    let totalStaked = fetchTotalStaked(event.address.toHexString())

    pair.rewardDuration = rewardDuration
    pair.rewardsForDuration = rewardsForDuration
    pair.totalStaked = totalStaked

    // update pair volume data
    pair.volumeToken0 = pair.volumeToken0.plus(amount0)
    pair.volumeToken1 = pair.volumeToken1.plus(amount1)
    pair.volumeUSD = pair.volumeUSD.plus(amount0)
    pair.txnsCount = pair.txnsCount.plus(ONE_BI)
    pair.save()

    token0.save()
    token1.save()
    pair.save()
    entity.save()
}

export function handleTransfer(event: TransferEvent): void {
    let entity = new Transfer(
        event.transaction.hash.toHex() + "-" + event.logIndex.toString()
    )
    entity.timestamp = event.block.timestamp;
    entity.from = event.params.from
    entity.to = event.params.to
    entity.value = event.params.value
    
    if (event.params.to.toHexString() == BLACKHOLE_ADDRESS) {
        entity.type = "withdraw"
    } else if (event.params.from.toHexString() == BLACKHOLE_ADDRESS) {
        entity.type = "deposit"
    } else {
        entity.type = "other"
    }

    // Ensuring pair already exists
    let pair = Pair.load(event.address.toHexString())
    if (pair === null) {
        return
    }
    let token0 = Token.load(pair.token0)
    let token1 = Token.load(pair.token1)
    
    let contract0 = ERC20.bind(Address.fromString(token0.id))
    let reserve0Result = contract0.try_balanceOf(event.address)
    if (!reserve0Result.reverted){
        let reserve0 = convertTokenToDecimal(reserve0Result.value, token0.decimals)
        pair.reserve0 = reserve0
    } 

    let contract1 = ERC20.bind(Address.fromString(token1.id))
    let reserve1Result = contract1.try_balanceOf(event.address)
    if (!reserve1Result.reverted){
        let reserve1 = convertTokenToDecimal(reserve1Result.value, token1.decimals)
        pair.reserve1 = reserve1
    }
    let amount1ReserveUSD = pair.reserve1.times(token1.priceUSD)
    let amountReserveUSD = pair.reserve0.plus(amount1ReserveUSD)

    let dfx = DFXFactory.load(FACTORY_ADDRESS)
    pair.prevReserveUSD = pair.reserveUSD
    pair.reserveUSD = amountReserveUSD
    let reserveDiff = pair.reserveUSD.minus(pair.prevReserveUSD)
    dfx.totalLiquidityUSD = dfx.totalLiquidityUSD.plus(reserveDiff)
    pair.save()
    dfx.save()

    let pairHourData = updatePairHourData(event)
    pairHourData.save()
    let pairDayData = updatePairDayData(event)
    pairDayData.save()
    let dfxDayData = updateDFXDayData(event)
    dfxDayData.save()

    token0.save()
    token1.save()
    pair.save()
    entity.save()
}