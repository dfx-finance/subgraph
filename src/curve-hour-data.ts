import { Address, BigInt, ethereum, log } from '@graphprotocol/graph-ts'
import { ZERO_BD, fetchUSDMultiplier } from './helpers'

import { 
    PairHourData,
    Pair,
    Token
} from "../generated/schema"

import { ERC20 } from '../generated/Factory/ERC20'

export function updatePairHourData(event: ethereum.Event): PairHourData {
    let timestamp = event.block.timestamp.toI32()
    let hourIndex = timestamp / 3600  
    let hourStartUnix = hourIndex * 3600
    let hourPairID = event.address
    .toHexString()
    .concat('-')
    .concat(BigInt.fromI32(hourIndex).toString())

    let pair = Pair.load(event.address.toHex())
    let pairHourData = PairHourData.load(hourPairID)
    if (pairHourData === null) {
        pairHourData = new PairHourData(hourPairID)
        pairHourData.hourStartUnix = hourStartUnix
        pairHourData.pair = event.address.toHexString()
        pairHourData.reserve0 = ZERO_BD
        pairHourData.reserve1 = ZERO_BD
        pairHourData.reserveUSD = ZERO_BD
        pairHourData.volumeToken0 = ZERO_BD
        pairHourData.volumeToken1 = ZERO_BD
        pairHourData.volumeUSD = ZERO_BD
    }
    // Why doesnt this work like sushiswap and uniswap
    if (pair !== null) {
        pairHourData.reserve0 = pair.reserve0
        pairHourData.reserve1 = pair.reserve1

        let amount1ReserveUSD = pair.reserve1.times(fetchUSDMultiplier(pair.token1))
        pairHourData.reserveUSD = pair.reserve0.plus(amount1ReserveUSD)
    }
    pairHourData.save()

    return pairHourData as PairHourData
}
