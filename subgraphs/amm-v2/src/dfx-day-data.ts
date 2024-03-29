import { ethereum } from '@graphprotocol/graph-ts'

import {
    ZERO_BD, 
} from "./helpers";

import {
    FACTORY_ADDRESS_V2,
} from "../../../packages/constants/index"

import { 
    DFXDayData,
    DFXFactoryV2
} from "../generated/schema"

export function updateDFXDayData(event: ethereum.Event): DFXDayData {
    let dfx = DFXFactoryV2.load(FACTORY_ADDRESS_V2)!
    let timestamp = event.block.timestamp.toI32()
    let dayID = timestamp / 86400
    let dayStartTimestamp = dayID * 86400
    let dfxDayData = DFXDayData.load(dayID.toString())
    if (dfxDayData === null) {
        dfxDayData = new DFXDayData(dayID.toString())
        dfxDayData.date = dayStartTimestamp
        dfxDayData.dailyVolumeUSD = ZERO_BD
        dfxDayData.dailyFeeUSD = ZERO_BD
        dfxDayData.totalVolumeUSD = ZERO_BD
        dfxDayData.totalFeeUSD = ZERO_BD
        dfxDayData.totalLiquidityUSD = ZERO_BD
    }

    dfxDayData.totalLiquidityUSD = dfx.totalLiquidityUSD
    dfxDayData.save()

    return dfxDayData as DFXDayData
}