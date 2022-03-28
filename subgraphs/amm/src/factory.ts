import { BigInt, Address } from "@graphprotocol/graph-ts"
import {
    NewCurve,
    OwnershipTransferred,
} from "../generated/Factory/Factory"

import { 
    ZERO_BD,
} from "../src/helpers"

import {
    FACTORY_ADDRESS
} from "../../../packages/constants/index"

import {
    DFXFactory
} from "../generated/schema"

import { Curve as CurveTemplate} from "../generated/templates"

export function handleNewCurve(event: NewCurve): void {
    let factory = DFXFactory.load(FACTORY_ADDRESS)
    if (factory === null) {
      factory = new DFXFactory(FACTORY_ADDRESS)
      factory.pairCount = 0
      factory.totalVolumeUSD = ZERO_BD
      factory.totalLiquidityUSD = ZERO_BD
    }
    factory.pairCount = factory.pairCount + 1
    factory.save()

    CurveTemplate.create(event.params.curve);
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}
