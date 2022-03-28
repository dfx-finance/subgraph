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
    isStakingContract,
    isZapContract,
} from "./helpers";

import { 
    USDC,
    FACTORY_ADDRESS,
    BLACKHOLE_ADDRESS 
} from "../../../packages/constants/index"

import { 
    Transfer as TransferEvent,
    Trade as TradeEvent,
} from "../../../generated/templates/Curve/Curve"

import {
    Trade,
    Transfer,
    Token,
    Pair,
    PoolParticipant,
    DFXDayData,
    DFXFactory,
} from "../../../generated/schema"

import { ERC20 } from '../../../generated/templates/Curve/ERC20'
import { Curve } from '../../../generated/templates/Curve/Curve'

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
    entity.pair = null
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
        pair.swapRateUSD = ZERO_BD
        pair.rewardDuration = ZERO_BI
        pair.rewardsForDuration = ZERO_BD
        pair.volumeToken0 = ZERO_BD
        pair.volumeToken1 = ZERO_BD
        pair.volumeUSD = ZERO_BD
        pair.txnsCount = ZERO_BI
        pair.totalLPToken = ZERO_BD
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
    entity.pair = pair.id

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
        poolParticipant.participant = event.transaction.from
        poolParticipant.volumeUSD = ZERO_BD
        poolParticipant.liquidityProvided = ZERO_BD
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
    entity.pair = null
    entity.from = event.params.from
    entity.to = event.params.to
    entity.token0Amount = ZERO_BD
    entity.token1Amount = ZERO_BD
    entity.value = event.params.value
    
    if (event.params.to.toHexString() == BLACKHOLE_ADDRESS) {
        entity.type = "withdraw"
    // Only accepts LP tokens minted from blackhole address to an address that is not any of the zap contracts
    } else if (event.params.from.toHexString() == BLACKHOLE_ADDRESS && !isZapContract(event.params.to.toHexString())) {
        entity.type = "two-sided-deposit"
    // 2 transfers are made in single sided deposits only taking 1 to avoid duplicate counts
    //      1. blackhole -> zap
    //      2. zap -> personal
    } else if (event.params.from.toHexString() == BLACKHOLE_ADDRESS && isZapContract(event.params.to.toHexString())) {
        entity.type = "single-sided-deposit"
    } else if (isZapContract(event.params.from.toHexString())) {
        entity.type = "single-sided-deposit-ignore"
    } else if (isStakingContract(event.params.to.toHexString())){
        entity.type = "stake"
    } else if (isStakingContract(event.params.from.toHexString())){
        entity.type = "unstake"
    } else {
        entity.type = "LP-transfer"
    }

    // Ensuring pair already exists
    let pair = Pair.load(event.address.toHexString())
    if (pair === null) {
        return
    }
    entity.pair = pair.id
    let prevReserve0 = pair.reserve0
    let prevReserve1 = pair.reserve1

    let token0 = Token.load(pair.token0)
    let token1 = Token.load(pair.token1)
    
    let tokenContract0 = ERC20.bind(Address.fromString(token0.id))
    let reserve0Result = tokenContract0.try_balanceOf(event.address)
    if (!reserve0Result.reverted){
        let reserve0 = convertTokenToDecimal(reserve0Result.value, token0.decimals)
        pair.reserve0 = reserve0
    } 

    let tokenContract1 = ERC20.bind(Address.fromString(token1.id))
    let reserve1Result = tokenContract1.try_balanceOf(event.address)
    if (!reserve1Result.reverted){
        let reserve1 = convertTokenToDecimal(reserve1Result.value, token1.decimals)
        pair.reserve1 = reserve1
    }

    let reserve0Diff = pair.reserve0.minus(prevReserve0)
    let reserve1Diff = pair.reserve1.minus(prevReserve1)

    let poolParticipant = PoolParticipant.load(event.address.toHexString() + "-" + event.transaction.from.toHexString())
    if (poolParticipant === null) {
        poolParticipant = new PoolParticipant(event.address.toHexString() + "-" + event.transaction.from.toHexString()) as PoolParticipant
        poolParticipant.pair = pair.id
        poolParticipant.participant = event.transaction.from
        poolParticipant.volumeUSD = ZERO_BD
        poolParticipant.liquidityProvided = ZERO_BD
        pair.participantCount = pair.participantCount.plus(ONE_BI)
    }
    let decimals = fetchTokenDecimals(event.address)
    let LPTokens = convertTokenToDecimal(entity.value, decimals)
    if (entity.type == "withdraw") {
        reserve0Diff = reserve0Diff.neg()
        reserve1Diff = reserve1Diff.neg()
        poolParticipant.liquidityProvided = poolParticipant.liquidityProvided.minus(LPTokens)
        pair.totalLPToken = pair.totalLPToken.minus(LPTokens)
        if (poolParticipant.liquidityProvided <= ZERO_BD) {
            pair.participantCount.minus(ONE_BI)
        }
    } else if (entity.type == "two-sided-deposit" || entity.type == "single-sided-deposit") {
        poolParticipant.liquidityProvided = poolParticipant.liquidityProvided.plus(LPTokens)
        pair.totalLPToken = pair.totalLPToken.plus(LPTokens)
    } else if (entity.type == "LP-transfer") {
        let poolParticipant2 = PoolParticipant.load(event.address.toHexString() + "-" + entity.to.toHexString())
        if (poolParticipant2 === null) {
            poolParticipant2 = new PoolParticipant(event.address.toHexString() + "-" + entity.to.toHexString()) as PoolParticipant
            poolParticipant2.pair = pair.id
            poolParticipant2.participant = event.transaction.from
            poolParticipant2.volumeUSD = ZERO_BD
            poolParticipant2.liquidityProvided = ZERO_BD
        }
        poolParticipant2.liquidityProvided = poolParticipant2.liquidityProvided.plus(LPTokens)
        poolParticipant.liquidityProvided = poolParticipant.liquidityProvided.minus(LPTokens)
    }
    poolParticipant.save()

    let curveContract = Curve.bind(Address.fromString(pair.id))
    let reserveResult = curveContract.try_liquidity()
    let reserveUSD = ZERO_BD
    if (!reserveResult.reverted){
        reserveUSD = convertTokenToDecimal(reserveResult.value.value0, BigInt.fromString('18'))
    }
    
    entity.token0Amount = reserve0Diff
    entity.token1Amount = reserve1Diff

    if (entity.type == "single-sided-deposit") {
        let LPToDepositResult = curveContract.viewWithdraw(entity.value)
        entity.token0Amount = convertTokenToDecimal(LPToDepositResult[1], token0.decimals)
        entity.token1Amount = convertTokenToDecimal(LPToDepositResult[0], token1.decimals)
    }

    let dfx = DFXFactory.load(FACTORY_ADDRESS)
    let prevReserveUSD = pair.reserveUSD
    pair.reserveUSD = reserveUSD
    let reserveUSDDiff = pair.reserveUSD.minus(prevReserveUSD)
    dfx.totalLiquidityUSD = dfx.totalLiquidityUSD.plus(reserveUSDDiff)
    pair.save()
    dfx.save()

    let pairHourData = updatePairHourData(event)
    pairHourData.save()

    let pairDayData = updatePairDayData(event)
    let reserve1DiffUSD = entity.token1Amount.times(pair.swapRateUSD)
    if (entity.type == "withdraw") {
        pairDayData.reserve0Withdraw = pairDayData.reserve0Withdraw.plus(entity.token0Amount)
        pairDayData.reserve1Withdraw = pairDayData.reserve1Withdraw.plus(entity.token1Amount)
        pairDayData.reserve1WithdrawUSD = pairDayData.reserve1WithdrawUSD.plus(reserve1DiffUSD)
    } else if (entity.type == "two-sided-deposit" || entity.type == "single-sided-deposit") {
        pairDayData.reserve0Deposit = pairDayData.reserve0Deposit.plus(entity.token0Amount)
        pairDayData.reserve1Deposit = pairDayData.reserve1Deposit.plus(entity.token1Amount)
        pairDayData.reserve1DepositUSD = pairDayData.reserve1DepositUSD.plus(reserve1DiffUSD)
    }
    pairDayData.save()
    let dfxDayData = updateDFXDayData(event)
    dfxDayData.save()

    token0.save()
    token1.save()
    pair.save()
    entity.save()
}