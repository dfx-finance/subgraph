import { ethereum } from '@graphprotocol/graph-ts'

import {
    FACTORY_ADDRESS,
    ZERO_BD, 
} from "./helpers";

import { 
    DFXDayData,
    DFXFactory
} from "../generated/schema"

export function updateDFXDayData(event: ethereum.Event): DFXDayData {
    let dfx = DFXFactory.load(FACTORY_ADDRESS)
    let timestamp = event.block.timestamp.toI32()
    let dayID = timestamp / 86400
    let dayStartTimestamp = dayID * 86400
    let dfxDayData = DFXDayData.load(dayID.toString())
    if (dfxDayData === null) {
        dfxDayData = new DFXDayData(dayID.toString())
        dfxDayData.date = dayStartTimestamp
        dfxDayData.dailyVolumeUSD = ZERO_BD
        dfxDayData.totalVolumeUSD = ZERO_BD
        dfxDayData.totalLiquidityUSD = ZERO_BD
    }

    dfxDayData.totalVolumeUSD = dfx.totalVolumeUSD
    dfxDayData.totalLiquidityUSD = dfx.totalLiquidityUSD
    dfxDayData.save()

    return dfxDayData as DFXDayData
}