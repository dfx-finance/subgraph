import { BigInt, ethereum } from '@graphprotocol/graph-ts'
import { ZERO_BD, ZERO_BI } from './helpers'

import { 
    PairDayData,
    Pair
} from "../../../generated/schema"

export function updatePairDayData(event: ethereum.Event): PairDayData {
    let timestamp = event.block.timestamp.toI32()
    let dayID = timestamp / 86400
    let dayStartTimestamp = dayID * 86400
    let dayPairID = event.address
      .toHexString()
      .concat('-')
      .concat(BigInt.fromI32(dayID).toString())
    let pair = Pair.load(event.address.toHexString())
    let pairDayData = PairDayData.load(dayPairID)
    if (pairDayData === null) {
        pairDayData = new PairDayData(dayPairID)
        pairDayData.firstTxn = event.transaction.hash
        pairDayData.date = dayStartTimestamp
        pairDayData.pair = event.address.toHexString()
        pairDayData.reserve0 = ZERO_BD
        pairDayData.reserve1 = ZERO_BD
        pairDayData.reserveUSD = ZERO_BD
        pairDayData.reserve0Deposit = ZERO_BD
        pairDayData.reserve1Deposit = ZERO_BD
        pairDayData.reserve1DepositUSD = ZERO_BD
        pairDayData.reserve0Withdraw = ZERO_BD
        pairDayData.reserve1Withdraw = ZERO_BD
        pairDayData.reserve1WithdrawUSD = ZERO_BD
        pairDayData.swapRateUSD = ZERO_BD
        pairDayData.volumeToken0 = ZERO_BD
        pairDayData.volumeToken1 = ZERO_BD
        pairDayData.volumeUSD = ZERO_BD
        pairDayData.participantCount = ZERO_BI
    }
    if (pair !== null) {
        pairDayData.reserve0 = pair.reserve0
        pairDayData.reserve1 = pair.reserve1
        pairDayData.swapRateUSD = pair.swapRateUSD
        pairDayData.participantCount = pair.participantCount

        let amount1ReserveUSD = pair.reserve1.times(pair.swapRateUSD)
        pairDayData.reserveUSD = pair.reserve0.plus(amount1ReserveUSD)
    }
    // pairDayData.dailyTxns = pairDayData.dailyTxns.plus(ONE_BI)
    pairDayData.save()

    return pairDayData as PairDayData
}
