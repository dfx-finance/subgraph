import { BigInt, ethereum } from '@graphprotocol/graph-ts'

import { 
    Token,
    TokenDayData 
} from '../generated/schema'

import {
    ZERO_BD
} from "./helpers";

export function updateTokenDayData(token: Token, event: ethereum.Event): TokenDayData {
    let timestamp = event.block.timestamp.toI32()
    let dayID = timestamp / 86400
    let dayStartTimestamp = dayID * 86400
    let tokenDayID = token.id
      .toString()
      .concat('-')
      .concat(BigInt.fromI32(dayID).toString())
  
    let tokenDayData = TokenDayData.load(tokenDayID)
    if (tokenDayData === null) {
      tokenDayData = new TokenDayData(tokenDayID)
      tokenDayData.date = dayStartTimestamp
      tokenDayData.token = token.id
      tokenDayData.priceUSD = token.priceUSD
      tokenDayData.dailyVolumeToken = ZERO_BD
      tokenDayData.dailyVolumeUSD = ZERO_BD
    }
    tokenDayData.priceUSD = token.priceUSD
    tokenDayData.save()
  
    return tokenDayData as TokenDayData
}
